import os
import json
import faiss
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
import logging
from sentence_transformers import SentenceTransformer
from transformers import BertTokenizer, BertForSequenceClassification
import streamlit as st
import time
from rank_bm25 import BM25Okapi
from anthropic import Anthropic
from dotenv import load_dotenv
from glob import glob
from pathlib import Path
from functools import lru_cache
import torch
from concurrent.futures import ThreadPoolExecutor
import asyncio 
from concurrent.futures import ThreadPoolExecutor


# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Define constants
EMBEDDINGS_DIR = Path(".") / "embeddings"
METADATA_PATH = Path(".") / "metadata"
LEGALBERT_MODEL_PATH = Path(".") / "legalbert_finetuned"
PDF_ROOT_PATH = Path(r"C:\themis\app2\pdf")

VALID_YEARS = list(range(2011, 2023))
VALID_COURT_TYPES = ["federal", "supreme", "appeal"]

class MetadataManager:
    def __init__(self, metadata_path: Path):
        self.metadata_path = metadata_path
        self.metadata_by_year: Dict[int, Dict[str, Dict[str, Any]]] = {}
        self.load_metadata()

    def load_metadata(self) -> None:
        for court_type in VALID_COURT_TYPES:
            court_path = self.metadata_path / court_type
            if not court_path.exists():
                logger.warning(f"Court path does not exist: {court_path}")
                continue

            pattern = "cleaned_*_data.json" if court_type == "federal" else "*_data.json"
            metadata_files = list(court_path.glob(pattern))
            self._load_court_metadata(metadata_files, court_type)

    def _extract_year(self, file_path: Path, court_type: str) -> Optional[int]:
        try:
            filename = file_path.stem
            year_str = filename.split("cleaned_")[1].split("_")[0] if court_type == "federal" else filename.split("_")[0]
            return int(year_str)
        except Exception as e:
            logger.error(f"Error extracting year from {file_path}: {e}")
            return None

    def _load_court_metadata(self, files: List[Path], court_type: str) -> None:
        for file_path in files:
            try:
                year = self._extract_year(file_path, court_type)
                if year is None:
                    continue

                metadata = json.loads(file_path.read_text(encoding='utf-8'))
                
                if year not in self.metadata_by_year:
                    self.metadata_by_year[year] = {}
                if court_type not in self.metadata_by_year[year]:
                    self.metadata_by_year[year][court_type] = {}

                for entry in metadata:
                    citation = entry.get("Citation", "")
                    if citation:
                        doc_id = f"{citation.replace(' ', '_')}.pdf"
                        self.metadata_by_year[year][court_type][doc_id] = entry

                logger.info(f"Loaded {court_type} metadata for {year}: {len(metadata)} entries")
            except Exception as e:
                logger.error(f"Error loading {court_type} metadata file {file_path}: {e}")

    @lru_cache(maxsize=32)
    def get_metadata_for_year(self, year: int, court_type: str) -> Dict[str, Any]:
        return self.metadata_by_year.get(year, {}).get(court_type, {})

class DocumentStore:
    def __init__(self, embeddings_dir: Path, metadata_path: Path):
        self.embeddings_dir = embeddings_dir
        self.metadata_manager = MetadataManager(metadata_path)
        self.model = SentenceTransformer('all-mpnet-base-v2')
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)
        logger.info(f"SentenceTransformer model loaded on {self.device}")
        self.index_cache: Dict[Tuple[int, str], faiss.Index] = {}

    def get_document_link(self, doc_id: str, year: int, court_type: str) -> Optional[Path]:
        """
        Returns the local Path object for the PDF if it exists.
        """
        try:
            pdf_path = PDF_ROOT_PATH / str(year) / court_type / "pdf_downloads" / doc_id
            return pdf_path if pdf_path.exists() else None
        except Exception as e:
            logger.error(f"Error retrieving document path: {e}")
            return None

    def load_faiss_index(self, year: int, court_type: str) -> Optional[faiss.Index]:
        cache_key = (year, court_type)
        if cache_key in self.index_cache:
            return self.index_cache[cache_key]

        index_path = self.embeddings_dir / str(year) / court_type / f"{year}_{court_type}_index.faiss"
        try:
            if index_path.exists():
                index = faiss.read_index(str(index_path))
                self.index_cache[cache_key] = index
                logger.info(f"FAISS index loaded for {year} - {court_type}")
                return index
        except Exception as e:
            logger.error(f"Error loading FAISS index for {year} - {court_type}: {e}")
        return None

    @lru_cache(maxsize=32)
    def load_texts_data(self, year: int, court_type: str) -> Optional[List[str]]:
        texts_path = self.embeddings_dir / str(year) / court_type / f"{year}_{court_type}_doc_ids.json"
        try:
            if texts_path.exists():
                doc_ids = json.loads(texts_path.read_text(encoding='utf-8'))
                logger.info(f"Texts data loaded for {year} - {court_type}")
                return doc_ids
        except Exception as e:
            logger.error(f"Error loading texts data for {year} - {court_type}: {e}")
        return None

class RAGSystem:
    def __init__(self, embeddings_dir: Path, metadata_path: Path):
        self.document_store = DocumentStore(embeddings_dir, metadata_path)
        self.rag_model = RAGModel(self.document_store)
        self.legalbert_response_generator = LegalBERTResponseGenerator(LEGALBERT_MODEL_PATH)
        self.claude_api = ClaudeAPIHandler()
        self.executor = ThreadPoolExecutor(max_workers=3)

    async def process_document(self, doc: Dict[str, Any], query: str) -> Dict[str, Any]:
        """Process a single document with Claude API"""
        try:
            # Try different possible keys for text content
            text = (doc.get('text') or 
                   doc.get('Text') or 
                   doc.get('body') or 
                   doc.get('Body') or 
                   doc.get('content') or 
                   doc.get('Content', ''))
            
            # If text is still empty, try to get it from metadata
            if not text:
                year = doc.get('year')
                court_type = doc.get('court_type')
                if year and court_type:
                    metadata = self.document_store.metadata_manager.get_metadata_for_year(year, court_type)
                    if metadata and doc['id'] in metadata:
                        text = (metadata[doc['id']].get('Text') or 
                               metadata[doc['id']].get('body') or 
                               metadata[doc['id']].get('Body') or 
                               metadata[doc['id']].get('content') or 
                               metadata[doc['id']].get('Content', ''))

            if not text:
                logger.warning(f"No text content found for document {doc.get('id')}")
                doc['summary'] = "No text content available for summarization"
                doc['analysis'] = "No text content available for analysis"
                return doc

            # Get summary and analysis from Claude
            summary = await self.claude_api.summarize(text)
            analysis = await self.claude_api.analyze_legal_relevance(text, query)
            
            doc['summary'] = summary
            doc['analysis'] = analysis
            return doc
        except Exception as e:
            logger.error(f"Error processing document {doc.get('id')}: {e}")
            doc['summary'] = f"Error generating summary: {str(e)}"
            doc['analysis'] = f"Error generating analysis: {str(e)}"
            return doc

    async def process_query(self, query: str, year: int, court_type: str, top_k: int = 3) -> Dict[str, Any]:
        try:
            relevant_docs = self.rag_model.get_relevant_documents(
                query, 
                court_type=court_type, 
                year=year,
                top_k=top_k  # Pass the top_k parameter here
            )
            
            if not relevant_docs:
                return {
                    "query": query,
                    "error": f"No data found for {year} - {court_type}"
                }

            # Add year and court_type to each document for metadata retrieval
            for doc in relevant_docs:
                doc['year'] = year
                doc['court_type'] = court_type

            # Process documents concurrently using asyncio.gather
            processed_docs = await asyncio.gather(*[
                self.process_document(doc, query) 
                for doc in relevant_docs
            ])

            response = self.legalbert_response_generator.generate_response(query, processed_docs)

            return {
                "query": query,
                "relevant_documents": processed_docs,
                "response": response
            }
        except Exception as e:
            logger.error(f"Error processing query: {e}")
            return {
                "query": query,
                "error": f"Error processing query: {str(e)}"
            }

class ClaudeAPIHandler:
    def __init__(self):
        api_key = os.getenv('ANTHROPIC_API_KEY')
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment variables")
        self.client = Anthropic(api_key=api_key)

    async def summarize(self, text: str) -> str:
        try:
            if not text.strip():
                return "No text provided for summarization"
                
            prompt = f"""Please provide a concise, unambiguous, and direct summary of the following legal text:

            {text}

            Summary:"""
            
            response = await self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=200,
                messages=[{"role": "user", "content": prompt}]
            )
            
            return response.content[0].text
        except Exception as e:
            logger.error(f"Error in Claude API summarization: {e}")
            return f"Error generating summary: {str(e)}"

    async def analyze_legal_relevance(self, text: str, query: str) -> str:
        try:
            if not text.strip():
                return "No text provided for analysis"
                
            prompt = f"""Analyze the relevance of this legal text to the query:

            Text: {text}

            Query: {query}

            Analysis:"""
            
            response = await self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=200,
                messages=[{"role": "user", "content": prompt}]
            )
            
            return response.content[0].text
        except Exception as e:
            logger.error(f"Error in Claude API relevance analysis: {e}")
            return f"Error analyzing relevance: {str(e)}"


class LegalBERTResponseGenerator:
    def __init__(self, model_path: Path):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = BertForSequenceClassification.from_pretrained(str(model_path)).to(self.device)
        self.tokenizer = BertTokenizer.from_pretrained(str(model_path))
        self.model.eval()

    @torch.no_grad()
    def generate_response(self, query: str, relevant_docs: List[Dict[str, Any]]) -> str:
        context = "\n\n".join([
            f"Document {i+1} ({doc['id']}, Similarity: {doc['similarity']:.4f}):\n{doc.get('text', '')}" 
            for i, doc in enumerate(relevant_docs)
        ])
        
        prompt = f"{context}\nQuery: {query}\nResponse:"
        
        try:
            inputs = self.tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            output = self.model(**inputs)
            probabilities = output.logits.softmax(dim=-1)
            predicted_class = probabilities.argmax().item()
            confidence = probabilities[0, predicted_class].item()
            
            class_names = ["Irrelevant", "Relevant"]
            response = f"The query is classified as {class_names[predicted_class]} with confidence {confidence:.2f}"
            return response
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return f"Error generating response: {str(e)}"

class RAGModel:
    def __init__(self, document_store: DocumentStore):
        self.document_store = document_store
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    def get_relevant_documents(
        self, 
        query: str, 
        court_type: str, 
        top_k: int = 3, 
        year: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        index = self.document_store.load_faiss_index(year, court_type)
        doc_ids = self.document_store.load_texts_data(year, court_type)
        year_metadata = self.document_store.metadata_manager.get_metadata_for_year(year, court_type)

        if not index or not doc_ids:
            logger.warning(f"Missing index or document IDs for {year} - {court_type}")
            return []

        try:
            query_embedding = self.document_store.model.encode(
                query,
                convert_to_tensor=True,
                device=self.device
            ).cpu().numpy().astype("float32")

            distances, indices = index.search(np.array([query_embedding]), k=top_k)

            results = []
            for dist, idx in zip(distances[0], indices[0]):
                if idx >= len(doc_ids):
                    continue

                doc_id = doc_ids[idx]
                doc_metadata = year_metadata.get(doc_id, {})
                if not doc_metadata:
                    continue

                doc_link = self.document_store.get_document_link(doc_id, year, court_type)
                
                # Add the text content from metadata
                results.append({
                    "id": doc_id,
                    "similarity": float(dist),
                    "title": doc_metadata.get("Title"),
                    "citation": doc_metadata.get("Citation"),
                    "publication_date": doc_metadata.get("Publication Date"),
                    "url": doc_link,
                    "text": doc_metadata.get("Text", "")  # Add the text content here
                })

            return results
        except Exception as e:
            logger.error(f"Error getting relevant documents: {e}")
            return []


def main():
    st.set_page_config(page_title="Canadian Law RAG System", layout="wide")
    st.title("Canadian Law RAG System")
    st.write("Powered by Themiscore.")

    try:
        rag_system = RAGSystem(EMBEDDINGS_DIR, METADATA_PATH)
    except Exception as e:
        st.error(f"Error initializing RAG system: {str(e)}")
        st.stop()

    with st.sidebar:
        st.header("Search Parameters")
        year_input = st.selectbox("Select Year", VALID_YEARS)
        court_type_input = st.selectbox("Select Court Type", VALID_COURT_TYPES)
        
        with st.expander("Advanced Options"):
            top_k = st.slider("Number of results", min_value=1, max_value=10, value=3)
            min_similarity = st.slider("Minimum similarity score", min_value=0.0, max_value=1.0, value=0.5)

    st.header("Legal Query Interface")
    user_input = st.text_area("Enter your legal question:", height=100)

    col1, col2 = st.columns([1, 5])
    with col1:
        submit_button = st.button("Submit", type="primary")
    
    if submit_button:
        if not user_input.strip():
            st.warning("Please enter a valid question.")
        else:
            with st.spinner("Processing your query..."):
                try:
                    start_time = time.time()
                    
                    # Create new event loop for async operations
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    result = loop.run_until_complete(rag_system.process_query(
                        query=user_input,
                        year=int(year_input),
                        court_type=court_type_input,
                        top_k=top_k 
                    ))
                    loop.close()
                    
                    end_time = time.time()

                    if "error" in result:
                        st.error(result["error"])
                    elif not result.get('relevant_documents'):
                        st.warning(f"No relevant documents found for {year_input} - {court_type_input}.")
                    else:
                        st.success("Query processed successfully!")
                        
                        # Display query analysis
                        st.subheader("Query Analysis")
                        with st.container():
                            st.markdown(f"**Query:** {result['query']}")
                            st.markdown(f"**System Response:** {result['response']}")
                            st.markdown(f"**Processing Time:** {end_time - start_time:.2f} seconds")

                        # Display relevant documents with the new UI section
                        if result.get('relevant_documents'):
                            st.subheader("Relevant Documents")
                            for i, doc in enumerate(result['relevant_documents'], 1):
                                st.markdown(f"**Document {i}**")
                                if doc.get('title'):
                                    st.markdown(f"**Title:** {doc['title']}")
                                if doc.get('citation'):
                                    st.markdown(f"**Citation:** {doc['citation']}")
                                if doc.get('summary'):
                                    st.markdown("**Summary:**")
                                    st.markdown(doc['summary'])
                                if doc.get('analysis'):
                                    st.markdown("**Relevance Analysis:**")
                                    st.markdown(doc['analysis'])
                                
                                # Handle PDF download
                                pdf_path = rag_system.document_store.get_document_link(
                                    doc['id'], 
                                    int(year_input), 
                                    court_type_input
                                )
                                if pdf_path:
                                    with open(pdf_path, "rb") as pdf_file:
                                        st.download_button(
                                            label="Download PDF",
                                            data=pdf_file,
                                            file_name=pdf_path.name,
                                            mime="application/pdf"
                                        )
                                else:
                                    st.markdown("**Source:** PDF not available")
                                
                                # Add a separator between documents
                                if i < len(result['relevant_documents']):
                                    st.markdown("---")

                            # Display search metrics
                            with st.expander("Search Metrics"):
                                metrics_col1, metrics_col2, metrics_col3 = st.columns(3)
                                with metrics_col1:
                                    st.metric("Total Documents Found", len(result['relevant_documents']))
                                with metrics_col2:
                                    avg_similarity = np.mean([d['similarity'] for d in result['relevant_documents']])
                                    st.metric("Average Similarity", f"{avg_similarity:.4f}")
                                with metrics_col3:
                                    st.metric("Response Time", f"{end_time - start_time:.2f}s")

                except Exception as e:
                    st.error(f"An error occurred while processing your query: {str(e)}")
                    logger.exception("Error in query processing")

if __name__ == "__main__":
    main()
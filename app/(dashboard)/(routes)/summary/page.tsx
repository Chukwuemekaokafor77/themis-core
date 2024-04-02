"use client";
import * as fs from 'fs';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { set } from "zod";
import { useGenerationStore } from '@/app/store/contextParam';
import { Button } from "@/components/ui/button";
import CaseStyle from '@/lib/textStyling';
import Modal from 'react-modal';

const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai")
const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = "AIzaSyAzoAdIkPeaQg_PVvsnXgCjp4-x_Lnxo-E";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

const generationConfig = {
    temperature: 0.25,
    topK: 40,
    topP: 0.8,
    maxOutputTokens: 3030,
};

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
];



const SummaryPage = () => {
    const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    // setModalIsOpen(true);
    window.open("/principles", '_blank');
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };
    const router = useRouter();
    const createQueryString = (value: string) => {
        router.push("/conversation")
    };
    const createQueryStringGrpah = (value: string) => {
        // router.push("/directed")
        window.open("/directed", '_blank');
    };
    const searchParams = useSearchParams();
    // console.log(searchParams.get("text"));
    const { textField, summarisedText, keywordsForCase } = useGenerationStore();
    const { setSummarisedText } = useGenerationStore();
    //const [summarisedText, setSummarisedText] = useState("");
    const [textToSummarise, setTextToSummarise] = useState(textField ?? "");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('Summarise following legal case in 3000 words include sections used , date , time ,city using');
    const handleTemplateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTemplate(event.target.value);
        setIsLoading(true);
    };
    useEffect(() => {

        setIsLoading(true);
        summary(textToSummarise, keywordsForCase).then((result) => {
            setSummarisedText(result);
            setIsLoading(false);

        });
    }, []);
    useEffect(() => {
        setIsLoading(true);
        summary(textToSummarise, keywordsForCase).then((result) => {
            setSummarisedText(result);
            setIsLoading(false);
        });
    }, [selectedTemplate]);
    const summary = async (part: string, keywordsForCase: string) => {
        if (part === "") {
            throw new Error("Empty case please retry");
        }
        const parts = [{ text: `${selectedTemplate} the following keywords : ${part} keywords: ${keywordsForCase}` }];
        const result = await model.generateContent({
    
            contents: [{ role: "user", parts }],
            generationConfig,
            safetySettings
        });
    
        try {
            const response = await result.response;
            // rest of your code
            return response.text();
          } catch (error) {
            console.error('An error occurred:', error);
          }
       
    }
    return (
        <div className='flex flex-col justify-center bg-white'>
            <div className=' bg-white rounded px-8 pt-6 pb-8 mb-4'>
                <h1 className='text-center text-xl'>Summary</h1>
                <h2>Selcte template for summarization</h2>
                <select value={selectedTemplate} onChange={handleTemplateChange}>
                <option value="Summarise following legal case in 3000 words include sections used , date , time ,city using" title="This is the default template showing ciratain , year , city and ruling">Default</option>
                <option value="Summarise following legal case in 1000 words include sections used , date , time ,city using" title="This is short verison of summary in 1000 words">Short</option>
                <option value="Summarise following legal case in 3000 words include sections used or find related princilpe that could have been used" title="This is the principle first template which shows relevant principles">Principle</option>
            </select>
                {isLoading && <div className='text-center p-50'>Loading...</div>}
                <div className='flex justify-end'>
                {!isLoading && summarisedText !== "" && <Button  className="mr-2" onClick={() => createQueryString(summarisedText)}>Open in Interactive mode</Button>}
         
                {!isLoading && summarisedText !== "" && <Button  className="mr-2"  onClick={() => createQueryStringGrpah(summarisedText)}>Show directed graph</Button>}
                {!isLoading && summarisedText !== "" && <Button  onClick={() => openModal()}>Principles</Button>}
                </div>
                {!isLoading && 
                <div className='mt-2'>
                    <CaseStyle text={summarisedText}></CaseStyle>
                </div>
                }
            </div>
            {/* <div>
     
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Example Modal"
       className='flex flex-col justify-center '
      >
        <h2>Law Principles</h2>
        <button onClick={closeModal}>close</button>
        <p>cfygwab fwvuiaskjb gbwgvbdsanf</p>
      </Modal>
    </div> */}
        </div>
    );
}
export default SummaryPage;
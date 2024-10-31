"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGenerationStore } from '@/app/store/contextParam';

interface MyData {
    name: string;
    text: string;
    url: string;
}
interface FormData {
    keywords: string;
    // year: string;
    // court: string;
}

const Page = () => {

    const years: number[] = Array.from({ length: 20 }, (_, index) => new Date().getFullYear() - index);
    const router = useRouter();
    const [keywords, setKeywords] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    

    // const [category1, setCategory1] = useState<string>('');
    // const [category2, setCategory2] = useState<string>('');
    const [responseData, setResponseData] = useState<MyData[]>([]);
    const {setTextField,setKeywordsForCase,setSummarisedText} = useGenerationStore();
    const createQueryString = (value: string) => {
        setTextField(value);
        setKeywordsForCase(keywords);
        setSummarisedText("")
        router.push("/summary")
    };
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Prepare data to send to localhost:8080
        const data: FormData = {
            keywords: keywords,
            // year: category1,
            // court: category2
        };
        // Assuming you're using fetch API to send data
        fetch('http://127.0.0.1:8080/api/data_all', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            
            
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to submit form');
                }
                return response.json();
            })
            .then(responseData => {
                setResponseData(responseData);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };
    const currentItems = responseData.slice(indexOfFirstItem, indexOfLastItem);
    const nextPage = () => {
        setCurrentPage(currentPage + 1);
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
    return (
        
        <div className="flex flex-col justify-center">
            <div className=" flex flex-col justify-center items-center">
            <form className="w-1/2 lg:w-3/5  bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmit}>
                {/* <div className="form-group"> */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="keywords">Keywords:</label>
                    <input
                        id="keywords"
                        type="text"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                    />
                </div>
                
                
                
                <Button type="submit" className="btn btn-primary">Submit</Button>
            </form>
            </div>
            {responseData.length>0 &&
            <>
            <h2 className="text-center">We found following relevant cases for your search</h2>
            <div className="relative overflow-x-auto p-10">
                
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            {/* <th className="px-6 py-3">Text</th> */}
                            <th className="px-6 py-3">URL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((data, index) => (
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700" key={index}>
                                <td>{data.name}</td>
                                {/* <td>{data.text}</td> */}
                                <td><a href={data.url}>{data.url}</a></td>
                                <Button className="ml-5 w-50 h-50" onClick={() => createQueryString(data.text)}> Summarise </Button>
                            </tr>
                        ))}
                    </tbody>
                    <Button className="mr-2" onClick={prevPage}>Previous</Button>
            <Button onClick={nextPage}>Next</Button>
                </table>
            </div>
            </>
            }
        </div>
    );

};

export default Page;
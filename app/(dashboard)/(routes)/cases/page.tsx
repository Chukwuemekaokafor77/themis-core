"use client";
import fs from 'fs';
import path from 'path';
import * as z from "zod";
import axios from "axios";
import { MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
// import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ChatCompletionRequestMessage } from "openai";
import { formSchema } from "../conversation/constants";
import { useGenerationStore } from '@/app/store/contextParam';
// import { BotAvatar } from "@/components/bot-avatar";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { cn } from "@/lib/utils";
interface MyData {
    name: string;
    text: string;
    url: string;
}
interface FormData {
    keywords: string;
    year: string;
    court: string;
}
const Page = () => {
    const years: number[] = Array.from({ length: 10 }, (_, index) => new Date().getFullYear() - index);
    const router = useRouter();
    const [keywords, setKeywords] = useState<string>('');
    const [category1, setCategory1] = useState<string>('');
    const [category2, setCategory2] = useState<string>('');
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
            year: category1,
            court: category2
        };
        // Assuming you're using fetch API to send data
        fetch('http://localhost:8080/api/get_data', {
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
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="year">Year:</label>
                    <select
                        id="year"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={category1}
                        onChange={(e) => setCategory1(e.target.value)}
                    >
                        <option value="">Select year</option>
                        {years.map((year, index) => (
                            <option key={index} value={String(year)}>{year}</option>
                        ))}
                    </select>
                </div>
                
                <div className="mb-8">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="courtType">Type of court:</label>
                    <select
                        id="courtType"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={category2}
                        onChange={(e) => setCategory2(e.target.value)}
                    >
                        <option value="">ALL</option>
                        <option value="Category 2 Option 1">SC</option>
                        <option value="Category 2 Option 2">FC</option>
                        {/* Add more options as needed */}
                    </select>
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
                        {responseData.map((data, index) => (
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700" key={index}>
                                <td>{data.name}</td>
                                {/* <td>{data.text}</td> */}
                                <td><a href={data.url}>{data.url}</a></td>
                                <Button className="ml-5 w-50 h-50" onClick={() => createQueryString(data.text)}> Summarise </Button>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            </>
            }
        </div>
    );
};


export default Page;
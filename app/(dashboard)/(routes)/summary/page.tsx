"use client";
import * as fs from 'fs';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { set } from "zod";
import { useGenerationStore } from '@/app/store/contextParam';
import { Button } from "@/components/ui/button";
import CaseStyle from '@/lib/textStyling';
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai")
const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = "AIzaSyBKNeqrMbcodQzWVsmHr1AQs_PqOvFgSlU";
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

const summary = async (part: string, keywordsForCase: string) => {
    if (part === "") {
        throw new Error("Empty case please retry");
    }
    const parts = [{ text: `Summarise following legal case in 3000 words include sections used , date , time ,city using the following keywords : ${part} keywords: ${keywordsForCase}` }];
    const result = await model.generateContent({

        contents: [{ role: "user", parts }],
        generationConfig,
        safetySettings
    });

    const response = await result.response;
    return response.text();
}

const SummaryPage = () => {
    const router = useRouter();
    const createQueryString = (value: string) => {
        router.push("/conversation")
    };
    const searchParams = useSearchParams();
    console.log(searchParams.get("text"));
    const { textField, summarisedText, keywordsForCase } = useGenerationStore();
    const { setSummarisedText } = useGenerationStore();
    //const [summarisedText, setSummarisedText] = useState("");
    const [textToSummarise, setTextToSummarise] = useState(textField ?? "");
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {

        setIsLoading(true);
        summary(textToSummarise, keywordsForCase).then((result) => {
            setSummarisedText(result);
            setIsLoading(false);

        });
    }, []);
    return (
        <div className='flex flex-col justify-center '>
            <div className=' bg-white rounded px-8 pt-6 pb-8 mb-4'>
                <h1 className='text-center text-xl'>Summary</h1>
                {isLoading && summarisedText==="" && <div className='text-center p-50'>Loading...</div>}
                <div>
                    <CaseStyle text={summarisedText}></CaseStyle>
                </div>
                {!isLoading && summarisedText !== "" && <Button onClick={() => createQueryString(summarisedText)}>Open in Interactive mode</Button>}
            </div>
        </div>
    );
}
export default SummaryPage;
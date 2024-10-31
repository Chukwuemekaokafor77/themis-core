import {create} from 'zustand'

interface MyData {
    textField:string,
    setTextField: (text:string)=>void // Updated return type to void
    summarisedText:string,
    setSummarisedText: (text:string)=>void
    keywordsForCase: string;
    setKeywordsForCase: (text:string)=>void
}

export const useGenerationStore = create<MyData>((set) => ({
    textField: "",
    setTextField: (text:string) => set({textField:text}),
    summarisedText: "",
    setSummarisedText: (text:string) => set({summarisedText:text}),
    keywordsForCase: "",
    setKeywordsForCase: (text:string) => set({keywordsForCase:text})
}));
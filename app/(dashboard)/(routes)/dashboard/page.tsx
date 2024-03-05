"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, BadgePercent, BotMessageSquare, File, MessageSquare, Scroll, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();
    const tools = [{
        label: "Conversation",
        icon:MessageSquare,
        href:"/conversation",
        color:"text-violet-500",
        bgColor:"bg-violet-500/10"
    },
    {
        label: "Document Generation",
        icon:File,
        href:"/document",
        color:"text-pink-700",
        bgColor:"bg-pink-700/10"
    },
    {
        label: "Summary Generator",
        icon:Scroll,
        href:"/summary",
        color:"text-orange-700",
        bgColor:"bg-orange-700/10"
    },
    {
        label: "Confidence Score",
        icon:BadgePercent,
        href:"/confidence",
        color:"text-emerald-500",
        bgColor:"bg-emerald-500/10"
    },
    {
        label: "Argument Generation",
        icon:BotMessageSquare,
        href:"/argument",
        color:"text-green-700",
        bgColor:"bg-green-700/10"
    },
    ]
  return (
    <div>
        <div className="mb-8 space-y-4">
            <h2 className="text-2xl md:text-4xl font-bold text-center">
                Explore the features of Themis Core.
            </h2>
            <p className="text-muted-foreground font-light text-sm md:text-lg text-center">
            Themis Core is your AI assistant for legal research. It is designed to help you with your legal research by providing you with a variety of tools to help you with your research.
            </p>
        </div>
       <div className="px-4 md:px-20 lg:px-32 space-y-4">
    {tools.map((tool) => (
        <Card onClick={() => router.push(tool.href)}
        key={tool.href}
        className="p-4 border-black/5 flex items-center justify-between hover:shadow-md transition cursor-pointer"
        >
            <div className="flex items-center gap-x-4">
                <div className={cn("p-2 w-fit rounded-md",tool.bgColor)}>
                    <tool.icon className={cn("w-8 h-8",tool.color)}/>
                </div>
                <div className="font-semibold">
                    {tool.label}
                </div>
            </div>
            <ArrowRight className="w-5 h-5"/>
        </Card>
    ))}
       </div>
    </div>
    
  )
}

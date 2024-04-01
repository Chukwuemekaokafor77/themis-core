"use client";

import { cn } from "@/lib/utils";
import { BadgeCent, BadgePercent, BotMessageSquare, Code, File, ImageIcon, LayoutDashboard, MessageSquare, Music, Scroll, Settings, VideoIcon } from "lucide-react";
import { Montserrat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
const montserrat = Montserrat({ weight:"600" ,subsets:["latin"] });
const routes = [{
    label: "Dashboard",
    icon:LayoutDashboard,
    href:"/dashboard",
    color:"text-blue-500"
},{
    label: "Case research and conversation",
    icon:MessageSquare,
    href:"/cases",
    color:"text-violet-500"
},
{
    label: "Document Generation",
    icon:File,
    href:"/doc",
    color:"text-pink-700"
},
{
    label: "Summary Generator",
    icon:Scroll,
    href:"/summary",
    color:"text-orange-700"
},
{
    label: "Confidence Score",
    icon:BadgePercent,
    href:"/condfidence",
    color:"text-emerald-500"
},
{
    label: "Argument Generation",
    icon:BotMessageSquare,
    href:"/argument",
    color:"text-green-700"
},
{
    label: "Settings",
    icon:Settings,
    href:"/settings",
    
}
];
const Sidebar = () => {
    const pathname = usePathname();
    return(
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#0f0f13] text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    {/* <div className="relative w-8 h-8 mr-4">
                        <Image fill alt="Logo" src="/logo.png"></Image>
                    </div> */}
                    <h1 className={cn("text-2xl font-bold",montserrat.className)}>Themis Core</h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link className={cn("text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                        pathname == route.href ? "text-white bg-white/10":"text-zinc-400")} key={route.href} href={route.href}>
                            <div className="flex items-center flex-21">
                                <route.icon className={cn("h-5 w-5 mr-3",route.color)}/>
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
 }
export default Sidebar;
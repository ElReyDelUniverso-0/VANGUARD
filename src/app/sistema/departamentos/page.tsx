import {redirect} from "next/navigation";
import type {Metadata} from "next";
export const metadata:Metadata={robots:{index:false,follow:true},alternates:{canonical:"/arquitectura"}};
export default function Page(){redirect("/arquitectura");}

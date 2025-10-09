import React from 'react'
import {ThemeToggle} from './ThemeToggle'
import Link from "next/link";
import Logo from "@/components/ui/logo";

const Header = () => {
    return (
        <section
            className={"flex justify-between items-center py-4 px-6 bg-gray-50 dark:bg-gray-900 shadow-md dark:border-b dark:border-gray-800 flex-wrap fixed top-0 w-full z-10"}
        >
            <Link href={"/"}>
                <Logo/>
            </Link>
            <ul className={"flex flex-row space-x-4 flex-wrap"}>
                <li className={"font-bold"}><Link href={"/"}>Explore</Link></li>
                <li className={"font-bold"}><Link href={"/about"}>About Us</Link></li>
                <li className={"font-bold"}><Link href={"/auth"}>login</Link></li>
            </ul>
            <ThemeToggle/>
        </section>
    )
}
export default Header

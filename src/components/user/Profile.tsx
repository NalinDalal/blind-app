"use client";
import React from 'react';
import {Avatar} from "@/components/posts/Avatar";
import {useAppSelector} from "@/redux/hooks";
import {useUserProfile} from "@/lib/tanstack/user";
import {redirect, RedirectType} from "next/navigation"
import {formatDistanceToNow} from "date-fns"
import {enIN} from "date-fns/locale"
import Loader from "@/components/ui/Loader";
import ErrorFallback from "@/components/ui/ErrorFallback";

const Profile = () => {
    const {userId} = useAppSelector(state => state.auth);
    if (!userId) return redirect("/auth", RedirectType.replace);
    const {
        data,
        error,
        status
    } = useUserProfile(userId);
    // Placeholder for dynamic data
    const userName = data?.anonMapping?.anonName || "Anon Name";
    const userEmail = data?.email || "email@oriental.ac.in"; // Replace with actual email
    const accountCreationDate = formatDistanceToNow(data?.createdAt || new Date(), {
        addSuffix: true,
        locale: enIN,
    });

    if (status === "pending") {
        return <Loader text={"Loading profile..."}/>
    }
    if (status === "error") {
        return <ErrorFallback errorMessage={error?.message ?? "An error occurred."}/>
    }

    return (
        <section className="flex items-center space-x-4 p-4 sm:p-6 bg-gray-100 dark:bg-gray-900 min-h-[150px] relative">
            {/* Avatar on the left */}
            <Avatar seed={userName} size={"lg"} className="border border-white"/>

            {/* User details on the right of the avatar */}
            <div className="flex flex-col justify-center">
                <h1 className="text-xl font-semibold">{userName}</h1>
                <p className="text-neutral-400 text-sm">{userEmail}</p>
                <p className="text-neutral-400 text-sm mt-1">
                    Launched {accountCreationDate}
                </p>
            </div>
        </section>
    );
}

export default Profile;
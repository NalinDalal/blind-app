"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";
import InstagramLayout from "@/components/InstagramLayout";
import UserSearch from "@/components/search/UserSearch";
import { useAppSelector } from "@/redux/hooks";

export default function Page() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      redirect("/auth");
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <InstagramLayout>
      <div className="px-4 py-6">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
          Search
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          Find other users by their anonymous name
        </p>
        <UserSearch />
      </div>
    </InstagramLayout>
  );
}

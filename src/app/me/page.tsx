"use client";
import React from "react";
import Profile from "@/components/user/Profile"; // Ensure this path is correct
import { motion } from "framer-motion"; // Import motion for page transitions

const Page = () => {
  return (
    <main className="relative min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <section className="flex w-full flex-col items-center justify-start p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl mt-12 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md overflow-hidden" // Added background, border, shadow, and rounded corners
        >
          <Profile />
        </motion.div>
      </section>
    </main>
  );
};

export default Page;

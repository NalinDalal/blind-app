"use client";
import React, {useState} from 'react';
// 1. Import motion from framer-motion
import {motion} from 'framer-motion';
// 2. Import the auto-sizing textarea component
import TextareaAutosize from 'react-textarea-autosize';
import {Avatar} from './Avatar';
import {useCreatePost, useUserProfile} from "@/lib/tanstack/user";
import {useAppSelector} from "@/redux/hooks";
import {getStudentDetailsFromEmail} from "@/helpers/studentDetails";
import toast from "react-hot-toast";


const AddPost = () => {
    const {userId} = useAppSelector(state => state.auth);
    const {data} = useUserProfile(userId || "");
    const {
        mutate: createPost,
        isPending
    } = useCreatePost(userId || "");
    const [postText, setPostText] = useState('');

    const handlePost = () => {
        try {
            if (!userId || !data?.email) {
                toast.error("Please login to post");
                return;
            }
            if (!postText.trim()) {
                toast.error("Please enter a post");
                return;
            }
            const college = getStudentDetailsFromEmail(data?.email)?.collegeName || "Oriental Group of Institutes";
            createPost(
                {
                    content: postText,
                    authorId: userId,
                    college
                }
            )
            setPostText('');
        } catch (e) {
            toast.error("Something went wrong");
            console.error(e);
        }
    };

    return (
        <motion.section
            layout
            transition={{type: "spring", stiffness: 300, damping: 25}}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
        >
            <div className="flex space-x-4">
                <div className="flex-shrink-0">
                    <Avatar seed={data?.anonMapping?.anonName || "Anonymous"}/>
                </div>

                <div className="flex-grow flex flex-col">
                    <TextareaAutosize
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                        placeholder="What's happening?!"
                        className="w-full text-xl bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        minRows={2}
                        maxRows={15}
                    />

                    <div className="border-b border-gray-200 dark:border-gray-700 my-2"></div>

                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2 text-blue-500">
                        </div>

                        <button
                            onClick={handlePost}
                            disabled={!postText.trim() || isPending}
                            className="bg-blue-500 text-white font-bold px-5 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}

export default AddPost;
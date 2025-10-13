import Profile from '@/components/user/Profile'
import React from 'react'

const Page = () => {
    return (
        <main className="relative">
            <section
                className="flex min-h-screen w-full flex-col items-center justify-start p-4 sm:p-6 bg-gray-100 dark:bg-gray-900">
                <div className="w-full max-w-3xl mt-12">
                    <Profile/>
                </div>
            </section>
        </main>
    )
}
export default Page

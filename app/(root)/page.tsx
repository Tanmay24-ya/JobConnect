import React from 'react'
import Link from "next/link";
import Image from 'next/image';
import { motion } from "framer-motion";
import InterviewCard from "@/components/InterviewCard";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getInterviewsByUserId, getLatestInterviews } from "@/lib/actions/general.action";
import Spline from '@splinetool/react-spline/next';

const Page = async () => {
    const user = await getCurrentUser()

    const [userInterviews, latestInterviews] = await Promise.all([
        getInterviewsByUserId(user?.id!),
        getLatestInterviews({ userId: user?.id! }),
    ])

    const hasPastInterviews = userInterviews?.length > 0
    const hasUpcomingInterviews = latestInterviews?.length > 0

    return (
        <>
            {/* Hero Section */}
            <section className="card-cta bg-[#1a1a1a]/70 backdrop-blur-md rounded-2xl p-6 md:p-10 h-auto md:h-[350px] flex flex-col md:flex-row items-center justify-between gap-10 shadow-lg">
                {/* Text Content */}
                <div className="flex flex-col gap-6 text-white w-full md:max-w-xl">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-snug">
                        Your AI-Powered Interview & <span className="text-purple-500">Feedback</span> Generator
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-gray-300">
                        Practice on Real Interview Questions & Get the Feedback on the basis of Your Performance
                    </p>
                    <Button asChild className="btn-primary w-full sm:w-fit px-6 py-3 text-sm sm:text-base font-semibold">
                        <Link href="/interview">Start an Interview</Link>
                    </Button>
                </div>

                {/* Image */}
                <div className="w-full flex justify-center md:justify-end hidden md:flex">
                    {/*<Spline*/}
                    {/*    className="absolute xl:right-[-32%] right-0 top-[-20%] lg:top-0"*/}
                    {/*    scene="https://prod.spline.design/6olquMi9-OtLw0Uv/scene.splinecode"*/}
                    {/*/>*/}
                    <Image
                        src="/img.png"
                        alt="AI orb"
                        className="w-[220px] sm:w-[280px] md:w-[350px] h-auto object-contain animate-float-spin"
                        width={350}
                        height={350}
                        priority
                    />
                </div>
            </section>

            {/* Features Section */}
            <section className="flex flex-wrap gap-4 sm:gap-6 mt-10 px-4 sm:px-6 py-6 bg-[#1a1a1a]/70 backdrop-blur-md rounded-2xl shadow-lg">
                <h2 className="w-full text-white text-xl sm:text-2xl md:text-3xl font-bold mb-4">
                    Explore JobConnect Features
                </h2>

                {/* Feature Buttons */}
                {/* Feature Buttons */}
                <div className="w-full overflow-x-auto no-scrollbar">
                    <div className="flex gap-8 min-w-full sm:justify-start justify-between">
                        <Button
                            asChild
                            className="btn-primary px-4 py-2 text-xs sm:text-sm md:text-base font-semibold flex-shrink-0 min-w-[160px]"
                        >
                            <Link href="/resume-interview">Resume Interview</Link>
                        </Button>

                        <Button
                            asChild
                            className="btn-primary px-4 py-2 text-xs sm:text-sm md:text-base font-semibold flex-shrink-0 min-w-[160px]"
                        >
                            <Link href="/interview">AI Mock Interviews</Link>
                        </Button>

                        <Button
                            asChild
                            className="btn-primary px-4 py-2 text-xs sm:text-sm md:text-base font-semibold flex-shrink-0 min-w-[160px]"
                        >
                            <Link href="/resume-matcher">Resume-JD Matcher</Link>
                        </Button>

                        <Button
                            asChild
                            className="btn-primary px-4 py-2 text-xs sm:text-sm md:text-base font-semibold flex-shrink-0 min-w-[160px]"
                        >
                            <Link href="/analytics">Performance Analytics</Link>
                        </Button>

                        <Button
                            asChild
                            className="btn-primary px-4 py-2 text-xs sm:text-sm md:text-base font-semibold flex-shrink-0 min-w-[160px]"
                        >
                            <Link href="/resources">Learning Resources</Link>
                        </Button>

                    </div>
                    {/*<Spline*/}
                    {/*    className="absolute xl:right-[-32%] right-0 top-[-20%] translate-x-10 lg:top-0"*/}
                    {/*    scene="https://prod.spline.design/2XecYPdbY0GQV8fe/scene.splinecode"*/}
                    {/*/>*/}
                </div>

            </section>


            {/* Your Interviews Section */}
            <section className="flex flex-col gap-5 mt-10 rounded-2xl px-4 sm:px-6 py-6 backdrop-blur-md">
                <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold">Your Interviews</h2>

                <div className="w-full overflow-x-auto no-scrollbar">
                    <div className="flex gap-3 md:gap-4 px-1 pb-2 snap-x snap-mandatory">
                        {hasPastInterviews ? (
                            userInterviews?.map((interview) => (
                                <div
                                    key={interview.id}
                                    className="snap-start flex-shrink-0 w-[320px] sm:w-[360px] md:w-[390px] h-[420px] transition-transform duration-300 hover:scale-[1.02] hover:z-10 hover:shadow-xl"
                                >
                                    <InterviewCard {...interview} />
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400">You have not taken any interviews yet.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Take an Interview Section */}
            <section className="flex flex-col gap-5 mt-10 rounded-2xl px-4 sm:px-6 py-6 backdrop-blur-md">
                <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold">Take an Interview</h2>

                <div className="w-full overflow-x-auto no-scrollbar">
                    <div className="flex gap-3 md:gap-4 px-1 pb-2 snap-x snap-mandatory">
                        {hasUpcomingInterviews ? (
                            latestInterviews?.map((interview) => (
                                <div
                                    key={interview.id}
                                    className="snap-start flex-shrink-0 w-[320px] sm:w-[360px] md:w-[390px] h-[420px] transition-transform duration-300 hover:scale-[1.02] hover:z-10 hover:shadow-xl"
                                >
                                    <InterviewCard {...interview} />
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400">There are no new Interviews available.</p>
                        )}
                    </div>
                </div>
            </section>

        </>

    );
}

export default Page;

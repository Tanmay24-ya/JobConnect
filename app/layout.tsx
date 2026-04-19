import { Toaster } from "sonner";
import type { Metadata } from "next";
// import { Mona_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

// const monaSans = Mona_Sans({
//     variable: "--font-mona-sans",
//     subsets: ["latin"],
// });

export const metadata: Metadata = {
    title: "JobConnect",
    description: "Your intelligent prep buddy for interviews — voice-driven and job-ready.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
        <body className="antialiased pattern" style={{ fontFamily: "var(--font-mona-sans)" }}>
        <Navbar />
        {/* ADD THIS WRAPPER */}
        <main className="mx-auto max-w-6xl px-4">
            {children}
        </main>
        <Toaster />
        </body>
        </html>
    );
}

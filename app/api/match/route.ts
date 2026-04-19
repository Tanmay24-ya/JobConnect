// import { generateText } from "ai";
// import { google } from "@ai-sdk/google";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";
// import pdf from "pdf-parse";
import pdf from "@/lib/pdf-parse-fix";
import crypto from "crypto";


const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key is missing.");
}

function generateHash(resume: string, job: string): string {
    return crypto.createHash("sha256").update(resume + job).digest("hex");
}



export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const file = formData.get("resume") as File | null;
        const jobDescription = formData.get("jobDescription") as string;
        const type = formData.get("type") as string;

        if (!file || !jobDescription) {
            return NextResponse.json(
                { error: "Missing resume or job description" },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer.length === 0) {
            return NextResponse.json(
                { error: "Uploaded file is empty" },
                { status: 400 }
            );
        }

        const pdfData = await pdf(buffer);
        const resumeText = pdfData.text || "No text extracted from resume.";
        const jobDescriptionText =
            jobDescription.trim() ||
            "The job requires full-stack development skills with React, Node.js, AWS.";

        const hash = generateHash(resumeText, jobDescriptionText);
        const docRef = db.collection("matches").doc(hash);
        const docSnapshot = await docRef.get();

        // If exists and has this type, reuse it
        if (docSnapshot.exists) {
            const data = docSnapshot.data();
            if (data?.results && data.results[type]) {
                return NextResponse.json({
                    success: true,
                    fromCache: true,
                    analysis: data.results[type],
                });
            }
        }

        // Else, generate new
        const prompt = `
You are an AI Resume Evaluator.
Analyze the resume against the job description.

Rules:
- Respond only with analysis for type: "${type}".
- Return plain text (no JSON, no code fences).
- Be clear and concise.

Input:
Resume: ${resumeText}
Job Description: ${jobDescriptionText}
`;

        const completion = await openai.chat.completions.create({
            model: "openai/gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
        });

        const geminiResponse = completion.choices[0].message.content || "";

        const cleanResponse = geminiResponse
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .replace(/\\n/g, "")
            .replace(/\n/g, "")
            .replace(/\\"/g, '"')
            .trim();

        // If doc exists, merge in the new type
        if (docSnapshot.exists) {
            await docRef.update({
                [`results.${type}`]: cleanResponse,
                timestamp: new Date(),
            });
        } else {
            await docRef.set({
                resume: resumeText,
                jobDescription: jobDescriptionText,
                results: {
                    [type]: cleanResponse,
                },
                timestamp: new Date(),
            });
        }

        return NextResponse.json({
            success: true,
            fromCache: false,
            analysis: cleanResponse,
        });
    } catch (error: any) {
        console.error("API /match Gemini Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

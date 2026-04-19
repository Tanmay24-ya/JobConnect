import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";
// import { generateText } from "ai";
// import { google } from "@ai-sdk/google";
import pdf from "@/lib/pdf-parse-fix";
import OpenAI from "openai";
import { getRandomInterviewCover } from "@/lib/utils";

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("resume") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "Missing resume file" },
                { status: 400 }
            );
        }

        const userId = formData.get("userId") as string || "anonymous";

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

        const completion1 = await openai.chat.completions.create({
            model: "openai/gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: `You are an AI interview generator. Analyze the following resume and create appropriate interview questions.

Resume:
${resumeText}

Based on this resume, generate 5 interview questions that:
1. Are relevant to the candidate's skills, experience, and background
2. Include a mix of technical and behavioral questions
3. Are specific to the technologies and roles mentioned in the resume
4. Will help assess the candidate's suitability for roles matching their experience

The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
Return the questions formatted like this:
["Question 1", "Question 2", "Question 3", ...]

Do not include any explanations or additional text, just the JSON array of questions.`,
                },
            ],
        });

        const questionsResponse =
            completion1.choices?.[0]?.message?.content || "";

        const cleanResponse = questionsResponse
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        let questions;
        try {
            questions = JSON.parse(cleanResponse);
        } catch (error) {
            const match = cleanResponse.match(/\[(.*)\]/s);
            if (match) {
                try {
                    questions = JSON.parse(`[${match[1]}]`);
                } catch {
                    questions = cleanResponse
                        .split('\n')
                        .map(line => line.trim())
                        .filter(line => line.startsWith('"') || line.startsWith("'"))
                        .map(line => line.replace(/^["']|["'],?$/g, ''));
                }
            } else {
                questions = cleanResponse
                    .split(/\d+\.\s+|\n/)
                    .map(q => q.trim())
                    .filter(q => q.length > 10);
            }
        }

        if (!Array.isArray(questions) || questions.length === 0) {
            questions = ["Tell me about your experience.", "What are your key skills?", "Describe a challenging project you worked on."];
        }

        const completion2 = await openai.chat.completions.create({
            model: "openai/gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: `Analyze the following resume and extract:
1. The most recent or primary job role/title
2. The top 5 technical skills or technologies mentioned

Resume:
${resumeText}

Return the result as a JSON object with the following format:
{
  "role": "Job Title",
  "techstack": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5"]
}

Only return the JSON object, no other text.`,
                },
            ],
        });

        const resumeAnalysis =
            completion2.choices?.[0]?.message?.content || "";


        let roleInfo;
        try {
            roleInfo = JSON.parse(resumeAnalysis.trim());
        } catch (error) {
            roleInfo = {
                role: "Professional",
                techstack: ["General", "Communication", "Problem Solving", "Teamwork", "Leadership"]
            };
        }

        const interview = {
            role: roleInfo.role,
            type: "Resume-Based",
            level: "Custom",
            techstack: roleInfo.techstack,
            questions: questions,
            userId: userId,
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString(),
            resumeBased: true
        };

        const docRef = await db.collection("interviews").add(interview);

        return NextResponse.json({
            success: true,
            interviewId: docRef.id
        });
    } catch (error: any) {
        console.error("API /resume-interview Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session')?.value;

        if (!sessionCookie) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        
        const userRecord = await db
            .collection('users')
            .doc(decodedClaims.uid)
            .get();

        if (!userRecord.exists) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            userId: userRecord.id,
            name: userRecord.data()?.name,
            email: userRecord.data()?.email,
        });
    } catch (error: any) {
        console.error("API /user Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
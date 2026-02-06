import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import { desc } from "drizzle-orm";

export async function GET(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || session.user.phoneNumber !== process.env.SUPER_ADMIN_NUMBER) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const allUsers = await db.query.user.findMany({
            orderBy: [desc(user.createdAt)],
        });

        return NextResponse.json(allUsers);
    } catch (error) {
        console.error("Error fetching customers:", error);
        return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
    }
}

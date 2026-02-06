import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema/orders";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const updateOrderSchema = z.object({
    address: z.string().min(5, "Address is required").optional(),
    status: z.enum(["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]).optional(),
    totalAmount: z.string().optional(),
});

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const orderId = parseInt(id);
        const body = await req.json();

        const validationResult = updateOrderSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Invalid input", details: validationResult.error.format() },
                { status: 400 }
            );
        }

        const { address, status, totalAmount } = validationResult.data;

        // Verify order exists. Allow admin to update any order.
        const isAdmin = session.user.phoneNumber === process.env.SUPER_ADMIN_NUMBER;

        const whereClause = isAdmin
            ? eq(orders.id, orderId)
            : and(eq(orders.id, orderId), eq(orders.userId, session.user.id));

        const existingOrder = await db.query.orders.findFirst({
            where: whereClause,
        });

        if (!existingOrder) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Update order
        const [updatedOrder] = await db
            .update(orders)
            .set({
                address,
                ...(status && { status }),
                ...(totalAmount && { totalAmount }),
            })
            .where(eq(orders.id, orderId))
            .returning();

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("Error updating order:", error);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}

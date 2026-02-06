import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema/orders";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const createOrderSchema = z.object({
    address: z.string().optional(),
    totalAmount: z.number().positive("Total amount must be positive"),
    items: z.array(z.object({
        menuItemId: z.string(),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
    })).min(1, "Order must have at least one item"),
});

export async function GET(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userOrders = await db.query.orders.findMany({
            where: eq(orders.userId, session.user.id),
            with: {
                items: true,
            },
            orderBy: [desc(orders.createdAt)],
        });

        return NextResponse.json(userOrders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const validationResult = createOrderSchema.safeParse(body);

        if (!validationResult.success) {
            console.error("Validation failed:", JSON.stringify(validationResult.error.format(), null, 2));
            return NextResponse.json(
                { error: "Invalid input", details: validationResult.error.format() },
                { status: 400 }
            );
        }

        const { address, totalAmount, items } = validationResult.data;

        // Transaction to ensure both order and items are created
        const newOrder = await db.transaction(async (tx) => {
            const [createdOrder] = await tx
                .insert(orders)
                .values({
                    userId: session.user.id,
                    address,
                    totalAmount: totalAmount.toString(), // precision handled by db, passed as string/decimal
                    status: "pending",
                })
                .returning();

            if (!createdOrder) {
                throw new Error("Failed to create order");
            }

            if (items.length > 0) {
                await tx.insert(orderItems).values(
                    items.map((item) => ({
                        orderId: createdOrder.id,
                        menuItemId: item.menuItemId.toString(),
                        quantity: item.quantity,
                        price: item.price.toString(),
                    }))
                );
            }

            return createdOrder;
        });

        return NextResponse.json(newOrder, { status: 201 });
    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}

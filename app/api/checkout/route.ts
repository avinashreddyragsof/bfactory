import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema/orders";

const PHONEPE_BASE_URL = process.env.PHONEPE_PRE_PROD_BASEURL || "https://api-preprod.phonepe.com";
const AUTH_URL = process.env.PHONEPE_PRE_PROD_AUTH_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token";
const PAY_URL = process.env.PHONEPE_PRE_PROD_PAY_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay";

const CLIENT_ID = process.env.PHONE_PE_CLIENT_ID;
const CLIENT_SECRET = process.env.PHONE_PE_CLIENT_SECRET;

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { amount, customerName, customerPhone, items, address } = await request.json();
        // console.log("Request Data :", amount, customerName, customerPhone, items);

        if (!CLIENT_ID || !CLIENT_SECRET) {
            console.error("Missing PhonePe Credentials");
            return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
        }

        // 1. Create Order in Database
        const newOrder = await db.transaction(async (tx) => {
            const [createdOrder] = await tx.insert(orders).values({
                userId: session.user.id,
                totalAmount: amount.toString(),
                status: "pending",
                address: address, // Ensure address is passed
            }).returning();

            if (!createdOrder) {
                throw new Error("Failed to create order");
            }

            if (items && items.length > 0) {
                // Map items to match schema. Assuming items have id, quantity, price.
                // Need to make sure input items match what DB expects.
                // Assuming frontend sends menu item id as 'id' or 'menuItemId'
                await tx.insert(orderItems).values(
                    items.map((item: any) => ({
                        orderId: createdOrder.id,
                        menuItemId: item.id || item.menuItemId,
                        quantity: item.quantity,
                        price: item.price.toString(),
                    }))
                );
            }
            return createdOrder;
        });

        const orderId = `ORD_${newOrder.id}_${Date.now()}`; // Unique Merchant Order ID

        // 2. Get PhonePe Access Token
        const authRequestHeaders = {
            "Content-Type": "application/x-www-form-urlencoded"
        };

        const authRequestBodyJSON = {
            "client_version": "1",
            "grant_type": "client_credentials",
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET
        };

        const authRequestBody = new URLSearchParams(authRequestBodyJSON).toString();

        const tokenResponse = await fetch(AUTH_URL, {
            method: "POST",
            headers: authRequestHeaders,
            body: authRequestBody,
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error("PhonePe Token Error:", errorData);
            throw new Error("Failed to get PhonePe token");
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // 3. Initiate Payment
        const origin = new URL(request.url).origin;
        const amountInPaisa = Math.round(amount * 100);

        const payRequestHeaders = {
            "Content-Type": "application/json",
            "Authorization": `O-Bearer ${accessToken}`
        };

        const payRequestBody = {
            merchantOrderId: orderId,
            amount: amountInPaisa,
            expireAfter: 300,
            paymentFlow: {
                type: "PG_CHECKOUT",
                message: "Biryani Factory Order",
                merchantUrls: {
                    redirectUrl: `${origin}/orders/${newOrder.id}` // Redirect to local order page first
                    // Note: PhonePe might expect a publicly accessible URL for server-to-server callbacks,
                    // but redirectUrl is browser-based redirect.
                    // Ideally, we redirect to a verify page or order status page.
                }
            },
            metaInfo: {
                udf1: `${customerName}`,
                udf2: `${customerPhone}`,
            }
        };

        const payResponse = await fetch(PAY_URL, {
            method: "POST",
            headers: payRequestHeaders,
            body: JSON.stringify(payRequestBody)
        });

        if (!payResponse.ok) {
            const errorText = await payResponse.text();
            console.error("PhonePe Pay Error:", errorText);
            throw new Error("Failed to initiate payment");
        }

        const payData = await payResponse.json();

        if (!payData.redirectUrl) {
            console.error("PhonePe PAY Response missing redirectUrl", payData);
            return NextResponse.json({ error: "Failed to initiate payment redirect" }, { status: 500 });
        }

        return NextResponse.json({
            redirectUrl: payData.redirectUrl,
            orderId: newOrder.id
        });

    } catch (error) {
        console.error("Checkout Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
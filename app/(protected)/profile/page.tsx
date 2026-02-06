import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { orders } from "@/db/schema/orders";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image"
import profile from "@/public/profile.png"

import { LogoutButton } from "@/components/auth/LogoutButton";

export default async function ProfilePage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) return null; // Handled by layout

    const userOrders = await db.query.orders.findMany({
        where: eq(orders.userId, session.user.id),
        orderBy: [desc(orders.createdAt)],
    });

    return (
        <div className="max-w-4xl mx-auto flex flex-col items-center space-y-8">
            <div className="flex items-center gap-4">
                <Image src={profile} alt="Profile" width={64} height={64} className="rounded-full" />
                <div className="flex flex-col">
                    <span className="font-semibold">{session.user.name}</span>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Order History</h2>
                {userOrders.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            You haven't placed any orders yet.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {userOrders.map((order) => (
                            <Card key={order.id}>
                                <CardContent className="flex items-center justify-between p-6">
                                    <div className="space-y-1">
                                        <div className="font-semibold">Order #{order.id}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge variant={order.status === "delivered" ? "default" : "secondary"}>
                                            {order.status}
                                        </Badge>
                                        <div className="font-medium">
                                            ₹{order.totalAmount}
                                        </div>
                                        <Link href={`/orders/${order.id}`}>
                                            <Button variant="outline" size="sm">
                                                View Details
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex items-center ">
                <LogoutButton />
            </div>
        </div>
    );
}

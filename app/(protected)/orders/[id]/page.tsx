import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { orders } from "@/db/schema/orders";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: PageProps) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) redirect("/");

    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) notFound();

    const order = await db.query.orders.findFirst({
        where: and(
            eq(orders.id, orderId),
            eq(orders.userId, session.user.id)
        ),
        with: {
            items: true,
        },
    });

    if (!order) {
        notFound();
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Order #{order.id}</h1>
                <Badge className="text-base px-4 py-1">
                    {order.status}
                </Badge>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Delivery Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-muted-foreground">
                        {order.address}
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                        Ordered on {new Date(order.createdAt).toLocaleString()}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        {/* Ideally fetch item name from menu table */}
                                        Menu Item #{item.menuItemId}
                                    </TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                    <TableCell className="text-right">₹{item.price}</TableCell>
                                    <TableCell className="text-right">
                                        ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
                                <TableCell className="text-right font-bold">₹{order.totalAmount}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

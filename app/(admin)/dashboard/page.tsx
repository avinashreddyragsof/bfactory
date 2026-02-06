import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import { orders } from "@/db/schema/orders";
import { desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/ui/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { OrdersTab } from "@/components/admin/orders-tab";
import { CustomersTab } from "@/components/admin/customers-tab";

export default async function AdminDashboard() {
    // Fetch all users
    const allUsers = await db.query.user.findMany({
        orderBy: [desc(user.createdAt)],
    });

    // Fetch all orders
    const allOrders = await db.query.orders.findMany({
        orderBy: [desc(orders.createdAt)],
        with: {
            user: true,
            items: true
        }
    });

    const totalRevenue = allOrders.reduce((acc, order) => acc + parseFloat(order.totalAmount), 0);
    const totalOrders = allOrders.length;
    const totalCustomers = allUsers.length;

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            {/* <AppSidebar variant="inset" /> */}
            <SidebarInset>
                {/* <SiteHeader /> */}
                <div className="flex flex-1 flex-col p-4 md:p-6 space-y-6">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalOrders}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalCustomers}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="orders" className="w-full">
                        <TabsList>
                            <TabsTrigger value="orders">Orders</TabsTrigger>
                            <TabsTrigger value="customers">Customers</TabsTrigger>
                        </TabsList>
                        <TabsContent value="orders" className="mt-4">
                            <OrdersTab orders={allOrders as any} />
                        </TabsContent>
                        <TabsContent value="customers" className="mt-4">
                            <CustomersTab customers={allUsers as any} />
                        </TabsContent>
                    </Tabs>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

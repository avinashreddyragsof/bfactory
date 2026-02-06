"use client";

import { useState, useMemo, Fragment } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Search, ArrowUpDown, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";

const formatPrice = (amount: number | string) => {
    const val = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(val);
};

interface OrderItem {
    id: number;
    menuItemId: string;
    quantity: number;
    price: string;
}

interface Order {
    id: number;
    // user might be null if deleted? schema says reference but user fetching query uses with: user.
    user: {
        name: string | null;
        phoneNumber: string;
        email: string | null;
    } | null;
    status: string;
    totalAmount: string;
    address: string | null;
    createdAt: Date | string; // Dates from API/DB passing might be strings or Date objects depending on serialization
    items: OrderItem[];
}

interface OrdersTabProps {
    orders: Order[];
}

export function OrdersTab({ orders: initialOrders }: OrdersTabProps) {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: keyof Order | "user"; direction: "asc" | "desc" }>({ key: "id", direction: "desc" });
    const [page, setPage] = useState(1);
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
    const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

    const pageSize = 10;

    // Filter and Sort
    const filteredAndSortedOrders = useMemo(() => {
        let result = [...orders];

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(order =>
                order.id.toString().includes(lowerTerm) ||
                order.user?.name?.toLowerCase().includes(lowerTerm) ||
                order.user?.phoneNumber.includes(lowerTerm)
            );
        }

        result.sort((a, b) => {
            const aValue = sortConfig.key === "user" ? (a.user?.name || "") : a[sortConfig.key];
            const bValue = sortConfig.key === "user" ? (b.user?.name || "") : b[sortConfig.key];

            if (aValue === bValue) return 0;

            // Handle Dates comparison if needed, though robust string comparison works for ISO dates usually
            // Handle numbers
            if (sortConfig.key === "id" || sortConfig.key === "totalAmount") {
                const numA = parseFloat(aValue as string) || 0;
                const numB = parseFloat(bValue as string) || 0;
                return sortConfig.direction === "asc" ? numA - numB : numB - numA;
            }

            const strA = String(aValue).toLowerCase();
            const strB = String(bValue).toLowerCase();

            return sortConfig.direction === "asc"
                ? strA.localeCompare(strB)
                : strB.localeCompare(strA);
        });

        return result;
    }, [orders, searchTerm, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedOrders.length / pageSize);
    const paginatedOrders = filteredAndSortedOrders.slice((page - 1) * pageSize, page * pageSize);

    const handleSort = (key: keyof Order | "user") => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === "desc" ? "asc" : "desc"
        }));
    };

    const handleStatusUpdate = async (orderId: number, newStatus: string) => {
        setUpdatingStatusId(orderId);
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) throw new Error("Failed to update status");

            const updatedOrder = await res.json();

            // Update local state
            setOrders(current => current.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            toast.success(`Order #${orderId} status updated to ${newStatus}`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const toggleExpand = (id: number) => {
        setExpandedOrderId(current => current === id ? null : id);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                    <CardTitle>Orders</CardTitle>
                    <CardDescription>Manage and view all customer orders</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} // Reset page on search
                            className="pl-8 w-[250px]"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">
                                    <Button variant="ghost" onClick={() => handleSort("id")} className="px-0 font-semibold">
                                        ID <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => handleSort("user")} className="px-0 font-semibold">
                                        Customer <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => handleSort("status")} className="px-0 font-semibold">
                                        Status <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead className="text-right">
                                    <Button variant="ghost" onClick={() => handleSort("totalAmount")} className="px-0 font-semibold">
                                        Amount <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No orders found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedOrders.map((order) => (
                                    <Fragment key={order.id}>
                                        <TableRow key={order.id} className="group">
                                            <TableCell className="font-mono">#{order.id}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{order.user?.name || "Guest"}</span>
                                                    <span className="text-xs text-muted-foreground">{order.user?.phoneNumber}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    disabled={updatingStatusId === order.id}
                                                    defaultValue={order.status}
                                                    onValueChange={(val) => handleStatusUpdate(order.id, val)}
                                                >
                                                    <SelectTrigger className="w-[140px] h-8">
                                                        <SelectValue>
                                                            <Badge variant={
                                                                order.status === 'delivered' ? 'default' :
                                                                    order.status === 'cancelled' ? 'destructive' :
                                                                        'secondary'
                                                            } className="capitalize pointer-events-none">
                                                                {order.status.replace("_", " ")}
                                                            </Badge>
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"].map((status) => (
                                                            <SelectItem key={status} value={status} className="capitalize">
                                                                {status.replace("_", " ")}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">₹{order.totalAmount}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" onClick={() => toggleExpand(order.id)}>
                                                    {expandedOrderId === order.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </Button>
                                            </TableCell>
                                        </TableRow>

                                        {/* Expanded Detail Row */}
                                        {expandedOrderId === order.id && (
                                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                                <TableCell colSpan={5} className="p-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className="font-semibold mb-2 text-sm">Order Items</h4>
                                                            <div className="space-y-1 text-sm">
                                                                {order.items.map((item, idx) => (
                                                                    <div key={idx} className="flex justify-between border-b pb-1 last:border-0 border-border/50">
                                                                        <span>{item.menuItemId} <span className="text-muted-foreground">x{item.quantity}</span></span>
                                                                        <span>₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold mb-2 text-sm">Delivery Details</h4>
                                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.address || "No address provided"}</p>
                                                            <div className="mt-4 text-xs text-muted-foreground">
                                                                Ordered: {new Date(order.createdAt).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </Fragment>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="text-sm text-muted-foreground">
                        Page {page} of {totalPages || 1}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || totalPages === 0}
                    >
                        Next
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

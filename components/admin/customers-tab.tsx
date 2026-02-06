"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Customer {
    id: string;
    name: string | null;
    phoneNumber: string;
    email: string | null;
    createdAt: Date;
}

export function CustomersTab({ customers }: { customers: Customer[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Customers</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name/Phone</TableHead>
                            <TableHead>Joined</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.map((customer) => (
                            <TableRow key={customer.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{customer.name || 'N/A'}</span>
                                        <span className="text-xs text-muted-foreground">{customer.phoneNumber}</span>
                                        <span className="text-xs text-muted-foreground">{customer.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {new Date(customer.createdAt).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

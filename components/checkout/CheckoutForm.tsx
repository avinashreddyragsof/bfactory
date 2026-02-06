"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store";

export function CheckoutForm() {
    const { cart, clearCart, totalPrice } = useCartStore();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target as HTMLFormElement);
        const firstName = formData.get("firstName") as string;
        const lastName = formData.get("lastName") as string;
        const phone = formData.get("phone") as string;
        const address = formData.get("address") as string;

        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: totalPrice(),
                    customerName: `${firstName} ${lastName}`,
                    customerPhone: phone,
                    address: address,
                    items: cart.map((item) => ({
                        menuItemId: item.itemId,
                        quantity: item.quantity,
                        price: item.variant.price,
                    })),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to initiate payment");
            }

            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;
            } else {
                toast.error("Payment initiation failed. No redirect URL received.");
            }

        } catch (error: any) {
            console.error("Payment Error:", error);
            toast.error(error.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
            <div className="bg-muted p-4 rounded-lg space-y-4">
                <h3 className="font-semibold text-lg">Order Summary</h3>
                <div className="space-y-2">
                    {cart.map((item) => (
                        <div key={item.itemId} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.product.name} ({item.variant.variant_name})</span>
                            <span>₹{item.variant.price * item.quantity}</span>
                        </div>
                    ))}
                    <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                        <span>Total</span>
                        <span>₹{totalPrice()}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" name="firstName" required placeholder="John" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" name="lastName" required placeholder="Doe" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" type="tel" required placeholder="+91 98765 43210" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    <Input id="address" name="address" required placeholder="Flat No, Street, Landmark" />
                </div>
            </div>

            <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading || cart.length === 0}>
                {loading ? "Processing..." : `Pay ₹${totalPrice()}`}
            </Button>
        </form>
    );
}

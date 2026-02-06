"use client";

import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { Loader2 } from "lucide-react";

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>}>
            <CheckoutForm />
        </Suspense>
    );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import Link from "next/link";
import { ShoppingBag, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store";
import { LoginDrawer } from "@/components/auth/LoginDrawer";
import { authClient } from "@/lib/auth-client";
import profile from "@/public/profile.png"

export function Navbar() {
    const { totalItems, setCartOpen } = useCartStore();
    const count = totalItems();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { data: session } = authClient.useSession();
    // Use isPending/data if needed, but session is usually enough for this simple switch

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 sm:px-8 mx-auto">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative w-10 h-10">
                            <Image
                                src="/logo.png"
                                alt="Biryani Factory Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="text-xl font-bold tracking-tight hidden sm:inline-block">Biryani Factory</span>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    {session ? (
                        <Link href="/profile">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                {/* <User className="h-5 w-5" /> */}
                                <Image src="/profile.png" alt="Profile" width={32} height={32} />
                                <span className="sr-only">Profile</span>
                            </Button>
                        </Link>
                    ) : (
                        <LoginDrawer />
                    )}
                    <Button
                        variant="outline"
                        size="icon"
                        className="relative w-10 h-10 rounded-full border-primary/20 hover:border-primary/50 hover:bg-primary/5 text-primary"
                        onClick={() => setCartOpen(true)}
                    >
                        <ShoppingBag className="w-5 h-5" />
                        {mounted && count > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground ring-2 ring-background">
                                {count}
                            </span>
                        )}
                    </Button>
                </div>
            </div>
        </header>
    );
}

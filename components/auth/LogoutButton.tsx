"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function LogoutButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        toast.success("Logged out successfully");
                        router.push("/");
                        router.refresh();
                    },
                },
            });
        } catch (error) {
            toast.error("Failed to logout");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full sm:w-auto"
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <LogOut className="mr-2 h-4 w-4" />
            )}
            Sign Out
        </Button>
    );
}

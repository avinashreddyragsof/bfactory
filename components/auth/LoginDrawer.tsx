"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Phone } from "lucide-react";
import { useRouter } from "next/navigation";

interface LoginDrawerProps {
    trigger?: React.ReactNode;
}

export function LoginDrawer({ trigger }: LoginDrawerProps) {
    const [open, setOpen] = React.useState(false);
    const [nestedOpen, setNestedOpen] = React.useState(false); // State for nested drawer
    const [phoneNumber, setPhoneNumber] = React.useState("");
    const [otp, setOtp] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const router = useRouter();

    const handleSendOtp = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            toast.error("Please enter a valid phone number");
            return;
        }

        setLoading(true);
        // @ts-ignore - Phone plugin types mighxxt be inferred incorrectly here
        await authClient.phoneNumber.sendOtp({
            phoneNumber: phoneNumber,
        }, {
            onSuccess: () => {
                setNestedOpen(true); // Open nested drawer on success
                toast.success("OTP sent to your phone");
                setLoading(false);
            },
            onError: (ctx) => {
                toast.error(ctx.error.message);
                setLoading(false);
            }
        });
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) { // Assuming 6 digit OTP from user request usually, but let's check
            // User requested 6 digit OTP, so validation
            if (!otp) return;
        }
        setLoading(true);

        // Correctly using the phone number verify method based on investigation
        // @ts-ignore - Phone plugin types inference
        await authClient.phoneNumber.verify({
            phoneNumber,
            code: otp
        }, {
            onSuccess: () => {
                toast.success("Logged in successfully");
                setNestedOpen(false);
                setOpen(false);
                router.refresh();
                setLoading(false);
            },
            onError: (ctx) => {
                toast.error(ctx.error.message);
                setLoading(false);
            }
        });
    };

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                {trigger ? trigger : (
                    <Button variant="outline" className="gap-2">
                        <Phone className="w-4 h-4" />
                        Login
                    </Button>
                )}
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle>Login</DrawerTitle>
                        <DrawerDescription>
                            Enter your phone number to continue.
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 pb-0 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                placeholder="+91 99999 99999"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                type="tel"
                            />
                        </div>
                    </div>
                    <DrawerFooter>
                        <Button onClick={handleSendOtp} disabled={loading}>
                            {loading ? "Sending..." : "Send OTP"}
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>

                {/* Nested Drawer for OTP */}
                <Drawer open={nestedOpen} onOpenChange={setNestedOpen}>
                    <DrawerContent>
                        <div className="mx-auto w-full max-w-sm">
                            <DrawerHeader>
                                <DrawerTitle>Verify OTP</DrawerTitle>
                                <DrawerDescription>
                                    Enter the 4-digit code sent to your phone.
                                </DrawerDescription>
                            </DrawerHeader>
                            <div className="p-4 flex justify-center">
                                <InputOTP
                                    maxLength={6}
                                    value={otp}
                                    onChange={(value) => setOtp(value)}
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                            <DrawerFooter>
                                <Button onClick={handleVerifyOtp} disabled={loading || otp.length !== 6}>
                                    {loading ? "Verifying..." : "Verify & Login"}
                                </Button>
                                <DrawerClose asChild>
                                    <Button variant="outline">Back</Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </div>
                    </DrawerContent>
                </Drawer>
            </DrawerContent>
        </Drawer>
    );
}

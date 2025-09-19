"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { verifyAndConsumeToken } from "@/app/actions";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface TokenEntryProps {
    onVerificationSuccess: () => void;
}

export function TokenEntry({ onVerificationSuccess }: TokenEntryProps) {
    const [token, setToken] = useState("");
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleVerify = () => {
        if (!token.trim()) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please enter your access token.",
            });
            return;
        }

        startTransition(async () => {
            const result = await verifyAndConsumeToken(token);
            if (result.success) {
                onVerificationSuccess();
            } else {
                toast({
                    variant: "destructive",
                    title: "Verification Failed",
                    description: result.error || "An unknown error occurred.",
                });
            }
        });
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-background px-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="items-center text-center">
                    <Image src="/logo.svg" alt="MindMate Logo" width={48} height={48} className="mb-4" />
                    <CardTitle className="text-2xl">Verify Your Access</CardTitle>
                    <CardDescription>
                        Please enter the one-time access token you received from MindMate.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                             <Input
                                id="token"
                                placeholder="Enter your token"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                disabled={isPending}
                            />
                        </div>
                        <Button
                            type="button"
                            className="w-full"
                            onClick={handleVerify}
                            disabled={isPending}
                        >
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Verify Token
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

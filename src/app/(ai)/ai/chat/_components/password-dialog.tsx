
"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";

interface PasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (password: string) => void;
}

export function PasswordDialog({ open, onOpenChange, onConfirm }: PasswordDialogProps) {
  const [password, setPassword] = useState("");

  const handleConfirm = () => {
    onConfirm(password);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Request Limit Reached</AlertDialogTitle>
          <AlertDialogDescription>
            Please enter the password to unlock unlimited requests.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
            <Input 
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>Cancel</AlertDialogCancel>
          <Button onClick={handleConfirm}>Unlock</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

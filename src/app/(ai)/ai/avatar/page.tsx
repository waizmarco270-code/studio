"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AvatarCanvas } from "./_components/avatar-canvas";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AvatarPage() {
  const [isAnimated, setIsAnimated] = useState(true);

  return (
    <div className="flex h-full w-full flex-col">
       <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="font-headline text-2xl font-bold">Avatar</h1>
          <p className="text-muted-foreground">Customize your AI companion</p>
        </div>
        <div className="hidden md:block">
           <ThemeToggle />
        </div>
      </div>

      <div className="mt-4 grid flex-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card className="h-full">
                <CardContent className="h-full p-2">
                    <AvatarCanvas isAnimated={isAnimated} />
                </CardContent>
            </Card>
        </div>
        <div className="flex flex-col gap-6">
             <Card>
                <CardHeader>
                    <CardTitle>Controls</CardTitle>
                    <CardDescription>Manage avatar animations and appearance.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="lipsync-switch">Pause Lip-Sync</Label>
                        <Switch id="lipsync-switch" disabled />
                    </div>
                     <div className="flex items-center justify-between">
                        <Label htmlFor="animation-switch">Reduce Animation</Label>
                        <Switch 
                          id="animation-switch" 
                          checked={!isAnimated}
                          onCheckedChange={() => setIsAnimated(!isAnimated)}
                        />
                    </div>
                    <Button className="w-full" disabled>Export Snapshot</Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Personalize</CardTitle>
                    <CardDescription>Upload a photo to lightly map onto the avatar. Requires consent.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="outline" className="w-full" disabled>Upload Photo</Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

const colorThemes = [
  { name: "zinc", color: "hsl(240 5.2% 33.9%)" },
  { name: "slate", color: "hsl(240 5.9% 10%)" },
  { name: "stone", color: "hsl(25 5.3% 44.7%)" },
  { name: "gray", color: "hsl(240 4.8% 95.9%)" },
  { name: "neutral", color: "hsl(0 0% 9%)" },
  { name: "red", color: "hsl(0 72.2% 50.6%)" },
  { name: "rose", color: "hsl(346.8 77.2% 49.8%)" },
  { name: "orange", color: "hsl(24.6 95% 53.1%)" },
  { name: "green", color: "hsl(142.1 76.2% 36.3%)" },
  { name: "blue", color: "hsl(221.2 83.2% 53.3%)" },
  { name: "yellow", color: "hsl(47.9 95.8% 53.1%)" },
  { name: "violet", color: "hsl(262.1 83.3% 57.8%)" },
];


export default function SettingsPage() {
  const { setTheme, theme } = useTheme();
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const [activeColor, setActiveColor] = useState("violet");

  useEffect(() => {
    setMounted(true);
    const tts = localStorage.getItem("marco-ai-tts-enabled") === "true";
    setIsTtsEnabled(tts);
    
    const savedTheme = localStorage.getItem("marco-ai-theme-color") || "theme-violet";
    document.documentElement.className = savedTheme;
    setActiveColor(savedTheme.replace('theme-', ''));

  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  const handleColorChange = (colorName: string) => {
     const themeClass = `theme-${colorName}`;
     document.documentElement.className = themeClass;
     localStorage.setItem("marco-ai-theme-color", themeClass);
     setActiveColor(colorName);
  };

  const handleTtsChange = (checked: boolean) => {
    setIsTtsEnabled(checked);
    localStorage.setItem("marco-ai-tts-enabled", String(checked));
    toast({
        title: "Settings Saved",
        description: `Text-to-Speech has been ${checked ? 'enabled' : 'disabled'}.`
    })
  };

  const handleClearData = () => {
    try {
      localStorage.removeItem("marco-ai-access-granted");
      localStorage.removeItem("marco-ai-user-id");
      localStorage.removeItem("marco-ai-theme-color");
      localStorage.removeItem("marco-ai-tts-enabled");
      toast({
        title: "Data Cleared",
        description: "Your local data has been cleared. The app will now reload.",
      });
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not clear data. Please clear your browser's site data manually.",
      });
    }
  };
  
  if (!mounted) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 shrink-0">
         <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="MindMate Logo" width={32} height={32} />
              <span className="font-semibold text-lg hidden md:block">Settings</span>
            </div>
         </div>
      </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-3xl space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Customize the look and feel of the application.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Color Scheme</Label>
                   <RadioGroup
                    value={theme}
                    onValueChange={handleThemeChange}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light">Light</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="dark" />
                      <Label htmlFor="dark">Dark</Label>
                    </div>
                  </RadioGroup>
                </div>
                 <div className="space-y-2">
                  <Label>Accent Color</Label>
                    <div className="flex flex-wrap gap-3">
                    {colorThemes.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => handleColorChange(color.name)}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full border-2",
                          activeColor === color.name ? "border-primary" : "border-transparent"
                        )}
                      >
                        <div
                          className="h-6 w-6 rounded-full"
                          style={{ backgroundColor: color.color }}
                        />
                        {activeColor === color.name && <Check className="h-4 w-4 absolute text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>General</CardTitle>
                <CardDescription>Manage general application settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center justify-between">
                  <Label htmlFor="tts-switch">Enable Text-to-Speech</Label>
                  <Switch
                    id="tts-switch"
                    checked={isTtsEnabled}
                    onCheckedChange={handleTtsChange}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>Manage your local application data.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Clear Local Data</Label>
                            <p className="text-sm text-muted-foreground">
                                This will remove your access token and user ID from this device.
                            </p>
                        </div>
                        <Button variant="destructive" onClick={handleClearData}>Clear Data</Button>
                    </div>
                </CardContent>
            </Card>
          </div>
        </main>
    </div>
  );
}

    
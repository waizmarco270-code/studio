"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ThemeToggle } from "@/components/theme-toggle";
import { setApiKey } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [geminiKey, setGeminiKey] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSave = async () => {
    startTransition(async () => {
      const result = await setApiKey(geminiKey);
      if (result.success) {
        toast({
          title: "Success",
          description: "API Key saved. The AI should now be functional.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      }
    });
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="font-headline text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences</p>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>

      <div className="mt-4 grid max-w-2xl gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Audio</CardTitle>
            <CardDescription>
              Control voice input and text-to-speech (TTS) output.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="tts-switch">Enable TTS Output</Label>
              <Switch id="tts-switch" defaultChecked disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="voice-select">Voice Selection</Label>
              <Select defaultValue="alloy" disabled>
                <SelectTrigger id="voice-select">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alloy">Alloy (Default)</SelectItem>
                  <SelectItem value="echo">Echo</SelectItem>
                  <SelectItem value="fable">Fable</SelectItem>
                  <SelectItem value="onyx">Onyx</SelectItem>
                  <SelectItem value="nova">Nova</SelectItem>
                  <SelectItem value="shimmer">Shimmer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="volume-slider">Volume</Label>
              <Slider id="volume-slider" defaultValue={[80]} max={100} step={1} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="speed-slider">Playback Speed</Label>
              <Slider id="speed-slider" defaultValue={[1]} max={2} step={0.1} disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Settings</CardTitle>
            <CardDescription>
              Manage API keys for LLM providers. Get your key from{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Google AI Studio
              </a>
              .
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gemini-key">Gemini API Key</Label>
              <Input
                id="gemini-key"
                type="password"
                placeholder="Enter Gemini API Key"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                disabled={isPending}
              />
            </div>
            
            <Button onClick={handleSave} disabled={isPending || !geminiKey}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save API Key
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
            <CardDescription>
              Manage your personal data and chat history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" disabled>Delete My Data</Button>
            <p className="mt-2 text-xs text-muted-foreground">
              This action is irreversible and will permanently delete all your
              chat history and uploaded files.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

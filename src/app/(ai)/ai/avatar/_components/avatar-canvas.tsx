"use client";

import { useTheme } from "next-themes";

export function AvatarCanvas() {
  const { theme } = useTheme();
  // In a real implementation, you would use useEffect to initialize a Three.js scene here.
  // The scene would be attached to the div below.
  // The `theme` variable can be used to set the scene's background or lighting.

  return (
    <div className="flex h-full w-full items-center justify-center rounded-md bg-muted/50">
      <p className="text-muted-foreground">3D Avatar Canvas</p>
    </div>
  );
}

import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp afterSignInUrl="/ai/chat" afterSignUpUrl="/ai/chat" />
    </div>
  );
}

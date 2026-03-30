"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
      <h1 className="text-3xl text-[#0a2243] font-bold">Welcome back</h1>
      <SignIn fallbackRedirectUrl="/" forceRedirectUrl="/" />
      <p className="text-sm text-gray-500">
        Don't have an account?{" "}
        <Link href="/sign-up" className="text-blue-500 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

"use client";

import { UserForm } from "@/app/_components/user-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
  async function handleSignIn(data: {
    fullName: string;
    email: string;
    age: number;
  }) {
    // TODO: Replace with better-auth sign in
    // await auth.signIn(data);
    console.log("Sign in data:", data);
  }

  return (
    <div className="container max-w-md mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm
            onSubmit={handleSignIn}
            submitLabel="Sign In"
            defaultValues={{ fullName: "", email: "", age: 18 }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

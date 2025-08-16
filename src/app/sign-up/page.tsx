"use client";

import { UserForm } from "@/app/_components/user-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpPage() {
  async function handleSignUp(data: {
    fullName: string;
    email: string;
    age: number;
  }) {
    // TODO: Replace with better-auth sign up
    // await auth.signUp(data);
    console.log("Sign up data:", data);
  }

  return (
    <div className="container max-w-md mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm
            onSubmit={handleSignUp}
            submitLabel="Sign Up"
            defaultValues={{ fullName: "", email: "", age: 18 }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

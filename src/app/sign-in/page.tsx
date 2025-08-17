"use client";

import { UserForm } from "@/app/_components/user-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <div className="container max-w-md mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm
            defaultValues={{ mode: "signIn", email: "", password: "" }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

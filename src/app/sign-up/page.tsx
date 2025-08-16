"use client";

import { UserForm } from "@/app/_components/user-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <div className="container max-w-md mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm
            defaultValues={{ 
              mode: "signUp", 
              email: "", 
              fullName: "", 
              password: "", 
              age: 18 
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

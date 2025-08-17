"use client";

import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { Input } from "@/components/form-controllers/input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "@/lib/utils";
import { UserSchema } from "@/db/schema/user";
import { useSignIn } from "../sign-in/actions";
import { useSignUp } from "../sign-up/actions";
import { trpc } from "../_trpc/client";

// Define response types for actions
type ActionResponse =
  | { success: true; message: string; user?: any; redirect?: string }
  | { success: false; message: string };

type Props = {
  defaultValues: UserSchema;
};

// Create mode-specific schemas to avoid union schema validation issues
const signUpSchema = z.object({
  mode: z.literal("signUp"),
  email: z.string().email("Please enter a valid email"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  age: z
    .number()
    .min(18, "Age must be at least 18")
    .max(99, "Age must be less than 100")
    .optional(),
});

const signInSchema = z.object({
  mode: z.literal("signIn"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const updateSchema = z.object({
  mode: z.literal("update"),
  name: z.string().min(1, "Name is required"),
  age: z
    .number()
    .min(18, "Age must be at least 18")
    .max(99, "Age must be less than 100")
    .optional(),
  id: z.string().min(1, "User ID is required"),
});

// Function to get the appropriate schema based on mode
const getSchemaForMode = (mode: string) => {
  switch (mode) {
    case "signUp":
      return signUpSchema;
    case "signIn":
      return signInSchema;
    case "update":
      return updateSchema;
    default:
      return z.object({ mode: z.string() }); // Fallback schema
  }
};

export function UserForm({ defaultValues }: Props) {
  const form = useForm<UserSchema>({
    defaultValues,
    mode: "onBlur", // Validate on blur to avoid constant validation during typing
  });
  const router = useRouter();
  const utils = trpc.useUtils();

  // Call the hooks at the component level
  const signInHook = useSignIn();
  const signUpHook = useSignUp();

  // tRPC mutation for updating user
  const updateUserMutation = trpc.updateUser.useMutation({
    onSuccess: (data) => {
      toast({ success: true, message: "User updated successfully!" });
      // Invalidate user queries to refetch updated data
      utils.getUser.invalidate();
      router.push("/profile");
    },
    onError: (error) => {
      toast({ error: error.message || "Failed to update user" });
    },
  });

  const mode = useWatch({ control: form.control, name: "mode" });

  // Check if any operation is loading
  const isLoading = updateUserMutation.isPending || signInHook.isLoading || signUpHook.isLoading;

  const onSubmit: SubmitHandler<UserSchema> = async (data) => {
    // Clear any existing errors
    form.clearErrors();

    try {
      // Validate the data with the appropriate schema before submission
      const schema = getSchemaForMode(data.mode);
      const validationResult = schema.safeParse(data);

      if (!validationResult.success) {
        // Handle validation errors by setting them on the form
        validationResult.error.issues.forEach((err: z.ZodIssue) => {
          const fieldName = err.path.join(".") as keyof UserSchema;
          form.setError(fieldName, {
            type: "validation",
            message: err.message,
          });
        });
        toast({ error: "Please fix the validation errors above." });
        return;
      }

      const validatedData = validationResult.data;

      switch (validatedData.mode) {
        case "update":
          // Use tRPC mutation for updates
          updateUserMutation.mutate(
            validatedData as Extract<UserSchema, { mode: "update" }>
          );
          break;
        case "signUp":
          const signUpResponse = await signUpHook.signUp(
            validatedData as Extract<UserSchema, { mode: "signUp" }>
          );
          if (signUpResponse) {
            toast(signUpResponse);
            if (signUpResponse.success && signUpResponse.redirect) {
              router.push(signUpResponse.redirect);
            }
          }
          break;
        case "signIn":
          const signInResponse = await signInHook.signIn(
            validatedData as Extract<UserSchema, { mode: "signIn" }>
          );
          if (signInResponse) {
            toast(signInResponse);
            if (signInResponse.success && signInResponse.redirect) {
              router.push(signInResponse.redirect);
            }
          }
          break;
      }
    } catch (error) {
      // Handle any unexpected errors (not validation errors)
      console.error("Form submission error:", error);
      toast({ error: "An unexpected error occurred. Please try again." });
    }
  };

  // Handle form submission errors
  const onError = (errors: any) => {
    console.log("Form validation errors:", errors);
    // The errors will be automatically displayed by the FormMessage components
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="max-w-96 space-y-6"
      >
        {(mode === "signUp" || mode === "update") && (
          <>
            <Input control={form.control} name="name" label="Name" />
            <Input
              control={form.control}
              name="age"
              label="Age (optional)"
              type="number"
            />
          </>
        )}

        {(mode === "signUp" || mode === "signIn") && (
          <>
            <Input
              control={form.control}
              name="email"
              label="Email"
              type="email"
            />
            <Input
              control={form.control}
              name="password"
              label="Password"
              type="password"
            />
          </>
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}

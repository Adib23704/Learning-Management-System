"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { ROLE_DASHBOARD } from "@/lib/constants/routes";
import {
  type RegisterFormData,
  registerSchema,
} from "@/lib/validators/auth.schema";
import { useRegisterMutation } from "@/store/api/auth.api";
import { setCredentials } from "@/store/slices/auth.slice";

export function RegisterForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "STUDENT" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword: _, ...payload } = data;
      const result = await registerUser(payload).unwrap();
      dispatch(setCredentials(result));
      toast.success("Account created successfully!");
      router.push(ROLE_DASHBOARD[result.user.role] || "/");
    } catch (err: unknown) {
      const error = err as { data?: { error?: { message?: string } } };
      toast.error(error.data?.error?.message || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="First name"
          error={errors.firstName?.message}
          required
        >
          <Input
            placeholder="John"
            error={!!errors.firstName}
            {...register("firstName")}
          />
        </FormField>
        <FormField label="Last name" error={errors.lastName?.message} required>
          <Input
            placeholder="Doe"
            error={!!errors.lastName}
            {...register("lastName")}
          />
        </FormField>
      </div>

      <FormField label="Email" error={errors.email?.message} required>
        <Input
          type="email"
          placeholder="you@example.com"
          error={!!errors.email}
          autoComplete="email"
          {...register("email")}
        />
      </FormField>

      <FormField label="I want to" error={errors.role?.message} required>
        <div className="grid grid-cols-2 gap-3">
          {(["STUDENT", "INSTRUCTOR"] as const).map((role) => (
            <label
              key={role}
              className={`flex cursor-pointer items-center justify-center rounded-md border px-3 py-2.5 text-sm font-medium transition-colors ${
                selectedRole === role
                  ? "border-accent-500 bg-accent-50 text-accent-700"
                  : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              <input
                type="radio"
                value={role}
                className="sr-only"
                {...register("role")}
              />
              {role === "STUDENT" ? "Learn" : "Teach"}
            </label>
          ))}
        </div>
      </FormField>

      <FormField label="Password" error={errors.password?.message} required>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="At least 8 characters"
            error={!!errors.password}
            autoComplete="new-password"
            {...register("password")}
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </FormField>

      <FormField
        label="Confirm password"
        error={errors.confirmPassword?.message}
        required
      >
        <Input
          type="password"
          placeholder="Repeat your password"
          error={!!errors.confirmPassword}
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
      </FormField>

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Create account
      </Button>
    </form>
  );
}

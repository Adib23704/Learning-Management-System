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
import { type LoginFormData, loginSchema } from "@/lib/validators/auth.schema";
import { useLoginMutation } from "@/store/api/auth.api";
import { setCredentials } from "@/store/slices/auth.slice";

export function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await login(data).unwrap();
      dispatch(setCredentials(result));
      toast.success("Welcome back!");
      router.push(ROLE_DASHBOARD[result.user.role] || "/");
    } catch (err: unknown) {
      const error = err as { data?: { error?: { message?: string } } };
      toast.error(error.data?.error?.message || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Email" error={errors.email?.message} required>
        <Input
          type="email"
          placeholder="you@example.com"
          error={!!errors.email}
          autoComplete="email"
          {...register("email")}
        />
      </FormField>

      <FormField label="Password" error={errors.password?.message} required>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            error={!!errors.password}
            autoComplete="current-password"
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

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Sign in
      </Button>
    </form>
  );
}

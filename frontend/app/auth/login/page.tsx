"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/lib/store/auth.store";
import styles from "./login.module.css";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    setError("");
    try {
      console.log("Attempting to login with:", { email: values.email });
      await login(values);
      const token = localStorage.getItem("token");
      const user = useAuthStore.getState().user;
      console.log("Login result:", {
        success: true,
        hasToken: !!token,
        hasUser: !!user,
        user,
      });

      if (!token || !user) {
        throw new Error(
          "Login succeeded but no token or user data was returned"
        );
      }

      router.push("/");
      router.refresh();
    } catch (error: any) {
      console.error("Login error details:", {
        error,
        response: error.response?.data,
        status: error.response?.status,
        message: error.message,
      });

      let errorMessage = "Login failed";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.shell}>
        <aside className={styles.panelLeft} aria-hidden>
          <div className={styles.logo}>BTDS</div>
          <h1 className={styles.lead}>A calm, confident place to start.</h1>
          <p className={styles.subtle}>
            Quick access to your projects and predictions — no clutter, just
            clarity.
          </p>
          <div className={styles.accentBlob} aria-hidden />
        </aside>

        <main className={styles.panelRight}>
          <Card className={styles.card}>
            <CardHeader className={styles.cardHeader}>
              <h2 className={styles.title}>Sign in</h2>
              <p className={styles.subtitle}>
                Enter your credentials to continue
              </p>
            </CardHeader>
            <CardContent className={styles.content}>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className={styles.formRow}>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@company.com"
                            {...field}
                            disabled={isLoading}
                            className={styles.input}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className={styles.formRow}>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            disabled={isLoading}
                            className={styles.input}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className={styles.submit}
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </Form>

              <div className={styles.mutedRow}>
                <Separator className="my-4" />
              </div>

              <div className={styles.mutedRow}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "black",
                  }}
                >
                  Don&apos;t have an account?
                </p>
                <Link href="/auth/register" className={styles.link}>
                  Register
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

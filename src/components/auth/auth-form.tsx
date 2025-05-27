// src/components/auth/auth-form.tsx
"use client";

import type React from 'react';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Spinner } from '@/components/ui/loader';

const formSchemaBase = {
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
};

const signUpSchema = z.object({
  ...formSchemaBase,
  confirmPassword: z.string().min(6, { message: 'Please confirm your password.' }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ['confirmPassword'], // path of error
});

const loginSchema = z.object(formSchemaBase);

export type AuthFormData = z.infer<typeof loginSchema> & { confirmPassword?: string };

interface AuthFormProps {
  isSignUp: boolean;
  onSubmit: (data: AuthFormData) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function AuthForm({ isSignUp, onSubmit, loading, error }: AuthFormProps) {
  const currentSchema = isSignUp ? signUpSchema : loginSchema;
  const form = useForm<AuthFormData>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      email: '',
      password: '',
      ...(isSignUp && { confirmPassword: '' }),
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleFormSubmit: SubmitHandler<AuthFormData> = (data) => {
    onSubmit(data);
  };

  return (
    <Card className="w-full max-w-md shadow-xl rounded-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">
          {isSignUp ? 'Create an Account' : 'Welcome Back!'}
        </CardTitle>
        <CardDescription>
          {isSignUp ? 'Enter your details to get started.' : 'Sign in to continue to RecipeSnap.'}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Authentication Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••" 
                        {...field} 
                        disabled={loading}
                      />
                       <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-primary"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isSignUp && (
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                     <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...field}
                        disabled={loading}
                      />
                       <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-primary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={loading}
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full text-lg py-6" disabled={loading} size="lg">
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" /> 
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                isSignUp ? 'Sign Up' : 'Login'
              )}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              {isSignUp ? (
                <>
                  Already have an account?{' '}
                  <a href="/login" className="font-medium text-primary hover:underline">
                    Login
                  </a>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{' '}
                  <a href="/signup" className="font-medium text-primary hover:underline">
                    Sign Up
                  </a>
                </>
              )}
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
// src/app/signup/page.tsx
"use client";

import type React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile, type User } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import { AuthForm, type AuthFormData } from '@/components/auth/auth-form';
import { useToast } from '@/hooks/use-toast';
import { AppHeader } from '@/components/layout/app-header'; // For consistent layout
import { ChefHat } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (data: AuthFormData) => {
    setLoading(true);
    setError(null);
    try {
      if (!data.password) { // Should be caught by Zod, but good practice
        throw new Error("Password is required.");
      }
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      // You might want to set a display name or other profile info here
      // await updateProfile(userCredential.user, { displayName: "New User" });

      toast({
        title: 'Account Created!',
        description: 'Welcome to RecipeSnap! Redirecting you now...',
      });
      router.push('/'); // Redirect to home page or dashboard
    } catch (err: any) {
      console.error("Sign up error:", err);
      setError(err.message || 'Failed to create account. Please try again.');
      toast({
        title: 'Sign Up Failed',
        description: err.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="flex flex-col items-center mb-8">
          <ChefHat size={64} className="text-primary mb-4" />
          <h1 className="text-3xl font-bold text-foreground">Join RecipeSnap</h1>
        </div>
        <AuthForm
          isSignUp={true}
          onSubmit={handleSignUp}
          loading={loading}
          error={error}
        />
      </main>
       <footer className="text-center py-6 border-t border-border text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} RecipeSnap. Cook with what you have!</p>
      </footer>
    </div>
  );
}
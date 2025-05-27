// src/app/login/page.tsx
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import { AuthForm, type AuthFormData } from '@/components/auth/auth-form';
import { useToast } from '@/hooks/use-toast';
import { AppHeader } from '@/components/layout/app-header';
import { ChefHat } from 'lucide-react';
import { Spinner } from '@/components/ui/loader';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/'); // If user is already logged in, redirect to home
      } else {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [router]);


  const handleLogin = async (data: AuthFormData) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: 'Login Successful!',
        description: 'Welcome back to RecipeSnap!',
      });
      router.push('/'); // Redirect to home page
    } catch (err: any) {
      console.error("Login error:", err);
      let friendlyMessage = 'Invalid email or password. Please try again.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        friendlyMessage = 'Invalid email or password. Please check your credentials.';
      } else if (err.code === 'auth/too-many-requests') {
        friendlyMessage = 'Too many login attempts. Please try again later.';
      }
      setError(friendlyMessage);
      toast({
        title: 'Login Failed',
        description: friendlyMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (checkingAuth) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background text-foreground p-4">
        <Spinner size="xl" className="text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Checking authentication status...</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
         <div className="flex flex-col items-center mb-8">
          <ChefHat size={64} className="text-primary mb-4" />
          <h1 className="text-3xl font-bold text-foreground">Login to RecipeSnap</h1>
        </div>
        <AuthForm
          isSignUp={false}
          onSubmit={handleLogin}
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
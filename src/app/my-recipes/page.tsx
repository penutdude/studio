// src/app/my-recipes/page.tsx
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '@/firebase/firebaseConfig';
import { collection, query, where, getDocs, orderBy, type Timestamp } from 'firebase/firestore';
import { AppHeader } from '@/components/layout/app-header';
import { RecipeResults } from '@/components/recipe-snap/recipe-results';
import type { SuggestRecipesOutput } from '@/ai/flows/suggest-recipes-from-ingredients';
import { Spinner } from '@/components/ui/loader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ChefHat, History as HistoryIcon } from 'lucide-react'; // Renamed History to HistoryIcon to avoid conflict

type RecipeFromFirestore = SuggestRecipesOutput['recipes'][0] & {
  id: string;
  createdAt: Timestamp; // Firestore timestamp
  userId: string;
};

export default function MyRecipesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [recipes, setRecipes] = useState<SuggestRecipesOutput['recipes']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchRecipes(currentUser.uid);
      } else {
        router.push('/login'); // Redirect if not logged in
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchRecipes = async (uid: string) => {
    setLoading(true);
    setError(null);
    try {
      const recipesQuery = query(
        collection(db, 'userRecipes'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(recipesQuery);
      const fetchedRecipes = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Ensure the structure matches SuggestRecipesOutput['recipes'][0]
        // The recipe object itself should be stored directly
        return {
          id: doc.id,
          name: data.name,
          ingredients: data.ingredients,
          instructions: data.instructions,
          matchQuality: data.matchQuality,
          nutrients: data.nutrients,
          // We don't strictly need createdAt and userId for RecipeResults, but good to have
          createdAt: data.createdAt, 
          userId: data.userId,
        } as RecipeFromFirestore;
      });
      setRecipes(fetchedRecipes as SuggestRecipesOutput['recipes']); // Cast after mapping
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setError("Failed to load your recipes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) { // Initial auth check loading
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background text-foreground p-4">
         <div className="relative mb-6 animate-pulse">
          <ChefHat size={80} className="text-primary opacity-90" />
        </div>
        <Spinner size="xl" className="text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading your recipes...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                <HistoryIcon size={30} /> My Saved Recipes
            </h1>
        </div>

        {loading && user && (
          <div className="flex flex-col items-center justify-center p-8">
            <Spinner size="lg" />
            <p className="mt-4 text-lg text-muted-foreground">Fetching your delicious creations...</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="my-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Recipes</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && recipes.length === 0 && (
          <div className="text-center py-12">
            <HistoryIcon size={64} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">You haven&apos;t saved any recipes yet.</p>
            <p className="text-md text-muted-foreground mt-2">Go ahead and generate some from your ingredients!</p>
          </div>
        )}

        {!loading && !error && recipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RecipeResults recipes={recipes} /> 
            {/* RecipeResults expects an array of recipes, and it maps over them. 
                If RecipeResults internally uses <RecipeDisplay>, it's fine. 
                If RecipeResults *is* the display for multiple cards, we need to adjust.
                Looking at recipe-results.tsx, it maps to RecipeDisplay, so this should be okay.
                However, the grid for multiple columns should be here.
            */}
          </div>
        )}
      </main>
      <footer className="text-center py-6 border-t border-border text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} RecipeSnap. Cook with what you have!</p>
      </footer>
    </div>
  );
}

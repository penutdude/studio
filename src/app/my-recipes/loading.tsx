// src/app/my-recipes/loading.tsx
import { AppHeader } from "@/components/layout/app-header";
import { Spinner } from "@/components/ui/loader";
import { ChefHat, History } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                <History size={30} /> My Saved Recipes
            </h1>
        </div>
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="relative mb-6 animate-pulse">
            <ChefHat size={72} className="text-primary opacity-80" />
          </div>
          <Spinner size="xl" className="text-primary" />
          <p className="mt-6 text-xl font-semibold text-primary">
            Loading your recipe history...
          </p>
          <p className="mt-2 text-md text-muted-foreground">
            Just a moment while we gather your culinary masterpieces.
          </p>
        </div>
      </main>
      <footer className="text-center py-6 border-t border-border text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} RecipeSnap. Cook with what you have!</p>
      </footer>
    </div>
  );
}

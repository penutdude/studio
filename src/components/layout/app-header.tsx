
import { ChefHat } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeader() {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <ChefHat size={30} />
          <h1 className="text-xl font-bold">RecipeSnap</h1>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}

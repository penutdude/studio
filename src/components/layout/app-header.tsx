import { ChefHat } from 'lucide-react';
import Link from 'next/link';

export function AppHeader() {
  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <ChefHat size={32} />
          <h1 className="text-2xl font-bold">RecipeSnap</h1>
        </Link>
        {/* Add navigation links here if needed in the future */}
      </div>
    </header>
  );
}

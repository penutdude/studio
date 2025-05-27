import type { SuggestRecipesOutput } from "@/ai/flows/suggest-recipes-from-ingredients";
import { RecipeDisplay } from "./recipe-display";

type Recipe = SuggestRecipesOutput["recipes"][0];

interface RecipeResultsProps {
  recipes: Recipe[];
  // Optional: to control if it's a list view (default) or part of a grid
  // If part of a grid, the parent component should handle grid layout.
  // This component will just render the list of RecipeDisplay items.
}

export function RecipeResults({ recipes }: RecipeResultsProps) {
  if (!recipes || recipes.length === 0) {
    // The parent component (e.g., MyRecipesPage or main page) should handle the "no results" message.
    // This component is purely for rendering a list of recipes if they exist.
    return null; 
  }

  // Sorting is good if this component is always the final display wrapper.
  // If it's used in different contexts, sorting might be better done by the parent.
  // For now, keeping it here is fine for consistency.
  const sortedRecipes = [...recipes].sort(
    (a, b) => b.matchQuality - a.matchQuality
  );

  return (
    // If this component is directly inside a grid, it shouldn't create its own 'space-y-6'
    // as that would apply to the container of all cards, not between individual cards.
    // The parent 'my-recipes/page.tsx' uses a grid, so RecipeDisplay will be grid items.
    // The main page's right column is a single column flow, so space-y-6 is fine there.
    // For simplicity, let this component just map and render. The parent handles spacing/layout.
    <>
      {sortedRecipes.map((recipe, index) => (
        // The key should be unique, recipe.id from firestore or name-index as fallback.
        // If recipes can have duplicate names, a more robust key is needed when id is not present.
        <RecipeDisplay key={(recipe as any).id || `${recipe.name}-${index}`} recipe={recipe} />
      ))}
    </>
  );
}

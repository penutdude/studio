import type { SuggestRecipesOutput } from "@/ai/flows/suggest-recipes-from-ingredients";
import { RecipeDisplay } from "./recipe-display";

type Recipe = SuggestRecipesOutput["recipes"][0];

interface RecipeResultsProps {
  recipes: Recipe[];
}

export function RecipeResults({ recipes }: RecipeResultsProps) {
  if (!recipes || recipes.length === 0) {
    return null; // Or a message indicating no recipes found / to suggest
  }

  const sortedRecipes = [...recipes].sort(
    (a, b) => b.matchQuality - a.matchQuality
  );

  return (
    <div className="space-y-6">
      {sortedRecipes.map((recipe, index) => (
        <RecipeDisplay key={`${recipe.name}-${index}`} recipe={recipe} />
      ))}
    </div>
  );
}

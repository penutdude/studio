import type { SuggestRecipesOutput } from "@/ai/flows/suggest-recipes-from-ingredients";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ListChecks, CookingPot, Star, Activity } from "lucide-react";

type Recipe = SuggestRecipesOutput["recipes"][0];

interface RecipeDisplayProps {
  recipe: Recipe;
}

function MatchQualityBadge({ quality }: { quality: number }) {
  let variant: "default" | "secondary" | "outline" = "default";
  let text = "Good Match";
  if (quality >= 0.8) {
    variant = "default"; // Primary color
    text = "Excellent Match";
  } else if (quality >= 0.5) {
    variant = "secondary";
    text = "Good Match";
  } else {
    variant = "outline";
    text = "Okay Match";
  }

  return (
    <Badge variant={variant} className="flex items-center gap-1">
      <Star size={14} /> 
      {text} ({Math.round(quality * 100)}%)
    </Badge>
  );
}


export function RecipeDisplay({ recipe }: RecipeDisplayProps) {
  return (
    <Card className="shadow-md rounded-xl overflow-hidden_">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-xl text-primary">{recipe.name}</CardTitle>
            <MatchQualityBadge quality={recipe.matchQuality} />
        </div>
        <CardDescription>A delicious recipe suggestion based on your ingredients.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full" defaultValue="ingredients">
          <AccordionItem value="ingredients">
            <AccordionTrigger className="text-lg font-medium hover:text-accent">
                <ListChecks size={20} className="mr-2 text-accent" /> Ingredients
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <ul className="list-disc list-inside space-y-1 pl-2 text-foreground/90">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="instructions">
            <AccordionTrigger className="text-lg font-medium hover:text-accent">
                <CookingPot size={20} className="mr-2 text-accent" /> Instructions
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <ol className="list-decimal list-inside space-y-2 pl-2 text-foreground/90">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </AccordionContent>
          </AccordionItem>
          {recipe.nutrients && (
            <AccordionItem value="nutrients">
              <AccordionTrigger className="text-lg font-medium hover:text-accent">
                  <Activity size={20} className="mr-2 text-accent" /> Nutrients (per serving)
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <ul className="space-y-1 pl-2 text-foreground/90">
                  {recipe.nutrients.calories && <li><strong>Calories:</strong> {recipe.nutrients.calories}</li>}
                  {recipe.nutrients.protein && <li><strong>Protein:</strong> {recipe.nutrients.protein}</li>}
                  {recipe.nutrients.fat && <li><strong>Fat:</strong> {recipe.nutrients.fat}</li>}
                  {recipe.nutrients.carbohydrates && <li><strong>Carbohydrates:</strong> {recipe.nutrients.carbohydrates}</li>}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}

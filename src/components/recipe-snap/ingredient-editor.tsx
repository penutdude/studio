
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, PlusCircle, MinusCircle, BookOpenCheck, Sparkles } from "lucide-react";
import type React from "react";
import { Spinner } from "@/components/ui/loader";

interface IngredientEditorProps {
  identifiedIngredients: string[];
  onRemoveIdentifiedIngredient: (ingredient: string) => void;
  
  userAddedIngredients: string;
  onUserAddedIngredientsChange: (value: string) => void;
  
  excludedIngredients: string;
  onExcludedIngredientsChange: (value: string) => void;
  
  additionalInstructions: string;
  onAdditionalInstructionsChange: (value: string) => void;
  
  onSuggestRecipes: () => void;
  isSuggesting: boolean;
  disabled: boolean;
}

export function IngredientEditor({
  identifiedIngredients,
  onRemoveIdentifiedIngredient,
  userAddedIngredients,
  onUserAddedIngredientsChange,
  excludedIngredients,
  onExcludedIngredientsChange,
  additionalInstructions,
  onAdditionalInstructionsChange,
  onSuggestRecipes,
  isSuggesting,
  disabled,
}: IngredientEditorProps) {
  return (
    <Card className="shadow-lg rounded-xl transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 dark:hover:shadow-primary/10">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
            <BookOpenCheck className="text-primary" />
            Refine Ingredients & Preferences
        </CardTitle>
        <CardDescription>
          Adjust the ingredient list and add any specific instructions for your recipe.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="font-semibold mb-2 block">Identified Ingredients ({identifiedIngredients.length})</Label>
          {identifiedIngredients.length > 0 ? (
            <div className="flex flex-wrap gap-2 p-3 border border-border rounded-md bg-muted/30 dark:bg-muted/10 min-h-[40px]">
              {identifiedIngredients.map((ingredient) => (
                <Badge key={ingredient} variant="secondary" className="text-sm py-1 px-3 shadow-sm">
                  {ingredient}
                  <button
                    onClick={() => onRemoveIdentifiedIngredient(ingredient)}
                    className="ml-2 rounded-full hover:bg-destructive/20 dark:hover:bg-destructive/30 p-0.5 disabled:opacity-50"
                    aria-label={`Remove ${ingredient}`}
                    disabled={isSuggesting || disabled}
                  >
                    <X size={14} />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground p-3 border border-border rounded-md bg-muted/30 dark:bg-muted/10">No ingredients identified yet, or all have been removed.</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-added-ingredients" className="font-semibold flex items-center gap-1"><PlusCircle size={16} className="text-primary/80"/>Add Ingredients</Label>
          <Input
            id="user-added-ingredients"
            placeholder="e.g., salt, pepper, olive oil (comma-separated)"
            value={userAddedIngredients}
            onChange={(e) => onUserAddedIngredientsChange(e.target.value)}
            disabled={isSuggesting || disabled}
          />
          <p className="text-xs text-muted-foreground">Enter any ingredients missed by AI or that you want to include.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="excluded-ingredients" className="font-semibold flex items-center gap-1"><MinusCircle size={16} className="text-destructive/80" />Exclude Ingredients</Label>
          <Input
            id="excluded-ingredients"
            placeholder="e.g., nuts, dairy (comma-separated)"
            value={excludedIngredients}
            onChange={(e) => onExcludedIngredientsChange(e.target.value)}
            disabled={isSuggesting || disabled}
          />
           <p className="text-xs text-muted-foreground">List any ingredients you want to avoid.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="additional-instructions" className="font-semibold">Additional Instructions</Label>
          <Textarea
            id="additional-instructions"
            placeholder="e.g., prefer quick meals, vegetarian, spicy..."
            value={additionalInstructions}
            onChange={(e) => onAdditionalInstructionsChange(e.target.value)}
            rows={3}
            disabled={isSuggesting || disabled}
          />
        </div>

        <Button
          onClick={onSuggestRecipes}
          disabled={isSuggesting || disabled}
          className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground"
          size="lg"
        >
          {isSuggesting ? (
            <>
             <Spinner size="sm" className="mr-2" /> Suggesting Recipes...
            </>
          ) : (
            <>
            <Sparkles size={20} className="mr-2" />
            Suggest Recipes
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

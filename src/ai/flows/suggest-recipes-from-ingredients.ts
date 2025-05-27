// src/ai/flows/suggest-recipes-from-ingredients.ts
'use server';

/**
 * @fileOverview Recipe suggestion flow based on identified ingredients.
 *
 * - suggestRecipes - A function that suggests recipes based on identified ingredients.
 * - SuggestRecipesInput - The input type for the suggestRecipes function.
 * - SuggestRecipesOutput - The return type for the suggestRecipes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRecipesInputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('An array of identified ingredients from the photo.'),
  excludedIngredients: z
    .array(z.string())
    .optional()
    .describe('An array of ingredients to exclude from the recipes.'),
  additionalInstructions: z
    .string()
    .optional()
    .describe('Additional instructions from the user to include in the recipe suggestion.'),
});
export type SuggestRecipesInput = z.infer<typeof SuggestRecipesInputSchema>;

const NutrientInfoSchema = z.object({
  calories: z.string().describe('Estimated calories per serving, e.g., "350 kcal"'),
  protein: z.string().describe('Estimated protein per serving, e.g., "20g"'),
  fat: z.string().describe('Estimated fat per serving, e.g., "15g"'),
  carbohydrates: z.string().describe('Estimated carbohydrates per serving, e.g., "30g"'),
});

const SuggestRecipesOutputSchema = z.object({
  recipes: z.array(
    z.object({
      name: z.string().describe('The name of the recipe.'),
      ingredients: z.array(z.string()).describe('The ingredients required for the recipe.'),
      instructions: z.array(z.string()).describe('The step-by-step instructions for the recipe.'),
      matchQuality: z
        .number()
        .describe('A number between 0 and 1 indicating the relevancy of the recipe to the provided ingredients.'),
      nutrients: NutrientInfoSchema.describe('Estimated nutritional information per serving.'),
    })
  ).describe('An array of suggested recipes based on the identified ingredients.'),
});
export type SuggestRecipesOutput = z.infer<typeof SuggestRecipesOutputSchema>;

export async function suggestRecipes(input: SuggestRecipesInput): Promise<SuggestRecipesOutput> {
  return suggestRecipesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecipesPrompt',
  input: {schema: SuggestRecipesInputSchema},
  output: {schema: SuggestRecipesOutputSchema},
  prompt: `You are a world-class chef specializing in creating recipes based on a given list of ingredients. The user will provide a list of ingredients they have on hand, and you will generate a list of recipes that can be made using those ingredients.

Ingredients: {{ingredients}}

{{#if excludedIngredients}}
Excluded Ingredients: {{excludedIngredients}}
{{/if}}

{{#if additionalInstructions}}
Additional Instructions: {{additionalInstructions}}
{{/if}}

Generate recipes that utilize as many of the provided ingredients as possible, and provide a matchQuality score between 0 and 1, where 1 means the recipe uses all of the ingredients and 0 means the recipe is not a good fit.

Each recipe should include a name, a list of ingredients, step-by-step instructions, and estimated nutritional information (calories, protein, fat, carbohydrates per serving). Provide specific values for nutrients, for example, "350 kcal" for calories.
`,
});

const suggestRecipesFlow = ai.defineFlow(
  {
    name: 'suggestRecipesFlow',
    inputSchema: SuggestRecipesInputSchema,
    outputSchema: SuggestRecipesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

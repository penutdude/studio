
"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { ImageUploader } from "@/components/recipe-snap/image-uploader";
import { IngredientEditor } from "@/components/recipe-snap/ingredient-editor";
import { RecipeResults } from "@/components/recipe-snap/recipe-results";
import { RecipeDisplay } from "@/components/recipe-snap/recipe-display"; // Import RecipeDisplay
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/loader";
import { identifyIngredientsFromPhoto, type IdentifyIngredientsFromPhotoOutput } from "@/ai/flows/identify-ingredients-from-photo";
import { suggestRecipes, type SuggestRecipesInput, type SuggestRecipesOutput } from "@/ai/flows/suggest-recipes-from-ingredients";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Salad, ChefHat, Star } from "lucide-react"; // Added Star
import { auth, db } from "@/firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import type { User } from "firebase/auth";

const parseCsvToArray = (csvString: string): string[] => {
  if (!csvString.trim()) return [];
  return csvString.split(',').map(item => item.trim()).filter(item => item.length > 0);
};

export default function RecipeSnapPage() {
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [isLoadingIdentification, setIsLoadingIdentification] = useState(false);
  const [identificationError, setIdentificationError] = useState<string | null>(null);

  const [editableIngredients, setEditableIngredients] = useState<string[]>([]);
  const [userAddedIngredients, setUserAddedIngredients] = useState<string>("");
  const [excludedIngredients, setExcludedIngredients] = useState<string>("");
  const [additionalInstructions, setAdditionalInstructions] = useState<string>("");

  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);
  const [suggestedRecipes, setSuggestedRecipes] = useState<SuggestRecipesOutput['recipes']>([]);
  
  const [isClient, setIsClient] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setIsClient(true);
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);


  const { toast } = useToast();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageDataUri(e.target?.result as string);
        // Reset subsequent states
        setEditableIngredients([]);
        setSuggestedRecipes([]);
        setIdentificationError(null);
        setRecipeError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdentifyIngredients = async () => {
    if (!imageDataUri) {
      setIdentificationError("Please upload an image first.");
      toast({ title: "Error", description: "Please upload an image first.", variant: "destructive" });
      return;
    }
    setIsLoadingIdentification(true);
    setIdentificationError(null);
    setEditableIngredients([]); // Clear previous identified ingredients

    try {
      const result: IdentifyIngredientsFromPhotoOutput = await identifyIngredientsFromPhoto({ photoDataUri: imageDataUri });
      if (result.ingredients && result.ingredients.length > 0) {
        setEditableIngredients(result.ingredients);
        toast({ title: "Success!", description: `Identified ${result.ingredients.length} ingredients.` });
      } else {
        setIdentificationError("No ingredients could be identified from the image.");
        toast({ title: "Hmm...", description: "No ingredients could be identified from the image.", variant: "default" });
      }
    } catch (error) {
      console.error("Error identifying ingredients:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during ingredient identification.";
      setIdentificationError(errorMessage);
      toast({ title: "Identification Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoadingIdentification(false);
    }
  };

  const handleRemoveIdentifiedIngredient = (ingredientToRemove: string) => {
    setEditableIngredients(prev => prev.filter(ing => ing !== ingredientToRemove));
  };

  const saveRecipesToHistory = async (recipesToSave: SuggestRecipesOutput['recipes']) => {
    if (!currentUser) return;

    const recipesCollectionRef = collection(db, "userRecipes");
    try {
      for (const recipe of recipesToSave) {
        await addDoc(recipesCollectionRef, {
          userId: currentUser.uid,
          userEmail: currentUser.email, // Optional: for easier debugging in Firestore
          createdAt: serverTimestamp(),
          ...recipe, // Spread the recipe object
        });
      }
      toast({ title: "Recipes Saved!", description: "Your new recipes have been saved to your history."});
    } catch (error) {
      console.error("Error saving recipes to history:", error);
      toast({ title: "Save Failed", description: "Could not save recipes to your history.", variant: "destructive"});
    }
  };

  const handleSuggestRecipes = async () => {
    setIsLoadingRecipes(true);
    setRecipeError(null);
    setSuggestedRecipes([]);

    const finalUserAdded = parseCsvToArray(userAddedIngredients);
    const allIngredients = Array.from(new Set([...editableIngredients, ...finalUserAdded]));

    if (allIngredients.length === 0) {
      setRecipeError("Please add some ingredients to get recipe suggestions.");
      toast({ title: "No Ingredients", description: "Please add or identify some ingredients first.", variant: "destructive"});
      setIsLoadingRecipes(false);
      return;
    }

    const recipeInput: SuggestRecipesInput = {
      ingredients: allIngredients,
      excludedIngredients: parseCsvToArray(excludedIngredients),
      additionalInstructions: additionalInstructions.trim(),
    };

    try {
      const result: SuggestRecipesOutput = await suggestRecipes(recipeInput);
      if (result.recipes && result.recipes.length > 0) {
        setSuggestedRecipes(result.recipes);
        toast({ title: "Recipes Found!", description: `Found ${result.recipes.length} recipe suggestions.`});
        if (currentUser) {
          await saveRecipesToHistory(result.recipes);
        } else {
          toast({ title: "Login to Save", description: "Log in or sign up to save your recipe history!", variant: "default"});
        }
      } else {
        setRecipeError("No recipes found matching your criteria. Try adjusting ingredients or instructions.");
        toast({ title: "No Recipes", description: "Could not find any recipes. Try different ingredients?"});
      }
    } catch (error) {
      console.error("Error suggesting recipes:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while suggesting recipes.";
      setRecipeError(errorMessage);
      toast({ title: "Recipe Suggestion Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoadingRecipes(false);
    }
  };
  
  const topRecipe = useMemo(() => {
    if (suggestedRecipes && suggestedRecipes.length > 0) {
      // Create a mutable copy before sorting
      return [...suggestedRecipes].sort((a, b) => b.matchQuality - a.matchQuality)[0];
    }
    return null;
  }, [suggestedRecipes]);

  if (!isClient) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background text-foreground transition-colors duration-300 p-4">
        <div className="relative mb-6 animate-pulse">
          <ChefHat size={80} className="text-primary opacity-90" />
        </div>
        <Spinner size="xl" className="text-primary" />
        <p className="mt-6 text-2xl font-semibold text-primary text-center">Loading RecipeSnap</p>
        <p className="mt-2 text-md text-muted-foreground text-center">Whipping up something delicious...</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Uploader and Editor */}
          <section className="space-y-6">
            <ImageUploader
              onImageChange={handleImageChange}
              onIdentifyClick={handleIdentifyIngredients}
              isIdentifying={isLoadingIdentification}
              imageDataUri={imageDataUri}
              disabled={isLoadingRecipes}
            />
            {identificationError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Identification Error</AlertTitle>
                <AlertDescription>{identificationError}</AlertDescription>
              </Alert>
            )}
            {(editableIngredients.length > 0 || isLoadingIdentification || userAddedIngredients || excludedIngredients || additionalInstructions || imageDataUri) && !identificationError && (
              <IngredientEditor
                identifiedIngredients={editableIngredients}
                onRemoveIdentifiedIngredient={handleRemoveIdentifiedIngredient}
                userAddedIngredients={userAddedIngredients}
                onUserAddedIngredientsChange={setUserAddedIngredients}
                excludedIngredients={excludedIngredients}
                onExcludedIngredientsChange={setExcludedIngredients}
                additionalInstructions={additionalInstructions}
                onAdditionalInstructionsChange={setAdditionalInstructions}
                onSuggestRecipes={handleSuggestRecipes}
                isSuggesting={isLoadingRecipes}
                disabled={isLoadingIdentification || !imageDataUri && editableIngredients.length === 0 && userAddedIngredients.length === 0}
              />
            )}
          </section>

          {/* Right Column: Recipe Results */}
          <section className="space-y-6 lg:sticky lg:top-24"> {/* Adjusted sticky top due to sticky header */}
            <h2 className="text-3xl font-bold text-primary flex items-center gap-2">
              <Salad size={30} />
              Recipe Suggestions
            </h2>
            {isLoadingRecipes && (
              <div className="flex flex-col items-center justify-center p-8 bg-card rounded-xl shadow-lg">
                <Spinner size="lg" />
                <p className="mt-4 text-lg text-muted-foreground">Finding delicious recipes...</p>
              </div>
            )}
            {recipeError && !isLoadingRecipes && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Recipe Error</AlertTitle>
                <AlertDescription>{recipeError}</AlertDescription>
              </Alert>
            )}
            {!isLoadingRecipes && suggestedRecipes.length === 0 && !recipeError && (
              <div className="p-8 text-center bg-card rounded-xl shadow-lg">
                <Salad size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">
                  {imageDataUri || editableIngredients.length > 0 || userAddedIngredients ? "Refine your ingredients and click 'Suggest Recipes'!" : "Upload an image and identify ingredients to see recipe suggestions here."}
                </p>
              </div>
            )}
            {!isLoadingRecipes && suggestedRecipes.length > 0 && (
              <div className="space-y-6"> {/* Wrapper for RecipeResults and Featured Recipe */}
                <RecipeResults recipes={suggestedRecipes} />
                {topRecipe && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <h3 className="text-2xl font-semibold text-accent mb-4 flex items-center gap-2">
                      <Star size={26} className="text-accent" />
                      Featured Recipe
                    </h3>
                    <RecipeDisplay recipe={topRecipe} />
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
      <footer className="text-center py-6 border-t border-border text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} RecipeSnap. Cook with what you have!</p>
      </footer>
    </div>
  );
}



"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import type React from "react";
import { Spinner } from "@/components/ui/loader";

interface ImageUploaderProps {
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onIdentifyClick: () => void;
  isIdentifying: boolean;
  imageDataUri: string | null;
  disabled: boolean;
}

export function ImageUploader({
  onImageChange,
  onIdentifyClick,
  isIdentifying,
  imageDataUri,
  disabled,
}: ImageUploaderProps) {
  return (
    <Card className="shadow-lg rounded-xl transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 dark:hover:shadow-primary/10">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <UploadCloud className="text-primary" />
          Upload Your Ingredients
        </CardTitle>
        <CardDescription>
          Take a photo of your ingredients, upload it, and let AI find recipes for you!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ingredient-photo" className="font-semibold">Ingredient Photo</Label>
          <Input
            id="ingredient-photo"
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="file:text-primary file:font-semibold hover:file:bg-accent/20 cursor-pointer"
            disabled={isIdentifying || disabled}
          />
        </div>

        {imageDataUri && (
          <div className="mt-4 border border-border rounded-lg p-2 bg-muted/20 dark:bg-muted/10 shadow-inner">
            <Image
              src={imageDataUri}
              alt="Uploaded ingredients"
              width={400}
              height={300}
              className="rounded-md object-contain max-h-72 w-full"
              data-ai-hint="food ingredients"
            />
          </div>
        )}
        {!imageDataUri && (
           <div className="mt-4 border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center h-56 bg-muted/30 dark:bg-muted/10">
            <ImageIcon size={48} className="text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-center">Image preview will appear here</p>
          </div>
        )}

        <Button
          onClick={onIdentifyClick}
          disabled={!imageDataUri || isIdentifying || disabled}
          className="w-full text-lg py-6"
          size="lg"
        >
          {isIdentifying ? (
            <>
              <Spinner size="sm" className="mr-2" /> Identifying...
            </>
          ) : (
            "Identify Ingredients"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

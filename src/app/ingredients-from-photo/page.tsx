"use client";

import { useState } from 'react';

export default function IngredientsFromPhoto() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setError(null); // Clear previous errors
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError(null);
    setIngredients([]); // Clear previous results

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/identify-ingredients', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setIngredients(data.ingredients || []);
    } catch (err) {
      setError("An error occurred while processing the image.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Identify Ingredients from Photo</h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mb-2"
        /> {selectedFile && <span className="ml-2">{selectedFile.name}</span>}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          disabled={!selectedFile || loading}
        >
          {loading ? 'Identifying...' : 'Identify Ingredients'}
        </button>
      </form>

      {selectedFile && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Selected Image Preview</h2>
          <img
            src={URL.createObjectURL(selectedFile)}
            alt="Selected"
            className="max-w-sm h-auto rounded"
          />
        </div>
      )}

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {ingredients.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Identified Ingredients</h2>
          <ul>
            {ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

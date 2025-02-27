import React, { useEffect, useState } from 'react';
import Util from '../../../Util.js';

const RecipePicker = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                setLoading(true);
                const response = await Util.callBackend('getRecipes');
                setRecipes(response);
                setError(null);
            } catch (error) {
                console.error('Failed to fetch recipes:', error);
                setError('Failed to load recipes. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, []);

    const handleRecipeClick = (recipe) => {
        setSelectedRecipe(recipe);
    };

    const closeModal = () => {
        setSelectedRecipe(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-xl font-semibold text-gray-600">Loading recipes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-xl font-semibold text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Recipe Gallery</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {recipes.map((recipe, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
                        onClick={() => handleRecipeClick(recipe)}
                    >
                        <div className="h-64 overflow-hidden">
                            <img
                                src={recipe.photo}
                                alt={recipe.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold text-xl mb-2">{recipe.name}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for selected recipe */}
            {selectedRecipe && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full overflow-hidden">
                        <div className="h-96 overflow-hidden">
                            <img
                                src={selectedRecipe.photo}
                                alt={selectedRecipe.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-4">{selectedRecipe.name}</h2>
                            <div className="mb-4">
                                <p className="text-gray-700">{selectedRecipe.data}</p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="mt-4 bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecipePicker;
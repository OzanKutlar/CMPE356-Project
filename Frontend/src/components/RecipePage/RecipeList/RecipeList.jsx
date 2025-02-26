import React, { useEffect, useState } from 'react';
import Util from '../../../Util.js';

const RecipePicker = () => {
    const [recipes, setRecipes] = useState([]);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await Util.callBackend('getRecipes');
                setRecipes(response);
            } catch (error) {
                console.error('Failed to fetch recipes:', error);
            }
        };

        fetchRecipes();
    }, []);

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Recipes</h1>
            <ul className="list-none p-0 space-y-4">
                {recipes.map((recipe, index) => (
                    <li key={index} className="border border-gray-300 rounded-lg p-6 shadow-md">
                        <h2 className="text-xl font-semibold mb-2">{recipe.name}</h2>
                        <img
                            src={recipe.photo}
                            alt={recipe.name}
                            className="max-w-full h-auto rounded-lg"
                        />
                        <p className="mt-4 text-justify leading-relaxed">{recipe.data}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RecipePicker;
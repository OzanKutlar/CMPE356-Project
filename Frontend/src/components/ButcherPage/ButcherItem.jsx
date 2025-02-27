import React, { useState } from 'react';
import Util from '../../../Util.js';

const ButcherItemSelector = () => {
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({ name: '', photoLink: '', pricePerKg: '', budget: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({ ...prevState, [name]: value }));
    };

    const addItem = () => {
        if (!formData.name || !formData.photoLink || !formData.pricePerKg || !formData.budget) return;
        setItems((prevItems) => [...prevItems, formData]);
        setFormData({ name: '', photoLink: '', pricePerKg: '', budget: '' });
    };

    const handleSubmit = async () => {
        try {
            await Util.callBackend("saveButcher", items);
            alert("Items saved successfully!");
        } catch (error) {
            console.error("Error saving items:", error);
            alert("Failed to save items. Please try again.");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 flex">
            <div className="w-1/2 pr-4">
                <h1 className="text-2xl font-bold mb-6 text-center">Add Your Items</h1>

                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="photoLink" className="block text-sm font-medium text-gray-700">Photo Link:</label>
                    <input
                        type="text"
                        id="photoLink"
                        name="photoLink"
                        value={formData.photoLink}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="pricePerKg" className="block text-sm font-medium text-gray-700">Price per Kg:</label>
                    <input
                        type="text"
                        id="pricePerKg"
                        name="pricePerKg"
                        value={formData.pricePerKg}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700">Budget:</label>
                    <input
                        type="text"
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>

                <button onClick={addItem} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Add Item
                </button>
            </div>

            <div className="w-1/2 pl-4 border-l-2 border-gray-300">
                <h2 className="text-xl font-bold mb-6 text-center">Added Items</h2>

                {items.map((item, index) => (
                    <div key={index} className="border p-4 mb-4 shadow-sm rounded bg-gray-100 flex items-center justify-between">
                        <div>
                            <p><strong>Name:</strong> {item.name}</p>
                            <img src={item.photoLink} alt={item.name} className="mt-2 w-32 h-auto" />
                            <p><strong>Price per Kg:</strong> ${item.pricePerKg}</p>
                            <p><strong>Budget:</strong> ${item.budget}</p>
                        </div>
                    </div>
                ))}

                <button onClick={handleSubmit} className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full">
                    Submit
                </button>
            </div>
        </div>
    );
};

export default ButcherItemSelector;
import React, {useState} from 'react';
import Util from "../../Util.js";

const ButcherItemSelector = () => {
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({name: '', photoLink: '', pricePerKg: '', stock: ''});

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prevState) => ({...prevState, [name]: value}));
    };

    const addItem = () => {
        if (!formData.name || !formData.photoLink || !formData.pricePerKg || !formData.stock) return;
        setItems((prevItems) => [...prevItems, formData]);
        setFormData({name: '', photoLink: '', pricePerKg: '', stock: ''});
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
        <div className="container mx-auto px-6 py-10 flex flex-col md:flex-row-reverse gap-8">
            <div className="w-full md:w-1/3">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Add Item</h1>
                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
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
                        className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="pricePerKg" className="block text-sm font-medium text-gray-700">Price per
                        Kg:</label>
                    <input
                        type="text"
                        id="pricePerKg"
                        name="pricePerKg"
                        value={formData.pricePerKg}
                        onChange={handleChange}
                        className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700">stock:</label>
                    <input
                        type="text"
                        id="stock"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                    />
                </div>
                <button onClick={addItem}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Add Item
                </button>
            </div>

            <div className="w-full md:w-2/3">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Added Items</h2>
                {items.map((item, index) => (
                    <div key={index}
                         className="border border-gray-300 p-4 mb-4 shadow-md rounded bg-white flex flex-col items-center">
                        <img src={item.photoLink} alt={item.name} className="w-48 h-auto rounded-md mb-4"/>
                        <div className="text-center">
                            <p className="text-gray-800 font-bold text-lg">{item.name}</p>
                            <p className="text-green-800">
                                <span className="text-green-500">$</span>{item.pricePerKg}
                            </p>
                            <p className="text-gray-800">{item.stock + ' left stock'}</p>
                        </div>
                    </div>
                ))}
                <button onClick={handleSubmit}
                        className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full">
                    Submit
                </button>
            </div>
        </div>
    );
};

export default ButcherItemSelector;
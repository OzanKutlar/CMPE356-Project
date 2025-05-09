import React, { useState, useEffect, useRef } from 'react';
import './LoginPopup.css';
import Util from "../../../Util.js";

const AddProductPopup = ({ setShowPopUp, onProductAdded }) => {
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [initialStock, setInitialStock] = useState('');
    const [fadeIn, setFadeIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [fileName, setFileName] = useState(''); // To store the actual filename returned from server
    const [buttonHover, setButtonHover] = useState(false);
    
    // Category filter states
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedAnimalType, setSelectedAnimalType] = useState('');
    const [selectedCutType, setSelectedCutType] = useState('');
    const [selectedPreservation, setSelectedPreservation] = useState('');
    
    // Dropdown states
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownRefs = useRef({});

    const filters = [
        {
            name: 'Category',
            options: ['Meat', 'Organ Meat', 'Processed Meat'],
            setter: setSelectedCategory,
            value: selectedCategory,
            required: true
        },
        {
            name: 'Animal Type',
            options: ['Chicken', 'Cow/Beef', 'Duck', 'Goat', 'Lamb'],
            setter: setSelectedAnimalType,
            value: selectedAnimalType,
            required: false
        },
        {
            name: 'Cut Type',
            options: ['Cut', 'Fillet', 'Minced', 'Whole'],
            setter: setSelectedCutType,
            value: selectedCutType,
            required: false
        },
        {
            name: 'Preservation Method',
            options: ['Dry Aged', 'Fresh', 'Frozen', 'Salted', 'Smoked'],
            setter: setSelectedPreservation,
            value: selectedPreservation,
            required: false
        }
    ];

    useEffect(() => {
        const timeout = setTimeout(() => setFadeIn(true), 50);
        return () => {
            clearTimeout(timeout);
            setFadeIn(false);
        };
    }, []);

    // Handle dropdown visibility
    useEffect(() => {
        if (openDropdown) {
            const handleClickOutside = (event) => {
                if (dropdownRefs.current[openDropdown] && !dropdownRefs.current[openDropdown].contains(event.target)) {
                    setOpenDropdown(null);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [openDropdown]);

    const toggleDropdown = (dropdownName) => {
        setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
    };

    const handleOptionClick = (filterName, option, setter) => {
        setter(option);
        setOpenDropdown(null);
    };

    const handleProductNameChange = (e) => {
        setProductName(e.target.value);
    };

    const handleProductPriceChange = (e) => {
        const value = e.target.value;
        // Only allow valid decimal numbers with up to 2 decimal places
        if (/^\d*\.?\d*$/.test(value)) {
            // Enforce maximum length and decimal places
            if (value.includes('.')) {
                const parts = value.split('.');
                // Check if whole part is too long (max 8 digits for decimal(10,2))
                if (parts[0].length > 8) return;
                // Check if decimal part has more than 2 digits
                if (parts[1].length > 2) return;
            } else {
                // Check if whole number is too long (max 8 digits for decimal(10,2))
                if (value.length > 8) return;
            }
            
            // Check if the value is within the range for decimal(10,2)
            const numValue = parseFloat(value);
            if (!value || value === '.' || numValue <= 99999999.99) {
                setProductPrice(value);
            }
        }
    };

    const handleInitialStockChange = (e) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) { // Allow decimal for kg
            setInitialStock(value);
        }
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();

            // Create a local preview immediately
            const localPreviewUrl = URL.createObjectURL(file);
            setImagePreview(localPreviewUrl);

            reader.onloadend = async () => {
                try {
                    const base64Data = reader.result.split(',')[1];
                    const fileType = file.name.split('.').pop();
                    const userID = Util.savedUser.id;

                    console.log("Uploading image file type:", fileType);

                    const data = await Util.callBackend("image/upload", {}, {
                        userID: userID,
                        pictureData: base64Data,
                        fileName: fileType
                    });
                    
                    if (data.msg === "success") {
                        console.log("Image uploaded successfully. Filename:", data.url);
                        // Save the filename returned from server
                        setFileName(data.url);
                        // Store backend URL for submission
                        setImageFile(data.url);
                    } else {
                        console.error("Upload failed:", data.message);
                        setErrorMessage("Failed to upload image: " + data.message);
                    }
                } catch (error) {
                    console.error("Error uploading image:", error);
                    setErrorMessage("Error uploading image. Please try again.");
                }
            };

            reader.onerror = () => {
                console.error("Error reading file");
                setErrorMessage("Error reading file. Please try again.");
            };

            reader.readAsDataURL(file);
        }
    };

    const handleAddProduct = async () => {
        // Clear any previous errors
        setErrorMessage('');

        // Validation for all required fields
        if (!productName.trim()) {
            setErrorMessage('Please enter a product name');
            return;
        }

        if (!productPrice || parseFloat(productPrice) <= 0) {
            setErrorMessage('Please enter a valid price');
            return;
        }

        if (!initialStock || parseFloat(initialStock) <= 0) {
            setErrorMessage('Please enter a valid initial stock');
            return;
        }

        if (!imageFile) {
            setErrorMessage('Please upload a product image');
            return;
        }
        
        if (!selectedCategory) {
            setErrorMessage('Please select a product category');
            return;
        }

        try {
            setIsLoading(true);
            
            // Create category string in format "Category,Animal Type,Cut Type,Preservation Method"
            // Skip optional values if not selected
            let categoryString = selectedCategory;
            if (selectedAnimalType) categoryString += `,${selectedAnimalType}`;
            if (selectedCutType) categoryString += `,${selectedCutType}`;
            if (selectedPreservation) categoryString += `,${selectedPreservation}`;

            // Convert kg to grams (multiply by 1000)
            const stockInGrams = Math.round(parseFloat(initialStock) * 1000);
            
            // Ensure price is properly formatted to avoid DB decimal(10,2) issues
            // Convert to number, limit to 2 decimal places, then to string to avoid scientific notation
            const cleanPrice = Number(parseFloat(productPrice).toFixed(2));
            
            console.log("Formatted price:", cleanPrice, "Type:", typeof cleanPrice);

            // Create a new product object
            const newProduct = {
                ItemName: productName,
                ItemPrice: cleanPrice, // Use the properly formatted price
                currentStock: stockInGrams,
                startStock: stockInGrams,
                soldStock: 0,
                ItemPhotoLink: imageFile,
                category: categoryString
            };

            console.log("Adding product with the following data:");
            console.log("Product Name:", productName);
            console.log("Price:", cleanPrice, "Type:", typeof cleanPrice);
            console.log("Initial Stock (kg):", initialStock);
            console.log("Initial Stock (grams):", stockInGrams);
            console.log("Image file:", imageFile);
            console.log("Category String:", categoryString);

            // Send data to backend
            const response = await Util.callBackend("butcher/addItem", {
                userID: Util.savedUser.id
            }, newProduct);

            console.log("Server response:", response);

            // Add the new product to the list
            if (onProductAdded) {
                onProductAdded(response.product || newProduct);
            }

            // Close the popup
            setShowPopUp(false);

        } catch (error) {
            setErrorMessage(error.message || 'An error occurred. Please try again.');
            console.error('Error adding product:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setShowPopUp(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            {/* Modal Content */}
            <div 
                className={`w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden transform transition-all duration-300 ${
                    fadeIn ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
                    <h2 className="text-xl font-bold text-white">Add New Product</h2>
                </div>
                
                <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Column - Product Details */}
                        <div className="flex-1 space-y-5">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Product Image <span className="text-amber-500">*</span>
                                </label>
                                <div 
                                    className="relative border-2 border-dashed rounded-lg overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors min-h-[200px] cursor-pointer"
                                    onClick={() => document.getElementById('product-image-input').click()}
                                >
                                    {imagePreview ? (
                                        <div className="relative group">
                                            <img
                                                src={imagePreview}
                                                alt="Product Preview"
                                                className="w-full h-56 object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all">
                                                <div className="px-4 py-2 bg-white bg-opacity-90 rounded-md shadow-sm cursor-pointer transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                                                    Change Image
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-56">
                                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                            </svg>
                                            <p className="mt-2 text-sm text-gray-500">Click to upload product image</p>
                                        </div>
                                    )}
                                    <input
                                        id="product-image-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Product Name <span className="text-amber-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter product name"
                                    value={productName}
                                    onChange={handleProductNameChange}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Price per kg ($) <span className="text-amber-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500">$</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="0.00"
                                        value={productPrice}
                                        onChange={handleProductPriceChange}
                                        className="w-full p-3 pl-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Initial Stock (kg) <span className="text-amber-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="0.00"
                                        value={initialStock}
                                        onChange={handleInitialStockChange}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                        disabled={isLoading}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500">kg</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Categories */}
                        <div className="flex-1 space-y-5">
                            <h3 className="font-medium text-gray-800 mb-4">Product Classification</h3>
                            
                            {filters.map((filter) => (
                                <div key={filter.name} className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {filter.name} {filter.required && <span className="text-amber-500">*</span>}
                                    </label>
                                    <div className="relative" ref={(el) => dropdownRefs.current[filter.name] = el}>
                                        <button
                                            type="button"
                                            onClick={() => toggleDropdown(filter.name)}
                                            className={`w-full text-left flex items-center justify-between p-3 border rounded-md transition-colors ${
                                                filter.value
                                                    ? 'border-green-300 bg-green-50'
                                                    : 'border-gray-300 bg-white hover:bg-gray-50'
                                            } ${filter.required && !filter.value ? 'border-amber-300' : ''}`}
                                        >
                                            <span className={filter.value ? 'text-gray-900' : 'text-gray-500'}>
                                                {filter.value || `Select ${filter.name}`}
                                            </span>
                                            <svg 
                                                className={`h-5 w-5 text-gray-400 transition-transform ${openDropdown === filter.name ? 'transform rotate-180' : ''}`}
                                                xmlns="http://www.w3.org/2000/svg" 
                                                viewBox="0 0 20 20" 
                                                fill="currentColor"
                                            >
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>

                                        {/* Dropdown menu */}
                                        {openDropdown === filter.name && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                <ul className="py-1">
                                                    {filter.options.map((option) => (
                                                        <li
                                                            key={option}
                                                            className={`px-4 py-2.5 cursor-pointer hover:bg-gray-100 ${
                                                                filter.value === option ? 'bg-green-50 text-green-800 font-medium' : ''
                                                            }`}
                                                            onClick={() => handleOptionClick(filter.name, option, filter.setter)}
                                                        >
                                                            {option}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700">
                            {errorMessage}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleAddProduct}
                            onMouseEnter={() => setButtonHover(true)}
                            onMouseLeave={() => setButtonHover(false)}
                            className={`flex-1 px-5 py-3 rounded font-medium text-white transition-colors ${
                                isLoading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : buttonHover
                                        ? 'bg-amber-700'
                                        : 'bg-amber-600 hover:bg-amber-700'
                            }`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Adding...
                                </span>
                            ) : 'Add Product'}
                        </button>

                        <button
                            onClick={handleCancel}
                            className="flex-1 px-5 py-3 rounded font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddProductPopup;
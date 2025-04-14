import React, { useState, useEffect } from 'react';
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
    const [fileName, setFileName] = useState('');
    const [buttonColor, setButtonColor] = useState('#007bff');
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setFadeIn(true), 50);
        return () => {
            clearTimeout(timeout);
            setFadeIn(false);
        };
    }, []);

    const handleProductNameChange = (e) => {
        setProductName(e.target.value);
    };

    const handleProductPriceChange = (e) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) { // Only allow numbers and decimal point
            setProductPrice(value);
        }
    };

    const handleInitialStockChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) { // Only allow numbers
            setInitialStock(value);
        }
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                setImageFile(URL.createObjectURL(file));

                const base64Data = reader.result.split(',')[1];

                const fileType = file.name.split('.').pop();

                const userID = Util.savedUser.id

                // Make the upload request
                fetch(Util.backendIp + '/image/upload', {
                    method: 'POST', // Changed to POST to send data in body
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userID: userID,
                        pictureData: base64Data,
                        fileName: fileType
                    })
                }).then(response => response.json()).then(data => {
                    if (data.msg === "success") {
                        // setImageFile(Util.getImageFromBackend(data.url.substring(8)));
                        console.log("Image uploaded successfully:", data.url);
                    } else {
                        console.error(data.message);
                    }
                })
                    .catch(error => {
                        console.error("Error uploading image:", error);
                    });
            };

            reader.readAsDataURL(file);
        }
    };

    const handleAddProduct = async () => {
        // Clear any previous errors
        setErrorMessage('');

        // Validation
        if (!productName.trim()) {
            setErrorMessage('Please enter a product name');
            return;
        }

        if (!productPrice || parseFloat(productPrice) <= 0) {
            setErrorMessage('Please enter a valid price');
            return;
        }

        if (!initialStock || parseInt(initialStock) < 0) {
            setErrorMessage('Please enter a valid initial stock');
            return;
        }

        if (!imageFile) {
            setErrorMessage('Please upload a product image');
            return;
        }

        try {
            setIsLoading(true);

            const imageUrl = imageFile;

            // Create a new product object
            const newProduct = {
                ItemName: productName,
                ItemPrice: parseFloat(productPrice),
                currentStock: parseInt(initialStock),
                startStock: parseInt(initialStock),
                soldStock: 0,
                ItemPhotoLink: imageUrl
            };


            const response = await Util.callBackend()

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
        <div className="login-popup-wrapper">
            {/* Background Overlay */}
            <div className="login-overlay" onClick={handleCancel}></div>

            {/* Popup */}
            <div className={`login-popup ${fadeIn ? 'show' : ''}`}>
                <h2 className="text-2xl font-bold mb-4">Add New Product</h2>

                <p className="mb-4">Please fill in the product details below.</p>

                {/* Image upload section */}
                <div className="mb-4 border rounded overflow-hidden">
                    <div className="relative">
                        {imageFile ? (
                            <div>
                                <img
                                    src={imageFile}
                                    alt="Product Preview"
                                    className="w-full h-48 object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                                <span className="text-gray-400">Product Image</span>
                            </div>

                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />

                    </div>

                </div>

                {/* Product details */}
                <input
                    type="text"
                    placeholder="Product Name"
                    value={productName}
                    onChange={handleProductNameChange}
                    className="w-full p-3 mb-4 border rounded"
                    disabled={isLoading}
                />

                <input
                    type="text"
                    placeholder="Price per kg (e.g. 12.99)"
                    value={productPrice}
                    onChange={handleProductPriceChange}
                    className="w-full p-3 mb-4 border rounded"
                    disabled={isLoading}
                />

                <input
                    type="text"
                    placeholder="Initial Stock (in kg)"
                    value={initialStock}
                    onChange={handleInitialStockChange}
                    className="w-full p-3 mb-4 border rounded"
                    disabled={isLoading}
                />

                {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

                <button
                    onClick={handleAddProduct}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{backgroundColor: isHovered ? '#0056b3' : buttonColor}}
                    className="w-full px-5 py-3 rounded text-white text-lg cursor-pointer transition-colors duration-300"
                    disabled={isLoading}
                >
                    {isLoading ? 'Adding...' : 'Add Product'}
                </button>

                <button
                    onClick={handleCancel}
                    className="w-full mt-2 px-5 py-3 rounded text-gray-700 text-lg cursor-pointer transition-colors duration-300 border"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default AddProductPopup;
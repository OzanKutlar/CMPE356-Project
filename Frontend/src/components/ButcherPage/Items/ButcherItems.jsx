import React, {useEffect, useState} from "react";
import Util from "../../../Util.js";
import useMobileDetection from "../../../mobileDetection.js";
import AddProductPopup from "../../Global/PopUps/AddProductsPopup.jsx";

const BestSellerListFullScreen = () => {
    const [bestSellers, setBestSellers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const isMobile = useMobileDetection();
    const [purchasing, setPurchasing] = useState(false);
    const [purchaseMessage, setPurchaseMessage] = useState(null);
    const [isClosing, setIsClosing] = useState(false);
    const [quantity, setQuantity] = useState(false);
    const [showAddProductPopup, setShowAddProductPopup] = useState(false);

    const closeModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            setSelectedItem(null);
        }, 300); // Match this with your animation duration (0.3s = 300ms)
    };

    const countToKG = 1;
    const multiplier = 1000 / countToKG;
    const buttonAdd = (100 / countToKG);

    const handlePurchase = async () => {

        setPurchasing(true);
        setPurchaseMessage(null);

        selectedItem.startStock += quantity - selectedItem.currentStock;
        selectedItem.currentStock = quantity;

        try {
            // Call the backend with the purchase endpoint and headers
            const headers = {
                userID: Util.savedUser.id,
                itemID: selectedItem.id,
                amount: quantity
            };

            await Util.callBackend("butcher/updateStock", headers);
            let unit = "";
            let amount = quantity * countToKG;
            if (amount < 1000) unit = "gs"
            else if (amount == 1000) unit = "kg"
            else unit = "kgs";

            if (unit.at(0) == 'k') amount = amount / 1000

            setPurchaseMessage({
                type: "success",
                text: `Your ${selectedItem.ItemName} stock is now set to ${amount}${unit}.`
            });
        } catch (err) {
            setPurchaseMessage({
                type: "error",
                text: "Failed to add your items. Please try again."
            });
        } finally {
            setPurchasing(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        Util.callBackend("butcher/getStock", {userID: Util.savedUser.id})
            .then((data) => {
                setBestSellers(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching best sellers:", error);
                setLoading(false);
            });
    }, []);

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setQuantity(item.currentStock)
    };

    const handleAddProductClick = () => {
        setShowAddProductPopup(true);
    };

    return (
        <div className="bg-white h-screen overflow-y-auto">
            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center flex-grow">
                    <div
                        className="w-16 h-16 border-4 border-t-gray-500 border-gray-200 rounded-full animate-spin"></div>
                    <p className="ml-4 text-xl font-semibold">
                        Loading your best sellers...
                    </p>
                </div>
            ) : (
                <div className="flex-grow overflow-y-auto px-6 pb-6 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {bestSellers.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => handleItemClick(item)}
                                className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
                            >
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={item.ItemPhotoLink}
                                        alt={item.ItemName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-4 text-center">
                                    <h3 className="font-semibold text-lg mb-1 truncate">
                                        {item.ItemName}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Sold Stock:{" "}
                                        <span className="font-bold text-green-800">
                                            {(item.soldStock) * countToKG < 1000
                                                ? `${(item.soldStock) * countToKG}g`
                                                : `${((item.soldStock) * countToKG / 1000).toFixed(2)}kg`}
                                        </span>
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Current Stock:{" "}
                                        <span className="font-bold text-gray-700">
                                            {item.currentStock * countToKG < 1000
                                                ? `${item.currentStock * countToKG}g`
                                                : `${(item.currentStock * countToKG / 1000).toFixed(2)}kg`}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Add New Product Card */}
                        <div
                            onClick={handleAddProductClick}
                            className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:scale-105 cursor-pointer border-2 border-dashed border-gray-300"
                        >
                            <div className="h-48 flex items-center justify-center">
                                <div className="text-gray-400 flex flex-col items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                            </div>
                            <div className="p-4 text-center">
                                <h3 className="font-semibold text-lg mb-1 text-gray-500">
                                    Add New Product
                                </h3>
                            </div>
                        </div>
                    </div>

                    {selectedItem && (
                        <div
                            className={`fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 modal-overlay ${isClosing ? 'fade-out' : ''}`}>
                            <div
                                className={`bg-white rounded-lg w-full overflow-hidden ${isMobile ? "max-w-xs" : "max-w-lg"} modal-content ${isClosing ? 'fade-out' : ''}`}>
                                <div className={`overflow-hidden ${isMobile ? "h-40" : "h-64"}`}>
                                    <img
                                        src={selectedItem.ItemPhotoLink || "/api/placeholder/400/300"}
                                        alt={selectedItem.ItemName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-6">
                                    <h2 className={`text-center ${isMobile ? "text-xl mb-2" : "text-2xl font-bold mb-2"}`}>{selectedItem.ItemName}</h2>
                                    <p className={`text-center ${isMobile ? "text-green-700 font-medium text-lg mb-3" : "text-green-700 text-xl font-semibold mb-4"}`}>${selectedItem.ItemPrice.toFixed(2)} per
                                        kg</p>

                                    {/* Quantity selector */}
                                    <div className="mb-6 text-center">
                                        <div
                                            className={`flex ${isMobile ? "flex-col" : "flex-row"} items-center justify-center`}>
                                            {/* Buttons with adjustments for spacing */}

                                        </div>
                                    </div>
                                    {/* Purchase message */}
                                    {purchaseMessage && (
                                        <div className={`p-3 mb-4 rounded text-center ${
                                            purchaseMessage.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                        }`}>
                                            {purchaseMessage.text}
                                        </div>
                                    )}
                                    <span
                                        className="mx-4 text-lg font-medium mb-2">Update Stock To : {quantity * countToKG < 1000
                                        ? `${quantity * countToKG}g`
                                        : `${(quantity * countToKG / 1000).toFixed(2)}kg`}</span>


                                    <div
                                        className={`flex ${isMobile ? "flex-col" : "flex-row"} items-center justify-center`}>
                                        {/* Buttons with adjustments for spacing */}
                                        <button
                                            onClick={() => setQuantity((prev) => Math.max(0, prev - multiplier))}
                                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors mb-2"
                                        >
                                            -1kg
                                        </button>
                                        <button
                                            onClick={() => setQuantity((prev) => Math.max(0, prev - (multiplier / 10)))}
                                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors mb-2"
                                        >
                                            -100g
                                        </button>
                                        <button
                                            onClick={() => setQuantity((prev) => Math.max(0, prev - (multiplier / 20)))}
                                            className="px-4 mr-3 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors mb-2"
                                        >
                                            -{(multiplier / 20)}g
                                        </button>
                                        <button
                                            onClick={() => setQuantity((prev) => Number(prev) + Number(multiplier) / 20)}
                                            className="px-4 ml-3 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors mb-2"
                                        >
                                            +{(multiplier / 20)}g
                                        </button>
                                        <button
                                            onClick={() => setQuantity((prev) => Number(prev) + Number(multiplier) / 10)}
                                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors mb-2"
                                        >
                                            +100g
                                        </button>
                                        <button
                                            onClick={() => setQuantity((prev) => Number(prev) + Number(multiplier))}
                                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors mb-2"
                                        >
                                            +1kg
                                        </button>
                                    </div>

                                    <div className="flex">
                                        <button
                                            onClick={closeModal}
                                            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-l hover:bg-red-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handlePurchase}
                                            disabled={purchasing}
                                            className={`flex-1 px-4 py-3 bg-green-600 text-white rounded-r hover:bg-green-700 transition-colors ${
                                                purchasing ? "opacity-70 cursor-not-allowed" : ""
                                            }`}
                                        >
                                            {purchasing ? "Processing..." : "Confirm"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add Product Popup */}
                    {showAddProductPopup && (
                        <AddProductPopup setShowPopUp={setShowAddProductPopup} onProductAdded={(newProduct) => {
                            setBestSellers([...bestSellers, newProduct]);
                        }} />
                    )}

                </div>
            )}
        </div>
    );
};

export default BestSellerListFullScreen;
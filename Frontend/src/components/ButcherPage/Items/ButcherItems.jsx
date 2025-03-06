import React, {useEffect, useState} from "react";
import Util from "../../../Util.js";
import useMobileDetection from "../../../mobileDetection.js";

const BestSellerListFullScreen = () => {
    const [bestSellers, setBestSellers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const isMobile = useMobileDetection();
    const [purchasing, setPurchasing] = useState(false);
    const [purchaseMessage, setPurchaseMessage] = useState(null);
    const [isClosing, setIsClosing] = useState(false);

    const closeModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            setSelectedItem(null);
        }, 300); // Match this with your animation duration (0.3s = 300ms)
    };

    const handlePurchase = async () => {
        if (!selectedItem || quantity < 1) return;

        setPurchasing(true);
        setPurchaseMessage(null);

        try {
            // Call the backend with the purchase endpoint and headers
            const headers = {
                itemName: selectedItem.ItemName,
                amount: quantity
            };

            await Util.callBackend("addToCart", headers);
            let unit = "";
            let amount = quantity * countToKG;
            if (amount < 1000) unit = "gs"
            else if (amount == 1000) unit = "kg"
            else unit = "kgs";

            if (unit.at(0) == 'k') amount = amount / 1000

            setPurchaseMessage({
                type: "success",
                text: `Added ${amount} ${unit} of ${selectedItem.ItemName} to cart.`
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
        Util.callBackend("getStock", {userID: Util.savedUser.id})
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

        // Util.navigateTo("butcher/sales");
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
                                        Sales:{" "}
                                        <span className="font-bold text-gray-700">
                      {item.currentStock}
                    </span>
                                    </p>
                                </div>
                            </div>
                        ))}
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

                                    {/* Total price calculation */}
                                    <p className="text-lg font-medium mb-4 text-center">
                                        Total: {selectedItem.currentStock}
                                    </p>

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

                </div>
            )}
        </div>
    );
};

export default BestSellerListFullScreen;
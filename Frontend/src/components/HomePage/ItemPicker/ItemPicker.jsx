import React, { useState, useEffect } from 'react';
import Util from '../../../Util.js';

const ItemPicker = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState(null);

  const countToKG = 50;
  const multiplier = 1000 / countToKG;
  const buttonAdd = (100 / countToKG);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await Util.callBackend("items");
        setItems(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load items. Please try again later.");
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setQuantity(1); // Reset quantity when a new item is selected
    setPurchaseMessage(null); // Clear any previous purchase messages
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  const handleQuantityChange = (e) => {
    setQuantity(parseInt(e.target.value, 10));
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
      if(amount < 1000) unit = "gs"
          else if(amount == 1000) unit = "kg"
      else unit = "kgs";

      if(unit.at(0) == 'k') amount = amount / 1000

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl font-semibold text-gray-600">Loading items...</div>
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
        <h1 className="text-2xl font-bold mb-6 text-center">Item Gallery</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item, index) => (
              <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
                  onClick={() => handleItemClick(item)}
              >
                <div className="h-48 overflow-hidden">
                  <img
                      src={item.ItemPhotoLink || "/api/placeholder/400/300"}
                      alt={item.ItemName}
                      className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 truncate text-center">{item.ItemName}</h3>
                  <p className="text-green-600 font-medium text-center">${item.ItemPrice.toFixed(2)} per kg</p>
                </div>
              </div>
          ))}
        </div>

        {/* Modal for selected item */}
        {selectedItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-lg w-full overflow-hidden">
                <div className="h-64 overflow-hidden">
                  <img
                      src={selectedItem.ItemPhotoLink || "/api/placeholder/400/300"}
                      alt={selectedItem.ItemName}
                      className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2 text-center">{selectedItem.ItemName}</h2>
                  <p className="text-green-700 text-xl font-semibold mb-4 text-center">${selectedItem.ItemPrice.toFixed(2)} per kg</p>

                  {/* Quantity selector */}
                  <div className="mb-6 text-center">
                    <div className="flex items-center justify-center">
                      <button
                          onClick={() => setQuantity((prev) => Math.max(1, prev - multiplier))}
                          className="px-3 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
                      >
                        -1kg
                      </button>
                      <button
                          onClick={() => setQuantity((prev) => Math.max(1, prev - (multiplier / 10)))}
                          className="ml-2 px-3 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
                      >
                        -100g
                      </button>
                      <button
                          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                          className="ml-2 px-3 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
                      >
                        -{countToKG}g
                      </button>
                      <span className="mx-4 text-lg font-medium">{quantity * countToKG < 1000
                          ? `${quantity * countToKG}g`
                          : `${(quantity * countToKG / 1000).toFixed(2)}kg`}</span>
                      <button
                          onClick={() => setQuantity((prev) => prev + 1)}
                          className="px-3 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
                      >
                        +{countToKG}g
                      </button>
                      <button
                          onClick={() => setQuantity((prev) => prev + (multiplier / 10))}
                          className="ml-2 px-3 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
                      >
                        +100g
                      </button>
                      <button
                          onClick={() => setQuantity((prev) => prev + (multiplier))}
                          className="ml-2 px-3 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
                      >
                        +1kg
                      </button>
                    </div>
                  </div>

                  {/* Total price calculation */}
                  <p className="text-lg font-medium mb-4 text-center">
                    Total: ${((quantity / multiplier) * selectedItem.ItemPrice).toFixed(2)}
                  </p>

                  {/* Purchase message */}
                  {purchaseMessage && (
                      <div className={`p-3 mb-4 rounded text-center ${
                          purchaseMessage.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {purchaseMessage.text}
                      </div>
                  )}

                  <div className="flex justify-between">
                    <button
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                      Close
                    </button>
                    <button
                        onClick={handlePurchase}
                        disabled={purchasing}
                        className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors ${
                            purchasing ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                    >
                      {purchasing ? "Processing..." : "Add to cart"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default ItemPicker;
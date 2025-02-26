import React, { useState, useEffect } from 'react';
import Util from '../../Util.js';

const ItemPicker = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState(null);

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
      
      await Util.callBackend("purchase", headers);
      setPurchaseMessage({
        type: "success",
        text: `Added ${quantity} ${quantity === 1 ? 'kg' : 'kgs'} of ${selectedItem.ItemName} to cart.`
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
              <h3 className="font-semibold text-lg mb-1 truncate">{item.ItemName}</h3>
              <p className="text-green-600 font-medium">${item.ItemPrice.toFixed(2)}</p>
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
              <h2 className="text-2xl font-bold mb-2">{selectedItem.ItemName}</h2>
              <p className="text-green-700 text-xl font-semibold mb-4">${selectedItem.ItemPrice.toFixed(2)}</p>
              
              {/* Quantity selector */}
              <div className="mb-6">
                <label htmlFor="quantity" className="block mb-2 font-medium">
                  Quantity: {quantity}
                </label>
                <input
                  type="range"
                  id="quantity"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
              
              {/* Total price calculation */}
              <p className="text-lg font-medium mb-4">
                Total: ${(selectedItem.ItemPrice * quantity).toFixed(2)}
              </p>
              
              {/* Purchase message */}
              {purchaseMessage && (
                <div className={`p-3 mb-4 rounded ${
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
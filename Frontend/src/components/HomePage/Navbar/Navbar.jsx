import React, { useState, useEffect } from "react";
import Util from '../../../Util.js';

const Navbar = ({ showNavbar, setShowNavbar }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    if (showNavbar) {
      fetchCartItems();
    }
  }, [showNavbar]);

  const countToKG = 50;
  const multiplier = 1000 / countToKG;
  
  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const items = await Util.callBackend("cart");
      setCartItems(items);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const updateItemCount = (index, increment) => {
    const updatedItems = [...cartItems];
    updatedItems[index].ItemCount = Math.max(0, updatedItems[index].ItemCount + increment);
    setCartItems(updatedItems);
  };
  
  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.ItemCount * item.ItemPrice);
    }, 0).toFixed(2);
  };
  
  const handleSubmitOrder = async () => {
    setSubmitting(true);
    try {
      const response = await Util.callBackend("saveCart", { items: cartItems });
      if (response === 'success') {
        setShowNavbar(false);
        Util.navigateTo("cart");
      } else {
        alert("There was an issue with your order. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Failed to submit order. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div
      className={`fixed top-0 left-0 w-72 h-full bg-gray-800 text-white shadow-xl transform transition-transform duration-300 ease-in-out p-5 z-50 ${
        showNavbar ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Your Cart</h2>
        <button
          className="bg-red-500 text-white rounded-lg px-4 py-2 cursor-pointer"
          onClick={() => setShowNavbar(!showNavbar)}
        >
          ☰
        </button>
      </div>

      <div className="mt-4 h-4/5 overflow-y-auto">
        {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 border-4 border-t-red-500 border-gray-200 rounded-full animate-spin"></div>
              <p className="mt-2">Loading your cart...</p>
            </div>
        ) : cartItems.length === 0 ? (
            <div className="text-center py-10">
              <p>Your cart is empty</p>
            </div>
        ) : (
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                  <div
                      key={index}
                      className="bg-gray-700 p-3 rounded-md hover:bg-gray-600 cursor-pointer"
                  >
                    <div className="flex flex-col items-center">
                      <img
                          src={item.ItemPhotoLink}
                          alt={item.ItemName}
                          className="w-full h-24 object-cover rounded-md mb-2"
                      />
                      <h3 className="font-medium">{item.ItemName}</h3>
                      <p className="text-sm text-gray-300">${item.ItemPrice.toFixed(2)} per kg</p>

                      <div className="flex items-center mt-2 space-x-2">
                        <button
                            className="bg-red-500 text-white px-3 py-1 rounded-md"
                            onClick={() => updateItemCount(index, -1)}
                        >
                          -
                        </button>
                        <span className="mx-2">
                      {item.ItemCount * countToKG < 1000
                          ? `${item.ItemCount * countToKG}g`
                          : `${(item.ItemCount * countToKG / 1000).toFixed(2)}kg`}
                    </span>
                        <button
                            className="bg-red-500 text-white px-3 py-1 rounded-md"
                            onClick={() => updateItemCount(index, 1)}
                        >
                          +
                        </button>
                      </div>

                      <p className="text-sm mt-2">
                        Subtotal: ${((item.ItemCount / multiplier) * item.ItemPrice).toFixed(2)}
                      </p>
                    </div>
                  </div>
              ))}
            </div>
        )}
      </div>
      
      {!loading && cartItems.length > 0 && (
        <div className="pt-4 mt-0 border-t border-gray-600">
          <div className="flex justify-between mb-4">
            <span className="font-bold">Total:</span>
            <span className="font-bold">${calculateTotalPrice()}</span>
          </div>
          <button 
            className={`${
              submitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
            } text-white w-4/5 mx-auto rounded-lg py-2 font-bold block text-sm`}
            onClick={handleSubmitOrder}
            disabled={submitting}
          >
            {submitting ? 'Processing...' : 'Submit Order'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
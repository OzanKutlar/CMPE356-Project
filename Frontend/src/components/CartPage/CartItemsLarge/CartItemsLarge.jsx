import React, {useState, useEffect} from 'react';
import Util from '../../../Util.js';
import OrderForm from "../CreditCardDetails/OrderForm.jsx";

const CartItemsLarge = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    address: ''
  });

  // Add this function to handle form data updates
  const handleFormDataChange = (newFormData) => {
    setFormData(newFormData);
  };

    const countToKG = 50;
    const multiplier = 1000 / countToKG;
    const buttonAdd = (100 / countToKG);


  useEffect(() => {
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        setLoading(true);
        try {
            const items = await Util.callBackend("cart");
            setCartItems(items);
        } catch (error) {
            console.error("Error fetching cart items:", error);
            setMessage({
                type: "error",
                text: "Failed to load cart items. Please try again later."
            });
        } finally {
            setLoading(false);
        }
    };

    const updateItemCount = async (index, increment) => {
        const updatedItems = [...cartItems];
        const newCount = Math.max(0, updatedItems[index].ItemCount + increment);
        updatedItems[index].ItemCount = newCount;

        if (newCount === 0) {
            updatedItems.splice(index, 1);
        }

        setCartItems(updatedItems);
    };

    const calculateTotalPrice = () => {
        return cartItems.reduce((total, item) => {
            return total + (item.ItemCount / multiplier * item.ItemPrice);
        }, 0).toFixed(2);
    };

  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) {
      setMessage({
        type: "error",
        text: "Your cart is empty"
      });
      return;
    }

    // Validate form data
    if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.address) {
      setMessage({
        type: "error",
        text: "Please fill in all payment details"
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await Util.callBackend("submitOrder", {
        items: cartItems,
        paymentDetails: formData
      });

      if (response === 'success') {
        setMessage({
          type: "success",
          text: "Order submitted successfully!"
        });
        setCartItems([]);
        // Reset form data
        setFormData({
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          address: ''
        });
      } else {
        setMessage({
          type: "error",
          text: "There was an issue with your order. Please try again."
        });
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      setMessage({
        type: "error",
        text: "Failed to submit order. Please try again later."
      });
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-16 h-16 border-4 border-t-red-500 border-gray-200 rounded-full animate-spin"></div>
                <p className="ml-4 text-xl font-semibold">Loading your cart...</p>
            </div>
        );
    }

  return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Shopping Cart</h1>

        {message && (
            <div className={`mb-4 p-4 rounded-lg ${
                message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
        )}

        {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-2xl text-gray-600">Your cart is empty</h2>
              <button
                  onClick={() => Util.navigateTo("home")}
                  className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                  {cartItems.map((item, index) => (
                      <div
                          key={index}
                          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                      >
                          <div className="flex p-4">
                              <div className="w-32 h-32 flex-shrink-0">
                                  <img
                                      src={item.ItemPhotoLink}
                                      alt={item.ItemName}
                                      className="w-full h-full object-cover rounded-md"
                                  />
                              </div>
                              <div className="ml-4 flex-grow">
                                  <h3 className="text-xl font-semibold">{item.ItemName}</h3>
                                  <p className="text-gray-600">${item.ItemPrice.toFixed(2)} per 1kg</p>

                                  <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-4 sm:space-y-0">
                                      <button
                                          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors w-full sm:w-auto"
                                          onClick={() => updateItemCount(index, -20)}
                                      >
                                          -1kg
                                      </button>
                                      <button
                                          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors w-full sm:w-auto"
                                          onClick={() => updateItemCount(index, -2)}
                                      >
                                          -100g
                                      </button>
                                      <button
                                          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors w-full sm:w-auto"
                                          onClick={() => updateItemCount(index, -1)}
                                      >
                                          -50g
                                      </button>
                                      <span className="text-xl font-medium w-full sm:w-auto text-center">
                                            {item.ItemCount * countToKG < 1000
                                                ? `${item.ItemCount * countToKG}g`
                                                : `${(item.ItemCount * countToKG / 1000).toFixed(2)}kg`}
                                        </span>
                                      <button
                                          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors w-full sm:w-auto"
                                          onClick={() => updateItemCount(index, 1)}
                                      >
                                          +50g
                                      </button>
                                      <button
                                          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors w-full sm:w-auto"
                                          onClick={() => updateItemCount(index, 2)}
                                      >
                                          +100g
                                      </button>
                                      <button
                                          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors w-full sm:w-auto"
                                          onClick={() => updateItemCount(index, 20)}
                                      >
                                          +1kg
                                      </button>
                                  </div>
                                  <p className="mt-2 font-medium">
                                      Subtotal: ${((item.ItemCount / multiplier) * item.ItemPrice).toFixed(2)}
                                  </p>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>

              <div>
                <div className="bg-white rounded-lg shadow-md p-6 h-fit">
                  <OrderForm
                      formData={formData}
                      onFormDataChange={handleFormDataChange}
                  />
                  <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-lg">
                      <span>Total Weight:</span>
                      <span>{cartItems.reduce((sum, item) => sum + item.ItemCount, 0) * countToKG < 1000
                          ? `${cartItems.reduce((sum, item) => sum + item.ItemCount, 0) * countToKG}g`
                          : `${(cartItems.reduce((sum, item) => sum + item.ItemCount, 0) * countToKG / 1000).toFixed(2)}kg`}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total Price:</span>
                      <span>${calculateTotalPrice()}</span>
                    </div>
                  </div>
                  <button
                      className={`w-full bg-red-500 text-white py-3 rounded-lg font-medium
                  ${submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'} 
                  transition-colors`}
                      onClick={handleSubmitOrder}
                      disabled={submitting}
                  >
                    {submitting ? 'Processing...' : 'Place Order'}
                  </button>
                  <button
                      onClick={() => Util.navigateTo("home")}
                      className="w-full mt-4 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default CartItemsLarge;
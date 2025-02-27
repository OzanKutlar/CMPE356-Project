import React, {useState} from 'react';

const OrderForm = () => {
    const [formData, setFormData] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        address: ''
    });

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prevState) => ({...prevState, [name]: value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Send the form data to the backend
        try {
            await Util.callBackend("orderSubmit", formData);
            alert('Order submitted successfully!');
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('Failed to submit order. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
            <div className="mb-4">
                <label htmlFor="cardNumber" className="block text-gray-700 font-medium mb-2">
                    Card Number:
                </label>
                <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-red-300"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="expiryDate" className="block text-gray-700 font-medium mb-2">
                    Expiry Date:
                </label>
                <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-red-300"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="cvv" className="block text-gray-700 font-medium mb-2">
                    CVV:
                </label>
                <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-red-300"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="address" className="block text-gray-700 font-medium mb-2">
                    Address:
                </label>
                <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-red-300"
                ></textarea>
            </div>
            <button
                type="submit"
                className="w-full px-4 py-2 bg-red-600 text-pink-100 font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring focus:ring-red-300"
            >
                Submit Order
            </button>
        </form>
    );
};

export default OrderForm;
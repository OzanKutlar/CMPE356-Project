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
        <form className="p-0">
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
                    className="w-full px-0 py-0 shadow-md shadow-red-500/50 rounded focus:ring focus:ring-red-300"
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
                    className="w-full px-0 py-0 shadow-md shadow-red-500/50 rounded focus:ring focus:ring-red-300"
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
                    className="w-full px-0 py-0 shadow-md shadow-red-500/50 rounded focus:ring focus:ring-red-300"
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
                    className="w-full px-0 py-0 shadow-md shadow-red-500/50 rounded focus:ring focus:ring-red-300"
                ></textarea>
            </div>
        </form>
    );
};

export default OrderForm;
import React, {useState} from 'react';
import Util from "../../Util.js";

const OrderForm = ({formData, onFormDataChange}) => {

    const [isCardValid, setCardValid] = useState(true);

    const handleChange = (e) => {
        const {name, value} = e.target;

        if (name === 'cardNumber') {
            // Format card number with spaces every 4 digits
            const formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');

            if(value.length === 19) setCardValid(isValidCardNumber(formattedValue.replace(/\s+/g, '')));

            onFormDataChange({...formData, [name]: formattedValue});
        } else if (name === 'expiryDate') {
            // Allow only numbers in expiry date
            let formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1/');

            if (value.length === 2 || value.length === 5) {
                const [monthStr, yearStr] = value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1/').split('/');
                const month = Number(monthStr);
                const formattedMonth = month ? Math.min(month, 12).toString().padStart(2, '0') : '01';

                if (value.length === 5) {
                    const year = Number(yearStr);
                    const currentYear = new Date().getFullYear() % 100;

                    const formattedYear = year ? Math.max(year, currentYear).toString().slice(-2) : (currentYear + 1).toString().slice(-2);
                    formattedValue = `${formattedMonth}/${formattedYear}`;
                } else {
                    formattedValue = `${formattedMonth}`;
                }
            }
            onFormDataChange({...formData, [name]: formattedValue});
        } else {
            onFormDataChange({...formData, [name]: value});
        }
    };

    const isValidCardNumber = (cardNumber) => {
        let sum = 0;
        let shouldDouble = false;
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber.charAt(i));

            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            shouldDouble = !shouldDouble;
        }

        return (sum % 10) === 0;
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
        <form className="p-0" onSubmit={handleSubmit}>
            <div className="mb-4">
                <label htmlFor="cardNumber" className={`block ${isCardValid ? "text-gray-700" : "text-red-700"} text-xl font-bold mb-2`}>
                    {isCardValid ? "Card Number" : "Card Number ( Please enter a valid Card ) "}
                </label>
                <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    maxLength="19"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-0 py-0 shadow-md shadow-red-500/50 rounded focus:ring focus:ring-red-300"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="expiryDate" className="block text-gray-700 text-xl font-bold mb-2">
                    Expiry Date:
                </label>
                <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    required
                    maxLength="5"
                    className="w-full px-0 py-0 shadow-md shadow-red-500/50 rounded focus:ring focus:ring-red-300"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="cvv" className="block text-gray-700 text-xl font-bold mb-2">
                    CVV:
                </label>
                <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                    required
                    maxLength="3"
                    pattern="\d{3}"
                    className="w-full px-0 py-0 shadow-md shadow-red-500/50 rounded focus:ring focus:ring-red-300"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="address" className="block text-gray-700 text-xl font-bold mb-2">
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

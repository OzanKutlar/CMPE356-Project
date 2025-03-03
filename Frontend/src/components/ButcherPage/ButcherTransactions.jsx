import React, {useEffect, useState} from "react";
import Util from "../../Util.js";
import "./ButcherTransactions.css"

const FullscreenSales = () => {
    const [sales, setSales] = useState([]);
    const [error, setError] = useState(null);
    const [expandedTransaction, setExpandedTransaction] = useState(null);
    const [notification, setNotification] = useState({message: '', isLoading: false, isError: false});

    const showNotification = (message, isError = false) => {
        setNotification({message, isLoading: false, isError});
        setTimeout(() => setNotification({message: '', isLoading: false, isError: false}), 3000);
    };

    useEffect(() => {
        const fetchLatestSales = async () => {
            try {
                setLoading(true);
                const response = await Util.callBackend("getSales", {
                    userID: Util.savedUser.id,
                });
                setLoading(false);
                setSales(response);
            } catch (err) {
                setLoading(false);
                setError("Failed to fetch latest sales data");
                console.error(err);
            }
        };
        fetchLatestSales();
    }, []);

    const handleExpand = (transactionId) => {
        setExpandedTransaction((prev) => (prev === transactionId ? null : transactionId));
    };

    // First, add loading state
    const [loading, setLoading] = useState(false);


    const handleAction = async (action, transactionId) => {
        setNotification({message: '', isLoading: true, isError: false});
        try {
            await Util.callBackend(action, {
                userID: Util.savedUser.id,
                transactionID: transactionId,
            });
            showNotification('Action completed successfully');
        } catch (err) {
            console.error(err);
            showNotification('Action failed', true);
        }
    };


    if (error) {
        return <div className="text-red-500 text-center mt-4 font-medium">{error}</div>;
    }

    return (
        <div className="bg-white h-screen overflow-y-auto">
            {/* Loading and Notification UI */}
            {notification.message || notification.isLoading ? (
                <div className={`fixed right-4 bottom-4 p-4 rounded shadow-2xl transition-all ${
                    notification.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {notification.isLoading ? (
                        <div className="flex items-center">
                            <div
                                className="loader border-t-4 border-b-4 border-gray-800 w-6 h-6 rounded-full animate-spin mr-2"></div>
                        </div>
                    ) : (
                        notification.message
                    )}
                </div>
            ) : null}
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b mb-4">
                <h1 className="text-3xl font-bold text-gray-800">Latest Transactions</h1>
            </div>

            {/* Table */}
            <div className="px-6">
                <table className="w-full border-collapse text-left text-sm">
                    <thead>
                    <tr className="bg-gray-100 text-gray-700 font-medium">
                        <th className="p-3">#</th>
                        <th className="p-3">Order Details</th>
                        <th className="p-3">Payment</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sales.length > 0 ? (
                        sales.map((sale, index) => (
                            <React.Fragment key={sale.id}>
                                <tr
                                    className="border-b hover:bg-gray-50 text-gray-800 cursor-pointer"
                                    onClick={() => handleExpand(sale.id)}
                                >
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3 flex items-center gap-3">
                                        <img
                                            src={sale.itemPhoto}
                                            alt="Item"
                                            className="w-12 h-12 rounded-md border border-gray-200"
                                        />
                                        <span className="font-medium">{sale.itemName}</span>
                                    </td>
                                    <td className="p-3 text-blue-600 font-medium">
                                        {sale.paymentMethod} <br/>
                                        <span className="text-gray-500 text-xs">{sale.paymentID}</span>
                                    </td>
                                    <td className="p-3">
                                        <span
                                            className={`px-2 py-1 text-xs font-medium rounded-md ${
                                                sale.status === "Success"
                                                    ? "bg-green-100 text-green-600"
                                                    : sale.status === "Canceled"
                                                        ? "bg-red-100 text-red-600"
                                                        : "bg-yellow-100 text-yellow-600"
                                            }`}
                                        >
                                            {sale.status}
                                        </span>
                                    </td>
                                    <td className="p-3">${sale.totalPrice.toFixed(2)}</td>
                                    <td className="p-3 text-center">
                                        {expandedTransaction === sale.id ? "▲" : "▼"}
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="6">
                                        <div className={`expanded-row ${expandedTransaction === sale.id ? 'open' : ''}`}>
                                            <div className="p-4 bg-gray-50">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <button
                                                        className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg transition-all duration-300 hover:bg-red-600"
                                                        onClick={() => handleAction("refundTransaction", sale.id)}
                                                    >
                                                        Refund Transaction
                                                    </button>
                                                    <button
                                                        className="px-4 py-2 bg-yellow-500 text-white text-sm rounded-lg transition-all duration-300 hover:bg-yellow-600"
                                                        onClick={() => handleAction("banUser", sale.id)}
                                                    >
                                                        Ban User
                                                    </button>
                                                    <button
                                                        className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg transition-all duration-300 hover:bg-gray-800"
                                                        onClick={() => handleAction("banAddress", sale.id)}
                                                    >
                                                        Ban Address
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </React.Fragment>
                        ))
                    ) : (
                        <tr>
                            {loading ? (
                                <div className="flex items-center">
                                    <div className="loader border-t-4 border-b-4 border-gray-800 w-6 h-6 rounded-full animate-spin mr-2"></div>
                                </div>
                            ) : (
                                <td colSpan="6" className="text-center p-4 text-gray-500">
                                    No transactions found
                                </td>
                            )}
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FullscreenSales;
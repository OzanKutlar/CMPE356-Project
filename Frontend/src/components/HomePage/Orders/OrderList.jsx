import React, {useEffect, useState} from "react";
import Util from "../../../Util.js";
import "../../ButcherPage/Transactions/ButcherTransactions.css"

const FullscreenSales = () => {
    const [sales, setSales] = useState([]);
    const [error, setError] = useState(null);
    const [expandedTransaction, setExpandedTransaction] = useState(null);
    const [notification, setNotification] = useState({message: '', isLoading: false, isError: false});
    const [loading, setLoading] = useState(false);
    const [disabledButtons, setDisabledButtons] = useState({});

    let timeOutConst = null;

    const showNotification = (message, isError = false) => {
        if (timeOutConst != null) {
            clearTimeout(timeOutConst);
            timeOutConst = null;
        }
        setNotification({message, isLoading: false, isError});
        timeOutConst = setTimeout(() => setNotification({message: '', isLoading: false, isError: false}), 3000);
    };

    useEffect(() => {
        const fetchLatestSales = async () => {
            try {
                setLoading(true);
                const response = await Util.callBackend("user/getOrders", {
                    userID: Util.savedUser.id,
                    limit: 50,
                    pos: 0
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

    const handleExpand = (orderID) => {
        setExpandedTransaction((prev) => (prev === orderID ? null : orderID));
    };

    const handleAction = async (action, orderID) => {
        setDisabledButtons((prev) => ({...prev, [action + orderID]: true}));
        setNotification({message: '', isLoading: true, isError: false});
        try {
            let returnEd = await Util.callBackend(action, {
                userID: Util.savedUser.id,
                transactionID: orderID,
            });
            showNotification(returnEd.msg);
        } catch (err) {
            console.error(err);
            showNotification('Action failed', true);
        } finally {
            setDisabledButtons((prev) => ({...prev, [action + orderID]: false}));
        }
    };

    if (error) {
        return <div className="text-red-500 text-center mt-4 font-medium">{error}</div>;
    }
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-16 h-16 border-4 border-t-gray-500 border-gray-200 rounded-full animate-spin"></div>
                <p className="ml-4 text-xl font-semibold">Loading your orders...</p>
            </div>
        );
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
                                        <div
                                            className={`expanded-row ${expandedTransaction === sale.id ? 'open' : ''}`}>
                                            <div className="p-4 bg-gray-50">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <button
                                                        className={`px-4 py-2 text-white text-sm rounded-lg transition-all duration-300 ${
                                                            disabledButtons["cancelOrder" + sale.id]
                                                                ? "bg-gray-400 cursor-not-allowed"
                                                                : "bg-red-500 hover:bg-red-600"
                                                        }`}
                                                        onClick={() => handleAction("cancelOrder", sale.id)}
                                                        disabled={disabledButtons["cancelOrder" + sale.id]}
                                                    >
                                                        Cancel Order
                                                    </button>
                                                    <button
                                                        className={`px-4 py-2 text-white text-sm rounded-lg transition-all duration-300 ${
                                                            disabledButtons["changeAddr" + sale.id]
                                                                ? "bg-gray-400 cursor-not-allowed"
                                                                : "bg-yellow-500 hover:bg-yellow-600"
                                                        }`}
                                                        onClick={() => handleAction("changeAddr", sale.id)}
                                                        disabled={disabledButtons["changeAddr" + sale.id]}
                                                    >
                                                        Change Address
                                                    </button>
                                                    <button
                                                        className={`px-4 py-2 text-white text-sm rounded-lg transition-all duration-300 ${
                                                            disabledButtons["contDriver" + sale.id]
                                                                ? "bg-gray-400 cursor-not-allowed"
                                                                : "bg-gray-700 hover:bg-gray-800"
                                                        }`}
                                                        onClick={() => handleAction("contDriver", sale.id)}
                                                        disabled={disabledButtons["contDriver" + sale.id]}
                                                    >
                                                        Contact Driver
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
                                    <div
                                        className="loader border-t-4 border-b-4 border-gray-800 w-6 h-6 rounded-full animate-spin mr-2"></div>
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
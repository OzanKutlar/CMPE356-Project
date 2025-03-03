import React, {useEffect, useState} from "react";
import Util from "../../Util.js";

const FullscreenSales = () => {
    const [sales, setSales] = useState([]);
    const [error, setError] = useState(null);
    const [expandedTransaction, setExpandedTransaction] = useState(null);

    useEffect(() => {
        const fetchLatestSales = async () => {
            try {
                const response = await Util.callBackend("getLatestSales", {
                    userID: Util.savedUser.id,
                });
                setSales(response);
            } catch (err) {
                setError("Failed to fetch latest sales data");
                console.error(err);
            }
        };
        fetchLatestSales();
    }, []);

    const handleExpand = (transactionId) => {
        setExpandedTransaction((prev) => (prev === transactionId ? null : transactionId));
    };

    const handleAction = async (action, transactionId) => {
        try {
            await Util.callBackend(action, {
                userID: Util.savedUser.id,
                transactionID: transactionId,
            });
            alert(`${action.replace(/([a-z])([A-Z])/g, "$1 $2")} successful!`);
        } catch (err) {
            console.error("Action failed:", err);
            alert("Failed to complete the action.");
        }
    };

    if (error) {
        return <div className="text-red-500 text-center mt-4 font-medium">{error}</div>;
    }

    return (
        <div className="bg-white h-screen overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b mb-4">
                <h1 className="text-3xl font-bold text-gray-800">Fullscreen Recent Transactions</h1>
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

                                {/* Expanded row for actions */}
                                {expandedTransaction === sale.id && (
                                    <tr className="border-b bg-gray-50">
                                        <td colSpan="6" className="p-4">
                                            <div
                                                className="flex gap-4 transition-all duration-300"
                                                style={{
                                                    maxHeight: expandedTransaction === sale.id ? "200px" : "0",
                                                    overflow: "hidden",
                                                }}
                                            >
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
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="p-4 text-center">
                                No transactions found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FullscreenSales;
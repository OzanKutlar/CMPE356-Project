import React, {useEffect, useState} from "react";
import Util from "../../../Util.js";

const LatestSales = () => {
    const [sales, setSales] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLatestSales = async () => {
            try {
                setLoading(true);
                const response = await Util.callBackend("getTransactions", {
                    userID: Util.savedUser.id,
                    limit: 5
                });
                setLoading(false);
                setSales(response);
            } catch (err) {
                setError("Failed to fetch latest sales data");
                console.error(err);
            }
        };
        fetchLatestSales();
    }, []);

    if (error) {
        return <div className="text-red-500 text-center mt-4 font-medium">{error}</div>;
    }

    const [loading, setLoading] = useState(false);

    // if (loading) {
    //     return (
    //         <div className="flex items-center justify-center h-screen">
    //             <div className="w-16 h-16 border-4 border-t-gray-500 border-gray-200 rounded-full animate-spin"></div>
    //             <p className="ml-4 text-xl font-semibold">Loading your transactions...</p>
    //         </div>
    //     );
    // }

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-4xl mx-auto">
            {/* Header */}

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Recent Transactions</h2>
                {loading ? null : (
                    <button
                        className="px-4 h-8 bg-gray-800 text-white text-sm font-medium rounded-lg cursor-pointer transition-all duration-300 hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                        onClick={() => Util.navigateTo("butcher/transactions")}
                    >
                        View All →
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-screen">
                    <div
                        className="w-16 h-16 border-4 border-t-gray-500 border-gray-200 rounded-full animate-spin"></div>
                    <p className="ml-4 text-xl font-semibold">Loading your transactions...</p>
                </div>
            ) : (
                <div>
                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                            <tr className="bg-gray-100 text-gray-700 font-medium">
                                <th className="p-3">#</th>
                                <th className="p-3">Order Details</th>
                                <th className="p-3">Payment</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Amount</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sales.length > 0 ? (
                                sales.map((sale, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50 text-gray-800">
                                        <td className="p-3">{index + 1}</td>
                                        <td className="p-3 flex items-center gap-3">
                                            <img
                                                src={sale.itemPhoto}
                                                alt="Item"
                                                className="w-10 h-10 rounded-md border border-gray-200"
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
                                        <td className="p-3 font-semibold text-gray-800">${sale.totalPrice.toFixed(2)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center p-6 text-gray-500 italic">
                                        No transactions found
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LatestSales;

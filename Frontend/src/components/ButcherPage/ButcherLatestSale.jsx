import React, {useEffect, useState} from "react";
import Util from "../../Util.js";

const LatestSales = () => {
    const [sales, setSales] = useState([]);
    const [error, setError] = useState(null);

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

    if (error) {
        return <div className="text-red-500 text-center mt-4 font-medium">{error}</div>;
    }

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Latest Sales</h2>
                <button
                    className="px-4 h-8 bg-gray-800 text-white text-sm font-medium rounded-lg cursor-pointer transition-all duration-300 hover:bg-blue-600 hover:text-white focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    onClick={() => Util.navigateTo("butcher/sales")}
                >
                    View All →
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                    <thead>
                    <tr className="bg-gray-50 text-gray-700 font-medium">
                        <th className="p-3">#</th>
                        <th className="p-3">Product</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Profit</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sales.length > 0 ? (
                        sales.map((sale, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50 text-gray-800">
                                <td className="p-3">{index + 1}</td>
                                <td className="p-3 flex items-center gap-3">
                                    <img src={sale.itemPhoto} alt="Item"
                                         className="w-10 h-10 rounded-md border border-gray-200"/>
                                    <span className="font-medium">{sale.itemName}</span>
                                </td>
                                <td className="p-3 font-semibold text-blue-600">${sale.totalPrice.toFixed(2)}</td>
                                <td className="p-3 font-semibold text-green-600">${sale.saleProfit.toFixed(2)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center p-6 text-gray-500 italic">No sales found</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LatestSales;

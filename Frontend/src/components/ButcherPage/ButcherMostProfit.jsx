import React, { useEffect, useState } from "react";
import Util from "../../Util.js";

const BestSellerList = () => {
    const [bestSellers, setBestSellers] = useState([]);

    useEffect(() => {
        // Fetch best-selling items data from the backend
        Util.callBackend("getMostProfits", { userID: Util.savedUser.id })
            .then((data) => {
                setBestSellers(data);
            })
            .catch((error) => {
                console.error("Error fetching best sellers:", error);
            });
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h3 className="text-2xl font-bold text-gray-800">Best Sellers</h3>
                <button
                    className="px-4 h-8 bg-gray-800 text-white text-sm font-medium rounded-lg cursor-pointer transition-all duration-300 hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    onClick={() => Util.navigateTo("butcher/sales")}
                >
                    View All →
                </button>
            </div>
            <ul className="space-y-4">
                {bestSellers.map((item, index) => (
                    <li
                        key={index}
                        className="flex items-center bg-white rounded-lg shadow p-4 hover:shadow-md transition"
                    >
                        <img
                            src={item.itemPhotoLink}
                            alt={item.itemName}
                            className="w-16 h-16 rounded-full object-cover mr-4"
                        />
                        <div className="flex flex-col flex-grow">
                            <p className="text-lg font-semibold text-gray-700">{item.itemName}</p>
                            <p className="text-gray-500">${item.totalProfit.toLocaleString()}</p>
                        </div>
                        <p className="text-sm text-gray-500">
                            Sales: <span className="font-bold text-gray-700">{item.totalSales}</span>
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BestSellerList;
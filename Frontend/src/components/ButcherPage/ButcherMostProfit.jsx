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
        <div className="best-seller">
            <div className="header">
                <h3>Best Seller</h3>
                <button className="view-all" onClick={() => Util.navigateTo("sales")}>
                    View All →
                </button>
            </div>
            <ul className="seller-list">
                {bestSellers.map((item, index) => (
                    <li key={index} className="seller-item">
                        <img src={item.itemPhotoLink} alt={item.itemName} className="item-photo" />
                        <div className="item-details">
                            <p className="item-name">{item.itemName}</p>
                            <p className="item-price">${item.totalProfit}</p>
                        </div>
                        <p className="item-sales">Sales {item.totalSales}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BestSellerList;

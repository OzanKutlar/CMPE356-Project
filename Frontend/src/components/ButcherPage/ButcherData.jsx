import React, {useEffect, useState} from 'react';
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
                setSales(response); // Assuming the response is directly the list of dictionaries
            } catch (err) {
                setError('Failed to fetch latest sales data');
                console.error(err);
            }
        };
        fetchLatestSales();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Latest Sales</h1>
            <ul>
                {sales.length > 0 ? (
                    sales.map((sale, index) => (
                        <li key={index}>
                            <img src={sale.itemPhoto} alt="Item" style={{width: 50, height: 50}}/>
                            <p>Item Count: {sale.itemCount}</p>
                            <p>Total Price: ${sale.totalPrice.toFixed(2)}</p>
                            <p>Sale Profit: ${sale.saleProfit.toFixed(2)}</p>
                        </li>
                    ))
                ) : (
                    <p>No sales found</p>
                )}
            </ul>
        </div>
    );
};

export default LatestSales;
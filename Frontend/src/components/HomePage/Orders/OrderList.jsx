import {useState, useEffect} from "react";
import Util from "../../../Util.js";
import "../../Global/Styles/TableStyle.css";
import { Search, ChevronUp, ChevronDown, FileText } from 'lucide-react';

const FullscreenSales = () => {
    const [sales, setSales] = useState([]);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({message: '', isLoading: false, isError: false});
    const [loading, setLoading] = useState(false);
    const [disabledButtons, setDisabledButtons] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [filteredSales, setFilteredSales] = useState([]);

    let timeOutConst = null;

    const showNotification = (message, isError = false) => {
        if (timeOutConst != null) {
            clearTimeout(timeOutConst);
            timeOutConst = null;
        }
        setNotification({message, isLoading: false, isError});
        timeOutConst = setTimeout(() => setNotification({message: '', isLoading: false, isError: false}), 3000);
    };
	
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

    useEffect(() => {
        fetchLatestSales();
    }, []);

    // Handle search and sorting
    useEffect(() => {
        setLoading(true);

        // Use timeout to allow UI to update before filtering/sorting
        const timeoutId = setTimeout(() => {
            // Filter sales based on search term
            let filtered = sales.filter(sale =>
                Object.values(sale).some(
                    value => value && typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
                ) ||
                (sale.totalPrice && sale.totalPrice.toString().includes(searchTerm))
            );

            // Sort sales if sortField is set
            if (sortField) {
                filtered.sort((a, b) => {
                    // Special handling for ID column to sort numerically
                    if (sortField === 'id') {
                        return sortDirection === 'asc'
                            ? parseInt(a[sortField]) - parseInt(b[sortField])
                            : parseInt(b[sortField]) - parseInt(a[sortField]);
                    }

                    // Default sorting for other columns
                    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
                    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
                    return 0;
                });
            }

            setFilteredSales(filtered);
            setLoading(false);
        }, 10);

        return () => clearTimeout(timeoutId);
    }, [sales, searchTerm, sortField, sortDirection]);

    const handleAction = async (action, orderID) => {
        setDisabledButtons((prev) => ({...prev, [action + orderID]: true}));
        try {
            let returnEd = await Util.callBackend(action, {
                userID: Util.savedUser.id,
                transactionID: orderID,
            });

            if (returnEd.msg === "error") {
                throw new Error(returnEd.message || 'Failed to delete admin user');
            }

            Util.CallGeneric(returnEd.message)
			fetchLatestSales();
        } catch (err) {
            console.error(err);
            Util.CallGeneric(err.message, "Error")
        } finally {
            setDisabledButtons((prev) => ({...prev, [action + orderID]: false}));
        }
    };

    // Handle column sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Render sort indicator
    const renderSortIndicator = (field) => {
        return (
            <span className="w-4 h-4 inline-flex justify-center">
                {sortField === field ?
                    (sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)
                    : null}
            </span>
        );
    };

    if (error) {
        return <div className="text-red-500 text-center mt-4 font-medium">{error}</div>;
    }
    
    return (
        <div className="flex p-4 bg-gray-100 min-h-screen flex-col">
            <div className="w-full mx-auto flex-grow flex flex-col px-4 lg:px-30">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 mt-5">
                    <div className="flex items-center mb-4 md:mb-0">
                        <FileText className="h-8 w-8 text-blue-600 mr-2" />
                        <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <div className="relative w-full md:w-64">
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-lg flex-grow flex flex-col mb-8 overflow-hidden">
                    <div className="overflow-auto flex-grow" style={{ maxHeight: 'calc(100vh - 200px)', minHeight: '400px' }}>
                        {loading ? (
                            <div className="flex items-center justify-center py-20 text-center">
                                <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
                                <p className="ml-4 text-xl font-semibold text-blue-500">Loading your orders...</p>
                            </div>
                        ) : (
                            <table className="w-full table-fixed border-collapse">
                                <thead className="bg-gray-200 sticky top-0 z-5 shadow-sm">
                                    <tr>
                                        <th className="w-1/12 px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-300 border-r border-gray-200 rounded-tl-xl"
                                            onClick={() => handleSort('id')}>
                                            <span className="flex items-center justify-between">
                                                #
                                                {renderSortIndicator('id')}
                                            </span>
                                        </th>
                                        <th className="w-3/12 px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-300 border-r border-gray-200"
                                            onClick={() => handleSort('itemName')}>
                                            <span className="flex items-center justify-between">
                                                Order Details
                                                {renderSortIndicator('itemName')}
                                            </span>
                                        </th>
                                        <th className="w-2/12 px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-300 border-r border-gray-200"
                                            onClick={() => handleSort('paymentMethod')}>
                                            <span className="flex items-center justify-between">
                                                Payment
                                                {renderSortIndicator('paymentMethod')}
                                            </span>
                                        </th>
                                        <th className="w-2/12 px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-300 border-r border-gray-200"
                                            onClick={() => handleSort('status')}>
                                            <span className="flex items-center justify-between">
                                                Status
                                                {renderSortIndicator('status')}
                                            </span>
                                        </th>
                                        <th className="w-2/12 px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-300 border-r border-gray-200"
                                            onClick={() => handleSort('totalPrice')}>
                                            <span className="flex items-center justify-between">
                                                Amount
                                                {renderSortIndicator('totalPrice')}
                                            </span>
                                        </th>
                                        <th className="w-2/12 px-3 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tr-xl">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {(searchTerm || sortField ? filteredSales : sales).length > 0 ? (
                                    (searchTerm || sortField ? filteredSales : sales).map((sale, index) => (
                                        <tr key={sale.id}
                                            className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                            <td className="px-3 py-3 whitespace-nowrap text-sm text-left text-gray-500 border-r border-gray-100">{index + 1}</td>
                                            <td className="px-3 py-3 whitespace-nowrap text-sm text-left border-r border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={sale.itemPhoto}
                                                        alt="Item"
                                                        className="w-12 h-12 rounded-md border border-gray-200"
                                                    />
                                                    <span className="font-medium">{sale.itemName}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap text-sm text-left border-r border-gray-100">
                                                <span className="text-blue-600 font-medium">{sale.paymentMethod}</span>
                                                <br/>
                                                <span className="text-gray-500 text-xs">{sale.paymentID}</span>
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap text-sm text-left border-r border-gray-100">
                                                <span
                                                    className={`px-2 py-1 text-xs font-medium rounded-md ${
                                                        sale.status === "Completed"
                                                            ? "bg-green-100 text-green-600"
                                                            : sale.status === "Cancelled"
                                                                ? "bg-red-100 text-red-600"
                                                                : sale.status === "In Delivery"
                                                                    ? "bg-purple-100 text-purple-600"
                                                                    : sale.status === "Refunded"
                                                                        ? "bg-blue-100 text-blue-600"
                                                                        : "bg-yellow-100 text-yellow-600"
                                                    }`}
                                                >
                                                    {sale.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap text-sm text-left text-gray-500 border-r border-gray-100">${sale.totalPrice.toFixed(2)}</td>
                                            <td className="px-3 py-3 whitespace-nowrap text-sm text-center">
                                                <button
                                                    className={`px-3 py-1.5 text-white text-xs rounded-lg transition-all duration-300 ${
                                                        (sale.status === "Refunded" || sale.status === "Completed" || sale.status === "Cancelled" || disabledButtons["cart/cancelOrder" + sale.id])
                                                            ? "bg-gray-400 cursor-not-allowed"
                                                            : "bg-red-500 hover:bg-red-600"
                                                    }`}
                                                    onClick={() => handleAction("cart/cancelOrder", sale.id)}
                                                    disabled={(sale.status === "Refunded" || sale.status === "Completed" || sale.status === "Cancelled" || disabledButtons["cart/cancelOrder" + sale.id])}
                                                >
                                                    {disabledButtons["cart/cancelOrder" + sale.id] ? (
                                                        <>
                                                            <span className="inline-block mr-1 h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                            Processing...
                                                        </>
                                                    ) : "Cancel Order"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-3 py-16 text-center text-gray-500">
                                            No orders found
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Notification Toast */}
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
        </div>
    );
};

export default FullscreenSales;
import React, { useEffect, useState } from "react";
import Util from "../../../Util.js";
import { Users, Search, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';
import '../../Global/Styles/TableStyle.css';

const FullscreenSales = () => {
    const [sales, setSales] = useState([]);
    const [error, setError] = useState(null);
    const [expandedTransaction, setExpandedTransaction] = useState(null);
    const [notification, setNotification] = useState({ message: '', isLoading: false, isError: false });
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
        setNotification({ message, isLoading: false, isError });
        timeOutConst = setTimeout(() => setNotification({ message: '', isLoading: false, isError: false }), 3000);
    };

    const fetchLatestSales = async () => {
        try {
            setLoading(true);
            const response = await Util.callBackend("butcher/getTransactions", {
                userID: Util.savedUser.id,
                limit: 50,
                pos: 0
            });
            setSales(response);
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch latest sales data");
            setLoading(false);
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

    const handleExpand = (transactionId) => {
        setExpandedTransaction((prev) => (prev === transactionId ? null : transactionId));
    };

    const handleAction = async (action, transactionId) => {
        setDisabledButtons((prev) => ({ ...prev, [action + transactionId]: true }));
        try {
            let returnEd = await Util.callBackend(action, {
                userID: Util.savedUser.id,
                transactionID: transactionId,
            });

            if (returnEd.msg === "error") {
                throw new Error(returnEd.message || 'Failed to process transaction');
            }

            Util.CallGeneric(returnEd.message);
            fetchLatestSales();
        } catch (err) {
            console.error(err);
            Util.CallGeneric(err.message, "Error");
        } finally {
            setDisabledButtons((prev) => ({ ...prev, [action + transactionId]: false }));
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
                        <Users className="h-8 w-8 text-blue-600 mr-2" />
                        <h1 className="text-2xl font-bold text-gray-800">Transaction Management</h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Refresh Button */}
                        <button
                            onClick={fetchLatestSales}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            disabled={loading}
                            title="Refresh transactions"
                        >
                            <RefreshCw className="h-5 w-5" />
                        </button>

                        {/* Search */}
                        <div className="relative w-full md:w-64">
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                placeholder="Search transactions..."
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
                                <p className="ml-4 text-xl font-semibold text-blue-500">Loading your transactions...</p>
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
                                <tbody className="divide-y divide-gray-200">
                                    {filteredSales.length > 0 ? (
                                        filteredSales.map((sale, index) => (
                                            <React.Fragment key={sale.id}>
                                                <tr
                                                    className={`hover:bg-blue-100 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50 bg-opacity-30'}`}
                                                    onClick={() => handleExpand(sale.id)}
                                                >
                                                    <td className="px-3 py-3 whitespace-nowrap text-sm text-left text-gray-500 border-r border-gray-200">{sale.id}</td>
                                                    <td className="px-3 py-3 text-sm text-left text-gray-500 border-r border-gray-200">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={sale.itemPhoto}
                                                                alt="Item"
                                                                className="w-12 h-12 rounded-md border border-gray-200 object-cover"
                                                            />
                                                            <span className="font-medium truncate">{sale.itemName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 whitespace-nowrap text-sm text-left border-r border-gray-200">
                                                        <span className="text-blue-600 font-medium">{sale.paymentMethod}</span>
                                                        <br />
                                                        <span className="text-gray-500 text-xs truncate">{sale.paymentID}</span>
                                                    </td>
                                                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">
                                                        <span
                                                            className={`px-2 py-1 text-xs font-medium rounded-md ${sale.status === "Completed"
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
                                                    <td className="px-3 py-3 whitespace-nowrap text-sm text-left text-gray-500 border-r border-gray-200">${sale.totalPrice.toFixed(2)}</td>
                                                    <td className="px-3 py-3 whitespace-nowrap text-sm text-center">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <button
                                                                className={`p-1.5 rounded-full ${expandedTransaction === sale.id ? 'bg-blue-100' : 'bg-gray-100 hover:bg-blue-50'} transition-colors focus:outline-none`}
                                                                title={expandedTransaction === sale.id ? "Hide details" : "Show details"}
                                                            >
                                                                {expandedTransaction === sale.id ?
                                                                    <ChevronUp className="w-4 h-4 text-blue-600" /> :
                                                                    <ChevronDown className="w-4 h-4 text-gray-600" />
                                                                }
                                                            </button>
                                                            <button
                                                                className={`p-1.5 rounded-full ${(sale.status === "Refunded" || sale.status === "Completed" || sale.status === "Cancelled") ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-100 hover:bg-red-200 text-red-600'} transition-colors focus:outline-none`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (!(sale.status === "Refunded" || sale.status === "Completed" || sale.status === "Cancelled")) {
                                                                        handleAction("cart/refundTransaction", sale.id);
                                                                    }
                                                                }}
                                                                title={sale.status === "Refunded" || sale.status === "Completed" || sale.status === "Cancelled" ? "Cannot refund this transaction" : "Refund transaction"}
                                                                disabled={sale.status === "Refunded" || sale.status === "Completed" || sale.status === "Cancelled" || disabledButtons["cart/refundTransaction" + sale.id]}
                                                            >
                                                                {disabledButtons["cart/refundTransaction" + sale.id] ? (
                                                                    <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                                                ) : (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <path d="M3 9h14l-3.5-3.5M21 15H7l3.5 3.5" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {expandedTransaction === sale.id && (
                                                    <tr className="bg-gray-50">
                                                        <td colSpan="6" className="p-0">
                                                            <div className="p-4 border-t border-gray-200">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                    {/* Left column - Enhanced transaction details */}
                                                                    <div className="space-y-4">
                                                                        <h4 className="font-semibold text-gray-800 text-base border-b border-gray-200 pb-2">Transaction Details</h4>
                                                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                                                            <div className="text-gray-600">Transaction ID:</div>
                                                                            <div className="font-medium text-gray-900">{sale.id}</div>

                                                                            <div className="text-gray-600">Order Date:</div>
                                                                            <div className="font-medium text-gray-900">{sale.orderDate || "N/A"}</div>

                                                                            <div className="text-gray-600">Item:</div>
                                                                            <div className="font-medium text-gray-900">{sale.itemName}</div>

                                                                            <div className="text-gray-600">Payment Method:</div>
                                                                            <div className="font-medium text-blue-600">{sale.paymentMethod}</div>

                                                                            <div className="text-gray-600">Payment ID:</div>
                                                                            <div className="font-medium text-blue-600 break-all">{sale.paymentID}</div>

                                                                            <div className="text-gray-600">Status:</div>
                                                                            <div>
                                                                                <span className={`px-2 py-1 text-xs font-medium rounded-md ${sale.status === "Completed" ? "bg-green-100 text-green-600" :
                                                                                        sale.status === "Cancelled" ? "bg-red-100 text-red-600" :
                                                                                            sale.status === "In Delivery" ? "bg-purple-100 text-purple-600" :
                                                                                                sale.status === "Refunded" ? "bg-blue-100 text-blue-600" :
                                                                                                    "bg-yellow-100 text-yellow-600"
                                                                                    }`}>
                                                                                    {sale.status}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Right column - Keep the same as requested */}
                                                                    <div className="flex flex-col items-end justify-center">
                                                                        <div className="text-right mb-3">
                                                                            <p className="text-sm text-gray-600">Total Amount</p>
                                                                            <p className="text-xl font-bold text-blue-600">${sale.totalPrice.toFixed(2)}</p>
                                                                        </div>
                                                                        <button
                                                                            className={`px-4 py-2 text-white text-sm rounded-lg transition-all duration-300 w-48 ${(sale.status === "Refunded" || sale.status === "Completed" || sale.status === "Cancelled" || disabledButtons["cart/refundTransaction" + sale.id])
                                                                                    ? "bg-gray-400 cursor-not-allowed"
                                                                                    : "bg-red-500 hover:bg-red-600"
                                                                                }`}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleAction("cart/refundTransaction", sale.id);
                                                                            }}
                                                                            disabled={(sale.status === "Refunded" || sale.status === "Completed" || sale.status === "Cancelled" || disabledButtons["cart/refundTransaction" + sale.id])}
                                                                        >
                                                                            {disabledButtons["cart/refundTransaction" + sale.id] ? (
                                                                                <>
                                                                                    <span className="inline-block mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                                                    Processing...
                                                                                </>
                                                                            ) : "Refund Transaction"}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-3 py-16 text-center text-gray-500">
                                                No transactions found
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
                <div className={`fixed right-4 bottom-4 p-4 rounded shadow-2xl transition-all ${notification.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
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
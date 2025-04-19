import React, {useState, useEffect} from 'react';
import Util from '../../../Util.js';
import useMobileDetection from "../../../mobileDetection.js";
import './ItemPicker.css';
import FilterBar from '../ProductFilter/ProductFilter.jsx';

const ItemPicker = () => {
    const isMobile = useMobileDetection();
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState(50);
    const [purchasing, setPurchasing] = useState(false);
    const [purchaseMessage, setPurchaseMessage] = useState(null);
    const [isClosing, setIsClosing] = useState(false);
    const [filters, setFilters] = useState({});

    const [cart, setCart] = useState(() => {
        const storedCart = localStorage.getItem('cart');
        return storedCart ? JSON.parse(storedCart) : {};
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addItemToCart = (newItem) => {
        setCart(() => {
            const storedCart = localStorage.getItem('cart');
            return storedCart ? JSON.parse(storedCart) : {};
        });
        setCart((prevCart) => {
            const newCart = {...prevCart};
            const newItemId = newItem.id;

            if (newCart[newItemId]) {
                newCart[newItemId].currentStock = newItem.currentStock;
                newCart[newItemId].buyAmount = newCart[newItemId].buyAmount + newItem.buyAmount/2;
                newCart[newItemId].buyAmount = Math.min(newCart[newItemId].buyAmount, newCart[newItemId].currentStock)
            } else {
                newCart[newItemId] = newItem;
            }

            return newCart;
        });
        Util.triggerCartUpdate();
    };


    const countToKG = 1;
    const multiplier = 1000 / countToKG;
    const buttonAdd = (100 / countToKG);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const data = await Util.callBackend("cart/stores");
                setStores(data);
                setLoading(false);
            } catch (err) {
                setError("Failed to load stores. Please try again later.");
                setLoading(false);
            }
        }

        fetchStores();
        
        // const fetchItems = async () => {
        //     try {
        //         const data = await Util.callBackend("cart/items");
        //         setItems(data);
        //         setLoading(false);
        //     } catch (err) {
        //         setError("Failed to load items. Please try again later.");
        //         setLoading(false);
        //     }
        // };

        // fetchItems();
    }, []);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const data = await Util.callBackend(`cart/items/${selectedStore.storeId}`);
                setItems(data);
                setLoading(false);
            } catch (err) {
                setError("Failed to load items. Please try again later.");
                setLoading(false);
            }
        };

        if(selectedStore !== null)
            fetchItems();

    }, [selectedStore]);

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setQuantity(50);
        setPurchaseMessage(null);
    };

    const handleStoreClick = (store) => {
        setSelectedStore(store);
    };

    const closeModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            setSelectedItem(null);
        }, 300); // Match this with your animation duration (0.3s = 300ms)
    };

    const handleQuantityChange = (e) => {
        setQuantity(parseInt(e.target.value, 10));
    };

    const handlePurchase = async () => {
        if (!selectedItem || quantity < 1) return;

        setPurchasing(true);
        setPurchaseMessage(null);

        try {
            let unit = "";
            let amount = quantity * countToKG;
            if (amount < 1000) unit = "g's"
            else if (amount === 1000) unit = "kg"
            else unit = "kg's";

            if (selectedItem.currentStock < amount) {
                let unitStock = "";
                let stock = selectedItem.currentStock;
                if (stock < 1000) unitStock = "g's"
                else if (stock === 1000) unitStock = "kg"
                else unitStock = "kg's";

                if (unitStock.at(0) === 'k') stock = stock / 1000
                setPurchaseMessage({
                    type: "error",
                    text: "Unfortunately, we only have " + stock + "" + unitStock + " of " + selectedItem.ItemName + " available."
                });
                return
            }

            selectedItem.buyAmount = amount;
            if (unit.at(0) === 'k') amount = amount / 1000

            addItemToCart(selectedItem)

            setPurchaseMessage({
                type: "success",
                text: `Added ${amount}${unit} of ${selectedItem.ItemName} to cart.`
            });
        } catch (err) {
            setPurchaseMessage({
                type: "error",
                text: "Failed to add your items. Please try again."
            });
        } finally {
            setPurchasing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-xl font-semibold text-gray-600">Loading items...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-xl font-semibold text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 text-center">Item Gallery</h1>

            {selectedStore ? (
                <>
                    <button className='text-2xl font-bold mb-6 text-center'>Return to Store Selection</button>
                    <FilterBar selectedFilters={filters} setSelectedFilters={setFilters} />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {items
                            .filter(item => {
                                // If no filters, show all items
                                if (!filters || Object.keys(filters).length === 0) return true;

                                return Object.entries(filters).every(([key, value]) => {
                                    return item.category.includes(value);
                                });
                            })
                            .map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
                                    onClick={() => handleItemClick(item)}
                                >
                                    <div className="h-48 overflow-hidden">
                                        <img
                                            src={item.ItemPhotoLink || "/api/placeholder/400/300"}
                                            alt={item.ItemName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-lg mb-1 truncate text-center">{item.ItemName}</h3>
                                        <p className="text-green-600 font-medium text-center">
                                            ${item.ItemPrice.toFixed(2)} per kg
                                        </p>
                                    </div>
                                </div>
                            ))}

                    </div>

                    {/* Modal for selected item */}
                    {selectedItem && (
                        <div
                            className={`fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 modal-overlay ${isClosing ? 'fade-out' : ''}`}>
                            <div
                                className={`bg-white rounded-lg w-full overflow-hidden ${isMobile ? "max-w-xs" : "max-w-lg"} modal-content ${isClosing ? 'fade-out' : ''}`}>
                                <div className={`overflow-hidden ${isMobile ? "h-40" : "h-64"}`}>
                                    <img
                                        src={selectedItem.ItemPhotoLink || "/api/placeholder/400/300"}
                                        alt={selectedItem.ItemName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-6">
                                    <h2 className={`text-center ${isMobile ? "text-xl mb-2" : "text-2xl font-bold mb-2"}`}>{selectedItem.ItemName}</h2>
                                    <p className={`text-center ${isMobile ? "text-green-700 font-medium text-lg mb-3" : "text-green-700 text-xl font-semibold mb-4"}`}>${selectedItem.ItemPrice.toFixed(2)} per
                                        kg</p>

                                    {/* Quantity selector */}
                                    <div className="mb-6 text-center">
                                        <div
                                            className={`flex ${isMobile ? "flex-col" : "flex-row"} items-center justify-center`}>
                                            {/* Buttons with adjustments for spacing */}
                                            <button
                                                onClick={() => setQuantity((prev) => Math.max(0, prev - multiplier))}
                                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors mb-2"
                                            >
                                                -1kg
                                            </button>
                                            <button
                                                onClick={() => setQuantity((prev) => Math.max(0, prev - (multiplier / 10)))}
                                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors mb-2"
                                            >
                                                -100g
                                            </button>
                                            <button
                                                onClick={() => setQuantity((prev) => Math.max(0, prev - (multiplier / 20)))}
                                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors mb-2"
                                            >
                                                -{50}g
                                            </button>
                                            <span className="mx-4 text-lg font-medium mb-2">{quantity * countToKG < 1000
                                                ? `${quantity * countToKG}g`
                                                : `${(quantity * countToKG / 1000).toFixed(2)}kg`}</span>
                                            <button
                                                onClick={() => setQuantity((prev) => Math.min(selectedItem.currentStock, prev + (multiplier / 20)))}
                                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors mb-2"
                                            >
                                                +{50}g
                                            </button>
                                            <button
                                                onClick={() => setQuantity((prev) => Math.min(selectedItem.currentStock, prev + (multiplier / 10)))}
                                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors mb-2"
                                            >
                                                +100g
                                            </button>
                                            <button
                                                onClick={() => setQuantity((prev) => Math.min(selectedItem.currentStock, prev + (multiplier)))}
                                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors mb-2"
                                            >
                                                +1kg
                                            </button>
                                        </div>
                                    </div>

                                    {/* Total price calculation */}
                                    <p className="text-lg font-medium mb-4 text-center">
                                        Total: ${((quantity / multiplier) * selectedItem.ItemPrice).toFixed(2)}
                                    </p>

                                    {/* Purchase message */}
                                    {purchaseMessage && (
                                        <div className={`p-3 mb-4 rounded text-center ${
                                            purchaseMessage.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                        }`}>
                                            {purchaseMessage.text}
                                        </div>
                                    )}

                                    <div className="flex">
                                        <button
                                            onClick={closeModal}
                                            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-l hover:bg-red-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handlePurchase}
                                            disabled={purchasing}
                                            className={`flex-1 px-4 py-3 bg-green-600 text-white rounded-r hover:bg-green-700 transition-colors ${
                                                purchasing ? "opacity-70 cursor-not-allowed" : ""
                                            }`}
                                        >
                                            {purchasing ? "Processing..." : "Confirm"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {stores
                        .map((store, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
                                onClick={() => handleStoreClick(store)}
                            >
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={store.StorePhotoLink || "/api/placeholder/400/300"}
                                        alt={store.StoreName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-lg mb-1 truncate text-center">{store.StoreName}</h3>
                                </div>
                            </div>
                        ))}

                </div>
            )}
        </div>
    );
};

export default ItemPicker;
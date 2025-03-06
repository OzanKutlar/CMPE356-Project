import { useState, useEffect } from 'react';
import { ListBarDelivery } from './ListBarDelivery.jsx';
import { ButtonContext } from './ButtonContext';
import useMobileDetection from "../../mobileDetection.js";
import GoogleMapsDirections from './MapDirection.jsx';
import Util from '../../Util.js';
import NavbarDelivery from './NavbarDelivery.jsx';

const DeliveryPage = () => {
    const [activeTab, setActiveTab] = useState('A');
    const [isListBarOpen, setIsListBarOpen] = useState(false);
    const [AllOrders, setAllOrders] = useState({ 'A': [], 'B': [], 'C': [] });
    const isDesktop = !useMobileDetection();
    
    const [startAddress, setStartAddress] = useState("");
    const [targetAddress, setTargetAddress] = useState("");

    useEffect(() => {
        if (isDesktop) {
            //keep list bar open on desktop
            setIsListBarOpen(true);
        }
    }, [isDesktop]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await Util.callBackend('orders');
                setAllOrders(response);
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            }
        };

        fetchOrders();
    }, []);

    // Handle tab click
    const handleTabClick = (tab) => {
        if (tab === activeTab && !isDesktop) {
            // Toggle list bar on phone
            setIsListBarOpen(!isListBarOpen);
        } else {
            // Change active tab
            setActiveTab(tab);
            // In phone mode, make sure the list bar is open when changing tabs
            if (!isDesktop) {
                setIsListBarOpen(true);
            }
        }
    };

    //Helper functions
    const addOrderToTab = (order, tab) => {
        setAllOrders(prevOrders => ({
            ...prevOrders,
            [tab]: [...prevOrders[tab], order]
        }));
    };
    
    const removeOrderFromTab = (orderId, tab) => {
        setAllOrders(prevOrders => ({
            ...prevOrders,
            [tab]: prevOrders[tab].filter(order => order.order_id !== orderId) // Removes the order from the current tab's array
        }));
    };

    const sortTabByOrderId = (tab) => {
        setAllOrders(prevOrders => ({
            ...prevOrders,
            [tab]: [...prevOrders[tab]].sort((a, b) => a.order_id - b.order_id) // Sorts the current tab's array by order_id
        }));
    };

    //button handlers
    const handleTakeOrder = (order, tab, currentTab) => {
        addOrderToTab(order, tab);
        removeOrderFromTab(order.order_id, currentTab);
    };

    const handleDropOrder = (order, tab, currentTab) => {
        addOrderToTab(order, tab);
        removeOrderFromTab(order.order_id, currentTab);
        sortTabByOrderId(tab);
    };

    const handleComplete = (order, currentTab) => {
        removeOrderFromTab(order.order_id, currentTab);
    };

    //list rendering according to tab
    const renderListBar = () => {
        if (activeTab === 'A') {
            return <ListBarDelivery isDesktop={isDesktop} listContent={AllOrders[activeTab]} currentTab={'A'} />
        } else if (activeTab === 'B') {
            return <ListBarDelivery isDesktop={isDesktop} listContent={AllOrders[activeTab]} currentTab={'B'} />
        }
        return <h1>Error loading list bar</h1>;
    };

    return (
        <div className="flex flex-col h-screen">
            {/* Navbar */}
            <NavbarDelivery activeTab={activeTab} handleTabClick={handleTabClick} />

            {/* Main content area */}
            <div className={`flex flex-1 ${isDesktop ? 'flex-row' : 'flex-col'} overflow-y-auto`}>
                <ButtonContext.Provider value={{ handleTakeOrder, handleDropOrder, handleComplete }}>
                    {isListBarOpen && renderListBar()}
                </ButtonContext.Provider>

                <div className="flex-1 p-4 bg-white">
                    {//<GoogleMapsDirections startAddress={startAddress} targetAddress={targetAddress} />
                    }
                </div>
            </div>
        </div>
    );
};

export default DeliveryPage;
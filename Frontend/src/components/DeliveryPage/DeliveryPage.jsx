import { useState, useEffect, useRef } from 'react';
import { ListBarDelivery } from './ListBarDelivery.jsx';
import { ButtonContext } from './ButtonContext';
import useMobileDetection from "../../mobileDetection.js";
//import GoogleMapsDirections from './MapDirection.jsx';
import OpenLayerMap from './OpenLayerMap.jsx';
import Util from '../../Util.js';
import NavbarDelivery from './NavbarDelivery.jsx';

const DeliveryPage = () => {
    const isMounted = useRef(true);
    const userId = Util.savedUser.id;
    const [activeTab, setActiveTab] = useState('Waiting Orders');
    const [isListBarOpen, setIsListBarOpen] = useState(false);
    const [WaitingOrders, setWaitingOrders] = useState([]);
    const [TakenOrders, setTakenOrders] = useState([]);
    const isDesktop = !useMobileDetection();
    
    const [startLocation, setStartLocation] = useState("");
    const [destination, setDestination] = useState("");

    useEffect(() => {
        if (isDesktop) {
            //keep list bar open on desktop
            setIsListBarOpen(true);
            if(activeTab === null)
                setActiveTab("Waiting Orders");
        }
    }, [isDesktop]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response_unassigned = await Util.callBackend('delivery/get-unassigned-orders');
                const response_assigned = await Util.callBackend(`delivery/get-assigned-orders/${userId}`);
                setWaitingOrders(response_unassigned);
                setTakenOrders(response_assigned);
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            }
        };

        fetchOrders();
        
        async function setupWebSocket() {
            try {
              // Set explicit server URL - MAKE SURE THIS IS CORRECT
              const serverUrl = 'http://localhost:33000';
              
              if (isMounted) console.log('Initializing WebSocket...');
              
              // Initialize and wait for connection
              await Util.initializeWebSocket(serverUrl);
              
              if (isMounted) console.log('Connected! Subscribing to topics...');
              
              // Subscribe to order submission topic
              await Util.subscribeToTopic('/topic/unassigned-add', (data) => {
                if (!isMounted) return;
                console.log('Received unassigned order data:', data);
                updateWaitingOrdersWithArray(data);
              });
              
              // Subscribe to order assignment topic
              await Util.subscribeToTopic('/topic/order-assigned', (data) => {
                if (!isMounted) return;
                console.log('Received order assigned data:', data);
                removeOrderFromWaitingOrdersBySplitId(data.splitId);
              });
              
              if (isMounted) console.log('Successfully subscribed to all WebSocket topics');
            } catch (error) {
              console.error('Failed to setup WebSocket connection:', error);
              if (isMounted) console.log(`Connection error: ${error.message}`);
            }
          }
        setupWebSocket();

        return () => {
            isMounted.current = false;
            console.log('Component unmounting, cleaning up WebSocket connections');
            Util.unsubscribeFromTopic('/topic/unassigned-add');
            Util.unsubscribeFromTopic('/topic/order-assigned');
            Util.disconnectWebSocket();
          };
    }, []);

    // Handle tab click
    const handleTabClick = (tab) => {
        if (tab === activeTab && !isDesktop) {
            // Toggle list bar on phone
            setIsListBarOpen(!isListBarOpen);
            setActiveTab(null);
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
        if (tab === "Waiting Orders") {
            setWaitingOrders(prevOrders => [...prevOrders, order]);
        } else if (tab === "Taken Orders") {
            setTakenOrders(prevOrders => [...prevOrders, order]);
        }
    };

    const removeOrderFromTab = (splitId, tab) => {
        if (tab === "Waiting Orders") {
            setWaitingOrders(prevOrders => prevOrders.filter(order => order.splitId !== splitId));
        } else if (tab === "Taken Orders") {
            setTakenOrders(prevOrders => prevOrders.filter(order => order.splitId !== splitId));
        }
    };

    const updateWaitingOrdersWithArray = (newOrders) => {
        setWaitingOrders(prevOrders => {
            // Combine existing orders with new ones, removing duplicates based on splitId
            const existingSplitIds = new Set(prevOrders.map(order => order.splitId));
            const filteredNewOrders = newOrders.filter(order => !existingSplitIds.has(order.splitId));
            
            // Combine and sort all orders
            const updatedOrders = [...prevOrders, ...filteredNewOrders];
            return updatedOrders.sort((a, b) => a.splitId - b.splitId);
        });
    };

    const removeOrderFromWaitingOrdersBySplitId = (splitId) => {
        setWaitingOrders(prevOrders => prevOrders.filter(order => order.splitId !== splitId));
    };

    

    

    // TODO: update handlers to work properly
    //button handlers
    const handleTakeOrder = async (order, tab) => {
        const temp = order;
        const response = await Util.callBackend(`delivery/assign-order/${userId}/${order.splitId}`);
        if(typeof response === 'string'){
            if(response.startsWith("Conflict"))
                console.error(response);
            else
                console.error(response);

        } else {
            addOrderToTab(temp, tab);
        }
    };

    const handleDropOrder = async (order, currentTab) => {
        const response = await Util.callBackend(`delivery/drop-order/${order.splitId}`);
        if(response.startsWith("Failed")){
            console.error(response);
        } else {
            removeOrderFromTab(order.splitId, currentTab);
        }
    };

    const handleComplete = async (order, currentTab) => {
        const response = await Util.callBackend(`delivery/complete-order/${order.splitId}`);
        if(response.startsWith("Failed")){
            console.error(response);
        } else {
            removeOrderFromTab(order.splitId, currentTab);
        }
    };

    // //Helper functions
    // const addOrderToTab = (order, tab) => {
    //     setAllOrders(prevOrders => ({
    //         ...prevOrders,
    //         [tab]: [...prevOrders[tab], order]
    //     }));
    // };
    
    // const removeOrderFromTab = (orderId, tab) => {
    //     setAllOrders(prevOrders => ({
    //         ...prevOrders,
    //         [tab]: prevOrders[tab].filter(order => order.order_id !== orderId) // Removes the order from the current tab's array
    //     }));
    // };

    // const sortTabByOrderId = (tab) => {
    //     setAllOrders(prevOrders => ({
    //         ...prevOrders,
    //         [tab]: [...prevOrders[tab]].sort((a, b) => a.order_id - b.order_id) // Sorts the current tab's array by order_id
    //     }));
    // };

    // //button handlers
    // const handleTakeOrder = (order, tab, currentTab) => {
    //     addOrderToTab(order, tab);
    //     removeOrderFromTab(order.order_id, currentTab);
    // };

    // const handleDropOrder = (order, tab, currentTab) => {
    //     addOrderToTab(order, tab);
    //     removeOrderFromTab(order.order_id, currentTab);
    //     sortTabByOrderId(tab);
    // };

    // const handleComplete = (order, currentTab) => {
    //     removeOrderFromTab(order.order_id, currentTab);
    // };

    const handleMapRouting = (startLocation, destination) => {
        setStartLocation(startLocation);
        setDestination(destination);
    };

    //list rendering according to tab
    const renderListBar = () => {
        if (activeTab === 'Waiting Orders') {
            return <ListBarDelivery isDesktop={isDesktop} listContent={WaitingOrders} currentTab={activeTab} />
        } else if (activeTab === 'Taken Orders') {
            return <ListBarDelivery isDesktop={isDesktop} listContent={TakenOrders} currentTab={activeTab} />
        }
        return <h1>Error loading list bar</h1>;
    };

    return (
        <div className="flex flex-col h-screen">
            {/* Navbar */}
            <NavbarDelivery activeTab={activeTab} handleTabClick={handleTabClick} />

            {/* Main content area */}
            <div className={`flex flex-1 ${isDesktop ? 'flex-row' : 'flex-col'} overflow-y-auto`}>
                <div className="flex-none">
                <ButtonContext.Provider value={{ handleTakeOrder, handleDropOrder, handleComplete, handleMapRouting }}>
                    {isListBarOpen && renderListBar()}
                </ButtonContext.Provider>
                </div>
                <div className="flex-1 p-4 bg-white">
                    {//<GoogleMapsDirections startAddress={startLocation} targetAddress={destination} />
                    }
                    <OpenLayerMap startLocation={startLocation} destination={destination} />
                    
                </div>
            </div>
        </div>
    );
};

export default DeliveryPage;
import { ListBarDelivery } from './ListBarDelivery.jsx';
import { useState, useEffect } from 'react';
import useMobileDetection from "../../mobileDetection.js";
import GoogleMapsDirections from './MapDirection.jsx';
import Util from '../../Util.js';
import NavbarDelivery from './NavbarDelivery.jsx';
import UserProfile from '../Global/UserProfile';


const DeliveryPage = () => {
    const [activeTab, setActiveTab] = useState('A');
    const [isListBarOpen, setIsListBarOpen] = useState(false);
    const [AllOrders, setAllOrders] = useState({ 'A': [], 'B': [], 'C': [] });
    const isDesktop = !useMobileDetection();

    //const tabContents =

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

    const handleOrdersClick = (index) => {
        console.log(`in tab A ${index}`);
        // Add your button Z action here
    };

    const handleCurrentOrdersClick = (index) => {
        console.log(`in tab B ${index}`);
    }

    const renderListBar = () => {
        if (activeTab === 'A') {
            return <ListBarDelivery isDesktop={isDesktop} listContent={AllOrders[activeTab]} handleButtonClick={handleOrdersClick} />
        } else if (activeTab === 'B') {
            return <ListBarDelivery isDesktop={isDesktop} listContent={AllOrders[activeTab]} handleButtonClick={handleCurrentOrdersClick} />
        }
        return <h1>Error loading list bar</h1>;
    };
        
    //remove this when util's fake data works
    // const orders = {
    //   'A': [
    //     {
    //       address: "Item Title 1 of a list item that will be very long because it will hold address and addresses are long",
    //       content: [
    //         "This is the first line of extended information.",
    //         "This is the second line with more details.",
    //         "And here's a third line with additional context."
    //       ]
    //     },
    //     {
    //       address: "Item Title 2",
    //       content: [
    //         "Extended information for the second item.",
    //         "More details about this particular item."
    //       ]
    //     }
    //   ],
    //   'B': [],
    //   'C': []
    // };

    const targetAddress = "Yeniköy, Köybaşı Cd. No:166/B, 34464 Sarıyer/İstanbul";
    const startAddress = "Cibali, Kadir Has Cd., 34083 Cibali / Fatih/Fatih/İstanbul";
    return (
        <div className="flex flex-col h-screen">
            {/* Navbar */}
            <NavbarDelivery activeTab={activeTab} handleTabClick={handleTabClick} />

            {/* Main content area */}
            <div className={`flex flex-1 ${isDesktop ? 'flex-row' : 'flex-col'}`}>
                
                {isListBarOpen && renderListBar()}
                
                <div className="flex-1 p-4 bg-white">
                    <GoogleMapsDirections startAddress={startAddress} targetAddress={targetAddress} />
                </div>
            </div>
        </div>
    );
};

export default DeliveryPage;
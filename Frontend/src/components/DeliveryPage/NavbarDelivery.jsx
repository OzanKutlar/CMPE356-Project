import { useState, useEffect } from 'react';
import useMobileDetection from "../../mobileDetection.js";
import ProfileDropdown from './../NavbarElements/ProfileDropdown';
import OrderItem from './OrderItem.jsx';
import GoogleMapsDirections from './MapDirection.jsx';
import Util from '../../Util.js';

const ResponsiveNavbar = () => {
  const [activeTab, setActiveTab] = useState('A');
  const [isListBarOpen, setIsListBarOpen] = useState(false);
  const [tabContents, setTabContents] = useState({ 'A':[], 'B':[], 'C':[] });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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
            const response = await Util.callBackend('getOrders');
            setTabContents(response);
        } catch (error) {
            console.error('Failed to fetch recipes:', error);
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
    // Close profile dropdown if open
    setIsProfileOpen(false);
  };

  // Toggle profile dropdown
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleButtonZClick = (index) => {
    console.log(`Button Z clicked for item ${index}`);
    // Add your button Z action here
  };

  //remove this when util's fake data works
  // const tabContents = {
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

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <nav className="bg-gray-800 text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            {['A', 'B', 'C'].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded ${activeTab === tab ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                onClick={() => handleTabClick(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          
          {/* Profile dropdown */}
          <ProfileDropdown toggleProfile={toggleProfile} isProfileOpen={isProfileOpen} />
        </div>
      </nav>

      {/* Main content area */}
      <div className={`flex flex-1 ${isDesktop ? 'flex-row' : 'flex-col'}`}>
        {/* List Bar */}
        {isListBarOpen && (
          <div 
            className={`
              bg-gray-100 overflow-y-auto
              ${isDesktop 
                ? 'w-80 h-full border-r border-gray-300' 
                : 'w-full h-1/2 border-b border-gray-300'}
            `}
          >
            <h1 className="p-4 text-xl font-bold">List of {activeTab}</h1>
            {/* List content would go here */}
            <div className="p-2">
              {tabContents[activeTab].length > 0 ? (
                tabContents[activeTab].map((item, index) => (
                  <OrderItem
                    key={index}
                    address={item.address}
                    content={item.content}
                    onButtonZClick={() => handleButtonZClick(index)}
                  />
                ))
              ) : (
                <p className="p-4 text-gray-500">No orders available</p>
              )}
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 p-4 bg-white">
          <h2 className="text-xl">Main Content Area</h2>
          <p className="mt-2">This is where your main content would go.</p>
          <GoogleMapsDirections targetAddress={ "Yeniköy, Köybaşı Cd. No:166/B, 34464 Sarıyer/İstanbul" }/>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveNavbar;
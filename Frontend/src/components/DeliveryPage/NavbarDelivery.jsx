import { useState, useEffect } from 'react';
import useMobileDetection from "../../mobileDetection.js";

const ResponsiveNavbar = () => {
  const [activeTab, setActiveTab] = useState('A');
  const [isListBarOpen, setIsListBarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isDesktop = !useMobileDetection();
  
  useEffect(() => {
    if (isDesktop) {
      //keep list bar open on desktop
      setIsListBarOpen(true); 
    }
  }, [isDesktop]);
  
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
          <div className="relative">
            <button
              className="px-4 py-2 rounded hover:bg-gray-700"
              onClick={toggleProfile}
            >
              Me
            </button>
            
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded shadow-lg">
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-200">
                  Profile
                </button>
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-200">
                  Log out
                </button>
              </div>
            )}
          </div>
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
                ? 'w-64 h-full border-r border-gray-300' 
                : 'w-full h-1/2 border-b border-gray-300'}
            `}
          >
            <h1 className="p-4 text-xl font-bold">List of {activeTab}</h1>
            {/* List content would go here */}
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 p-4 bg-white">
          <h2 className="text-xl">Main Content Area</h2>
          <p className="mt-2">This is where your main content would go.</p>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveNavbar;
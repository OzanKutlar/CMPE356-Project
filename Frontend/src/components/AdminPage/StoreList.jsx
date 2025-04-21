import React, { useState, useEffect } from 'react';
import { Search, X, Plus, ChevronDown } from 'lucide-react';
import Util from "../../Util.js";

const StoreAssignment = () => {
    const [users, setUsers] = useState([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedStore, setSelectedStore] = useState(null);
    const [showUserPopup, setShowUserPopup] = useState(false);
    const [showStorePopup, setShowStorePopup] = useState(false);
    const [selectedStoreForUser, setSelectedStoreForUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchStores();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await Util.callBackend('admin/getUsers', {userID: Util.savedUser.id, roleFilter: "butcher"});
            setUsers(response);
        } catch (err) {
            setError('Error fetching users');
        } finally {
            setLoading(false);
        }
    };

    const fetchStores = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await Util.callBackend('admin/getStores', {userID: Util.savedUser.id});
            setStores(response);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserStore = async (userId) => {
        try {
            const response = await Util.callBackend('admin/getUserStore', {
                adminID: Util.savedUser.id,
                userID: userId});
            return response.storeID || null;
        } catch (err) {
            console.error('Error fetching user store:', err);
            return null;
        }
    };

    const fetchStoreManagers = async (storeId) => {
        try {
            const response = await Util.callBackend('admin/getStoreManagers', {storeID: storeId, userID: Util.savedUser.id});

            if(response.msg === "success"){
                return response.managers || [];
            }
            else{
                throw new Error(response.message || 'An unexpected error occurred while fetching store managers.');
            }

        } catch (err) {
            Util.CallGeneric(err.message, "Error");
            console.error('Error fetching store managers:', err);
            return [];
        }
    };

    const handleUserClick = async (user) => {
        setSelectedUser(user);
        const storeId = await fetchUserStore(user.id);
        setSelectedStoreForUser(storeId);
        setShowUserPopup(true);
    };

    const handleStoreClick = async (store) => {
        const managers = await fetchStoreManagers(store.storeId);
        if(managers !== []){
            setSelectedStore(store);
            store.managers = managers;
            setShowStorePopup(true);
        }
    };

    const handleSaveUserStore = async () => {
        try {
            const response = await Util.callBackend('admin/assignUserStore', {
                adminID: Util.savedUser.id,
                userID: selectedUser.id,
                storeID: selectedStoreForUser || -1
            });
            if (response.msg === "success") {
                handleClosePopup();
                // Refresh data
                await fetchUsers();
                await fetchStores();
            } else {
                throw new Error(response.message || 'Failed to save user store assignment');
            }
        } catch (err) {
            Util.CallGeneric(err.message, "Error");
        }
    };

    const handleAssignManager = async (managerId) => {
        try {
            const response = await Util.callBackend('admin/assignUserStore', {
                adminID: Util.savedUser.id,
                userId: managerId,
                storeID: selectedStore.storeId
            });
            if (response.msg === "success") {
                setShowDropdown(false);
                // Refresh store managers
                const managers = await fetchStoreManagers(selectedStore.storeId);
                setSelectedStore({...selectedStore, managers});
            } else {
                throw new Error(response.message || 'Failed to assign manager to store');
            }
        } catch (err) {
            Util.CallGeneric("Error assigning manager to store", "Error");
        }
    };

    const handleClosePopup = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowUserPopup(false);
            setShowStorePopup(false);
            setSelectedUser(null);
            setSelectedStore(null);
            setSelectedStoreForUser(null);
            setShowDropdown(false);
            setIsClosing(false);
        }, 500); // Match this with the animation/transition duration
    };

    const filteredUsers = users.filter(user =>
        !selectedStore?.managers?.some(manager => manager.id === user.id) &&
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/*<div className="bg-white shadow-md p-4">*/}
            {/*    <h1 className="text-2xl font-semibold text-gray-800">Store Assignment Management</h1>*/}
            {/*</div>*/}

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4">
                    <p>{error}</p>
                </div>
            )}

            <div className="flex flex-1 overflow-hidden p-4">
                {/* Managers Panel */}
                <div className="w-1/2 bg-white rounded-lg shadow-md p-4 mr-2 overflow-y-auto">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Managers</h2>
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {users.map(user => (
                                <div
                                    key={user.id}
                                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-all"
                                    onClick={() => handleUserClick(user)}
                                >
                                    <img
                                        src={user.profilePictureLink}
                                        alt={user.username}
                                        className="w-12 h-12 rounded-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/src/assets/default-avatar.jpg";
                                        }}
                                    />
                                    <div className="ml-3">
                                        <h3 className="font-medium text-gray-800">{user.username}</h3>
                                        <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stores Panel */}
                <div className="w-1/2 bg-white rounded-lg shadow-md p-4 ml-2 overflow-y-auto">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Stores</h2>
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {stores.map(store => (
                                <div
                                    key={store.storeId}
                                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-all"
                                    onClick={() => handleStoreClick(store)}
                                >
                                    <img
                                        src={store.logo}
                                        alt={store.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/src/assets/default-store.jpg";
                                        }}
                                    />
                                    <div className="ml-3">
                                        <h3 className="font-medium text-gray-800">{store.name}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* User Popup */}
            {showUserPopup && (
                <div className={`storeAss-backdrop ${isClosing ? 'storeAss-fadeOut' : ''}`}>
                    <div className={`bg-white rounded-xl w-full max-w-2xl p-6 ${isClosing ? 'storeAss-slideDown' : 'storeAss-slideUp'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">Manager Details</h2>
                            <button
                                onClick={handleClosePopup}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex items-center mb-6">
                            <img
                                src={selectedUser.profilePictureLink}
                                alt={selectedUser.username}
                                className="w-20 h-20 rounded-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/src/assets/default-avatar.jpg";
                                }}
                            />
                            <div className="ml-4">
                                <h3 className="text-xl font-semibold">{selectedUser.name + " " + selectedUser.surname}</h3>
                                <p className="text-gray-600 capitalize">{selectedUser.role}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium">{selectedUser.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium">{selectedUser.phone}</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Assigned Store
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedStoreForUser || ""}
                                    onChange={(e) => setSelectedStoreForUser(e.target.value || null)}
                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                                >
                                    <option value="">None</option>
                                    {stores.map(store => (
                                        <option key={store.storeId} value={store.storeId}>
                                            {store.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleSaveUserStore}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Store Popup */}
            {showStorePopup && (
                <div className={`storeAss-backdrop ${isClosing ? 'storeAss-fadeOut' : ''}`}>
                    <div className={`bg-white rounded-xl w-full max-w-2xl p-6 ${isClosing ? 'storeAss-slideDown' : 'storeAss-slideUp'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">Store Details</h2>
                            <button
                                onClick={handleClosePopup}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex items-center mb-6">
                            <img
                                src={selectedStore.logo}
                                alt={selectedStore.name}
                                className="w-20 h-20 rounded-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/src/assets/default-store.jpg";
                                }}
                            />
                            <div className="ml-4">
                                <h3 className="text-xl font-semibold">{selectedStore.name}</h3>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="font-medium">{selectedStore.address}</p>
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium text-gray-700">Assigned Managers</h3>
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center text-blue-600 hover:text-blue-800"
                                >
                                    <Plus size={18} />
                                    <span className="ml-1">Add Manager</span>
                                </button>
                            </div>

                            {selectedStore.managers && selectedStore.managers.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedStore.managers.map(manager => (
                                        <div key={manager.userId} className="flex items-center p-2 bg-gray-50 rounded-md">
                                            <img
                                                src={manager.profilePhotoUrl}
                                                alt={manager.name}
                                                className="w-8 h-8 rounded-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "/src/assets/default-avatar.jpg";
                                                }}
                                            />
                                            <div className="ml-2">
                                                <p className="font-medium">{manager.name}</p>
                                                <p className="text-xs text-gray-500 capitalize">{manager.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No managers assigned to this store</p>
                            )}

                            {/* Dropdown for adding managers */}
                            {showDropdown && (
                                <div className="mt-2 border rounded-md shadow-sm bg-white">
                                    <div className="p-2 border-b">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search managers..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-8 pr-2 py-1 text-sm border rounded"
                                            />
                                            <Search size={16} className="absolute left-2 top-2 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto">
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map(user => (
                                                <div
                                                    key={user.id}
                                                    className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() => handleAssignManager(user.id)}
                                                >
                                                    <img
                                                        src={user.profilePictureLink}
                                                        alt={user.username}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = "/src/assets/default-avatar.jpg";
                                                        }}
                                                    />
                                                    <div className="ml-2">
                                                        <p className="font-medium">{user.username}</p>
                                                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="p-2 text-gray-500 text-center">No matching managers found</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                .storeAss-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: rgba(0, 0, 0, 0.3);
                    backdrop-filter: blur(4px);
                    z-index: 1000;
                    animation: storeAss-fadeIn 0.3s ease-in-out;
                    transition: opacity 0.5s ease-in-out;
                }

                .storeAss-fadeOut {
                    opacity: 0;
                    backdrop-filter: blur(0);
                }

                .storeAss-slideUp {
                    animation: storeAss-slideUp 0.3s ease-in-out;
                }

                .storeAss-slideDown {
                    animation: storeAss-slideDown 0.5s ease-in-out;
                }

                @keyframes storeAss-fadeIn {
                    from { opacity: 0; backdrop-filter: blur(0); }
                    to { opacity: 1; backdrop-filter: blur(4px); }
                }

                @keyframes storeAss-slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }

                @keyframes storeAss-slideDown {
                    from { transform: translateY(0); }
                    to { transform: translateY(100%); }
                }
            `}</style>
        </div>
    );
};

export default StoreAssignment;
import { useState, useEffect } from 'react';
import { Search, X, Plus, Trash, Edit, Building, MapPin, User, AlertCircle } from 'lucide-react';
import Util from "../../Util.js";

const StoreList = () => {
    const [users, setUsers] = useState([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedStore, setSelectedStore] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [storeSearchQuery, setStoreSearchQuery] = useState('');
    const [assignedStoreId, setAssignedStoreId] = useState(null);
    const [showStoreModal, setShowStoreModal] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [newStoreName, setNewStoreName] = useState('');
    const [newStoreAddress, setNewStoreAddress] = useState('');
    const [newStoreLogo, setNewStoreLogo] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [addingStore, setAddingStore] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [managerToRemove, setManagerToRemove] = useState(null);
    const [isDeleteModalClosing, setIsDeleteModalClosing] = useState(false);
    const [notification, setNotification] = useState({ message: '', isLoading: false, isError: false });

    let timeOutConst = null;

    const showNotification = (message, isError = false) => {
        if (timeOutConst != null) {
            clearTimeout(timeOutConst);
            timeOutConst = null;
        }
        setNotification({ message, isLoading: false, isError });
        timeOutConst = setTimeout(() => setNotification({ message: '', isLoading: false, isError: false }), 5000);
    };

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
        } catch (error) {
            console.error('Error fetching users:', error);
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
        } catch (error) {
            console.error('Error fetching stores:', error);
            setError('Error fetching stores');
        } finally {
            setLoading(false);
        }
    };

    const fetchStoreManagers = async (storeId) => {
        try {
            const response = await Util.callBackend('admin/getStoreManagers', {
                storeID: storeId, 
                userID: Util.savedUser.id
            });
            
            return response.msg === "success" ? response.managers || [] : [];
        } catch (error) {
            console.error('Error fetching store managers:', error);
            Util.CallGeneric("Error fetching store managers", "Error");
            return [];
        }
    };

    const fetchUserStore = async (userId) => {
        try {
            const response = await Util.callBackend('admin/getUserStore', {
                adminID: Util.savedUser.id,
                userID: userId
            });
            return response.storeID || null;
        } catch (error) {
            console.error('Error fetching user store:', error);
            return null;
        }
    };

    const handleUserClick = async (user) => {
        const storeId = await fetchUserStore(user.id);
        setSelectedUser(user);
        setAssignedStoreId(storeId);
    };

    const handleStoreClick = async (store) => {
        const managers = await fetchStoreManagers(store.storeId);
        store.managers = managers;
        setSelectedStore(store);
    };

    const assignUserToStore = async (storeId) => {
        if (!selectedUser) return;
        
        try {
            const response = await Util.callBackend('admin/assignUserStore', {
                adminID: Util.savedUser.id,
                userID: selectedUser.id,
                storeID: storeId || -1
            });
            
            if (response.msg === "success") {
                setAssignedStoreId(storeId);
                setSuccessMessage('Store assignment updated successfully');
                setTimeout(() => setSuccessMessage(''), 3000);
                await fetchStores(); // Refresh stores list to update managers
            } else {
                Util.CallGeneric(response.message || "Failed to update store assignment", "Error");
            }
        } catch (error) {
            console.error('Error updating store assignment:', error);
            Util.CallGeneric("Error updating store assignment", "Error");
        }
    };

    const removeManagerFromStore = async (managerId) => {
        if (!selectedStore) return;
        
        try {
            const response = await Util.callBackend('admin/assignUserStore', {
                adminID: Util.savedUser.id,
                userID: managerId,
                storeID: -1 // -1 means remove assignment
            });
            
            if (response.msg === "success") {
                // Update the local state by removing this manager
                setSelectedStore({
                    ...selectedStore,
                    managers: selectedStore.managers.filter(manager => manager.userId !== managerId)
                });
                setSuccessMessage('Manager removed successfully');
                setTimeout(() => setSuccessMessage(''), 3000);
                
                // If the selected user is this manager, update their assigned store too
                if (selectedUser && selectedUser.id === managerId) {
                    setAssignedStoreId(null);
                }
            } else {
                Util.CallGeneric(response.message || "Failed to remove manager", "Error");
            }
        } catch (error) {
            console.error('Error removing manager:', error);
            Util.CallGeneric("Error removing manager", "Error");
        }
    };

    const addManagerToStore = async (managerId) => {
        if (!selectedStore) return;
        
        try {
            const response = await Util.callBackend('admin/assignUserStore', {
                adminID: Util.savedUser.id,
                userID: managerId,
                storeID: selectedStore.storeId
            });
            
            if (response.msg === "success") {
                // Find the manager in users list to add to store.managers
                const manager = users.find(user => user.id === managerId);
                if (manager) {
                    const managerObj = {
                        userId: manager.id,
                        name: manager.username,
                        email: manager.email,
                        profilePhotoUrl: manager.profilePictureLink
                    };
                    
                    setSelectedStore({
                        ...selectedStore,
                        managers: [...selectedStore.managers, managerObj]
                    });
                    setSuccessMessage('Manager added successfully');
                    setTimeout(() => setSuccessMessage(''), 3000);
                    
                    // If the selected user is this manager, update their assigned store too
                    if (selectedUser && selectedUser.id === managerId) {
                        setAssignedStoreId(selectedStore.storeId);
                    }
                }
            } else {
                Util.CallGeneric(response.message || "Failed to add manager", "Error");
            }
        } catch (error) {
            console.error('Error adding manager:', error);
            Util.CallGeneric("Error adding manager", "Error");
        }
    };

    const handleShowAddStoreModal = () => {
        setNewStoreName('');
        setNewStoreAddress('');
        setImageFile(null);
        setNewStoreLogo('');
        setIsClosing(false);
        setShowStoreModal(true);
    };

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowStoreModal(false);
            setIsClosing(false);
        }, 300);
    };

    const handleImageChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onloadend = async () => {
                setImageFile(URL.createObjectURL(file));

                try {
                    // Get only the base64 data part (after the comma)
                    const base64Data = reader.result.split(',')[1];
                    const fileType = file.name.split('.').pop();
                    const userID = Util.savedUser.id;

                    // More aggressive sanitization - only allow alphanumeric and standard base64 chars
                    const sanitizedData = base64Data.replace(/[^A-Za-z0-9+/=]/g, '');

                    console.log("About to upload image data. File type:", fileType);
                    setNotification({ message: 'Uploading image...', isLoading: true, isError: false });

                    const data = await Util.callBackend("image/upload", {}, {
                        userID: userID,
                        pictureData: sanitizedData,
                        fileName: fileType
                    });
                    
                    if (data.msg === "success") {
                        console.log("Image upload successful. Received filename:", data.url);
                        console.log("Type of filename:", typeof data.url);
                        
                        // Store just the filename (now in format: user_ID_timestamp.ext)
                        setNewStoreLogo(data.url);
                        
                        // For display, we need the full URL
                        const fullImageUrl = Util.getImageFromBackend(data.url);
                        console.log("Generated full image URL for display:", fullImageUrl);
                        setImageFile(fullImageUrl);
                        
                        showNotification('Image uploaded successfully');
                    } else {
                        console.error(data.message);
                        showNotification("Error uploading image: " + data.message, true);
                    }
                } catch (error) {
                    console.error("Error uploading image:", error);
                    showNotification("Error uploading image. Please try a different image.", true);
                } finally {
                    setNotification(prev => ({ ...prev, isLoading: false }));
                }
            };

            reader.onerror = () => {
                console.error("Error reading file");
                showNotification("Error reading file. Please try again.", true);
            };

            reader.readAsDataURL(file);
        }
    };

    const handleAddStore = async () => {
        if (!newStoreName.trim() || !newStoreAddress.trim() || !newStoreLogo) {
            showNotification("Please fill all required fields", true);
            return;
        }

        setAddingStore(true);
        setNotification({ message: 'Adding store...', isLoading: true, isError: false });
        
        // Log the data we're about to send
        console.log("Preparing to add store with the following data:");
        console.log("Store Name:", newStoreName, "- Type:", typeof newStoreName);
        console.log("Store Address:", newStoreAddress, "- Type:", typeof newStoreAddress);
        console.log("Store Logo (filename only):", newStoreLogo, "- Type:", typeof newStoreLogo);
        
        try {
            // Let's try a different approach for non-ASCII characters
            const requestData = {
                storeName: newStoreName,
                storeAddress: newStoreAddress,
                storeLogo: newStoreLogo // Just the filename
            };
            
            console.log("Final request payload:", JSON.stringify(requestData, null, 2));
            
            // Use callBackend for store addition
            const responseData = await Util.callBackend('admin/addStore', {
                adminId: Util.savedUser.id
            }, requestData);
            
            if (responseData.msg === "success") {
                handleCloseModal();
                showNotification('Store added successfully');
                await fetchStores(); // Refresh stores list
            } else {
                showNotification(responseData.message || "Failed to add store", true);
                console.error("Server returned error:", responseData.message);
            }
        } catch (error) {
            console.error('Error adding store:', error);
            showNotification("Error adding store. Please try again.", true);
        } finally {
            setAddingStore(false);
            setNotification(prev => ({ ...prev, isLoading: false }));
        }
    };

    // Filter users not assigned to the selected store
    const availableManagers = selectedStore 
        ? users.filter(user => 
            !selectedStore.managers.some(manager => manager.userId === user.id) &&
            user.username.toLowerCase().includes(searchQuery.toLowerCase()))
        : [];

    // Filter stores by search query
    const filteredStores = stores.filter(store => 
        store.name.toLowerCase().includes(storeSearchQuery.toLowerCase())
    );

    const openDeleteModal = (manager, e) => {
        e.stopPropagation();
        setManagerToRemove(manager);
        setIsDeleteModalClosing(false);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalClosing(true);
        setTimeout(() => {
            setShowDeleteModal(false);
            setManagerToRemove(null);
            setIsDeleteModalClosing(false);
        }, 300);
    };

    const confirmRemoveManager = async () => {
        if (!managerToRemove || !selectedStore) return;
        
        try {
            await removeManagerFromStore(managerToRemove.userId);
            closeDeleteModal();
        } catch (error) {
            console.error('Error removing manager:', error);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4">
                    <p>{error}</p>
                </div>
            )}
            
            {successMessage && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 m-4">
                    <p>{successMessage}</p>
                </div>
            )}

            {/* Notification Toast */}
            {notification.message && (
                <div className={`fixed right-4 bottom-4 p-4 rounded-lg shadow-2xl transition-all transform translate-y-0 opacity-100 flex items-center z-[2000] ${notification.isError ? 'bg-red-100 text-red-700 border-l-4 border-red-500' : 'bg-green-100 text-green-700 border-l-4 border-green-500'}`}>
                    <div className={`mr-3 p-1 rounded-full ${notification.isError ? 'bg-red-200' : 'bg-green-200'}`}>
                        {notification.isLoading ? (
                            <div className="h-6 w-6 border-2 border-t-transparent rounded-full animate-spin"></div>
                        ) : notification.isError ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>
                    <span className="font-medium">{notification.message}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-hidden p-4">
                {/* Managers Panel */}
                <div className="bg-white rounded-lg shadow-md p-4 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-700">Managers</h2>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search managers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 pr-4 py-2 border rounded-lg"
                            />
                            <Search size={16} className="absolute left-2 top-3 text-gray-400" />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {users
                                .filter(user => user.username.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(user => (
                                <div
                                    key={user.id}
                                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                                        selectedUser && selectedUser.id === user.id 
                                            ? 'bg-blue-50 border-2 border-blue-300' 
                                            : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                                    onClick={() => handleUserClick(user)}
                                >
                                    <div className="flex-shrink-0">
                                        <img
                                            src={user.profilePictureLink}
                                            alt={user.username}
                                            className="w-12 h-12 rounded-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/src/assets/default-avatar.jpg";
                                            }}
                                        />
                                    </div>
                                    <div className="ml-3 flex-grow">
                                        <h3 className="font-medium text-gray-800">{user.username}</h3>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stores Panel */}
                <div className="bg-white rounded-lg shadow-md p-4 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-700">Stores</h2>
                        <div className="flex gap-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search stores..."
                                    value={storeSearchQuery}
                                    onChange={(e) => setStoreSearchQuery(e.target.value)}
                                    className="pl-8 pr-4 py-2 border rounded-lg"
                                />
                                <Search size={16} className="absolute left-2 top-3 text-gray-400" />
                            </div>
                            <button 
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                onClick={handleShowAddStoreModal}
                            >
                                <Plus size={16} className="mr-1" />
                                Add Store
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredStores.map(store => (
                                <div
                                    key={store.storeId}
                                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                                        selectedStore && selectedStore.storeId === store.storeId 
                                            ? 'bg-blue-50 border-2 border-blue-300' 
                                            : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                                    onClick={() => handleStoreClick(store)}
                                >
                                    <div className="flex-shrink-0">
                                        <img
                                            src={store.logo}
                                            alt={store.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/src/assets/default-store.jpg";
                                            }}
                                        />
                                    </div>
                                    <div className="ml-3 flex-grow">
                                        <h3 className="font-medium text-gray-800">{store.name}</h3>
                                        <p className="text-sm text-gray-500">{store.address}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Details Panel */}
            <div className="bg-white rounded-lg shadow-md p-4 m-4">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Manager Details */}
                    <div className="lg:w-1/2">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
                            <User size={20} className="mr-2" />
                            Manager Details
                        </h2>
                        
                        {selectedUser ? (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center mb-4">
                                    <img
                                        src={selectedUser.profilePictureLink}
                                        alt={selectedUser.username}
                                        className="w-16 h-16 rounded-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/src/assets/default-avatar.jpg";
                                        }}
                                    />
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold">{selectedUser.name} {selectedUser.surname}</h3>
                                        <p className="text-gray-600">{selectedUser.email}</p>
                                        <p className="text-gray-500">{selectedUser.phone}</p>
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Assigned Store
                                    </label>
                                    <div className="flex">
                                        <select
                                            value={assignedStoreId || ""}
                                            onChange={(e) => assignUserToStore(e.target.value || null)}
                                            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
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
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
                                Select a manager to view and edit details
                            </div>
                        )}
                    </div>
                    
                    {/* Store Details */}
                    <div className="lg:w-1/2">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
                            <Building size={20} className="mr-2" />
                            Store Details
                        </h2>
                        
                        {selectedStore ? (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center mb-4">
                                    <img
                                        src={selectedStore.logo}
                                        alt={selectedStore.name}
                                        className="w-16 h-16 rounded-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/src/assets/default-store.jpg";
                                        }}
                                    />
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold">{selectedStore.name}</h3>
                                        <p className="text-gray-600 flex items-center">
                                            <MapPin size={16} className="mr-1" />
                                            {selectedStore.address}
                                        </p>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Store Managers
                                    </label>
                                    
                                    {selectedStore.managers && selectedStore.managers.length > 0 ? (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {selectedStore.managers.map(manager => (
                                                <div key={manager.userId} className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm">
                                                    <div className="flex items-center">
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
                                                            <p className="text-xs text-gray-500">{manager.email}</p>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={(e) => openDeleteModal(manager, e)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">No managers assigned to this store</p>
                                    )}
                                    
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Add Manager
                                        </label>
                                        
                                        {availableManagers.length > 0 ? (
                                            <div className="max-h-48 overflow-y-auto border rounded-md divide-y">
                                                {availableManagers.map(user => (
                                                    <div
                                                        key={user.id}
                                                        className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer"
                                                        onClick={() => addManagerToStore(user.id)}
                                                    >
                                                        <div className="flex items-center">
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
                                                                <p className="text-xs text-gray-500">{user.email}</p>
                                                            </div>
                                                        </div>
                                                        <button className="text-blue-500 hover:text-blue-700">
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">All managers already assigned to this store</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
                                Select a store to view and edit details
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Store Modal */}
            {showStoreModal && (
                <div className="store-modal-wrapper">
                    {/* Background Overlay */}
                    <div className="store-modal-overlay" onClick={handleCloseModal}></div>

                    {/* Popup */}
                    <div className={`store-modal ${isClosing ? 'closing' : 'show'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Add New Store</h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        {/* Image upload */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Store Logo
                            </label>
                            <div 
                                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => document.getElementById('store-logo-input').click()}
                            >
                                {imageFile ? (
                                    <div className="relative">
                                        <img
                                            src={imageFile}
                                            alt="Store Logo Preview"
                                            className="w-32 h-32 mx-auto rounded-full object-cover"
                                        />
                                        <div className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-md">
                                            <Edit size={16} className="text-gray-600" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-4">
                                        <Plus size={48} className="mx-auto text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-500">Click to upload logo</p>
                                    </div>
                                )}
                                <input
                                    id="store-logo-input"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </div>
                        </div>
                        
                        {/* Store details inputs */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Store Name
                            </label>
                            <input
                                type="text"
                                value={newStoreName}
                                onChange={(e) => setNewStoreName(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter store name"
                            />
                        </div>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Store Address
                            </label>
                            <input
                                type="text"
                                value={newStoreAddress}
                                onChange={(e) => setNewStoreAddress(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter store address"
                            />
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddStore}
                                className={`px-4 py-2 rounded-md text-white flex-1 transition-colors ${
                                    !newStoreName || !newStoreAddress || !newStoreLogo
                                        ? 'bg-blue-300 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {addingStore ? 'Adding...' : 'Add Store'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="delete-modal-wrapper">
                    {/* Background Overlay */}
                    <div className="delete-modal-overlay" onClick={closeDeleteModal}></div>

                    {/* Popup */}
                    <div className={`delete-modal ${isDeleteModalClosing ? 'closing' : 'show'}`}>
                        <div className="flex items-center mb-6">
                            <div className="bg-red-100 p-3 rounded-full mr-4">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">Confirm Removal</h3>
                        </div>

                        {managerToRemove && (
                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                    <span className="text-gray-600 font-medium text-left">Name:</span>
                                    <span className="col-span-2 text-gray-800">{managerToRemove.name}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-gray-600 font-medium text-left">Email:</span>
                                    <span className="col-span-2 text-gray-800">{managerToRemove.email}</span>
                                </div>
                            </div>
                        )}

                        <p className="text-gray-700 font-medium mb-8 text-center">
                            Do you want to remove this manager from the store?
                        </p>

                        <div className="flex justify-between space-x-4">
                            <button
                                onClick={closeDeleteModal}
                                className="px-5 py-2.5 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRemoveManager}
                                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors font-medium shadow-sm"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add CSS for both modals */}
            <style>{`
                /* Store Modal Styles */
                .store-modal-wrapper {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    opacity: 0;
                    animation: fadeIn 0.3s ease-out forwards;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .store-modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(5px);
                    z-index: 1;
                }

                .store-modal {
                    position: relative;
                    background: white;
                    padding: 2rem;
                    border-radius: 0.75rem;
                    width: 100%;
                    max-width: 28rem;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    z-index: 2;
                    transform: scale(0.95) translateY(20px);
                    opacity: 0;
                    transition: transform 0.3s ease-out, opacity 0.3s ease-out;
                }

                .store-modal.show {
                    transform: scale(1) translateY(0);
                    opacity: 1;
                }

                .store-modal.closing {
                    transform: scale(0.95) translateY(20px);
                    opacity: 0;
                }

                /* Delete Modal Styles */
                .delete-modal-wrapper {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    opacity: 0;
                    animation: fadeIn 0.3s ease-out forwards;
                }

                .delete-modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(5px);
                    z-index: 1;
                }

                .delete-modal {
                    position: relative;
                    background: white;
                    padding: 2rem;
                    border-radius: 0.75rem;
                    width: 100%;
                    max-width: 28rem;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    z-index: 2;
                    transform: scale(0.95) translateY(20px);
                    opacity: 0;
                    transition: transform 0.3s ease-out, opacity 0.3s ease-out;
                }

                .delete-modal.show {
                    transform: scale(1) translateY(0);
                    opacity: 1;
                }

                .delete-modal.closing {
                    transform: scale(0.95) translateY(20px);
                    opacity: 0;
                }
            `}</style>

        </div>
    );
};

export default StoreList;
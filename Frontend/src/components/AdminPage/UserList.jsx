import Util from "../../Util.js";
import { useState, useEffect } from 'react';
import { Users, Search, ChevronUp, ChevronDown, Trash2, AlertCircle } from 'lucide-react';
import '../Global/Styles/TableStyle.css';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [notification, setNotification] = useState({ message: '', isLoading: false, isError: false });
    const [roleOptions] = useState(['Customer', 'Admin', 'Butcher', 'Delivery Driver']);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [filteredUsers, setFilteredUsers] = useState(users);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isModalClosing, setIsModalClosing] = useState(false);

    let timeOutConst = null;

    const showNotification = (message, isError = false) => {
        if (timeOutConst != null) {
            clearTimeout(timeOutConst);
            timeOutConst = null;
        }
        setNotification({ message, isLoading: false, isError });
        timeOutConst = setTimeout(() => setNotification({ message: '', isLoading: false, isError: false }), 5000);
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await Util.callBackend('admin/getUsers', { userID: Util.savedUser.id });
            setUsers(response);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setIsModalClosing(false);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setIsModalClosing(true);
        setTimeout(() => {
            setShowDeleteModal(false);
            setUserToDelete(null);
            setIsModalClosing(false);
        }, 300); // Match this with the CSS transition duration
    };

    const deleteUser = async () => {
        if (!userToDelete) return;
        setNotification({ message: '', isLoading: true, isError: false });
        try {
            const response = await Util.callBackend(`admin/delUserAdmin`, {
                userID: userToDelete.id,
                adminID: Util.savedUser.id
            });
            
            if (response.msg === "error") {
                showNotification(response.message || 'Failed to delete user', true);
            } else {
                setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userToDelete.id));
                if (selectedUser && selectedUser.id === userToDelete.id) {
                    setSelectedUser(null);
                }
                closeDeleteModal();
                showNotification("User successfully deleted");
            }
        } catch (err) {
            showNotification(err.message || "An error occurred while deleting the user", true);
        } finally {
            setNotification(prev => ({...prev, isLoading: false}));
        }
    };

    const changeUserRole = async (userId, newRole) => {
        newRole = newRole.toLowerCase();
        setNotification({ message: '', isLoading: true, isError: false });
        try {
            const response = await Util.callBackend(`admin/changeUserRole`, {
                userID: userId,
                newRole: newRole,
                adminID: Util.savedUser.id
            });
            
            if (response.msg === "error") {
                showNotification(response.message || 'Failed to change user role', true);
            } else {
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user.id === userId ? { ...user, role: newRole } : user
                    )
                );
                if (selectedUser && selectedUser.id === userId) {
                    setSelectedUser((prev) => ({ ...prev, role: newRole }));
                }
                showNotification("User role changed successfully");
            }
        } catch (err) {
            showNotification(err.message || "An error occurred while changing the role", true);
        } finally {
            setNotification(prev => ({...prev, isLoading: false}));
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle search and sorting
    useEffect(() => {
        setLoading(true);
        // Use timeout to allow UI to update before filtering/sorting
        const timeoutId = setTimeout(() => {
            // Filter users based on search term
            let filtered = users.filter(user =>
                Object.values(user).some(
                    value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
            // Sort users if sortField is set
            if (sortField) {
                filtered.sort((a, b) => {
                    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
                    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
                    return 0;
                });
            }
            setFilteredUsers(filtered);
            setLoading(false);
        }, 10);
        return () => clearTimeout(timeoutId);
    }, [users, searchTerm, sortField, sortDirection]);

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

    return (
        <div className="flex p-4 bg-gray-100 min-h-screen flex-col">
            <div className="w-full mx-auto flex-grow flex flex-col px-4 lg:px-30">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 mt-5">
                    <div className="flex items-center mb-4 md:mb-0">
                        <Users className="h-8 w-8 text-blue-600 mr-2" />
                        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                    </div>
                    {/* Search */}
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                </div>

                {/* Notification */}
                {notification.isLoading && (
                    <div className="mb-4 bg-blue-50 text-blue-700 p-4 rounded-lg flex items-center justify-center">
                        <div className="mr-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                        Processing...
                    </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-xl shadow-lg flex-grow flex flex-col mb-8 overflow-hidden">
                    <div className="overflow-auto flex-grow" style={{ maxHeight: 'calc(100vh - 200px)', minHeight: '400px' }}>
                        {loading ? (
                            <div className="flex items-center justify-center py-20 text-center">
                                <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
                                <p className="ml-4 text-xl font-semibold text-blue-500">Loading users...</p>
                            </div>
                        ) : (
                            <table className="w-full table-fixed border-collapse">
                                <thead className="bg-gray-200 sticky top-0 z-5 shadow-sm">
                                    <tr>
                                        <th className="w-1/12 px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-300 border-r border-gray-200 rounded-tl-xl"
                                            onClick={() => handleSort('name')}>
                                            <span className="flex items-center justify-between">
                                                Name
                                                {renderSortIndicator('name')}
                                            </span>
                                        </th>
                                        <th className="w-1/12 px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-300 border-r border-gray-200"
                                            onClick={() => handleSort('surname')}>
                                            <span className="flex items-center justify-between">
                                                Surname
                                                {renderSortIndicator('surname')}
                                            </span>
                                        </th>
                                        <th className="w-2/12 px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-300 border-r border-gray-200"
                                            onClick={() => handleSort('username')}>
                                            <span className="flex items-center justify-between">
                                                Username
                                                {renderSortIndicator('username')}
                                            </span>
                                        </th>
                                        <th className="w-2/12 px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-300 border-r border-gray-200"
                                            onClick={() => handleSort('role')}>
                                            <span className="flex items-center justify-between">
                                                Role
                                                {renderSortIndicator('role')}
                                            </span>
                                        </th>
                                        <th className="w-3/12 px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-300 border-r border-gray-200"
                                            onClick={() => handleSort('email')}>
                                            <span className="flex items-center justify-between">
                                                Email
                                                {renderSortIndicator('email')}
                                            </span>
                                        </th>
                                        <th className="w-2/12 px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-300 border-r border-gray-200"
                                            onClick={() => handleSort('phone')}>
                                            <span className="flex items-center justify-between">
                                                Phone
                                                {renderSortIndicator('phone')}
                                            </span>
                                        </th>
                                        <th className="w-1/12 px-3 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tr-xl">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user, index) => (
                                            <tr key={user.id}
                                                className={`hover:bg-blue-100 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50 bg-opacity-30'}`}>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-left text-gray-500 border-r border-gray-200 truncate">{user.name}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-left text-gray-500 border-r border-gray-200 truncate">{user.surname}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-left text-gray-500 border-r border-gray-200 truncate">{user.username}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => changeUserRole(user.id, e.target.value)}
                                                        className="block w-full py-1 px-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        disabled={notification.isLoading}
                                                    >
                                                        {roleOptions.map((role) => (
                                                            <option key={role} value={role.toLowerCase()}>
                                                                {role}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-left text-gray-500 border-r border-gray-200 truncate">{user.email}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-left text-gray-500 border-r border-gray-200 truncate">{user.phone}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                                                    <button
                                                        onClick={() => openDeleteModal(user)}
                                                        className="text-red-500 hover:text-white hover:bg-red-500 p-1 rounded-full transition-colors focus:outline-none"
                                                        title="Delete user"
                                                        disabled={notification.isLoading}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-3 py-16 text-center text-gray-500">
                                                No users found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="delete-modal-wrapper">
                    {/* Background Overlay */}
                    <div className="delete-modal-overlay" onClick={closeDeleteModal}></div>

                    {/* Popup */}
                    <div className={`delete-modal ${isModalClosing ? 'closing' : 'show'}`}>
                        <div className="flex items-center mb-6">
                            <div className="bg-red-100 p-3 rounded-full mr-4">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">Confirm Deletion</h3>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <div className="grid grid-cols-3 gap-2 mb-2">
                                <span className="text-gray-600 font-medium text-left">Name:</span>
                                <span className="col-span-2 text-gray-800">{userToDelete?.name} {userToDelete?.surname}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mb-2">
                                <span className="text-gray-600 font-medium text-left">Username:</span>
                                <span className="col-span-2 text-gray-800">{userToDelete?.username}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-gray-600 font-medium text-left">Role:</span>
                                <span className="col-span-2 text-gray-800 capitalize">{userToDelete?.role}</span>
                            </div>
                        </div>
                        
                        <p className="text-gray-700 font-medium mb-8 text-center">
                            Do you want to delete this user?
                        </p>
                        
                        <div className="flex justify-between space-x-4">
                            <button
                                onClick={closeDeleteModal}
                                className="px-5 py-2.5 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors font-medium"
                                disabled={notification.isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteUser}
                                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors font-medium shadow-sm"
                                disabled={notification.isLoading}
                            >
                                {notification.isLoading ? (
                                    <div className="flex items-center">
                                        <span className="inline-block mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        Processing...
                                    </div>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Toast */}
            {notification.message && (
                <div className={`fixed right-4 bottom-4 p-4 rounded-lg shadow-2xl transition-all transform translate-y-0 opacity-100 flex items-center z-[2000] ${notification.isError ? 'bg-red-100 text-red-700 border-l-4 border-red-500' : 'bg-green-100 text-green-700 border-l-4 border-green-500'}`}>
                    <div className={`mr-3 p-1 rounded-full ${notification.isError ? 'bg-red-200' : 'bg-green-200'}`}>
                        {notification.isError ? (
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

            {/* Add CSS for modal animation and blur effect */}
            <style>{`
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

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
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

export default UserList;
import Util from "../../Util.js";
import React, { useState, useEffect } from 'react';
import { Users, Search, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [roleEdit, setRoleEdit] = useState({ isEditing: false, userId: null, newRole: '' });
    const [notification, setNotification] = useState({ message: '', isLoading: false, isError: false });
    const [roleOptions, setRoleOptions] = useState(['Customer', 'Admin', 'Butcher', 'Delivery Driver']);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [filteredUsers, setFilteredUsers] = useState(users);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const showNotification = (message, isError = false) => {
        setNotification({ message, isLoading: false, isError });
        setTimeout(() => setNotification({ message: '', isLoading: false, isError: false }), 3000);
    };

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await Util.callBackend('admin/getUsers', { userID: Util.savedUser.id });
            setUsers(response);
        } catch (err) {
            setError('Error fetching users');
        } finally {
            setLoading(false);
        }
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
                throw new Error(response.message || 'Failed to delete admin user');
            }
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userToDelete.id));
            if (selectedUser && selectedUser.id === userToDelete.id) {
                setSelectedUser(null);
            }
            Util.CallGeneric("User deleted successfully");
            setNotification({ message: '', isLoading: false, isError: false });
            setShowDeleteModal(false);
            setUserToDelete(null);
        } catch (err) {
            Util.CallGeneric(err.message, "Error");
            setNotification({ message: '', isLoading: false, isError: false });
            setShowDeleteModal(false);
        }
    };

    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
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
                throw new Error(response.message || 'Failed to send verification code');
            }
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId ? { ...user, role: newRole } : user
                )
            );
            if (selectedUser && selectedUser.id === userId) {
                setSelectedUser((prev) => ({ ...prev, role: newRole }));
            }
            setRoleEdit({ isEditing: false, userId: null, newRole: '' });
            Util.CallGeneric("User role changed successfully");
            setNotification({ message: '', isLoading: false, isError: false });
        } catch (err) {
            Util.CallGeneric(err.message, "Error");
            setNotification({ message: '', isLoading: false, isError: false });
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle search and sorting
    useEffect(() => {
        setLoading(true);

        // Use timeout to allow UI to update before filtering/sorting
        // This prevents the "dark line" flash during sorting
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
        <div className="flex p-10 bg-gray-100 min-h-screen flex-col">

            <div className="w-full max-w-6xl mx-auto flex-grow flex flex-col">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div className="flex items-center mb-4 md:mb-0">
                        <Users className="h-8 w-8 text-blue-600 mr-2" />
                        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                </div>

                {/* Notification */}
                {notification.isLoading && (
                    <div className="mb-6 bg-blue-50 text-blue-700 p-4 rounded-lg flex items-center justify-center">
                        <div className="mr-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                        Processing...
                    </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-xl shadow-md flex-grow flex flex-col mb-10">
                    <div className="overflow-auto flex-grow" style={{ maxHeight: 'calc(100vh - 240px)' }}>
                        {loading ? (
                            <div className="text-blue-500 px-4 py-20 text-center text-xl">
                                Loading...
                            </div>
                        ) : (
                            <table className="w-full table-fixed border-collapse">
                                <thead className="bg-gray-100 sticky top-0 z-10 rounded-t-xl">
                                    <tr>
                                        <th className="min-w-24 w-1/8 px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 border-r border-gray-200 first:rounded-tl-xl"
                                            onClick={() => handleSort('name')}>
                                            <span className="flex items-center justify-between">
                                                Name
                                                {renderSortIndicator('name')}
                                            </span>
                                        </th>
                                        <th className="min-w-24 w-1/8 px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 border-r border-gray-200"
                                            onClick={() => handleSort('surname')}>
                                            <span className="flex items-center justify-between">
                                                Surname
                                                {renderSortIndicator('surname')}
                                            </span>
                                        </th>
                                        <th className="min-w-28 w-1/8 px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 border-r border-gray-200"
                                            onClick={() => handleSort('username')}>
                                            <span className="flex items-center justify-between">
                                                Username
                                                {renderSortIndicator('username')}
                                            </span>
                                        </th>
                                        <th className="min-w-24 w-1/8 px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 border-r border-gray-200"
                                            onClick={() => handleSort('role')}>
                                            <span className="flex items-center justify-between">
                                                Role
                                                {renderSortIndicator('role')}
                                            </span>
                                        </th>
                                        <th className="min-w-40 w-1/4 px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 border-r border-gray-200"
                                            onClick={() => handleSort('email')}>
                                            <span className="flex items-center justify-between">
                                                Email
                                                {renderSortIndicator('email')}
                                            </span>
                                        </th>
                                        <th className="min-w-28 w-1/8 px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 border-r border-gray-200"
                                            onClick={() => handleSort('phone')}>
                                            <span className="flex items-center justify-between">
                                                Phone
                                                {renderSortIndicator('phone')}
                                            </span>
                                        </th>
                                        <th className="min-w-20 w-1/12 px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider last:rounded-tr-xl">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user, index) => (
                                            <tr key={user.id}
                                                className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50 bg-opacity-30'}`}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">{user.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">{user.surname}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">{user.username}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => changeUserRole(user.id, e.target.value)}
                                                        className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        disabled={notification.isLoading}
                                                    >
                                                        {roleOptions.map((role) => (
                                                            <option key={role} value={role.toLowerCase()}>
                                                                {role}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">{user.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">{user.phone}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <button
                                                        onClick={() => openDeleteModal(user)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors focus:outline-none"
                                                        title="Delete user"
                                                        disabled={notification.isLoading}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-16 text-center text-gray-500">
                                                No users found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                        <div className="relative bg-white rounded-lg shadow-xl max-w-md mx-auto p-6 w-full">
                            <h3 className="text-xl font-medium text-gray-900 mb-4">Confirm Deletion</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete user <span className="font-semibold">{userToDelete?.name} {userToDelete?.surname}</span>?
                                This action cannot be undone.
                            </p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
                                    disabled={notification.isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={deleteUser}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                                    disabled={notification.isLoading}
                                >
                                    {notification.isLoading ? (
                                        <>
                                            <span className="inline-block mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        'Delete'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

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

export default UserList;

// when opening the drop down menu on the navbar, it clips under the table header so modify the table header to not cause such clipping.
// action column name has a square right top corner, make it rounded.
// make role column slightly wider so that the drop down select's value fits in as Delivery Driver value does not fit in.
// make the name, surname and username columns slightly wider.
// reduce padding to left and right to p-8.
// the header column and search bar's interior is same color as my page background so make the header darker and make the search bar white background.
// hovering over line has same color as the light blue of the alternating rows so make the hover darker.
// hovering over the delete button is not visible make it more visible.
// add a slight shadow to the top of the table.
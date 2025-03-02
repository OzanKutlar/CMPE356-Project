import Utils from "../../Util.js";
import React, {useState, useEffect} from 'react';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [roleEdit, setRoleEdit] = useState({isEditing: false, userId: null, newRole: ''});
    const [notification, setNotification] = useState({message: '', isLoading: false, isError: false});

    const showNotification = (message, isError = false) => {
        setNotification({message, isLoading: false, isError});
        setTimeout(() => setNotification({message: '', isLoading: false, isError: false}), 3000);
    };

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await Utils.callBackend('getUsers', 'GET');
            setUsers(response);
        } catch (err) {
            setError('Error fetching users');
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (userId) => {
        setNotification({message: '', isLoading: true, isError: false});
        try {
            await Utils.callBackend(`deleteUser`, {ID: userId});
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
            if (selectedUser && selectedUser.id === userId) {
                setSelectedUser(null);
            }
            showNotification('User deleted successfully');
        } catch (err) {
            showNotification('Failed to delete user', true);
        }
    };

    const changeUserRole = async (userId, newRole) => {
        setNotification({message: '', isLoading: true, isError: false});
        try {
            await Utils.callBackend(`changeUserRole`, {ID: userId, role: newRole});
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId ? {...user, role: newRole} : user
                )
            );
            if (selectedUser && selectedUser.id === userId) {
                setSelectedUser((prev) => ({...prev, role: newRole}));
            }
            setRoleEdit({isEditing: false, userId: null, newRole: ''});
            showNotification('User role changed successfully');
        } catch (err) {
            showNotification('Failed to change user role', true);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="flex p-6 bg-gray-100 min-h-screen">
            <div className="w-1/3 bg-white border border-gray-300 shadow-md rounded-lg">
                <h1 className="text-xl font-bold mb-4 p-4 text-gray-800">User List</h1>
                {loading && <p className="text-blue-500 px-4">Loading...</p>}
                {error && <p className="text-red-500 px-4">{error}</p>}
                <ul>
                    {users.map((user) => (
                        <li
                            key={user.id}
                            className={`p-4 flex items-center hover:bg-gray-100 cursor-pointer ${
                                selectedUser && selectedUser.id === user.id ? 'bg-gray-200' : ''
                            }`}
                            onClick={() => setSelectedUser(user)}
                        >
                            <img
                                src={user.profilePictureLink}
                                alt={user.Username}
                                className="w-12 h-12 rounded-full mr-4"
                            />
                            <span className="text-gray-700 font-semibold">{user.Username}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="w-2/3 bg-white border border-gray-300 shadow-md rounded-lg ml-4 p-6">
                {selectedUser ? (
                    <div className="text-center">
                        <img
                            src={selectedUser.profilePictureLink}
                            alt={selectedUser.Username}
                            className="w-24 h-24 rounded-full mx-auto mb-4"
                        />
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">
                            {selectedUser.Username}
                        </h2>
                        <p className="text-gray-700 mb-2"><strong>Email: </strong>{selectedUser.email}</p>
                        <p className="text-gray-700 mb-2"><strong>Phone: </strong>{selectedUser.phone}</p>
                        <p className="text-gray-700 mb-4"><strong>Role: </strong>{selectedUser.role}</p>
                        <div>
                            <button
                                onClick={() => deleteUser(selectedUser.id)}
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 mr-2"
                            >
                                Delete
                            </button>
                            {roleEdit.isEditing && roleEdit.userId === selectedUser.id ? (
                                <>
                                    <select
                                        value={roleEdit.newRole}
                                        onChange={(e) => setRoleEdit(prev => ({...prev, newRole: e.target.value}))}
                                        className="bg-gray-200 border rounded px-3 py-1 mr-4"
                                    >
                                        <option value="user">User</option>
                                        <option value="delivery driver">Delivery Driver</option>
                                        <option value="butcher">Butcher</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <button
                                        onClick={() => changeUserRole(selectedUser.id, roleEdit.newRole)}
                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                    >
                                        Confirm
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setRoleEdit({
                                        isEditing: true,
                                        userId: selectedUser.id,
                                        newRole: selectedUser.role
                                    })}
                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                >
                                    Change Role
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-700 text-center">Select a user to view details</p>
                )}
            </div>
            {notification.message || notification.isLoading ? (
                <div className={`fixed right-4 bottom-4 p-4 rounded shadow-2xl transition-all ${
                    notification.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
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
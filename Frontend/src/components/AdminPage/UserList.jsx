import Utils from "../../Util.js";
import React, {useState, useEffect} from 'react';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
        try {
            await Utils.callBackend(`deleteUser`, {ID:userId});
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const changeUserRole = async (userId, newRole) => {
        try {
            await Utils.callBackend(`changeUserRole`, {ID:userId, role:newRole}); // Replace changeUserRole endpoint as needed
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId ? {...user, role: newRole} : user
                )
            );
        } catch (err) {
            alert('Failed to change user role');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div>
            <h1>User Management</h1>
            {loading && <p>Loading...</p>}
            {error && <p style={{color: 'red'}}>{error}</p>}
            <table>
                <thead>
                <tr>
                    <th>Profile Picture</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.map((user) => (
                    <tr key={user.id}>
                        <td>
                            <img src={user.profilePictureLink} alt={user.Username} width="50"/>
                        </td>
                        <td>{user.Username}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>{user.role}</td>
                        <td>
                            <button onClick={() => deleteUser(user.id)}>Delete</button>
                            <button
                                onClick={() => {
                                    const newRole = prompt('Enter new role:', user.role);
                                    if (newRole) {
                                        changeUserRole(user.id, newRole);
                                    }
                                }}
                            >
                                Change Role
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserList;
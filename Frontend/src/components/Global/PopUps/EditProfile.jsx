import React, { useState } from 'react';
import Util from "../../../Util.js";

export default function EditProfile({ user, onClose }) {
    const [userData, setUserData] = useState({ ...user });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async () => {
        console.log("Attempting to save user data:", userData); // Debugging

        try {
            await Util.updateUserProfile(userData);
            Util.savedUser = userData; // Store updated user locally
            console.log("User data saved successfully:", Util.savedUser);
            onClose(); // Close the edit form
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    return (
        <div className="w-80 bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Edit Profile</h3>

            <input 
                type="text" 
                name="name" 
                value={userData.name} 
                onChange={handleInputChange} 
                placeholder="Full Name" 
                className="w-full p-2 mb-2 border rounded" 
            />

            <input 
                type="text" 
                name="address" 
                value={userData.address} 
                onChange={handleInputChange} 
                placeholder="Address" 
                className="w-full p-2 mb-2 border rounded" 
            />

            <input 
                type="text" 
                name="phone" 
                value={userData.phone} 
                onChange={handleInputChange} 
                placeholder="Phone Number" 
                className="w-full p-2 mb-2 border rounded" 
            />

            <input 
                type="date" 
                name="dob" 
                value={userData.dob} 
                onChange={handleInputChange} 
                className="w-full p-2 mb-2 border rounded" 
            />

            <div className="flex justify-between">
                <button 
                    className="px-4 py-2 bg-green-500 text-white rounded" 
                    onClick={handleSaveChanges}
                >
                    Save
                </button>
                <button 
                    className="px-4 py-2 bg-red-500 text-white rounded" 
                    onClick={onClose}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

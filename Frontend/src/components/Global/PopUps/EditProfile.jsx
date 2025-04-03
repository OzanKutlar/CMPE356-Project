import React, { useState, useEffect } from 'react';
import Util from '../../../Util.js';
import './LoginPopup.css';
import { EyeIcon, EyeOffIcon } from '../Icons.jsx'; // Import the updated CSS file

const EditProfile = ({ user, onClose }) => {
    const [userData, setUserData] = useState({ ...user });
    const [showPasswordField, setShowPasswordField] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [disableSaveButton, setDisableSaveButton] = useState(true);
    const [fadeIn, setFadeIn] = useState(false);
    const [buttonText, setButtonText] = useState('Save Changes');
    const [buttonColor, setButtonColor] = useState('bg-blue-600');
    const [isHovered, setIsHovered] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const timeout = setTimeout(() => setFadeIn(true), 50);
        return () => {
            clearTimeout(timeout);
            setFadeIn(false);
        };
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData((prev) => ({ ...prev, [name]: value }));

        // Check if all required fields are filled
        const isFilled = Object.values(userData).every(val => val.trim() !== '');
        setDisableSaveButton(!isFilled);
    };

    const handleSaveChanges = async () => {
        const headers = {
            ...userData,
        };

        try {
            let s = await Util.callBackend("updateProfile", headers);
            if (s.message === "Success") {
                Util.savedUser = s.user;
                onClose();
            } else {
                console.error(`Error: ${s.message}`);
            }
        } catch (error) {
            onClose();
            console.error('Error during updating profile:', error);
        }
    };

    return (
        <div className="login-popup-wrapper">
            {/* Background Overlay */}
            <div className="login-overlay" onClick={onClose}></div>
            {/* Popup */}
            <div className={`login-popup ${fadeIn ? 'show' : ''}`}>
                <input
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    className="w-full p-3 mb-4 border rounded"
                />
                <input
                    type="text"
                    name="address"
                    value={userData.address}
                    onChange={handleInputChange}
                    placeholder="Address"
                    className="w-full p-3 mb-4 border rounded"
                />
                <input
                    type="text"
                    name="phone"
                    value={userData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone Number"
                    className="w-full p-3 mb-4 border rounded"
                />
                <input
                    type="date"
                    name="dob"
                    value={userData.dob}
                    onChange={handleInputChange}
                    className="w-full p-3 mb-4 border rounded"
                />
                {showPasswordField && (
                    <div>
                        <div className="relative w-full">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={userData.password}
                                onChange={handleInputChange}
                                placeholder="Your password"
                                className={`w-full p-3 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 ${
                                    error !== '' ? 'border-red-500 bg-red-200' : 'border-gray-300'
                                }`}
                            />
                            <button
                                type="button"
                                className="fixed-password-toggle absolute inset-y-0 right-0 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {error !== '' && <p className="text-xs text-red-500">{error}</p>}
                    </div>
                )}
                <button
                    onClick={handleSaveChanges}
                    disabled={disableSaveButton}
                    className={`w-full px-5 py-3 rounded text-white ${disableSaveButton ? "bg-gray-600" : buttonColor} text-lg cursor-pointer transition-colors duration-300`}
                >
                    {buttonText}
                </button>
                <button
                    className="w-full px-5 py-3 rounded text-gray-600 bg-gray-200 text-lg cursor-pointer transition-colors duration-300 mt-2"
                    onClick={onClose}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default EditProfile;
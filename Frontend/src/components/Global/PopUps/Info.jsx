import React, { useState, useEffect } from 'react';
import Util from '../../../Util.js';
import './LoginPopup.css';
import { EyeIcon, EyeOffIcon } from "../Icons.jsx"; // Import the updated CSS file

const Info = ({ popUpText, popUpType, setShowPopup }) => {
    const [fadeIn, setFadeIn] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setFadeIn(true), 50);
        return () => {
            clearTimeout(timeout);
            setFadeIn(false);
        };
    }, []);

    useEffect(() => {
        const hidePopupTimeout = setTimeout(() => {
            setShowPopup(false);
        }, 3000);

        return () => clearTimeout(hidePopupTimeout);
    }, [setShowPopup]);

    const getPopupTypeClass = (type) => {
        switch (type) {
            case 'Error':
                return 'bg-red-100 text-red-600';
            case 'Info':
                return 'bg-blue-100 text-blue-600';
            case 'Debug':
                return 'bg-gray-100 text-gray-600';
            default:
                return 'bg-white text-black';
        }
    };

    return (
        <div className="login-popup-wrapper">
            {/* Background Overlay */}
            <div className="login-overlay" onClick={() => setShowPopup(false)}></div>

            <div className={`login-popup ${fadeIn ? 'show' : ''}`}>
                <div className={`popup-content ${getPopupTypeClass(popUpType)}`}>
                    <p>{popUpText}</p>
                </div>
            </div>
        </div>
    );
};

export default Info;
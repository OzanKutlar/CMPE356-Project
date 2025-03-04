import React, { useState, useEffect } from 'react';
import Util from '../../Util.js';
import './LoginPopup.css'; // Import the updated CSS file

const LoginPopup = ({ setShowLogin }) => {
    const [username, setUsername] = useState('');
    const [showPasswordField, setShowPasswordField] = useState(false);
    const [showConfirmPasswordField, setShowConfirmPasswordField] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);
    const [buttonText, setButtonText] = useState('Login');
    const [buttonDest, setButtonDest] = useState('home');
    const [buttonColor, setButtonColor] = useState('#007bff');
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        setFadeIn(true);
        return () => setFadeIn(false);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (username.trim()) {
                checkUserExistence(username);
            }
        }, 400);
        setShowPasswordField(false);
        setShowConfirmPasswordField(false);
        setButtonText('Login');
        setButtonColor('#007bff');
        return () => clearTimeout(timer);
    }, [username]);

    const checkUserExistence = async (usernameString) => {
        try {
            const data = await Util.callBackend(`check-user`, { username: usernameString });
            if (data.exists) {
                setShowPasswordField(true);
                setShowConfirmPasswordField(false);
                setButtonText('Login');
                setButtonColor('#007bff');
                setButtonDest(data.role);
            } else {
                setShowPasswordField(true);
                setShowConfirmPasswordField(true);
                setButtonText('Register');
                setButtonColor('orange');
            }
        } catch (error) {
            console.error('Error checking user existence:', error);
        }
    };

    const handleLoginClick = async () => {
        const headers = {
            username: username,
            password: document.querySelector('input[placeholder="Password"]').value,
        };

        if (buttonText === 'Register') {
            headers.register = document.querySelector('input[placeholder="Confirm Password"]').value;
        }

        try {
            const endpoint = buttonText === 'Register' ? "register" : "login";
            const s = await Util.callBackend(endpoint, headers);

            if (s.message === "Success") {
                Util.savedUser = s.user;
                setShowLogin(false);
            } else {
                console.error(`Error: ${s.message}`);
            }
        } catch (error) {
            console.error('Error during login/register:', error);
        }
    };

    const handleForgotPasswordClick = () => {
        Util.navigateTo('forgot');
    };

    return (
        <div className="login-popup-wrapper">
            {/* Background Overlay */}
            <div className="login-overlay" onClick={() => setShowLogin(false)}></div>

            {/* Popup */}
            <div className={`login-popup ${fadeIn ? 'show' : ''}`}>
                <h2>{buttonText === 'Login' ? 'Login' : 'Register'}</h2>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <div className={`password-field-container ${showPasswordField ? 'slide-down' : ''}`}>
                    {showPasswordField && (
                        <input type="password" placeholder="Password" />
                    )}
                    {showConfirmPasswordField && (
                        <input type="password" placeholder="Confirm Password" />
                    )}
                </div>
                <button
                    onClick={handleLoginClick}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{backgroundColor: isHovered ? '#0056b3' : buttonColor}}
                    className="mt-[15px] px-5 py-2 rounded-[4px] text-[16px] text-white cursor-pointer transition-colors duration-300"
                >
                    {buttonText}
                </button>
                {buttonText === 'Login' && (
                    <button
                        className="forgot-password"
                        onClick={handleForgotPasswordClick}
                    >
                        Forgot Password?
                    </button>
                )}
            </div>
        </div>
    );
};

export default LoginPopup;
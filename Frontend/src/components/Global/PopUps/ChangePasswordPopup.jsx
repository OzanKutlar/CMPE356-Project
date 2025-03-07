import React, {useState, useEffect} from 'react';
import Util from '../../../Util.js';
import './LoginPopup.css';
import {EyeIcon, EyeOffIcon} from "../Icons.jsx"; // Import the updated CSS file

const ChangePassword = ({setChangePass}) => {
    const [username, setUsername] = useState('');
    const [showPasswordField, setShowPasswordField] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConf, setShowPasswordConf] = useState(false);
    const [showConfirmPasswordField, setShowConfirmPasswordField] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);
    const [buttonText, setButtonText] = useState('Login');
    const [buttonDest, setButtonDest] = useState('home');
    const [buttonColor, setButtonColor] = useState('#007bff');
    const [isHovered, setIsHovered] = useState(false);

    const [passwordError, setPasswordError] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConf, setPasswordConf] = useState('');


    useEffect(() => {
        const timeout = setTimeout(() => setFadeIn(true), 50);
        return () => {
            clearTimeout(timeout);
            setFadeIn(false);
        };
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
            const data = await Util.callBackend(`check-user`, {username: usernameString});
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

    const handlePassword = async (e) => {
        const {name, value} = e.target;
        if(value === 'test'){
            setPasswordError("AAAA");
        }
        else{
            setPasswordError('');
        }
    }

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
                setChangePass(false);
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
            <div className="login-overlay" onClick={() => setChangePass(false)}></div>

            {/* Popup */}
            <div className={`login-popup ${fadeIn ? 'show' : ''}`}>
                {!Util.forgot && (
                    <input
                        type="text"
                        placeholder='Your old password'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-3 mb-4 border rounded"
                    />
                )}

                <div className={`password-field-container ${showPasswordField ? 'slide-down' : ''}`}>
                    {showPasswordField && (
                        <div>
                            <div className="relative w-full">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    onChange={handlePassword}
                                    placeholder="Your password"
                                    className={`w-full p-3 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 ${
                                        passwordError !== '' ? 'border-red-500 bg-red-200' : 'border-gray-300'
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

                            {passwordError !== '' && <p className="text-xs text-red-500">{passwordError}</p>}
                        </div>
                        // <input type="password" placeholder="Password" className="w-full p-3 mb-4 border rounded"/>
                    )}
                    {showConfirmPasswordField && (
                        <div>
                            <div className="relative w-full">
                                <input
                                    type={showPasswordConf ? "text" : "password"}
                                    id="passwordConf"
                                    name="passwordConf"
                                    onChange={handlePassword}
                                    placeholder="Confirm your password"
                                    className={`w-full p-3 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 ${
                                        passwordError !== '' ? 'border-red-500 bg-red-200' : 'border-gray-300'
                                    }`}
                                />
                                <button
                                    type="button"
                                    className="fixed-password-toggle absolute inset-y-0 right-0 flex items-center"
                                    onClick={() => setShowPasswordConf(!showPasswordConf)}
                                >
                                    {showPasswordConf ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>

                            {passwordError !== '' && <p className="text-xs text-red-500">{passwordError}</p>}
                        </div>
                    )}
                </div>
                <button
                    onClick={handleLoginClick}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{backgroundColor: isHovered ? '#0056b3' : buttonColor}}
                    className="w-full px-5 py-3 rounded text-white text-lg cursor-pointer transition-colors duration-300"
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

export default ChangePassword;

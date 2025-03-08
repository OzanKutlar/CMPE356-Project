import React, {useState, useEffect} from 'react';
import Util from '../../../Util.js';
import './LoginPopup.css';
import {EyeIcon, EyeOffIcon} from "../Icons.jsx"; // Import the updated CSS file

const LoginPopup = ({setShowLogin}) => {
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
    const [disableLoginButton, setDisableLoginButton] = useState(false);
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
        setButtonColor('bg-blue-600');
        return () => clearTimeout(timer);
    }, [username]);

    const checkUserExistence = async (usernameString) => {
        try {
            const data = await Util.callBackend(`check-user`, {username: usernameString});
            if (data.exists) {
                setShowPasswordField(true);
                setShowConfirmPasswordField(false);
                setButtonText('Login');
                setButtonColor('bg-blue-600');
                setButtonDest(data.role);
            } else {
                setShowPasswordField(true);
                setShowConfirmPasswordField(true);
                setButtonText('Register');
                setButtonColor('bg-amber-600');
            }
        } catch (error) {
            console.error('Error checking user existence:', error);
        }
    };

    const handlePassword = async (e) => {
        const {name, value} = e.target;
        if (value === 'test') {
            setPasswordError("AAAA");
        } else {
            setPasswordError('');
        }
    }


    const handleLoginClick = async () => {
        const headers = {
            username: username,
            password: document.querySelector('input[placeholder="Your password"]').value,
        };

        setDisableLoginButton(true);
        try {
            const endpoint = buttonText === 'Register' ? "registerUserPart" : "login";
            const s = await Util.callBackend(endpoint, headers);
            setDisableLoginButton(false);
            if (s.msg === "success") {
                Util.savedUser = s.user;
                if(buttonText === "Register"){
                    Util.navigateTo("register");
                }
                setShowLogin(false);
            } else {
                console.error(`Error: ${s.message}`);
            }
        } catch (error) {
            console.error('Error during login/register:', error);
        }
    };

    const handleForgotPasswordClick = () => {
        setShowLogin(false);
        if (Util.CallPasswordReset != null) {
            Util.forgot = true;
            Util.CallPasswordReset(true);
        }
    };

    return (
        <div className="login-popup-wrapper">
            {/* Background Overlay */}
            <div className="login-overlay" onClick={() => setShowLogin(false)}></div>

            {/* Popup */}
            <div className={`login-popup ${fadeIn ? 'show' : ''}`}>
                <h2 className="text-2xl font-bold mb-4">{buttonText === 'Login' ? 'Login' : 'Register'}</h2>
                <input
                    type="text"
                    placeholder='Write your username to login/register'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-3 mb-4 border rounded"
                />
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
                                    {showPassword ? <EyeOffIcon/> : <EyeIcon/>}
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
                                    {showPasswordConf ? <EyeOffIcon/> : <EyeIcon/>}
                                </button>
                            </div>

                            {passwordError !== '' && <p className="text-xs text-red-500">{passwordError}</p>}
                        </div>
                    )}
                </div>
                <button
                    onClick={handleLoginClick}
                    disabled={disableLoginButton}
                    className={`w-full px-5 py-3 rounded text-white ${disableLoginButton ? "bg-gray-600" : buttonColor} text-lg cursor-pointer transition-colors duration-300`}
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

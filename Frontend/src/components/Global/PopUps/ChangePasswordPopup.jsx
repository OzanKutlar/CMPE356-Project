import React, {useState, useEffect} from 'react';
import Util from '../../../Util.js';
import './LoginPopup.css';
import {EyeIcon, EyeOffIcon} from "../Icons.jsx"; // Import the updated CSS file

const ChangePassword = ({setChangePass}) => {
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [newPassConf, setNewPassConf] = useState('');
    const [showPasswordField, setShowPasswordField] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [disableLoginButton, setDisableLoginButton] = useState(true);
    const [showPasswordConf, setShowPasswordConf] = useState(false);
    const [showConfirmPasswordField, setShowConfirmPasswordField] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);
    const [buttonText, setButtonText] = useState('Change Password');
    const [buttonDest, setButtonDest] = useState('home');
    const [buttonColor, setButtonColor] = useState('bg-blue-600');
    const [isHovered, setIsHovered] = useState(false);

    const [passwordError, setPasswordError] = useState('');


    useEffect(() => {
        const timeout = setTimeout(() => setFadeIn(true), 50);
        return () => {
            clearTimeout(timeout);
            setFadeIn(false);
        };
    }, []);



    const handlePassword = (e) => {
        const {name, value} = e.target;

        setShowConfirmPasswordField(newPass.length >= 4)
        setNewPass(value);
    }

    const handleConfirmPass = (e) =>{
        const {name, value} = e.target;

        setNewPassConf(value);

        if(value.length >= newPass.length) {
            if (value !== newPass) {
                setDisableLoginButton(true);
                setPasswordError("Please Confirm Your Password");
            } else {
                setDisableLoginButton(false);
                setPasswordError("");
            }
        }

    }


    const handleLoginClick = async () => {
        const headers = {
            oldPass: oldPass,
            password: newPass,
        };


        try {
            let s = await Util.callBackend("changePass", headers);

            if (s.message === "Success") {
                Util.savedUser = s.user;
                setChangePass(false);
            } else {
                console.error(`Error: ${s.message}`);
            }
        } catch (error) {
            setChangePass(false);
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
                        value={oldPass}
                        onChange={(e) => setOldPass(e.target.value)}
                        className="w-full p-3 mb-4 border rounded"
                    />
                )}

                <div>
                    <div className="relative w-full">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={newPass}
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

                <div className={`password-field-container ${showConfirmPasswordField ? 'slide-down' : ''}`}>
                    {showConfirmPasswordField && (
                        <div>
                            <div className="relative w-full">
                                <input
                                    type={showPasswordConf ? "text" : "password"}
                                    id="passwordConf"
                                    name="passwordConf"
                                    value={newPassConf}
                                    onChange={handleConfirmPass}
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
            </div>
        </div>
    );
};

export default ChangePassword;

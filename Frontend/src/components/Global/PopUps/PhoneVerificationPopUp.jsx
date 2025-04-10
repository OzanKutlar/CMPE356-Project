import React, { useState, useEffect } from 'react';
import './LoginPopup.css';
import Util from "../../../Util.js";

const PhoneVerification = ({ setShowPopUp, initialPhoneNumber = '' }) => {
    const [phoneNo, setPhoneNo] = useState(initialPhoneNumber || '');
    const [verificationCode, setVerificationCode] = useState('');
    const [showCodeField, setShowCodeField] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [buttonColor, setButtonColor] = useState('#007bff');
    const [isHovered, setIsHovered] = useState(false);
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);

    useEffect(() => {
        if(Util.savedUser.phone === '') {
            initialPhoneNumber = Util.tempPhoneNumber;
        }
        else{
            initialPhoneNumber = Util.savedUser.phone;
        }
        setPhoneNo(initialPhoneNumber)
        const timeout = setTimeout(() => setFadeIn(true), 50);
        return () => {
            clearTimeout(timeout);
            setFadeIn(false);
        };
    }, []);

    useEffect(() => {
        let interval;
        if (isResendDisabled && resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
        } else if (resendTimer === 0) {
            setIsResendDisabled(false);
            setResendTimer(60);
        }
        return () => clearInterval(interval);
    }, [isResendDisabled, resendTimer]);

    let lastformat = '';

    function formatPhoneNumber(phone) {
        if (phone === lastformat) {
            return phone;
        }
        let offset = Number(phone.length >= 13);

        const pattern = [
            {index: 0, prefix: "+"},
            {index: 2 + offset, prefix: " ("},
            {index: 5 + offset, prefix: ") "},
            {index: 8 + offset, prefix: " "},
            {index: 10 + offset, prefix: " "}
        ];

        let formatted = "";
        for (let i = 0; i < phone.length; i++) {
            let formatRule = pattern.find(p => p.index === i);
            if (formatRule) formatted += formatRule.prefix;

            formatted += phone[i];
        }
        let formatRule = pattern.find(p => p.index === phone.length);
        if (formatRule) formatted += formatRule.prefix;
        return formatted;
    }

    let lastVal = '';

    const handleChange = (e) => {
        const { value } = e.target;
        if(value.length > 20) return;

        let phoneNum;
        if (lastVal.length > value.length) {
            phoneNum = formatPhoneNumber(value.replaceAll(/[^0-9]/g, ""));
        } else {
            if (value.replaceAll(/[^0-9]/g, "") === lastVal.replaceAll(/[^0-9]/g, "")) {
                phoneNum = formatPhoneNumber(value.replaceAll(/[^0-9]/g, "").slice(0, -1));
            } else {
                phoneNum = formatPhoneNumber(value.replaceAll(/[^0-9]/g, ""));
            }
        }
        setPhoneNo(phoneNum);
        lastVal = value;
    };

    const handleCodeChange = (e) => {
        const { value } = e.target;
        // Only allow numbers and limit to 6 digits
        if (/^\d*$/.test(value) && value.length <= 6) {
            setVerificationCode(value);
        }
    };

    const handleSendCode = async () => {
        setErrorMessage('');
        const cleanPhone = phoneNo.replaceAll(/[^0-9+]/g, "");
        if (cleanPhone.length < 10) {
            setErrorMessage('Please enter a valid phone number');
            return;
        }

        try {
            setIsLoading(true);

            const response = await Util.callBackend("user/verify-phone", {phoneNo: cleanPhone})

            if (response.msg === "error") {
                throw new Error(response.message || 'Failed to send verification code');
            }

            setShowCodeField(true);
            setIsResendDisabled(true);

        } catch (error) {
            setErrorMessage(error.message || 'An error occurred. Please try again.');
            console.error('Error sending verification code:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        await handleSendCode();
    };

    const handleVerifyCode = async () => {
        // Clear any previous errors
        setErrorMessage('');

        // Validate verification code
        if (verificationCode.length !== 6) {
            setErrorMessage('Please enter a valid 6-digit code');
            return;
        }

        try {
            setIsLoading(true);

            const response = await Util.callBackend("user/verify-code", {phoneNo: phoneNo.replaceAll(/[^0-9+]/g, ""), code: verificationCode})

            if (response.msg === "error") {
                throw new Error(response.message || 'Invalid verification code');
            }

            Util.tempPhoneNumber = phoneNo;

            setShowPopUp(false);


        } catch (error) {
            setErrorMessage(error.message || 'An error occurred. Please try again.');
            console.error('Error verifying code:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        Util.tempPhoneNumber = '';
        setShowPopUp(false);
    };

    return (
        <div className="login-popup-wrapper">
            {/* Background Overlay */}
            <div className="login-overlay" onClick={handleCancel}></div>

            {/* Popup */}
            <div className={`login-popup ${fadeIn ? 'show' : ''}`}>
                <h2 className="text-2xl font-bold mb-4">Phone Verification</h2>

                {!showCodeField ? (
                    <>
                        <p className="mb-4">Please confirm that your phone number is as follows or change it.</p>
                        <input
                            type="text"
                            placeholder='+90 (xxx) xxx xx xx'
                            value={phoneNo}
                            onChange={handleChange}
                            className="w-full p-3 mb-4 border rounded"
                            disabled={isLoading}
                        />
                        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
                        <button
                            onClick={handleSendCode}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            style={{backgroundColor: isHovered ? '#0056b3' : buttonColor}}
                            className="w-full px-5 py-3 rounded text-white text-lg cursor-pointer transition-colors duration-300"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sending...' : 'Send Verification Code'}
                        </button>
                        <button
                            onClick={handleCancel}
                            className="w-full mt-2 px-5 py-3 rounded text-gray-700 text-lg cursor-pointer transition-colors duration-300 border"
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <p className="mb-2">Verification code sent to:</p>
                        <p className="font-medium mb-4">{phoneNo}</p>
                        <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={verificationCode}
                            onChange={handleCodeChange}
                            className="w-full p-3 mb-4 border rounded"
                            disabled={isLoading}
                            maxLength={6}
                        />
                        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
                        <button
                            onClick={handleVerifyCode}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            style={{backgroundColor: isHovered ? '#0056b3' : buttonColor}}
                            className="w-full px-5 py-3 rounded text-white text-lg cursor-pointer transition-colors duration-300"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Verifying...' : 'Verify Code'}
                        </button>
                        <div className="flex justify-between mt-4">
                            <button
                                onClick={handleResendCode}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                                disabled={isResendDisabled || isLoading}
                            >
                                {isResendDisabled
                                    ? `Resend code in ${resendTimer}s`
                                    : 'Resend code'}
                            </button>
                            <button
                                onClick={handleCancel}
                                className="text-gray-600 hover:text-gray-800 text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PhoneVerification;
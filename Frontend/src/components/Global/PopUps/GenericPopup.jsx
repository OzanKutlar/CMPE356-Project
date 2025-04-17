import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Info, AlertTriangle, Bug } from 'lucide-react';
import Util from "../../../Util.js";

const GenericPopup = forwardRef((props, ref) => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState('Info');
    const [timeoutId, setTimeoutId] = useState(null);

    // Function to show the popup
    const showPopup = useCallback((message, type = 'Info') => {
        setMessage(message);
        setType(type);
        setVisible(true);

        // Clear any existing timeout
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        // Auto-hide after 3 seconds
        const id = setTimeout(() => {
            setVisible(false);
        }, 3000);

        setTimeoutId(id);
    }, [timeoutId]);

    // Setup the imperative handle to expose methods to the parent
    useImperativeHandle(ref, () => ({
        show: showPopup
    }));

    useEffect(() => {
        Util.CallGeneric = (message, type) => {
            showPopup(message, type);
        };

        return () => {
            Util.CallGeneric = null;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [showPopup, timeoutId]);

    // Get the appropriate icon based on type
    const getIcon = () => {
        switch (type) {
            case 'Error':
                return <AlertTriangle className="genericpopup-icon" />;
            case 'Info':
                return <Info className="genericpopup-icon" />;
            case 'Debug':
                return <Bug className="genericpopup-icon" />;
            default:
                return <Info className="genericpopup-icon" />;
        }
    };

    // Get the appropriate CSS class based on type
    const getTypeClass = () => {
        switch (type) {
            case 'Error':
                return 'genericpopup-error';
            case 'Info':
                return 'genericpopup-info';
            case 'Debug':
                return 'genericpopup-debug';
            default:
                return 'genericpopup-info';
        }
    };

    return (
        <>
            {visible && (
                <div className="genericpopup-backdrop">
                    <div className={`genericpopup-container ${getTypeClass()}`}>
                        <div className="genericpopup-icon-container">
                            {getIcon()}
                        </div>
                        <div className="genericpopup-message">
                            {message}
                        </div>
                    </div>
                </div>
            )}

            <style jsx={"true"} global>{`
        .genericpopup-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(4px);
          z-index: 1000;
          animation: genericpopup-fadeIn 0.3s ease-in-out;
        }
        
        .genericpopup-container {
          display: flex;
          align-items: center;
          padding: 1rem;
          border-radius: 0.5rem;
          max-width: 80%;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          animation: genericpopup-slideIn 0.3s ease-in-out;
        }
        
        .genericpopup-error {
          background-color: #fee2e2;
          border-left: 4px solid #ef4444;
          color: #7f1d1d;
        }
        
        .genericpopup-info {
          background-color: white;
          border-left: 4px solid #3b82f6;
          color: #1e3a8a;
        }
        
        .genericpopup-debug {
          background-color: #f3f4f6;
          border-left: 4px solid #6b7280;
          color: #1f2937;
        }
        
        .genericpopup-icon-container {
          margin-right: 1rem;
          display: flex;
          align-items: center;
        }
        
        .genericpopup-icon {
          width: 1.5rem;
          height: 1.5rem;
        }
        
        .genericpopup-message {
          font-size: 1rem;
          line-height: 1.5;
        }
        
        @keyframes genericpopup-fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes genericpopup-slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
        </>
    );
});

// Set display name for debugging purposes
GenericPopup.displayName = 'GenericPopup';

export default GenericPopup;
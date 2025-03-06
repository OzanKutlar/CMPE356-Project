import {useState} from 'react';
import PropTypes from 'prop-types';

const OrderItem = ({order, onButtonClick}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const handleButtonClick = (e) => {
        e.stopPropagation(); // Prevent triggering the parent div onClick
        onButtonClick();
    };

    return (
        <div
            className={`
        w-full 
        bg-white 
        rounded-lg 
        shadow-md 
        cursor-pointer 
        border 
        border-gray-200 
        transition-all 
        duration-300 
        ease-in-out
        ${isExpanded ? 'max-h-64' : 'max-h-16'}
        overflow-hidden
      `}
            onClick={toggleExpand}
        >
            <div className="px-3 py-4 flex justify-between items-start">
                <div className="font-medium text-sm text-gray-800">Order: #{order.order_id}</div>
                <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-sm rounded-md transition-colors"
                    onClick={handleButtonClick}
                >
                    Details
                </button>

                {isOpen && <DetailsPopup closePopup={() => setIsOpen(false)} onAction={handleButtonClick}/>}

            </div>

            <div className={`
        px-4 
        pb-4 
        text-gray-600
        transition-opacity 
        duration-300
        ${isExpanded ? 'opacity-100' : 'opacity-0'}
      `}>
                <h2>Destination: </h2>
                <p>{order.destination}</p>
            </div>
        </div>
    );
};

OrderItem.propTypes = {
    order: PropTypes.shape({
        order_id: PropTypes.any,
        startLocation: PropTypes.string,
        destination: PropTypes.string,
        content: PropTypes.array
    }),
    onButtonClick: PropTypes.func
};

export default OrderItem;
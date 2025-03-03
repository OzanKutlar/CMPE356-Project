import { useState } from 'react';
import PropTypes from 'prop-types';

const OrderItem = ({ address, content, onButtonZClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleButtonZClick = (e) => {
    e.stopPropagation(); // Prevent triggering the parent div onClick
    onButtonZClick();
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
        <div className="font-medium text-sm text-gray-800">{address}</div>
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-sm rounded-md transition-colors"
          onClick={handleButtonZClick}
        >
          Button Z
        </button>
      </div>
      
      <div className={`
        px-4 
        pb-4 
        text-gray-600
        transition-opacity 
        duration-300
        ${isExpanded ? 'opacity-100' : 'opacity-0'}
      `}>
        {content.map((line, index) => (
          <p key={index} className="mb-2">{line}</p>
        ))}
      </div>
    </div>
  );
};

OrderItem.propTypes = {
  address: PropTypes.any,
  content: PropTypes.string,
  onButtonZClick: PropTypes.func
};

export default OrderItem;
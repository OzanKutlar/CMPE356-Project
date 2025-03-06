import { useContext } from 'react';
import PropTypes from 'prop-types';
import { ButtonContext } from './ButtonContext';

export function OrderItem({ 
  order,  
  currentTab, 
  isExpanded,
  onExpandChange
}) {
  const { handleTakeOrder, handleDropOrder, handleComplete, handleMapRouting } = useContext(ButtonContext);

  // Handle item expansion
  const toggleExpand = (e) => {
    e.stopPropagation();
    onExpandChange(order);
    handleMapRouting(order.startLocation, order.destination);
  };

  // Render buttons based on current tab
  const renderButtons = () => {
    switch(currentTab) {
      case 'A':
        return (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleTakeOrder(order, 'B', currentTab);
            }} 
            className="flex items-center justify-center bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
          >
            Take Order
          </button>
        );
      case 'B':
        return (
          <div className="flex space-x-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDropOrder(order, 'A', currentTab);
              }} 
              className="flex items-center justify-center bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400 transition-colors"
            >
              Drop
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleComplete(order, currentTab);
              }} 
              className="flex items-center justify-center bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
            >
              Complete
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={`
        border border-gray-200 rounded-lg mb-2 overflow-hidden 
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'shadow-lg' : 'shadow-sm'}
      `}
      onClick={toggleExpand}
    >
      {/* Basic Order Information */}
      <div className="flex justify-between items-center p-4 cursor-pointer">
        <div className="flex-grow">
          <h3 className="font-semibold text-gray-800">Order: #{order.order_id}</h3>
          <h4 className="font-semibold text-gray-800">Pickup</h4>
          <p className="text-gray-600 text-sm">{order.startLocation}</p>
        </div>
        
        
      </div>

      {/* Expandable Content */}
      <div 
        className={`
          px-4 pb-4 transition-all duration-300 ease-in-out
          ${isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}
        `}
      >
        {/* Detailed Order Information */}
        <div className="border-t pt-4 mt-2">
          <p className="text-gray-700 mb-2"><strong>Order Details:</strong></p>
          <div className="space-y-1">
            <p>Total Items: {order.content.length}</p>
            <p>Total Price: {//${order.totalPrice.toFixed(2)}
            }</p>
            <p>Delivery Address: {order.destination}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex justify-center">
          {renderButtons()}
        </div>
      </div>
    </div>
  );
}

OrderItem.propTypes = {
  order: PropTypes.shape({
    order_id: PropTypes.number.isRequired,
    //totalPrice: PropTypes.number.isRequired,
    content: PropTypes.array.isRequired,
    startLocation: PropTypes.string.isRequired,
    destination: PropTypes.string.isRequired
  }).isRequired,
  onButtonClick: PropTypes.func.isRequired,
  currentTab: PropTypes.oneOf(['A', 'B']).isRequired,
  onTrackClick: PropTypes.func,
  onCompleteClick: PropTypes.func,
  isExpanded: PropTypes.bool,
  onExpandChange: PropTypes.func
};

OrderItem.defaultProps = {
  onTrackClick: () => {},
  onCompleteClick: () => {},
  isExpanded: false
};

export default OrderItem;
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
    handleMapRouting(order.storeAddress, order.customerAddress);
  };


  // private long orderId;
  // private long splitId;
  // private String storeName;
  // private String storeAddress;
  // private String customerAddress;
  // private String paymentMethod;
  // private String[] productNames;
  // private String[] productAmounts;
  // private BigDecimal totalPrice;


  // Render buttons based on current tab
  const renderButtons = () => {
    switch(currentTab) {
      case 'Waiting Orders':
        return (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleTakeOrder(order, 'Taken Orders');
            }} 
            className="w-full flex items-center justify-center bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Take Order
          </button>
        );
      case 'Taken Orders':
        return (
          <div className="flex w-full space-x-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDropOrder(order, currentTab);
              }} 
              className="flex-1 flex items-center justify-center bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Drop
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleComplete(order, currentTab);
              }} 
              className="flex-1 flex items-center justify-center bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
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
        border border-gray-300 rounded-xl mb-2 overflow-hidden 
        transition-all duration-300 ease-in-out bg-white
        ${isExpanded ? 'shadow-lg' : 'shadow-sm'}
      `}
      onClick={toggleExpand}
    >
      {/* Basic Order Information */}
      <div className="flex justify-between items-center p-2 cursor-pointer">
        <div className="flex-grow">
          <h3 className="font-semibold text-gray-800">Order: #{order.orderId}</h3>
          <h4 className="font-semibold text-gray-800">Split: #{order.splitId}</h4>
          <h4 className="font-semibold text-gray-800">Pickup: {order.storeName}</h4>
        </div>
        
        
      </div>

      {/* Expandable Content */}
      <div 
        className={`
          px-4 transition-all duration-300 ease-in-out
          ${isExpanded ? 'max-h-screen opacity-100 pb-3' : 'max-h-0 opacity-0 overflow-hidden pb-1'}
        `}
      >
        {/* Detailed Order Information */}
        <div className="border-t pt-1 mt-2">
          <div className="space-y-1">
            <p className="whitespace-pre-line pt-2">
              <strong className="text-gray-700 mb-2">Products</strong> {"\n"}
              {order.productNames.map((productName, index) => {
                const productAmount = order.productAmounts[index]; // Get the corresponding productAmount
                return `${productName} - ${productAmount}`;
              }).join("\n")}
            </p>
          </div>
          <p className='pt-4'>
            <strong className='text-gray-700 mb-2'>Payment Method: </strong>
            {order.paymentMethod}
          </p>
          <p className='pt-4'>
            <strong className='text-gray-700 mb-2'>Total Price: </strong>
            {order.paymentMethod === "Credit Card" ? "Paid" : `$${order.totalPrice.toFixed(2)}`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex justify-center">
          {renderButtons()}
        </div>
      </div>
    </div>
  );
}


  // private long orderId;
  // private long splitId;
  // private String storeName;
  // private String storeAddress;
  // private String customerAddress;
  // private String paymentMethod;
  // private String[] productNames;
  // private String[] productAmounts;
  // private BigDecimal totalPrice;


OrderItem.propTypes = {
  order: PropTypes.shape({
    orderId: PropTypes.number.isRequired,
    splitId: PropTypes.number.isRequired,
    storeName: PropTypes.string.isRequired,
    paymentMethod: PropTypes.string.isRequired,
    totalPrice: PropTypes.number.isRequired,
    productNames: PropTypes.array.isRequired,
    productAmounts: PropTypes.array.isRequired,
    storeAddress: PropTypes.string.isRequired,
    customerAddress: PropTypes.string.isRequired
  }).isRequired,
  onButtonClick: PropTypes.func.isRequired,
  currentTab: PropTypes.string.isRequired,
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
import OrderItem from './OrderItem.jsx';
import PropTypes from 'prop-types';

export function ListBarDelivery({ isDesktop, listContent, handleButtonClick }) {
  
  return (
    <div className={`
      bg-gray-100 overflow-y-auto
      ${isDesktop ? 'w-80 h-full border-r border-gray-300' : 'w-full h-1/2 border-b border-gray-300'}
    `}>
      <div className="p-2">
        {listContent.length > 0 ? 
          listContent.map((item, index) => 
          <OrderItem key={index} order={listContent[index]} onButtonClick={() => handleButtonClick(index)} />) 
          : <p className="p-4 text-gray-500">No orders available</p>}
      </div>
    </div>
  );
}
  
ListBarDelivery.propTypes = {
  isDesktop: PropTypes.bool.isRequired,
  listContent: PropTypes.array,
  handleButtonClick: PropTypes.func.isRequired
};



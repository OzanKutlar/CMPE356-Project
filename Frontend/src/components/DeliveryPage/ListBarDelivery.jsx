import { useState, useEffect } from 'react';
import OrderItem from './OrderItem';
import PropTypes from 'prop-types';

export function ListBarDelivery({ isDesktop, listContent, currentTab }) {
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    setExpandedOrder(null);
  }, [currentTab]);

  const handleExpandChange = (order) => {
    setExpandedOrder(expandedOrder && expandedOrder.splitId === order.splitId ? null : order);
  };

  return (
      <div key={currentTab}
           className={`bg-gray-100 overflow-y-auto
      ${isDesktop ? 'w-80 h-full border-r border-gray-300' : 'w-full h-1/2 border-b border-gray-300'}
    `}>
        <div className="p-2">
          {listContent.length > 0 ?
              listContent.map((item, index) => (
                  <OrderItem
                      key={index}
                      order={item}
                      currentTab={currentTab}
                      isExpanded={expandedOrder && expandedOrder.splitId === item.splitId}
                      onExpandChange={handleExpandChange}
                  />
              ))
              : <p className="p-4 text-gray-500">No orders available</p>}
        </div>
      </div>
  );
}

ListBarDelivery.propTypes = {
  isDesktop: PropTypes.bool.isRequired,
  listContent: PropTypes.array,
  currentTab: PropTypes.string,
}



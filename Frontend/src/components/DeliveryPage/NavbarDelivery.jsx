import UserProfile from '../Global/UserProfile';
import PropTypes from 'prop-types';

export default function NavbarDelivery({ activeTab, handleTabClick }) {

  return(
    <nav className="bg-gray-800 text-white p-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          {['A', 'B', 'C'].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded ${activeTab === tab ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <UserProfile />
      </div>
    </nav>
  )
}

NavbarDelivery.propTypes = {
  activeTab: PropTypes.any,
  handleTabClick: PropTypes.func
};

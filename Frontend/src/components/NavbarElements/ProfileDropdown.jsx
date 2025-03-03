import PropTypes from 'prop-types';

export default function ProfileDropdown({ toggleProfile, isProfileOpen }) {
  return (
    <div className="relative">
      <button className="px-4 py-2 rounded-md hover:bg-gray-700" onClick={toggleProfile}>
        Me
      </button>
      
      {isProfileOpen && <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg">
          <button className="block rounded-md w-full text-left px-4 py-2 hover:bg-gray-200">
            Profile
          </button>
          <button className="block rounded-md w-full text-left px-4 py-2 hover:bg-gray-200">
            Log out
          </button>
        </div>}
    </div>
  )
};

ProfileDropdown.propTypes = {
  toggleProfile: PropTypes.func.isRequired,
  isProfileOpen: PropTypes.bool.isRequired
};

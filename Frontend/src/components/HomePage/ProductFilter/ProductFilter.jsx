import {useState} from 'react';
import {ChickenUp, ChickenDown} from '../../Global/Icons';

const FilterBar = ({selectedFilters, setSelectedFilters}) => {
    const [openFilter, setOpenFilter] = useState(null);

    const filters = [
        {
            name: 'Category',
            options: ['Meat', 'Processed Meat', 'Organ Meat']
        },
        {
            name: 'Animal Type',
            options: ['Cow', 'Goat', 'Lamb', 'Chicken', 'Duck']
        },
        {
            name: 'Cut Type',
            options: ['Whole', 'Cut', 'Fillet', 'Minced']
        },
        {
            name: 'Preservation Method',
            options: ['Fresh', 'Frozen', 'Salted', 'Smoked', 'Dry Aged']
        }
    ];

    const toggleFilter = (filterName) => {
        setOpenFilter(openFilter === filterName ? null : filterName);
    };

    const handleOptionClick = (filterName, option) => {
        setSelectedFilters((prev) => {
            const newFilters = {...prev};

            if (newFilters[filterName]) {
                if (newFilters[filterName] !== option) {
                    newFilters[filterName] = option;
                } else {
                    delete newFilters[filterName]; // Remove existing filter
                }
            } else {
                newFilters[filterName] = option; // Add new filter
            }

            return newFilters;
        });
        setOpenFilter(null); // Close the dropdown after selection
    };

    return (
        <div className="w-full bg-white py-4 px-2 md:px-6">
            <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-2 md:gap-4">
                {filters.map((filter) => (
                    <div key={filter.name} className="relative">
                        <button
                            onClick={() => toggleFilter(filter.name)}
                            className="flex items-center bg-white px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
              <span className="mr-2">
                {filter.name}
                  {selectedFilters?.[filter.name] ? `: ${selectedFilters[filter.name]}` : ''}
              </span>
                            {openFilter === filter.name ?
                                <ChickenUp className="h-5 w-5 text-gray-600"/> :
                                <ChickenDown className="h-5 w-5 text-gray-600"/>
                            }
                        </button>

                        {openFilter === filter.name && (
                            <div
                                className="absolute z-10 mt-1 left-1/2 transform -translate-x-1/2 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                                <ul className="py-1">
                                    {filter.options.map((option) => (
                                        <li
                                            key={option}
                                            className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                                                selectedFilters?.[filter.name] === option ? 'bg-gray-100 font-medium' : ''
                                            }`}
                                            onClick={() => handleOptionClick(filter.name, option)}
                                        >
                                            {option}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FilterBar;

import { useState, useRef, useEffect } from 'react';
import { ChickenDown } from '../../Global/Icons';

const FilterBar = ({ selectedFilters, setSelectedFilters }) => {
    const [openFilter, setOpenFilter] = useState(null);
    const dropdownRefs = useRef({});

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

    // Calculate and update dropdown max heights when visibility changes
    useEffect(() => {
        // Reset all dropdown max heights to 0 first
        Object.keys(dropdownRefs.current).forEach(key => {
            if (dropdownRefs.current[key]) {
                dropdownRefs.current[key].style.maxHeight = '0px';
            }
        });

        // If there's an open filter, calculate and set its max height
        if (openFilter && dropdownRefs.current[openFilter]) {
            const container = dropdownRefs.current[openFilter];
            const dropdownHeight = container.scrollHeight;
            container.style.maxHeight = `${dropdownHeight}px`;
        }
    }, [openFilter]);

    const toggleFilter = (filterName) => {
        setOpenFilter(openFilter === filterName ? null : filterName);
    };

    const handleOptionClick = (filterName, option) => {
        setSelectedFilters((prev) => {
            const newFilters = { ...prev };

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
        <div className="w-full bg-white py-6 px-2 md:px-6 shadow-sm">
            <style jsx="true">{`
                .filterbar-dropdown {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
                    opacity: 0;
                    pointer-events: none; /* Disable pointer events when hidden */
                }

                .filterbar-dropdown-open {
                    opacity: 1;
                    visibility: visible; /* Make visible when open */
                    pointer-events: auto; /* Enable pointer events when visible */
                }

                .filterbar-icon-rotate {
                    transition: transform 0.3s ease;
                }

                .filterbar-icon-rotate-open {
                    transform: rotate(180deg);
                }

                .filterbar-selected {
                    background-color: rgba(220, 252, 231, 0.7); /* Light green */
                    border-color: rgba(74, 222, 128, 0.5); /* Green border */
                }

                .filterbar-option-selected {
                    background-color: rgba(220, 252, 231, 0.7);
                    color: rgb(22, 101, 52);
                    font-weight: 500;
                }
            `}</style>
            <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-3 md:gap-5">
                {filters.map((filter) => (
                    <div key={filter.name} className="relative">
                        <button
                            onClick={() => toggleFilter(filter.name)}
                            className={`flex items-center justify-between px-4 py-2.5 rounded-md border shadow-sm hover:shadow transition-all duration-200 min-w-36 ${
                                selectedFilters?.[filter.name]
                                    ? 'filterbar-selected'
                                    : 'bg-white border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <span>
                                {filter.name}
                                {selectedFilters?.[filter.name] ? `: ${selectedFilters[filter.name]}` : ''}
                            </span>
                            <div className={`filterbar-icon-rotate ml-2 ${openFilter === filter.name ? 'filterbar-icon-rotate-open' : ''}`}>
                                <ChickenDown className="h-5 w-5 text-gray-600" />
                            </div>
                        </button>

                        <div
                            ref={(el) => dropdownRefs.current[filter.name] = el}
                            className={`absolute z-10 mt-1 left-1/2 transform -translate-x-1/2 w-48 bg-white rounded-md shadow-lg border border-gray-200 filterbar-dropdown ${
                                openFilter === filter.name ? 'filterbar-dropdown-open' : ''
                            }`}
                        >
                            <ul className="py-1">
                                {filter.options.map((option) => (
                                    <li
                                        key={option}
                                        className={`px-4 py-2.5 hover:bg-gray-100 cursor-pointer transition-colors ${
                                            selectedFilters?.[filter.name] === option ? 'filterbar-option-selected' : ''
                                        }`}
                                        onClick={() => handleOptionClick(filter.name, option)}
                                    >
                                        {option}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FilterBar;
import React, { useState, useEffect } from 'react';

/**
 * SearchBar Component
 * 
 * This component provides a search interface for filtering patient data.
 * 
 * Props:
 * - onSearch: Function to handle search submission (passed from parent)
 * - error: Error message from the parent component
 * - selectedOrg: Current organization ID
 * - isCircleOrg: Boolean indicating if current org is Circle
 */
function SearchBar({ onSearch, error, selectedOrg, isCircleOrg }) {
  // State for the selected search field type
  const [searchType, setSearchType] = useState('patientName');
  
  // State for the search input value
  const [searchValue, setSearchValue] = useState('');
  
  // State to track if search is active
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  // State for local error message
  const [localError, setLocalError] = useState('');

  // Reset local error when parent error changes
  useEffect(() => {
    if (error) {
      setLocalError('Search failed. Please try again with different criteria.');
      setIsSearchActive(false);
    } else {
      setLocalError('');
    }
  }, [error]);

  /**
   * Handles form submission
   */
  const handleSearch = (e) => {
    e.preventDefault();
    console.log('[SearchBar] Search form submitted');
    
    setLocalError('');
    
    if (!searchValue.trim()) {
      console.log('[SearchBar] Empty search value, clearing search params');
      onSearch({});
      setIsSearchActive(false);
      return;
    }
    
    // Handle date searches
    if (searchType === 'activationDate' || searchType === 'resultDate') {
      const date = new Date(searchValue);
      if (isNaN(date.getTime())) {
        setLocalError('Please select a valid date');
        return;
      }
      
      // Format the date as YYYY-MM-DD for the backend
      const formattedDate = date.toISOString().split('T')[0];
      const params = { [searchType]: formattedDate };
      console.log('[SearchBar] Created date search params:', params);
      onSearch(params);
      setIsSearchActive(true);
      return;
    }
    
    // Handle non-date searches
    let paramName;
    switch(searchType) {
      case 'patientName':
        paramName = 'patientName';
        break;
      case 'sampleId':
        paramName = 'sampleId';
        break;
      case 'patientId':
        paramName = 'patientId';
        break;
      default:
        paramName = searchType;
    }
    
    const params = { [paramName]: searchValue };
    console.log('[SearchBar] Created search params:', params);
    onSearch(params);
    setIsSearchActive(true);
  };

  /**
   * Handles clearing the search
   */
  const handleClear = () => {
    console.log('[SearchBar] Clear button clicked, resetting search');
    setSearchValue('');
    setLocalError('');
    onSearch({});
    setIsSearchActive(false);
  };

  /**
   * Handles search type change
   */
  const handleSearchTypeChange = (e) => {
    const newType = e.target.value;
    console.log(`[SearchBar] Search type changed from ${searchType} to ${newType}`);
    setSearchType(newType);
    setSearchValue(''); // Clear the search value when changing type
    setLocalError('');
  };

  /**
   * Handles search value change
   */
  const handleSearchValueChange = (e) => {
    const newValue = e.target.value;
    console.log(`[SearchBar] Search value changed to: ${newValue}`);
    setSearchValue(newValue);
  };

  /**
   * Get placeholder text based on search type
   */
  const getPlaceholderText = () => {
    switch(searchType) {
      case 'patientName':
        return 'Enter patient name';
      case 'sampleId':
        return 'Enter sample barcode';
      case 'patientId':
        return 'Enter patient ID';
      case 'activationDate':
      case 'resultDate':
        return 'Enter date (DD/MM/YYYY)';
      default:
        return `Search by ${searchType.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
    }
  };

  /**
   * Format the display value for the active search indicator
   */
  const formatDisplayValue = (type, value) => {
    if (type === 'activationDate' || type === 'resultDate') {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        }
      } catch (e) {
        // If date parsing fails, return the original value
      }
    }
    return value;
  };

  return (
    <div className="search-container">
      <form className="search-bar" onSubmit={handleSearch}>
        <select 
          value={searchType} 
          onChange={handleSearchTypeChange}
        >
          <option value="patientName">Patient Name</option>
          <option value="sampleId">Sample Barcode</option>
          {isCircleOrg && <option value="patientId">Patient ID</option>}
          <option value="activationDate">Activation Date</option>
          <option value="resultDate">Result Date</option>
        </select>
        
        <input
          type={searchType.includes('Date') ? 'date' : 'text'}
          value={searchValue}
          onChange={handleSearchValueChange}
          placeholder={getPlaceholderText()}
        />
        
        <button type="submit" className="search-button">Search</button>
        
        <button 
          type="button" 
          onClick={handleClear}
          className="clear-button"
          disabled={!isSearchActive && !searchValue}
        >
          Clear
        </button>
      </form>
      
      {localError && (
        <div className="search-error-message">
          {localError}
        </div>
      )}
      
      {isSearchActive && !localError && (
        <div className="active-search-indicator">
          <span>Active search: {searchType.replace(/([A-Z])/g, ' $1').toLowerCase()} = {formatDisplayValue(searchType, searchValue)}</span>
          <button 
            className="remove-search-button"
            onClick={handleClear}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchBar; 
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navigation from './components/Navigation';
import OrganizationSelector from './components/OrganizationSelector';
import PatientTable from './components/PatientTable';
import Pagination from './components/Pagination';
import SearchBar from './components/SearchBar';
import DataGeneratorButton from './components/DataGeneratorButton';
import './App.css';
import * as api from './services/api';

// Constants
const ITEMS_PER_PAGE = 15;

/**
 * Main App Component
 * 
 * This is the root component of the application that manages:
 * - Organization selection
 * - Patient data fetching
 * - Search functionality
 * - Pagination
 * - Error handling
 */
function App() {
  // State for organizations
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  
  // State for patient results
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  // State for search
  const [searchParams, setSearchParams] = useState({});
  
  // Ref to track the last fetch to prevent duplicate API calls
  const lastFetchRef = useRef({
    selectedOrg: '',
    currentPage: 1,
    searchParams: '{}'
  });

  /**
   * Fetch patient results from the API
   */
  const fetchResults = useCallback(async () => {
    // Check if we should skip this fetch
    const currentFetch = {
      selectedOrg,
      currentPage,
      searchParams: JSON.stringify(searchParams)
    };
    
    console.log('[App] fetchResults called with:', {
      selectedOrg,
      currentPage,
      searchParams: Object.keys(searchParams).length > 0 ? searchParams : 'No search params'
    });
    
    // Skip if nothing has changed
    if (lastFetchRef.current.selectedOrg === currentFetch.selectedOrg &&
        lastFetchRef.current.currentPage === currentFetch.currentPage &&
        lastFetchRef.current.searchParams === currentFetch.searchParams) {
      console.log('[App] Skipping duplicate fetch');
      return;
    }

    // Update the last fetch ref
    lastFetchRef.current = currentFetch;
    console.log('[App] Updated lastFetchRef to:', lastFetchRef.current);

    if (!selectedOrg) {
      console.log('[App] No organization selected, skipping fetch');
      return;
    }

    // Prevent duplicate API calls by checking if we're already loading
    if (loading) {
      console.log('[App] Already loading data, skipping duplicate fetch');
      return;
    }

    console.log('[App] Fetching results for:', {
      selectedOrg,
      currentPage,
      searchParams: Object.keys(searchParams).length > 0 ? searchParams : 'No search params'
    });

    // Set a minimum loading time to prevent flashing
    const startTime = Date.now();
    setLoading(true);
    setError(null);

    try {
      // Add detailed logging for debugging pagination
      console.log('==== APP FETCH DEBUG ====');
      console.log('Fetching page:', currentPage);
      console.log('Items per page:', ITEMS_PER_PAGE);
      console.log('Calculated offset:', (currentPage - 1) * ITEMS_PER_PAGE);
      console.log('Active search parameters:', Object.keys(searchParams).length > 0 ? searchParams : 'None');
      
      // Use server-side pagination instead of client-side pagination
      const data = await api.fetchPatientResults(
        selectedOrg,
        currentPage,
        ITEMS_PER_PAGE,
        searchParams
      );
      
      console.log('==== API RESPONSE DEBUG ====');
      console.log('API response meta:', data?.meta);
      console.log('API response data length:', data?.data?.length);
      console.log('API response data (first 3 items):', JSON.stringify(data?.data?.slice(0, 3)));
      
      if (data && data.data && data.data.length > 0) {
        console.log('First few sample IDs from API:', data.data.slice(0, 3).map(sample => sample.attributes?.sampleId || sample.id));
      }
      
      if (!data) {
        console.error('[App] No data received from the server');
        setError('No data received from the server.');
        setResults(null);
      
        // Ensure loading state is shown for at least 500ms to prevent flashing
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < 500) {
          await new Promise(resolve => setTimeout(resolve, 500 - elapsedTime));
        }
        
        setLoading(false);
        return;
      }
      
      setResults(data);
      // Calculate total pages from total count and items per page
      const totalItems = data.meta?.total || data.data?.length || 0;
      const calculatedTotalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
      console.log('[App] Calculated total pages:', {
        totalItems,
        itemsPerPage: ITEMS_PER_PAGE,
        calculatedTotalPages
      });
      setTotalPages(calculatedTotalPages);
      setLoading(false);
    } catch (error) {
      console.error('[App] Error fetching results:', error);
      
      // Ensure loading state is shown for at least 500ms to prevent flashing
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 500) {
        await new Promise(resolve => setTimeout(resolve, 500 - elapsedTime));
      }
      
      setError('Failed to fetch results. Please make sure the backend server is running.');
      setLoading(false);
      setResults(null);
    }
  }, [selectedOrg, currentPage, searchParams, loading]);

  /**
   * Fetch organizations on component mount
   */
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('[App] Fetching organizations');
        const data = await api.fetchOrganizations();
        
        if (data && data.data) {
          console.log('[App] Organizations fetched successfully:', data.data.length);
          setOrganizations(data.data);
          
          // Set the first organization as default
          if (data.data.length > 0) {
            console.log('[App] Setting first organization as default:', data.data[0].id);
            setSelectedOrg(data.data[0].id);
          }
        } else {
          console.error('[App] No organization data received');
          setError('No organizations found. Please make sure the backend server is running.');
        }
      } catch (error) {
        console.error('[App] Error fetching organizations:', error);
        setError('Failed to fetch organizations. Please make sure the backend server is running.');
      }
    };

    initializeApp();
  }, []);

  /**
   * Fetch results when organization, page, or search params change
   */
  useEffect(() => {
    fetchResults();
  }, [selectedOrg, currentPage, searchParams, fetchResults]);

  /**
   * Handle search form submission
   * 
   * @param {Object} params - Search parameters
   */
  const handleSearch = (params) => {
    console.log('[App] Search params:', params);
    setSearchParams(params);
    setCurrentPage(1); // Reset to first page on search
  };

  /**
   * Handles pagination changes
   * 
   * @param {number} page - New page number to navigate to
   */
  const handlePageChange = (page) => {
    console.log('[App] Page changed from', currentPage, 'to', page);
    
    // Validate the page number
    if (page < 1 || (totalPages > 0 && page > totalPages)) {
      console.warn(`[App] Invalid page number: ${page}. Valid range is 1-${totalPages}`);
      return;
    }
    
    // Force a re-fetch by updating the lastFetchRef
    const newFetch = {
      selectedOrg,
      currentPage: page,
      searchParams: JSON.stringify(searchParams)
    };
    
    console.log('[App] Forcing re-fetch with new page:', page);
    console.log('[App] Previous fetch ref:', lastFetchRef.current);
    console.log('[App] New fetch ref:', newFetch);
    
    // Reset the lastFetchRef to force a re-fetch
    lastFetchRef.current = {
      selectedOrg: '',
      currentPage: 0,
      searchParams: '{}'
    };
    
    // Update current page state
    setCurrentPage(page);
  };

  /**
   * Handles organization change
   * 
   * @param {string} orgId - New organization ID
   */
  const handleOrgChange = (orgId) => {
    console.log('[App] Organization changed to:', orgId);
    setSelectedOrg(orgId);
    setCurrentPage(1); // Reset to first page on org change
    setSearchParams({}); // Clear search parameters
  };

  /**
   * Retry fetching data
   */
  const handleRetry = () => {
    fetchResults();
  };

  // Render the application UI
  return (
    <div className="app-container">
      <Navigation />
      
      <main className="main-content">
        <div className="controls">
          <OrganizationSelector 
            organizations={organizations}
            selectedOrg={selectedOrg}
            onOrgChange={handleOrgChange}
          />
          
          <SearchBar 
            onSearch={handleSearch} 
            error={error}
            selectedOrg={selectedOrg}
            isCircleOrg={organizations.find(org => 
              org.id === selectedOrg && 
              org.attributes?.name?.toLowerCase() === 'circle'
            )}
          />
          
          <DataGeneratorButton selectedOrg={selectedOrg} />
        </div>
        
        {error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button className="retry-button" onClick={handleRetry}>
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading patient data...</p>
          </div>
        ) : results && results.data && results.data.length > 0 ? (
          <>
            <PatientTable 
              data={results} 
              selectedOrg={selectedOrg}
              searchParams={searchParams}
            />
            
            {console.log('Pagination Debug:', { 
              resultsMeta: results.meta, 
              resultsMetaTotal: results.meta?.total, 
              currentPage, 
              totalPages,
              shouldShowPagination: results.meta && results.meta.total > 0,
              dataLength: results.data?.length
            })}
            
            {/* Always show pagination if we have data */}
            {results.data && results.data.length > 0 && (
              <div className="pagination-wrapper">
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
                <div className="pagination-status">
                  Showing page {currentPage} of {totalPages} 
                  ({results.data.length} items, {results.meta?.total || results.data.length} total)
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="no-results">
            <p>No patient data available. Try generating test data.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

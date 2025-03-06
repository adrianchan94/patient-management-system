import React, { useMemo } from 'react';
/**
 * PatientTable Component
 * 
 * This component displays patient data in a tabular format.
 * 
 * Props:
 * - data: The API response containing patient data
 * - selectedOrg: Current organization ID
 * - searchParams: Current search parameters
 */
function PatientTable({ data, selectedOrg, searchParams = {} }) {
  // Add detailed logging for debugging pagination
  console.log('==== PATIENT TABLE DEBUG ====');
  console.log('Data received:', data);
  console.log('Selected Org:', selectedOrg);
  
  // Find the organization name from the included data
  const isCircleOrg = useMemo(() => {
    if (!data?.included || !Array.isArray(data.included)) return false;
    
    const org = data.included.find(
      item => item.type === 'organisation' && item.id === selectedOrg
    );
    
    return org?.attributes?.name?.toLowerCase() === 'circle';
  }, [data, selectedOrg]);
  
  // Use useMemo to prevent unnecessary re-renders
  const processedData = useMemo(() => {
    // If no data is available, return empty data structure
    if (!data || !data.data || data.data.length === 0) {
      return { data: [], included: [] };
    }
    
    // The API already returns paginated data, so we don't need to filter for uniqueness here
    // Just return the data as is
    console.log(`[PatientTable] Processing ${data.data.length} samples from API`);
    
    return data;
  }, [data]);

  // If no data is available, show a message
  if (!processedData.data || processedData.data.length === 0) {
    return (
      <div className="no-results">
        <p>No results found. Try adjusting your search criteria or select a different organization.</p>
      </div>
    );
  }

  /**
   * Helper function to get patient name from the included profiles
   */
  const getPatientName = (profileId) => {
    // Check if included array exists
    if (!processedData.included || !Array.isArray(processedData.included)) {
      return "Unknown";
    }
    
    // Find the profile in the included array
    const profile = processedData.included.find(
      item => item.type === 'profile' && item.id === profileId
    );
    
    // Return the name if found, otherwise "Unknown"
    if (profile && profile.attributes && profile.attributes.name) {
      return profile.attributes.name;
    }
    
    return "Unknown";
  };

  /**
   * Format date strings for better readability
   */
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      // Format as DD/MM/YYYY, HH:mm:ss
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      
      return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
    } catch (e) {
      return dateString;
    }
  };

  /**
   * Format date for comparison with search term
   */
  const formatDateForSearch = (dateString) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      // Format as YYYY-MM-DD for comparison with search input
      return date.toISOString().split('T')[0];
    } catch (e) {
      return dateString;
    }
  };

  /**
   * Format result type for display
   */
  const formatResultType = (type) => {
    switch(type?.toLowerCase()) {
      case 'rtpcr':
        return 'RT-PCR';
      case 'antigen':
        return 'Antigen';
      case 'antibody':
        return 'Antibody';
      default:
        return 'N/A';
    }
  };

  /**
   * Highlight text if it matches the search term
   */
  const highlightMatch = (text, searchTerm) => {
    if (!searchTerm || typeof text !== 'string') {
      return text;
    }
    
    // Case insensitive search
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <span key={index} className="patient-name-match">{part}</span> : 
        part
    );
  };

  return (
    <div className="patient-table-container">
      <table className="patient-table">
        <thead>
          <tr>
            <th>Patient Name</th>
            {isCircleOrg && <th>Patient ID</th>}
            <th>Sample Barcode</th>
            {isCircleOrg && <th>Result Type</th>}
            <th>Result Value</th>
            <th>Activation Date</th>
            <th>Result Date</th>
          </tr>
        </thead>
        <tbody>
          {processedData.data.map(sample => {
            // Get the profile ID from the relationships
            const profileId = sample.relationships && 
                             sample.relationships.profile && 
                             sample.relationships.profile.data && 
                             sample.relationships.profile.data.id;
            
            // Get the patient name using the profile ID
            const patientName = profileId ? getPatientName(profileId) : "Unknown";
            
            // Get attributes safely
            const attributes = sample.attributes || {};
            
            return (
              <tr key={sample.id}>
                <td>
                  {searchParams.patientName ? 
                    highlightMatch(patientName, searchParams.patientName) : 
                    patientName}
                </td>
                {isCircleOrg && (
                  <td>
                    {searchParams.patientId ? 
                      highlightMatch(profileId || "N/A", searchParams.patientId) : 
                      (profileId || "N/A")}
                  </td>
                )}
                <td>
                  {searchParams.sampleId ? 
                    highlightMatch(attributes.sampleId || "N/A", searchParams.sampleId) : 
                    (attributes.sampleId || "N/A")}
                </td>
                {isCircleOrg && <td>{formatResultType(attributes.resultType)}</td>}
                <td>{attributes.result || "Pending"}</td>
                <td>
                  {searchParams.activationDate ? 
                    highlightMatch(formatDate(attributes.activateTime), formatDateForSearch(attributes.activateTime)) : 
                    formatDate(attributes.activateTime)}
                </td>
                <td>
                  {searchParams.resultDate ? 
                    highlightMatch(formatDate(attributes.resultTime), formatDateForSearch(attributes.resultTime)) : 
                    formatDate(attributes.resultTime)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default PatientTable; 
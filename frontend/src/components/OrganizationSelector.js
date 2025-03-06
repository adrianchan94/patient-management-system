import React, { useEffect, useState } from 'react';

/**
 * OrganizationSelector Component
 * 
 * This component provides a dropdown to select the current organization.
 * 
 * Props:
 * - selectedOrg: Currently selected organization ID
 * - onOrgChange: Function to update the selected organization
 * - organizations: Array of organization objects from the API
 */
function OrganizationSelector({ selectedOrg, onOrgChange, organizations = [] }) {
  // Add local state to track if we've received organizations
  const [hasReceivedOrgs, setHasReceivedOrgs] = useState(false);
  
  // Add debugging logs - but only when the props actually change
  useEffect(() => {
    // Only log once when organizations are first received
    if (organizations && organizations.length > 0 && !hasReceivedOrgs) {
      console.log('OrganizationSelector received organizations:', organizations.length);
      setHasReceivedOrgs(true);
    }
  }, [organizations, hasReceivedOrgs]);

  // Handle change in the select dropdown
  const handleChange = (e) => {
    console.log('Organization selection changed to:', e.target.value);
    onOrgChange(e.target.value);
  };

  // If no organizations loaded yet, show loading state
  if (!organizations || organizations.length === 0) {
    return (
      <div className="org-selector">
        <label htmlFor="organization">Organization:</label>
        <select 
          id="organization" 
          value="" 
          disabled
        >
          <option value="">Loading organizations...</option>
        </select>
      </div>
    );
  }

  return (
    <div className="org-selector">
      <label htmlFor="organization">Organization:</label>
      <select 
        id="organization" 
        value={selectedOrg} 
        onChange={handleChange}
      >
        {organizations.map((org, index) => {
          // Make sure we have the required properties
          const id = org.id || '';
          const name = org.attributes?.name || `Organization ${index + 1}`;
          
          return (
            <option key={id} value={id}>
              {name}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export default OrganizationSelector; 
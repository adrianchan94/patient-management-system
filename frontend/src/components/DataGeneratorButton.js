import React, { useState } from 'react';
import { generateBulkData } from '../utils/DataGenerator';

/**
 * DataGeneratorButton Component
 * 
 * This component provides a button to generate test data.
 * It allows users to create profiles and samples with a single click.
 * 
 * Props:
 * - selectedOrg: Current organization ID
 */
function DataGeneratorButton({ selectedOrg }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Handle the generate data button click
   */
  const handleGenerateData = async () => {
    if (!selectedOrg) {
      setError('Please select an organization first');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setResult(null);
      
      // Generate 3 profiles with 2 samples each
      const data = await generateBulkData(selectedOrg, 3, 2);
      
      setResult({
        profilesCreated: data.profiles.length,
        samplesCreated: data.samples.length
      });
      
      // Refresh the page after 2 seconds to show the new data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error generating data:', error);
      setError('Failed to generate data. Please check the console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="data-generator">
      <h3>Test Data Generator</h3>
      <p>Generate random patient profiles and test samples with a single click.</p>
      
      <button 
        className="generate-button"
        onClick={handleGenerateData}
        disabled={isGenerating || !selectedOrg}
      >
        {isGenerating ? 'Generating...' : 'Generate Test Data'}
      </button>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {result && (
        <div className="success-message">
          Successfully created {result.profilesCreated} profiles and {result.samplesCreated} samples.
          <br />
          Refreshing page...
        </div>
      )}
    </div>
  );
}

export default DataGeneratorButton; 
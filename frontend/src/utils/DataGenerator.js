import { createProfile, addSample } from '../services/api';

/**
 * DataGenerator Utility
 * 
 * This utility provides functions to generate test data for the application.
 * It can create profiles and samples with random or specified data.
 */

// Array of sample first names
const firstNames = [
  'John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Lisa',
  'William', 'Emma', 'James', 'Olivia', 'Daniel', 'Sophia', 'Matthew', 'Ava',
  'Joseph', 'Isabella', 'Andrew', 'Mia', 'Thomas', 'Charlotte', 'Anthony', 'Amelia'
];

// Array of sample last names
const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson',
  'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin',
  'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee'
];

// Array of possible result types
const resultTypes = ['rtpcr', 'antibody', 'rtlamp', 'antigen', 'coyote'];

/**
 * Generate a random name
 * @returns {string} A randomly generated full name
 */
const generateRandomName = () => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
};

/**
 * Generate a random sample ID
 * @returns {string} A randomly generated sample ID
 */
const generateRandomSampleId = () => {
  const prefix = 'SAMPLE';
  const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `${prefix}-${randomNum}`;
};

/**
 * Generate a random result type
 * @returns {string} A randomly selected result type
 */
const generateRandomResultType = () => {
  return resultTypes[Math.floor(Math.random() * resultTypes.length)];
};

/**
 * Create a new profile
 * @param {string} orgId - Organization ID
 * @param {string} [name] - Optional name for the profile (random if not provided)
 * @returns {Promise<Object>} The created profile data
 */
export const generateProfile = async (orgId, name = null) => {
  if (!orgId) {
    throw new Error('Organization ID is required');
  }

  const profileName = name || generateRandomName();
  
  try {
    const profileData = {
      data: {
        type: 'profile',
        attributes: {
          name: profileName
        }
      }
    };
    
    const response = await createProfile(orgId, profileData);
    console.log('Profile created:', response);
    return response;
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
};

/**
 * Add a sample to a profile
 * @param {string} orgId - Organization ID
 * @param {string} profileId - Profile ID
 * @param {Object} [sampleOptions] - Optional sample data
 * @param {string} [sampleOptions.sampleId] - Sample ID (random if not provided)
 * @param {string} [sampleOptions.resultType] - Result type (random if not provided)
 * @returns {Promise<Object>} The created sample data
 */
export const generateSample = async (orgId, profileId, sampleOptions = {}) => {
  if (!orgId) {
    throw new Error('Organization ID is required');
  }
  
  if (!profileId) {
    throw new Error('Profile ID is required');
  }
  
  const sampleId = sampleOptions.sampleId || generateRandomSampleId();
  const resultType = sampleOptions.resultType || generateRandomResultType();
  
  try {
    const sampleData = {
      data: {
        type: 'sample',
        attributes: {
          sampleId,
          resultType
        }
      }
    };
    
    const response = await addSample(orgId, profileId, sampleData);
    console.log('Sample created:', response);
    return response;
  } catch (error) {
    console.error('Error creating sample:', error);
    throw error;
  }
};

/**
 * Generate multiple profiles with samples
 * @param {string} orgId - Organization ID
 * @param {number} [profileCount=5] - Number of profiles to create
 * @param {number} [samplesPerProfile=2] - Number of samples per profile
 * @returns {Promise<Object>} Object containing created profiles and samples
 */
export const generateBulkData = async (orgId, profileCount = 5, samplesPerProfile = 2) => {
  if (!orgId) {
    throw new Error('Organization ID is required');
  }
  
  const results = {
    profiles: [],
    samples: []
  };
  
  try {
    // Create profiles
    for (let i = 0; i < profileCount; i++) {
      const profile = await generateProfile(orgId);
      results.profiles.push(profile);
      
      // Create samples for each profile
      for (let j = 0; j < samplesPerProfile; j++) {
        const sample = await generateSample(orgId, profile.data.id);
        results.samples.push(sample);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error generating bulk data:', error);
    throw error;
  }
};

const dataGenerator = {
  generateProfile,
  generateSample,
  generateBulkData
};

export default dataGenerator; 
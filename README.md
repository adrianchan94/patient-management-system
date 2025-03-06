# Patient Management System Documentation

## Overview
This documentation covers the implementation of a Patient Management System with both frontend and backend components. The system allows users to view, paginate, and search for patient test results with different filtering options based on the organization.

## Features Implemented

### Backend Features
#### Pagination of Test Results
- Implemented pagination with 15 results per page
- Added offset and limit parameters to control pagination
- Included total count in response metadata

#### Search Functionality
- Implemented search by patient name
- Implemented search by sample barcode (sample ID)
- Implemented search by activation date
- Implemented search by result date
- Implemented search by patient ID (profile ID)

#### Organization-Specific Fields
- Added support for displaying result type (RT-PCR, Antigen, Antibody)
- Added support for displaying patient ID
- Implemented organization-specific search capabilities

### Frontend Features
#### Patient Management Page
- Displays patient test results in a tabular format
- Shows patient name, sample barcode, activation date, result date, and result value
- Implements pagination with 15 results per page

#### Search Functionality
- Allows searching by patient name
- Allows searching by sample barcode
- Allows searching by activation date
- Allows searching by result date

#### Organization-Specific Features
- For Circle organization, displays additional fields:
  - Result type (RT-PCR, Antigen, Antibody)
  - Patient ID
- For Circle organization, allows searching by patient ID

## Technical Implementation

### Backend Implementation
The backend implementation focuses on enhancing the search functionality in the search.ts file. Key improvements include:

#### Parameter Extraction
- Enhanced parameter extraction to handle different query formats
- Added support for both direct parameters and filter-prefixed parameters
- Implemented robust error handling for invalid parameters

#### SQL Query Building
- Built dynamic SQL queries based on search parameters
- Implemented LIKE queries for text-based searches (patient name, sample ID)
- Implemented exact date matching for date-based searches
- Added support for partial UUID matching for patient ID searches

#### Response Formatting
- Formatted responses according to JSON:API specification
- Included related entities (profiles, organizations) in the response
- Added pagination metadata (total, offset, limit)

### Frontend Implementation
The frontend implementation includes:

#### UI Components
- Patient table component for displaying test results
- Search bar component for filtering results
- Pagination component for navigating through pages

#### API Integration
- Implemented API service for fetching data from the backend
- Added support for different search parameters
- Handled pagination parameters

#### Organization-Specific Logic
- Detected organization type and adjusted UI accordingly
- Showed/hid fields based on organization
- Enabled/disabled search options based on organization

## Testing

### Backend Testing
#### Profile ID Filtering
- Created test profiles with known UUIDs
- Tested searching with complete UUIDs
- Tested searching with partial UUIDs
- Verified that only matching profiles were returned

#### Date Filtering
- Created samples with different activation and result dates
- Tested filtering by specific dates
- Tested combined filtering (date + other parameters)
- Verified that date filtering worked correctly

#### Sample ID and Patient Name Filtering
- Created samples with different sample IDs and patient names
- Tested partial matching for sample IDs
- Tested partial matching for patient names
- Verified that text-based filtering worked correctly

### Frontend Testing
#### UI Testing
- Verified that all required fields were displayed
- Tested organization-specific field display
- Verified that search inputs worked correctly

#### Search Functionality
- Tested each search parameter individually
- Tested combined search parameters
- Verified that search results were displayed correctly

#### Pagination
- Tested navigation between pages
- Verified that correct page numbers were displayed
- Tested edge cases (first page, last page)

## License

[MIT](LICENSE)

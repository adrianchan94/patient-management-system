import React from 'react';

/**
 * Pagination Component
 * 
 * This component provides pagination controls for navigating through multiple pages of results.
 * It displays:
 * - Previous page button
 * - Page number buttons
 * - Next page button
 * 
 * Props:
 * - currentPage: The current active page number
 * - totalPages: The total number of pages available
 * - onPageChange: Function to handle page change events
 */
function Pagination({ currentPage, totalPages, onPageChange }) {
  // If there's only one page, don't show pagination
  if (totalPages <= 1) {
    return null;
  }

  /**
   * Generate an array of page numbers to display
   * For large page counts, we show a limited window around the current page
   */
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Maximum number of page buttons to show
    
    // Calculate the range of pages to show
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    // Generate the array of page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  return (
    <div className="pagination">
      {/* Previous page button */}
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        &laquo;
      </button>
      
      {/* First page button (if not in view) */}
      {getPageNumbers()[0] > 1 && (
        <>
          <button onClick={() => onPageChange(1)}>1</button>
          {getPageNumbers()[0] > 2 && <span>...</span>}
        </>
      )}
      
      {/* Page number buttons */}
      {getPageNumbers().map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={currentPage === number ? 'active' : ''}
          aria-label={`Page ${number}`}
          aria-current={currentPage === number ? 'page' : undefined}
        >
          {number}
        </button>
      ))}
      
      {/* Last page button (if not in view) */}
      {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
        <>
          {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && <span>...</span>}
          <button onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}
      
      {/* Next page button */}
      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        &raquo;
      </button>
    </div>
  );
}

export default Pagination; 
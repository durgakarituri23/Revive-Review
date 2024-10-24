import React, { useState } from 'react';

const HomeContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [sortOption, setSortOption] = useState('');

  // Handle Search
  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  // Handle Filter
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    console.log('Filtering by:', e.target.value);
  };

  // Handle Sort
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    console.log('Sorting by:', e.target.value);
  };

  return (
    <div>
      <h2>Home Page</h2>
      {/* Search, Filter, and Sort Section */}
      <div className="d-flex justify-content-between align-items-center mt-3 mb-3">
        {/* Search Bar */}
        <form className="d-flex" onSubmit={handleSearch}>
          <input
            type="text"
            className="form-control me-2"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-outline-primary">Search</button>
        </form>

        {/* Filter Dropdown */}
        <div className="ms-3">
          <label htmlFor="filter" className="form-label me-2">Filter:</label>
          <select
            className="form-select"
            id="filter"
            value={filter}
            onChange={handleFilterChange}
          >
            <option value="">All</option>
            <option value="category1">Category 1</option>
            <option value="category2">Category 2</option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="ms-3">
          <label htmlFor="sort" className="form-label me-2">Sort:</label>
          <select
            className="form-select"
            id="sort"
            value={sortOption}
            onChange={handleSortChange}
          >
            <option value="">Select</option>
            <option value="price">Price</option>
            <option value="date">Date</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default HomeContent;

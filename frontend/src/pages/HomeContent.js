import React, { useState, useEffect } from "react";
import axios from "axios";

const HomeContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [products, setProducts] = useState([]);

  // Fetch approved products from the backend
  const fetchApprovedProducts = async () => {
    try {
      const response = await axios.get("http://localhost:8000/products/approved");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching approved products:", error);
    }
  };

  useEffect(() => {
    fetchApprovedProducts();
  }, []);

  // Handle Search
  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  // Handle Filter
  const handleFilterChange = (e) => {
    const selectedFilter = e.target.value;
    setFilter(selectedFilter);
    if (selectedFilter) {
      const filteredProducts = products.filter(product => product.category === selectedFilter);
      setProducts(filteredProducts);
    } else {
      // Reset to show all products
      fetchApprovedProducts();
    }
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
      </div>
       {/* Display Products */}
       <div className="row">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className="col-md-4 mb-4">
              <div className="card">
                <img
                  src={`http://localhost:8000/upload_images/${product.images[0]}`}
                  className="card-img-top"
                  alt={product.product_name}
                />
                <div className="card-body">
                  <h5 className="card-title">{product.product_name}</h5>
                  <p className="card-text">{product.description}</p>
                  <p className="card-text"><strong>Price:</strong> ${product.price.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
};

export default HomeContent;

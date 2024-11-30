import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const HomeContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 6;

  const fetchApprovedProducts = async () => {
    try {
      const response = await axios.get("http://localhost:8000/products/approved");
      setAllProducts(response.data);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching approved products:", error);
    }
  };

  useEffect(() => {
    fetchApprovedProducts();
    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const filteredProducts = allProducts.filter(product =>
      product.product_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setProducts(filteredProducts);
    setCurrentPage(1);
  };

  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:8000/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleFilterChange = (e) => {
    const selectedFilter = e.target.value;
    setFilter(selectedFilter);

    let filteredProducts = allProducts;
    if (selectedFilter) {
      filteredProducts = allProducts.filter(product => product.category === selectedFilter);
    }

    if (searchQuery) {
      filteredProducts = filteredProducts.filter(product =>
        product.product_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setProducts(filteredProducts);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    const selectedSort = e.target.value;
    setSortOption(selectedSort);
    let sortedProducts = [...products];
    if (selectedSort === "price") {
      sortedProducts.sort((a, b) => a.price - b.price);
    } else if (selectedSort === "date") {
      sortedProducts.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    setProducts(sortedProducts);
  };

  const handleAddToCart = async (product) => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      alert("Please log in to add items to your cart.");
      return;
    }

    try {
      await axios.post("http://localhost:8000/user/add-to-cart", {
        email: userEmail,
        products: [{ productId: product._id, quantity: 1 }],
      });
    } catch (error) {
      console.error("Error adding product to cart:", error);
      alert("Failed to add product to cart.");
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = products.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Home Page</h2>

      <div className="row align-items-center g-3 mb-4">
        <div className="col-md-6">
          <form className="d-flex" onSubmit={handleSearch}>
            <input
              type="text"
              className="form-control me-2"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ minWidth: "300px" }}
            />
            <button type="submit" className="btn btn-outline-primary">Search</button>
          </form>
        </div>

        <div className="col-md-3">
          <div className="d-flex align-items-center">
            <label htmlFor="filter" className="form-label me-2 mb-0">Filter:</label>
            <select
              className="form-select"
              id="filter"
              value={filter}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              {categories.map((category) => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="col-md-3">
          <div className="d-flex align-items-center">
            <label htmlFor="sort" className="form-label me-2 mb-0">Sort:</label>
            <select
              className="form-select"
              id="sort"
              value={sortOption}
              onChange={handleSortChange}
            >
              <option value="" disabled>Select below options</option>
              <option value="price">Price</option>
              <option value="date">Date</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row">
        {currentProducts.map((product) => (
          <div key={product._id} className="col-md-4 mb-4">
            <div className="card h-100" style={{ height: "500px" }}>
              <div style={{ height: "200px", overflow: "hidden" }}>
                <img
                  src={`http://localhost:8000/upload_images/${product.images[0]}`}
                  className="card-img-top"
                  alt={product.product_name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                />
              </div>
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{product.product_name}</h5>
                <p className="card-text flex-grow-1" style={{
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: "3",
                  WebkitBoxOrient: "vertical"
                }}>
                  {product.description}
                </p>
                <p className="card-text mb-2">
                  <strong>Stock:</strong> {product.stock || 0} units
                </p>
                <div className="mt-auto">
                  <p className="card-text mb-2">
                    <strong>Price:</strong> ${product.price.toFixed(2)}
                  </p>
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>
            {[...Array(totalPages)].map((_, index) => (
              <li
                key={index + 1}
                className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default HomeContent;
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const HomeContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

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
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const filteredProducts = allProducts.filter(product =>
      product.product_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setProducts(filteredProducts);
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

      // alert("Product added to cart successfully!");
      // navigate('/cart');
    } catch (error) {
      console.error("Error adding product to cart:", error);
      alert("Failed to add product to cart.");
    }
  };

  return (
    <div>
      <h2>Home Page</h2>

      <div className="d-flex justify-content-between align-items-center mt-3 mb-3">
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

        <div className="ms-3">
          <label htmlFor="filter" className="form-label me-2">Filter:</label>
          <select
            className="form-select"
            id="filter"
            value={filter}
            onChange={handleFilterChange}
          >
            <option value="">All</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Home">Home</option>
            <option value="Sports">Sports</option>
            <option value="Books">Books</option>
          </select>
        </div>

       

      <div className="row">
        {products.map((product) => (
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

                <button
                  className="btn btn-primary"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeContent;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  // Styles
  const carouselStyle = {
    height: '200px',
    overflow: 'hidden'
  };

  const imageStyle = {
    width: '100%',
    height: '200px',
    objectFit: 'contain',
    backgroundColor: '#f8f9fa'
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/products/approved');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleEditClick = (product) => {
    navigate(`/edit-product/${product._id}`);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Manage Products</h2>
      <div className="row">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className="col-md-4 mb-4">
              <div className="card h-100">
                {product.images && product.images.length > 0 ? (
                  <div id={`carousel-${product._id}`} className="carousel slide" data-bs-ride="carousel" style={carouselStyle}>
                    <div className="carousel-inner">
                      {product.images.map((image, index) => (
                        <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                          <img
                            src={`http://localhost:8000/upload_images/${image}`}
                            alt={`${product.product_name} ${index + 1}`}
                            style={imageStyle}
                          />
                        </div>
                      ))}
                    </div>
                    {product.images.length > 1 && (
                      <>
                        <button
                          className="carousel-control-prev"
                          type="button"
                          data-bs-target={`#carousel-${product._id}`}
                          data-bs-slide="prev"
                        >
                          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                          <span className="visually-hidden">Previous</span>
                        </button>
                        <button
                          className="carousel-control-next"
                          type="button"
                          data-bs-target={`#carousel-${product._id}`}
                          data-bs-slide="next"
                        >
                          <span className="carousel-control-next-icon" aria-hidden="true"></span>
                          <span className="visually-hidden">Next</span>
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-4 bg-light" style={{ height: "200px" }}>
                    No image available
                  </div>
                )}

                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{product.product_name}</h5>
                  <p className="card-text">
                    <strong>Category:</strong> {product.category || 'N/A'}
                  </p>
                  <p className="card-text flex-grow-1" style={{
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: "3",
                    WebkitBoxOrient: "vertical"
                  }}>
                    {product.description}
                  </p>
                  <p className="card-text">
                    <strong>Price:</strong> ${product.price ? product.price.toFixed(2) : 'N/A'}
                  </p>
                  <button
                    className="btn btn-primary mt-auto"
                    onClick={() => handleEditClick(product)}
                  >
                    Edit Product
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col">
            <p>No products found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProducts;
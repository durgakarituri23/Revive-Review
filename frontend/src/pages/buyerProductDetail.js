import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BuyerProductDetail = () => {
    const [product, setProduct] = useState(null);
    const { productId } = useParams();
    const navigate = useNavigate();

    const carouselStyle = {
        height: '400px',  // Increased height for detail view
        overflow: 'hidden'
    };

    const imageStyle = {
        width: '100%',
        height: '400px',  // Increased height for detail view
        objectFit: 'contain',
        backgroundColor: '#f8f9fa'
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/products/${productId}`);
                setProduct(response.data);
            } catch (error) {
                console.error("Error fetching product details:", error);
            }
        };

        fetchProduct();
    }, [productId]);

    const handleAddToCart = async () => {
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
            alert("Product added to cart successfully!");
        } catch (error) {
            console.error("Error adding product to cart:", error);
            alert("Failed to add product to cart.");
        }
    };

    if (!product) {
        return <div className="container mt-4">Loading...</div>;
    }

    return (
        <div className="container py-4">
            <button 
                className="btn btn-outline-primary mb-4"
                onClick={() => navigate(-1)}
            >
                <i className="bi bi-arrow-left"></i> Back to Products
            </button>

            <div className="row">
                <div className="col-md-6">
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
                        <div className="text-center p-4 bg-light" style={{ height: "400px" }}>
                            No image available
                        </div>
                    )}
                </div>
                <div className="col-md-6">
                    <h2>{product.product_name}</h2>
                    <p className="text-muted">Category: {product.category}</p>
                    <h3 className="mt-3">${product.price.toFixed(2)}</h3>
                    <div className="mt-4">
                        <h4>Description</h4>
                        <p>{product.description}</p>
                    </div>
                    <button
                        className="btn btn-primary btn-lg mt-4"
                        onClick={handleAddToCart}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BuyerProductDetail;
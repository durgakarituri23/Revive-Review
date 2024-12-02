import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const OrderDetails = () => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { orderId } = useParams();
    const navigate = useNavigate();

    const carouselStyle = {
        height: '300px',
        overflow: 'hidden',
        backgroundColor: '#f8f9fa'
    };

    const imageStyle = {
        width: '100%',
        height: '300px',
        objectFit: 'contain',
        backgroundColor: '#f8f9fa'
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    useEffect(() => {
        if (order) {
            initCarousels();
        }
    }, [order]);

    const initCarousels = () => {
        const carousels = document.querySelectorAll('.carousel');
        carousels.forEach(carousel => {
            if (!window.bootstrap.Carousel.getInstance(carousel)) {
                new window.bootstrap.Carousel(carousel, {
                    interval: false,
                    wrap: true
                });
            }
        });
    };

    const fetchOrderDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/orders/${orderId}`);
            console.log("Order data:", response.data);
            setOrder(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching order:', error);
            setError('Failed to fetch order details');
            setLoading(false);
        }
    };

    const renderProductImages = (item) => {
        // First try to get images array
        let imageArray = [];
        
        if (item.images && Array.isArray(item.images) && item.images.length > 0) {
            // If we have an images array, use it
            imageArray = item.images;
        } else if (item.image && typeof item.image === 'string') {
            // If we have a single image string, put it in an array
            imageArray = [item.image];
        } else {
            // No images available
            return (
                <div className="text-center p-4 bg-light" style={{ height: "300px" }}>
                    No images available
                </div>
            );
        }

        console.log("Processing images for item:", item.product_name, "Images:", imageArray);

        const carouselId = `carousel-${item.product_id}`;

        return (
            <div id={carouselId} className="carousel slide" data-bs-ride="false" style={carouselStyle}>
                <div className="carousel-inner">
                    {imageArray.map((image, idx) => (
                        <div key={idx} className={`carousel-item ${idx === 0 ? 'active' : ''}`}>
                            <img
                                src={`http://localhost:8000/upload_images/${image}`}
                                alt={`${item.product_name} ${idx + 1}`}
                                style={imageStyle}
                                onError={(e) => {
                                    console.error(`Error loading image: ${image}`);
                                    e.target.onerror = null;
                                    e.target.src = 'placeholder.jpg';
                                }}
                            />
                        </div>
                    ))}
                </div>

                {imageArray.length > 1 && (
                    <>
                        <button 
                            className="carousel-control-prev" 
                            type="button" 
                            data-bs-target={`#${carouselId}`} 
                            data-bs-slide="prev"
                        >
                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Previous</span>
                        </button>
                        <button 
                            className="carousel-control-next" 
                            type="button" 
                            data-bs-target={`#${carouselId}`} 
                            data-bs-slide="next"
                        >
                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Next</span>
                        </button>
                    </>
                )}
            </div>
        );
    };

    const handleBack = () => {
        navigate('/vieworders');
    };

    const handleTrackOrder = () => {
        alert('Tracking feature coming soon!');
    };

    const handleCancelOrder = async () => {
        try {
            await axios.put(`http://localhost:8000/orders/${orderId}/status`, {
                status: 'cancelled'
            });
            fetchOrderDetails();
            alert('Order cancelled successfully');
        } catch (error) {
            alert('Failed to cancel order');
        }
    };

    const handleReturnOrder = async () => {
        try {
            await axios.put(`http://localhost:8000/orders/${orderId}/status`, {
                status: 'return_requested'
            });
            fetchOrderDetails();
            alert('Return request submitted successfully');
        } catch (error) {
            alert('Failed to submit return request');
        }
    };

    if (loading) return <div className="container mt-5 text-center">Loading...</div>;
    if (error) return <div className="container mt-5 alert alert-danger">{error}</div>;
    if (!order) return <div className="container mt-5 text-center">Order not found</div>;

    return (
        <div className="container py-5">
            <div className="row">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="d-flex align-items-center gap-3">
                            <button
                                onClick={handleBack}
                                className="btn btn-outline-primary"
                            >
                                <i className="bi bi-arrow-left"></i> Back to Orders
                            </button>
                            <h2 className="mb-0">Order Details</h2>
                        </div>
                        <span className="badge bg-primary">Status: {order.status}</span>
                    </div>

                    <div className="card mb-4">
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <h5>Order Information</h5>
                                    <p><strong>Order ID:</strong> {order._id}</p>
                                    <p><strong>Order Date:</strong> {new Date(order.order_date).toLocaleString()}</p>
                                    <p><strong>Total Amount:</strong> ${order.total_amount.toFixed(2)}</p>
                                </div>
                                <div className="col-md-6">
                                    <h5>Shipping Information</h5>
                                    <p><strong>Name:</strong> {order.shipping_address.name}</p>
                                    <p><strong>Address:</strong> {order.shipping_address.address}</p>
                                    <p><strong>Postal Code:</strong> {order.shipping_address.postal_code}</p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <h5>Items</h5>
                                {order.items.map((item) => (
                                    <div key={item.product_id} className="card mb-3">
                                        <div className="row g-0">
                                            <div className="col-md-4">
                                                {renderProductImages(item)}
                                            </div>
                                            <div className="col-md-8">
                                                <div className="card-body">
                                                    <h5 className="card-title">{item.product_name}</h5>
                                                    <p className="card-text">Quantity: {item.quantity}</p>
                                                    <p className="card-text">Price per item: ${item.price.toFixed(2)}</p>
                                                    <p className="card-text">Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4">
                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleTrackOrder}
                                    >
                                        Track Order
                                    </button>
                                    {order.status === 'completed' && (
                                        <>
                                            <button
                                                className="btn btn-danger"
                                                onClick={handleCancelOrder}
                                            >
                                                Cancel Order
                                            </button>
                                            <button
                                                className="btn btn-warning"
                                                onClick={handleReturnOrder}
                                            >
                                                Return Order
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
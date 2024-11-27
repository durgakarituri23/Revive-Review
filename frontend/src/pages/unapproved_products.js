import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UnapprovedProductsPage = () => {
    const [products, setProducts] = useState([]);

    // Fetch unapproved products on component mount
    useEffect(() => {
        const fetchUnapprovedProducts = async () => {
            try {
                const response = await axios.get('http://localhost:8000/products/unapproved');
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching unapproved products:', error);
            }
        };
        fetchUnapprovedProducts();
    }, []);

    // Approve a product by updating isApproved field
    const handleApproval = async (productId) => {
        try {
            const updatedProduct = await axios.put(`http://localhost:8000/products/${productId}`, { isApproved: true });

            setProducts(products.map(product => 
                product.id === productId ? updatedProduct.data : product
            ));
        } catch (error) {
            console.error('Error updating product approval:', error);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Unapproved Products</h1>
            {products.length === 0 ? (
                <p>No unapproved products found.</p>
            ) : (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {products.map(product => (
                        <li key={product.id} style={{ margin: '20px 0', border: '1px solid #ddd', padding: '10px' }}>
                            <h2>{product.product_name}</h2>
                            <p>{product.description}</p>
                            <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
                            <div>
                                {product.images.map((image, index) => (
                                    <img key={index} src={`http://localhost:8000/upload_images/${image}`} alt={product.product_name} style={{ width: '100px', marginRight: '10px' }} />
                                ))}
                            </div>
                            
                            <button onClick={() => handleApproval(product._id)} style={{ marginTop: '10px' }}>
                                Approve
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default UnapprovedProductsPage;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [updatedProduct, setUpdatedProduct] = useState({
    product_name: '',
    description: '',
    price: ''
  });

  

 

  // Handle saving updated product details
  const handleSaveClick = async (productId) => {
    if (!updatedProduct.description && updatedProduct.price === '' && !updatedProduct.product_name) {
      console.log("No data to update");
      return;
    }

    try {
      // Send updated data to backend
      await axios.put(`http://localhost:8000/manage_products/${productId}`, {
        product_name: updatedProduct.product_name,
        description: updatedProduct.description,
        price: updatedProduct.price
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      // Exit edit mode
      setEditingProductId(null);
      console.log('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Manage Products</h2>
      <div className="row">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className="col-md-4 mb-4">
              <div className="card">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={`http://localhost:8000/upload_images/${product.images[0]}`}
                    className="card-img-top"
                    alt={product.product_name}
                  />
                ) : (
                  <p>No image available</p>
                )}
                <div className="card-body">
                  <h5 className="card-title">{product.product_name}</h5>
  
                  {editingProductId === product._id ? (
                    <>
                      {/* Editable Product Name Field */}
                      <input
                        type="text"
                        className="form-control mb-2"
                        value={updatedProduct.product_name}
                        onChange={(e) =>
                          setUpdatedProduct({ ...updatedProduct, product_name: e.target.value })
                        }
                      />
                      {/* Editable Description Field */}
                      <textarea
                        className="form-control mb-2"
                        value={updatedProduct.description}
                        onChange={(e) =>
                          setUpdatedProduct({ ...updatedProduct, description: e.target.value })
                        }
                      />
                      {/* Editable Price Field */}
                      <input
                        type="number"
                        className="form-control mb-2"
                        value={updatedProduct.price}
                        onChange={(e) =>
                          setUpdatedProduct({ ...updatedProduct, price: parseFloat(e.target.value) })
                        }
                      />
                      <button
                        className="btn btn-success me-2"
                        onClick={() => handleSaveClick(product._id)}
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                     
                      <button
                        className="btn btn-primary"
                        onClick={() => handleEditClick(product)}
                      >
                        Edit
                      </button>
                    </>
                  )}
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

export default ManageProducts;
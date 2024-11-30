import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [updatedProduct, setUpdatedProduct] = useState({
    product_name: '',
    description: '',
    price: '',
    category: '',
    images: []
  });
  const [newImages, setNewImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/products/approved');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8000/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleEditClick = (product) => {
    setEditingProductId(product._id);
    setUpdatedProduct({
      product_name: product.product_name,
      description: product.description,
      price: product.price,
      category: product.category || '',
      images: product.images || []
    });
    setPreviewImages(product.images.map(img =>
      `http://localhost:8000/upload_images/${img}`
    ));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNewImages([file]);
    const preview = URL.createObjectURL(file);
    setPreviewImages([preview]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === 'price') {
      processedValue = parseFloat(value) || 0;
    }

    setUpdatedProduct(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSaveClick = async (productId) => {
    try {
      const formData = new FormData();

      formData.append('product_name', updatedProduct.product_name);
      formData.append('description', updatedProduct.description);
      formData.append('price', updatedProduct.price);
      formData.append('category', updatedProduct.category);

      if (updatedProduct.images.length > 0) {
        formData.append('existing_images', updatedProduct.images[0]);
      }

      if (newImages.length > 0) {
        formData.append('new_images', newImages[0]);
      }

      await axios.put(
        `http://localhost:8000/manage_products/${productId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      await fetchProducts();
      handleCancelEdit();
      alert('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    }
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setNewImages([]);
    setPreviewImages([]);
    setUpdatedProduct({
      product_name: '',
      description: '',
      price: '',
      category: '',
      images: []
    });
  };

  const handleDeleteImage = (index) => {
    setPreviewImages([]);
    setNewImages([]);
    setUpdatedProduct(prev => ({
      ...prev,
      images: []
    }));
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Manage Products</h2>
      <div className="row">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className="col-md-4 mb-4">
              <div className="card h-100">
                <div style={{ height: "200px", overflow: "hidden" }}>
                  {product.images && product.images.length > 0 ? (
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
                  ) : (
                    <div className="text-center p-4 bg-light">No image available</div>
                  )}
                </div>
                <div className="card-body">
                  {editingProductId === product._id ? (
                    <div className="edit-form">
                      <div className="mb-3">
                        <label className="form-label">Product Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="product_name"
                          value={updatedProduct.product_name}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Category</label>
                        <select
                          className="form-select"
                          name="category"
                          value={updatedProduct.category}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Category</option>
                          {categories.map(category => (
                            <option key={category._id} value={category.name}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          name="description"
                          value={updatedProduct.description}
                          onChange={handleInputChange}
                          rows="3"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Price</label>
                        <input
                          type="number"
                          className="form-control"
                          name="price"
                          value={updatedProduct.price}
                          onChange={handleInputChange}
                          step="0.01"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Product Images</label>
                        <input
                          type="file"
                          className="form-control"
                          onChange={handleImageChange}
                          accept="image/*"
                        />
                      </div>

                      {previewImages.length > 0 && (
                        <div className="mb-3">
                          <label className="form-label">Current Images</label>
                          <div className="d-flex flex-wrap gap-2">
                            {previewImages.map((img, index) => (
                              <div key={index} className="position-relative">
                                <img
                                  src={img}
                                  alt={`Preview ${index}`}
                                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                  className="rounded"
                                />
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm position-absolute top-0 end-0"
                                  onClick={() => handleDeleteImage(index)}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-3">
                        <button
                          className="btn btn-success me-2"
                          onClick={() => handleSaveClick(product._id)}
                        >
                          Save Changes
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h5 className="card-title">{product.product_name}</h5>
                      <p className="card-text">
                        <strong>Category:</strong> {product.category || 'N/A'}
                      </p>
                      <p className="card-text">{product.description}</p>
                      <p className="card-text">
                        <strong>Price:</strong> ${product.price ? product.price.toFixed(2) : 'N/A'}
                      </p>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleEditClick(product)}
                      >
                        Edit Product
                      </button>
                    </>
                  )}
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
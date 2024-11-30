import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const UploadProducts = () => {
  // Get logged-in seller's ID from your auth context/state
  const { user } = useAuth();
  const sellerId = user?.business_name;
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([
    { productName: '', description: '', price: '', category: '', stock: '', imageFiles: [] }
  ]);


  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8000/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Handle changes in product fields
  const handleProductChange = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  // Handle image selection
  const handleImageChange = (e, productIndex) => {
    const newProducts = [...products];
    const files = Array.from(e.target.files);
    newProducts[productIndex].imageFiles = files;
    setProducts(newProducts);
  };

  // Add a new product block
  const handleAddProduct = () => {
    setProducts([
      ...products,
      { productName: '', description: '', price: '', category: '', stock: '', imageFiles: [] }
    ]);
  };

  // Remove a product block
  const handleRemoveProduct = (index) => {
    const newProducts = [...products];
    newProducts.splice(index, 1);
    setProducts(newProducts);
  };

  // Reset file input
  const resetFileInput = (index) => {
    const fileInput = document.querySelector(`#file-input-${index}`);
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All entered data will be lost.')) {
      window.location.reload();
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    // Append product details to formData
    products.forEach((product, productIndex) => {
      formData.append('product_names', product.productName);
      formData.append('descriptions', product.description);
      formData.append('prices', product.price);
      formData.append('categories', product.category);
      formData.append('seller_ids', sellerId); // Adding seller ID for each product
      formData.append('stocks', product.stock);

      // Append images for each product
      product.imageFiles.forEach((file) => {
        formData.append('images', file);
      });
    });

    try {
      const response = await fetch('http://localhost:8000/upload-products', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Reset form and file inputs
        products.forEach((_, index) => resetFileInput(index));
        setProducts([{ productName: '', description: '', price: '', category: '', stock: '', imageFiles: [] }]);
        alert('Products uploaded successfully!');
      } else {
        const result = await response.json();
        console.error('Upload failed:', result);
        alert('Failed to upload products. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading products:', error);
      alert('Error uploading products. Please check your connection and try again.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Upload Products</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {products.map((product, productIndex) => (
          <div key={productIndex} className="mb-5">
            <h4>Product {productIndex + 1}</h4>
            <div className="mb-3">
              <label>Product Name</label>
              <input
                type="text"
                className="form-control"
                value={product.productName}
                onChange={(e) => handleProductChange(productIndex, 'productName', e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label>Description</label>
              <textarea
                className="form-control"
                value={product.description}
                onChange={(e) => handleProductChange(productIndex, 'description', e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label>Price</label>
              <input
                type="number"
                className="form-control"
                value={product.price}
                onChange={(e) => handleProductChange(productIndex, 'price', e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label>Category</label>
              <select
                className="form-control"
                value={product.category}
                onChange={(e) => handleProductChange(productIndex, 'category', e.target.value)}
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label>Stock</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={product.stock}
                onChange={(e) => handleProductChange(productIndex, 'stock', e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label>Images</label>
              <input
                id={`file-input-${productIndex}`}
                type="file"
                accept="image/*"
                multiple
                className="form-control"
                onChange={(e) => handleImageChange(e, productIndex)}
              />
              {product.imageFiles.length > 0 && (
                <small className="text-muted">
                  {product.imageFiles.length} file(s) selected
                </small>
              )}
            </div>
            {products.length > 1 && (
              <div className="mb-3">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleRemoveProduct(productIndex)}
                >
                  Remove Product
                </button>
              </div>
            )}
            <hr />
          </div>
        ))}
        <div className="d-flex justify-content-between align-items-center">
          <button
            type="button"
            className="btn btn-primary mb-3"
            onClick={handleAddProduct}
          >
            Add Another Product
          </button>
          <div className="mb-3">
            <button
              type="button"
              className="btn btn-danger me-2"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success"
            >
              {products.length > 1 ? 'Upload All Products' : 'Upload Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UploadProducts;
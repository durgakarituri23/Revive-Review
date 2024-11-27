import React, { useState } from 'react';

const UploadProducts = () => {
  const [products, setProducts] = useState([
    { productName: '', description: '', price: '', imageFiles: [] }
  ]);

  // Handle changes in product name, description, and price
  const handleProductChange = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  // Handle image selection for each product
  const handleImageChange = (e, productIndex) => {
    const newProducts = [...products];
    const files = Array.from(e.target.files);
    newProducts[productIndex].imageFiles = files;  // Store the files
    setProducts(newProducts);
  };

  // Add a new product block
  const handleAddProduct = () => {
    setProducts([
      ...products,
      { productName: '', description: '', price: '', imageFiles: [] }
    ]);
  };

  // Remove a product block
  const handleRemoveProduct = (index) => {
    const newProducts = [...products];
    newProducts.splice(index, 1);
    setProducts(newProducts);
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

      // Append images for each product
      product.imageFiles.forEach((file) => {
        formData.append('images', file);
      });
    });

    // Send the formData to the backend
    try {

      const response = await fetch('http://localhost:8000/upload-products', {
        method: 'POST',
        body: formData,

      });

      if (response.ok) {
        // alert('Products uploaded successfully!');
        setProducts([{ productName: '', description: '', price: '', imageFiles: [] }]);

      } else {
        const result = await response.json();
        // alert(`Error: ${result.detail}`);
      }
    } catch (error) {
      console.error('Error uploading products:', error);
      // alert('An error occurred while uploading the products');
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
              <label>Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                className="form-control"
                onChange={(e) => handleImageChange(e, productIndex)}
              />
            </div>
            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleRemoveProduct(productIndex)}
              >
                Remove Product
              </button>
            </div>
            <hr />
          </div>
        ))}
        <div className="d-flex justify-content-between">
          <button type="button" className="btn btn-primary mb-3" onClick={handleAddProduct}>
            Add Another Product
          </button>
          <button type="submit" className="btn btn-success mb-3">Upload All Products</button>
        </div>
      </form>
    </div>
  );
};

export default UploadProducts;
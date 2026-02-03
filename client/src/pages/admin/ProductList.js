import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Admin.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchProducts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await axios.get(`/api/products/admin${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(products.filter(product => product._id !== id));
        toast.success('Product deleted successfully');
      } catch (err) {
        toast.error('Error deleting product');
      }
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/products/${id}`, 
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchProducts();
      toast.success(currentStatus ? 'Product hidden' : 'Product shown');
    } catch (err) {
      toast.error('Error updating product');
    }
  };

  if (loading) {
    return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <h1>Products</h1>
          <Link to="/admin/products/new" className="btn btn-primary">
            <FaPlus /> Add New Product
          </Link>
        </header>

        <div className="filter-tabs">
          <button
            className={`tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({products.length})
          </button>
          <button
            className={`tab ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button
            className={`tab ${filter === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilter('inactive')}
          >
            Inactive
          </button>
        </div>

        {products.length > 0 ? (
          <div className="products-grid">
            {products.map(product => (
              <div key={product._id} className="product-card card">
                <div className="product-image">
                  {product.thumbnailImage ? (
                    <img src={product.thumbnailImage} alt={product.name} />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-price">${product.price}</p>
                  <p className="product-category">{product.category}</p>
                  <div className="product-actions">
                    <button
                      onClick={() => handleToggleActive(product._id, product.isActive)}
                      className={`btn btn-sm ${product.isActive ? 'btn-warning' : 'btn-success'}`}
                    >
                      {product.isActive ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <Link to={`/admin/products/edit/${product._id}`} className="btn btn-sm btn-secondary">
                      <FaEdit />
                    </Link>
                    <button onClick={() => handleDelete(product._id)} className="btn btn-sm btn-danger">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state card">
            <p>No products yet. Add your first product.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProductList;

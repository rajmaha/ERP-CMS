import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { FaEdit, FaTrash, FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Admin.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(products.filter(p => p._id !== id));
        toast.success('Product deleted successfully');
      } catch (err) {
        toast.error('Error deleting product');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <h1>Manage Products</h1>
          <Link to="/admin/products/new" className="btn btn-primary">
            <FaPlus /> New Product
          </Link>
        </header>

        {loading ? (
          <div className="loading">Loading products...</div>
        ) : products.length > 0 ? (
          <div className="admin-table-wrapper card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id}>
                    <td className="title-cell">{product.name}</td>
                    <td>{product.category}</td>
                    <td>${product.price || '0'}</td>
                    <td>
                      {product.isActive ? (
                        <span className="badge badge-success"><FaCheck /> Active</span>
                      ) : (
                        <span className="badge badge-warning"><FaTimes /> Inactive</span>
                      )}
                    </td>
                    <td>
                      {product.isFeatured ? (
                        <FaCheck className="text-success" />
                      ) : (
                        <FaTimes className="text-muted" />
                      )}
                    </td>
                    <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <Link to={`/admin/products/${product._id}`} className="btn btn-sm btn-secondary">
                        <FaEdit />
                      </Link>
                      <button onClick={() => handleDelete(product._id)} className="btn btn-sm btn-danger">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state card">
            <p>No products yet. Create your first product to get started.</p>
            <Link to="/admin/products/new" className="btn btn-primary">
              Create Product
            </Link>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;

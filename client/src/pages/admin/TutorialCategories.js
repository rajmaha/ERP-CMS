import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import './Admin.css';

const ICON_OPTIONS = [
  '📚', '📖', '📝', '✏️', '🎓', '🧠', '💡', '⚙️', 
  '🔧', '🔨', '💻', '📱', '🌐', '🚀', '⭐', '🎯',
  '📊', '📈', '📉', '💰', '📣', '🎨', '🎬', '🎵',
  '🎮', '🏆', '🎁', '🔐', '🔑', '⚡', '🌟', '✨'
];

const TutorialCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📚',
    color: '#3498db',
    order: 0
  });

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/tutorials/categories/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      if (editingId) {
        await axios.put(`/api/tutorials/categories/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Category updated successfully');
      } else {
        await axios.post('/api/tutorials/categories', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Category created successfully');
      }

      fetchCategories();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        icon: '📚',
        color: '#3498db',
        order: 0
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving category');
    }
  };

  const handleEdit = (category) => {
    setFormData(category);
    setEditingId(category._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/tutorials/categories/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error deleting category');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setShowIconPicker(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      icon: '📚',
      color: '#3498db',
      order: 0
    });
  };

  if (loading) {
    return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <h1>Tutorial Categories</h1>
          <button onClick={() => { setShowForm(true); setEditingId(null); }} className="btn btn-primary">
            <FaPlus /> Add Category
          </button>
        </header>

        {showForm && (
          <div className="form-container card">
            <h2>{editingId ? 'Edit Category' : 'Add New Category'}</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Icon (Emoji)</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{
                        width: '50px',
                        height: '40px',
                        fontSize: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #ecf0f1',
                        borderRadius: '6px'
                      }}>
                        {formData.icon}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowIconPicker(!showIconPicker)}
                        className="btn btn-secondary"
                        style={{ flex: 1 }}
                      >
                        {showIconPicker ? 'Close Picker' : 'Choose Icon'}
                      </button>
                    </div>

                    {showIconPicker && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '10px',
                        backgroundColor: 'white',
                        border: '2px solid #ecf0f1',
                        borderRadius: '8px',
                        padding: '15px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(8, 1fr)',
                        gap: '10px',
                        zIndex: 1000,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}>
                        {ICON_OPTIONS.map(icon => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, icon });
                              setShowIconPicker(false);
                            }}
                            style={{
                              fontSize: '24px',
                              padding: '10px',
                              border: formData.icon === icon ? '3px solid #3498db' : '1px solid #ecf0f1',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              backgroundColor: formData.icon === icon ? '#ecf0f1' : 'white',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                            onMouseOut={(e) => e.target.style.backgroundColor = formData.icon === icon ? '#ecf0f1' : 'white'}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Color</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="color"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      style={{ width: '60px', height: '40px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={handleChange}
                      className="form-control"
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Order</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="form-control"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Category' : 'Create Category'}
                </button>
                <button type="button" onClick={handleCancel} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {categories.length > 0 ? (
          <div className="categories-table">
            <table>
              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Color</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(category => (
                  <tr key={category._id}>
                    <td>{category.icon}</td>
                    <td><strong>{category.name}</strong></td>
                    <td>{category.description}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: category.color,
                            borderRadius: '3px'
                          }}
                        ></div>
                        {category.color}
                      </div>
                    </td>
                    <td>{category.order}</td>
                    <td>
                      <button
                        onClick={() => handleEdit(category)}
                        className="btn btn-sm btn-secondary"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="btn btn-sm btn-danger"
                        title="Delete"
                      >
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
            <p>No categories yet. Create your first category.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TutorialCategories;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { FaEdit, FaTrash, FaPlus, FaCheck, FaTimes, FaEye, FaEyeSlash, FaArrowUp, FaArrowDown, FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Admin.css';

const AdminMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    isExternal: false,
    openInNewTab: false,
    isActive: true,
    order: 0
  });
  const [showForm, setShowForm] = useState(false);
  const [defaultPages] = useState([
    { id: 'home', title: 'Home', url: '/', isDefault: true },
    { id: 'about', title: 'About', url: '/about', isDefault: true },
    { id: 'products', title: 'Products', url: '/products', isDefault: true },
    { id: 'portfolio', title: 'Portfolio', url: '/portfolio', isDefault: true },
    { id: 'contact', title: 'Contact', url: '/contact', isDefault: true }
  ]);
  const [defaultPageVisibility, setDefaultPageVisibility] = useState({
    home: true,
    about: true,
    products: true,
    portfolio: true,
    contact: true
  });

  useEffect(() => {
    fetchMenuItems();
    loadDefaultPageVisibility();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/menu/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sorted = res.data.data.sort((a, b) => (a.order || 0) - (b.order || 0));
      setMenuItems(sorted);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching menu:', err);
      setLoading(false);
    }
  };

  const loadDefaultPageVisibility = () => {
    const saved = localStorage.getItem('defaultPageVisibility');
    if (saved) {
      setDefaultPageVisibility(JSON.parse(saved));
    }
  };

  const saveDefaultPageVisibility = (updated) => {
    setDefaultPageVisibility(updated);
    localStorage.setItem('defaultPageVisibility', JSON.stringify(updated));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        await axios.put(`/api/menu/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Menu item updated successfully');
      } else {
        await axios.post('/api/menu', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Menu item created successfully');
      }
      fetchMenuItems();
      resetForm();
    } catch (err) {
      toast.error('Error saving menu item');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/menu/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMenuItems(menuItems.filter(m => m._id !== id));
        toast.success('Menu item deleted successfully');
      } catch (err) {
        toast.error('Error deleting menu item');
      }
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const item = menuItems.find(m => m._id === id);
      await axios.put(`/api/menu/${id}`, { ...item, isActive: !currentStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMenuItems();
      toast.success(currentStatus ? 'Menu item hidden' : 'Menu item shown');
    } catch (err) {
      toast.error('Error updating menu item');
    }
  };

  const handleToggleDefaultPage = (pageId) => {
    const updated = {
      ...defaultPageVisibility,
      [pageId]: !defaultPageVisibility[pageId]
    };
    saveDefaultPageVisibility(updated);
    toast.success(updated[pageId] ? 'Page shown in menu' : 'Page hidden from menu');
  };

  const handleReorder = async (id, newOrder) => {
    try {
      const token = localStorage.getItem('token');
      const item = menuItems.find(m => m._id === id);
      await axios.put(`/api/menu/${id}`, { ...item, order: newOrder }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMenuItems();
      toast.success('Menu order updated');
    } catch (err) {
      toast.error('Error updating menu order');
    }
  };

  const moveUp = (index) => {
    if (index > 0) {
      const currentOrder = menuItems[index].order || 0;
      const prevOrder = menuItems[index - 1].order || 0;
      handleReorder(menuItems[index]._id, prevOrder - 1);
    }
  };

  const moveDown = (index) => {
    if (index < menuItems.length - 1) {
      const currentOrder = menuItems[index].order || 0;
      const nextOrder = menuItems[index + 1].order || 0;
      handleReorder(menuItems[index]._id, nextOrder + 1);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      isExternal: false,
      openInNewTab: false,
      isActive: true,
      order: 0
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingId(item._id);
    setShowForm(true);
  };

  if (loading) {
    return <AdminLayout><div className="loading">Loading menu...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <h1>Manage Menu</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            <FaPlus /> New Menu Item
          </button>
        </header>

        {showForm && (
          <div className="form-container card">
            <h2>{editingId ? 'Edit' : 'Create'} Menu Item</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>URL *</label>
                <input
                  type="text"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Display Order</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  className="form-control"
                />
                <small>Lower numbers appear first (0, 1, 2, etc.)</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isExternal"
                      checked={formData.isExternal}
                      onChange={handleChange}
                    />
                    External Link
                  </label>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="openInNewTab"
                      checked={formData.openInNewTab}
                      onChange={handleChange}
                    />
                    Open in New Tab
                  </label>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    Visible
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Save Menu Item</button>
                <button type="button" onClick={resetForm} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Default Pages Section */}
        <section className="menu-section card">
          <h2>Default Pages</h2>
          <p className="section-description">Show or hide default pages in the main navigation menu</p>
          
          <div className="default-pages-grid">
            {defaultPages.map(page => (
              <div key={page.id} className="default-page-item card">
                <div className="page-info">
                  <h3>{page.title}</h3>
                  <p className="page-url">{page.url}</p>
                </div>
                
                <button
                  onClick={() => handleToggleDefaultPage(page.id)}
                  className={`status-btn ${defaultPageVisibility[page.id] ? 'visible' : 'hidden'}`}
                  title={defaultPageVisibility[page.id] ? 'Click to hide' : 'Click to show'}
                >
                  {defaultPageVisibility[page.id] ? (
                    <><FaEye /> Visible</>
                  ) : (
                    <><FaEyeSlash /> Hidden</>
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Custom Menu Items Section */}
        <section className="menu-section">
          <h2>Custom Menu Items</h2>
          
          {menuItems.length > 0 ? (
            <div className="admin-table-wrapper card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{width: '8%'}}>Order</th>
                    <th style={{width: '22%'}}>Title</th>
                    <th style={{width: '25%'}}>URL</th>
                    <th style={{width: '10%'}}>Type</th>
                    <th style={{width: '10%'}}>Target</th>
                    <th style={{width: '10%'}}>Status</th>
                    <th style={{width: '15%'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((item, index) => (
                    <tr key={item._id}>
                      <td className="order-cell">
                        <div className="order-controls">
                          <button
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            className="btn btn-sm"
                            title="Move up"
                          >
                            <FaArrowUp />
                          </button>
                          <span className="order-number">{item.order || 0}</span>
                          <button
                            onClick={() => moveDown(index)}
                            disabled={index === menuItems.length - 1}
                            className="btn btn-sm"
                            title="Move down"
                          >
                            <FaArrowDown />
                          </button>
                        </div>
                      </td>
                      <td className="title-cell">{item.title}</td>
                      <td>{item.url}</td>
                      <td>{item.isExternal ? 'External' : 'Internal'}</td>
                      <td>{item.openInNewTab ? 'New Tab' : 'Same Tab'}</td>
                      <td>
                        <button
                          onClick={() => handleToggleActive(item._id, item.isActive)}
                          className={`status-btn ${item.isActive ? 'visible' : 'hidden'}`}
                          title={item.isActive ? 'Click to hide' : 'Click to show'}
                        >
                          {item.isActive ? (
                            <><FaEye /> Visible</>
                          ) : (
                            <><FaEyeSlash /> Hidden</>
                          )}
                        </button>
                      </td>
                      <td className="actions-cell">
                        <button onClick={() => handleEdit(item)} className="btn btn-sm btn-secondary">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="btn btn-sm btn-danger">
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
              <p>No custom menu items yet. Create your first menu item to get started.</p>
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminMenu;

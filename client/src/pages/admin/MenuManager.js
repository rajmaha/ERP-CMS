import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import IconPicker from '../../components/IconPicker';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaArrowUp, FaArrowDown, FaEye, FaEyeSlash, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import './MenuManager.css';

const MenuManager = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  const [formData, setFormData] = useState({
    label: '',
    url: '',
    urlType: 'internal', // 'internal' or 'external'
    selectedPage: '',
    parentId: null,
    level: 0,
    order: 0,
    icon: '',
    description: '',
    isExternal: false,
    openInNewTab: false,
    isActive: true,
    isMegaMenu: false,
    megaMenuColumns: 3
  });

  useEffect(() => {
    fetchMenuItems();
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/pages/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPages(res.data.data);
    } catch (err) {
      console.error('Error fetching pages:', err);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/menu/flat', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMenuItems(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'urlType') {
      setFormData({ 
        ...formData, 
        urlType: value,
        url: value === 'internal' ? '' : formData.url,
        selectedPage: '',
        isExternal: value === 'external'
      });
    } else if (name === 'selectedPage') {
      // Handle selection from dropdown
      if (value.startsWith('/')) {
        // It's a predefined internal link
        const selectedLink = internalLinks.find(link => link.value === value);
        setFormData({ 
          ...formData, 
          selectedPage: value,
          url: value,
          label: formData.label || (selectedLink ? selectedLink.label : '')
        });
      } else {
        // It's a custom page ID
        const selectedPageObj = pages.find(p => p._id === value);
        if (selectedPageObj) {
          setFormData({ 
            ...formData, 
            selectedPage: value,
            url: `/page/${selectedPageObj.slug}`,
            label: formData.label || selectedPageObj.title
          });
        }
      }
    } else {
      setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      let level = 0;
      if (formData.parentId) {
        const parent = menuItems.find(item => item._id === formData.parentId);
        level = parent ? parent.level + 1 : 0;
      }
      
      const submitData = { 
        ...formData, 
        level,
        isExternal: formData.urlType === 'external'
      };
      
      if (editingId) {
        await axios.put(`/api/menu/${editingId}`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Menu item updated successfully');
      } else {
        await axios.post('/api/menu', submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Menu item created successfully');
      }
      
      resetForm();
      fetchMenuItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving menu item');
    }
  };

  const resetForm = () => {
    setFormData({
      label: '',
      url: '',
      urlType: 'internal',
      selectedPage: '',
      parentId: null,
      level: 0,
      order: 0,
      icon: '',
      description: '',
      isExternal: false,
      openInNewTab: false,
      isActive: true,
      isMegaMenu: false,
      megaMenuColumns: 3
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    // Determine URL type based on the URL
    const isExternal = item.isExternal || item.url.startsWith('http');
    const urlType = isExternal ? 'external' : 'internal';
    
    // Try to find matching page
    let selectedPage = '';
    if (!isExternal) {
      const matchingPage = pages.find(p => `/page/${p.slug}` === item.url);
      selectedPage = matchingPage?._id || '';
    }
    
    setFormData({
      label: item.label,
      url: item.url,
      urlType: urlType,
      selectedPage: selectedPage,
      parentId: item.parentId,
      level: item.level,
      order: item.order,
      icon: item.icon || '',
      description: item.description || '',
      isExternal: item.isExternal,
      openInNewTab: item.openInNewTab,
      isActive: item.isActive,
      isMegaMenu: item.isMegaMenu || false,
      megaMenuColumns: item.megaMenuColumns || 3
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/menu/${id}`, 
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchMenuItems();
      toast.success(currentStatus ? 'Menu item hidden' : 'Menu item shown');
    } catch (err) {
      toast.error('Error updating menu item');
    }
  };

  const handleDelete = async (id, isDefault) => {
    if (isDefault) {
      toast.error('Cannot delete default menu items. You can only disable them.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this menu item and all its children?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/menu/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchMenuItems();
        toast.success('Menu item deleted successfully');
      } catch (err) {
        toast.error('Error deleting menu item');
      }
    }
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getChildren = (parentId) => {
    return menuItems.filter(item => String(item.parentId) === String(parentId));
  };

  const moveItem = async (item, direction) => {
    try {
      const token = localStorage.getItem('token');
      const siblings = menuItems.filter(i => String(i.parentId) === String(item.parentId));
      const currentIndex = siblings.findIndex(i => i._id === item._id);
      
      if (direction === 'up' && currentIndex === 0) return;
      if (direction === 'down' && currentIndex === siblings.length - 1) return;
      
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const targetItem = siblings[targetIndex];
      
      // Swap orders
      await axios.put(`/api/menu/${item._id}`, 
        { order: targetItem.order },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      await axios.put(`/api/menu/${targetItem._id}`, 
        { order: item.order },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      fetchMenuItems();
      toast.success('Menu order updated');
    } catch (err) {
      toast.error('Error updating order');
    }
  };

  const renderMenuItem = (item, level = 0) => {
    const children = getChildren(item._id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedItems[item._id];
    const siblings = menuItems.filter(i => String(i.parentId) === String(item.parentId));
    const siblingIndex = siblings.findIndex(i => i._id === item._id);
    const isFirst = siblingIndex === 0;
    const isLast = siblingIndex === siblings.length - 1;

    return (
      <React.Fragment key={item._id}>
        <tr className={`menu-row level-${level}`}>
          <td style={{ paddingLeft: `${level * 2}rem` }}>
            {hasChildren && (
              <button 
                onClick={() => toggleExpand(item._id)} 
                className="expand-btn"
              >
                {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
              </button>
            )}
            {item.icon && (
              <span className="menu-icon">
                {/^[\p{Emoji}]+$/u.test(item.icon) ? item.icon : <i className={`fas fa-${item.icon}`}></i>}
              </span>
            )}
            <strong>{item.label}</strong>
            {item.isDefault && <span className="badge-default">Default</span>}
            {item.isMegaMenu && <span className="badge-mega">Mega Menu</span>}
          </td>
          <td>{item.url}</td>
          <td>
            <span className="order-badge">Order: {item.order}</span>
          </td>
          <td>Level {item.level}</td>
          <td><span className={`status-badge ${item.isActive ? 'active' : 'inactive'}`}>{item.isActive ? 'Active' : 'Inactive'}</span></td>
          <td>
            <div className="action-buttons">
              <button 
                onClick={() => moveItem(item, 'up')} 
                disabled={isFirst}
                className="btn btn-sm btn-secondary" 
                title="Move Up"
              >
                <FaArrowUp />
              </button>
              <button 
                onClick={() => moveItem(item, 'down')} 
                disabled={isLast}
                className="btn btn-sm btn-secondary" 
                title="Move Down"
              >
                <FaArrowDown />
              </button>
              <button onClick={() => handleToggleActive(item._id, item.isActive)} className={`btn btn-sm ${item.isActive ? 'btn-warning' : 'btn-success'}`} title={item.isActive ? 'Hide' : 'Show'}>
                {item.isActive ? <FaEyeSlash /> : <FaEye />}
              </button>
              <button onClick={() => handleEdit(item)} className="btn btn-sm btn-secondary"><FaEdit /></button>
              <button onClick={() => handleDelete(item._id, item.isDefault)} className="btn btn-sm btn-danger"><FaTrash /></button>
            </div>
          </td>
        </tr>
        {hasChildren && isExpanded && children.map(child => renderMenuItem(child, level + 1))}
      </React.Fragment>
    );
  };

  const topLevelItems = menuItems.filter(item => !item.parentId);

  if (loading) {
    return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
  }

  // Predefined internal links
  const internalLinks = [
    { label: 'Home', value: '/' },
    { label: 'About', value: '/about' },
    { label: 'Products', value: '/products' },
    { label: 'Portfolio', value: '/portfolio' },
    { label: 'Testimonials', value: '/testimonials' },
    { label: 'Clients', value: '/clients' },
    { label: 'Gallery', value: '/gallery' },
    { label: 'Careers', value: '/careers' },
    { label: 'Contact', value: '/contact' }
  ];

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <h1>Multi-Level Menu Manager</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            <FaPlus /> Add Menu Item
          </button>
        </header>

        {showForm && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2>{editingId ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Label *</label>
                  <input type="text" name="label" value={formData.label} onChange={handleChange} required className="form-control" />
                </div>
                <div className="form-group">
                  <label>Display Order</label>
                  <input type="number" name="order" value={formData.order} onChange={handleChange} className="form-control" min="0" />
                </div>
              </div>

              <div className="form-group">
                <label>URL Type *</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="urlType"
                      value="internal"
                      checked={formData.urlType === 'internal'}
                      onChange={handleChange}
                    />
                    Internal Link
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="urlType"
                      value="external"
                      checked={formData.urlType === 'external'}
                      onChange={handleChange}
                    />
                    External Link
                  </label>
                </div>
              </div>

              {formData.urlType === 'internal' ? (
                <>
                  <div className="form-group">
                    <label>Select Page or Link *</label>
                    <select 
                      name="selectedPage" 
                      value={formData.selectedPage} 
                      onChange={handleChange} 
                      className="form-control"
                      required
                    >
                      <option value="">-- Select a page or link --</option>
                      <optgroup label="Default Pages">
                        {internalLinks.map((link, index) => (
                          <option key={`default-${index}`} value={link.value}>
                            {link.label} ({link.value})
                          </option>
                        ))}
                      </optgroup>
                      {pages && pages.length > 0 && (
                        <optgroup label="Custom Pages">
                          {pages.filter(p => p.status === 'published').map(page => (
                            <option key={page._id} value={page._id}>
                              {page.title} (/page/{page.slug})
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                  {formData.url && (
                    <div className="form-group">
                      <label>Preview URL</label>
                      <input 
                        type="text" 
                        value={formData.url} 
                        readOnly 
                        className="form-control" 
                        style={{ background: '#f5f5f5' }} 
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="form-group">
                  <label>External URL *</label>
                  <input 
                    type="url" 
                    name="url" 
                    value={formData.url} 
                    onChange={handleChange} 
                    required 
                    className="form-control" 
                    placeholder="https://example.com" 
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Parent Menu</label>
                  <select name="parentId" value={formData.parentId || ''} onChange={handleChange} className="form-control">
                    <option value="">-- Top Level --</option>
                    {menuItems.filter(item => item.level < 2).map(item => (
                      <option key={item._id} value={item._id}>
                        {'—'.repeat(item.level)} {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Icon</label>
                  <IconPicker value={formData.icon} onChange={(icon) => setFormData({ ...formData, icon })} label="" />
                </div>
              </div>

              <div className="form-group">
                <label>Description (for mega menus)</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="form-control" placeholder="Brief description..."></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input type="checkbox" name="openInNewTab" checked={formData.openInNewTab} onChange={handleChange} />
                    Open in New Tab
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input type="checkbox" name="isMegaMenu" checked={formData.isMegaMenu} onChange={handleChange} />
                    Enable Mega Menu
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
                    Active
                  </label>
                </div>
              </div>

              {formData.isMegaMenu && (
                <div className="form-group">
                  <label>Mega Menu Columns</label>
                  <select name="megaMenuColumns" value={formData.megaMenuColumns} onChange={handleChange} className="form-control">
                    <option value="2">2 Columns</option>
                    <option value="3">3 Columns</option>
                    <option value="4">4 Columns</option>
                  </select>
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn btn-primary"><FaSave /> {editingId ? 'Update' : 'Create'}</button>
                <button type="button" onClick={resetForm} className="btn btn-secondary"><FaTimes /> Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <h2>Menu Structure</h2>
          <div className="admin-table-wrapper">
            <table className="admin-table menu-table">
              <thead>
                <tr>
                  <th style={{width: '25%'}}>Label</th>
                  <th style={{width: '25%'}}>URL</th>
                  <th style={{width: '10%'}}>Order</th>
                  <th style={{width: '10%'}}>Level</th>
                  <th style={{width: '10%'}}>Status</th>
                  <th style={{width: '20%'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {topLevelItems.length > 0 ? (
                  topLevelItems.map(item => renderMenuItem(item))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                      No menu items yet. Add your first menu item above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MenuManager;

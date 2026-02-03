import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaChevronDown, FaChevronRight, FaFolderOpen, FaArrowUp, FaArrowDown, FaGripVertical } from 'react-icons/fa';
import './Admin.css';

const ICON_OPTIONS = [
  '📚', '📖', '📝', '✏️', '🎓', '🧠', '💡', '⚙️', 
  '🔧', '🔨', '💻', '📱', '🌐', '🚀', '⭐', '🎯',
  '📊', '📈', '📉', '💰', '📣', '🎨', '🎬', '🎵',
  '🎮', '🏆', '🎁', '🔐', '🔑', '⚡', '🌟', '✨'
];

const TutorialCategoryTree = () => {
  const [categoryTree, setCategoryTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    parent: '',
    description: '',
    icon: '📚',
    color: '#3498db',
    order: 0
  });

  const fetchCategoryTree = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/tutorials/categories/admin/tree', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategoryTree(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryTree();
  }, []);

  const toggleNode = (id) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

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

      fetchCategoryTree();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        parent: '',
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
    setFormData({
      name: category.name,
      parent: category.parent?._id || '',
      description: category.description || '',
      icon: category.icon || '📚',
      color: category.color || '#3498db',
      order: category.order || 0
    });
    setEditingId(category._id);
    setShowForm(true);
  };

  const handleDelete = async (id, childCount = 0) => {
    if (childCount > 0) {
      toast.error('Cannot delete category with subcategories. Delete them first.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/tutorials/categories/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Category deleted successfully');
        fetchCategoryTree();
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
      parent: '',
      description: '',
      icon: '📚',
      color: '#3498db',
      order: 0
    });
  };

  const reorderCategory = async (categoryId, direction) => {
    try {
      const token = localStorage.getItem('token');
      
      // Get all categories as flat list
      const flatList = [];
      const flatten = (items) => {
        items.forEach(item => {
          flatList.push(item);
          if (item.children) flatten(item.children);
        });
      };
      flatten(categoryTree);

      // Find the category being moved
      const movingCat = flatList.find(c => c._id === categoryId);
      if (!movingCat) return;

      // Get parent ID for comparison (handle both object and string)
      const getParentId = (cat) => {
        if (cat.parent) {
          return typeof cat.parent === 'object' ? cat.parent._id : cat.parent;
        }
        return null;
      };

      const movingParentId = getParentId(movingCat);

      // Find all categories with same parent
      const sameParent = flatList.filter(c => {
        const cParentId = getParentId(c);
        return cParentId === movingParentId;
      }).sort((a, b) => a.order - b.order);

      const currentIndex = sameParent.findIndex(c => c._id === categoryId);
      let targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= sameParent.length) return;

      // Swap the two items
      const [moving] = sameParent.splice(currentIndex, 1);
      sameParent.splice(targetIndex, 0, moving);

      // Update all orders sequentially
      const updates = sameParent.map((cat, index) =>
        axios.put(`/api/tutorials/categories/${cat._id}`, { order: index }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      );

      await Promise.all(updates);
      fetchCategoryTree();
      toast.success('Order updated successfully');
    } catch (err) {
      toast.error('Error reordering category');
      console.error(err);
    }
  };

  const moveUp = (category) => {
    reorderCategory(category._id, 'up');
  };

  const moveDown = (category) => {
    reorderCategory(category._id, 'down');
  };

  const handleDragStart = (e, category) => {
    console.log('Drag start:', category._id, category.name);
    // Only store the ID, not the whole object to avoid stale data
    setDraggedItem({ _id: category._id });
    e.dataTransfer.effectAllowed = 'move';
  };

  const getParentIdFromCategory = (cat) => {
    if (!cat.parent) return null;
    return typeof cat.parent === 'object' ? cat.parent._id : cat.parent;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetCategory) => {
    e.preventDefault();
    
    console.log('=== DROP START ===');
    console.log('Dragged item ID:', draggedItem?._id);
    console.log('Target category:', targetCategory._id, targetCategory.name);
    
    if (!draggedItem || draggedItem._id === targetCategory._id) {
      console.log('Same item or no dragged item, aborting');
      setDraggedItem(null);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Fetch fresh flat list from backend to ensure parent IDs are correct
      const flatRes = await axios.get('/api/tutorials/categories/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allCategories = flatRes.data.data;

      console.log('=== API RESPONSE ===');
      console.log('Total categories:', allCategories.length);

      // Find fresh versions of dragged and target items from API
      const freshDraggedItem = allCategories.find(c => c._id === draggedItem._id);
      const freshTargetItem = allCategories.find(c => c._id === targetCategory._id);

      console.log('=== FRESH DATA ===');
      console.log('Fresh dragged:', freshDraggedItem?._id, freshDraggedItem?.name, 'parent:', freshDraggedItem?.parent);
      console.log('Fresh target:', freshTargetItem?._id, freshTargetItem?.name, 'parent:', freshTargetItem?.parent);

      if (!freshDraggedItem || !freshTargetItem) {
        console.log('ERROR: One or both items not found!');
        toast.error('Category not found');
        setDraggedItem(null);
        return;
      }

      // Helper function to get parent ID
      const getParentId = (cat) => {
        if (!cat.parent) return null;
        return typeof cat.parent === 'object' ? cat.parent._id : cat.parent;
      };

      const draggedParentId = getParentId(freshDraggedItem);
      const targetParentId = getParentId(freshTargetItem);

      console.log('=== PARENT COMPARISON ===');
      console.log('Dragged parent ID:', draggedParentId);
      console.log('Target parent ID:', targetParentId);
      console.log('Are they equal?', draggedParentId === targetParentId);

      // Case 1: Dragging within same parent (same level - just reorder)
      if (draggedParentId === targetParentId) {
        console.log('>>> CASE 1: Same level reorder');
        
        const sameParentCats = allCategories
          .filter(c => getParentId(c) === draggedParentId)
          .sort((a, b) => a.order - b.order);

        console.log('Siblings:', sameParentCats.map(c => ({ id: c._id, name: c.name, order: c.order })));

        const draggedIndex = sameParentCats.findIndex(c => c._id === draggedItem._id);
        const targetIndex = sameParentCats.findIndex(c => c._id === targetCategory._id);

        console.log('Dragged index:', draggedIndex, 'Target index:', targetIndex);

        if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
          console.log('Invalid indices!');
          setDraggedItem(null);
          return;
        }

        // Reorder array
        const reordered = [...sameParentCats];
        const movedItem = reordered[draggedIndex];
        reordered.splice(draggedIndex, 1);
        reordered.splice(targetIndex, 0, movedItem);

        console.log('New order:', reordered.map(c => c.name));

        // Update all orders sequentially
        const updates = reordered.map((cat, index) =>
          axios.put(`/api/tutorials/categories/${cat._id}`, { order: index }, {
            headers: { Authorization: `Bearer ${token}` }
          })
        );

        await Promise.all(updates);
        console.log('Updated orders successfully');
        fetchCategoryTree();
        setDraggedItem(null);
        toast.success('Categories reordered successfully');
      } 
      // Case 2: Dragging to different parent level (move + reorder)
      else {
        console.log('>>> CASE 2: Different level move');
        
        // Check if target is a descendant of dragged item ONLY for cross-level moves
        const isDescendant = (potentialDescendant, ancestor) => {
          let current = potentialDescendant;
          while (current.parent) {
            const parentId = getParentId(current);
            if (parentId === ancestor._id) return true;
            current = allCategories.find(c => c._id === parentId);
            if (!current) break;
          }
          return false;
        };

        // Check if target is a child of dragged (would create circular reference)
        if (isDescendant(freshTargetItem, freshDraggedItem)) {
          console.log('Cannot move to descendant!');
          toast.error('Cannot move category to its own descendant');
          setDraggedItem(null);
          return;
        }

        // When dropping on a category, make the dragged item a child of that category
        // targetCategory becomes the new parent of draggedItem
        const newParentId = targetCategory._id;
        const targetChildren = allCategories
          .filter(c => getParentId(c) === newParentId)
          .sort((a, b) => a.order - b.order);

        const newOrder = targetChildren.length;

        console.log('Moving to new parent:', newParentId, 'with order:', newOrder);

        // Update the dragged item to have new parent
        await axios.put(`/api/tutorials/categories/${draggedItem._id}`, 
          { 
            parent: newParentId,
            order: newOrder 
          }, 
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        // Reorder old parent's children
        const oldParentChildren = allCategories
          .filter(c => getParentId(c) === draggedParentId && c._id !== draggedItem._id)
          .sort((a, b) => a.order - b.order);

        const oldParentUpdates = oldParentChildren.map((cat, index) =>
          axios.put(`/api/tutorials/categories/${cat._id}`, { order: index }, {
            headers: { Authorization: `Bearer ${token}` }
          })
        );

        await Promise.all(oldParentUpdates);
        console.log('Moved successfully');
        fetchCategoryTree();
        setDraggedItem(null);
        toast.success('Category moved successfully');
      }
    } catch (err) {
      toast.error('Error moving category');
      console.error('Drop error:', err);
    }
    console.log('=== DROP END ===');
  };

  const renderCategoryNode = (category, level = 0) => {
    const isExpanded = expandedNodes.has(category._id);
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div 
        key={category._id} 
        style={{ marginLeft: `${level * 20}px` }}
        draggable
        onDragStart={(e) => handleDragStart(e, category)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, category)}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px',
          backgroundColor: draggedItem?._id === category._id ? '#e8f4f8' : level % 2 === 0 ? '#f8f9fa' : 'white',
          borderRadius: '6px',
          marginBottom: '5px',
          border: draggedItem?._id === category._id ? '2px solid #3498db' : '1px solid #ecf0f1',
          cursor: 'grab'
        }}>
          <div style={{ marginRight: '5px', cursor: 'grab', color: '#bdc3c7' }}>
            <FaGripVertical />
          </div>

          {hasChildren && (
            <button
              onClick={() => toggleNode(category._id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '5px 10px',
                color: '#3498db'
              }}
            >
              {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
            </button>
          )}
          {!hasChildren && <div style={{ width: '30px' }} />}

          <span style={{ fontSize: '20px', marginRight: '10px' }}>
            {category.icon}
          </span>

          <div style={{ flex: 1 }}>
            <strong>{category.name}</strong>
            {category.description && (
              <p style={{ fontSize: '0.85rem', color: '#7f8c8d', margin: '2px 0' }}>
                {category.description}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginRight: '10px' }}>
            <div style={{ textAlign: 'center', minWidth: '50px' }}>
              <small style={{ color: '#7f8c8d', display: 'block' }}>Order</small>
              <strong style={{ fontSize: '16px', color: '#2c3e50' }}>{category.order}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                onClick={() => moveUp(category)}
                className="btn btn-xs btn-secondary"
                title="Move Up"
                style={{ padding: '3px 6px', fontSize: '12px' }}
              >
                <FaArrowUp />
              </button>
              <button
                onClick={() => moveDown(category)}
                className="btn btn-xs btn-secondary"
                title="Move Down"
                style={{ padding: '3px 6px', fontSize: '12px' }}
              >
                <FaArrowDown />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: category.color,
                borderRadius: '3px',
                border: '1px solid #ddd'
              }}
              title={category.color}
            />
            <button
              onClick={() => handleEdit(category)}
              className="btn btn-sm btn-secondary"
              title="Edit"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => handleDelete(category._id, hasChildren ? 1 : 0)}
              className="btn btn-sm btn-danger"
              title="Delete"
            >
              <FaTrash />
            </button>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div>
            {category.children.map(child => renderCategoryNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <h1>Tutorial Category Management</h1>
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
                  <label>Parent Category (Optional)</label>
                  <select
                    name="parent"
                    value={formData.parent}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="">Root Level</option>
                    {categoryTree.length > 0 && renderCategoryOptions(categoryTree)}
                  </select>
                </div>
              </div>

              <div className="form-row">
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

        {categoryTree.length > 0 ? (
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaFolderOpen /> Category Hierarchy
            </h3>
            {categoryTree.map(category => renderCategoryNode(category))}
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

function renderCategoryOptions(categories, prefix = '') {
  return categories.flatMap(cat => [
    <option key={cat._id} value={cat._id}>
      {prefix}{cat.icon} {cat.name}
    </option>,
    ...(cat.children ? renderCategoryOptions(cat.children, prefix + '  ') : [])
  ]);
}

export default TutorialCategoryTree;

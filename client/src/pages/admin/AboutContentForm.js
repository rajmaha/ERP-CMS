import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import RichTextEditor from '../../components/RichTextEditor';
import IconPicker from '../../components/IconPicker';
import HeroImagePicker from '../../components/HeroImagePicker';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaSave, FaArrowUp, FaArrowDown, FaEdit } from 'react-icons/fa';
import './Form.css';

const AboutContentForm = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mission: '',
    vision: '',
    sectionTitles: {
      whoWeAre: 'Who We Are',
      coreValues: 'Our Core Values',
      whyChooseUs: 'Why Choose Us',
      mission: 'Our Mission',
      vision: 'Our Vision'
    },
    values: [],
    whyChooseUs: [],
    teamMembers: []
  });
  const [newValue, setNewValue] = useState('');
  const [editingValueIndex, setEditingValueIndex] = useState(null);
  const [editingValueText, setEditingValueText] = useState('');
  const [newWhyItem, setNewWhyItem] = useState({
    icon: '💼',
    title: '',
    description: ''
  });

  const fetchAboutContent = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/pages/about-content', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.data) {
        setFormData({
          ...res.data.data,
          whyChooseUs: res.data.data.whyChooseUs || []
        });
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching about content:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAboutContent();
  }, [fetchAboutContent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('sectionTitles.')) {
      const titleKey = name.split('.')[1];
      setFormData({
        ...formData,
        sectionTitles: {
          ...formData.sectionTitles,
          [titleKey]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addValue = () => {
    if (newValue.trim()) {
      setFormData({
        ...formData,
        values: [...formData.values, newValue.trim()]
      });
      setNewValue('');
      toast.success('Value added successfully');
    } else {
      toast.error('Please enter a value');
    }
  };

  const removeValue = (index) => {
    if (window.confirm('Are you sure you want to delete this value?')) {
      setFormData({
        ...formData,
        values: formData.values.filter((_, i) => i !== index)
      });
      toast.success('Value deleted successfully');
    }
  };

  const startEditingValue = (index) => {
    setEditingValueIndex(index);
    setEditingValueText(formData.values[index]);
  };

  const cancelEditingValue = () => {
    setEditingValueIndex(null);
    setEditingValueText('');
  };

  const saveEditingValue = () => {
    if (!editingValueText.trim()) {
      toast.error('Value cannot be empty');
      return;
    }
    const updatedValues = [...formData.values];
    updatedValues[editingValueIndex] = editingValueText.trim();
    setFormData({
      ...formData,
      values: updatedValues
    });
    setEditingValueIndex(null);
    setEditingValueText('');
    toast.success('Value updated successfully');
  };

  const handleWhyChooseUsChange = (index, field, value) => {
    const newItems = [...formData.whyChooseUs];
    newItems[index][field] = value;
    setFormData({ ...formData, whyChooseUs: newItems });
  };

  const addWhyChooseUsItem = () => {
    if (!newWhyItem.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    // Check if description has content (remove HTML tags for validation)
    const descriptionText = newWhyItem.description.replace(/<[^>]*>/g, '').trim();
    if (!descriptionText) {
      toast.error('Please enter a description');
      return;
    }
    setFormData({
      ...formData,
      whyChooseUs: [...formData.whyChooseUs, { ...newWhyItem, order: formData.whyChooseUs.length }]
    });
    // Reset the form
    setNewWhyItem({ icon: '💼', title: '', description: '' });
    toast.success('Item added successfully');
  };

  const removeWhyChooseUsItem = (index) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setFormData({
        ...formData,
        whyChooseUs: formData.whyChooseUs.filter((_, i) => i !== index)
      });
      toast.success('Item deleted successfully');
    }
  };

  const moveWhyItemUp = (index) => {
    if (index === 0) return;
    const updated = [...formData.whyChooseUs];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    updated.forEach((item, i) => { item.order = i; });
    setFormData({ ...formData, whyChooseUs: updated });
  };

  const moveWhyItemDown = (index) => {
    if (index === formData.whyChooseUs.length - 1) return;
    const updated = [...formData.whyChooseUs];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    updated.forEach((item, i) => { item.order = i; });
    setFormData({ ...formData, whyChooseUs: updated });
  };

  const handleSaveContent = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/pages/about-content', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('About content saved successfully');
      fetchAboutContent();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <h1>About Page Content</h1>
        </header>

        <form onSubmit={handleSaveContent} className="form-container card">
          <fieldset className="form-section">
            <legend>Main Content</legend>

            <div className="form-group">
              <label>Page Title *</label>
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
              <label>Main Content *</label>
              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Main about content"
                name="content"
              />
            </div>

            <div className="form-group">
              <label>Mission Statement</label>
              <RichTextEditor
                value={formData.mission}
                onChange={(mission) => setFormData({ ...formData, mission })}
                placeholder="Our mission"
                name="mission"
              />
            </div>

            <div className="form-group">
              <label>Vision Statement</label>
              <RichTextEditor
                value={formData.vision}
                onChange={(vision) => setFormData({ ...formData, vision })}
                placeholder="Our vision"
                name="vision"
              />
            </div>

            <div className="form-group">
              <label>Mission Image</label>
              <HeroImagePicker
                value={formData.missionImage}
                onChange={(url) => setFormData({ ...formData, missionImage: url })}
                label=""
              />
            </div>

            <div className="form-group">
              <label>Vision Image</label>
              <HeroImagePicker
                value={formData.visionImage}
                onChange={(url) => setFormData({ ...formData, visionImage: url })}
                label=""
              />
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>Section Titles</legend>

            <div className="form-group">
              <label>"Who We Are" Section Title</label>
              <input
                type="text"
                name="sectionTitles.whoWeAre"
                value={formData.sectionTitles?.whoWeAre || 'Who We Are'}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>"Core Values" Section Title</label>
              <input
                type="text"
                name="sectionTitles.coreValues"
                value={formData.sectionTitles?.coreValues || 'Our Core Values'}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>"Why Choose Us" Section Title</label>
              <input
                type="text"
                name="sectionTitles.whyChooseUs"
                value={formData.sectionTitles?.whyChooseUs || 'Why Choose Us'}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>"Mission" Section Title</label>
              <input
                type="text"
                name="sectionTitles.mission"
                value={formData.sectionTitles?.mission || 'Our Mission'}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>"Vision" Section Title</label>
              <input
                type="text"
                name="sectionTitles.vision"
                value={formData.sectionTitles?.vision || 'Our Vision'}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>Company Values</legend>

            {formData.values.length > 0 && (
              <div className="values-list" style={{ marginBottom: '1.5rem' }}>
                {formData.values.map((value, index) => (
                  <div key={index} className="value-item" style={{
                    background: 'white',
                    padding: '1rem 1.5rem',
                    borderRadius: '8px',
                    marginBottom: '0.75rem',
                    border: '1px solid #e0e0e0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                      <span style={{ 
                        background: '#e3f2fd', 
                        color: '#1976d2',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        flexShrink: 0
                      }}>
                        {index + 1}
                      </span>
                      {editingValueIndex === index ? (
                        <input
                          type="text"
                          value={editingValueText}
                          onChange={(e) => setEditingValueText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              saveEditingValue();
                            } else if (e.key === 'Escape') {
                              cancelEditingValue();
                            }
                          }}
                          className="form-control"
                          style={{ flex: 1, marginRight: '1rem' }}
                          autoFocus
                        />
                      ) : (
                        <span style={{ fontSize: '1rem', color: '#212529', flex: 1 }}>{value}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      {editingValueIndex === index ? (
                        <>
                          <button 
                            type="button" 
                            onClick={saveEditingValue} 
                            className="btn btn-sm btn-success"
                            title="Save"
                          >
                            <FaSave />
                          </button>
                          <button 
                            type="button" 
                            onClick={cancelEditingValue} 
                            className="btn btn-sm btn-secondary"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            type="button" 
                            onClick={() => startEditingValue(index)} 
                            className="btn btn-sm btn-primary"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => removeValue(index)} 
                            className="btn btn-sm btn-danger"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="add-value" style={{
              background: '#f8f9fa',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '2px dashed #dee2e6'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#495057' }}>➕ Add New Value</h4>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Value</label>
                  <input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addValue();
                      }
                    }}
                    placeholder="e.g., Integrity, Innovation, Excellence"
                    className="form-control"
                  />
                </div>
                <button type="button" onClick={addValue} className="btn btn-secondary" style={{ marginBottom: 0 }}>
                  <FaPlus /> Add
                </button>
              </div>
              <small style={{ display: 'block', marginTop: '0.5rem', color: '#6c757d' }}>
                💡 Tip: Press Enter to quickly add a value
              </small>
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>Company Values</legend>

            {formData.whyChooseUs.length > 0 && (
              <div className="why-items-list">
                {formData.whyChooseUs.map((item, index) => (
                  <div key={index} className="feature-item" style={{ 
                    background: 'white', 
                    padding: '1.5rem', 
                    borderRadius: '8px', 
                    marginBottom: '1.5rem',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      marginBottom: '1rem',
                      paddingBottom: '1rem',
                      borderBottom: '2px solid #e9ecef'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '2rem' }}>{item.icon}</span>
                        <strong style={{ fontSize: '1.1rem', color: '#212529' }}>Item #{index + 1}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="button" onClick={() => moveWhyItemUp(index)} disabled={index === 0} className="btn btn-sm btn-secondary">
                          <FaArrowUp />
                        </button>
                        <button type="button" onClick={() => moveWhyItemDown(index)} disabled={index === formData.whyChooseUs.length - 1} className="btn btn-sm btn-secondary">
                          <FaArrowDown />
                        </button>
                        <button type="button" onClick={() => removeWhyChooseUsItem(index)} className="btn btn-sm btn-danger">
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Icon</label>
                      <IconPicker
                        value={item.icon}
                        onChange={(icon) => handleWhyChooseUsChange(index, 'icon', icon)}
                        label=""
                      />
                    </div>

                    <div className="form-group">
                      <label>Title</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleWhyChooseUsChange(index, 'title', e.target.value)}
                        placeholder="e.g., Industry Expertise"
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <RichTextEditor
                        value={item.description || ''}
                        onChange={(value) => handleWhyChooseUsChange(index, 'description', value)}
                        placeholder="Description of this feature"
                        name={`whyChooseUs-description-${index}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="add-why-item" style={{ 
              background: '#f8f9fa', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              marginTop: '2rem',
              border: '2px dashed #dee2e6'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#495057' }}>➕ Add New Item</h3>
              
              <IconPicker
                value={newWhyItem.icon}
                onChange={(icon) => setNewWhyItem({ ...newWhyItem, icon })}
                label="Icon"
              />

              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newWhyItem.title}
                  onChange={(e) => setNewWhyItem({ ...newWhyItem, title: e.target.value })}
                  placeholder="e.g., Industry Expertise"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <RichTextEditor
                  value={newWhyItem.description || ''}
                  onChange={(value) => setNewWhyItem({ ...newWhyItem, description: value })}
                  placeholder="Description of this feature"
                  name="newWhyItem-description"
                />
              </div>

              <button type="button" onClick={addWhyChooseUsItem} className="btn btn-secondary">
                <FaPlus /> Add Item
              </button>
            </div>
          </fieldset>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <FaSave /> {saving ? 'Saving...' : 'Save About Content'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AboutContentForm;

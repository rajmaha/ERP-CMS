import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import { FaSave, FaTimes, FaPlus, FaTrash, FaGripVertical, FaEdit } from 'react-icons/fa';
import RichTextEditor from '../../components/RichTextEditor';
import HeroImagePicker from '../../components/HeroImagePicker';
import './FormBuilder.css';

const FormBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    featureImage: '',
    fields: [],
    enableRecaptcha: true,
    status: 'draft',
    emailNotifications: true,
    notificationEmail: '',
    successMessage: 'Thank you for your submission!'
  });
  const [expandedFields, setExpandedFields] = useState({});

  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'email', label: 'Email' },
    { value: 'number', label: 'Number' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'select', label: 'Dropdown' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'checkbox', label: 'Checkboxes' },
    { value: 'date', label: 'Date' },
    { value: 'file', label: 'File Upload' },
    { value: 'color', label: 'Color Picker' },
    { value: 'url', label: 'URL' },
    { value: 'gender', label: 'Gender' },
    { value: 'country', label: 'Country' }
  ];

  useEffect(() => {
    if (id) {
      fetchForm();
    }
  }, [id]);

  const fetchForm = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/forms/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const form = res.data.data.find(f => f._id === id);
      if (form) {
        setFormData(form);
      }
    } catch (err) {
      toast.error('Error loading form');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    
    if (name === 'title') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, title: value, slug }));
    }
  };

  const toggleFieldExpand = (fieldId) => {
    setExpandedFields({
      ...expandedFields,
      [fieldId]: !expandedFields[fieldId]
    });
  };

  const addField = () => {
    const newField = {
      fieldId: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      placeholder: '',
      required: false,
      options: [],
      order: formData.fields.length,
      validation: {}
    };
    setFormData({ ...formData, fields: [...formData.fields, newField] });
    // Auto-expand new field
    setExpandedFields({ ...expandedFields, [newField.fieldId]: true });
  };

  const updateField = (index, field, value) => {
    const newFields = [...formData.fields];
    newFields[index][field] = value;
    setFormData({ ...formData, fields: newFields });
  };

  const removeField = (index) => {
    const newFields = formData.fields.filter((_, i) => i !== index);
    setFormData({ ...formData, fields: newFields });
  };

  const moveField = (index, direction) => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === formData.fields.length - 1)) {
      return;
    }
    
    const newFields = [...formData.fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    
    newFields.forEach((field, i) => {
      field.order = i;
    });
    
    setFormData({ ...formData, fields: newFields });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (id) {
        await axios.put(`/api/forms/admin/${id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Form updated successfully');
      } else {
        await axios.post('/api/forms/admin', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Form created successfully');
      }
      navigate('/admin/forms');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <h1>{id ? 'Edit Form' : 'Create New Form'}</h1>
        </header>

        <form onSubmit={handleSubmit} className="form-builder-container">
          <div className="form-settings card">
            <h2>Form Settings</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Form Title *</label>
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
                <label>Slug *</label>
                <input 
                  type="text" 
                  name="slug" 
                  value={formData.slug} 
                  onChange={handleChange} 
                  required 
                  className="form-control" 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Feature Image</label>
              <HeroImagePicker
                value={formData.featureImage}
                onChange={(url) => setFormData({ ...formData, featureImage: url })}
                label=""
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <RichTextEditor
                value={formData.description}
                onChange={(content) => setFormData({ ...formData, description: content })}
                name="description"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="form-control">
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="enableRecaptcha" 
                    checked={formData.enableRecaptcha} 
                    onChange={handleChange} 
                  />
                  Enable reCAPTCHA
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Success Message</label>
              <input 
                type="text" 
                name="successMessage" 
                value={formData.successMessage} 
                onChange={handleChange} 
                className="form-control" 
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="emailNotifications" 
                  checked={formData.emailNotifications} 
                  onChange={handleChange} 
                />
                Send Email Notifications
              </label>
            </div>

            {formData.emailNotifications && (
              <div className="form-group">
                <label>Notification Email</label>
                <input 
                  type="email" 
                  name="notificationEmail" 
                  value={formData.notificationEmail} 
                  onChange={handleChange} 
                  className="form-control" 
                  placeholder="admin@example.com"
                />
              </div>
            )}
          </div>

          <div className="form-fields-section card">
            <div className="section-header">
              <h2>Form Fields</h2>
              <button type="button" onClick={addField} className="btn btn-primary">
                <FaPlus /> Add Field
              </button>
            </div>

            <div className="fields-list">
              {formData.fields.length === 0 ? (
                <div className="empty-fields">
                  <p>No fields added yet. Click "Add Field" to start building your form.</p>
                </div>
              ) : (
                formData.fields.map((field, index) => (
                  <div key={field.fieldId} className={`field-item ${expandedFields[field.fieldId] ? 'expanded' : 'collapsed'}`}>
                    <div className="field-header" onClick={() => toggleFieldExpand(field.fieldId)}>
                      <div className="field-drag">
                        <FaGripVertical />
                      </div>
                      <div className="field-info">
                        <strong>{field.label || 'Unnamed Field'}</strong>
                        <span className="field-type">{fieldTypes.find(t => t.value === field.type)?.label}</span>
                      </div>
                      <div className="field-meta">
                        {field.required && <span className="badge-required">Required</span>}
                        {Object.keys(field.validation || {}).length > 0 && (
                          <span className="badge-validation">Validated</span>
                        )}
                      </div>
                      <div className="field-actions" onClick={(e) => e.stopPropagation()}>
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); moveField(index, 'up'); }} 
                          disabled={index === 0}
                          className="btn btn-sm"
                          title="Move Up"
                        >
                          ↑
                        </button>
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); moveField(index, 'down'); }} 
                          disabled={index === formData.fields.length - 1}
                          className="btn btn-sm"
                          title="Move Down"
                        >
                          ↓
                        </button>
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); removeField(index); }} 
                          className="btn btn-sm btn-danger"
                          title="Delete Field"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <div className="expand-icon">
                        {expandedFields[field.fieldId] ? '▼' : '▶'}
                      </div>
                    </div>

                    {expandedFields[field.fieldId] && (
                      <div className="field-config">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Label *</label>
                            <input 
                              type="text" 
                              value={field.label} 
                              onChange={(e) => updateField(index, 'label', e.target.value)}
                              required
                              className="form-control" 
                            />
                          </div>
                          <div className="form-group">
                            <label>Field Type *</label>
                            <select 
                              value={field.type} 
                              onChange={(e) => updateField(index, 'type', e.target.value)}
                              className="form-control"
                            >
                              {fieldTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Placeholder</label>
                          <input 
                            type="text" 
                            value={field.placeholder} 
                            onChange={(e) => updateField(index, 'placeholder', e.target.value)}
                            className="form-control" 
                          />
                        </div>

                        {['select', 'radio', 'checkbox'].includes(field.type) && (
                          <div className="form-group">
                            <label>Options (one per line)</label>
                            <textarea 
                              value={field.options.join('\n')} 
                              onChange={(e) => updateField(index, 'options', e.target.value.split('\n'))}
                              rows="4"
                              className="form-control"
                              placeholder="Option 1&#10;Option 2&#10;Option 3"
                            ></textarea>
                          </div>
                        )}

                        {/* Auto-populate options for gender field */}
                        {field.type === 'gender' && !field.options?.length && (
                          (() => {
                            updateField(index, 'options', ['Male', 'Female', 'Transgender', 'Other']);
                            return null;
                          })()
                        )}

                        {/* Validation Rules */}
                        <div className="validation-section">
                          <h4>Validation Rules</h4>
                          
                          {/* Text/Textarea Validation */}
                          {['text', 'textarea'].includes(field.type) && (
                            <div className="form-row">
                              <div className="form-group">
                                <label>Min Characters</label>
                                <input 
                                  type="number" 
                                  value={field.validation?.minLength || ''} 
                                  onChange={(e) => updateField(index, 'validation', { ...field.validation, minLength: parseInt(e.target.value) || undefined })}
                                  className="form-control"
                                  placeholder="e.g., 10"
                                />
                              </div>
                              <div className="form-group">
                                <label>Max Characters</label>
                                <input 
                                  type="number" 
                                  value={field.validation?.maxLength || ''} 
                                  onChange={(e) => updateField(index, 'validation', { ...field.validation, maxLength: parseInt(e.target.value) || undefined })}
                                  className="form-control"
                                  placeholder="e.g., 500"
                                />
                              </div>
                            </div>
                          )}

                          {/* Number Validation */}
                          {field.type === 'number' && (
                            <div className="form-row">
                              <div className="form-group">
                                <label>Min Value</label>
                                <input 
                                  type="number" 
                                  value={field.validation?.min || ''} 
                                  onChange={(e) => updateField(index, 'validation', { ...field.validation, min: parseInt(e.target.value) || undefined })}
                                  className="form-control"
                                  placeholder="e.g., 0"
                                />
                              </div>
                              <div className="form-group">
                                <label>Max Value</label>
                                <input 
                                  type="number" 
                                  value={field.validation?.max || ''} 
                                  onChange={(e) => updateField(index, 'validation', { ...field.validation, max: parseInt(e.target.value) || undefined })}
                                  className="form-control"
                                  placeholder="e.g., 100"
                                />
                              </div>
                            </div>
                          )}

                          {/* Date Validation */}
                          {field.type === 'date' && (
                            <div className="form-row">
                              <div className="form-group">
                                <label>Min Date</label>
                                <input 
                                  type="date" 
                                  value={field.validation?.minDate ? new Date(field.validation.minDate).toISOString().split('T')[0] : ''} 
                                  onChange={(e) => updateField(index, 'validation', { ...field.validation, minDate: e.target.value })}
                                  className="form-control"
                                />
                              </div>
                              <div className="form-group">
                                <label>Max Date</label>
                                <input 
                                  type="date" 
                                  value={field.validation?.maxDate ? new Date(field.validation.maxDate).toISOString().split('T')[0] : ''} 
                                  onChange={(e) => updateField(index, 'validation', { ...field.validation, maxDate: e.target.value })}
                                  className="form-control"
                                />
                              </div>
                            </div>
                          )}

                          {/* Checkbox Validation */}
                          {field.type === 'checkbox' && (
                            <div className="form-row">
                              <div className="form-group">
                                <label>Min Selections</label>
                                <input 
                                  type="number" 
                                  value={field.validation?.minSelect || ''} 
                                  onChange={(e) => updateField(index, 'validation', { ...field.validation, minSelect: parseInt(e.target.value) || undefined })}
                                  className="form-control"
                                  placeholder="e.g., 1"
                                />
                              </div>
                              <div className="form-group">
                                <label>Max Selections</label>
                                <input 
                                  type="number" 
                                  value={field.validation?.maxSelect || ''} 
                                  onChange={(e) => updateField(index, 'validation', { ...field.validation, maxSelect: parseInt(e.target.value) || undefined })}
                                  className="form-control"
                                  placeholder="e.g., 3"
                                />
                              </div>
                            </div>
                          )}

                          {/* Custom Pattern (for text fields) */}
                          {['text', 'textarea'].includes(field.type) && (
                            <div className="form-group">
                              <label>Custom Pattern (Regex)</label>
                              <input 
                                type="text" 
                                value={field.validation?.pattern || ''} 
                                onChange={(e) => updateField(index, 'validation', { ...field.validation, pattern: e.target.value })}
                                className="form-control"
                                placeholder="e.g., ^[A-Za-z]+$"
                              />
                              <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-light)' }}>
                                For advanced validation (letters only, numbers only, etc.)
                              </small>
                            </div>
                          )}

                          {/* Custom Error Message */}
                          <div className="form-group">
                            <label>Custom Error Message</label>
                            <input 
                              type="text" 
                              value={field.validation?.errorMessage || ''} 
                              onChange={(e) => updateField(index, 'validation', { ...field.validation, errorMessage: e.target.value })}
                              className="form-control"
                              placeholder="This field is invalid"
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={field.required} 
                              onChange={(e) => updateField(index, 'required', e.target.checked)}
                            />
                            Required Field
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <FaSave /> {loading ? 'Saving...' : 'Save Form'}
            </button>
            <button type="button" onClick={() => navigate('/admin/forms')} className="btn btn-secondary">
              <FaTimes /> Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default FormBuilder;

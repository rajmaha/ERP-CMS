import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import RichTextEditor from '../../components/RichTextEditor';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaImage, FaArrowUp, FaArrowDown, FaGripVertical } from 'react-icons/fa';
import HeroImagePicker from '../../components/HeroImagePicker';
import './Form.css';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    description: '',
    price: '',
    category: '',
    thumbnailImage: '',
    images: [],
    modules: [],
    isFeatured: false,
    isActive: true
  });

  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaGroups, setMediaGroups] = useState([]);
  const [selectedMediaGroup, setSelectedMediaGroup] = useState('');
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [currentImageField, setCurrentImageField] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData(res.data.data);
      setLoading(false);
    } catch (err) {
      toast.error('Error loading product');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, fetchProduct]);

  const fetchMediaGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/media/groups/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMediaGroups(res.data.data);
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  const fetchMediaFiles = async (groupId = null) => {
    try {
      setLoadingMedia(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('limit', 200);
      
      if (groupId && groupId !== '' && groupId !== 'null') {
        params.append('group', groupId);
      }

      const res = await axios.get(`/api/media?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMediaFiles(res.data.data || []);
      setLoadingMedia(false);
    } catch (err) {
      console.error('Error fetching media:', err);
      setLoadingMedia(false);
    }
  };

  const renderGroupIcon = (icon) => {
    if (!icon) return '📁';
    if (/^[\p{Emoji}]+$/u.test(icon)) return icon;
    if (icon && !icon.includes('emoji')) return <i className={`fas fa-${icon}`}></i>;
    return icon;
  };

  const openMediaLibrary = (fieldName, isMultiple = false) => {
    setCurrentImageField(fieldName);
    if (isMultiple) {
      setSelectedImages(formData.images || []);
    }
    fetchMediaGroups();
    fetchMediaFiles();
    setShowMediaLibrary(true);
    setSelectedMediaGroup('');
  };

  const handleSelectImage = (imageUrl) => {
    if (currentImageField === 'images') {
      const updatedImages = selectedImages.includes(imageUrl)
        ? selectedImages.filter(img => img !== imageUrl)
        : [...selectedImages, imageUrl];
      setSelectedImages(updatedImages);
    } else {
      setFormData({
        ...formData,
        [currentImageField]: imageUrl
      });
      setShowMediaLibrary(false);
      toast.success('Image selected');
    }
  };

  const applyMultipleImages = () => {
    setFormData({
      ...formData,
      images: selectedImages
    });
    setShowMediaLibrary(false);
    toast.success(`${selectedImages.length} images selected`);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleModuleChange = (index, field, value) => {
    const newModules = [...formData.modules];
    newModules[index][field] = value;
    setFormData({ ...formData, modules: newModules });
  };

  const handleModuleFeatureChange = (moduleIndex, featureIndex, value) => {
    const newModules = [...formData.modules];
    newModules[moduleIndex].features[featureIndex] = value;
    setFormData({ ...formData, modules: newModules });
  };

  const addModule = () => {
    setFormData({
      ...formData,
      modules: [...formData.modules, { name: '', description: '', image: '', features: [''], order: formData.modules.length }]
    });
  };

  const removeModule = (index) => {
    setFormData({
      ...formData,
      modules: formData.modules.filter((_, i) => i !== index)
    });
  };

  const addModuleFeature = (moduleIndex) => {
    const newModules = [...formData.modules];
    newModules[moduleIndex].features.push('');
    setFormData({ ...formData, modules: newModules });
  };

  const removeModuleFeature = (moduleIndex, featureIndex) => {
    const newModules = [...formData.modules];
    newModules[moduleIndex].features = newModules[moduleIndex].features.filter((_, i) => i !== featureIndex);
    setFormData({ ...formData, modules: newModules });
  };

  const moveFeatureUp = (moduleIndex, featureIndex) => {
    if (featureIndex === 0) return;
    const newModules = [...formData.modules];
    const features = [...newModules[moduleIndex].features];
    [features[featureIndex], features[featureIndex - 1]] = [features[featureIndex - 1], features[featureIndex]];
    newModules[moduleIndex].features = features;
    setFormData({ ...formData, modules: newModules });
  };

  const moveFeatureDown = (moduleIndex, featureIndex) => {
    const newModules = [...formData.modules];
    if (featureIndex === newModules[moduleIndex].features.length - 1) return;
    const features = [...newModules[moduleIndex].features];
    [features[featureIndex], features[featureIndex + 1]] = [features[featureIndex + 1], features[featureIndex]];
    newModules[moduleIndex].features = features;
    setFormData({ ...formData, modules: newModules });
  };

  const moveModule = (index, direction) => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === formData.modules.length - 1)) {
      return;
    }
    
    const newModules = [...formData.modules];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newModules[index], newModules[targetIndex]] = [newModules[targetIndex], newModules[index]];
    
    newModules.forEach((module, i) => {
      module.order = i;
    });
    
    setFormData({ ...formData, modules: newModules });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      if (id) {
        await axios.put(`/api/products/${id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product updated successfully');
      } else {
        await axios.post('/api/products', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product created successfully');
      }
      
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving product');
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
        <button onClick={() => navigate('/admin/products')} className="back-btn">
          <FaArrowLeft /> Back to Products
        </button>

        <form onSubmit={handleSubmit} className="form-container card">
          <h1>{id ? 'Edit Product' : 'Create New Product'}</h1>

          <div className="form-row">
            <div className="form-group">
              <label>Product Name *</label>
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
              <label>Price *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="form-control"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g., Electronics, Clothing"
            />
          </div>

          <div className="form-group">
            <label>Short Description</label>
            <textarea
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              rows="2"
              className="form-control"
            ></textarea>
          </div>

          <div className="form-group">
            <label>Description</label>
            <RichTextEditor
              value={formData.description}
              onChange={(description) => setFormData({ ...formData, description })}
              placeholder="Full product description"
              name="description"
            />
          </div>

          <div className="form-group">
            <label>Thumbnail Image</label>
            <HeroImagePicker
              value={formData.thumbnailImage}
              onChange={(url) => setFormData({ ...formData, thumbnailImage: url })}
              label=""
            />
          </div>

          <div className="form-group">
            <label>Additional Images</label>
            {formData.images.map((img, index) => (
              <div key={index} style={{ marginBottom: '1rem' }}>
                <HeroImagePicker
                  value={img}
                  onChange={(url) => {
                    const newImages = [...formData.images];
                    newImages[index] = url;
                    setFormData({ ...formData, images: newImages });
                  }}
                  label=""
                />
                <button
                  type="button"
                  onClick={() => {
                    const newImages = formData.images.filter((_, i) => i !== index);
                    setFormData({ ...formData, images: newImages });
                  }}
                  className="btn btn-danger btn-sm"
                  style={{ marginTop: '0.5rem' }}
                >
                  Remove Image
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, images: [...formData.images, ''] })}
              className="btn btn-secondary"
            >
              Add Image
            </button>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                Active
              </label>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                />
                Featured
              </label>
            </div>
          </div>

          {/* Modules/Features Section */}
          <fieldset className="form-section">
            <legend>Modules / Features</legend>
            
            {formData.modules.map((module, moduleIndex) => (
              <div key={moduleIndex} className="module-item">
                <div className="module-header">
                  <h4>Module {moduleIndex + 1}</h4>
                  <div className="module-actions">
                    <button
                      type="button"
                      onClick={() => moveModule(moduleIndex, 'up')}
                      disabled={moduleIndex === 0}
                      className="btn btn-sm btn-secondary"
                      title="Move Up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveModule(moduleIndex, 'down')}
                      disabled={moduleIndex === formData.modules.length - 1}
                      className="btn btn-sm btn-secondary"
                      title="Move Down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeModule(moduleIndex)}
                      className="btn btn-sm btn-danger"
                    >
                      Remove Module
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Module Name *</label>
                  <input
                    type="text"
                    value={module.name}
                    onChange={(e) => handleModuleChange(moduleIndex, 'name', e.target.value)}
                    required
                    className="form-control"
                    placeholder="e.g., User Management"
                  />
                </div>

                <div className="form-group">
                  <label>Module Description</label>
                  <RichTextEditor
                    value={module.description}
                    onChange={(content) => handleModuleChange(moduleIndex, 'description', content)}
                    placeholder="Brief description of this module"
                    name={`module-description-${moduleIndex}`}
                  />
                </div>

                <div className="form-group">
                  <label>Module Image</label>
                  <HeroImagePicker
                    value={module.image}
                    onChange={(url) => handleModuleChange(moduleIndex, 'image', url)}
                    label=""
                  />
                </div>

                <div className="form-group">
                  <label>Module Features</label>
                  {module.features.map((feature, featureIndex) => (
                    <div key={featureIndex} style={{ 
                      display: 'flex', 
                      gap: '0.5rem', 
                      marginBottom: '0.75rem',
                      alignItems: 'center',
                      padding: '0.5rem',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '0.25rem' 
                      }}>
                        <button
                          type="button"
                          onClick={() => moveFeatureUp(moduleIndex, featureIndex)}
                          disabled={featureIndex === 0}
                          className="btn btn-sm btn-secondary"
                          title="Move Up"
                          style={{ 
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            opacity: featureIndex === 0 ? 0.5 : 1,
                            cursor: featureIndex === 0 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <FaArrowUp />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveFeatureDown(moduleIndex, featureIndex)}
                          disabled={featureIndex === module.features.length - 1}
                          className="btn btn-sm btn-secondary"
                          title="Move Down"
                          style={{ 
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            opacity: featureIndex === module.features.length - 1 ? 0.5 : 1,
                            cursor: featureIndex === module.features.length - 1 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <FaArrowDown />
                        </button>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: '#9ca3af',
                        fontSize: '1.25rem',
                        cursor: 'grab'
                      }}>
                        <FaGripVertical />
                      </div>
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleModuleFeatureChange(moduleIndex, featureIndex, e.target.value)}
                        className="form-control"
                        placeholder="Feature description"
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => removeModuleFeature(moduleIndex, featureIndex)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.5rem 0.75rem' }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addModuleFeature(moduleIndex)}
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '0.5rem' }}
                  >
                    + Add Feature
                  </button>
                </div>
              </div>
            ))}

            <button type="button" onClick={addModule} className="btn btn-secondary">
              + Add Module
            </button>
          </fieldset>

          {/* SEO and OG Fields similar to PageForm */}

          {/* Media Library Modal */}
          {showMediaLibrary && (
            <>
              <div className="modal-overlay" onClick={() => setShowMediaLibrary(false)}></div>
              <div className="media-library-modal">
                <div className="modal-header">
                  <h3>Select Image{currentImageField === 'images' ? 's' : ''}</h3>
                  <button type="button" onClick={() => setShowMediaLibrary(false)} className="close-btn">✕</button>
                </div>

                <div className="media-library-container">
                  <div className="media-groups-sidebar">
                    <h4>Filter by Group</h4>
                    <button
                      type="button"
                      className={`group-btn ${selectedMediaGroup === '' ? 'active' : ''}`}
                      onClick={() => { setSelectedMediaGroup(''); fetchMediaFiles(null); }}
                    >
                      📁 All Images
                    </button>
                    {mediaGroups.map(group => (
                      <button
                        key={group._id}
                        type="button"
                        className={`group-btn ${selectedMediaGroup === group._id ? 'active' : ''}`}
                        onClick={() => { setSelectedMediaGroup(group._id); fetchMediaFiles(group._id); }}
                        style={{ borderLeftColor: group.color }}
                      >
                        <span className="group-icon">{renderGroupIcon(group.icon)}</span>
                        {group.name}
                      </button>
                    ))}
                  </div>

                  <div className="modal-content">
                    {loadingMedia ? (
                      <p className="loading-text">Loading images...</p>
                    ) : mediaFiles.length > 0 ? (
                      <>
                        <div className="media-library-grid">
                          {mediaFiles.map(file => {
                            const imageUrl = file.url.startsWith('/uploads') ? file.url : `/uploads/${file.url}`;
                            const isSelected = currentImageField === 'images' 
                              ? selectedImages.includes(file.url)
                              : formData[currentImageField] === file.url;
                            return (
                              <button
                                key={file._id}
                                type="button"
                                className={`media-library-item ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleSelectImage(file.url)}
                                title={file.originalName}
                              >
                                <img src={imageUrl} alt={file.originalName} />
                                <div className="item-info">
                                  <p className="item-name">{file.originalName}</p>
                                  {isSelected && <span className="check-mark">✓</span>}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        {currentImageField === 'images' && (
                          <div className="modal-footer">
                            <button type="button" onClick={applyMultipleImages} className="btn btn-primary">
                              Apply ({selectedImages.length} selected)
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="empty-text">No images available</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Product'}
            </button>
            <button type="button" onClick={() => navigate('/admin/products')} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ProductForm;

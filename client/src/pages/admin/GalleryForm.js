import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaImage } from 'react-icons/fa';
import HeroImagePicker from '../../components/HeroImagePicker';
import '../admin/Form.css';

const GalleryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'photo',
    image: '',
    videoType: 'youtube',
    videoUrl: '',
    videoId: '',
    thumbnail: '',
    category: 'general',
    tags: '',
    isActive: true,
    isFeatured: false,
    order: 0
  });

  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaGroups, setMediaGroups] = useState([]);
  const [selectedMediaGroup, setSelectedMediaGroup] = useState('');
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [currentImageField, setCurrentImageField] = useState('');
  const [categories, setCategories] = useState([]);

  const fetchItem = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/gallery/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const item = res.data.data;
      setFormData({
        ...item,
        tags: item.tags ? item.tags.join(', ') : ''
      });
      setLoading(false);
    } catch (err) {
      toast.error('Error loading item');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchItem();
    }
  }, [id, fetchItem]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/gallery/categories/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

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

  const openMediaLibrary = (fieldName) => {
    setCurrentImageField(fieldName);
    fetchMediaGroups();
    fetchMediaFiles();
    setShowMediaLibrary(true);
    setSelectedMediaGroup('');
  };

  const handleSelectImage = (imageUrl) => {
    setFormData({
      ...formData,
      [currentImageField]: imageUrl
    });
    setShowMediaLibrary(false);
    toast.success('Image selected');
  };

  const extractVideoId = (url, type) => {
    let id = '';
    
    if (type === 'youtube') {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      id = (match && match[2].length === 11) ? match[2] : '';
    } else if (type === 'facebook') {
      const match = url.match(/facebook\.com\/.*\/videos\/(\d+)/);
      id = match ? match[1] : '';
    } else if (type === 'vimeo') {
      const match = url.match(/vimeo\.com\/(\d+)/);
      id = match ? match[1] : '';
    }
    
    return id;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };

    // Auto-extract video ID when URL changes
    if (name === 'videoUrl' || name === 'videoType') {
      const url = name === 'videoUrl' ? value : formData.videoUrl;
      const videoType = name === 'videoType' ? value : formData.videoType;
      
      if (url && videoType) {
        const videoId = extractVideoId(url, videoType);
        newFormData.videoId = videoId;
      }
    }

    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const submitData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
      };

      if (id) {
        await axios.put(`/api/gallery/${id}`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Gallery item updated successfully');
      } else {
        await axios.post('/api/gallery', submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Gallery item created successfully');
      }

      navigate('/admin/gallery');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving item');
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
        <button onClick={() => navigate('/admin/gallery')} className="back-btn">
          <FaArrowLeft /> Back to Gallery
        </button>

        <form onSubmit={handleSubmit} className="form-container card">
          <h1>{id ? 'Edit Gallery Item' : 'Add New Gallery Item'}</h1>

          <div className="form-row">
            <div className="form-group">
              <label>Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="form-control"
              >
                <option value="photo">Photo</option>
                <option value="video">Video</option>
              </select>
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="form-control"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="form-control"
            ></textarea>
          </div>

          {formData.type === 'photo' ? (
            <div className="form-group">
              <label>Photo *</label>
              <div className="image-picker-wrapper">
                {formData.image && (
                  <div className="image-preview">
                    <img src={formData.image} alt="Preview" className="preview-img" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="btn btn-sm btn-danger"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => openMediaLibrary('image')}
                  className="btn btn-secondary"
                >
                  <FaImage /> Select Photo
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Video Platform *</label>
                  <select
                    name="videoType"
                    value={formData.videoType}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="facebook">Facebook</option>
                    <option value="vimeo">Vimeo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Video URL *</label>
                  <input
                    type="url"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              </div>

              {formData.videoId && (
                <div className="video-preview-box">
                  <p>Video ID: <strong>{formData.videoId}</strong></p>
                </div>
              )}

              <div className="form-group">
                <label>Video Thumbnail (Optional)</label>
                <div className="image-picker-wrapper">
                  {formData.thumbnail && (
                    <div className="image-preview">
                      <img src={formData.thumbnail} alt="Thumbnail" className="preview-img" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, thumbnail: '' })}
                        className="btn btn-sm btn-danger"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => openMediaLibrary('thumbnail')}
                    className="btn btn-secondary"
                  >
                    <FaImage /> Select Thumbnail
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="form-control"
              placeholder="event, celebration, team"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Display Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="form-control"
              />
            </div>

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

          {/* Media Library Modal */}
          {showMediaLibrary && (
            <>
              <div className="modal-overlay" onClick={() => setShowMediaLibrary(false)}></div>
              <div className="media-library-modal">
                <div className="modal-header">
                  <h3>Select Image</h3>
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
                      <div className="media-library-grid">
                        {mediaFiles.map(file => {
                          const imageUrl = file.url.startsWith('/uploads') ? file.url : `/uploads/${file.url}`;
                          return (
                            <button
                              key={file._id}
                              type="button"
                              className={`media-library-item ${formData[currentImageField] === file.url ? 'selected' : ''}`}
                              onClick={() => handleSelectImage(file.url)}
                              title={file.originalName}
                            >
                              <img src={imageUrl} alt={file.originalName} />
                              <div className="item-info">
                                <p className="item-name">{file.originalName}</p>
                                {formData[currentImageField] === file.url && <span className="check-mark">✓</span>}
                              </div>
                            </button>
                          );
                        })}
                      </div>
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
              {saving ? 'Saving...' : 'Save Gallery Item'}
            </button>
            <button type="button" onClick={() => navigate('/admin/gallery')} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default GalleryForm;

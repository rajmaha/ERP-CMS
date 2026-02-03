import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import RichTextEditor from '../../components/RichTextEditor';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaImage } from 'react-icons/fa';
import './Form.css';

const PageForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    slug: '',
    status: 'draft',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: ''
  });

  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaGroups, setMediaGroups] = useState([]);
  const [selectedMediaGroup, setSelectedMediaGroup] = useState('');
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [currentImageField, setCurrentImageField] = useState('');

  const fetchPage = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/pages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const pageData = res.data.data;
      setFormData({
        title: pageData.title || '',
        content: pageData.content || '',
        excerpt: pageData.excerpt || '',
        featuredImage: pageData.featuredImage || '',
        slug: pageData.slug || '',
        status: pageData.status || 'draft',
        metaTitle: pageData.metaTitle || '',
        metaDescription: pageData.metaDescription || '',
        metaKeywords: pageData.metaKeywords || '',
        ogTitle: pageData.ogTitle || '',
        ogDescription: pageData.ogDescription || '',
        ogImage: pageData.ogImage || ''
      });
      setLoading(false);
    } catch (err) {
      console.error('Error loading page:', err);
      toast.error('Error loading page');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchPage();
    }
  }, [id, fetchPage]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      if (id) {
        await axios.put(`/api/pages/${id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Page updated successfully');
      } else {
        await axios.post('/api/pages', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Page created successfully');
      }
      
      navigate('/admin/pages');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving page');
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
        <button onClick={() => navigate('/admin/pages')} className="back-btn">
          <FaArrowLeft /> Back to Pages
        </button>

        <form onSubmit={handleSubmit} className="form-container card">
          <h1>{id ? 'Edit Page' : 'Create New Page'}</h1>

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
            <label>Content *</label>
            <RichTextEditor
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder="Write your page content here..."
              name="content"
            />
          </div>

          <div className="form-group">
            <label>Excerpt</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows="3"
              className="form-control"
              placeholder="Brief summary of the page"
            ></textarea>
          </div>

          <div className="form-group">
            <label>Featured Image</label>
            <div className="image-picker-wrapper">
              {formData.featuredImage && (
                <div className="image-preview">
                  <img src={formData.featuredImage} alt="Featured" className="preview-img" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, featuredImage: '' })}
                    className="btn btn-sm btn-danger"
                  >
                    Remove
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => openMediaLibrary('featuredImage')}
                className="btn btn-secondary"
              >
                <FaImage /> Select Image from Library
              </button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="form-control"
                placeholder="Auto-generated from title"
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-control"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <fieldset className="form-section">
            <legend>SEO Settings</legend>

            <div className="form-group">
              <label>Meta Title</label>
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleChange}
                className="form-control"
                placeholder="Leave empty to use page title"
              />
              <small>{(formData.metaTitle || '').length}/60 characters</small>
            </div>

            <div className="form-group">
              <label>Meta Description</label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                rows="2"
                className="form-control"
                placeholder="SEO description"
              ></textarea>
              <small>{(formData.metaDescription || '').length}/160 characters</small>
            </div>

            <div className="form-group">
              <label>Meta Keywords</label>
              <input
                type="text"
                name="metaKeywords"
                value={formData.metaKeywords}
                onChange={handleChange}
                className="form-control"
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>Open Graph (Social Media)</legend>

            <div className="form-group">
              <label>OG Title</label>
              <input
                type="text"
                name="ogTitle"
                value={formData.ogTitle}
                onChange={handleChange}
                className="form-control"
                placeholder="Leave empty to use meta title"
              />
            </div>

            <div className="form-group">
              <label>OG Description</label>
              <textarea
                name="ogDescription"
                value={formData.ogDescription}
                onChange={handleChange}
                rows="2"
                className="form-control"
                placeholder="Description for social media"
              ></textarea>
            </div>

            <div className="form-group">
              <label>OG Image (Social Media Preview)</label>
              <div className="image-picker-wrapper">
                {formData.ogImage && (
                  <div className="image-preview">
                    <img src={formData.ogImage} alt="OG" className="preview-img" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, ogImage: '' })}
                      className="btn btn-sm btn-danger"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => openMediaLibrary('ogImage')}
                  className="btn btn-secondary"
                >
                  <FaImage /> Select Image from Library
                </button>
              </div>
              <small>Recommended: 1200x630px</small>
            </div>
          </fieldset>

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
              {saving ? 'Saving...' : 'Save Page'}
            </button>
            <button type="button" onClick={() => navigate('/admin/pages')} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default PageForm;

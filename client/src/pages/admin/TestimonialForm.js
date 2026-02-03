import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaImage } from 'react-icons/fa';
import HeroImagePicker from '../../components/HeroImagePicker';
import './Form.css';

const TestimonialForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    company: '',
    content: '',
    rating: 5,
    image: '',
    isActive: true,
    isFeatured: false
  });

  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaGroups, setMediaGroups] = useState([]);
  const [selectedMediaGroup, setSelectedMediaGroup] = useState('');
  const [loadingMedia, setLoadingMedia] = useState(false);

  const fetchTestimonial = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/testimonials/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData(res.data.data);
      setLoading(false);
    } catch (err) {
      toast.error('Error loading testimonial');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchTestimonial();
  }, [id, fetchTestimonial]);

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

  const openMediaLibrary = () => {
    fetchMediaGroups();
    fetchMediaFiles();
    setShowMediaLibrary(true);
    setSelectedMediaGroup('');
  };

  const handleSelectImage = (imageUrl) => {
    setFormData({ ...formData, image: imageUrl });
    setShowMediaLibrary(false);
    toast.success('Image selected');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (id) {
        await axios.put(`/api/testimonials/${id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Testimonial updated successfully');
      } else {
        await axios.post('/api/testimonials', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Testimonial created successfully');
      }
      navigate('/admin/testimonials');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving testimonial');
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
        <button onClick={() => navigate('/admin/testimonials')} className="back-btn">
          <FaArrowLeft /> Back to Testimonials
        </button>

        <form onSubmit={handleSubmit} className="form-container card">
          <h1>{id ? 'Edit Testimonial' : 'Create New Testimonial'}</h1>

          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-control" />
            </div>
            <div className="form-group">
              <label>Position</label>
              <input type="text" name="position" value={formData.position} onChange={handleChange} className="form-control" />
            </div>
          </div>

          <div className="form-group">
            <label>Company</label>
            <input type="text" name="company" value={formData.company} onChange={handleChange} className="form-control" />
          </div>

          <div className="form-group">
            <label>Testimonial Content *</label>
            <textarea name="content" value={formData.content} onChange={handleChange} required rows="5" className="form-control"></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Rating</label>
              <select name="rating" value={formData.rating} onChange={handleChange} className="form-control">
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>

            <div className="form-group">
              <label>Client Image</label>
              <div className="image-picker-wrapper">
                {formData.image && (
                  <div className="image-preview">
                    <img src={formData.image} alt="Client" className="preview-img" />
                    <button type="button" onClick={() => setFormData({ ...formData, image: '' })} className="btn btn-sm btn-danger">Remove</button>
                  </div>
                )}
                <button type="button" onClick={openMediaLibrary} className="btn btn-secondary">
                  <FaImage /> Select Image
                </button>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label"><input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />Active</label>
            </div>
            <div className="form-group">
              <label className="checkbox-label"><input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />Featured</label>
            </div>
          </div>

          {/* Media Library Modal */}
          {showMediaLibrary && (
            <>
              <div className="modal-overlay" onClick={() => setShowMediaLibrary(false)}></div>
              <div className="media-library-modal">
                <div className="modal-header">
                  <h3>Select Client Image</h3>
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
                              className={`media-library-item ${formData.image === file.url ? 'selected' : ''}`}
                              onClick={() => handleSelectImage(file.url)}
                              title={file.originalName}
                            >
                              <img src={imageUrl} alt={file.originalName} />
                              <div className="item-info">
                                <p className="item-name">{file.originalName}</p>
                                {formData.image === file.url && <span className="check-mark">✓</span>}
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
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Testimonial'}</button>
            <button type="button" onClick={() => navigate('/admin/testimonials')} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default TestimonialForm;

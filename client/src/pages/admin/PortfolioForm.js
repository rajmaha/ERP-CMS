import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import RichTextEditor from '../../components/RichTextEditor';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaImage } from 'react-icons/fa';
import HeroImagePicker from '../../components/HeroImagePicker';
import './Form.css';

const PortfolioForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    category: '',
    description: '',
    challenges: '',
    solutions: '',
    results: '',
    thumbnailImage: '',
    images: [],
    projectUrl: '',
    completedDate: '',
    isActive: true,
    isFeatured: false
  });

  // Media library state (same as ProductForm)
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaGroups, setMediaGroups] = useState([]);
  const [selectedMediaGroup, setSelectedMediaGroup] = useState('');
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [currentImageField, setCurrentImageField] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);

  const fetchItem = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/portfolio/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData(res.data.data);
      setLoading(false);
    } catch (err) {
      toast.error('Error loading portfolio');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchItem();
  }, [id, fetchItem]);

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
      setFormData({ ...formData, [currentImageField]: imageUrl });
      setShowMediaLibrary(false);
      toast.success('Image selected');
    }
  };

  const applyMultipleImages = () => {
    setFormData({ ...formData, images: selectedImages });
    setShowMediaLibrary(false);
    toast.success(`${selectedImages.length} images selected`);
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
        await axios.put(`/api/portfolio/${id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Portfolio updated successfully');
      } else {
        await axios.post('/api/portfolio', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Portfolio created successfully');
      }
      navigate('/admin/portfolio');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving portfolio');
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
        <button onClick={() => navigate('/admin/portfolio')} className="back-btn">
          <FaArrowLeft /> Back to Portfolio
        </button>

        <form onSubmit={handleSubmit} className="form-container card">
          <h1>{id ? 'Edit Portfolio' : 'Create New Portfolio'}</h1>

          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required className="form-control" />
            </div>
            <div className="form-group">
              <label>Client</label>
              <input type="text" name="client" value={formData.client} onChange={handleChange} className="form-control" />
            </div>
          </div>

          <div className="form-group">
            <label>Category</label>
            <input type="text" name="category" value={formData.category} onChange={handleChange} className="form-control" placeholder="e.g., Web Design, Branding" />
          </div>

          <div className="form-group">
            <label>Description</label>
            <RichTextEditor value={formData.description} onChange={(description) => setFormData({ ...formData, description })} placeholder="Project description" name="description" />
          </div>

          <div className="form-group">
            <label>Challenges</label>
            <RichTextEditor value={formData.challenges} onChange={(challenges) => setFormData({ ...formData, challenges })} placeholder="Challenges faced" name="challenges" />
          </div>

          <div className="form-group">
            <label>Solutions</label>
            <RichTextEditor value={formData.solutions} onChange={(solutions) => setFormData({ ...formData, solutions })} placeholder="Solutions provided" name="solutions" />
          </div>

          <div className="form-group">
            <label>Results</label>
            <RichTextEditor value={formData.results} onChange={(results) => setFormData({ ...formData, results })} placeholder="Project results" name="results" />
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
              <label>Project URL</label>
              <input type="url" name="projectUrl" value={formData.projectUrl} onChange={handleChange} className="form-control" />
            </div>
            <div className="form-group">
              <label>Completed Date</label>
              <input type="date" name="completedDate" value={formData.completedDate} onChange={handleChange} className="form-control" />
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
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Portfolio'}</button>
            <button type="button" onClick={() => navigate('/admin/portfolio')} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default PortfolioForm;

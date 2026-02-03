import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaImage, FaPlus, FaTrash } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../admin/Form.css';

const TutorialForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    featuredImage: '',
    category: '',
    subcategory: '',
    difficulty: 'beginner',
    duration: '',
    status: 'draft',
    videoType: 'none',
    videoUrl: '',
    videoId: '',
    tags: '',
    isActive: true,
    isFeatured: false,
    order: 0,
    codeExamples: [],
    relatedTutorials: []
  });

  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaGroups, setMediaGroups] = useState([]);
  const [selectedMediaGroup, setSelectedMediaGroup] = useState('');
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [currentImageField, setCurrentImageField] = useState('');

  const fetchItem = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/tutorials/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tutorial = res.data.data;
      setFormData({
        ...tutorial,
        tags: tutorial.tags ? tutorial.tags.join(', ') : '',
        relatedTutorials: tutorial.relatedTutorials || []
      });
      setLoading(false);
    } catch (err) {
      toast.error('Error loading tutorial');
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
      const res = await axios.get('/api/tutorials/categories/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const token = localStorage.getItem('token');
      // Get child categories of the selected parent
      const res = await axios.get(`/api/tutorials/categories/admin?parent=${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubcategories(res.data.data);
      setFormData(prev => ({ ...prev, subcategory: '' }));
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      setSubcategories([]);
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
      const params = new URLSearchParams({ limit: 200 });
      
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

  useEffect(() => {
    fetchCategories();
  }, []);

  const openMediaLibrary = (fieldName) => {
    setCurrentImageField(fieldName);
    fetchMediaGroups();
    fetchMediaFiles();
    setShowMediaLibrary(true);
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
    if (type === 'youtube') {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : '';
    } else if (type === 'vimeo') {
      const match = url.match(/vimeo\.com\/(\d+)/);
      return match ? match[1] : '';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };

    // Fetch subcategories when category changes
    if (name === 'category' && value) {
      fetchSubcategories(value);
    }

    // Auto-extract video ID
    if (name === 'videoUrl' || name === 'videoType') {
      const url = name === 'videoUrl' ? value : formData.videoUrl;
      const videoType = name === 'videoType' ? value : formData.videoType;
      
      if (url && videoType !== 'none') {
        const videoId = extractVideoId(url, videoType);
        newFormData.videoId = videoId;
      }
    }

    setFormData(newFormData);
  };

  const handleContentChange = (value) => {
    setFormData({ ...formData, content: value });
  };

  const addCodeExample = () => {
    setFormData({
      ...formData,
      codeExamples: [
        ...formData.codeExamples,
        { title: '', language: 'javascript', code: '' }
      ]
    });
  };

  const updateCodeExample = (idx, field, value) => {
    const updated = [...formData.codeExamples];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormData({ ...formData, codeExamples: updated });
  };

  const removeCodeExample = (idx) => {
    setFormData({
      ...formData,
      codeExamples: formData.codeExamples.filter((_, i) => i !== idx)
    });
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
        await axios.put(`/api/tutorials/${id}`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Tutorial updated successfully');
      } else {
        await axios.post('/api/tutorials', submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Tutorial created successfully');
      }

      navigate('/admin/tutorials');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving tutorial');
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
        <button onClick={() => navigate('/admin/tutorials')} className="back-btn">
          <FaArrowLeft /> Back to Tutorials
        </button>

        <form onSubmit={handleSubmit} className="form-container card">
          <h1>{id ? 'Edit Tutorial' : 'Add New Tutorial'}</h1>

          <div className="form-row">
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
              <label>Difficulty *</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="form-control"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="form-row">
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

            <div className="form-group">
              <label>Subcategory (Optional)</label>
              <select
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="form-control"
                disabled={!formData.category}
              >
                <option value="">Select Subcategory</option>
                {subcategories.map(subcat => (
                  <option key={subcat._id} value={subcat._id}>
                    {subcat.icon} {subcat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div></div>
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              placeholder="Brief description of the tutorial"
            />
          </div>

          <div className="form-group">
            <label>Featured Image</label>
            <div className="image-picker-wrapper">
              {formData.featuredImage && (
                <div className="image-preview">
                  <img src={formData.featuredImage} alt="Preview" className="preview-img" />
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
                <FaImage /> Select Image
              </button>
            </div>
          </div>

          {/* Video Section */}
          <div className="section-divider">
            <h3>Video (Optional)</h3>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Video Platform</label>
              <select
                name="videoType"
                value={formData.videoType}
                onChange={handleChange}
                className="form-control"
              >
                <option value="none">None</option>
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
              </select>
            </div>

            <div className="form-group">
              <label>Video URL</label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                className="form-control"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
          </div>

          {/* Content Editor */}
          <div className="form-group">
            <label>Content *</label>
            <ReactQuill
              value={formData.content}
              onChange={handleContentChange}
              theme="snow"
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  ['blockquote', 'code-block'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['link', 'image'],
                  ['clean']
                ]
              }}
            />
          </div>

          {/* Code Examples */}
          <div className="section-divider">
            <h3>Code Examples</h3>
          </div>

          {formData.codeExamples.map((example, idx) => (
            <div key={idx} className="code-example-form card">
              <div className="form-row">
                <div className="form-group">
                  <label>Example Title</label>
                  <input
                    type="text"
                    value={example.title}
                    onChange={(e) => updateCodeExample(idx, 'title', e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Language</label>
                  <select
                    value={example.language}
                    onChange={(e) => updateCodeExample(idx, 'language', e.target.value)}
                    className="form-control"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="sql">SQL</option>
                    <option value="php">PHP</option>
                    <option value="java">Java</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Code</label>
                <textarea
                  value={example.code}
                  onChange={(e) => updateCodeExample(idx, 'code', e.target.value)}
                  rows="8"
                  className="form-control"
                />
              </div>

              <button
                type="button"
                onClick={() => removeCodeExample(idx)}
                className="btn btn-sm btn-danger"
              >
                <FaTrash /> Remove Example
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addCodeExample}
            className="btn btn-secondary"
          >
            <FaPlus /> Add Code Example
          </button>

          {/* Metadata */}
          <div className="section-divider">
            <h3>Metadata & Settings</h3>
          </div>

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="form-control"
              placeholder="javascript, web development, tutorial"
            />
          </div>

          <div className="form-row">
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
                      >
                        {group.icon} {group.name}
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
                            >
                              <img src={imageUrl} alt={file.originalName} />
                              <div className="item-info">
                                <p className="item-name">{file.originalName}</p>
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
              {saving ? 'Saving...' : 'Save Tutorial'}
            </button>
            <button type="button" onClick={() => navigate('/admin/tutorials')} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default TutorialForm;

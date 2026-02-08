import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { FaImage, FaTimes, FaUpload, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './HeroImagePicker.css';

const HeroImagePicker = ({ value, onChange, label }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaGroups, setMediaGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (showPicker) {
      fetchMediaGroups();
      fetchMediaFiles();
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal closes
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPicker]);

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
      setLoading(true);
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
      setLoading(false);
    } catch (err) {
      console.error('Error fetching media:', err);
      setLoading(false);
    }
  };

  const handleSelectImage = (imageUrl) => {
    onChange(imageUrl);
    setShowPicker(false);
  };

  const handleRemoveImage = () => {
    onChange('');
  };

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      
      if (selectedGroup && selectedGroup !== '') {
        formData.append('group', selectedGroup);
      }

      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      };

      const res = await axios.post('/api/media/upload', formData, config);
      
      if (res.data.success) {
        toast.success('Image uploaded successfully');
        setUploadProgress(0);
        setUploading(false);
        
        // Refresh media files
        await fetchMediaFiles(selectedGroup || null);
        
        // Auto-select the uploaded image
        handleSelectImage(res.data.data.url);
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || 'Error uploading image');
      setUploadProgress(0);
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    handleUpload(files);
    // Reset input
    e.target.value = null;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleUpload(files);
    }
  };

  const renderGroupIcon = (icon) => {
    if (!icon) return '📁';
    if (/^[\p{Emoji}]+$/u.test(icon)) return icon;
    if (icon && !icon.includes('emoji')) return <i className={`fas fa-${icon}`}></i>;
    return icon;
  };

  return (
    <div className="hero-image-picker">
      {label && <label className="picker-label">{label}</label>}
      
      {value ? (
        <div className="selected-image">
          <img src={value} alt="Selected" />
          <div className="image-actions">
            <button type="button" onClick={() => setShowPicker(true)} className="btn btn-secondary btn-sm">
              <FaImage /> Change Image
            </button>
            <button type="button" onClick={handleRemoveImage} className="btn btn-danger btn-sm">
              <FaTimes /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setShowPicker(true)} className="btn btn-secondary">
          <FaImage /> Select Image
        </button>
      )}

      {showPicker && ReactDOM.createPortal(
        <>
          <div className="picker-overlay" onClick={() => setShowPicker(false)}></div>
          <div className="picker-modal">
            <div className="picker-header">
              <h3>Select Image</h3>
              <button type="button" onClick={() => setShowPicker(false)} className="close-btn">
                <FaTimes />
              </button>
            </div>

            <div className="picker-body">
              <div className="picker-sidebar">
                <h4>Media Groups</h4>
                <button
                  type="button"
                  className={`group-btn ${selectedGroup === '' ? 'active' : ''}`}
                  onClick={() => { setSelectedGroup(''); fetchMediaFiles(null); }}
                >
                  <span className="group-icon">📁</span>
                  <span>All Media</span>
                </button>
                {mediaGroups.map(group => (
                  <button
                    key={group._id}
                    type="button"
                    className={`group-btn ${selectedGroup === group._id ? 'active' : ''}`}
                    onClick={() => { setSelectedGroup(group._id); fetchMediaFiles(group._id); }}
                    style={{ borderLeftColor: group.color }}
                  >
                    <span className="group-icon">{renderGroupIcon(group.icon)}</span>
                    <span>{group.name}</span>
                  </button>
                ))}
              </div>

              <div className="picker-content">
                <div className="upload-area">
                  <input
                    type="file"
                    id="image-upload-input"
                    onChange={handleFileInputChange}
                    accept="image/*"
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="image-upload-input"
                    className={`upload-zone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {uploading ? (
                      <div className="upload-progress">
                        <FaUpload className="upload-icon animating" />
                        <p>Uploading... {uploadProgress}%</p>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                      </div>
                    ) : (
                      <div className="upload-content">
                        <FaUpload className="upload-icon" />
                        <p><strong>Drag and drop your image here</strong></p>
                        <p className="upload-hint">or click to browse</p>
                        <p className="upload-file-types">PNG, JPG, GIF up to 50MB</p>
                      </div>
                    )}
                  </label>
                </div>

                {loading ? (
                  <p className="loading-text">Loading images...</p>
                ) : mediaFiles.length > 0 ? (
                  <div className="images-grid">
                    {mediaFiles.map(file => {
                      const imageUrl = file.url.startsWith('/uploads') ? file.url : `/uploads/${file.url}`;
                      const isSelected = value === file.url;
                      return (
                        <button
                          key={file._id}
                          type="button"
                          className={`image-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelectImage(file.url)}
                          title={file.originalName}
                        >
                          <img src={imageUrl} alt={file.originalName} />
                          <div className="item-overlay">
                            {isSelected && <FaCheck className="check-icon" />}
                            <span>{file.originalName}</span>
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
        </>,
        document.body
      )}
    </div>
  );
};

export default HeroImagePicker;

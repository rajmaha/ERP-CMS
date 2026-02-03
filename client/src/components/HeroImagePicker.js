import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { FaImage, FaTimes } from 'react-icons/fa';
import './HeroImagePicker.css';

const HeroImagePicker = ({ value, onChange, label }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaGroups, setMediaGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [loading, setLoading] = useState(false);

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
                {loading ? (
                  <p className="loading-text">Loading images...</p>
                ) : mediaFiles.length > 0 ? (
                  <div className="images-grid">
                    {mediaFiles.map(file => {
                      const imageUrl = file.url.startsWith('/uploads') ? file.url : `/uploads/${file.url}`;
                      return (
                        <button
                          key={file._id}
                          type="button"
                          className="image-item"
                          onClick={() => handleSelectImage(file.url)}
                          title={file.originalName}
                        >
                          <img src={imageUrl} alt={file.originalName} />
                          <div className="item-overlay">
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

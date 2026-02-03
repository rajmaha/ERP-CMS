import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ImagePicker = ({ value, onChange, onClose }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [mediaGroups, setMediaGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMediaGroups();
  }, []);

  const fetchMediaGroups = async () => {
    try {
      const response = await axios.get('/api/media/groups');
      setMediaGroups(response.data);
    } catch (error) {
      console.error('Error fetching media groups:', error);
    }
  };

  const fetchMediaFiles = async (groupId) => {
    setLoading(true);
    try {
      const response = await axios.get('/api/media/files', {
        params: { groupId }
      });
      setMediaFiles(response.data);
    } catch (error) {
      console.error('Error fetching media files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectImage = (url) => {
    onChange(url);
    setShowPicker(false);
  };

  const renderGroupIcon = (icon) => {
    switch (icon) {
      case 'folder':
        return '📁';
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      default:
        return '📂';
    }
  };

  return (
    <div className="image-picker-component">
      <button type="button" className="open-picker-btn" onClick={() => setShowPicker(true)}>
        Select Image
      </button>

      {showPicker && (
        <>
          <div className="image-picker-overlay" onClick={() => setShowPicker(false)}></div>
          <div className="image-picker-dropdown-large">
            <div className="image-picker-header">
              <h4>Select Image</h4>
              <button type="button" className="close-modal-btn" onClick={() => setShowPicker(false)}>✕</button>
            </div>
            
            <div className="image-picker-body">
              <div className="image-picker-sidebar">
                <h5>Media Groups</h5>
                <button
                  type="button"
                  className={`group-filter-btn ${selectedGroup === '' ? 'active' : ''}`}
                  onClick={() => { setSelectedGroup(''); fetchMediaFiles(null); }}
                >
                  <span className="group-icon">📁</span>
                  <span>All Media</span>
                </button>
                {mediaGroups.map(group => (
                  <button
                    key={group._id}
                    type="button"
                    className={`group-filter-btn ${selectedGroup === group._id ? 'active' : ''}`}
                    onClick={() => { setSelectedGroup(group._id); fetchMediaFiles(group._id); }}
                    style={{ borderLeftColor: group.color }}
                  >
                    <span className="group-icon">{renderGroupIcon(group.icon)}</span>
                    <span>{group.name}</span>
                  </button>
                ))}
              </div>

              <div className="image-picker-content">
                {loading ? (
                  <p className="loading-msg">Loading images...</p>
                ) : (
                  <>
                    <div className="image-picker-grid-large">
                      {mediaFiles.map(file => (
                        <button
                          key={file._id}
                          type="button"
                          className={`image-option ${value === file.url ? 'selected' : ''}`}
                          onClick={() => handleSelectImage(file.url)}
                          title={file.originalName}
                        >
                          <img src={file.url} alt={file.originalName} />
                        </button>
                      ))}
                    </div>
                    {mediaFiles.length === 0 && (
                      <p className="empty-msg">No images found in this group</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ImagePicker;
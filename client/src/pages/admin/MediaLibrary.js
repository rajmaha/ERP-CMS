import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import IconPicker from '../../components/IconPicker';
import { toast } from 'react-toastify';
import { FaTrash, FaPlus, FaImage, FaVideo, FaFile, FaSearch, FaFolder, FaEdit, FaTimes } from 'react-icons/fa';
import './MediaLibrary.css';

const MediaLibrary = () => {
  const [media, setMedia] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileType, setFileType] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [uploadData, setUploadData] = useState({
    file: null,
    description: '',
    tags: '',
    group: ''
  });
  const [groupData, setGroupData] = useState({
    name: '',
    description: '',
    icon: '📁',
    color: '#667eea'
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchMedia = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      let query = '';
      if (selectedGroup) query += `?group=${selectedGroup}`;
      if (fileType && fileType !== 'all') {
        query += `${query ? '&' : '?'}fileType=${fileType}`;
      }

      const res = await axios.get(`/api/media/admin${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMedia(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching media:', err);
      setLoading(false);
    }
  }, [selectedGroup, fileType]);

  useEffect(() => {
    fetchGroups();
    fetchMedia();
  }, [selectedGroup, fileType, fetchMedia]);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/media/groups/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(res.data.data);
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  const handleSaveGroup = async (e) => {
    e.preventDefault();
    
    if (!groupData.name.trim()) {
      toast.error('Please enter group name');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (editingGroupId) {
        await axios.put(`/api/media/groups/${editingGroupId}`, groupData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Group updated successfully');
      } else {
        await axios.post('/api/media/groups', groupData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Group created successfully');
      }

      setGroupData({ name: '', description: '', icon: '📁', color: '#667eea' });
      setEditingGroupId(null);
      setShowGroupForm(false);
      setPage(1);
      setSelectedGroup('');
      
      // Fetch updated groups and media
      await fetchGroups();
      await fetchMedia();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving group');
    }
  };

  const handleDeleteGroup = async (id) => {
    if (window.confirm('Are you sure? Media in this group will be unassigned.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/media/groups/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGroups(groups.filter(g => g._id !== id));
        setSelectedGroup('');
        setPage(1);
        await fetchMedia();
        toast.success('Group deleted successfully');
      } catch (err) {
        toast.error('Error deleting group');
      }
    }
  };

  const handleEditGroup = (group) => {
    setGroupData(group);
    setEditingGroupId(group._id);
    setShowGroupForm(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File size exceeds 100MB limit');
        return;
      }
      setUploadData({ ...uploadData, file });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadData.file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('description', uploadData.description);
      formData.append('tags', uploadData.tags);
      if (uploadData.group) {
        formData.append('group', uploadData.group);
      }

      await axios.post('/api/media/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('File uploaded successfully');
      setUploadData({ file: null, description: '', tags: '', group: '' });
      setShowUploadForm(false);
      setPage(1);
      await fetchMedia();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this media?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/media/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMedia(media.filter(m => m._id !== id));
        toast.success('Media deleted successfully');
      } catch (err) {
        toast.error('Error deleting media');
      }
    }
  };

  const renderGroupIcon = (icon) => {
    if (!icon) return '📁';
    
    if (/^[\p{Emoji}]+$/u.test(icon)) {
      return icon;
    }
    
    if (icon && !icon.includes('emoji')) {
      return <i className={`fas fa-${icon}`}></i>;
    }
    
    return icon;
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image':
        return <FaImage />;
      case 'video':
        return <FaVideo />;
      case 'document':
        return <FaFile />;
      default:
        return <FaFile />;
    }
  };

  const getPreview = (item) => {
    if (item.fileType === 'image') {
      return <img src={item.url} alt={item.originalName} className="media-preview" />;
    } else if (item.fileType === 'video') {
      return (
        <video className="media-preview" controls>
          <source src={item.url} type={item.mimeType} />
          Your browser doesn't support video playback
        </video>
      );
    } else {
      return (
        <div className="media-document">
          <FaFile />
          <p>{item.originalName}</p>
        </div>
      );
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <h1>Media Library</h1>
          <div className="header-actions">
            <button onClick={() => setShowGroupForm(!showGroupForm)} className="btn btn-secondary">
              <FaFolder /> {editingGroupId ? 'Cancel' : 'New Group'}
            </button>
            <button onClick={() => setShowUploadForm(!showUploadForm)} className="btn btn-primary">
              <FaPlus /> Upload Media
            </button>
          </div>
        </header>

        {showGroupForm && (
          <div className="upload-form card">
            <h2>{editingGroupId ? 'Edit Group' : 'Create New Group'}</h2>
            <form onSubmit={handleSaveGroup}>
              <div className="form-row">
                <div className="form-group">
                  <label>Group Name *</label>
                  <input
                    type="text"
                    value={groupData.name}
                    onChange={(e) => setGroupData({ ...groupData, name: e.target.value })}
                    className="form-control"
                    placeholder="e.g., Product Images, Videos, Documents"
                    required
                  />
                </div>

                <IconPicker
                  value={groupData.icon}
                  onChange={(icon) => setGroupData({ ...groupData, icon })}
                  label="Icon"
                />

                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="color"
                    value={groupData.color}
                    onChange={(e) => setGroupData({ ...groupData, color: e.target.value })}
                    className="form-control form-color"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={groupData.description}
                  onChange={(e) => setGroupData({ ...groupData, description: e.target.value })}
                  rows="2"
                  className="form-control"
                  placeholder="Optional description"
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingGroupId ? 'Update Group' : 'Create Group'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowGroupForm(false);
                    setEditingGroupId(null);
                    setGroupData({ name: '', description: '', icon: '📁', color: '#667eea' });
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {showUploadForm && (
          <div className="upload-form card">
            <h2>Upload Media File</h2>
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label>Select File (Image, Video, or Document) *</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                  className="form-control"
                  required
                />
                <small>Max size: 100MB. Supported: JPG, PNG, MP4, PDF, DOC, XLS, etc.</small>
              </div>

              <div className="form-group">
                <label>Group</label>
                <select value={uploadData.group} onChange={(e) => setUploadData({ ...uploadData, group: e.target.value })} className="form-control">
                  <option value="">No Group</option>
                  {groups.map(group => (
                    <option key={group._id} value={group._id}>
                      {group.icon} {group.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  rows="3"
                  className="form-control"
                  placeholder="Optional description for this file"
                ></textarea>
              </div>

              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={uploadData.tags}
                  onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                  className="form-control"
                  placeholder="e.g. product, banner, testimonial"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload File'}
                </button>
                <button type="button" onClick={() => setShowUploadForm(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {groups.length > 0 && (
          <div className="groups-section card">
            <h2>Groups ({groups.length})</h2>
            <div className="groups-grid">
              {groups.map(group => (
                <div key={group._id} className="group-card" style={{ borderLeftColor: group.color }}>
                  <div className="group-header">
                    <span className="group-icon">
                      {renderGroupIcon(group.icon)}
                    </span>
                    <h4>{group.name}</h4>
                  </div>
                  {group.description && <p className="group-description">{group.description}</p>}
                  <div className="group-actions">
                    <button
                      onClick={() => {
                        setSelectedGroup(group._id);
                        setPage(1);
                      }}
                      className={`btn btn-sm ${selectedGroup === group._id ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      View
                    </button>
                    <button onClick={() => handleEditGroup(group)} className="btn btn-sm btn-secondary">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDeleteGroup(group._id)} className="btn btn-sm btn-danger">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="media-filters card">
          <div className="filter-group">
            <label>Filter by Type:</label>
            <select value={fileType} onChange={(e) => { setFileType(e.target.value); setPage(1); }} className="form-control">
              <option value="">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Search:</label>
            <div className="search-input">
              <FaSearch />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search media files..."
                className="form-control"
              />
            </div>
          </div>

          {selectedGroup && (
            <button
              onClick={() => { setSelectedGroup(''); setPage(1); }}
              className="btn btn-secondary"
            >
              <FaTimes /> Clear Group Filter
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading">Loading media...</div>
        ) : media.length > 0 ? (
          <>
            <div className="media-grid">
              {media.map(item => (
                <div key={item._id} className="media-card card">
                  <div className="media-item">
                    {getPreview(item)}
                  </div>

                  <div className="media-info">
                    <div className="media-header">
                      <span className="file-icon">{getFileIcon(item.fileType)}</span>
                      <h4 title={item.originalName}>{item.originalName}</h4>
                    </div>

                    <p className="file-details">
                      {formatFileSize(item.size)} • {item.fileType}
                    </p>

                    {item.group && (
                      <p className="file-group">
                        <FaFolder /> {item.group.icon} {item.group.name}
                      </p>
                    )}

                    {item.description && <p className="file-description">{item.description}</p>}

                    {item.tags && item.tags.length > 0 && (
                      <div className="file-tags">
                        {item.tags.map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}

                    <p className="file-date">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>

                    <div className="media-actions">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.url);
                          toast.success('URL copied to clipboard');
                        }}
                        className="btn btn-sm btn-secondary"
                      >
                        Copy URL
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="btn btn-sm btn-danger"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="btn btn-secondary"
                >
                  Previous
                </button>

                <span className="page-info">
                  Page {page} of {pages} ({total} total)
                </span>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pages}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state card">
            <p>
              {selectedGroup ? 'No media in this group.' : 'No media files yet. Upload your first file to get started.'}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default MediaLibrary;

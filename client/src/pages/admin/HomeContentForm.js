import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import RichTextEditor from '../../components/RichTextEditor';
import IconPicker from '../../components/IconPicker';
import HeroImagePicker from '../../components/HeroImagePicker';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaSave, FaImage, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import './Form.css';

const HomeContentForm = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    heroTitle: '',
    heroSubtitle: '',
    heroImage: '',
    heroDescription: '',
    sectionTitles: {
      whyChooseUs: 'Why Choose Us',
      commitments: 'Our Commitments'
    },
    whyChooseUs: [],
    commitments: [],
    statistics: [],
    ctaTitle: '',
    ctaDescription: '',
    ctaButtonText: '',
    ctaButtonLink: '',
    sections: []
  });

  // Media library state
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaGroups, setMediaGroups] = useState([]);
  const [selectedMediaGroup, setSelectedMediaGroup] = useState('');
  const [loadingMedia, setLoadingMedia] = useState(false);

  // New item states
  const [newWhyItem, setNewWhyItem] = useState({ icon: '🚀', title: '', description: '' });
  const [newCommitment, setNewCommitment] = useState({ number: '01', title: '', description: '' });
  const [newStat, setNewStat] = useState({ number: '', label: '' });

  const fetchHomeContent = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/pages/home-content', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.data) {
        setFormData({
          ...res.data.data,
          sectionTitles: {
            whyChooseUs: 'Why Choose Us',
            commitments: 'Our Commitments',
            ...res.data.data.sectionTitles
          },
          whyChooseUs: res.data.data.whyChooseUs || [],
          commitments: res.data.data.commitments || [],
          statistics: res.data.data.statistics || [],
          sections: res.data.data.sections || [],
          heroDescription: res.data.data.heroDescription || ''
        });
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching home content:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeContent();
  }, [fetchHomeContent]);

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
    setFormData({ ...formData, heroImage: imageUrl });
    setShowMediaLibrary(false);
    toast.success('Image selected');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('sectionTitles.')) {
      const titleKey = name.split('.')[1];
      setFormData({
        ...formData,
        sectionTitles: {
          ...formData.sectionTitles,
          [titleKey]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Why Choose Us functions
  const addWhyChooseUs = () => {
    if (newWhyItem.icon && newWhyItem.title && newWhyItem.description) {
      setFormData({
        ...formData,
        whyChooseUs: [...formData.whyChooseUs, { ...newWhyItem, order: formData.whyChooseUs.length }]
      });
      setNewWhyItem({ icon: '🚀', title: '', description: '' });
    } else {
      toast.error('Please fill in all fields for "Why Choose Us"');
    }
  };

  const removeWhyChooseUs = (index) => {
    setFormData({
      ...formData,
      whyChooseUs: formData.whyChooseUs.filter((_, i) => i !== index)
    });
  };

  const moveWhyUp = (index) => {
    if (index === 0) return;
    const updated = [...formData.whyChooseUs];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    updated.forEach((item, i) => { item.order = i; });
    setFormData({ ...formData, whyChooseUs: updated });
  };

  const moveWhyDown = (index) => {
    if (index === formData.whyChooseUs.length - 1) return;
    const updated = [...formData.whyChooseUs];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    updated.forEach((item, i) => { item.order = i; });
    setFormData({ ...formData, whyChooseUs: updated });
  };

  // Commitments functions
  const addCommitment = () => {
    if (newCommitment.number && newCommitment.title && newCommitment.description) {
      setFormData({
        ...formData,
        commitments: [...formData.commitments, { ...newCommitment, order: formData.commitments.length }]
      });
      setNewCommitment({ number: `0${formData.commitments.length + 2}`, title: '', description: '' });
    } else {
      toast.error('Please fill in all commitment fields');
    }
  };

  const removeCommitment = (index) => {
    setFormData({
      ...formData,
      commitments: formData.commitments.filter((_, i) => i !== index)
    });
  };

  const moveCommitmentUp = (index) => {
    if (index === 0) return;
    const updated = [...formData.commitments];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    updated.forEach((item, i) => { item.order = i; });
    setFormData({ ...formData, commitments: updated });
  };

  const moveCommitmentDown = (index) => {
    if (index === formData.commitments.length - 1) return;
    const updated = [...formData.commitments];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    updated.forEach((item, i) => { item.order = i; });
    setFormData({ ...formData, commitments: updated });
  };

  // Statistics functions
  const addStatistic = () => {
    if (newStat.number && newStat.label) {
      setFormData({
        ...formData,
        statistics: [...formData.statistics, { ...newStat, order: formData.statistics.length }]
      });
      setNewStat({ number: '', label: '' });
    }
  };

  const removeStatistic = (index) => {
    setFormData({
      ...formData,
      statistics: formData.statistics.filter((_, i) => i !== index)
    });
  };

  // Additional Sections
  const addSection = () => {
    setFormData({
      ...formData,
      sections: [...formData.sections, { title: '', content: '', order: formData.sections.length }]
    });
  };

  const updateSection = (index, field, value) => {
    const updatedSections = [...formData.sections];
    updatedSections[index][field] = value;
    setFormData({ ...formData, sections: updatedSections });
  };

  const removeSection = (index) => {
    const updatedSections = formData.sections.filter((_, i) => i !== index);
    setFormData({ ...formData, sections: updatedSections });
  };

  const moveSectionUp = (index) => {
    if (index === 0) return;
    const updatedSections = [...formData.sections];
    [updatedSections[index - 1], updatedSections[index]] = [updatedSections[index], updatedSections[index - 1]];
    updatedSections.forEach((section, i) => { section.order = i; });
    setFormData({ ...formData, sections: updatedSections });
  };

  const moveSectionDown = (index) => {
    if (index === formData.sections.length - 1) return;
    const updatedSections = [...formData.sections];
    [updatedSections[index], updatedSections[index + 1]] = [updatedSections[index + 1], updatedSections[index]];
    updatedSections.forEach((section, i) => { section.order = i; });
    setFormData({ ...formData, sections: updatedSections });
  };

  const handleSaveContent = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/pages/home-content', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Home content saved successfully');
      fetchHomeContent();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving content');
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
        <header className="admin-header">
          <h1>Home Page Content</h1>
        </header>

        <form onSubmit={handleSaveContent} className="form-container card">
          {/* Hero Section */}
          <fieldset className="form-section">
            <legend>Hero Section</legend>

            <div className="form-group">
              <label>Hero Title *</label>
              <input
                type="text"
                name="heroTitle"
                value={formData.heroTitle}
                onChange={handleChange}
                required
                className="form-control"
                placeholder="Welcome to ERP CMS"
              />
            </div>

            <div className="form-group">
              <label>Hero Subtitle</label>
              <textarea
                name="heroSubtitle"
                value={formData.heroSubtitle}
                onChange={handleChange}
                rows="2"
                className="form-control"
                placeholder="Your Complete Business Management Solution"
              ></textarea>
            </div>

            <div className="form-group">
              <label>Hero Background Image</label>
              <HeroImagePicker
                value={formData.heroImage}
                onChange={(url) => setFormData({ ...formData, heroImage: url })}
                label=""
              />
            </div>

            <div className="form-group">
              <label>Hero Description</label>
              <RichTextEditor
                value={formData.heroDescription}
                onChange={(content) => setFormData({ ...formData, heroDescription: content })}
                placeholder="Enter hero section description..."
              />
            </div>
          </fieldset>

          {/* Why Choose Us Section */}
          <fieldset className="form-section">
            <legend>Why Choose Us Section</legend>

            <div className="form-group">
              <label>Section Title</label>
              <input
                type="text"
                name="sectionTitles.whyChooseUs"
                value={formData.sectionTitles?.whyChooseUs || 'Why Choose Us'}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            {formData.whyChooseUs.length > 0 && (
              <div className="items-list">
                {formData.whyChooseUs.map((item, index) => (
                  <div key={index} className="list-item card" style={{ marginBottom: '1rem', padding: '1.5rem', background: 'var(--bg-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '2rem' }}>{item.icon}</span>
                        <div>
                          <strong>{item.title}</strong>
                          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-light)', fontSize: '0.875rem' }}>{item.description}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="button" onClick={() => moveWhyUp(index)} disabled={index === 0} className="btn btn-sm btn-secondary">
                          <FaArrowUp />
                        </button>
                        <button type="button" onClick={() => moveWhyDown(index)} disabled={index === formData.whyChooseUs.length - 1} className="btn btn-sm btn-secondary">
                          <FaArrowDown />
                        </button>
                        <button type="button" onClick={() => removeWhyChooseUs(index)} className="btn btn-sm btn-danger">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="add-item" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem' }}>
              <h4>Add New Feature</h4>
              <IconPicker value={newWhyItem.icon} onChange={(icon) => setNewWhyItem({ ...newWhyItem, icon })} label="Icon" />
              <div className="form-group">
                <label>Title</label>
                <input type="text" value={newWhyItem.title} onChange={(e) => setNewWhyItem({ ...newWhyItem, title: e.target.value })} placeholder="Fast & Reliable" className="form-control" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={newWhyItem.description} onChange={(e) => setNewWhyItem({ ...newWhyItem, description: e.target.value })} placeholder="Lightning-fast performance..." rows="2" className="form-control"></textarea>
              </div>
              <button type="button" onClick={addWhyChooseUs} className="btn btn-secondary">
                <FaPlus /> Add Feature
              </button>
            </div>
          </fieldset>

          {/* Our Commitments Section */}
          <fieldset className="form-section">
            <legend>Our Commitments Section</legend>

            <div className="form-group">
              <label>Section Title</label>
              <input
                type="text"
                name="sectionTitles.commitments"
                value={formData.sectionTitles?.commitments || 'Our Commitments'}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            {formData.commitments.length > 0 && (
              <div className="items-list">
                {formData.commitments.map((item, index) => (
                  <div key={index} className="list-item card" style={{ marginBottom: '1rem', padding: '1.5rem', background: 'var(--bg-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'rgba(102, 126, 234, 0.5)' }}>{item.number}</div>
                        <div>
                          <strong>{item.title}</strong>
                          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-light)', fontSize: '0.875rem' }}>{item.description}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="button" onClick={() => moveCommitmentUp(index)} disabled={index === 0} className="btn btn-sm btn-secondary">
                          <FaArrowUp />
                        </button>
                        <button type="button" onClick={() => moveCommitmentDown(index)} disabled={index === formData.commitments.length - 1} className="btn btn-sm btn-secondary">
                          <FaArrowDown />
                        </button>
                        <button type="button" onClick={() => removeCommitment(index)} className="btn btn-sm btn-danger">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="add-item" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem' }}>
              <h4>Add New Commitment</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Number</label>
                  <input type="text" value={newCommitment.number} onChange={(e) => setNewCommitment({ ...newCommitment, number: e.target.value })} placeholder="01" className="form-control" />
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" value={newCommitment.title} onChange={(e) => setNewCommitment({ ...newCommitment, title: e.target.value })} placeholder="Quality First" className="form-control" />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={newCommitment.description} onChange={(e) => setNewCommitment({ ...newCommitment, description: e.target.value })} placeholder="Describe our commitment..." rows="2" className="form-control"></textarea>
              </div>
              <button type="button" onClick={addCommitment} className="btn btn-secondary">
                <FaPlus /> Add Commitment
              </button>
            </div>
          </fieldset>

          {/* Statistics Section */}
          <fieldset className="form-section">
            <legend>Statistics Section</legend>

            {formData.statistics.length > 0 && (
              <div className="stats-preview" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                {formData.statistics.map((stat, index) => (
                  <div key={index} className="stat-card" style={{ background: 'var(--primary-color)', color: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', position: 'relative' }}>
                    <button type="button" onClick={() => removeStatistic(index)} className="btn btn-sm btn-danger" style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
                      <FaTrash />
                    </button>
                    <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stat.number}</div>
                    <div style={{ fontSize: '1rem' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="add-item" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem' }}>
              <h4>Add New Statistic</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Number/Value</label>
                  <input type="text" value={newStat.number} onChange={(e) => setNewStat({ ...newStat, number: e.target.value })} placeholder="10K+" className="form-control" />
                </div>
                <div className="form-group">
                  <label>Label</label>
                  <input type="text" value={newStat.label} onChange={(e) => setNewStat({ ...newStat, label: e.target.value })} placeholder="Happy Clients" className="form-control" />
                </div>
              </div>
              <button type="button" onClick={addStatistic} className="btn btn-secondary">
                <FaPlus /> Add Statistic
              </button>
            </div>
          </fieldset>

          {/* CTA Section */}
          <fieldset className="form-section">
            <legend>Call-to-Action Section</legend>

            <div className="form-group">
              <label>CTA Title</label>
              <input type="text" name="ctaTitle" value={formData.ctaTitle} onChange={handleChange} placeholder="Ready to Get Started?" className="form-control" />
            </div>

            <div className="form-group">
              <label>CTA Description</label>
              <RichTextEditor
                value={formData.ctaDescription}
                onChange={(content) => setFormData({ ...formData, ctaDescription: content })}
                placeholder="Enter CTA description..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Button Text</label>
                <input type="text" name="ctaButtonText" value={formData.ctaButtonText} onChange={handleChange} placeholder="Contact Us Now" className="form-control" />
              </div>
              <div className="form-group">
                <label>Button Link</label>
                <input type="text" name="ctaButtonLink" value={formData.ctaButtonLink} onChange={handleChange} placeholder="/contact" className="form-control" />
              </div>
            </div>
          </fieldset>

          {/* Additional Sections */}
          <fieldset className="form-section">
            <legend>
              Additional Custom Sections
              <button type="button" onClick={addSection} className="btn btn-sm btn-primary" style={{ marginLeft: '1rem' }}>
                <FaPlus /> Add Section
              </button>
            </legend>

            {formData.sections.length === 0 && (
              <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '2rem' }}>
                No custom sections added.
              </p>
            )}

            {formData.sections.map((section, index) => (
              <div key={index} className="section-item card" style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'var(--bg-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3>Section {index + 1}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" onClick={() => moveSectionUp(index)} disabled={index === 0} className="btn btn-sm btn-secondary">
                      <FaArrowUp />
                    </button>
                    <button type="button" onClick={() => moveSectionDown(index)} disabled={index === formData.sections.length - 1} className="btn btn-sm btn-secondary">
                      <FaArrowDown />
                    </button>
                    <button type="button" onClick={() => removeSection(index)} className="btn btn-sm btn-danger">
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Section Title</label>
                  <input type="text" value={section.title} onChange={(e) => updateSection(index, 'title', e.target.value)} className="form-control" placeholder="Section Title" />
                </div>

                <div className="form-group">
                  <label>Section Content</label>
                  <RichTextEditor value={section.content} onChange={(content) => updateSection(index, 'content', content)} placeholder="Section content..." name={`section-content-${index}`} />
                </div>
              </div>
            ))}
          </fieldset>

          {/* Media Library Modal */}
          {showMediaLibrary && (
            <>
              <div className="modal-overlay" onClick={() => setShowMediaLibrary(false)}></div>
              <div className="media-library-modal">
                <div className="modal-header">
                  <h3>Select Hero Image</h3>
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
                              className={`media-library-item ${formData.heroImage === file.url ? 'selected' : ''}`}
                              onClick={() => handleSelectImage(file.url)}
                              title={file.originalName}
                            >
                              <img src={imageUrl} alt={file.originalName} />
                              <div className="item-info">
                                <p className="item-name">{file.originalName}</p>
                                {formData.heroImage === file.url && <span className="check-mark">✓</span>}
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
              <FaSave /> {saving ? 'Saving...' : 'Save Home Content'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default HomeContentForm;

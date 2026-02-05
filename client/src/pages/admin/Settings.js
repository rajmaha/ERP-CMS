import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import { FaImage } from 'react-icons/fa';
import './Admin.css';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    logo: '',
    favicon: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    adminEmail: '',
    socialMedia: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: '',
      youtube: ''
    },
    seo: {
      defaultMetaTitle: '',
      defaultMetaDescription: '',
      defaultMetaKeywords: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      ogType: 'website',
      googleAnalyticsId: '',
      googleTagManagerId: '',
      facebookPixelId: ''
    },
    smtp: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      user: '',
      password: '',
      fromEmail: '',
      fromName: ''
    },
    recaptcha: {
      siteKey: '',
      secretKey: '',
      enabled: true
    }
  });
  const [formData, setFormData] = useState({
    siteName: '',
    siteDescription: '',
    email: '',
    phone: '',
    address: '',
    facebook: '',
    twitter: '',
    linkedin: '',
    instagram: '',
    youtube: '',
    showLoginButton: true,
    showLoginToPublic: true,
    showRegistrationToPublic: true,
    mapUrl: '',
    mapLatitude: '',
    mapLongitude: '',
    showMap: true,
    recaptchaSiteKey: '',
    recaptchaSecretKey: '',
    enableRecaptchaProductEnquiry: true,
    enableRecaptchaJobApply: true,
    enableRecaptchaContact: true,
    enableEmailContact: true,
    enableEmailProductEnquiry: true,
    enableEmailJobApplication: true,
    enableEmailDynamicForms: true,
    enableSocialSharing: false,
    facebookPageId: '',
    facebookPageAccessToken: '',
    twitterApiKey: '',
    twitterApiSecret: '',
    twitterAccessToken: '',
    twitterAccessSecret: '',
    linkedinAccessToken: '',
    linkedinPersonUrn: '',
    branding: {
      primaryColor: '#2563eb',
      secondaryColor: '#7c3aed',
      accentColor: '#f59e0b',
      titleColor: '#1f2937',
      textColor: '#4b5563',
      lightTextColor: '#6b7280',
      sectionCaptionColor: '#9ca3af',
      backgroundColor: '#ffffff',
      sectionBackgroundColor: '#f9fafb',
      borderColor: '#e5e7eb',
      linkColor: '#2563eb',
      linkHoverColor: '#1d4ed8',
      buttonPrimaryBg: '#2563eb',
      buttonPrimaryText: '#ffffff',
      buttonSecondaryBg: '#f3f4f6',
      buttonSecondaryText: '#1f2937',
      headerBgColor: '#ffffff',
      footerBgColor: '#1f2937',
      footerTextColor: '#ffffff'
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaGroups, setMediaGroups] = useState([]);
  const [selectedMediaGroup, setSelectedMediaGroup] = useState('');
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [currentImageField, setCurrentImageField] = useState('');
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    smtpPassword: false,
    recaptchaSecretKey: false,
    facebookPageAccessToken: false,
    twitterApiKey: false,
    twitterApiSecret: false,
    twitterAccessToken: false,
    twitterAccessSecret: false,
    linkedinAccessToken: false
  });

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data && res.data.data) {
        console.log('Fetched settings:', res.data.data); // Debug
        const data = res.data.data;
        
        setFormData({
          siteName: data.siteName || '',
          siteDescription: data.siteDescription || '',
          logo: data.logo || '',
          favicon: data.favicon || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          facebook: data.facebook || '',
          twitter: data.twitter || '',
          linkedin: data.linkedin || '',
          instagram: data.instagram || '',
          youtube: data.youtube || '',
          metaTitle: data.metaTitle || '',
          metaDescription: data.metaDescription || '',
          metaKeywords: data.metaKeywords || '',
          googleAnalytics: data.googleAnalytics || '',
          smtpHost: data.smtpHost || '',
          smtpPort: data.smtpPort || '',
          smtpUser: data.smtpUser || '',
          smtpPassword: data.smtpPassword || '',
          recaptchaSiteKey: data.recaptchaSiteKey || '',
          recaptchaSecretKey: data.recaptchaSecretKey || '',
          showLoginButton: data.showLoginButton !== undefined ? data.showLoginButton : true,
          showLoginToPublic: data.showLoginToPublic !== undefined ? data.showLoginToPublic : true,
          showRegistrationToPublic: data.showRegistrationToPublic !== undefined ? data.showRegistrationToPublic : true,
          mapUrl: data.mapUrl || '',
          mapLatitude: data.mapLatitude || '',
          mapLongitude: data.mapLongitude || '',
          showMap: data.showMap !== undefined ? data.showMap : true,
          enableRecaptchaProductEnquiry: data.enableRecaptchaProductEnquiry !== undefined ? data.enableRecaptchaProductEnquiry : true,
          enableRecaptchaJobApply: data.enableRecaptchaJobApply !== undefined ? data.enableRecaptchaJobApply : true,
          enableRecaptchaContact: data.enableRecaptchaContact !== undefined ? data.enableRecaptchaContact : true,
          enableEmailContact: data.enableEmailContact !== undefined ? data.enableEmailContact : true,
          enableEmailProductEnquiry: data.enableEmailProductEnquiry !== undefined ? data.enableEmailProductEnquiry : true,
          enableEmailJobApplication: data.enableEmailJobApplication !== undefined ? data.enableEmailJobApplication : true,
          enableEmailDynamicForms: data.enableEmailDynamicForms !== undefined ? data.enableEmailDynamicForms : true,
          enableSocialSharing: data.enableSocialSharing || false,
          facebookPageId: data.facebookPageId || '',
          facebookPageAccessToken: data.facebookPageAccessToken || '',
          twitterApiKey: data.twitterApiKey || '',
          twitterApiSecret: data.twitterApiSecret || '',
          twitterAccessToken: data.twitterAccessToken || '',
          twitterAccessSecret: data.twitterAccessSecret || '',
          linkedinAccessToken: data.linkedinAccessToken || '',
          linkedinPersonUrn: data.linkedinPersonUrn || '',
          branding: data.branding || {
            primaryColor: '#2563eb',
            secondaryColor: '#7c3aed',
            accentColor: '#f59e0b',
            titleColor: '#1f2937',
            textColor: '#4b5563',
            lightTextColor: '#6b7280',
            sectionCaptionColor: '#9ca3af',
            backgroundColor: '#ffffff',
            sectionBackgroundColor: '#f9fafb',
            borderColor: '#e5e7eb',
            linkColor: '#2563eb',
            linkHoverColor: '#1d4ed8',
            buttonPrimaryBg: '#2563eb',
            buttonPrimaryText: '#ffffff',
            buttonSecondaryBg: '#f3f4f6',
            buttonSecondaryText: '#1f2937',
            headerBgColor: '#ffffff',
            footerBgColor: '#1f2937',
            footerTextColor: '#ffffff'
          }
        });
        
        // Also populate settings state for nested objects
        setSettings({
          siteName: data.siteName || '',
          siteDescription: data.siteDescription || '',
          logo: data.logo || '',
          favicon: data.favicon || '',
          contactEmail: data.email || '',
          contactPhone: data.phone || '',
          address: data.address || '',
          adminEmail: data.adminEmail || '',
          socialMedia: {
            facebook: data.facebook || data.socialMedia?.facebook || '',
            twitter: data.twitter || data.socialMedia?.twitter || '',
            linkedin: data.linkedin || data.socialMedia?.linkedin || '',
            instagram: data.instagram || data.socialMedia?.instagram || '',
            youtube: data.youtube || data.socialMedia?.youtube || ''
          },
          seo: {
            defaultMetaTitle: data.metaTitle || data.seo?.defaultMetaTitle || '',
            defaultMetaDescription: data.metaDescription || data.seo?.defaultMetaDescription || '',
            defaultMetaKeywords: data.metaKeywords || data.seo?.defaultMetaKeywords || '',
            ogTitle: data.ogTitle || data.seo?.ogTitle || '',
            ogDescription: data.ogDescription || data.seo?.ogDescription || '',
            ogImage: data.ogImage || data.seo?.ogImage || '',
            ogType: data.ogType || data.seo?.ogType || 'website',
            googleAnalyticsId: data.googleAnalytics || data.seo?.googleAnalyticsId || '',
            googleTagManagerId: data.googleTagManagerId || data.seo?.googleTagManagerId || '',
            facebookPixelId: data.facebookPixelId || data.seo?.facebookPixelId || ''
          },
          smtp: {
            host: data.smtpHost || data.smtp?.host || 'smtp.gmail.com',
            port: data.smtpPort || data.smtp?.port || 587,
            secure: data.smtpSecure !== undefined ? data.smtpSecure : (data.smtp?.secure || false),
            user: data.smtpUser || data.smtp?.user || '',
            password: data.smtpPassword || data.smtp?.password || '',
            fromEmail: data.smtpFromEmail || data.smtp?.fromEmail || '',
            fromName: data.smtpFromName || data.smtp?.fromName || ''
          },
          recaptcha: {
            siteKey: data.recaptchaSiteKey || data.recaptcha?.siteKey || '',
            secretKey: data.recaptchaSecretKey || data.recaptcha?.secretKey || '',
            enabled: data.recaptcha?.enabled !== undefined ? data.recaptcha.enabled : true
          },
          enableRecaptchaContact: data.enableRecaptchaContact !== undefined ? data.enableRecaptchaContact : true,
          enableRecaptchaProductEnquiry: data.enableRecaptchaProductEnquiry !== undefined ? data.enableRecaptchaProductEnquiry : true,
          enableRecaptchaJobApply: data.enableRecaptchaJobApply !== undefined ? data.enableRecaptchaJobApply : true,
          enableEmailContact: data.enableEmailContact !== undefined ? data.enableEmailContact : true,
          enableEmailProductEnquiry: data.enableEmailProductEnquiry !== undefined ? data.enableEmailProductEnquiry : true,
          enableEmailJobApplication: data.enableEmailJobApplication !== undefined ? data.enableEmailJobApplication : true,
          enableEmailDynamicForms: data.enableEmailDynamicForms !== undefined ? data.enableEmailDynamicForms : true
        });
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching settings:', err);
      toast.error('Error loading settings');
      setLoading(false);
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
    if (/^[\p{Emoji}]+$/u.test(icon)) {
      return icon;
    }
    if (icon && !icon.includes('emoji')) {
      return <i className={`fas fa-${icon}`}></i>;
    }
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
    if (currentImageField === 'ogImage') {
      setSettings({
        ...settings,
        seo: {
          ...settings.seo,
          ogImage: imageUrl
        }
      });
      setFormData({
        ...formData,
        ogImage: imageUrl
      });
    } else {
      setSettings({
        ...settings,
        [currentImageField]: imageUrl
      });
      setFormData({
        ...formData,
        [currentImageField]: imageUrl
      });
    }
    setShowMediaLibrary(false);
    toast.success('Image selected');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle SEO fields
    if (name.startsWith('seo_')) {
      const fieldName = name.replace('seo_', '');
      setSettings(prevSettings => ({
        ...prevSettings,
        seo: {
          ...(prevSettings.seo || {}),
          [fieldName]: value
        }
      }));
    }
    // Handle branding fields
    else if (name.startsWith('branding_')) {
      const fieldName = name.replace('branding_', '');
      setFormData(prevData => ({
        ...prevData,
        branding: {
          ...(prevData.branding || {}),
          [fieldName]: value
        }
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      socialMedia: {
        ...(prevSettings.socialMedia || {}),
        [name]: value
      }
    }));
  };

  const handleSmtpChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldName = name.replace('smtp_', '');
    setSettings(prevSettings => ({
      ...prevSettings,
      smtp: {
        ...(prevSettings.smtp || {}),
        [fieldName]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleRecaptchaChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldName = name.replace('recaptcha_', '');
    setSettings({
      ...settings,
      recaptcha: {
        ...settings.recaptcha,
        [fieldName]: type === 'checkbox' ? checked : value
      }
    });
  };

  const handleTestSmtp = async () => {
    setTestingSmtp(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/settings/test-smtp', settings.smtp, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'SMTP test failed');
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      // Flatten the nested objects to match backend expectations
      const dataToSubmit = {
        ...formData,
        // Logo and favicon from formData
        logo: formData.logo || '',
        favicon: formData.favicon || '',
        // Flatten socialMedia
        facebook: settings.socialMedia?.facebook || formData.facebook || '',
        twitter: settings.socialMedia?.twitter || formData.twitter || '',
        linkedin: settings.socialMedia?.linkedin || formData.linkedin || '',
        instagram: settings.socialMedia?.instagram || formData.instagram || '',
        youtube: settings.socialMedia?.youtube || formData.youtube || '',
        // Flatten SEO
        metaTitle: settings.seo?.defaultMetaTitle || formData.metaTitle || '',
        metaDescription: settings.seo?.defaultMetaDescription || formData.metaDescription || '',
        metaKeywords: settings.seo?.defaultMetaKeywords || formData.metaKeywords || '',
        // Flatten Open Graph
        ogTitle: settings.seo?.ogTitle || '',
        ogDescription: settings.seo?.ogDescription || '',
        ogImage: settings.seo?.ogImage || '',
        ogType: settings.seo?.ogType || 'website',
        // Flatten Analytics & Tracking
        googleAnalytics: settings.seo?.googleAnalyticsId || formData.googleAnalytics || '',
        googleTagManagerId: settings.seo?.googleTagManagerId || '',
        facebookPixelId: settings.seo?.facebookPixelId || '',
        // Flatten SMTP
        smtpHost: settings.smtp?.host || formData.smtpHost || '',
        smtpPort: settings.smtp?.port || formData.smtpPort || '',
        smtpUser: settings.smtp?.user || formData.smtpUser || '',
        smtpPassword: settings.smtp?.password || formData.smtpPassword || '',
        smtpFromEmail: settings.smtp?.fromEmail || '',
        smtpFromName: settings.smtp?.fromName || '',
        smtpSecure: settings.smtp?.secure || false,
        // Flatten reCAPTCHA
        recaptchaSiteKey: settings.recaptcha?.siteKey || formData.recaptchaSiteKey || '',
        recaptchaSecretKey: settings.recaptcha?.secretKey || formData.recaptchaSecretKey || '',
        enableRecaptchaContact: settings.enableRecaptchaContact !== undefined ? settings.enableRecaptchaContact : true,
        enableRecaptchaProductEnquiry: settings.enableRecaptchaProductEnquiry !== undefined ? settings.enableRecaptchaProductEnquiry : true,
        enableRecaptchaJobApply: settings.enableRecaptchaJobApply !== undefined ? settings.enableRecaptchaJobApply : true,
        // Email notification settings
        enableEmailContact: settings.enableEmailContact !== undefined ? settings.enableEmailContact : true,
        enableEmailProductEnquiry: settings.enableEmailProductEnquiry !== undefined ? settings.enableEmailProductEnquiry : true,
        enableEmailJobApplication: settings.enableEmailJobApplication !== undefined ? settings.enableEmailJobApplication : true,
        enableEmailDynamicForms: settings.enableEmailDynamicForms !== undefined ? settings.enableEmailDynamicForms : true,
        // Keep nested objects for future use
        socialMedia: settings.socialMedia,
        seo: settings.seo,
        smtp: settings.smtp,
        recaptcha: settings.recaptcha
      };
      
      console.log('Submitting settings:', dataToSubmit);
      console.log('Email notification values being sent:', {
        enableEmailContact: dataToSubmit.enableEmailContact,
        enableEmailProductEnquiry: dataToSubmit.enableEmailProductEnquiry,
        enableEmailJobApplication: dataToSubmit.enableEmailJobApplication,
        enableEmailDynamicForms: dataToSubmit.enableEmailDynamicForms
      });
      
      const res = await axios.post('/api/settings', dataToSubmit, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Settings saved:', res.data); // Debug log
      toast.success('Settings saved successfully');
      fetchSettings();
    } catch (err) {
      console.error('Error saving settings:', err.response || err); // Debug log
      toast.error(err.response?.data?.message || 'Error saving settings');
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
          <h1>Site Settings</h1>
        </header>

        {/* Settings Tabs */}
        <div className="settings-tabs">
          <button
            type="button"
            className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <i className="fas fa-cog"></i> General
          </button>
          <button
            type="button"
            className={`settings-tab ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            <i className="fas fa-address-book"></i> Contact
          </button>
          <button
            type="button"
            className={`settings-tab ${activeTab === 'social' ? 'active' : ''}`}
            onClick={() => setActiveTab('social')}
          >
            <i className="fas fa-share-alt"></i> Social Media
          </button>
          <button
            type="button"
            className={`settings-tab ${activeTab === 'seo' ? 'active' : ''}`}
            onClick={() => setActiveTab('seo')}
          >
            <i className="fas fa-search"></i> SEO
          </button>
          <button
            type="button"
            className={`settings-tab ${activeTab === 'tracking' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracking')}
          >
            <i className="fas fa-chart-line"></i> Tracking
          </button>
          <button
            type="button"
            className={`settings-tab ${activeTab === 'smtp' ? 'active' : ''}`}
            onClick={() => setActiveTab('smtp')}
          >
            <i className="fas fa-envelope"></i> SMTP
          </button>
          <button
            type="button"
            className={`settings-tab ${activeTab === 'branding' ? 'active' : ''}`}
            onClick={() => setActiveTab('branding')}
          >
            <i className="fas fa-palette"></i> Branding
          </button>
          <button
            type="button"
            className={`settings-tab ${activeTab === 'recaptcha' ? 'active' : ''}`}
            onClick={() => setActiveTab('recaptcha')}
          >
            <i className="fas fa-shield-alt"></i> reCAPTCHA
          </button>
          <button
            type="button"
            className={`settings-tab ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            <i className="fas fa-map-marker-alt"></i> Map
          </button>
          <button
            type="button"
            className={`settings-tab ${activeTab === 'display' ? 'active' : ''}`}
            onClick={() => setActiveTab('display')}
          >
            <i className="fas fa-eye"></i> Display
          </button>
        </div>

        <form onSubmit={handleSubmit} className="settings-form card">
          
          {/* General Settings Tab */}
          {activeTab === 'general' && (
          <section className="settings-section">
            <h2>General Settings</h2>

            <div className="form-group">
              <label>Site Name</label>
              <input
                type="text"
                name="siteName"
                value={formData.siteName || ''}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Site Description</label>
              <textarea
                name="siteDescription"
                value={formData.siteDescription || ''}
                onChange={handleChange}
                rows="3"
                className="form-control"
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Logo</label>
                <div className="image-picker-wrapper">
                  {settings.logo && (
                    <div className="image-preview">
                      <img src={settings.logo} alt="Logo" className="preview-img" style={{maxHeight: '80px', objectFit: 'contain'}} />
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, logo: '' })}
                        className="btn btn-sm btn-danger"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => openMediaLibrary('logo')}
                    className="btn btn-secondary"
                  >
                    <FaImage /> Select Logo
                  </button>
                </div>
                <small>Recommended: 200x50px</small>
              </div>

              <div className="form-group">
                <label>Favicon</label>
                <div className="image-picker-wrapper">
                  {settings.favicon && (
                    <div className="image-preview">
                      <img src={settings.favicon} alt="Favicon" className="preview-img" style={{maxHeight: '40px', objectFit: 'contain'}} />
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, favicon: '' })}
                        className="btn btn-sm btn-danger"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => openMediaLibrary('favicon')}
                    className="btn btn-secondary"
                  >
                    <FaImage /> Select Favicon
                  </button>
                </div>
                <small>Recommended: 32x32px (ICO or PNG)</small>
              </div>
            </div>
          </section>
          )}

          {/* Contact Information Tab */}
          {activeTab === 'contact' && (
          <section className="settings-section">
            <h2>Contact Information</h2>

            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="form-control"
                placeholder="info@yoursite.com"
              />
              <small>Email displayed on the website for public contact</small>
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                rows="3"
                className="form-control"
              ></textarea>
            </div>
          </section>
          )}

          {/* Social Media Tab */}
          {activeTab === 'social' && (
          <section className="settings-section">
            <h2>Social Media Links</h2>

            <div className="form-group">
              <label>Facebook URL</label>
              <input
                type="url"
                name="facebook"
                value={settings.socialMedia?.facebook || ''}
                onChange={handleSocialChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Twitter URL</label>
              <input
                type="url"
                name="twitter"
                value={settings.socialMedia?.twitter || ''}
                onChange={handleSocialChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>LinkedIn URL</label>
              <input
                type="url"
                name="linkedin"
                value={settings.socialMedia?.linkedin || ''}
                onChange={handleSocialChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Instagram URL</label>
              <input
                type="url"
                name="instagram"
                value={settings.socialMedia?.instagram || ''}
                onChange={handleSocialChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>YouTube URL</label>
              <input
                type="url"
                name="youtube"
                value={settings.socialMedia?.youtube || ''}
                onChange={handleSocialChange}
                className="form-control"
              />
            </div>
          </section>
          )}

          {/* SEO Settings Tab */}
          {activeTab === 'seo' && (
          <>
          <section className="settings-section">
            <h2>SEO Settings</h2>

            <div className="form-group">
              <label>Default Meta Title</label>
              <input
                type="text"
                name="seo_defaultMetaTitle"
                value={settings.seo?.defaultMetaTitle || ''}
                onChange={handleChange}
                className="form-control"
                placeholder="Default title for all pages"
              />
              <small>{(settings.seo?.defaultMetaTitle || '').length}/60 (recommended)</small>
            </div>

            <div className="form-group">
              <label>Default Meta Description</label>
              <textarea
                name="seo_defaultMetaDescription"
                value={settings.seo?.defaultMetaDescription || ''}
                onChange={handleChange}
                rows="2"
                className="form-control"
                placeholder="Default description for all pages"
              ></textarea>
              <small>{(settings.seo?.defaultMetaDescription || '').length}/160 (recommended)</small>
            </div>

            <div className="form-group">
              <label>Default Meta Keywords (comma-separated)</label>
              <input
                type="text"
                name="seo_defaultMetaKeywords"
                value={settings.seo?.defaultMetaKeywords || ''}
                onChange={handleChange}
                className="form-control"
                placeholder="Default keywords for all pages"
              />
            </div>
          </section>

          <section className="settings-section">
            <h2>Open Graph (Social Media)</h2>

            <div className="form-group">
              <label>OG Title</label>
              <input
                type="text"
                name="seo_ogTitle"
                value={settings.seo?.ogTitle || ''}
                onChange={handleChange}
                className="form-control"
                placeholder="Title when shared on social media"
              />
              <small>Leave empty to use Default Meta Title</small>
            </div>

            <div className="form-group">
              <label>OG Description</label>
              <textarea
                name="seo_ogDescription"
                value={settings.seo?.ogDescription || ''}
                onChange={handleChange}
                rows="3"
                className="form-control"
                placeholder="Description when shared on social media"
              ></textarea>
              <small>Leave empty to use Default Meta Description</small>
            </div>

            <div className="form-group">
              <label>OG Image (Social Media Preview)</label>
              <div className="image-picker-wrapper">
                {settings.seo?.ogImage && (
                  <div className="image-preview">
                    <img src={settings.seo.ogImage} alt="OG" className="preview-img" />
                    <button
                      type="button"
                      onClick={() => setSettings({
                        ...settings,
                        seo: { ...settings.seo, ogImage: '' }
                      })}
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
                  <FaImage /> Select OG Image
                </button>
              </div>
              <small>Recommended: 1200x630px</small>
            </div>

            <div className="form-group">
              <label>OG Type</label>
              <select
                name="seo_ogType"
                value={settings.seo?.ogType || 'website'}
                onChange={handleChange}
                className="form-control"
              >
                <option value="website">Website</option>
                <option value="article">Article</option>
                <option value="blog">Blog</option>
                <option value="profile">Profile</option>
                <option value="product">Product</option>
              </select>
              <small>Type of content for Open Graph</small>
            </div>
          </section>
          </>
          )}

          {/* Tracking & Analytics Tab */}
          {activeTab === 'tracking' && (
          <section className="settings-section">
            <h2>Tracking & Analytics</h2>

            <div className="form-group">
              <label>Google Analytics ID</label>
              <input
                type="text"
                name="seo_googleAnalyticsId"
                value={settings.seo?.googleAnalyticsId || ''}
                onChange={handleChange}
                className="form-control"
                placeholder="GA-XXXXXXXXX-X"
              />
            </div>

            <div className="form-group">
              <label>Google Tag Manager ID</label>
              <input
                type="text"
                name="seo_googleTagManagerId"
                value={settings.seo?.googleTagManagerId || ''}
                onChange={handleChange}
                className="form-control"
                placeholder="GTM-XXXXXXX"
              />
            </div>

            <div className="form-group">
              <label>Facebook Pixel ID</label>
              <input
                type="text"
                name="seo_facebookPixelId"
                value={settings.seo?.facebookPixelId || ''}
                onChange={handleChange}
                className="form-control"
                placeholder="Your Facebook Pixel ID"
              />
            </div>
          </section>
          )}

          {/* SMTP Email Settings Tab */}
          {activeTab === 'smtp' && (
          <section className="settings-section">
            <h2>SMTP Email Settings</h2>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Configure SMTP settings to send emails from your application. For Gmail, use App Password instead of your regular password.
            </p>

            <div className="form-row">
              <div className="form-group">
                <label>SMTP Host</label>
                <input
                  type="text"
                  name="smtp_host"
                  value={settings.smtp?.host || ''}
                  onChange={handleSmtpChange}
                  className="form-control"
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div className="form-group">
                <label>SMTP Port</label>
                <select
                  name="smtp_port"
                  value={settings.smtp?.port || 587}
                  onChange={handleSmtpChange}
                  className="form-control"
                >
                  <option value="25">25 (Standard SMTP)</option>
                  <option value="465">465 (SSL/TLS)</option>
                  <option value="587">587 (STARTTLS - Recommended)</option>
                  <option value="2525">2525 (Alternative)</option>
                </select>
                <small>
                  Port 25: Standard SMTP | Port 465: SSL/TLS | Port 587: STARTTLS (Most secure) | Port 2525: Alternative
                </small>
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="smtp_secure"
                  checked={settings.smtp?.secure || false}
                  onChange={handleSmtpChange}
                />
                Use SSL/TLS
              </label>
              <small>Check this for port 465, uncheck for ports 25, 587, or 2525</small>
            </div>

            <div className="form-group">
              <label>SMTP Username (Email)</label>
              <input
                type="text"
                name="smtp_user"
                value={settings.smtp?.user || ''}
                onChange={handleSmtpChange}
                className="form-control"
                placeholder="your-email@gmail.com"
              />
            </div>

            <div className="form-group">
              <label>SMTP Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPasswords.smtpPassword ? "text" : "password"}
                  name="smtp_password"
                  value={settings.smtp?.password || ''}
                  onChange={handleSmtpChange}
                  className="form-control"
                  placeholder="Your email password or app password"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('smtpPassword')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    fontSize: '18px'
                  }}
                  title={showPasswords.smtpPassword ? "Hide password" : "Show password"}
                >
                  <i className={showPasswords.smtpPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                </button>
              </div>
              <small>
                For Gmail: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer">
                  Generate App Password
                </a>
              </small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>From Email</label>
                <input
                  type="email"
                  name="smtp_fromEmail"
                  value={settings.smtp?.fromEmail || ''}
                  onChange={handleSmtpChange}
                  className="form-control"
                  placeholder="noreply@yoursite.com"
                />
              </div>

              <div className="form-group">
                <label>From Name</label>
                <input
                  type="text"
                  name="smtp_fromName"
                  value={settings.smtp?.fromName || ''}
                  onChange={handleSmtpChange}
                  className="form-control"
                  placeholder="Your Site Name"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestSmtp}
              className="btn btn-secondary"
              disabled={testingSmtp}
            >
              {testingSmtp ? 'Testing...' : 'Test SMTP Connection'}
            </button>

            <hr style={{ margin: '2rem 0' }} />

            <h3 style={{ marginBottom: '1rem' }}>Email Notification Settings</h3>
            <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>
              Control which form submissions trigger email notifications. Uncheck to disable notifications for specific forms.
            </p>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="enableEmailContact"
                  checked={settings.enableEmailContact === true}
                  onChange={(e) => setSettings({...settings, enableEmailContact: e.target.checked})}
                  style={{ marginRight: '0.5rem' }}
                />
                <span>Contact Form Submissions</span>
              </label>
              <small style={{ display: 'block', marginTop: '0.25rem', marginLeft: '1.5rem', color: 'var(--text-light)' }}>
                Send email when visitors submit the contact form
              </small>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="enableEmailProductEnquiry"
                  checked={settings.enableEmailProductEnquiry === true}
                  onChange={(e) => setSettings({...settings, enableEmailProductEnquiry: e.target.checked})}
                  style={{ marginRight: '0.5rem' }}
                />
                <span>Product Enquiries</span>
              </label>
              <small style={{ display: 'block', marginTop: '0.25rem', marginLeft: '1.5rem', color: 'var(--text-light)' }}>
                Send email when visitors enquire about products
              </small>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="enableEmailJobApplication"
                  checked={settings.enableEmailJobApplication === true}
                  onChange={(e) => setSettings({...settings, enableEmailJobApplication: e.target.checked})}
                  style={{ marginRight: '0.5rem' }}
                />
                <span>Job Applications</span>
              </label>
              <small style={{ display: 'block', marginTop: '0.25rem', marginLeft: '1.5rem', color: 'var(--text-light)' }}>
                Send email when candidates submit job applications
              </small>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="enableEmailDynamicForms"
                  checked={settings.enableEmailDynamicForms === true}
                  onChange={(e) => setSettings({...settings, enableEmailDynamicForms: e.target.checked})}
                  style={{ marginRight: '0.5rem' }}
                />
                <span>Dynamic Forms</span>
              </label>
              <small style={{ display: 'block', marginTop: '0.25rem', marginLeft: '1.5rem', color: 'var(--text-light)' }}>
                Send email for custom dynamic forms (can be overridden per form)
              </small>
            </div>
          </section>
          )}

          {/* reCAPTCHA Tab */}
          {activeTab === 'recaptcha' && (
          <fieldset className="form-section">
            <legend>reCAPTCHA Settings</legend>
            
            <div className="form-group">
              <label>reCAPTCHA Site Key</label>
              <input
                type="text"
                name="recaptcha_siteKey"
                value={settings.recaptcha?.siteKey || ''}
                onChange={handleRecaptchaChange}
                className="form-control"
                placeholder="Your reCAPTCHA v3 site key"
              />
              <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-light)' }}>
                Get your keys from <a href="https://www.google.com/recaptcha/admin" target="_blank" rel="noopener noreferrer">Google reCAPTCHA</a>
              </small>
            </div>

            <div className="form-group">
              <label>reCAPTCHA Secret Key</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPasswords.recaptchaSecretKey ? "text" : "password"}
                  name="recaptcha_secretKey"
                  value={settings.recaptcha?.secretKey || ''}
                  onChange={handleRecaptchaChange}
                  className="form-control"
                  placeholder="Your reCAPTCHA v3 secret key"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('recaptchaSecretKey')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    fontSize: '18px'
                  }}
                  title={showPasswords.recaptchaSecretKey ? "Hide key" : "Show key"}
                >
                  <i className={showPasswords.recaptchaSecretKey ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="enableRecaptchaContact"
                  checked={formData.enableRecaptchaContact}
                  onChange={handleChange}
                />
                Enable reCAPTCHA on Contact Form
              </label>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="enableRecaptchaProductEnquiry"
                  checked={formData.enableRecaptchaProductEnquiry}
                  onChange={handleChange}
                />
                Enable reCAPTCHA on Product Enquiry Form
              </label>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="enableRecaptchaJobApply"
                  checked={formData.enableRecaptchaJobApply}
                  onChange={handleChange}
                />
                Enable reCAPTCHA on Job Application Form
              </label>
            </div>
          </fieldset>
          )}

          {/* Display Settings Tab */}
          {activeTab === 'display' && (
          <fieldset className="form-section">
            <legend>Display Settings</legend>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="showLoginButton"
                  checked={formData.showLoginButton}
                  onChange={handleChange}
                />
                Show Login Button in Header
              </label>
              <small>When disabled, users can still access login at /login URL</small>
            </div>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="showLoginToPublic"
                  checked={formData.showLoginToPublic}
                  onChange={handleChange}
                />
                Show Login Page to Public
              </label>
              <small>When disabled, login page will not be accessible to non-authenticated users</small>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="showRegistrationToPublic"
                  checked={formData.showRegistrationToPublic}
                  onChange={handleChange}
                />
                Show Registration Page to Public
              </label>
              <small>When disabled, registration page will not be accessible to non-authenticated users</small>
            </div>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="showMap"
                  checked={formData.showMap}
                  onChange={handleChange}
                />
                Show Map on Contact Page
              </label>
            </div>
          </fieldset>
          )}

          {/* Branding & Theme Tab */}
          {activeTab === 'branding' && (
          <fieldset className="form-section">
            <legend>🎨 Branding & Theme Colors</legend>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Customize your site's color scheme. Changes will be applied across all pages.
            </p>

            <div className="color-section">
              <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Main Colors</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Primary Color</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      name="branding_primaryColor"
                      value={formData.branding?.primaryColor || '#2563eb'}
                      onChange={handleChange}
                      style={{ width: '60px', height: '40px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <input
                      type="text"
                      name="branding_primaryColor"
                      value={formData.branding?.primaryColor || '#2563eb'}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="#2563eb"
                      style={{ flex: 1 }}
                    />
                  </div>
                  <small>Main brand color (buttons, links, highlights)</small>
                </div>

                <div className="form-group">
                  <label>Secondary Color</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      name="branding_secondaryColor"
                      value={formData.branding?.secondaryColor || '#7c3aed'}
                      onChange={handleChange}
                      style={{ width: '60px', height: '40px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <input
                      type="text"
                      name="branding_secondaryColor"
                      value={formData.branding?.secondaryColor || '#7c3aed'}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="#7c3aed"
                      style={{ flex: 1 }}
                    />
                  </div>
                  <small>Secondary brand color</small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Accent Color</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      name="branding_accentColor"
                      value={formData.branding?.accentColor || '#f59e0b'}
                      onChange={handleChange}
                      style={{ width: '60px', height: '40px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <input
                      type="text"
                      name="branding_accentColor"
                      value={formData.branding?.accentColor || '#f59e0b'}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="#f59e0b"
                      style={{ flex: 1 }}
                    />
                  </div>
                  <small>Accent color for special elements</small>
                </div>

                <div className="form-group">
                  <label>Link Color</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      name="branding_linkColor"
                      value={formData.branding?.linkColor || '#2563eb'}
                      onChange={handleChange}
                      style={{ width: '60px', height: '40px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <input
                      type="text"
                      name="branding_linkColor"
                      value={formData.branding?.linkColor || '#2563eb'}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="#2563eb"
                      style={{ flex: 1 }}
                    />
                  </div>
                  <small>Color for hyperlinks</small>
                </div>
              </div>
            </div>

            <div className="color-section" style={{ marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Text Colors</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Title Color</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      name="branding_titleColor"
                      value={formData.branding?.titleColor || '#1f2937'}
                      onChange={handleChange}
                      style={{ width: '60px', height: '40px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <input
                      type="text"
                      name="branding_titleColor"
                      value={formData.branding?.titleColor || '#1f2937'}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="#1f2937"
                      style={{ flex: 1 }}
                    />
                  </div>
                  <small>Color for headings and titles</small>
                </div>

                <div className="form-group">
                  <label>Text Color</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      name="branding_textColor"
                      value={formData.branding?.textColor || '#4b5563'}
                      onChange={handleChange}
                      style={{ width: '60px', height: '40px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <input
                      type="text"
                      name="branding_textColor"
                      value={formData.branding?.textColor || '#4b5563'}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="#4b5563"
                      style={{ flex: 1 }}
                    />
                  </div>
                  <small>Main body text color</small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Section Caption Color</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      name="branding_sectionCaptionColor"
                      value={formData.branding?.sectionCaptionColor || '#9ca3af'}
                      onChange={handleChange}
                      style={{ width: '60px', height: '40px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <input
                      type="text"
                      name="branding_sectionCaptionColor"
                      value={formData.branding?.sectionCaptionColor || '#9ca3af'}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="#9ca3af"
                      style={{ flex: 1 }}
                    />
                  </div>
                  <small>Color for section subtitles and captions</small>
                </div>

                <div className="form-group">
                  <label>Light Text Color</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      name="branding_lightTextColor"
                      value={formData.branding?.lightTextColor || '#6b7280'}
                      onChange={handleChange}
                      style={{ width: '60px', height: '40px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <input
                      type="text"
                      name="branding_lightTextColor"
                      value={formData.branding?.lightTextColor || '#6b7280'}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="#6b7280"
                      style={{ flex: 1 }}
                    />
                  </div>
                  <small>Color for muted/secondary text</small>
                </div>
              </div>
            </div>

            <div className="color-section" style={{ marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Background Colors</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Page Background</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      name="branding_backgroundColor"
                      value={formData.branding?.backgroundColor || '#ffffff'}
                      onChange={handleChange}
                      style={{ width: '60px', height: '40px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <input
                      type="text"
                      name="branding_backgroundColor"
                      value={formData.branding?.backgroundColor || '#ffffff'}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="#ffffff"
                      style={{ flex: 1 }}
                    />
                  </div>
                  <small>Main page background color</small>
                </div>

                <div className="form-group">
                  <label>Section Background</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      name="branding_sectionBackgroundColor"
                      value={formData.branding?.sectionBackgroundColor || '#f9fafb'}
                      onChange={handleChange}
                      style={{ width: '60px', height: '40px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <input
                      type="text"
                      name="branding_sectionBackgroundColor"
                      value={formData.branding?.sectionBackgroundColor || '#f9fafb'}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="#f9fafb"
                      style={{ flex: 1 }}
                    />
                  </div>
                  <small>Alternate section background</small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Header Background</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      name="branding_headerBgColor"
                      value={formData.branding?.headerBgColor || '#ffffff'}
                      onChange={handleChange}
                      style={{ width: '60px', height: '40px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <input
                      type="text"
                      name="branding_headerBgColor"
                      value={formData.branding?.headerBgColor || '#ffffff'}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="#ffffff"
                      style={{ flex: 1 }}
                    />
                  </div>
                  <small>Header/navigation background</small>
                </div>

                <div className="form-group">
                  <label>Footer Background</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      name="branding_footerBgColor"
                      value={formData.branding?.footerBgColor || '#1f2937'}
                      onChange={handleChange}
                      style={{ width: '60px', height: '40px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <input
                      type="text"
                      name="branding_footerBgColor"
                      value={formData.branding?.footerBgColor || '#1f2937'}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="#1f2937"
                      style={{ flex: 1 }}
                    />
                  </div>
                  <small>Footer background color</small>
                </div>
              </div>
            </div>

            <div className="color-section" style={{ marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Button Colors</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Primary Button Background</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      name="branding_buttonPrimaryBg"
                      value={formData.branding?.buttonPrimaryBg || '#2563eb'}
                      onChange={handleChange}
                      style={{ width: '60px', height: '40px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <input
                      type="text"
                      name="branding_buttonPrimaryBg"
                      value={formData.branding?.buttonPrimaryBg || '#2563eb'}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="#2563eb"
                      style={{ flex: 1 }}
                    />
                  </div>
                  <small>Primary button background</small>
                </div>

                <div className="form-group">
                  <label>Primary Button Text</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      name="branding_buttonPrimaryText"
                      value={formData.branding?.buttonPrimaryText || '#ffffff'}
                      onChange={handleChange}
                      style={{ width: '60px', height: '40px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <input
                      type="text"
                      name="branding_buttonPrimaryText"
                      value={formData.branding?.buttonPrimaryText || '#ffffff'}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="#ffffff"
                      style={{ flex: 1 }}
                    />
                  </div>
                  <small>Primary button text color</small>
                </div>
              </div>
            </div>

            <div style={{ 
              marginTop: '2rem', 
              padding: '1rem', 
              background: '#f0f9ff', 
              borderLeft: '4px solid #2563eb',
              borderRadius: '4px'
            }}>
              <strong>💡 Tips:</strong>
              <ul style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.5rem' }}>
                <li>Click the color box to use the color picker</li>
                <li>Or enter hex codes manually (e.g., #2563eb)</li>
                <li>Changes apply after saving settings</li>
                <li>Keep contrast in mind for readability</li>
              </ul>
            </div>
          </fieldset>
          )}

          {/* Map Settings Tab */}
          {activeTab === 'map' && (
          <fieldset className="form-section">
            <legend>Map Settings</legend>

            <div className="form-group">
              <label>Google Maps Embed Code or URL</label>
              <textarea
                name="mapUrl"
                value={formData.mapUrl || ''}
                onChange={handleChange}
                rows="4"
                className="form-control"
                placeholder="Paste full iframe code OR just the URL"
              />
              <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-light)' }}>
                <strong>Option 1:</strong> Paste the entire iframe code from Google Maps
                <br />
                <strong>Option 2:</strong> Paste just the URL (starts with https://www.google.com/maps/embed...)
                <br />
                <br />
                <strong>How to get:</strong> Go to Google Maps → Search location → Click Share → Embed a map → Copy everything
              </small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Latitude (Optional)</label>
                <input
                  type="text"
                  name="mapLatitude"
                  value={formData.mapLatitude || ''}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="27.658811"
                />
              </div>
              <div className="form-group">
                <label>Longitude (Optional)</label>
                <input
                  type="text"
                  name="mapLongitude"
                  value={formData.mapLongitude || ''}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="85.289950"
                />
              </div>
            </div>
          </fieldset>
          )}

          {/* Social Media Auto-Share - Add to Social Tab */}
          {activeTab === 'social' && (
          <fieldset className="form-section">
            <legend>Social Media Auto-Share</legend>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="enableSocialSharing"
                  checked={formData.enableSocialSharing}
                  onChange={handleChange}
                />
                Enable Auto-Share to Social Media
              </label>
              <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-light)' }}>
                Automatically share job posts and blog posts when published to Facebook, Twitter, and LinkedIn
              </small>
            </div>

            {/* Facebook Settings */}
            <div className="form-subsection">
              <h4>Facebook Settings</h4>
              <div className="form-group">
                <label>Facebook Page ID</label>
                <input
                  type="text"
                  name="facebookPageId"
                  value={formData.facebookPageId || ''}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Your Facebook Page ID"
                />
              </div>
              <div className="form-group">
                <label>Facebook Page Access Token</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPasswords.facebookPageAccessToken ? "text" : "password"}
                    name="facebookPageAccessToken"
                    value={formData.facebookPageAccessToken || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Your Facebook Page Access Token"
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('facebookPageAccessToken')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280',
                      fontSize: '18px'
                    }}
                    title={showPasswords.facebookPageAccessToken ? "Hide token" : "Show token"}
                  >
                    <i className={showPasswords.facebookPageAccessToken ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                  </button>
                </div>
                <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-light)' }}>
                  Get your token from <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer">Facebook Graph API Explorer</a>
                </small>
              </div>
            </div>

            {/* Twitter Settings */}
            <div className="form-subsection">
              <h4>Twitter Settings</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Twitter API Key</label>
                  <input
                    type="text"
                    name="twitterApiKey"
                    value={formData.twitterApiKey || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Your Twitter API Key"
                  />
                </div>
                <div className="form-group">
                  <label>Twitter API Secret</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPasswords.twitterApiSecret ? "text" : "password"}
                      name="twitterApiSecret"
                      value={formData.twitterApiSecret || ''}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Your Twitter API Secret"
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('twitterApiSecret')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7280',
                        fontSize: '18px'
                      }}
                      title={showPasswords.twitterApiSecret ? "Hide secret" : "Show secret"}
                    >
                      <i className={showPasswords.twitterApiSecret ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Twitter Access Token</label>
                  <input
                    type="text"
                    name="twitterAccessToken"
                    value={formData.twitterAccessToken || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Your Twitter Access Token"
                  />
                </div>
                <div className="form-group">
                  <label>Twitter Access Secret</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPasswords.twitterAccessSecret ? "text" : "password"}
                      name="twitterAccessSecret"
                      value={formData.twitterAccessSecret || ''}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Your Twitter Access Secret"
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('twitterAccessSecret')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7280',
                        fontSize: '18px'
                      }}
                      title={showPasswords.twitterAccessSecret ? "Hide secret" : "Show secret"}
                    >
                      <i className={showPasswords.twitterAccessSecret ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                    </button>
                  </div>
                </div>
              </div>
              <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-light)' }}>
                Get your keys from <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noopener noreferrer">Twitter Developer Portal</a>
              </small>
            </div>

            {/* LinkedIn Settings */}
            <div className="form-subsection">
              <h4>LinkedIn Settings</h4>
              <div className="form-group">
                <label>LinkedIn Access Token</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPasswords.linkedinAccessToken ? "text" : "password"}
                    name="linkedinAccessToken"
                    value={formData.linkedinAccessToken || ''}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Your LinkedIn Access Token"
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('linkedinAccessToken')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280',
                      fontSize: '18px'
                    }}
                    title={showPasswords.linkedinAccessToken ? "Hide token" : "Show token"}
                  >
                    <i className={showPasswords.linkedinAccessToken ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>LinkedIn Person URN</label>
                <input
                  type="text"
                  name="linkedinPersonUrn"
                  value={formData.linkedinPersonUrn || ''}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Your LinkedIn Person URN (e.g., abc123XYZ)"
                />
                <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-light)' }}>
                  Get your credentials from <a href="https://www.linkedin.com/developers/" target="_blank" rel="noopener noreferrer">LinkedIn Developers</a>
                </small>
              </div>
            </div>
          </fieldset>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>

        {showMediaLibrary && (
          <>
            <div className="modal-overlay" onClick={() => setShowMediaLibrary(false)}></div>
            <div className="media-library-modal">
              <div className="modal-header">
                <h3>Select {currentImageField === 'logo' ? 'Logo' : currentImageField === 'favicon' ? 'Favicon' : 'OG Image'}</h3>
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
                        const selectedValue = currentImageField === 'ogImage' ? settings.seo?.ogImage : settings[currentImageField];
                        return (
                          <button
                            key={file._id}
                            type="button"
                            className={`media-library-item ${selectedValue === file.url ? 'selected' : ''}`}
                            onClick={() => handleSelectImage(file.url)}
                            title={file.originalName}
                          >
                            <img src={imageUrl} alt={file.originalName} />
                            <div className="item-info">
                              <p className="item-name">{file.originalName}</p>
                              {selectedValue === file.url && <span className="check-mark">✓</span>}
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
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;

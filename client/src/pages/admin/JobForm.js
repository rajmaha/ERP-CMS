import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import RichTextEditor from '../../components/RichTextEditor';
import { toast } from 'react-toastify';
import { FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import './Form.css';

const JobForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    department: '',
    location: '',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    salaryRange: {
      min: '',
      max: '',
      currency: 'USD'
    },
    description: '',
    responsibilities: [''],
    requirements: [''],
    benefits: [''],
    applicationDeadline: '',
    status: 'draft',
    featured: false,
    metaTitle: '',
    metaDescription: ''
  });

  useEffect(() => {
    fetchDepartments();
    if (id) {
      fetchJob();
    }
  }, [id]);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('/api/jobs/departments/list');
      setDepartments(res.data.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchJob = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/jobs/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const job = res.data.data.find(j => j._id === id);
      if (job) {
        setFormData({
          ...job,
          department: job.department?._id || '',
          applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : ''
        });
      }
    } catch (err) {
      toast.error('Error loading job');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('salaryRange.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        salaryRange: { ...formData.salaryRange, [field]: value }
      });
    } else {
      setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    }
    
    if (name === 'title') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, title: value, slug }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayItem = (field, index) => {
    setFormData({ ...formData, [field]: formData[field].filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const submitData = {
        ...formData,
        responsibilities: formData.responsibilities.filter(r => r.trim()),
        requirements: formData.requirements.filter(r => r.trim()),
        benefits: formData.benefits.filter(b => b.trim())
      };

      if (id) {
        await axios.put(`/api/jobs/${id}`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Job updated successfully');
      } else {
        await axios.post('/api/jobs', submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Job created successfully');
      }
      navigate('/admin/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <h1>{id ? 'Edit Job' : 'New Job'}</h1>
        </header>

        <form onSubmit={handleSubmit} className="form-container card">
          <div className="form-row">
            <div className="form-group">
              <label>Job Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required className="form-control" />
            </div>
            <div className="form-group">
              <label>Slug *</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} required className="form-control" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Department *</label>
              <select name="department" value={formData.department} onChange={handleChange} required className="form-control">
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Location *</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} required className="form-control" placeholder="e.g., New York, Remote" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Employment Type *</label>
              <select name="employmentType" value={formData.employmentType} onChange={handleChange} required className="form-control">
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div className="form-group">
              <label>Experience Level *</label>
              <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} required className="form-control">
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="executive">Executive</option>
              </select>
            </div>
          </div>

          <fieldset className="form-section">
            <legend>Salary Range</legend>
            <div className="form-row">
              <div className="form-group">
                <label>Min Salary</label>
                <input type="number" name="salaryRange.min" value={formData.salaryRange.min} onChange={handleChange} className="form-control" />
              </div>
              <div className="form-group">
                <label>Max Salary</label>
                <input type="number" name="salaryRange.max" value={formData.salaryRange.max} onChange={handleChange} className="form-control" />
              </div>
              <div className="form-group">
                <label>Currency</label>
                <input type="text" name="salaryRange.currency" value={formData.salaryRange.currency} onChange={handleChange} className="form-control" placeholder="USD" />
              </div>
            </div>
          </fieldset>

          <div className="form-group">
            <label>Job Description *</label>
            <RichTextEditor value={formData.description} onChange={(content) => setFormData({ ...formData, description: content })} name="description" />
          </div>

          <fieldset className="form-section">
            <legend>Responsibilities</legend>
            {formData.responsibilities.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange('responsibilities', index, e.target.value)}
                  className="form-control"
                  placeholder="Responsibility"
                />
                <button type="button" onClick={() => removeArrayItem('responsibilities', index)} className="btn btn-danger btn-sm">
                  <FaTrash />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem('responsibilities')} className="btn btn-secondary btn-sm">
              <FaPlus /> Add Responsibility
            </button>
          </fieldset>

          <fieldset className="form-section">
            <legend>Requirements</legend>
            {formData.requirements.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                  className="form-control"
                  placeholder="Requirement"
                />
                <button type="button" onClick={() => removeArrayItem('requirements', index)} className="btn btn-danger btn-sm">
                  <FaTrash />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem('requirements')} className="btn btn-secondary btn-sm">
              <FaPlus /> Add Requirement
            </button>
          </fieldset>

          <fieldset className="form-section">
            <legend>Benefits</legend>
            {formData.benefits.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange('benefits', index, e.target.value)}
                  className="form-control"
                  placeholder="Benefit"
                />
                <button type="button" onClick={() => removeArrayItem('benefits', index)} className="btn btn-danger btn-sm">
                  <FaTrash />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem('benefits')} className="btn btn-secondary btn-sm">
              <FaPlus /> Add Benefit
            </button>
          </fieldset>

          <div className="form-row">
            <div className="form-group">
              <label>Application Deadline</label>
              <input type="date" name="applicationDeadline" value={formData.applicationDeadline} onChange={handleChange} className="form-control" />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="form-control">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="filled">Filled</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} />
              Featured Job
            </label>
          </div>

          <fieldset className="form-section">
            <legend>SEO Settings</legend>
            <div className="form-group">
              <label>Meta Title</label>
              <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleChange} className="form-control" />
            </div>
            <div className="form-group">
              <label>Meta Description</label>
              <textarea name="metaDescription" value={formData.metaDescription} onChange={handleChange} rows="2" className="form-control"></textarea>
            </div>
          </fieldset>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <FaSave /> {loading ? 'Saving...' : 'Save Job'}
            </button>
            <button type="button" onClick={() => navigate('/admin/jobs')} className="btn btn-secondary">
              <FaTimes /> Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default JobForm;

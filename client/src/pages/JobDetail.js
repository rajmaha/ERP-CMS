import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import SEO from '../components/SEO';
import { FaMapMarkerAlt, FaClock, FaBriefcase, FaMoneyBillWave, FaCalendarAlt, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './JobDetail.css';
import ShareButtons from '../components/ShareButtons';

const JobDetail = () => {
  const { slug } = useParams();
  const [job, setJob] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    experience: '',
    currentCompany: '',
    currentPosition: '',
    expectedSalary: '',
    noticePeriod: '',
    coverLetter: '',
    portfolio: '',
    linkedin: ''
  });
  const [resume, setResume] = useState(null);
  const [recaptchaToken, setRecaptchaToken] = useState('');

  useEffect(() => {
    fetchJob();
    fetchSettings();
    
    // Load reCAPTCHA
    if (window.grecaptcha) {
      window.grecaptcha.ready(() => {
        console.log('reCAPTCHA ready');
      });
    }
  }, [slug]);

  const fetchJob = async () => {
    try {
      const res = await axios.get(`/api/jobs/${slug}`);
      setJob(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching job:', err);
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings');
      setSettings(res.data.data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Get reCAPTCHA token only if enabled
    let captchaToken = recaptchaToken;
    if (settings?.enableRecaptchaJobApply && window.grecaptcha && settings?.recaptchaSiteKey) {
      try {
        captchaToken = await window.grecaptcha.execute(settings.recaptchaSiteKey, { action: 'submit' });
      } catch (err) {
        console.error('reCAPTCHA error:', err);
      }
    }

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      if (resume) {
        data.append('resume', resume);
      }
      data.append('recaptchaToken', captchaToken);

      await axios.post(`/api/jobs/${job._id}/apply`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  const getEmploymentTypeLabel = (type) => {
    const labels = {
      'full-time': 'Full Time',
      'part-time': 'Part Time',
      'contract': 'Contract',
      'internship': 'Internship',
      'remote': 'Remote'
    };
    return labels[type] || type;
  };

  const getExperienceLevelLabel = (level) => {
    const labels = {
      'entry': 'Entry Level',
      'mid': 'Mid Level',
      'senior': 'Senior Level',
      'executive': 'Executive'
    };
    return labels[level] || level;
  };

  if (loading) {
    return <div className="loading">Loading job details...</div>;
  }

  if (!job) {
    return (
      <div className="job-not-found">
        <h2>Job Not Found</h2>
        <Link to="/careers" className="btn btn-primary">Back to Careers</Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="application-success">
        <div className="container">
          <div className="success-card">
            <FaCheckCircle className="success-icon" />
            <h1>Application Submitted!</h1>
            <p>Thank you for applying to <strong>{job.title}</strong>.</p>
            <p>We've received your application and will review it shortly. If your profile matches our requirements, we'll get in touch with you.</p>
            <div className="success-actions">
              <Link to="/careers" className="btn btn-primary">View More Jobs</Link>
              <button onClick={() => window.location.reload()} className="btn btn-secondary">Submit Another Application</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`${job.title} - ${job.department}`}
        description={job.metaDescription || job.description.substring(0, 160)}
      />

      <div className="job-detail-page">
        <div className="container">
          <Link to="/careers" className="back-link">
            <FaArrowLeft /> Back to Careers
          </Link>

          <div className="job-detail-header">
            <div className="job-title-section">
              <h1>{job.title}</h1>
              <div className="job-meta-tags">
                <span className="meta-tag">
                  <FaMapMarkerAlt /> {job.location}
                </span>
                <span className="meta-tag">
                  <FaClock /> {getEmploymentTypeLabel(job.employmentType)}
                </span>
                <span className="meta-tag">
                  <FaBriefcase /> {getExperienceLevelLabel(job.experienceLevel)}
                </span>
                {job.salaryRange && job.salaryRange.min && (
                  <span className="meta-tag">
                    <FaMoneyBillWave /> {job.salaryRange.currency} {job.salaryRange.min.toLocaleString()} - {job.salaryRange.max.toLocaleString()}
                  </span>
                )}
              </div>
              {job.applicationDeadline && (
                <div className="deadline-badge">
                  <FaCalendarAlt /> Apply by: {new Date(job.applicationDeadline).toLocaleDateString()}
                </div>
              )}
            </div>
            <button onClick={() => setShowApplicationForm(true)} className="btn btn-primary btn-large">
              Apply Now
            </button>
          </div>

          <div className="job-detail-content">
            <div className="job-main-content">
              <section className="job-section">
                <h2>About the Role</h2>
                <div className="job-description" dangerouslySetInnerHTML={{ __html: job.description }}></div>
              </section>

              {job.responsibilities && job.responsibilities.length > 0 && (
                <section className="job-section">
                  <h2>Key Responsibilities</h2>
                  <ul className="job-list">
                    {job.responsibilities.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}

              {job.requirements && job.requirements.length > 0 && (
                <section className="job-section">
                  <h2>Requirements</h2>
                  <ul className="job-list">
                    {job.requirements.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}

              {job.benefits && job.benefits.length > 0 && (
                <section className="job-section">
                  <h2>Benefits</h2>
                  <ul className="job-list">
                    {job.benefits.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            <div className="job-sidebar">
              <div className="sidebar-card">
                <h3>Job Overview</h3>
                <div className="overview-item">
                  <strong>Department:</strong>
                  <span>{job.department}</span>
                </div>
                <div className="overview-item">
                  <strong>Location:</strong>
                  <span>{job.location}</span>
                </div>
                <div className="overview-item">
                  <strong>Job Type:</strong>
                  <span>{getEmploymentTypeLabel(job.employmentType)}</span>
                </div>
                <div className="overview-item">
                  <strong>Experience:</strong>
                  <span>{getExperienceLevelLabel(job.experienceLevel)}</span>
                </div>
                <div className="overview-item">
                  <strong>Posted:</strong>
                  <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="sidebar-card apply-card">
                <h3>Ready to Apply?</h3>
                <p>Join our team and make an impact!</p>
                <button onClick={() => setShowApplicationForm(true)} className="btn btn-primary btn-block">
                  Apply for this Position
                </button>
              </div>
            </div>
          </div>

          <div className="job-content">
            <ShareButtons 
              url={window.location.href}
              title={job.title}
              description={job.description.replace(/<[^>]*>/g, '').substring(0, 200)}
            />
          </div>
        </div>

        {/* Application Form Modal */}
        {showApplicationForm && (
          <>
            <div className="modal-overlay" onClick={() => setShowApplicationForm(false)}></div>
            <div className="application-modal">
              <div className="modal-header">
                <h2>Apply for {job.title}</h2>
                <button onClick={() => setShowApplicationForm(false)} className="close-btn">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="application-form">
                <div className="form-section">
                  <h3>Personal Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="form-control" />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="form-control" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email *</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required className="form-control" />
                    </div>
                    <div className="form-group">
                      <label>Phone *</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="form-control" />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Professional Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Years of Experience *</label>
                      <input type="number" name="experience" value={formData.experience} onChange={handleChange} required className="form-control" min="0" />
                    </div>
                    <div className="form-group">
                      <label>Expected Salary</label>
                      <input type="number" name="expectedSalary" value={formData.expectedSalary} onChange={handleChange} className="form-control" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Current Company</label>
                      <input type="text" name="currentCompany" value={formData.currentCompany} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="form-group">
                      <label>Current Position</label>
                      <input type="text" name="currentPosition" value={formData.currentPosition} onChange={handleChange} className="form-control" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Notice Period</label>
                    <input type="text" name="noticePeriod" value={formData.noticePeriod} onChange={handleChange} className="form-control" placeholder="e.g., 2 weeks, Immediate" />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Additional Information</h3>
                  <div className="form-group">
                    <label>Resume/CV * (PDF, DOC, DOCX - Max 5MB)</label>
                    <input type="file" onChange={handleFileChange} required accept=".pdf,.doc,.docx" className="form-control" />
                  </div>

                  <div className="form-group">
                    <label>Cover Letter</label>
                    <textarea name="coverLetter" value={formData.coverLetter} onChange={handleChange} rows="5" className="form-control" placeholder="Tell us why you're a great fit for this role..."></textarea>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Portfolio URL</label>
                      <input type="url" name="portfolio" value={formData.portfolio} onChange={handleChange} className="form-control" placeholder="https://" />
                    </div>
                    <div className="form-group">
                      <label>LinkedIn Profile</label>
                      <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} className="form-control" placeholder="https://linkedin.com/in/" />
                    </div>
                  </div>

                  {settings?.enableRecaptchaJobApply && settings?.recaptchaSiteKey && (
                    <div className="form-group recaptcha-notice">
                      <small>This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.</small>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                  <button type="button" onClick={() => setShowApplicationForm(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default JobDetail;

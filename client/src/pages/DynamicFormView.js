import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import SEO from '../components/SEO';
import { toast } from 'react-toastify';
import { FaCheckCircle } from 'react-icons/fa';
import './DynamicFormView.css';

const DynamicFormView = () => {
  const { slug } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({});
  const [settings, setSettings] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [countries, setCountries] = useState([
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 
    'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 
    'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 
    'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 
    'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 
    'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 
    'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 
    'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 
    'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 
    'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 
    'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 
    'Kazakhstan', 'Kenya', 'Kiribati', 'Korea North', 'Korea South', 'Kuwait', 'Kyrgyzstan', 
    'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 
    'Luxembourg', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 
    'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 
    'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 
    'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Norway', 'Oman', 'Pakistan', 
    'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 
    'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 
    'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 
    'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 
    'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Sudan', 'Spain', 'Sri Lanka', 
    'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 
    'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 
    'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 
    'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 
    'Yemen', 'Zambia', 'Zimbabwe'
  ]);

  useEffect(() => {
    fetchForm();
    fetchSettings();
  }, [slug]);

  const fetchForm = async () => {
    try {
      const res = await axios.get(`/api/forms/${slug}`);
      setForm(res.data.data);
      
      // Initialize form data
      const initialData = {};
      res.data.data.fields.forEach(field => {
        initialData[field.fieldId] = field.type === 'checkbox' ? [] : '';
      });
      setFormData(initialData);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching form:', err);
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

  const handleChange = (fieldId, value) => {
    setFormData({ ...formData, [fieldId]: value });
  };

  const handleCheckboxChange = (fieldId, option, checked) => {
    const currentValues = formData[fieldId] || [];
    if (checked) {
      setFormData({ ...formData, [fieldId]: [...currentValues, option] });
    } else {
      setFormData({ ...formData, [fieldId]: currentValues.filter(v => v !== option) });
    }
  };

  const validateField = (field, value) => {
    const validation = field.validation || {};
    
    // Required validation
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return validation.errorMessage || `${field.label} is required`;
    }

    // Skip other validations if field is not required and empty
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return null;
    }

    // Text/Textarea validations
    if (['text', 'textarea'].includes(field.type)) {
      if (validation.minLength && value.length < validation.minLength) {
        return validation.errorMessage || `Minimum ${validation.minLength} characters required`;
      }
      if (validation.maxLength && value.length > validation.maxLength) {
        return validation.errorMessage || `Maximum ${validation.maxLength} characters allowed`;
      }
      if (validation.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          return validation.errorMessage || 'Invalid format';
        }
      }
    }

    // Email validation
    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return validation.errorMessage || 'Please enter a valid email address';
      }
    }

    // Number validations
    if (field.type === 'number') {
      const numValue = parseFloat(value);
      if (validation.min !== undefined && numValue < validation.min) {
        return validation.errorMessage || `Minimum value is ${validation.min}`;
      }
      if (validation.max !== undefined && numValue > validation.max) {
        return validation.errorMessage || `Maximum value is ${validation.max}`;
      }
    }

    // Date validations
    if (field.type === 'date') {
      const dateValue = new Date(value);
      if (validation.minDate) {
        const minDate = new Date(validation.minDate);
        if (dateValue < minDate) {
          return validation.errorMessage || `Date must be after ${minDate.toLocaleDateString()}`;
        }
      }
      if (validation.maxDate) {
        const maxDate = new Date(validation.maxDate);
        if (dateValue > maxDate) {
          return validation.errorMessage || `Date must be before ${maxDate.toLocaleDateString()}`;
        }
      }
    }

    // Checkbox validations
    if (field.type === 'checkbox' && Array.isArray(value)) {
      if (validation.minSelect && value.length < validation.minSelect) {
        return validation.errorMessage || `Select at least ${validation.minSelect} option(s)`;
      }
      if (validation.maxSelect && value.length > validation.maxSelect) {
        return validation.errorMessage || `Select at most ${validation.maxSelect} option(s)`;
      }
    }

    // URL validation
    if (field.type === 'url') {
      const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlRegex.test(value)) {
        return validation.errorMessage || 'Please enter a valid URL';
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validate all fields
    const errors = {};
    form.fields.forEach(field => {
      const error = validateField(field, formData[field.fieldId]);
      if (error) {
        errors[field.fieldId] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitting(false);
      toast.error('Please fix the validation errors');
      return;
    }

    setFormErrors({});

    // Get reCAPTCHA token if enabled
    let captchaToken = '';
    if (form.enableRecaptcha && window.grecaptcha && settings?.recaptchaSiteKey) {
      try {
        captchaToken = await window.grecaptcha.execute(settings.recaptchaSiteKey, { action: 'submit' });
      } catch (err) {
        console.error('reCAPTCHA error:', err);
      }
    }

    // Prepare responses
    const responses = form.fields.map(field => ({
      fieldId: field.fieldId,
      label: field.label,
      value: formData[field.fieldId]
    }));

    try {
      await axios.post(`/api/forms/${form._id}/submit`, {
        responses,
        recaptchaToken: captchaToken
      });
      setSubmitted(true);
      toast.success(form.successMessage);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting form');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const error = formErrors[field.fieldId];
    const validation = field.validation || {};

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <>
            <input
              type={field.type}
              value={formData[field.fieldId] || ''}
              onChange={(e) => handleChange(field.fieldId, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              minLength={validation.minLength}
              maxLength={validation.maxLength}
              pattern={validation.pattern}
              className={`form-control ${error ? 'error' : ''}`}
            />
            {error && <span className="error-message">{error}</span>}
          </>
        );

      case 'number':
        return (
          <>
            <input
              type="number"
              value={formData[field.fieldId] || ''}
              onChange={(e) => handleChange(field.fieldId, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              min={validation.min}
              max={validation.max}
              className={`form-control ${error ? 'error' : ''}`}
            />
            {error && <span className="error-message">{error}</span>}
          </>
        );

      case 'textarea':
        return (
          <>
            <textarea
              value={formData[field.fieldId] || ''}
              onChange={(e) => handleChange(field.fieldId, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              minLength={validation.minLength}
              maxLength={validation.maxLength}
              rows="5"
              className={`form-control ${error ? 'error' : ''}`}
            ></textarea>
            {validation.maxLength && (
              <small style={{ display: 'block', marginTop: '0.25rem', color: 'var(--text-light)' }}>
                {(formData[field.fieldId] || '').length} / {validation.maxLength} characters
              </small>
            )}
            {error && <span className="error-message">{error}</span>}
          </>
        );

      case 'date':
        return (
          <>
            <input
              type="date"
              value={formData[field.fieldId] || ''}
              onChange={(e) => handleChange(field.fieldId, e.target.value)}
              required={field.required}
              min={validation.minDate ? new Date(validation.minDate).toISOString().split('T')[0] : undefined}
              max={validation.maxDate ? new Date(validation.maxDate).toISOString().split('T')[0] : undefined}
              className={`form-control ${error ? 'error' : ''}`}
            />
            {error && <span className="error-message">{error}</span>}
          </>
        );

      case 'select':
        return (
          <>
            <select
              value={formData[field.fieldId] || ''}
              onChange={(e) => handleChange(field.fieldId, e.target.value)}
              required={field.required}
              className={`form-control ${error ? 'error' : ''}`}
            >
              <option value="">-- Select --</option>
              {field.options?.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
            {error && <span className="error-message">{error}</span>}
          </>
        );

      case 'radio':
        return (
          <>
            <div className="radio-group">
              {field.options?.map((option, index) => (
                <label key={index} className="radio-label">
                  <input
                    type="radio"
                    name={field.fieldId}
                    value={option}
                    checked={formData[field.fieldId] === option}
                    onChange={(e) => handleChange(field.fieldId, e.target.value)}
                    required={field.required}
                  />
                  {option}
                </label>
              ))}
            </div>
            {error && <span className="error-message">{error}</span>}
          </>
        );

      case 'checkbox':
        return (
          <>
            <div className="checkbox-group">
              {field.options?.map((option, index) => (
                <label key={index} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={(formData[field.fieldId] || []).includes(option)}
                    onChange={(e) => handleCheckboxChange(field.fieldId, option, e.target.checked)}
                  />
                  {option}
                </label>
              ))}
            </div>
            {validation.minSelect && (
              <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-light)' }}>
                Select {validation.minSelect} to {validation.maxSelect || field.options?.length} options
              </small>
            )}
            {error && <span className="error-message">{error}</span>}
          </>
        );

      case 'url':
        return (
          <>
            <input
              type="url"
              value={formData[field.fieldId] || ''}
              onChange={(e) => handleChange(field.fieldId, e.target.value)}
              placeholder={field.placeholder || 'https://example.com'}
              required={field.required}
              className={`form-control ${error ? 'error' : ''}`}
            />
            {error && <span className="error-message">{error}</span>}
          </>
        );

      case 'color':
        return (
          <>
            <div className="color-picker-wrapper">
              <input
                type="color"
                value={formData[field.fieldId] || '#000000'}
                onChange={(e) => handleChange(field.fieldId, e.target.value)}
                required={field.required}
                className="color-picker"
              />
              <input
                type="text"
                value={formData[field.fieldId] || '#000000'}
                onChange={(e) => handleChange(field.fieldId, e.target.value)}
                placeholder="#000000"
                className="form-control color-text"
                style={{ flex: 1 }}
              />
            </div>
            {error && <span className="error-message">{error}</span>}
          </>
        );

      case 'gender':
        return (
          <>
            <div className="radio-group">
              {['Male', 'Female', 'Transgender', 'Other'].map((option, index) => (
                <label key={index} className="radio-label">
                  <input
                    type="radio"
                    name={field.fieldId}
                    value={option}
                    checked={formData[field.fieldId] === option}
                    onChange={(e) => handleChange(field.fieldId, e.target.value)}
                    required={field.required}
                  />
                  {option}
                </label>
              ))}
            </div>
            {error && <span className="error-message">{error}</span>}
          </>
        );

      case 'country':
        return (
          <>
            <select
              value={formData[field.fieldId] || ''}
              onChange={(e) => handleChange(field.fieldId, e.target.value)}
              required={field.required}
              className={`form-control ${error ? 'error' : ''}`}
            >
              <option value="">-- Select Country --</option>
              {countries.map((country, index) => (
                <option key={index} value={country}>{country}</option>
              ))}
            </select>
            {error && <span className="error-message">{error}</span>}
          </>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <div className="loading">Loading form...</div>;
  }

  if (!form) {
    return (
      <div className="form-not-found">
        <h2>Form Not Found</h2>
        <p>The form you're looking for doesn't exist or is no longer available.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="form-success">
        <div className="container">
          <div className="success-card">
            <FaCheckCircle className="success-icon" />
            <h1>Submission Successful!</h1>
            <p>{form.successMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title={form.title} description={form.description} />

      <div className="dynamic-form-page">
        <div className="container">
          <div className="form-wrapper">
            {form.featureImage && (
              <div className="form-feature-image">
                <img src={form.featureImage} alt={form.title} />
              </div>
            )}

            <h1>{form.title}</h1>
            {form.description && (
              <div 
                className="form-description" 
                dangerouslySetInnerHTML={{ __html: form.description }}
              ></div>
            )}

            <form onSubmit={handleSubmit} className="dynamic-form">
              {form.fields.sort((a, b) => a.order - b.order).map(field => (
                <div key={field.fieldId} className="form-group">
                  <label>
                    {field.label}
                    {field.required && <span className="required">*</span>}
                  </label>
                  {renderField(field)}
                </div>
              ))}

              {form.enableRecaptcha && settings?.recaptchaSiteKey && (
                <div className="recaptcha-notice">
                  <small>This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.</small>
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default DynamicFormView;

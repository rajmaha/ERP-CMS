import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import SEO from '../components/SEO';
import { FaArrowLeft, FaEnvelope, FaTag, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './ProductDetail.css';
import ShareButtons from '../components/ShareButtons';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [enquiryData, setEnquiryData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [recaptchaToken, setRecaptchaToken] = useState('');

  useEffect(() => {
    fetchProduct();
    fetchSettings();
    
    // Load reCAPTCHA
    if (window.grecaptcha) {
      window.grecaptcha.ready(() => {
        console.log('reCAPTCHA ready');
      });
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`/api/products/${id}`);
      setProduct(res.data.data);
      setSelectedImage(res.data.data.thumbnailImage);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching product:', err);
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

  const handleRecaptcha = (token) => {
    setRecaptchaToken(token);
  };

  const handleEnquiryChange = (e) => {
    const { name, value } = e.target;
    setEnquiryData({ ...enquiryData, [name]: value });
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Get reCAPTCHA token only if enabled
    let captchaToken = recaptchaToken;
    if (settings?.enableRecaptchaProductEnquiry && window.grecaptcha && settings?.recaptchaSiteKey) {
      try {
        captchaToken = await window.grecaptcha.execute(settings.recaptchaSiteKey, { action: 'submit' });
      } catch (err) {
        console.error('reCAPTCHA error:', err);
      }
    }

    try {
      await axios.post('/api/product-enquiries', {
        product: product._id,
        productName: product.name,
        ...enquiryData,
        recaptchaToken: captchaToken
      });
      toast.success('Enquiry sent successfully! We will contact you soon.');
      setShowEnquiryForm(false);
      setEnquiryData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product Not Found</h2>
        <Link to="/products" className="btn btn-primary">Back to Products</Link>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={product.name}
        description={product.shortDescription || product.description}
        keywords={product.category}
      />

      <div className="product-detail-page">
        <div className="container">
          <Link to="/products" className="back-link">
            <FaArrowLeft /> Back to Products
          </Link>

          <div className="product-detail-wrapper">
            {/* Product Images */}
            <div className="product-images-section">
              <div className="main-image">
                <img src={selectedImage} alt={product.name} />
              </div>
              {product.images && product.images.length > 0 && (
                <div className="thumbnail-images">
                  <div 
                    className={`thumbnail ${selectedImage === product.thumbnailImage ? 'active' : ''}`}
                    onClick={() => setSelectedImage(product.thumbnailImage)}
                  >
                    <img src={product.thumbnailImage} alt={product.name} />
                  </div>
                  {product.images.map((img, index) => (
                    <div 
                      key={index}
                      className={`thumbnail ${selectedImage === img ? 'active' : ''}`}
                      onClick={() => setSelectedImage(img)}
                    >
                      <img src={img} alt={`${product.name} ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="product-info-section">
              {product.category && (
                <span className="product-category">
                  <FaTag /> {product.category}
                </span>
              )}
              
              <h1>{product.name}</h1>
              
              {product.shortDescription && (
                <p className="product-short-desc">{product.shortDescription}</p>
              )}

              <div className="product-price-section">
                <span className="price-label">Price:</span>
                <span className="product-price">${product.price}</span>
              </div>

              <button onClick={() => setShowEnquiryForm(true)} className="btn btn-primary btn-large">
                <FaEnvelope /> Send Enquiry
              </button>

              {product.isFeatured && (
                <div className="featured-badge">
                  <FaCheckCircle /> Featured Product
                </div>
              )}
            </div>
          </div>

          {/* Product Description & Details */}
          <div className="product-details-content">
            <div className="detail-section">
              <h2>Product Description</h2>
              <div className="product-description" dangerouslySetInnerHTML={{ __html: product.description }}></div>
              
              <ShareButtons 
                url={window.location.href}
                title={product.name}
                description={product.shortDescription}
              />
            </div>

            {/* Product Modules/Features */}
            {product.modules && product.modules.length > 0 && (
              <div className="detail-section">
                <h2>Features & Modules</h2>
                <div className="modules-list">
                  {product.modules.sort((a, b) => a.order - b.order).map((module, index) => (
                    <div key={index} className="module-card">
                      {module.image && (
                        <div className="module-image">
                          <img src={module.image} alt={module.name} />
                        </div>
                      )}
                      <div className="module-content">
                        <h3>{module.name}</h3>
                        {module.description && (
                          <div className="module-description" dangerouslySetInnerHTML={{ __html: module.description }}></div>
                        )}
                        {module.features && module.features.length > 0 && (
                          <ul className="module-features">
                            {module.features.map((feature, idx) => (
                              <li key={idx}><FaCheckCircle /> {feature}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enquiry Form Modal */}
        {showEnquiryForm && (
          <>
            <div className="modal-overlay" onClick={() => setShowEnquiryForm(false)}></div>
            <div className="enquiry-modal">
              <div className="modal-header">
                <h2>Product Enquiry: {product.name}</h2>
                <button onClick={() => setShowEnquiryForm(false)} className="close-btn">✕</button>
              </div>

              <form onSubmit={handleEnquirySubmit} className="enquiry-form">
                <div className="form-group">
                  <label>Your Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={enquiryData.name} 
                    onChange={handleEnquiryChange} 
                    required 
                    className="form-control" 
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={enquiryData.email} 
                    onChange={handleEnquiryChange} 
                    required 
                    className="form-control" 
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={enquiryData.phone} 
                    onChange={handleEnquiryChange} 
                    className="form-control" 
                  />
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea 
                    name="message" 
                    value={enquiryData.message} 
                    onChange={handleEnquiryChange} 
                    required 
                    rows="5" 
                    className="form-control"
                    placeholder="Tell us about your requirements..."
                  ></textarea>
                </div>

                {settings?.enableRecaptchaProductEnquiry && settings?.recaptchaSiteKey && (
                  <div className="form-group recaptcha-notice">
                    <small>This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.</small>
                  </div>
                )}

                <div className="form-group">
                  <div className="g-recaptcha" 
                    data-sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                    data-callback="handleRecaptcha"
                  ></div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Sending...' : 'Send Enquiry'}
                  </button>
                  <button type="button" onClick={() => setShowEnquiryForm(false)} className="btn btn-secondary">
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

export default ProductDetail;


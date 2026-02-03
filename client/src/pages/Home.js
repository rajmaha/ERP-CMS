import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SEO from '../components/SEO';
import './Home.css';

const Home = () => {
  const [homeContent, setHomeContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeContent();
  }, []);

  const fetchHomeContent = async () => {
    try {
      const res = await axios.get('/api/pages/home-content');
      if (res.data.data) {
        setHomeContent(res.data.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching home content:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-page">Loading...</div>;
  }

  return (
    <>
      <SEO 
        title={homeContent?.heroTitle || "Welcome to ERP CMS"}
        description={homeContent?.heroSubtitle || "Your Complete Business Management Solution"}
        image={homeContent?.heroImage}
      />

      <div className="home-page">
        {/* Hero Section */}
        <section className="hero-section" style={{
          backgroundImage: homeContent?.heroImage ? `url(${homeContent.heroImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <div className="hero-overlay">
            <div className="container">
              <div className="hero-content">
                <h1 className="hero-title">
                  {homeContent?.heroTitle || 'Welcome to ERP CMS'}
                </h1>
                <p className="hero-subtitle">
                  {homeContent?.heroSubtitle || 'Your Complete Business Management Solution'}
                </p>
                <div className="hero-actions">
                  <a href="/contact" className="btn btn-primary">Get Started</a>
                  <a href="/about" className="btn btn-secondary">Learn More</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="features-section">
          <div className="container">
            <h2>Why Choose Us</h2>
            <div className="features-grid">
              {homeContent?.whyChooseUs && homeContent.whyChooseUs.length > 0 ? (
                homeContent.whyChooseUs.sort((a, b) => a.order - b.order).map((item, index) => (
                  <div key={index} className="feature-card">
                    <div className="feature-icon">
                      {/^[\p{Emoji}]+$/u.test(item.icon) ? item.icon : <i className={`fas fa-${item.icon}`}></i>}
                    </div>
                    <h3>{item.title}</h3>
                    <div dangerouslySetInnerHTML={{ __html: item.description }}></div>
                  </div>
                ))
              ) : (
                <>
                  <div className="feature-card">
                    <div className="feature-icon">🚀</div>
                    <h3>Fast & Reliable</h3>
                    <p>Lightning-fast performance with 99.9% uptime guarantee for your business operations</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">🔒</div>
                    <h3>Secure & Safe</h3>
                    <p>Enterprise-grade security with advanced encryption to protect your sensitive data</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">📱</div>
                    <h3>Fully Responsive</h3>
                    <p>Works seamlessly across all devices - desktop, tablet, and mobile</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">⚡</div>
                    <h3>Easy to Use</h3>
                    <p>Intuitive interface designed for both technical and non-technical users</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">🎨</div>
                    <h3>Customizable</h3>
                    <p>Flexible and customizable to match your brand and business needs</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">💬</div>
                    <h3>24/7 Support</h3>
                    <p>Round-the-clock customer support to help you whenever you need it</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Our Commitments Section */}
        <section className="commitments-section">
          <div className="container">
            <h2>Our Commitments</h2>
            <div className="commitments-grid">
              {homeContent?.commitments && homeContent.commitments.length > 0 ? (
                homeContent.commitments.sort((a, b) => a.order - b.order).map((item, index) => (
                  <div key={index} className="commitment-card">
                    <div className="commitment-number">{item.number}</div>
                    <h3>{item.title}</h3>
                    <div dangerouslySetInnerHTML={{ __html: item.description }}></div>
                  </div>
                ))
              ) : (
                <>
                  <div className="commitment-card">
                    <div className="commitment-number">01</div>
                    <h3>Quality First</h3>
                    <p>We never compromise on quality. Every feature is thoroughly tested and refined to ensure excellence in every aspect of our product.</p>
                  </div>
                  <div className="commitment-card">
                    <div className="commitment-number">02</div>
                    <h3>Customer Success</h3>
                    <p>Your success is our priority. We're dedicated to helping you achieve your business goals with our comprehensive support and resources.</p>
                  </div>
                  <div className="commitment-card">
                    <div className="commitment-number">03</div>
                    <h3>Innovation</h3>
                    <p>We continuously innovate and improve our platform with the latest technologies to keep you ahead of the competition.</p>
                  </div>
                  <div className="commitment-card">
                    <div className="commitment-number">04</div>
                    <h3>Transparency</h3>
                    <p>We believe in open communication and transparency in all our dealings. No hidden fees, no surprises - just honest business.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="container">
            <div className="stats-grid">
              {homeContent?.statistics && homeContent.statistics.length > 0 ? (
                homeContent.statistics.sort((a, b) => a.order - b.order).map((stat, index) => (
                  <div key={index} className="stat-card">
                    <div className="stat-number">{stat.number}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                ))
              ) : (
                <>
                  <div className="stat-card">
                    <div className="stat-number">10K+</div>
                    <div className="stat-label">Happy Clients</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">50+</div>
                    <div className="stat-label">Team Members</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">99.9%</div>
                    <div className="stat-label">Uptime</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">24/7</div>
                    <div className="stat-label">Support</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <h2>{homeContent?.ctaTitle || 'Ready to Get Started?'}</h2>
            <p>{homeContent?.ctaDescription || 'Join thousands of satisfied customers and transform your business today'}</p>
            <a href={homeContent?.ctaButtonLink || '/contact'} className="btn btn-primary btn-lg">
              {homeContent?.ctaButtonText || 'Contact Us Now'}
            </a>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;

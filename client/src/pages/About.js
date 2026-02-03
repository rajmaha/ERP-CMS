import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SEO from '../components/SEO';
import './About.css';

const About = () => {
  const [aboutContent, setAboutContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    try {
      const res = await axios.get('/api/pages/about-content');
      if (res.data.data) {
        setAboutContent(res.data.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching about content:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-page">Loading...</div>;
  }

  return (
    <>
      <SEO 
        title={aboutContent?.title || "About Us"}
        description="Learn more about our company, mission, vision, and values"
      />

      <div className="about-page">
        <section className="about-hero">
          <div className="container">
            <h1>{aboutContent?.title || 'About Us'}</h1>
            <p>Learn more about who we are and what we stand for</p>
          </div>
        </section>

        <section className="about-content">
          <div className="container">
            <div className="content-wrapper">
              <h2>Who We Are</h2>
              {aboutContent?.content ? (
                <div dangerouslySetInnerHTML={{ __html: aboutContent.content }}></div>
              ) : (
                <p>We are a leading provider of innovative business solutions, dedicated to helping companies achieve their goals through cutting-edge technology and exceptional service. With years of experience in the industry, we understand the challenges businesses face and provide tailored solutions to overcome them.</p>
              )}
            </div>
          </div>
        </section>

        <section className="mission-vision-section">
          <div className="container">
            <div className="mission-vision-grid">
              <div className="mission-card">
                <div className="card-icon">🎯</div>
                <h2>Our Mission</h2>
                {aboutContent?.mission ? (
                  <div dangerouslySetInnerHTML={{ __html: aboutContent.mission }}></div>
                ) : (
                  <p>To empower businesses with innovative technology solutions that drive growth, efficiency, and success. We strive to be a trusted partner in our clients' journey toward digital transformation.</p>
                )}
              </div>
              <div className="vision-card">
                <div className="card-icon">🚀</div>
                <h2>Our Vision</h2>
                {aboutContent?.vision ? (
                  <div dangerouslySetInnerHTML={{ __html: aboutContent.vision }}></div>
                ) : (
                  <p>To be the leading provider of business management solutions globally, recognized for our innovation, reliability, and commitment to customer success.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="values-section">
          <div className="container">
            <h2>Our Core Values</h2>
            <div className="values-grid">
              {aboutContent?.values && aboutContent.values.length > 0 ? (
                aboutContent.values.map((value, index) => (
                  <div key={index} className="value-card">
                    <div className="value-number">{index + 1}</div>
                    <h3>{value}</h3>
                  </div>
                ))
              ) : (
                <>
                  <div className="value-card">
                    <div className="value-number">1</div>
                    <h3>Integrity</h3>
                    <p>We conduct business with honesty and transparency in all our interactions</p>
                  </div>
                  <div className="value-card">
                    <div className="value-number">2</div>
                    <h3>Excellence</h3>
                    <p>We strive for excellence in everything we do, never settling for mediocrity</p>
                  </div>
                  <div className="value-card">
                    <div className="value-number">3</div>
                    <h3>Innovation</h3>
                    <p>We embrace change and continuously seek new ways to improve and innovate</p>
                  </div>
                  <div className="value-card">
                    <div className="value-number">4</div>
                    <h3>Customer Focus</h3>
                    <p>Our customers are at the heart of everything we do</p>
                  </div>
                  <div className="value-card">
                    <div className="value-number">5</div>
                    <h3>Teamwork</h3>
                    <p>We believe in the power of collaboration and working together</p>
                  </div>
                  <div className="value-card">
                    <div className="value-number">6</div>
                    <h3>Accountability</h3>
                    <p>We take responsibility for our actions and deliver on our promises</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="why-choose-section">
          <div className="container">
            <h2>Why Choose Us</h2>
            <div className="choose-grid">
              {aboutContent?.whyChooseUs && aboutContent.whyChooseUs.length > 0 ? (
                aboutContent.whyChooseUs.sort((a, b) => a.order - b.order).map((item, index) => (
                  <div key={index} className="choose-card">
                    <div className="choose-icon">
                      {/^[\p{Emoji}]+$/u.test(item.icon) ? item.icon : <i className={`fas fa-${item.icon}`}></i>}
                    </div>
                    <h3>{item.title}</h3>
                    <div dangerouslySetInnerHTML={{ __html: item.description }}></div>
                  </div>
                ))
              ) : (
                <>
                  <div className="choose-card">
                    <div className="choose-icon">💼</div>
                    <h3>Industry Expertise</h3>
                    <p>Years of experience serving diverse industries with specialized knowledge and insights</p>
                  </div>
                  <div className="choose-card">
                    <div className="choose-icon">🏆</div>
                    <h3>Proven Track Record</h3>
                    <p>Successful implementations and satisfied clients across the globe</p>
                  </div>
                  <div className="choose-card">
                    <div className="choose-icon">🤝</div>
                    <h3>Dedicated Support</h3>
                    <p>Our team is always ready to help you succeed with personalized assistance</p>
                  </div>
                  <div className="choose-card">
                    <div className="choose-icon">⚡</div>
                    <h3>Cutting-Edge Technology</h3>
                    <p>Latest technologies and best practices to keep you ahead of the competition</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;

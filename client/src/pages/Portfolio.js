import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SEO from '../components/SEO';
import './Portfolio.css';

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, [selectedCategory]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const url = selectedCategory 
        ? `/api/portfolio?category=${selectedCategory}`
        : '/api/portfolio';
      const res = await axios.get(url);
      setPortfolio(res.data.data);
      
      const uniqueCategories = [...new Set(res.data.data.map(p => p.category))];
      setCategories(uniqueCategories);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Our Portfolio - ERP CMS"
        description="Explore our portfolio of successful projects and client implementations."
        keywords={['Portfolio', 'Projects', 'Case Studies', 'Work']}
      />

      <div className="page-header">
        <div className="container">
          <h1>Our Portfolio</h1>
          <p>Successful projects delivered for our clients</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* Category Filter */}
          <div className="filter-bar">
            <button 
              className={`filter-btn ${!selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory('')}
            >
              All Projects
            </button>
            {categories.map(category => (
              <button 
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Portfolio Grid */}
          {loading ? (
            <div className="loading">Loading portfolio...</div>
          ) : portfolio.length > 0 ? (
            <div className="portfolio-grid">
              {portfolio.map(item => (
                <Link to={`/portfolio/${item.slug}`} key={item._id} className="portfolio-item">
                  <div className="portfolio-item-image">
                    <img src={item.thumbnailImage} alt={item.title} />
                    <div className="portfolio-item-overlay">
                      <span className="portfolio-category">{item.category}</span>
                      <h3>{item.title}</h3>
                      <p>{item.shortDescription}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>No projects found in this category.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Portfolio;

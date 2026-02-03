import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import SEO from '../components/SEO';
import { FaArrowLeft, FaExternalLinkAlt, FaCalendar } from 'react-icons/fa';
import './Detail.css';

const PortfolioDetail = () => {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolioItem();
  }, [slug]);

  const fetchPortfolioItem = async () => {
    try {
      const res = await axios.get(`/api/portfolio/${slug}`);
      setItem(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching portfolio item:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-page">Loading...</div>;
  }

  if (!item) {
    return <div className="not-found-page">Portfolio item not found</div>;
  }

  return (
    <>
      <SEO 
        title={item.metaTitle || `${item.title} - Portfolio`}
        description={item.metaDescription || item.shortDescription}
        keywords={item.metaKeywords || item.tags}
      />

      <div className="detail-page">
        <div className="container">
          <Link to="/portfolio" className="back-link">
            <FaArrowLeft /> Back to Portfolio
          </Link>

          <div className="portfolio-header">
            <span className="detail-category">{item.category}</span>
            <h1>{item.title}</h1>
            {item.client && <p className="portfolio-client">Client: {item.client}</p>}
            
            <div className="portfolio-meta">
              {item.completedAt && (
                <div className="meta-item">
                  <FaCalendar />
                  <span>{new Date(item.completedAt).toLocaleDateString()}</span>
                </div>
              )}
              {item.projectUrl && (
                <a href={item.projectUrl} target="_blank" rel="noopener noreferrer" className="meta-item">
                  <FaExternalLinkAlt />
                  <span>View Live Project</span>
                </a>
              )}
            </div>
          </div>

          {item.images && item.images.length > 0 && (
            <div className="portfolio-images">
              {item.images.map((image, index) => (
                <div key={index} className="portfolio-image-item">
                  <img src={image.url} alt={image.caption || item.title} />
                  {image.caption && <p className="image-caption">{image.caption}</p>}
                </div>
              ))}
            </div>
          )}

          <div className="portfolio-details">
            <div className="portfolio-main">
              <h2>Project Overview</h2>
              <div dangerouslySetInnerHTML={{ __html: item.description }} />

              {item.challenges && (
                <>
                  <h2>Challenges</h2>
                  <p>{item.challenges}</p>
                </>
              )}

              {item.solutions && (
                <>
                  <h2>Solutions</h2>
                  <p>{item.solutions}</p>
                </>
              )}

              {item.results && (
                <>
                  <h2>Results</h2>
                  <p>{item.results}</p>
                </>
              )}
            </div>

            <div className="portfolio-sidebar">
              {item.technologies && item.technologies.length > 0 && (
                <div className="sidebar-section card">
                  <h3>Technologies Used</h3>
                  <div className="tech-tags">
                    {item.technologies.map(tech => (
                      <span key={tech} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                </div>
              )}

              {item.tags && item.tags.length > 0 && (
                <div className="sidebar-section card">
                  <h3>Tags</h3>
                  <div className="detail-tags">
                    {item.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PortfolioDetail;

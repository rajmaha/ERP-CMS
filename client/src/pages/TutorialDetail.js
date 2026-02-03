import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { FaArrowLeft, FaClock, FaUser, FaEye, FaTag, FaGraduationCap } from 'react-icons/fa';
import './TutorialDetail.css';

const TutorialDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [tutorial, setTutorial] = useState(null);
  const [relatedTutorials, setRelatedTutorials] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTutorial = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/tutorials/by-slug/${slug}`);
      setTutorial(res.data.data);
      
      if (res.data.data.relatedTutorials) {
        setRelatedTutorials(res.data.data.relatedTutorials);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tutorial:', err);
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchTutorial();
  }, [slug, fetchTutorial]);

  if (loading) {
    return <div className="loading-page">Loading tutorial...</div>;
  }

  if (!tutorial) {
    return (
      <div className="error-page">
        <h1>Tutorial not found</h1>
        <Link to="/tutorials" className="btn btn-primary">Back to Tutorials</Link>
      </div>
    );
  }

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner':
        return '#27ae60';
      case 'intermediate':
        return '#f39c12';
      case 'advanced':
        return '#e74c3c';
      default:
        return '#3498db';
    }
  };

  const getVideoEmbedUrl = () => {
    if (!tutorial.videoId) return '';
    
    if (tutorial.videoType === 'youtube') {
      return `https://www.youtube.com/embed/${tutorial.videoId}`;
    } else if (tutorial.videoType === 'vimeo') {
      return `https://player.vimeo.com/video/${tutorial.videoId}`;
    }
    return '';
  };

  return (
    <>
      <SEO 
        title={tutorial.metaTitle || tutorial.title}
        description={tutorial.metaDescription || tutorial.description}
        keywords={tutorial.metaKeywords || tutorial.tags?.join(', ')}
      />

      <div className="tutorial-detail-page">
        <div className="container">
          <button onClick={() => navigate(-1)} className="back-btn">
            <FaArrowLeft /> Back
          </button>

          <article className="tutorial-article">
            {/* Hero Section */}
            {tutorial.featuredImage && (
              <div className="tutorial-hero">
                <img src={tutorial.featuredImage} alt={tutorial.title} className="hero-image" />
              </div>
            )}

            {/* Header */}
            <header className="article-header">
              <div className="header-meta">
                <Link to={`/tutorials?category=${tutorial.category?._id}`} className="category-link" style={{ color: tutorial.category?.color }}>
                  {tutorial.category?.icon} {tutorial.category?.name}
                </Link>
                
                <span className="difficulty-badge" style={{ backgroundColor: getDifficultyColor(tutorial.difficulty) }}>
                  {tutorial.difficulty}
                </span>
              </div>

              <h1>{tutorial.title}</h1>

              {tutorial.description && (
                <p className="article-description">{tutorial.description}</p>
              )}

              <div className="article-meta-info">
                <span className="meta-item">
                  <FaUser /> {tutorial.author?.name}
                </span>
                <span className="meta-item">
                  <FaEye /> {tutorial.views} views
                </span>
                {tutorial.duration && (
                  <span className="meta-item">
                    <FaClock /> {tutorial.duration} minutes
                  </span>
                )}
              </div>
            </header>

            {/* Video Section */}
            {tutorial.videoId && tutorial.videoType !== 'none' && (
              <div className="video-section">
                <div className="video-container">
                  <iframe
                    src={getVideoEmbedUrl()}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={tutorial.title}
                  ></iframe>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="article-content">
              <div dangerouslySetInnerHTML={{ __html: tutorial.content }} />
            </div>

            {/* Code Examples */}
            {tutorial.codeExamples && tutorial.codeExamples.length > 0 && (
              <div className="code-examples-section">
                <h2>Code Examples</h2>
                {tutorial.codeExamples.map((example, idx) => (
                  <div key={idx} className="code-example">
                    {example.title && <h3>{example.title}</h3>}
                    <div className="language-badge">{example.language}</div>
                    <pre>
                      <code>{example.code}</code>
                    </pre>
                  </div>
                ))}
              </div>
            )}

            {/* Tags */}
            {tutorial.tags && tutorial.tags.length > 0 && (
              <div className="tags-section">
                <h3>Tags</h3>
                <div className="tags-list">
                  {tutorial.tags.map((tag, idx) => (
                    <Link key={idx} to={`/tutorials?search=${tag}`} className="tag-link">
                      <FaTag /> {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related Tutorials */}
            {relatedTutorials && relatedTutorials.length > 0 && (
              <div className="related-section">
                <h2>Related Tutorials</h2>
                <div className="related-tutorials">
                  {relatedTutorials.map(related => (
                    <Link 
                      key={related._id} 
                      to={`/tutorial/${related.slug}`} 
                      className="related-item card"
                    >
                      <span className="difficulty-badge" style={{ backgroundColor: getDifficultyColor(related.difficulty) }}>
                        {related.difficulty}
                      </span>
                      <h4>{related.title}</h4>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="article-sidebar">
            <div className="sidebar-widget card">
              <h3>About This Tutorial</h3>
              <div className="widget-content">
                <p><strong>Difficulty Level:</strong> <span style={{ color: getDifficultyColor(tutorial.difficulty) }}>{tutorial.difficulty.toUpperCase()}</span></p>
                {tutorial.duration && <p><strong>Duration:</strong> {tutorial.duration} minutes</p>}
                <p><strong>Category:</strong> {tutorial.category?.name}</p>
                <p><strong>Views:</strong> {tutorial.views}</p>
              </div>
            </div>

            <div className="sidebar-widget card">
              <h3><FaGraduationCap /> Continue Learning</h3>
              <Link to="/tutorials" className="btn btn-primary btn-block">
                View All Tutorials
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default TutorialDetail;

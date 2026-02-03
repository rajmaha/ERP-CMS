import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SEO from '../components/SEO';
import { FaGraduationCap, FaClock, FaUser, FaEye, FaTag } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Tutorials.css';

const Tutorials = () => {
  const [tutorials, setTutorials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  const fetchTutorials = useCallback(async () => {
    try {
      setLoading(true);
      let params = new URLSearchParams();
      params.append('limit', limit);
      params.append('page', page);
      
      if (categoryFilter) params.append('category', categoryFilter);
      if (difficulty !== 'all') params.append('difficulty', difficulty);
      if (search) params.append('search', search);
      
      const res = await axios.get(`/api/tutorials?${params.toString()}`);
      setTutorials(res.data.data);
      setTotal(res.data.total);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tutorials:', err);
      setLoading(false);
    }
  }, [categoryFilter, difficulty, search, page]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/tutorials/categories/list');
      setCategories(res.data.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [categoryFilter, difficulty, search]);

  useEffect(() => {
    fetchTutorials();
  }, [fetchTutorials]);

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'difficulty-beginner';
      case 'intermediate':
        return 'difficulty-intermediate';
      case 'advanced':
        return 'difficulty-advanced';
      default:
        return '';
    }
  };

  const pages = Math.ceil(total / limit);

  if (loading && tutorials.length === 0) {
    return <div className="loading-page">Loading tutorials...</div>;
  }

  return (
    <>
      <SEO 
        title="Tutorials - Learn & Master"
        description="Explore our comprehensive collection of step-by-step tutorials"
      />

      <div className="tutorials-page">
        <div className="container">
          {/* Header */}
          <header className="tutorials-header">
            <h1>
              <FaGraduationCap /> Learn & Master
            </h1>
            <p>Comprehensive step-by-step tutorials to help you succeed</p>
          </header>

          {/* Search Bar */}
          <div className="search-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search tutorials..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="filters-section">
            <div className="filter-group">
              <label>Difficulty:</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="filter-select">
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {categories.length > 0 && (
              <div className="filter-group">
                <label>Category:</label>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="filter-select">
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Tutorials Grid */}
          {tutorials.length > 0 ? (
            <>
              <div className="tutorials-grid">
                {tutorials.map(tutorial => (
                  <Link to={`/tutorial/${tutorial.slug}`} key={tutorial._id} className="tutorial-card card">
                    {tutorial.featuredImage && (
                      <div className="tutorial-image">
                        <img src={tutorial.featuredImage} alt={tutorial.title} />
                        <div className="difficulty-badge" style={{ backgroundColor: getDifficultyColor(tutorial.difficulty) }}>
                          {tutorial.difficulty}
                        </div>
                      </div>
                    )}
                    
                    <div className="tutorial-content">
                      <div className="tutorial-category" style={{ color: tutorial.category?.color }}>
                        {tutorial.category?.icon} {tutorial.category?.name}
                      </div>
                      
                      <h3>{tutorial.title}</h3>
                      
                      {tutorial.description && (
                        <p className="tutorial-description">{tutorial.description}</p>
                      )}
                      
                      <div className="tutorial-meta">
                        {tutorial.duration && (
                          <span className="meta-item">
                            <FaClock /> {tutorial.duration} min
                          </span>
                        )}
                        <span className="meta-item">
                          <FaEye /> {tutorial.views} views
                        </span>
                        <span className="meta-item">
                          <FaUser /> {tutorial.author?.name}
                        </span>
                      </div>
                      
                      {tutorial.tags && tutorial.tags.length > 0 && (
                        <div className="tutorial-tags">
                          {tutorial.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="tag">
                              <FaTag /> {tag}
                            </span>
                          ))}
                          {tutorial.tags.length > 3 && <span className="tag more">+{tutorial.tags.length - 3}</span>}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => setPage(Math.max(1, page - 1))} 
                    disabled={page === 1}
                    className="pagination-btn"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`pagination-btn ${page === p ? 'active' : ''}`}
                    >
                      {p}
                    </button>
                  ))}
                  
                  <button 
                    onClick={() => setPage(Math.min(pages, page + 1))} 
                    disabled={page === pages}
                    className="pagination-btn"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state card">
              <p>No tutorials found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Tutorials;

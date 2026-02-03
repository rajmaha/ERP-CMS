import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SEO from '../components/SEO';
import { FaPlay, FaTimes } from 'react-icons/fa';
import './Gallery.css';

const Gallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchGallery = useCallback(async () => {
    try {
      let params = filter !== 'all' ? `?type=${filter}` : '';
      if (categoryFilter) params += `${params ? '&' : '?'}category=${categoryFilter}`;
      
      const res = await axios.get(`/api/gallery${params}`);
      setItems(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching gallery:', err);
      setLoading(false);
    }
  }, [filter, categoryFilter]);

  useEffect(() => {
    fetchGallery();
    fetchCategories();
  }, [filter, categoryFilter, fetchGallery]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/gallery/categories/list');
      setCategories(res.data.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const openModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setSelectedItem(null), 300);
  };

  const getVideoEmbedUrl = (item) => {
    if (item.videoType === 'youtube') {
      return `https://www.youtube.com/embed/${item.videoId}`;
    } else if (item.videoType === 'facebook') {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(item.videoUrl)}`;
    } else if (item.videoType === 'vimeo') {
      return `https://player.vimeo.com/video/${item.videoId}`;
    }
    return '';
  };

  if (loading) {
    return <div className="loading-page">Loading gallery...</div>;
  }

  return (
    <>
      <SEO 
        title="Photo & Video Gallery - ERP CMS"
        description="Browse our collection of photos and videos"
      />

      <div className="gallery-page">
        <div className="container">
          <header className="gallery-header">
            <h1>Gallery</h1>
            <p>Explore our collection of photos and videos</p>
          </header>

          <div className="gallery-filters">
            <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              All
            </button>
            <button className={`filter-btn ${filter === 'photo' ? 'active' : ''}`} onClick={() => setFilter('photo')}>
              Photos
            </button>
            <button className={`filter-btn ${filter === 'video' ? 'active' : ''}`} onClick={() => setFilter('video')}>
              Videos
            </button>
          </div>

          {categories.length > 0 && (
            <div className="category-filters">
              <button
                className={`category-btn ${categoryFilter === '' ? 'active' : ''}`}
                onClick={() => setCategoryFilter('')}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat._id}
                  className={`category-btn ${categoryFilter === cat._id ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(cat._id)}
                  style={{ borderColor: cat.color }}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          )}

          {items.length > 0 ? (
            <div className="gallery-grid">
              {items.map(item => (
                <div
                  key={item._id}
                  className="gallery-item"
                  onClick={() => openModal(item)}
                >
                  <div className="gallery-item-image">
                    {item.type === 'photo' ? (
                      <img src={item.image} alt={item.title} />
                    ) : (
                      <>
                        <img 
                          src={item.thumbnail || '/placeholder-video.jpg'} 
                          alt={item.title}
                        />
                        <div className="play-overlay">
                          <FaPlay />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="gallery-item-info">
                    <h3>{item.title}</h3>
                    {item.description && <div dangerouslySetInnerHTML={{ __html: item.description }}></div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-gallery">
              <p>No items to display</p>
            </div>
          )}
        </div>

        {/* Lightbox Modal */}
        {showModal && selectedItem && (
          <div className={`gallery-modal ${showModal ? 'active' : ''}`} onClick={closeModal}>
            <div className="modal-close" onClick={closeModal}>
              <FaTimes />
            </div>

            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              {selectedItem.type === 'photo' ? (
                <img src={selectedItem.image} alt={selectedItem.title} />
              ) : (
                <div className="video-container">
                  <iframe
                    src={getVideoEmbedUrl(selectedItem)}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={selectedItem.title}
                  ></iframe>
                </div>
              )}

              <div className="modal-info">
                <h2>{selectedItem.title}</h2>
                {selectedItem.description && <div dangerouslySetInnerHTML={{ __html: selectedItem.description }}></div>}
                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div className="tags">
                    {selectedItem.tags.map((tag, idx) => (
                      <span key={idx} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Gallery;

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [categories, setCategories] = useState([]);

  const fetchProducts = useCallback(async () => {
    try {
      const params = filter !== 'all' ? `?category=${filter}` : '';
      const res = await axios.get(`/api/products${params}`);
      setProducts(res.data.data);
      
      // Extract unique categories
      const cats = [...new Set(res.data.data.map(p => p.category).filter(Boolean))];
      setCategories(cats);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) {
    return <div className="loading-page">Loading...</div>;
  }

  return (
    <>
      <SEO 
        title="Our Products"
        description="Explore our range of products and services"
      />

      <div className="products-page">
        <section className="products-hero">
          <div className="container">
            <h1>Our Products</h1>
            <p>Discover our premium products and solutions</p>
          </div>
        </section>

        <section className="products-content">
          <div className="container">
            {categories.length > 0 && (
              <div className="products-filter">
                <button 
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All Products
                </button>
                {categories.map((cat, index) => (
                  <button 
                    key={index}
                    className={`filter-btn ${filter === cat ? 'active' : ''}`}
                    onClick={() => setFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {products.length > 0 ? (
              <div className="products-grid">
                {products.map((product) => (
                  <div key={product._id} className="product-card">
                    {product.thumbnailImage && (
                      <div className="product-image">
                        <img src={product.thumbnailImage} alt={product.name} />
                      </div>
                    )}
                    <div className="product-info">
                      {product.category && (
                        <span className="product-category">{product.category}</span>
                      )}
                      <h3>{product.name}</h3>
                      {product.shortDescription && (
                        <p className="product-description">{product.shortDescription}</p>
                      )}
                      <div className="product-price">${product.price}</div>
                      
                      {product.modules && product.modules.length > 0 && (
                        <div className="product-modules">
                          <h4>Modules:</h4>
                          <ul>
                            {product.modules.map((module, index) => (
                              <li key={index}>{module.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {product.description && (
                        <div className="product-details" dangerouslySetInnerHTML={{ __html: product.description }}></div>
                      )}
                    </div>
                    <div className="product-actions">
                      <Link to={`/products/${product._id}`} className="btn btn-primary">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No products available at the moment.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Products;

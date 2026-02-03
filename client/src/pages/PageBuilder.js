import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import SEO from '../components/SEO';
import './PageBuilder.css';

const PageBuilder = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchPage = useCallback(async () => {
    try {
      const res = await axios.get(`/api/pages/${slug}`);
      setPage(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching page:', err);
      setNotFound(true);
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  if (loading) {
    return <div className="loading-page">Loading...</div>;
  }

  if (notFound || !page) {
    return (
      <div className="page-not-found">
        <div className="container">
          <h1>404 - Page Not Found</h1>
          <p>The page you're looking for doesn't exist.</p>
          <a href="/" className="btn btn-primary">Go Home</a>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={page.metaTitle || page.title}
        description={page.metaDescription || page.excerpt}
        keywords={page.metaKeywords}
        ogTitle={page.ogTitle}
        ogDescription={page.ogDescription}
        ogImage={page.ogImage}
      />

      <div className="page-builder">
        {/* Hero Section */}
        {page.featuredImage && (
          <section className="page-hero" style={{ backgroundImage: `url(${page.featuredImage})` }}>
            <div className="page-hero-overlay">
              <div className="container">
                <h1>{page.title}</h1>
                {page.excerpt && <p className="page-excerpt">{page.excerpt}</p>}
              </div>
            </div>
          </section>
        )}

        {/* Page Content */}
        <section className="page-content">
          <div className="container">
            {!page.featuredImage && <h1>{page.title}</h1>}
            <div className="content-wrapper" dangerouslySetInnerHTML={{ __html: page.content }}></div>
          </div>
        </section>
      </div>
    </>
  );
};

export default PageBuilder;

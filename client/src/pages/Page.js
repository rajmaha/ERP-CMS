import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import SEO from '../components/SEO';
import './Page.css';

const Page = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, [slug]);

  const fetchPage = async () => {
    try {
      const res = await axios.get(`/api/pages/${slug}`);
      setPage(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching page:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-page">Loading...</div>;
  }

  if (!page) {
    return <div className="not-found-page">Page not found</div>;
  }

  return (
    <>
      <SEO 
        title={page.metaTitle || page.title}
        description={page.metaDescription || page.excerpt}
        keywords={page.metaKeywords}
        ogTitle={page.ogTitle}
        ogDescription={page.ogDescription}
        ogImage={page.ogImage || page.featuredImage}
        canonicalUrl={page.canonicalUrl}
      />

      <div className="dynamic-page">
        {page.featuredImage && (
          <div className="page-featured-image">
            <img src={page.featuredImage} alt={page.title} />
          </div>
        )}

        <div className="container">
          <article className="page-article">
            <header className="page-article-header">
              <h1>{page.title}</h1>
              {page.excerpt && <p className="page-excerpt">{page.excerpt}</p>}
              <div className="page-meta">
                <span>By {page.author?.name}</span>
                <span>•</span>
                <span>{new Date(page.publishedAt || page.createdAt).toLocaleDateString()}</span>
              </div>
            </header>

            <div className="page-content" dangerouslySetInnerHTML={{ __html: page.content }} />
          </article>
        </div>
      </div>
    </>
  );
};

export default Page;

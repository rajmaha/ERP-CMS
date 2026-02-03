import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  keywords = [], 
  ogTitle, 
  ogDescription, 
  ogImage,
  canonicalUrl,
  type = 'website'
}) => {
  const siteUrl = process.env.REACT_APP_SITE_URL || 'http://localhost:3000';
  const defaultImage = `${siteUrl}/og-image.jpg`;

  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }
  }, [title]);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title || 'ERP CMS'}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={ogImage || defaultImage} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle || title} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={ogImage || defaultImage} />
    </Helmet>
  );
};

export default SEO;

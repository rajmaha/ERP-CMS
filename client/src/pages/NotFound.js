import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import './NotFound.css';

const NotFound = () => {
  return (
    <>
      <SEO 
        title="404 - Page Not Found"
        description="The page you are looking for does not exist."
      />

      <div className="not-found">
        <div className="container">
          <div className="not-found-content">
            <h1 className="not-found-title">404</h1>
            <h2>Page Not Found</h2>
            <p>Sorry, the page you are looking for doesn't exist or has been moved.</p>
            <Link to="/" className="btn btn-primary btn-lg">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { SettingsProvider, useSettings } from './context/SettingsContext';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import Clients from './pages/Clients';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Careers from './pages/Careers';
import JobDetail from './pages/JobDetail';
import Login from './pages/Login';
import ProductDetail from './pages/ProductDetail';
import DynamicFormView from './pages/DynamicFormView';
import Tutorials from './pages/Tutorials';
import TutorialDetail from './pages/TutorialDetail';
import Register from './pages/Register';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import HomeContentForm from './pages/admin/HomeContentForm';
import AboutContentForm from './pages/admin/AboutContentForm';
import PageForm from './pages/admin/PageForm';
import MediaLibrary from './pages/admin/MediaLibrary';
import GalleryForm from './pages/admin/GalleryForm';
import ProductList from './pages/admin/ProductList';
import ProductForm from './pages/admin/ProductForm';
import PortfolioList from './pages/admin/PortfolioList';
import PortfolioForm from './pages/admin/PortfolioForm';
import TestimonialList from './pages/admin/TestimonialList';
import TestimonialForm from './pages/admin/TestimonialForm';
import ClientList from './pages/admin/ClientList';
import ClientForm from './pages/admin/ClientForm';
import MenuManager from './pages/admin/MenuManager';
import Settings from './pages/admin/Settings';
import BlogList from './pages/admin/BlogList';
import BlogForm from './pages/admin/BlogForm';
import BlogCategories from './pages/admin/BlogCategories';
import JobsList from './pages/admin/JobsList';
import JobForm from './pages/admin/JobForm';
import ApplicationsList from './pages/admin/ApplicationsList';
import ContactMessages from './pages/admin/ContactMessages';
import DepartmentManager from './pages/admin/DepartmentManager';
import ProductEnquiries from './pages/admin/ProductEnquiries';
import DemoRequests from './pages/admin/DemoRequests';
import FormsList from './pages/admin/FormsList';
import FormBuilder from './pages/admin/FormBuilder';
import FormSubmissions from './pages/admin/FormSubmissions';
import PagesList from './pages/admin/PagesList';
import AdminTutorials from './pages/admin/AdminTutorials';
import TutorialForm from './pages/admin/TutorialForm';
import TutorialCategories from './pages/admin/TutorialCategoryTree';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UsersList from './pages/admin/UsersList';
import UserForm from './pages/admin/UserForm';
import VerifyEmail from './pages/VerifyEmail';
import ResendVerification from './pages/ResendVerification';

import './App.css';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [brandingLoaded, setBrandingLoaded] = useState(false);
  const { settings, loading: settingsLoading } = useSettings();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Secret keyboard shortcut (Ctrl+Shift+L) to access admin login
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        window.location.href = '/admin-login';
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Fetch and apply branding colors
  useEffect(() => {
    const fetchAndApplyBranding = async () => {
      try {
        const res = await axios.get('/api/settings');
        const data = res.data.data;
        const branding = data?.branding;
        
        // Update favicon if available
        if (data?.favicon) {
          let faviconLink = document.querySelector("link[rel='icon']");
          if (!faviconLink) {
            faviconLink = document.createElement('link');
            faviconLink.rel = 'icon';
            document.head.appendChild(faviconLink);
          }
          faviconLink.href = data.favicon;
        }
        
        if (branding && Object.keys(branding).length > 0) {
          // Apply branding colors as CSS variables to the root element
          const root = document.documentElement;
          
          // Main Colors
          if (branding.primaryColor) root.style.setProperty('--primary-color', branding.primaryColor);
          if (branding.secondaryColor) root.style.setProperty('--secondary-color', branding.secondaryColor);
          if (branding.accentColor) root.style.setProperty('--accent-color', branding.accentColor);
          
          // Text Colors
          if (branding.titleColor) root.style.setProperty('--title-color', branding.titleColor);
          if (branding.textColor) root.style.setProperty('--text-color', branding.textColor);
          if (branding.lightTextColor) root.style.setProperty('--text-light', branding.lightTextColor);
          if (branding.sectionCaptionColor) root.style.setProperty('--caption-color', branding.sectionCaptionColor);
          
          // Background Colors
          if (branding.backgroundColor) root.style.setProperty('--bg-color', branding.backgroundColor);
          if (branding.sectionBackgroundColor) root.style.setProperty('--bg-light', branding.sectionBackgroundColor);
          if (branding.borderColor) root.style.setProperty('--border-color', branding.borderColor);
          if (branding.headerBgColor) root.style.setProperty('--header-bg', branding.headerBgColor);
          if (branding.footerBgColor) root.style.setProperty('--footer-bg', branding.footerBgColor);
          if (branding.footerTextColor) root.style.setProperty('--footer-text', branding.footerTextColor);
          
          // Link Colors
          if (branding.linkColor) root.style.setProperty('--link-color', branding.linkColor);
          if (branding.linkHoverColor) root.style.setProperty('--link-hover-color', branding.linkHoverColor);
          
          // Button Colors
          if (branding.buttonPrimaryBg) root.style.setProperty('--btn-primary-bg', branding.buttonPrimaryBg);
          if (branding.buttonPrimaryText) root.style.setProperty('--btn-primary-text', branding.buttonPrimaryText);
          if (branding.buttonSecondaryBg) root.style.setProperty('--btn-secondary-bg', branding.buttonSecondaryBg);
          if (branding.buttonSecondaryText) root.style.setProperty('--btn-secondary-text', branding.buttonSecondaryText);
          
          console.log('Branding colors applied:', branding);
        }
        setBrandingLoaded(true);
      } catch (err) {
        console.error('Error fetching branding:', err);
        setBrandingLoaded(true);
      }
    };

    fetchAndApplyBranding();
  }, []);

  return (
    <div className="App">
      {!isAdminRoute && <Header />}
      <main className={isAdminRoute ? 'admin-main' : ''}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/tutorial/:slug" element={<TutorialDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/careers/:slug" element={<JobDetail />} />
          <Route path="/forms/:slug" element={<DynamicFormView />} />
          <Route path="/login" element={settings.showLoginToPublic ? <Login /> : <Navigate to="/" />} />
          <Route path="/admin-login" element={<Login />} />
          <Route path="/register" element={settings.showRegistrationToPublic ? <Register /> : <Navigate to="/" />} />
           <Route path="/forgot-password" element={<ForgotPassword />} />
           <Route path="/reset-password/:token" element={<ResetPassword />} />
           <Route path="/verify-email/:token" element={<VerifyEmail />} />
           <Route path="/resend-verification" element={<ResendVerification />} />
           <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
          {/* Content Management */}
          <Route path="/admin/home-content" element={<ProtectedRoute><HomeContentForm /></ProtectedRoute>} />
          <Route path="/admin/about-content" element={<ProtectedRoute><AboutContentForm /></ProtectedRoute>} />
          <Route path="/admin/pages" element={<ProtectedRoute><PagesList /></ProtectedRoute>} />
          <Route path="/admin/pages/new" element={<ProtectedRoute><PageForm /></ProtectedRoute>} />
          <Route path="/admin/pages/edit/:id" element={<ProtectedRoute><PageForm /></ProtectedRoute>} />
          
          {/* Media Management */}
          <Route path="/admin/media" element={<ProtectedRoute><MediaLibrary /></ProtectedRoute>} />
          
          {/* Gallery Management */}
          <Route path="/admin/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
          <Route path="/admin/gallery/new" element={<ProtectedRoute><GalleryForm /></ProtectedRoute>} />
          <Route path="/admin/gallery/edit/:id" element={<ProtectedRoute><GalleryForm /></ProtectedRoute>} />
          
          {/* Tutorial Management */}
          <Route path="/admin/tutorials" element={<ProtectedRoute><AdminTutorials /></ProtectedRoute>} />
          <Route path="/admin/tutorials/new" element={<ProtectedRoute><TutorialForm /></ProtectedRoute>} />
          <Route path="/admin/tutorials/edit/:id" element={<ProtectedRoute><TutorialForm /></ProtectedRoute>} />
          <Route path="/admin/tutorials/categories" element={<ProtectedRoute><TutorialCategories /></ProtectedRoute>} />
          
          {/* Product Management */}
          <Route path="/admin/products" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
          <Route path="/admin/products/new" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
          <Route path="/admin/products/edit/:id" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
          <Route path="/admin/product-enquiries" element={<ProtectedRoute><ProductEnquiries /></ProtectedRoute>} />
          <Route path="/admin/demos" element={<ProtectedRoute><DemoRequests /></ProtectedRoute>} />
          
          {/* Portfolio Management */}
          <Route path="/admin/portfolio" element={<ProtectedRoute><PortfolioList /></ProtectedRoute>} />
          <Route path="/admin/portfolio/new" element={<ProtectedRoute><PortfolioForm /></ProtectedRoute>} />
          <Route path="/admin/portfolio/edit/:id" element={<ProtectedRoute><PortfolioForm /></ProtectedRoute>} />
          
          {/* Testimonial Management */}
          <Route path="/admin/testimonials" element={<ProtectedRoute><TestimonialList /></ProtectedRoute>} />
          <Route path="/admin/testimonials/new" element={<ProtectedRoute><TestimonialForm /></ProtectedRoute>} />
          <Route path="/admin/testimonials/edit/:id" element={<ProtectedRoute><TestimonialForm /></ProtectedRoute>} />
          
          {/* Client Management */}
          <Route path="/admin/clients" element={<ProtectedRoute><ClientList /></ProtectedRoute>} />
          <Route path="/admin/clients/new" element={<ProtectedRoute><ClientForm /></ProtectedRoute>} />
          <Route path="/admin/clients/edit/:id" element={<ProtectedRoute><ClientForm /></ProtectedRoute>} />
          
          {/* Contact Messages */}
          <Route path="/admin/contacts" element={<ProtectedRoute><ContactMessages /></ProtectedRoute>} />
          
          {/* Blog Routes */}
          <Route path="/admin/blog" element={<ProtectedRoute><BlogList /></ProtectedRoute>} />
          <Route path="/admin/blog/new" element={<ProtectedRoute><BlogForm /></ProtectedRoute>} />
          <Route path="/admin/blog/edit/:id" element={<ProtectedRoute><BlogForm /></ProtectedRoute>} />
          <Route path="/admin/blog/categories" element={<ProtectedRoute><BlogCategories /></ProtectedRoute>} />
          
          {/* Jobs/Recruitment Routes */}
          <Route path="/admin/jobs" element={<ProtectedRoute><JobsList /></ProtectedRoute>} />
          <Route path="/admin/jobs/new" element={<ProtectedRoute><JobForm /></ProtectedRoute>} />
          <Route path="/admin/jobs/edit/:id" element={<ProtectedRoute><JobForm /></ProtectedRoute>} />
          <Route path="/admin/jobs/departments" element={<ProtectedRoute><DepartmentManager /></ProtectedRoute>} />
          <Route path="/admin/jobs/applications" element={<ProtectedRoute><ApplicationsList /></ProtectedRoute>} />
          <Route path="/admin/jobs/:jobId/applications" element={<ProtectedRoute><ApplicationsList /></ProtectedRoute>} />
          
          {/* Dynamic Forms Routes */}
          <Route path="/admin/forms" element={<ProtectedRoute><FormsList /></ProtectedRoute>} />
          <Route path="/admin/forms/new" element={<ProtectedRoute><FormBuilder /></ProtectedRoute>} />
          <Route path="/admin/forms/edit/:id" element={<ProtectedRoute><FormBuilder /></ProtectedRoute>} />
          <Route path="/admin/forms/:id/submissions" element={<ProtectedRoute><FormSubmissions /></ProtectedRoute>} />
          
          {/* Settings & Administration */}
          <Route path="/admin/users" element={<ProtectedRoute><UsersList /></ProtectedRoute>} />
          <Route path="/admin/users/new" element={<ProtectedRoute><UserForm /></ProtectedRoute>} />
          <Route path="/admin/users/:id" element={<ProtectedRoute><UserForm /></ProtectedRoute>} />
          <Route path="/admin/menu" element={<ProtectedRoute><MenuManager /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

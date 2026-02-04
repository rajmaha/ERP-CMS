import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaHome, FaImage, FaImages, FaFileAlt, FaBox, FaBriefcase, FaStar, FaUsers, FaEnvelope, FaList, FaCog, FaBlog, FaUserTie, FaWpforms, FaSignOutAlt, FaUser, FaBars, FaTimes, FaGraduationCap } from 'react-icons/fa';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.data);
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Check if a path is active
  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>ERP CMS</h2>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Dashboard</div>
          <Link to="/admin" className={`nav-item ${isActive('/admin') ? 'active' : ''}`} onClick={closeSidebar}>
            <FaHome /> Dashboard
          </Link>

          <div className="nav-section-title">Content</div>
          <Link to="/admin/home-content" className={`nav-item ${isActive('/admin/home-content') ? 'active' : ''}`} onClick={closeSidebar}>
            <FaHome /> Home Content
          </Link>
          <Link to="/admin/about-content" className={`nav-item ${isActive('/admin/about-content') ? 'active' : ''}`} onClick={closeSidebar}>
            <FaFileAlt /> About Content
          </Link>
          <Link to="/admin/pages" className={`nav-item ${isActive('/admin/pages') ? 'active' : ''}`} onClick={closeSidebar}>
            <FaFileAlt /> Pages
          </Link>

          <div className="nav-section-title">Media</div>
          <Link to="/admin/media" className={`nav-item ${isActive('/admin/media') ? 'active' : ''}`} onClick={closeSidebar}>
            <FaImage /> Media Library
          </Link>
          <Link to="/admin/gallery/new" className={`nav-item ${isActive('/admin/gallery') ? 'active' : ''}`} onClick={closeSidebar}>
            <FaImages /> Gallery
          </Link>

          <div className="nav-section-title">Products & Portfolio</div>
          <Link to="/admin/products" className={`nav-item ${isActive('/admin/products') ? 'active' : ''}`} onClick={closeSidebar}>
            <FaBox /> Products
          </Link>
          <Link to="/admin/portfolio" className={`nav-item ${isActive('/admin/portfolio') ? 'active' : ''}`} onClick={closeSidebar}>
            <FaBriefcase /> Portfolio
          </Link>

          <div className="nav-section-title">Social Proof</div>
          <Link to="/admin/testimonials" className={`nav-item ${isActive('/admin/testimonials') ? 'active' : ''}`} onClick={closeSidebar}>
            <FaStar /> Testimonials
          </Link>
          <Link to="/admin/clients" className={`nav-item ${isActive('/admin/clients') ? 'active' : ''}`} onClick={closeSidebar}>
            <FaUsers /> Clients
          </Link>

          <div className="nav-section-title">Blog & Tutorials</div>
          <Link to="/admin/blog" className={`nav-item ${isActive('/admin/blog') ? 'active' : ''}`} onClick={closeSidebar}>
            <FaBlog /> Blog Posts
          </Link>
          <Link to="/admin/blog/categories" className={`nav-item ${isActive('/admin/blog/categories') ? 'active' : ''}`} onClick={closeSidebar}>
            <FaList /> Blog Categories
          </Link>
          <Link to="/admin/tutorials" className={`nav-item ${isActive('/admin/tutorials') ? 'active' : ''}`} onClick={closeSidebar}>
            <FaGraduationCap /> Tutorials
          </Link>
          <Link to="/admin/tutorials/categories" className={`nav-item ${isActive('/admin/tutorials/categories') ? 'active' : ''}`} onClick={closeSidebar}>
            <FaList /> Tutorial Categories
          </Link>

          <div className="nav-section-title">Recruitment</div>
          <Link to="/admin/jobs" className={`nav-item ${isActive('/admin/jobs') ? 'active' : ''}`} onClick={closeSidebar}>
            <FaUserTie /> Careers
          </Link>
          <Link to="/admin/jobs/departments" className={`nav-item ${isActive('/admin/jobs/departments') ? 'active' : ''}`} onClick={closeSidebar}>
            <FaList /> Departments
          </Link>

          <div className="nav-section-title">Forms & Contact</div>
          <Link to="/admin/forms" className={`nav-item ${isActive('/admin/forms') ? 'active' : ''}`} onClick={closeSidebar}>
            <FaWpforms /> Dynamic Forms
          </Link>
          <Link to="/admin/contacts" className={`nav-item ${isActive('/admin/contacts') ? 'active' : ''}`} onClick={closeSidebar}>
            <FaEnvelope /> Contact Messages
          </Link>
          <Link to="/admin/product-enquiries" className={`nav-item ${isActive('/admin/product-enquiries') ? 'active' : ''}`} onClick={closeSidebar}>
            <FaEnvelope /> Product Enquiries
          </Link>

          <div className="nav-section-title">Administration</div>
          <Link to="/admin/users" className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`} onClick={closeSidebar}>
            <FaUsers /> Users
          </Link>
          <Link to="/admin/menu" className={`nav-item ${isActive('/admin/menu') ? 'active' : ''}`} onClick={closeSidebar}>
            <FaList /> Menu Manager
          </Link>

          <div className="nav-section-title">Settings</div>
          <Link to="/profile" className={`nav-item ${isActive('/profile') ? 'active' : ''}`} onClick={closeSidebar}>
            <FaUser /> My Profile
          </Link>
          <Link to="/admin/settings" className={`nav-item ${isActive('/admin/settings') ? 'active' : ''}`} onClick={closeSidebar}>
            <FaCog /> Settings
          </Link>
        </nav>

        <div className="sidebar-footer">
          <Link to="/profile" className="user-info" onClick={closeSidebar}>
            <div className="user-avatar">
              <FaUser />
            </div>
            <div className="user-details">
              <h4>{user?.name || 'Admin User'}</h4>
              <p>{user?.email || 'admin@example.com'}</p>
            </div>
          </Link>
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      <main className="admin-content">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaBars, FaTimes, FaUser, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [settings, setSettings] = useState(null);
  const isAuthenticated = localStorage.getItem('token') ? true : false;

  useEffect(() => {
    fetchMenuItems();
    fetchSettings();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const res = await axios.get('/api/menu');
      setMenuItems(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings');
      setSettings(res.data.data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setOpenSubmenu(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/login');
    closeMobileMenu();
  };

  const isActiveLink = (url) => {
    if (!url) return false;
    
    // Exact match for home page
    if (url === '/') {
      return location.pathname === '/';
    }
    
    // For other pages, check if current path starts with the url
    return location.pathname === url || location.pathname.startsWith(url + '/');
  };

  const toggleSubmenu = (itemId) => {
    setOpenSubmenu(openSubmenu === itemId ? null : itemId);
  };

  const renderMenuItem = (item) => {
    const hasChildren = item.children && item.children.length > 0;

    return (
      <li key={item._id} className={`nav-item ${hasChildren ? 'has-submenu' : ''}`}>
        {hasChildren ? (
          <>
            <div 
              className={`nav-link has-dropdown ${isActiveLink(item.url) ? 'active' : ''}`}
              onClick={(e) => {
                if (mobileMenuOpen) {
                  toggleSubmenu(item._id);
                }
              }}
            >
              {item.icon && (
                <span className="nav-icon">
                  {/^[\p{Emoji}]+$/u.test(item.icon) ? item.icon : <i className={`fas fa-${item.icon}`}></i>}
                </span>
              )}
              <span>{item.label}</span>
            </div>
            <ul className={`submenu ${openSubmenu === item._id ? 'open' : ''}`}>
              {item.children.map(child => (
                <li key={child._id} className="submenu-item">
                  {child.isExternal ? (
                    <a 
                      href={child.url}
                      className={`submenu-link ${isActiveLink(child.url) ? 'active' : ''}`}
                      target={child.openInNewTab ? '_blank' : '_self'}
                      rel={child.openInNewTab ? 'noopener noreferrer' : ''}
                      onClick={closeMobileMenu}
                    >
                      {child.icon && (
                        <span className="nav-icon">
                          {/^[\p{Emoji}]+$/u.test(child.icon) ? child.icon : <i className={`fas fa-${child.icon}`}></i>}
                        </span>
                      )}
                      <div>
                        <span>{child.label}</span>
                        {child.description && <span className="submenu-desc">{child.description}</span>}
                      </div>
                    </a>
                  ) : (
                    <Link 
                      to={child.url} 
                      className={`submenu-link ${isActiveLink(child.url) ? 'active' : ''}`}
                      onClick={closeMobileMenu}
                    >
                      {child.icon && (
                        <span className="nav-icon">
                          {/^[\p{Emoji}]+$/u.test(child.icon) ? child.icon : <i className={`fas fa-${child.icon}`}></i>}
                        </span>
                      )}
                      <div>
                        <span>{child.label}</span>
                        {child.description && <span className="submenu-desc">{child.description}</span>}
                      </div>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : (
          item.isExternal ? (
            <a 
              href={item.url} 
              className={`nav-link ${isActiveLink(item.url) ? 'active' : ''}`}
              target={item.openInNewTab ? '_blank' : '_self'}
              rel={item.openInNewTab ? 'noopener noreferrer' : ''}
              onClick={closeMobileMenu}
            >
              {item.icon && (
                <span className="nav-icon">
                  {/^[\p{Emoji}]+$/u.test(item.icon) ? item.icon : <i className={`fas fa-${item.icon}`}></i>}
                </span>
              )}
              <span>{item.label}</span>
            </a>
          ) : (
            <Link 
              to={item.url} 
              className={`nav-link ${isActiveLink(item.url) ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              {item.icon && (
                <span className="nav-icon">
                  {/^[\p{Emoji}]+$/u.test(item.icon) ? item.icon : <i className={`fas fa-${item.icon}`}></i>}
                </span>
              )}
              <span>{item.label}</span>
            </Link>
          )
        )}
      </li>
    );
  };

  if (loading) {
    return null;
  }

  return (
    <header className="header">
      <div className="container">
        <nav className="navbar">
          <Link to="/" className="logo">
            <div className="logo-container">
              {settings?.logo && (
                <img src={settings.logo} alt={settings?.siteName || 'ERP CMS'} className="logo-image" />
              )}
              <span className="site-name">{settings?.siteName || 'ERP CMS'}</span>
            </div>
          </Link>

          <button className="mobile-toggle" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          <ul className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
            {menuItems.map(item => renderMenuItem(item))}
            
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link 
                    to="/admin" 
                    className={`nav-link btn-admin ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                    onClick={closeMobileMenu}
                  >
                    <FaUser /> Admin
                  </Link>
                </li>
                <li className="nav-item">
                  <button onClick={handleLogout} className="nav-link btn-logout">
                    <FaSignOutAlt /> Logout
                  </button>
                </li>
              </>
            ) : (
              settings?.showLoginButton !== false && (
                <li className="nav-item">
                  <Link 
                    to="/login" 
                    className={`nav-link btn-login ${location.pathname === '/login' ? 'active' : ''}`}
                    onClick={closeMobileMenu}
                  >
                    <FaSignInAlt /> Login
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;

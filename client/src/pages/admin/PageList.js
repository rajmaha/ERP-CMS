import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaExternalLinkAlt, FaSearch, FaSort, FaClock, FaFileAlt } from 'react-icons/fa';
import './Admin.css';

const PageList = () => {
  const [pages, setPages] = useState([]);
  const [filteredPages, setFilteredPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, title, views
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [viewMode, setViewMode] = useState('table'); // table, grid

  const fetchPages = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await axios.get(`/api/pages/admin${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPages(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching pages:', err);
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // Filter and sort pages
  useEffect(() => {
    let result = [...pages];

    // Search filter
    if (searchTerm) {
      result = result.filter(page =>
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (page.excerpt && page.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'views':
          comparison = (a.views || 0) - (b.views || 0);
          break;
        case 'date':
        default:
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredPages(result);
  }, [pages, searchTerm, sortBy, sortOrder]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/pages/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPages(pages.filter(page => page._id !== id));
        toast.success('Page deleted successfully');
      } catch (err) {
        toast.error('Error deleting page');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      await axios.put(`/api/pages/${id}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchPages();
      toast.success(`Page ${newStatus}`);
    } catch (err) {
      toast.error('Error updating page status');
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const publishedCount = pages.filter(p => p.status === 'published').length;
  const draftCount = pages.filter(p => p.status === 'draft').length;

  if (loading) {
    return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header" style={{ marginBottom: '2rem' }}>
          <div>
            <h1>Pages</h1>
            <p style={{ color: 'var(--text-light)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
              Manage your site pages • {pages.length} total
            </p>
          </div>
          <Link to="/admin/pages/new" className="btn btn-primary">
            <FaPlus /> Add New Page
          </Link>
        </header>

        {/* Simplified Search and Filters Bar */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr auto auto', 
            gap: '1rem', 
            alignItems: 'center' 
          }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <FaSearch style={{ 
                position: 'absolute', 
                left: '14px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#9ca3af',
                fontSize: '0.9rem'
              }} />
              <input
                type="text"
                placeholder="Search pages by title or slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
                style={{ 
                  paddingLeft: '2.75rem',
                  height: '42px',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              className="form-control"
              style={{ width: '200px', height: '42px' }}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="views-desc">Most Viewed</option>
              <option value="views-asc">Least Viewed</option>
            </select>

            {/* Filter Tabs - Simplified */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setFilter('all')}
                style={{
                  padding: '0.6rem 1.25rem',
                  border: filter === 'all' ? '2px solid #2563eb' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: filter === 'all' ? '#eff6ff' : 'white',
                  color: filter === 'all' ? '#2563eb' : '#6b7280',
                  cursor: 'pointer',
                  fontWeight: filter === 'all' ? '600' : '500',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s'
                }}
              >
                All
              </button>
              <button
                onClick={() => setFilter('published')}
                style={{
                  padding: '0.6rem 1.25rem',
                  border: filter === 'published' ? '2px solid #10b981' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: filter === 'published' ? '#ecfdf5' : 'white',
                  color: filter === 'published' ? '#10b981' : '#6b7280',
                  cursor: 'pointer',
                  fontWeight: filter === 'published' ? '600' : '500',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s'
                }}
              >
                Published
              </button>
              <button
                onClick={() => setFilter('draft')}
                style={{
                  padding: '0.6rem 1.25rem',
                  border: filter === 'draft' ? '2px solid #f59e0b' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: filter === 'draft' ? '#fffbeb' : 'white',
                  color: filter === 'draft' ? '#f59e0b' : '#6b7280',
                  cursor: 'pointer',
                  fontWeight: filter === 'draft' ? '600' : '500',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s'
                }}
              >
                Drafts
              </button>
            </div>
          </div>
        </div>

        {/* Results Info */}
        {searchTerm && (
          <div style={{ 
            marginBottom: '1rem', 
            color: '#6b7280',
            fontSize: '0.9rem'
          }}>
            Found {filteredPages.length} page{filteredPages.length !== 1 ? 's' : ''} matching "{searchTerm}"
          </div>
        )}

        {/* Simplified Pages Table */}
        {filteredPages.length > 0 ? (
          <div className="card">
            <table className="data-table" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.875rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.875rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Slug</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.875rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.875rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Views</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.875rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.875rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPages.map((page, index) => (
                  <tr key={page._id} style={{ 
                    borderTop: '1px solid #f3f4f6',
                    transition: 'background 0.15s'
                  }}>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ fontWeight: '500', color: '#111827', marginBottom: '0.25rem' }}>
                        {page.title}
                      </div>
                      {page.excerpt && (
                        <div style={{ 
                          color: '#9ca3af', 
                          fontSize: '0.875rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '500px'
                        }}>
                          {page.excerpt}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <code style={{ 
                        background: '#f9fafb', 
                        padding: '0.35rem 0.65rem', 
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        color: '#4b5563',
                        fontFamily: 'monospace'
                      }}>
                        /{page.slug}
                      </code>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.35rem 0.85rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        textTransform: 'capitalize',
                        background: page.status === 'published' ? '#d1fae5' : '#fef3c7',
                        color: page.status === 'published' ? '#065f46' : '#92400e'
                      }}>
                        {page.status === 'published' ? <FaEye size={11} /> : <FaClock size={11} />}
                        {page.status}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                      <span style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: '500' }}>
                        {page.views || 0}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {new Date(page.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ 
                        display: 'flex', 
                        gap: '0.5rem', 
                        justifyContent: 'center'
                      }}>
                        {page.status === 'published' && (
                          <a 
                            href={`/page/${page.slug}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-secondary"
                            title="View Page"
                            style={{ padding: '0.45rem 0.65rem' }}
                          >
                            <FaExternalLinkAlt size={13} />
                          </a>
                        )}
                        
                        <Link 
                          to={`/admin/pages/edit/${page._id}`} 
                          className="btn btn-sm btn-primary"
                          title="Edit"
                          style={{ padding: '0.45rem 0.65rem' }}
                        >
                          <FaEdit size={13} />
                        </Link>
                        
                        <button 
                          onClick={() => handleDelete(page._id)} 
                          className="btn btn-sm btn-danger"
                          title="Delete"
                          style={{ padding: '0.45rem 0.65rem' }}
                        >
                          <FaTrash size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card" style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem',
            background: 'white'
          }}>
            <FaFileAlt size={56} style={{ color: '#d1d5db', marginBottom: '1.5rem' }} />
            <h3 style={{ color: '#374151', marginBottom: '0.75rem', fontSize: '1.25rem' }}>
              {searchTerm ? 'No pages found' : 'No pages yet'}
            </h3>
            <p style={{ color: '#9ca3af', marginBottom: '2rem', fontSize: '0.95rem' }}>
              {searchTerm 
                ? `No pages match "${searchTerm}"`
                : 'Create your first page to get started'
              }
            </p>
            {!searchTerm && (
              <Link to="/admin/pages/new" className="btn btn-primary">
                <FaPlus /> Create Your First Page
              </Link>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PageList;

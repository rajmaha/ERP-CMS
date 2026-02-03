import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaEye, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import './Admin.css';

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await axios.get(`/api/blog/admin/posts${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/blog/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPosts(posts.filter(post => post._id !== id));
        toast.success('Post deleted successfully');
      } catch (err) {
        toast.error('Error deleting post');
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { class: 'status-draft', icon: <FaClock />, text: 'Draft' },
      pending: { class: 'status-pending', icon: <FaClock />, text: 'Pending' },
      published: { class: 'status-published', icon: <FaCheckCircle />, text: 'Published' },
      rejected: { class: 'status-rejected', icon: <FaTimesCircle />, text: 'Rejected' }
    };
    const badge = badges[status] || badges.draft;
    return (
      <span className={`status-badge ${badge.class}`}>
        {badge.icon} {badge.text}
      </span>
    );
  };

  if (loading) {
    return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <h1>Blog Posts</h1>
          <Link to="/admin/blog/new" className="btn btn-primary">
            <FaPlus /> New Post
          </Link>
        </header>

        <div className="filters" style={{ marginBottom: '2rem' }}>
          <button onClick={() => setFilter('all')} className={`filter-btn ${filter === 'all' ? 'active' : ''}`}>
            All ({posts.length})
          </button>
          <button onClick={() => setFilter('draft')} className={`filter-btn ${filter === 'draft' ? 'active' : ''}`}>
            Draft
          </button>
          <button onClick={() => setFilter('pending')} className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}>
            Pending
          </button>
          <button onClick={() => setFilter('published')} className={`filter-btn ${filter === 'published' ? 'active' : ''}`}>
            Published
          </button>
          <button onClick={() => setFilter('rejected')} className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}>
            Rejected
          </button>
        </div>

        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Status</th>
                <th>Views</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length > 0 ? (
                posts.map(post => (
                  <tr key={post._id}>
                    <td>
                      <strong>{post.title}</strong>
                      {post.isFeatured && <span className="badge-featured" style={{ marginLeft: '0.5rem' }}>Featured</span>}
                    </td>
                    <td>{post.author?.name || 'Unknown'}</td>
                    <td>{post.category?.name || 'Uncategorized'}</td>
                    <td>{getStatusBadge(post.status)}</td>
                    <td>{post.views}</td>
                    <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        {post.status === 'published' && (
                          <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-info">
                            <FaEye />
                          </a>
                        )}
                        <Link to={`/admin/blog/edit/${post._id}`} className="btn btn-sm btn-secondary">
                          <FaEdit />
                        </Link>
                        {post.status === 'pending' && (
                          <Link to={`/admin/blog/moderate/${post._id}`} className="btn btn-sm btn-warning">
                            Moderate
                          </Link>
                        )}
                        <button onClick={() => handleDelete(post._id)} className="btn btn-sm btn-danger">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    No posts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BlogList;

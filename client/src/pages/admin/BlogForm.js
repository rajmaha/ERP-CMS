import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import RichTextEditor from '../../components/RichTextEditor';
import HeroImagePicker from '../../components/HeroImagePicker';
import { toast } from 'react-toastify';
import { FaSave, FaTimes } from 'react-icons/fa';
import './Form.css';

const BlogForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    category: '',
    tags: '',
    status: 'draft',
    allowComments: true,
    isFeatured: false,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: ''
  });

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/blog/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/blog/admin/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const post = res.data.data;
      setFormData({
        ...post,
        category: post.category?._id || '',
        tags: post.tags?.join(', ') || ''
      });
    } catch (err) {
      toast.error('Error loading post');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    
    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, title: value, slug }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (id) {
        await axios.put(`/api/blog/posts/${id}`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Post updated successfully');
      } else {
        await axios.post('/api/blog/posts', submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Post created successfully');
      }
      navigate('/admin/blog');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <h1>{id ? 'Edit Post' : 'New Post'}</h1>
        </header>

        <form onSubmit={handleSubmit} className="form-container card">
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required className="form-control" />
            </div>
            <div className="form-group">
              <label>Slug *</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} required className="form-control" />
            </div>
          </div>

          <div className="form-group">
            <label>Excerpt</label>
            <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} rows="3" className="form-control"></textarea>
          </div>

          <div className="form-group">
            <label>Content *</label>
            <RichTextEditor value={formData.content} onChange={(content) => setFormData({ ...formData, content })} name="content" />
          </div>

          <div className="form-group">
            <label>Featured Image</label>
            <HeroImagePicker 
              value={formData.featuredImage}
              onChange={(url) => setFormData({ ...formData, featuredImage: url })}
              label=""
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} required className="form-control">
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="form-control">
                <option value="draft">Draft</option>
                <option value="pending">Pending Review</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="form-control" placeholder="react, nodejs, cms" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" name="allowComments" checked={formData.allowComments} onChange={handleChange} />
                Allow Comments
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />
                Featured Post
              </label>
            </div>
          </div>

          <fieldset className="form-section">
            <legend>SEO Settings</legend>
            <div className="form-group">
              <label>Meta Title</label>
              <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleChange} className="form-control" />
            </div>
            <div className="form-group">
              <label>Meta Description</label>
              <textarea name="metaDescription" value={formData.metaDescription} onChange={handleChange} rows="2" className="form-control"></textarea>
            </div>
            <div className="form-group">
              <label>Meta Keywords</label>
              <input type="text" name="metaKeywords" value={formData.metaKeywords} onChange={handleChange} className="form-control" />
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>Open Graph (Social Media)</legend>
            <div className="form-group">
              <label>OG Title</label>
              <input type="text" name="ogTitle" value={formData.ogTitle} onChange={handleChange} className="form-control" placeholder="Leave empty to use post title" />
            </div>
            <div className="form-group">
              <label>OG Description</label>
              <textarea name="ogDescription" value={formData.ogDescription} onChange={handleChange} rows="2" className="form-control" placeholder="Leave empty to use excerpt"></textarea>
            </div>
            <div className="form-group">
              <label>OG Image</label>
              <HeroImagePicker 
                value={formData.ogImage}
                onChange={(url) => setFormData({ ...formData, ogImage: url })}
                label=""
              />
              <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-light)' }}>
                Recommended: 1200x630px. Leave empty to use featured image
              </small>
            </div>
          </fieldset>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <FaSave /> {loading ? 'Saving...' : 'Save Post'}
            </button>
            <button type="button" onClick={() => navigate('/admin/blog')} className="btn btn-secondary">
              <FaTimes /> Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default BlogForm;

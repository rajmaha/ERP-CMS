import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { FaBox, FaBriefcase, FaStar, FaUsers, FaImages, FaEnvelope, FaFileAlt, FaChartLine, FaBlog, FaEye, FaClock, FaCheckCircle, FaClipboardList, FaWpforms } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    portfolio: 0,
    testimonials: 0,
    clients: 0,
    gallery: 0,
    contacts: 0,
    pages: 0,
    media: 0,
    blogPosts: 0,
    blogPublished: 0,
    blogPending: 0,
    blogViews: 0,
    jobsTotal: 0,
    jobsActive: 0,
    jobsDraft: 0,
    applicationsPending: 0,
    applicationsTotal: 0,
    productEnquiries: 0,
    newEnquiries: 0,
    dynamicForms: 0,
    formSubmissions: 0,
    activeForms: 0
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentFormSubmissions, setRecentFormSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentPosts();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const results = await Promise.allSettled([
        axios.get('/api/products/admin', { headers }).catch(() => ({ data: { data: [] } })),
        axios.get('/api/portfolio/admin', { headers }).catch(() => ({ data: { data: [] } })),
        axios.get('/api/testimonials/admin', { headers }).catch(() => ({ data: { data: [] } })),
        axios.get('/api/clients/admin', { headers }).catch(() => ({ data: { data: [] } })),
        axios.get('/api/gallery/admin', { headers }).catch(() => ({ data: { data: [] } })),
        axios.get('/api/contact/admin', { headers }).catch(() => ({ data: { data: [] } })),
        axios.get('/api/pages/admin', { headers }).catch(() => ({ data: { data: [] } })),
        axios.get('/api/media/admin', { headers }).catch(() => ({ data: { data: [] } })),
        axios.get('/api/blog/admin/posts', { headers }).catch(() => ({ data: { data: [] } })),
        axios.get('/api/jobs/admin/all', { headers }).catch(() => ({ data: { data: [] } })),
        axios.get('/api/jobs/applications/all', { headers }).catch(() => ({ data: { data: [] } })),
        axios.get('/api/product-enquiries/admin', { headers }).catch(() => ({ data: { data: [] } })),
        axios.get('/api/forms/admin/all', { headers }).catch(() => ({ data: { data: [] } }))
      ]);

      const blogPosts = results[8].status === 'fulfilled' ? results[8].value.data.data : [];
      const blogPublished = blogPosts.filter(p => p.status === 'published').length;
      const blogPending = blogPosts.filter(p => p.status === 'pending').length;
      const blogViews = blogPosts.reduce((sum, p) => sum + (p.views || 0), 0);

      const jobs = results[9].status === 'fulfilled' ? results[9].value.data.data : [];
      const jobsActive = jobs.filter(j => j.status === 'active').length;
      const jobsDraft = jobs.filter(j => j.status === 'draft').length;

      const applications = results[10].status === 'fulfilled' ? results[10].value.data.data : [];
      const applicationsPending = applications.filter(a => a.status === 'new' || a.status === 'reviewing').length;

      const enquiries = results[11].status === 'fulfilled' ? results[11].value.data.data : [];
      const newEnquiries = enquiries.filter(e => e.status === 'new').length;

      const forms = results[12].status === 'fulfilled' ? results[12].value.data.data : [];
      const activeForms = forms.filter(f => f.status === 'active').length;
      const totalSubmissions = forms.reduce((sum, f) => sum + (f.submissionCount || 0), 0);

      setStats({
        products: results[0].status === 'fulfilled' ? results[0].value.data.data.length : 0,
        portfolio: results[1].status === 'fulfilled' ? results[1].value.data.data.length : 0,
        testimonials: results[2].status === 'fulfilled' ? results[2].value.data.data.length : 0,
        clients: results[3].status === 'fulfilled' ? results[3].value.data.data.length : 0,
        gallery: results[4].status === 'fulfilled' ? results[4].value.data.data.length : 0,
        contacts: results[5].status === 'fulfilled' ? results[5].value.data.data.length : 0,
        pages: results[6].status === 'fulfilled' ? results[6].value.data.data.length : 0,
        media: results[7].status === 'fulfilled' ? results[7].value.data.data.length : 0,
        blogPosts: blogPosts.length,
        blogPublished,
        blogPending,
        blogViews,
        jobsTotal: jobs.length,
        jobsActive,
        jobsDraft,
        applicationsPending,
        applicationsTotal: applications.length,
        productEnquiries: enquiries.length,
        newEnquiries,
        dynamicForms: forms.length,
        formSubmissions: totalSubmissions,
        activeForms
      });

      // Set recent jobs and applications
      setRecentJobs(jobs.slice(0, 5));
      setRecentApplications(applications.slice(0, 5));
      
      // Get recent form submissions
      const allSubmissions = [];
      for (const form of forms.slice(0, 5)) {
        try {
          const subRes = await axios.get(`/api/forms/admin/${form._id}/submissions`, { headers });
          const submissions = subRes.data.data.slice(0, 2).map(sub => ({
            ...sub,
            formTitle: form.title
          }));
          allSubmissions.push(...submissions);
        } catch (err) {
          console.error('Error fetching submissions:', err);
        }
      }
      setRecentFormSubmissions(allSubmissions.slice(0, 5));

      setLoading(false);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setLoading(false);
    }
  };

  const fetchRecentPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/blog/admin/posts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecentPosts(res.data.data.slice(0, 5));
    } catch (err) {
      console.error('Error fetching recent posts:', err);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { class: 'status-draft', text: 'Draft' },
      pending: { class: 'status-pending', text: 'Pending' },
      published: { class: 'status-published', text: 'Published' },
      rejected: { class: 'status-rejected', text: 'Rejected' }
    };
    const badge = badges[status] || badges.draft;
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  if (loading) {
    return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="dashboard">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening with your site.</p>
        </header>

        <div className="stats-grid">
          <Link to="/admin/products" className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <FaBox />
            </div>
            <div className="stat-info">
              <h3>Products</h3>
              <p className="stat-number">{stats.products}</p>
            </div>
          </Link>

          <Link to="/admin/portfolio" className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
              <FaBriefcase />
            </div>
            <div className="stat-info">
              <h3>Portfolio</h3>
              <p className="stat-number">{stats.portfolio}</p>
            </div>
          </Link>

          <Link to="/admin/testimonials" className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(251, 146, 60, 0.1)', color: '#fb923c' }}>
              <FaStar />
            </div>
            <div className="stat-info">
              <h3>Testimonials</h3>
              <p className="stat-number">{stats.testimonials}</p>
            </div>
          </Link>

          <Link to="/admin/clients" className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
              <FaUsers />
            </div>
            <div className="stat-info">
              <h3>Clients</h3>
              <p className="stat-number">{stats.clients}</p>
            </div>
          </Link>

          <Link to="/admin/gallery" className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
              <FaImages />
            </div>
            <div className="stat-info">
              <h3>Gallery</h3>
              <p className="stat-number">{stats.gallery}</p>
            </div>
          </Link>

          <Link to="/admin/contacts" className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <FaEnvelope />
            </div>
            <div className="stat-info">
              <h3>Messages</h3>
              <p className="stat-number">{stats.contacts}</p>
            </div>
          </Link>

          <Link to="/admin/pages" className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(20, 184, 166, 0.1)', color: '#14b8a6' }}>
              <FaFileAlt />
            </div>
            <div className="stat-info">
              <h3>Pages</h3>
              <p className="stat-number">{stats.pages}</p>
            </div>
          </Link>

          <Link to="/admin/media" className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(100, 116, 139, 0.1)', color: '#64748b' }}>
              <FaChartLine />
            </div>
            <div className="stat-info">
              <h3>Media Files</h3>
              <p className="stat-number">{stats.media}</p>
            </div>
          </Link>

          <Link to="/admin/blog" className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
              <FaBlog />
            </div>
            <div className="stat-info">
              <h3>Blog Posts</h3>
              <p className="stat-number">{stats.blogPosts}</p>
            </div>
          </Link>

          <Link to="/admin/jobs" className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
              <FaBlog />
            </div>
            <div className="stat-info">
              <h3>Job Posts</h3>
              <p className="stat-number">{stats.jobsTotal}</p>
            </div>
          </Link>

          <Link to="/admin/product-enquiries" className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#f59e0b' }}>
              <FaEnvelope />
            </div>
            <div className="stat-info">
              <h3>Product Enquiries</h3>
              <p className="stat-number">{stats.productEnquiries}</p>
              {stats.newEnquiries > 0 && (
                <small style={{ color: '#f59e0b', fontWeight: 600 }}>
                  {stats.newEnquiries} new
                </small>
              )}
            </div>
          </Link>

          <Link to="/admin/forms" className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
              <FaWpforms />
            </div>
            <div className="stat-info">
              <h3>Dynamic Forms</h3>
              <p className="stat-number">{stats.dynamicForms}</p>
              {stats.activeForms > 0 && (
                <small style={{ color: '#a855f7', fontWeight: 600 }}>
                  {stats.activeForms} active
                </small>
              )}
            </div>
          </Link>
        </div>

        {/* Career/Jobs Summary Section */}
        <div className="career-summary">
          <h2>Recruitment Summary</h2>
          <div className="career-summary-grid">
            <div className="summary-card">
              <div className="summary-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                <FaCheckCircle />
              </div>
              <div className="summary-info">
                <h4>Active Jobs</h4>
                <p className="summary-number">{stats.jobsActive}</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon" style={{ background: 'rgba(251, 146, 60, 0.1)', color: '#fb923c' }}>
                <FaClock />
              </div>
              <div className="summary-info">
                <h4>Pending Applications</h4>
                <p className="summary-number">{stats.applicationsPending}</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                <FaUsers />
              </div>
              <div className="summary-info">
                <h4>Total Applications</h4>
                <p className="summary-number">{stats.applicationsTotal}</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                <FaBlog />
              </div>
              <div className="summary-info">
                <h4>Draft Jobs</h4>
                <p className="summary-number">{stats.jobsDraft}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Forms Summary Section */}
        {stats.dynamicForms > 0 && (
          <div className="career-summary">
            <h2>Dynamic Forms Summary</h2>
            <div className="career-summary-grid">
              <div className="summary-card">
                <div className="summary-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                  <FaCheckCircle />
                </div>
                <div className="summary-info">
                  <h4>Active Forms</h4>
                  <p className="summary-number">{stats.activeForms}</p>
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                  <FaClipboardList />
                </div>
                <div className="summary-info">
                  <h4>Total Submissions</h4>
                  <p className="summary-number">{stats.formSubmissions}</p>
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-icon" style={{ background: 'rgba(251, 146, 60, 0.1)', color: '#fb923c' }}>
                  <FaWpforms />
                </div>
                <div className="summary-info">
                  <h4>Total Forms</h4>
                  <p className="summary-number">{stats.dynamicForms}</p>
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                  <FaChartLine />
                </div>
                <div className="summary-info">
                  <h4>Avg per Form</h4>
                  <p className="summary-number">
                    {stats.dynamicForms > 0 ? Math.round(stats.formSubmissions / stats.dynamicForms) : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Posts Section */}
        {recentPosts.length > 0 && (
          <div className="recent-posts">
            <div className="section-header">
              <h2>Recent Blog Posts</h2>
              <Link to="/admin/blog" className="view-all-btn">View All</Link>
            </div>
            <div className="posts-table-wrapper">
              <table className="posts-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPosts.map(post => (
                    <tr key={post._id}>
                      <td>
                        <Link to={`/admin/blog/edit/${post._id}`} className="post-title-link">
                          {post.title}
                          {post.isFeatured && <span className="badge-featured">Featured</span>}
                        </Link>
                      </td>
                      <td>{post.category?.name || 'Uncategorized'}</td>
                      <td>{getStatusBadge(post.status)}</td>
                      <td>{post.views || 0}</td>
                      <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Jobs Section */}
        {recentJobs.length > 0 && (
          <div className="recent-posts">
            <div className="section-header">
              <h2>Recent Job Postings</h2>
              <Link to="/admin/jobs" className="view-all-btn">View All</Link>
            </div>
            <div className="posts-table-wrapper">
              <table className="posts-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Department</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Applications</th>
                  </tr>
                </thead>
                <tbody>
                  {recentJobs.map(job => (
                    <tr key={job._id}>
                      <td>
                        <Link to={`/admin/jobs/edit/${job._id}`} className="post-title-link">
                          {job.title}
                          {job.featured && <span className="badge-featured">Featured</span>}
                        </Link>
                      </td>
                      <td>{job.department?.name || 'N/A'}</td>
                      <td>{job.location}</td>
                      <td>
                        <span className={`status-badge ${
                          job.status === 'active' ? 'status-published' : 
                          job.status === 'draft' ? 'status-draft' : 
                          'status-rejected'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td>
                        <Link to={`/admin/jobs/${job._id}/applications`} style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
                          {job.applicationCount || 0} applications
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Applications Section */}
        {recentApplications.length > 0 && (
          <div className="recent-posts">
            <div className="section-header">
              <h2>Recent Applications</h2>
              <Link to="/admin/jobs/applications" className="view-all-btn">View All</Link>
            </div>
            <div className="posts-table-wrapper">
              <table className="posts-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Job</th>
                    <th>Experience</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map(app => (
                    <tr key={app._id}>
                      <td>
                        <strong>{app.firstName} {app.lastName}</strong>
                        <br />
                        <small style={{ color: 'var(--text-light)' }}>{app.email}</small>
                      </td>
                      <td>
                        <Link to={`/admin/jobs/applications/${app._id}`} className="post-title-link">
                          {app.job?.title}
                        </Link>
                      </td>
                      <td>{app.experience} years</td>
                      <td>
                        <span className={`status-badge ${
                          app.status === 'new' ? 'status-draft' :
                          app.status === 'reviewing' || app.status === 'interviewed' ? 'status-pending' :
                          app.status === 'shortlisted' || app.status === 'hired' ? 'status-published' :
                          'status-rejected'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Form Submissions Section */}
        {recentFormSubmissions.length > 0 && (
          <div className="recent-posts">
            <div className="section-header">
              <h2>Recent Form Submissions</h2>
              <Link to="/admin/forms" className="view-all-btn">View All Forms</Link>
            </div>
            <div className="posts-table-wrapper">
              <table className="posts-table">
                <thead>
                  <tr>
                    <th>Form Name</th>
                    <th>Responses</th>
                    <th>IP Address</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentFormSubmissions.map(submission => (
                    <tr key={submission._id}>
                      <td>
                        <strong>{submission.formTitle}</strong>
                      </td>
                      <td>{submission.responses?.length || 0} fields</td>
                      <td>{submission.ipAddress || 'N/A'}</td>
                      <td>{new Date(submission.submittedAt).toLocaleDateString()}</td>
                      <td>
                        <Link 
                          to={`/admin/forms/${submission.form}/submissions`} 
                          className="btn btn-sm btn-secondary"
                          style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Blog Summary Section */}
        <div className="blog-summary">
          <h2>Blog Summary</h2>
          <div className="blog-summary-grid">
            <div className="summary-card">
              <div className="summary-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                <FaCheckCircle />
              </div>
              <div className="summary-info">
                <h4>Published</h4>
                <p className="summary-number">{stats.blogPublished}</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon" style={{ background: 'rgba(251, 146, 60, 0.1)', color: '#fb923c' }}>
                <FaClock />
              </div>
              <div className="summary-info">
                <h4>Pending Review</h4>
                <p className="summary-number">{stats.blogPending}</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                <FaEye />
              </div>
              <div className="summary-info">
                <h4>Total Views</h4>
                <p className="summary-number">{stats.blogViews.toLocaleString()}</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                <FaBlog />
              </div>
              <div className="summary-info">
                <h4>Draft</h4>
                <p className="summary-number">{stats.blogPosts - stats.blogPublished - stats.blogPending}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/admin/products/new" className="action-card">
              <FaBox />
              <span>Add Product</span>
            </Link>
            <Link to="/admin/portfolio/new" className="action-card">
              <FaBriefcase />
              <span>Add Portfolio</span>
            </Link>
            <Link to="/admin/gallery/new" className="action-card">
              <FaImages />
              <span>Add Gallery Item</span>
            </Link>
            <Link to="/admin/pages/new" className="action-card">
              <FaFileAlt />
              <span>Create Page</span>
            </Link>
            <Link to="/admin/blog/new" className="action-card">
              <FaBlog />
              <span>Create Blog Post</span>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;

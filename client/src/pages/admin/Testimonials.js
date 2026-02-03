import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { FaEdit, FaTrash, FaPlus, FaCheck, FaTimes, FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Admin.css';

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/testimonials', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTestimonials(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching testimonials:', err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/testimonials/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTestimonials(testimonials.filter(t => t._id !== id));
        toast.success('Testimonial deleted successfully');
      } catch (err) {
        toast.error('Error deleting testimonial');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <h1>Manage Testimonials</h1>
          <Link to="/admin/testimonials/new" className="btn btn-primary">
            <FaPlus /> New Testimonial
          </Link>
        </header>

        {loading ? (
          <div className="loading">Loading testimonials...</div>
        ) : testimonials.length > 0 ? (
          <div className="admin-table-wrapper card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.map(testimonial => (
                  <tr key={testimonial._id}>
                    <td className="title-cell">{testimonial.name}</td>
                    <td>{testimonial.company}</td>
                    <td>
                      <span className="rating">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <FaStar key={i} />
                        ))}
                      </span>
                    </td>
                    <td>
                      {testimonial.isActive ? (
                        <span className="badge badge-success"><FaCheck /> Active</span>
                      ) : (
                        <span className="badge badge-warning"><FaTimes /> Inactive</span>
                      )}
                    </td>
                    <td>
                      {testimonial.isFeatured ? (
                        <FaCheck className="text-success" />
                      ) : (
                        <FaTimes className="text-muted" />
                      )}
                    </td>
                    <td>{new Date(testimonial.createdAt).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <Link to={`/admin/testimonials/${testimonial._id}`} className="btn btn-sm btn-secondary">
                        <FaEdit />
                      </Link>
                      <button onClick={() => handleDelete(testimonial._id)} className="btn btn-sm btn-danger">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state card">
            <p>No testimonials yet. Add your first testimonial to get started.</p>
            <Link to="/admin/testimonials/new" className="btn btn-primary">
              Create Testimonial
            </Link>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTestimonials;

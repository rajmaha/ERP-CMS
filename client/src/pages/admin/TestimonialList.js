import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaStar } from 'react-icons/fa';
import './Admin.css';

const TestimonialList = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/testimonials/admin', {
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

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/testimonials/${id}`, 
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchTestimonials();
      toast.success(currentStatus ? 'Testimonial hidden' : 'Testimonial shown');
    } catch (err) {
      toast.error('Error updating testimonial');
    }
  };

  if (loading) {
    return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <h1>Testimonials</h1>
          <Link to="/admin/testimonials/new" className="btn btn-primary">
            <FaPlus /> Add New Testimonial
          </Link>
        </header>

        {testimonials.length > 0 ? (
          <div className="testimonials-grid">
            {testimonials.map(testimonial => (
              <div key={testimonial._id} className="testimonial-card card">
                {testimonial.image && (
                  <div className="testimonial-avatar">
                    <img src={testimonial.image} alt={testimonial.name} />
                  </div>
                )}
                <div className="testimonial-info">
                  <h3>{testimonial.name}</h3>
                  <p className="testimonial-position">{testimonial.position}, {testimonial.company}</p>
                  <div className="testimonial-rating">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < testimonial.rating ? 'star-filled' : 'star-empty'} />
                    ))}
                  </div>
                  <p className="testimonial-content">{testimonial.content.substring(0, 100)}...</p>
                  <div className="testimonial-actions">
                    <button onClick={() => handleToggleActive(testimonial._id, testimonial.isActive)} className={`btn btn-sm ${testimonial.isActive ? 'btn-warning' : 'btn-success'}`}>
                      {testimonial.isActive ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <Link to={`/admin/testimonials/edit/${testimonial._id}`} className="btn btn-sm btn-secondary">
                      <FaEdit />
                    </Link>
                    <button onClick={() => handleDelete(testimonial._id)} className="btn btn-sm btn-danger">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state card">
            <p>No testimonials yet. Add your first testimonial.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TestimonialList;

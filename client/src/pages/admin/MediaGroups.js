import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/AdminLayout';
import HeroIconPicker from '../../components/HeroIconPicker';

const MediaGroups = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#000000'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMediaGroup = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/media-groups/${id}`);
        setFormData(response.data.data);
      } catch (error) {
        toast.error('Error fetching media group');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMediaGroup();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await axios.put(`/api/media-groups/${id}`, formData);
        toast.success('Media group updated successfully');
      } else {
        await axios.post('/api/media-groups', formData);
        toast.success('Media group created successfully');
      }
      navigate('/admin/media-groups');
    } catch (error) {
      toast.error('Error saving media group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container">
        <h1 className="my-4">{id ? 'Edit' : 'Create'} Media Group</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              className="form-control" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              className="form-control" 
              rows="3" 
              required 
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Icon</label>
              <HeroIconPicker 
                value={formData.icon} 
                onChange={(icon) => setFormData({ ...formData, icon })} 
                label="" 
              />
            </div>
            <div className="form-group">
              <label>Color</label>
              <input 
                type="color" 
                name="color" 
                value={formData.color} 
                onChange={handleChange} 
                className="form-control" 
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            {loading ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};

export default MediaGroups;
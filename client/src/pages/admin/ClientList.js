import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Admin.css';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/clients/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/clients/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClients(clients.filter(c => c._id !== id));
        toast.success('Client deleted successfully');
      } catch (err) {
        toast.error('Error deleting client');
      }
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/clients/${id}`, 
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchClients();
      toast.success(currentStatus ? 'Client hidden' : 'Client shown');
    } catch (err) {
      toast.error('Error updating client');
    }
  };

  if (loading) {
    return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <h1>Clients</h1>
          <Link to="/admin/clients/new" className="btn btn-primary">
            <FaPlus /> Add New Client
          </Link>
        </header>

        {clients.length > 0 ? (
          <div className="clients-grid">
            {clients.map(client => (
              <div key={client._id} className="client-card card">
                {client.logo && (
                  <div className="client-logo">
                    <img src={client.logo} alt={client.name} />
                  </div>
                )}
                <div className="client-info">
                  <h3>{client.name}</h3>
                  {client.website && <p className="client-website">{client.website}</p>}
                  <div className="client-actions">
                    <button onClick={() => handleToggleActive(client._id, client.isActive)} className={`btn btn-sm ${client.isActive ? 'btn-warning' : 'btn-success'}`}>
                      {client.isActive ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <Link to={`/admin/clients/edit/${client._id}`} className="btn btn-sm btn-secondary">
                      <FaEdit />
                    </Link>
                    <button onClick={() => handleDelete(client._id)} className="btn btn-sm btn-danger">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state card">
            <p>No clients yet. Add your first client.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ClientList;

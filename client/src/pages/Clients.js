import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SEO from '../components/SEO';
import './Clients.css';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await axios.get('/api/clients');
      setClients(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-page">Loading...</div>;
  }

  return (
    <>
      <SEO 
        title="Our Clients"
        description="Trusted by leading companies worldwide"
      />

      <div className="clients-page">
        <section className="clients-hero">
          <div className="container">
            <h1>Our Clients</h1>
            <p>Trusted by leading companies worldwide</p>
          </div>
        </section>

        <section className="clients-content">
          <div className="container">
            {clients.length > 0 ? (
              <div className="clients-grid">
                {clients.map((client) => (
                  <div key={client._id} className="client-card">
                    {client.logo && (
                      <div className="client-logo">
                        <img src={client.logo} alt={client.name} />
                      </div>
                    )}
                    <div className="client-info">
                      <h3>{client.name}</h3>
                      {client.description && (
                        <div dangerouslySetInnerHTML={{ __html: client.description }}></div>
                      )}
                      {client.website && (
                        <a 
                          href={client.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="client-website"
                        >
                          Visit Website →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No clients to display at the moment.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Clients;

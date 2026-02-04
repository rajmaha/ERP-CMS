import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    showLoginToPublic: true,
    showRegistrationToPublic: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/settings');
        if (res.data && res.data.data) {
          setSettings({
            showLoginToPublic: res.data.data.showLoginToPublic !== undefined ? res.data.data.showLoginToPublic : true,
            showRegistrationToPublic: res.data.data.showRegistrationToPublic !== undefined ? res.data.data.showRegistrationToPublic : true,
          });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

const Settings = require('../models/Settings');
const jwt = require('jsonwebtoken');

// Middleware to check maintenance mode
const checkMaintenanceMode = async (req, res, next) => {
  try {
    const settings = await Settings.findOne();
    
    // If maintenance mode is disabled, proceed normally
    if (!settings || !settings.maintenanceMode) {
      return next();
    }

    // Routes that should be accessible during maintenance mode for everyone
    const publicAllowedRoutes = [
      '/api/pages/contact', // Contact page API
      '/api/contact', // Contact form submission
      '/contact', // Contact page
      '/api/auth/login', // Login page
      '/login', // Login page
      '/api/settings', // Settings API (so anyone can get site info)
    ];

    // Check if current route is in the public allowed list
    const isPublicAllowedRoute = publicAllowedRoutes.some(route => req.path.startsWith(route));

    // Try to get user from JWT token (if provided)
    let user = null;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        user = decoded;
      } catch (error) {
        // Token is invalid, continue without user
      }
    }

    // If admin user, always allow
    if (user && user.role === 'admin') {
      return next();
    }

    // If it's a public allowed route, allow access
    if (isPublicAllowedRoute) {
      return next();
    }

    // For all other routes during maintenance mode, return error
    return res.status(503).json({
      success: false,
      message: 'Site is currently in maintenance mode. Please try again later.',
      maintenanceMode: true
    });
  } catch (error) {
    console.error('Maintenance mode check error:', error);
    // If there's an error checking maintenance mode, allow the request to proceed
    next();
  }
};

module.exports = checkMaintenanceMode;

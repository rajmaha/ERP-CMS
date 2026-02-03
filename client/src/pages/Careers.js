import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SEO from '../components/SEO';
import { FaMapMarkerAlt, FaClock, FaBriefcase, FaStar, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Careers.css';

const Careers = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    location: '',
    employmentType: '',
    experienceLevel: ''
  });
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchJobs();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('/api/jobs/departments/list');
      setDepartments(res.data.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await axios.get('/api/jobs');
      setJobs(res.data.data);
      
      // Extract unique locations
      const locs = [...new Set(res.data.data.map(job => job.location))];
      setLocations(locs);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [jobs, filters]);

  const applyFilters = () => {
    let filtered = [...jobs];

    if (filters.search) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.department) {
      filtered = filtered.filter(job => job.department === filters.department);
    }

    if (filters.location) {
      filtered = filtered.filter(job => job.location === filters.location);
    }

    if (filters.employmentType) {
      filtered = filtered.filter(job => job.employmentType === filters.employmentType);
    }

    if (filters.experienceLevel) {
      filtered = filtered.filter(job => job.experienceLevel === filters.experienceLevel);
    }

    setFilteredJobs(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const getEmploymentTypeLabel = (type) => {
    const labels = {
      'full-time': 'Full Time',
      'part-time': 'Part Time',
      'contract': 'Contract',
      'internship': 'Internship',
      'remote': 'Remote'
    };
    return labels[type] || type;
  };

  const getExperienceLevelLabel = (level) => {
    const labels = {
      'entry': 'Entry Level',
      'mid': 'Mid Level',
      'senior': 'Senior Level',
      'executive': 'Executive'
    };
    return labels[level] || level;
  };

  if (loading) {
    return <div className="loading">Loading opportunities...</div>;
  }

  return (
    <>
      <SEO 
        title="Careers - Join Our Team"
        description="Explore career opportunities and join our growing team. Find your dream job today."
      />

      <div className="careers-page">
        <section className="careers-hero">
          <div className="container">
            <h1>Join Our Team</h1>
            <p>Shape the future with us. Explore opportunities to grow your career.</p>
          </div>
        </section>

        <section className="careers-content">
          <div className="container">
            <div className="careers-filters">
              <div className="search-box">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              <select value={filters.department} onChange={(e) => handleFilterChange('department', e.target.value)}>
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>

              <select value={filters.location} onChange={(e) => handleFilterChange('location', e.target.value)}>
                <option value="">All Locations</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>

              <select value={filters.employmentType} onChange={(e) => handleFilterChange('employmentType', e.target.value)}>
                <option value="">All Types</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>

              <select value={filters.experienceLevel} onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}>
                <option value="">All Levels</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="executive">Executive</option>
              </select>
            </div>

            <div className="jobs-stats">
              <p>Showing <strong>{filteredJobs.length}</strong> of <strong>{jobs.length}</strong> open positions</p>
            </div>

            <div className="jobs-list">
              {filteredJobs.length > 0 ? (
                filteredJobs.map(job => (
                  <div key={job._id} className="job-card">
                    <div className="job-header">
                      <div>
                        <h3>{job.title}</h3>
                        {job.featured && <span className="badge-featured">Featured</span>}
                      </div>
                      <span className="job-department" style={{ backgroundColor: job.department?.color }}>
                        {job.department?.icon && (
                          <span style={{ marginRight: '0.5rem' }}>
                            {/^[\p{Emoji}]+$/u.test(job.department.icon) ? job.department.icon : <i className={`fas fa-${job.department.icon}`}></i>}
                          </span>
                        )}
                        {job.department?.name}
                      </span>
                    </div>

                    <div className="job-meta">
                      <span className="job-meta-item">
                        <FaMapMarkerAlt /> {job.location}
                      </span>
                      <span className="job-meta-item">
                        <FaClock /> {getEmploymentTypeLabel(job.employmentType)}
                      </span>
                      <span className="job-meta-item">
                        <FaBriefcase /> {getExperienceLevelLabel(job.experienceLevel)}
                      </span>
                    </div>

                    <div className="job-excerpt" dangerouslySetInnerHTML={{ __html: job.description.substring(0, 200) + '...' }}></div>

                    {job.salaryRange && job.salaryRange.min && (
                      <div className="job-salary">
                        Salary: {job.salaryRange.currency} {job.salaryRange.min.toLocaleString()} - {job.salaryRange.max.toLocaleString()}
                      </div>
                    )}

                    <div className="job-footer">
                      <Link to={`/careers/${job.slug}`} className="btn btn-primary">
                        View Details & Apply
                      </Link>
                      {job.applicationDeadline && (
                        <span className="deadline">
                          Apply by: {new Date(job.applicationDeadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-jobs">
                  <p>No positions match your search criteria.</p>
                  <button onClick={() => setFilters({ search: '', department: '', location: '', employmentType: '', experienceLevel: '' })} className="btn btn-secondary">
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Careers;

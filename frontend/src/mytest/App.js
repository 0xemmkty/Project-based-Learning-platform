import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './styles.css';

function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects');
      console.log('Projects loaded:', response.data);
      setProjects(response.data);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="projects-grid">
      {projects.map(project => (
        <div key={project.id} className="project-card">
          {project.media && project.media.length > 0 && (
            <img 
              src={project.media[0].url} 
              alt={project.title}
              className="project-image"
            />
          )}
          <div className="project-info">
            <h3>{project.title}</h3>
            <p>{project.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;

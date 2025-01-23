import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Button, Box, Chip, Stack } from '@mui/material';
import api from '../services/api';

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${id}`);
        setProject(response.data);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };
    fetchProject();
  }, [id]);

  if (!project) return <div>Loading...</div>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {project.title}
        </Typography>
        
        <Box sx={{ my: 2 }}>
          <Typography variant="body1">
            {project.description}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ my: 2 }}>
          {project.tags.map((tag, index) => (
            <Chip key={index} label={tag} />
          ))}
        </Stack>

        {project.image && (
          <Box sx={{ my: 2 }}>
            <img 
              src={project.image} 
              alt={project.title}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </Box>
        )}

        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={() => navigate(`/projects/${id}/edit`)}
          >
            Edit Project
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/projects')}
          >
            Back to Gallery
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default ProjectDetail; 
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Box, Typography } from '@mui/material';
import api from '../services/api';

function ProjectEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [],
    category: ''
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${id}`);
        setFormData(response.data);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };
    fetchProject();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${id}`, formData);
      navigate(`/projects/${id}`);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Edit Project
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
          />
          {/* Add other form fields similar to ProjectCreate */}
          <Box sx={{ mt: 3 }}>
            <Button type="submit" variant="contained" sx={{ mr: 2 }}>
              Save Changes
            </Button>
            <Button variant="outlined" onClick={() => navigate(`/projects/${id}`)}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default ProjectEdit; 
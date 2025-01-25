import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
  Chip,
  Stack,
  Input
} from '@mui/material';
import api from '../services/api';

function ProjectCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [],
    category: 'mechanical',
    image: null
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'tags') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      await api.post('/projects', formDataToSend);
      navigate('/projects');
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const handleTagsChange = (event) => {
    const tags = event.target.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag);
    setFormData(prev => ({ ...prev, tags }));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Create New Project
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            required
            label="Project Title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            margin="normal"
          />

          <TextField
            fullWidth
            required
            multiline
            rows={4}
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Tags (comma separated)"
            value={formData.tags.join(', ')}
            onChange={handleTagsChange}
            margin="normal"
            helperText="Example: Mechanical Design, Robotics, IoT"
          />

          <Select
            fullWidth
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            margin="normal"
            sx={{ mt: 2, mb: 2 }}
          >
            <MenuItem value="mechanical">Mechanical</MenuItem>
            <MenuItem value="electrical">Electrical</MenuItem>
            <MenuItem value="software">Software</MenuItem>
          </Select>

          {formData.tags.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 2 }}>
              {formData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => {
                    const newTags = formData.tags.filter((_, i) => i !== index);
                    setFormData(prev => ({ ...prev, tags: newTags }));
                  }}
                />
              ))}
            </Stack>
          )}

          <Box sx={{ mt: 2, mb: 3 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload"
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="image-upload">
              <Button variant="outlined" component="span">
                Upload Project Image
              </Button>
            </label>
            {formData.image && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {formData.image.name}
              </Typography>
            )}
          </Box>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/projects')}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default ProjectCreate; 
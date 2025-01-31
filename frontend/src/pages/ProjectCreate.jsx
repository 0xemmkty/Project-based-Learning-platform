import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Paper,
  Stack,
  Chip,
  IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

const ProjectType = {
  ENTREPRENEURSHIP: 'ENTREPRENEURSHIP',
  INNOVATION: 'INNOVATION',
  PRODUCT_DEVELOPMENT: 'PRODUCT_DEVELOPMENT'
};

const SkillLevel = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED'
};

const institutions = ['MIT', 'Stanford', 'Yale', 'Shenzhen'];

export function ProjectCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    institution: '',
    projectType: '',
    skillLevel: '',
    tags: [],
    mediaFiles: [],
    relatedLinks: ['']
  });
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToDelete)
    });
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData(prev => ({
      ...prev,
      mediaFiles: [...prev.mediaFiles, ...files]
    }));
  };

  const handleAddLink = () => {
    setFormData({
      ...formData,
      relatedLinks: [...formData.relatedLinks, '']
    });
  };

  const handleLinkChange = (index, value) => {
    const newLinks = [...formData.relatedLinks];
    newLinks[index] = value;
    setFormData({
      ...formData,
      relatedLinks: newLinks
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.institution) {
      setError('Please fill in all required fields');
      return;
    }
    alert(JSON.stringify(formData.tags));
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('institution', formData.institution);
      formDataToSend.append('projectType', formData.projectType);
      formDataToSend.append('skillLevel', formData.skillLevel);
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      
      formData.mediaFiles.forEach(file => {
        formDataToSend.append('files', file);
      });
      
      formDataToSend.append('relatedLinks', JSON.stringify(formData.relatedLinks.filter(link => link)));

      const response = await api.post('/api/projects', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Project created:', response.data);
      
      navigate('/projects/browser');
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Error creating project: ' + error.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
          Create New Project
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}

            <TextField
              required
              label="Project Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              size="small"
            />

            <TextField
              required
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
              size="small"
            />

            <FormControl fullWidth required size="small">
              <InputLabel>Institution</InputLabel>
              <Select
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                label="Institution"
              >
                {institutions.map((inst) => (
                  <MenuItem key={inst} value={inst}>{inst}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required size="small">
              <InputLabel>Project Type</InputLabel>
              <Select
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                label="Project Type"
              >
                {Object.entries(ProjectType).map(([key, value]) => (
                  <MenuItem key={key} value={value}>{key}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required size="small">
              <InputLabel>Skill Level</InputLabel>
              <Select
                name="skillLevel"
                value={formData.skillLevel}
                onChange={handleChange}
                label="Skill Level"
              >
                {Object.entries(SkillLevel).map(([key, value]) => (
                  <MenuItem key={key} value={value}>{key}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <TextField
                label="Add Tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyPress}
                fullWidth
                size="small"
                helperText="Press Enter to add a tag"
              />
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleDeleteTag(tag)}
                    size="small"
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                size="small"
              >
                Upload Files
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={handleFileUpload}
                />
              </Button>
              <Box sx={{ mt: 1 }}>
                {formData.mediaFiles.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    onDelete={() => {
                      const newFiles = formData.mediaFiles.filter((_, i) => i !== index);
                      setFormData({ ...formData, mediaFiles: newFiles });
                    }}
                    size="small"
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="body2" gutterBottom>
                Related Links
              </Typography>
              {formData.relatedLinks.map((link, index) => (
                <Stack direction="row" spacing={1} key={index} sx={{ mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label={`Link ${index + 1}`}
                    value={link}
                    onChange={(e) => handleLinkChange(index, e.target.value)}
                  />
                  <IconButton 
                    size="small"
                    color="error" 
                    onClick={() => {
                      const newLinks = formData.relatedLinks.filter((_, i) => i !== index);
                      setFormData({ ...formData, relatedLinks: newLinks });
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ))}
              <Button 
                variant="text" 
                onClick={handleAddLink}
                size="small"
              >
                Add Link
              </Button>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Create Project
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

export default ProjectCreate; 
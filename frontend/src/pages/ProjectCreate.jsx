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
  MECHANICAL: 'MECHANICAL',
  ELECTRICAL: 'ELECTRICAL',
  SOFTWARE: 'SOFTWARE',
  ENTREPRENEURSHIP: 'ENTREPRENEURSHIP'
};

const SkillLevel = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED'
};

const institutions = ['MIT', 'Stanford', 'Yale', 'Wisconsin'];

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

      await api.post('/projects', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/projects');
    } catch (error) {
      setError('Error creating project: ' + error.message);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Project
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {error && (
              <Typography color="error">
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
            />

            <TextField
              required
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
            />

            <FormControl fullWidth required>
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

            <FormControl fullWidth required>
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

            <FormControl fullWidth required>
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
                onKeyPress={handleTagInputKeyPress}
                fullWidth
                helperText="Press Enter to add a tag"
              />
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleDeleteTag(tag)}
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
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
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Related Links
              </Typography>
              {formData.relatedLinks.map((link, index) => (
                <Stack direction="row" spacing={2} key={index} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label={`Link ${index + 1}`}
                    value={link}
                    onChange={(e) => handleLinkChange(index, e.target.value)}
                  />
                  <IconButton 
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
              <Button variant="outlined" onClick={handleAddLink}>
                Add Link
              </Button>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
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
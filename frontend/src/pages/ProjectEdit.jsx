import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Stack,
  Grid,
  MenuItem,
  Chip,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import api from '../services/api';

const institutions = ['MIT', 'Stanford', 'Yale', 'Shenzhen'];
const projectTypes = ['ENTREPRENEURSHIP', 'INNOVATION', 'PRODUCT_DEVELOPMENT'];
const skillLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

function ProjectEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    institution: '',
    projectType: '',
    skillLevel: '',
    tags: [],
    relatedLinks: [],
    files: [],
    existingMedia: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [existingMedia, setExistingMedia] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching project with ID:', id);
      const response = await api.get(`/api/projects/${id}`);
      console.log('Project response:', response.data);
      
      if (!response.data) {
        throw new Error('No project data received');
      }

      setProject(response.data);
      setExistingMedia(response.data.media || []);
      setFormData({
        title: response.data.title || '',
        description: response.data.description || '',
        content: response.data.content || '',
        institution: response.data.institution || '',
        projectType: response.data.projectType || '',
        skillLevel: response.data.skillLevel || '',
        tags: response.data.tags?.map(tag => tag.name) || [],
        relatedLinks: response.data.relatedLinks || [],
        files: [],
        existingMedia: response.data.media || []
      });

      console.log('Project loaded successfully');
      
    } catch (err) {
      console.error('Error fetching project:', err);
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagAdd = (event) => {
    if (event.key === 'Enter' && event.target.value) {
      const newTag = event.target.value.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      event.target.value = '';
    }
  };

  const handleTagDelete = (tagToDelete) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  };

  const handleLinkAdd = () => {
    setFormData(prev => ({
      ...prev,
      relatedLinks: [...prev.relatedLinks, '']
    }));
  };

  const handleLinkChange = (index, value) => {
    const newLinks = [...formData.relatedLinks];
    newLinks[index] = value;
    setFormData(prev => ({
      ...prev,
      relatedLinks: newLinks
    }));
  };

  const handleLinkDelete = (index) => {
    setFormData(prev => ({
      ...prev,
      relatedLinks: prev.relatedLinks.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }));
  };

  const handleExistingMediaDelete = async (mediaId) => {
    try {
      await api.delete(`/api/projects/${id}/image/${mediaId}`);
      
      setExistingMedia(prevMedia => 
        prevMedia.filter(media => media.id !== mediaId)
      );
      
      console.log('Media deleted successfully:', mediaId);
      
    } catch (err) {
      console.error('Error deleting media:', err);
      alert(err.response?.data?.message || 'Failed to delete media');
    }
  };

  const handleNewMediaDelete = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('institution', formData.institution);
      formDataToSend.append('projectType', formData.projectType);
      formDataToSend.append('skillLevel', formData.skillLevel);
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      formDataToSend.append('relatedLinks', JSON.stringify(formData.relatedLinks));
      formDataToSend.append('existingMedia', JSON.stringify(formData.existingMedia));

      formData.files.forEach(file => {
        formDataToSend.append('files', file);
      });

      await api.put(`/api/projects/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate(`/projects/${id}`);
    } catch (err) {
      setError('Failed to update project');
    }
  };

  const handleDelete = async () => {
    try {
      const confirmed = window.confirm('Are you sure you want to delete this project?');
      if (!confirmed) return;

      setLoading(true);
      
      await api.delete(`/api/projects/${id}`);
      
      console.log('Project deleted successfully');
      
      navigate('/projects/browser');
      
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Project
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              label="Institution"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
            >
              {institutions.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              label="Project Type"
              name="projectType"
              value={formData.projectType}
              onChange={handleChange}
            >
              {projectTypes.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              label="Skill Level"
              name="skillLevel"
              value={formData.skillLevel}
              onChange={handleChange}
            >
              {skillLevels.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Tags
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
            {formData.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => handleTagDelete(tag)}
                sx={{ m: 0.5 }}
              />
            ))}
          </Stack>
          <TextField
            fullWidth
            label="Add tag (press Enter)"
            onKeyPress={handleTagAdd}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
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
                onClick={() => handleLinkDelete(index)}
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
          ))}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleLinkAdd}
          >
            Add Link
          </Button>
        </Box>

        {existingMedia.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Existing Media
            </Typography>
            <Grid container spacing={2}>
              {existingMedia.map((media) => (
                <Grid item xs={12} sm={6} md={4} key={media.id}>
                  <Card>
                    {media.type === 'IMAGE' ? (
                      <CardMedia
                        component="img"
                        height="140"
                        image={media.url}
                        alt="Project media"
                      />
                    ) : (
                      <CardContent>
                        <Typography>{media.type}</Typography>
                      </CardContent>
                    )}
                    <CardContent>
                      <Button
                        fullWidth
                        color="error"
                        onClick={() => handleExistingMediaDelete(media.id)}
                      >
                        Delete
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add New Media
          </Typography>
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
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {formData.files.map((file, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent>
                    <Typography noWrap>{file.name}</Typography>
                    <Button
                      fullWidth
                      color="error"
                      onClick={() => handleNewMediaDelete(index)}
                    >
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Button
            onClick={handleDelete}
            disabled={loading}
            variant="contained" 
            color="error"
          >
            {loading ? 'Deleting...' : 'Delete Project'}
          </Button>
          <Box>
            <Button
              sx={{ mr: 2 }}
              onClick={() => navigate(`/projects/${id}`)}
              startIcon={<CancelIcon />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
            >
              Save Changes
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Project?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this project? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ProjectEdit; 
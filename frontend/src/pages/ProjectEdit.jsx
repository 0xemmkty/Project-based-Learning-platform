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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    institution: '',
    projectType: '',
    skillLevel: '',
    tags: [],
    relatedLinks: [],
    mediaFiles: [],
    existingMedia: []
  });

  // 获取项目数据
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${id}`);
        const project = response.data;
        setFormData({
          title: project.title || '',
          description: project.description || '',
          institution: project.institution || '',
          projectType: project.projectType || '',
          skillLevel: project.skillLevel || '',
          tags: project.tags || [],
          relatedLinks: project.relatedLinks || [],
          mediaFiles: [],
          existingMedia: project.media || []
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to load project');
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  // 处理表单变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理标签
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

  // 处理相关链接
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

  // 处理媒体文件
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData(prev => ({
      ...prev,
      mediaFiles: [...prev.mediaFiles, ...files]
    }));
  };

  const handleExistingMediaDelete = (mediaId) => {
    setFormData(prev => ({
      ...prev,
      existingMedia: prev.existingMedia.filter(media => media.id !== mediaId)
    }));
  };

  const handleNewMediaDelete = (index) => {
    setFormData(prev => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, i) => i !== index)
    }));
  };

  // 提交表单
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

      formData.mediaFiles.forEach(file => {
        formDataToSend.append('mediaFiles', file);
      });

      await api.put(`/projects/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate(`/projects/${id}`);
    } catch (err) {
      setError('Failed to update project');
    }
  };

  // 删除项目
  const handleDelete = async () => {
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects');
    } catch (err) {
      setError('Failed to delete project');
    }
    setDeleteDialogOpen(false);
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Project
        </Typography>

        {/* 基本信息 */}
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

        {/* 标签 */}
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

        {/* 相关链接 */}
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

        {/* 现有媒体文件 */}
        {formData.existingMedia.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Existing Media
            </Typography>
            <Grid container spacing={2}>
              {formData.existingMedia.map((media) => (
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

        {/* 新媒体文件上传 */}
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
            {formData.mediaFiles.map((file, index) => (
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

        {/* 操作按钮 */}
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Button
            color="error"
            variant="contained"
            onClick={() => setDeleteDialogOpen(true)}
            startIcon={<DeleteIcon />}
          >
            Delete Project
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

      {/* 删除确认对话框 */}
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
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Stack,
  Chip,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';
import LinkIcon from '@mui/icons-material/Link';
import api from '../services/api';

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/api/projects/${id}`);
        setProject(response.data);
        console.log(JSON.stringify(response.data));
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Failed to load project details');
      }
    };
    fetchProject();
  }, [id]);

  if (!project) return <div>Loading Detail...</div>;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        {/* 标题部分 */}
        <Typography variant="h4" gutterBottom>
          {project.title}
        </Typography>

        {/* 基本信息 */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Institution
            </Typography>
            <Typography variant="body1">
              {project.institution || 'Not specified'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Project Type
            </Typography>
            <Typography variant="body1">
              {project.projectType || 'Not specified'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Skill Level
            </Typography>
            <Typography variant="body1">
              {project.skillLevel || 'Not specified'}
            </Typography>
          </Grid>
        </Grid>

        {/* 标签 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Tags
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {project.tags && project.tags.length > 0 ? (
              project.tags.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.name} // 修改为显示 tag.name
                  sx={{ m: 0.5 }}
                  color="primary"
                  variant="outlined"
                />
              ))
            ) : (
              <Typography color="text.secondary">No tags available</Typography>
            )}
          </Stack>
        </Box>


        {/* 相关链接 */}
        {project.relatedLinks && project.relatedLinks.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Related Links
            </Typography>
            <List>
              {project.relatedLinks.map((link, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <LinkIcon />
                  </ListItemIcon>
                  <ListItemText>
                    <Link href={link} target="_blank" rel="noopener noreferrer">
                      {link}
                    </Link>
                  </ListItemText>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* 媒体文件 */}
        {project.media && project.media.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Media Files
            </Typography>
            <Grid container spacing={2}>
              {project.media.map((media, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  {media.type === 'IMAGE' ? (
                    <Card>
                      <CardMedia
                        component="img"
                        height="200"
                        image={media.url}
                        alt={`Project media ${index + 1}`}
                        sx={{ objectFit: 'cover' }}
                      />
                    </Card>
                  ) : media.type === 'VIDEO' ? (
                    <Card>
                      <CardMedia
                        component="video"
                        height="200"
                        controls
                        src={media.url}
                      />
                    </Card>
                  ) : (
                    <Card>
                      <CardActionArea
                        href={media.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <CardContent>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <DescriptionIcon />
                            <Typography>
                              Document {index + 1}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  )}
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* 创建和更新时间 */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Created At
              </Typography>
              <Typography>
                {new Date(project.createdAt).toLocaleString()}
              </Typography>
            </Grid>
            {project.updatedAt && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography>
                  {new Date(project.updatedAt).toLocaleString()}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* 操作按钮 */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={() => navigate(`/projects/${id}/edit`)}
            startIcon={<EditIcon />}
          >
            Edit Project
          </Button>
          <Button 
            onClick={() => navigate('/projects/browser')}
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 2 }}
          >
            Back to Gallery
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default ProjectDetail; 
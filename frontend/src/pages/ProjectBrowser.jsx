import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  CardMedia,
  Pagination,
  CardActions,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/projects.css';
import SearchIcon from '@mui/icons-material/Search';

// Sample data - In a real application, this would come from an API
const institutions = ['MIT', 'Stanford', 'Yale', 'Shenzhen'];
const projectTypes = ['ENTREPRENEURSHIP', 'INNOVATION', 'PRODUCT_DEVELOPMENT'];
const skillLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

const ProjectBrowser = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    institution: '',
    type: '',
    skillLevel: '',
  });
  const [page, setPage] = useState(1);
  const projectsPerPage = 6;
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        console.log('Fetching projects with filters:', filters);
        
        const response = await api.get('/api/projects', {
          params: {
            institution: filters.institution,
            projectType: filters.type,
            skillLevel: filters.skillLevel
          }
        });
        
        console.log('Projects response:', response.data);
        setProjects(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching projects:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [filters]);

  const getFilteredProjects = () => {
    return projects.filter(project => {
      const searchLower = searchTerm.toLowerCase();
      const titleMatch = project.title.toLowerCase().includes(searchLower);
      const descMatch = project.description.toLowerCase().includes(searchLower);
      const searchMatch = searchTerm === '' || titleMatch || descMatch;

      const institutionMatch = !filters.institution || project.institution === filters.institution;
      const typeMatch = !filters.type || project.projectType === filters.type;
      const skillMatch = !filters.skillLevel || project.skillLevel === filters.skillLevel;

      return searchMatch && institutionMatch && typeMatch && skillMatch;
    });
  };

  const filteredProjects = getFilteredProjects();
  const pageCount = Math.ceil(filteredProjects.length / projectsPerPage);
  const displayedProjects = filteredProjects.slice(
    (page - 1) * projectsPerPage,
    page * projectsPerPage
  );

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading) return (
    <Container>
      <Typography>Loading projects...</Typography>
    </Container>
  );

  if (error) return (
    <Container>
      <Typography color="error">{error}</Typography>
    </Container>
  );

  return (
    <div className="projects-browser">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={2} sx={{ mb: 4 }} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Institution</InputLabel>
              <Select
                name="institution"
                value={filters.institution}
                onChange={handleFilterChange}
                label="Institution"
              >
                <MenuItem value="">All</MenuItem>
                {institutions.map((inst) => (
                  <MenuItem key={inst} value={inst}>{inst}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Project Type</InputLabel>
              <Select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                label="Project Type"
              >
                <MenuItem value="">All</MenuItem>
                {projectTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Skill Level</InputLabel>
              <Select
                name="skillLevel"
                value={filters.skillLevel}
                onChange={handleFilterChange}
                label="Skill Level"
              >
                <MenuItem value="">All</MenuItem>
                {skillLevels.map((level) => (
                  <MenuItem key={level} value={level}>{level}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {displayedProjects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {project.media && project.media.length > 0 && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={project.media.find(m => m.type === 'IMAGE')?.url || '/placeholder.jpg'}
                    alt={project.title}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {project.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {project.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {project.institution && (
                      <Chip label={project.institution} size="small" />
                    )}
                    {project.skillLevel && (
                      <Chip label={project.skillLevel} size="small" />
                    )}
                    {project.projectType && (
                      <Chip label={project.projectType} size="small" />
                    )}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    component={Link} 
                    to={`/projects/${project.id}`}
                    variant="contained"
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={pageCount} 
            page={page} 
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      </Container>
    </div>
  );
};

export default ProjectBrowser;
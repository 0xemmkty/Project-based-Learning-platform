import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <Container>
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h2" gutterBottom>
          404
        </Typography>
        <Typography variant="h5" gutterBottom>
          Page Not Found
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/projects')}
          sx={{ mt: 3 }}
        >
          Back to Gallery
        </Button>
      </Box>
    </Container>
  );
}

export default NotFound; 
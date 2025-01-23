import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

function Navbar() {
  const location = useLocation();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
          Engineering Projects
        </Typography>
        <Box>
          <Button 
            color="inherit" 
            component={Link} 
            to="/projects"
            sx={{ mx: 1 }}
          >
            Gallery
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            to="/projects/create"
            sx={{ mx: 1 }}
          >
            Create Project
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 
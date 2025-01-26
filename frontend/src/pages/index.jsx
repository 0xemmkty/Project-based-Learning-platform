import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import '../styles/index.css'; 
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  useTheme,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import EngineeringIcon from '@mui/icons-material/Engineering';

function LandingPage() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        pt: 10, // 为导航栏留出空间
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          py: 12,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={8} textAlign="center">
              <Typography variant="h2" component="h1" gutterBottom>
                Bridging Academia and Industry
              </Typography>
              <Typography variant="h5" paragraph>
                Experience a revolutionary engineering education platform that connects 
                students with real industry projects. Learn by doing, grow by collaborating.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Join us in transforming engineering education through enterprise-engaged,
                project-based learning that prepares you for real-world success.
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 4 }} justifyContent="center">
                <Button
                  component={RouterLink}
                  to="/projects/browser"
                  variant="outlined"
                  color="primary"
                  size="large"
                >
                  Explore Projects
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <SchoolIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Industry-Driven Learning
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Engage in projects designed and mentored by industry professionals,
                  gaining real-world experience while still in school.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <BusinessIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Enterprise Collaboration
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Work directly with leading companies on actual industry challenges,
                  building professional networks and career opportunities.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <EngineeringIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Applied Engineering
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Transform theoretical knowledge into practical skills through 
                  hands-on projects that solve real industry problems.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default LandingPage;
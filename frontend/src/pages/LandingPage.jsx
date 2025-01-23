import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f8f9fa;
  padding: 20px;
  overflow: hidden;
`;

const Title = styled(motion.h1)`
  font-size: 5rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 800;
  text-align: center;
`;

const Subtitle = styled(motion.p)`
  font-size: 1.8rem;
  color: #34495e;
  margin: 20px 0;
  text-align: center;
  max-width: 600px;
`;

const ButtonGroup = styled(motion.div)`
  display: flex;
  gap: 20px;
  margin-top: 40px;
`;

const StyledButton = styled(Link)`
  padding: 15px 30px;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &.primary {
    background: #3498db;
    color: white;
    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
  }

  &.secondary {
    background: white;
    color: #3498db;
    border: 2px solid #3498db;
  }
`;

const LandingPage = () => {
  return (
    <PageContainer>
      <AnimatePresence>
        <Title
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          EduBridge
        </Title>

        <Subtitle
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          Promoting enterprise-involved learning
        </Subtitle>

        <ButtonGroup
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <StyledButton to="/login" className="primary">
            Log In
          </StyledButton>
          <StyledButton to="/register" className="secondary">
            Sign Up
          </StyledButton>
          <StyledButton to="/projects" className="secondary">
            Project Gallery
          </StyledButton>
        </ButtonGroup>
      </AnimatePresence>
    </PageContainer>
  );
};

export default LandingPage; 
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Navbar from '../components/Navbar';

const HomePage = () => {
  return (
    <div>
        <Navbar />
        <Container maxWidth="sm" style={{ textAlign: 'center', marginTop: '50px' }}>
        
        <Typography variant="h4" gutterBottom>
            Welcome to the Focus App
        </Typography>
        <Typography variant="body1" paragraph>
            The Focus App helps you stay organized and boost productivity.
        </Typography>
        <Typography variant="body1" paragraph>
            Log in or create an account to get started!
        </Typography>
        <Button
            component={Link}
            to="/login"
            variant="contained"
            color="primary"
            style={{ margin: '10px' }}
        >
            Log In
        </Button>
        <Button
            component={Link}
            to="/create-user"
            variant="contained"
            color="secondary"
            style={{ margin: '10px' }}
        >
            Create Account
        </Button>
        </Container>
    </div>
    
  );
};

export default HomePage;

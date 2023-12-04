// src/components/Navbar.js

import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Button component={Link}
            to="/" color="inherit">Focus</Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

//pages/CreateUser.js

import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import axios from 'axios';  // Import axios
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import { InputAdornment, IconButton } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const CreateUser = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthday, setBirthday] = useState('');
  const [bio, setBio] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [createError, setCreateError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);
  
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    // Do something with the selected file (e.g., save it to state)
    console.log('Selected File:', file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Send API request to create user
      const response = await axios.post('http://127.0.0.1:5000/api/createuser', {
        username: username,
        email: email,
        password: password,
        birthday: birthday,
        bio: bio,
        profile_image_url: "profileImageUrl",
        // Add other fields if needed
      });

      // Handle the response
      console.log('User creation response:', response.data);

      if ('success' in response.data) {
        // Redirect to the login page upon successful user creation
        toast.success("User created successfully", {
          position: toast.POSITION.TOP_CENTER,
          onClose: () => navigate('/login') // Navigate after the toast is closed
        });
      } else if ('error' in response.data) {
        toast.error(response.data.error, {
          position: toast.POSITION.TOP_RIGHT
        });
        // Handle the error, e.g., display an error message
        setCreateError(response.data.error || 'Failed to log in');

        console.error('Error creating user:', response.data.error);
      }

    } catch (error) {
      toast.error('An error occurred while creating the user', {
        position: toast.POSITION.TOP_RIGHT
      });
      // Handle errors, log, or show an error message
      console.error('Error creating user:', error);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label='Password'
            variant="outlined"
            type={showPassword ? "text" : "password"} // <-- This is where the magic happens
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{ // <-- This is where the toggle button is added.
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            style={{
              width: '100%', // Set the width to 100% of the surrounding div
            }}
          />
          <TextField
            label="Birthday"
            type="date"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin="normal"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
          />
          <TextField
            label="Bio"
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            margin="normal"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <label htmlFor="profile-picture">
            <Button variant="contained" color="primary" component="span" fullWidth>
              Select Profile Picture
            </Button>
          </label>
          <Typography variant="body2" color="textSecondary" align="center">
            (Optional: Select a profile picture)
          </Typography>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Create User
          </Button>
        </form>
        {createError && (
            <div style={{ marginTop: '10px', color: 'red' }}>
                {createError}
            </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default CreateUser;

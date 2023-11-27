//pages/UserLogin.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router'; // Import useHistory from react-router
import Navbar from '../components/Navbar';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import { InputAdornment, IconButton } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const UserLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const handleMouseDownPassword = () => setShowPassword(!showPassword);
  
    const navigate = useNavigate(); // Use useHistory from react-router

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            // Send API request to login
            const response = await axios.post('http://127.0.0.1:5000/api/login', {
                username: username,
                password: password,
            });

            // Handle the response
            const responseData = response.data;
            console.log(responseData);
            if ('error' in responseData || !responseData.user_id) {
                // Display login error
                toast.error(response.data.error, {
                    position: toast.POSITION.TOP_RIGHT
                });
                setLoginError(responseData.error || 'Failed to log in');
            } else {
                // Reset login error
                setLoginError('');
                // Handle successful login
                console.log('User logged in successfully!', responseData.user_id);
                // Redirect to the main page with user_id
                toast.success("Login Successful!", {
                    position: toast.POSITION.TOP_CENTER,
                    onClose: () => navigate(`/main-page/${responseData.user_id}`) // Navigate after the toast is closed
                });
            }

        } catch (error) {
            // Handle errors, log, or show an error message
            console.error('Error logging in:', error);
        }
    };

    return (
        <div>
            <Navbar />
            <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
                <h2>User Login</h2>
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
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        Login
                    </Button>
                </form>

                {loginError && (
                    <div style={{ marginTop: '10px', color: 'red' }}>
                        {loginError}
                    </div>
                )}

                <Link to="/create-user" style={{ textDecoration: 'none' }}>
                    <Button variant="outlined" color="primary" fullWidth>
                        Create Account
                    </Button>
                </Link>
            </div>
            <ToastContainer />
        </div>
    );
};

export default UserLogin;

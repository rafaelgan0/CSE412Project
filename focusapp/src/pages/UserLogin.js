import React, { useState } from 'react';
import { useNavigate } from 'react-router'; // Import useHistory from react-router
import Navbar from '../components/Navbar';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

const UserLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
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
                    onClose: () => navigate('/login') // Navigate after the toast is closed
                });
                navigate(`/main-page/${responseData.user_id}`);
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
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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

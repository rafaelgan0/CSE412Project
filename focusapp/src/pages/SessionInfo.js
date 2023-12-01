import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Paper, Typography, TextField, Button, Grid } from '@mui/material';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SessionInfoPage = () => {
  const { userId, focusTime } = useParams();
  const [description, setDescription] = useState('');
  const navigate = useNavigate();
  const [postError, setPostError] = useState('');

  const handleSubmit = async (event) => {
    // Add your logic to handle the form submission (e.g., sending data to the server)
    console.log(`User ID: ${userId}, Focus Time: ${focusTime}, Description: ${description}`);
    // You can also navigate to another page or perform any other actions here
    // Send API request to login
    const response = await axios.post('http://127.0.0.1:5000/api/postthread', {
        user_Id: userId,
        description: description,
        time: focusTime
    });

    const responseData = response.data;

    if ('error' in responseData) {
        toast.error(responseData.error, {
            position: toast.POSITION.TOP_RIGHT
        });
        setPostError(responseData.error || 'Failed to post thread');
        console.log(responseData);
    } else {
        setPostError('');
        console.log('Posted thread successfully')

        toast.success('Thread Posted Successfully!', {
            position: toast.POSITION.TOP_RIGHT,
            onClose: () => navigate(`/main-page/${userId}`) // Navigate after the toast is closed

        });
    }

  };

  const handleCancel = () => {
    // Navigate to the main page with the user-id included in the URL
    navigate(`/main-page/${userId}`);
  };

  return (
    <div>
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper elevation={3} style={{ maxWidth: '600px', padding: '20px' }}>
                <Typography variant="h4">Focus Session Information</Typography>
                <Typography variant="body1">User ID: {userId}</Typography>
                <Typography variant="body1">Focus Time: {focusTime} minutes</Typography>
                <TextField
                multiline
                rows={4}
                variant="outlined"
                placeholder="Describe your focus session..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ marginBottom: '15px', width: '100%' }}
                />
                <Grid container spacing={2} justifyContent="space-between">
                <Grid item>
                    <Button
                    variant="contained"
                    color="success"
                    onClick={handleSubmit}
                    style={{ borderRadius: '5px' }}
                    >
                    Submit
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                    variant="contained"
                    color="error"
                    onClick={handleCancel}
                    style={{ borderRadius: '5px' }}
                    >
                    Cancel
                    </Button>
                </Grid>
                </Grid>
            </Paper>

            </div>
            <ToastContainer />

    </div>
    
    
  );
};

export default SessionInfoPage;

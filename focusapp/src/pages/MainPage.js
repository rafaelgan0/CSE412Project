import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Typography, Paper, Tabs, Tab, Card, CardContent, CardActions, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const MainPage = () => {
  const { userId } = useParams();
  const [userInfo, setUserInfo] = useState(null);
  const [userThreads, setUserThreads] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [focusTime, setFocusTime] = useState(30);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user info
        const userInfoResponse = await axios.post('http://127.0.0.1:5000/api/userinfo', {
          user_id: userId,
        });
        setUserInfo(userInfoResponse.data);

        // Fetch user threads
        const userThreadsResponse = await axios.post('http://127.0.0.1:5000/api/userthreads', {
          user_id: userId,
        });
        setUserThreads(userThreadsResponse.data.user_threads);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const handleStartFocusSession = () => {
    // Redirect to Timer.js with user ID and focus time
    navigate(`/timer/${userId}/${focusTime}`);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {/*first div content */}
        <div style={{ flex: 1, margin: '10px'}}>
            {userId && userInfo && (
            <>
                {/* Display User Profile Information */}
                {/* Display Current Stats */}
                <Paper elevation={3} style={{ padding: '20px', marginTop: '10px' }}>
                <Typography variant="h5">User Info:</Typography>
                <Grid container spacing={2}>
                    {/* Display User Profile Image (use a default image for now) */}
                    <Grid item xs={12} style={{ textAlign: 'center' }}>
                        {/* {src={userInfo.ProfileImageUrl || 'path/to/default/image.jpg'} */}
                        <img
                            src={'../assets/default_img.png'}
                            alt="Profile_Image"
                            style={{ maxWidth: '100px', maxHeight: '100px' }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                    <Typography variant="body2">Bio:</Typography>
                    <Typography variant="body1">{userInfo.Bio}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                    <Typography variant="body2">Birthday:</Typography>
                    <Typography variant="body1">{userInfo.Birthday}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                    <Typography variant="body2">Email:</Typography>
                    <Typography variant="body1">{userInfo.Email}</Typography>
                    </Grid>
                </Grid>
                <Typography variant="h5">Current Stats:</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                    <Typography variant="body2">Days Logged In:</Typography>
                    <Typography variant="body1">{userInfo.DaysLoggedIn}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                    <Typography variant="body2">Days In Row:</Typography>
                    <Typography variant="body1">{userInfo.DaysInRow}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                    <Typography variant="body2">Points:</Typography>
                    <Typography variant="body1">{userInfo.Points}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                    <Typography variant="body2">Total Time:</Typography>
                    <Typography variant="body1">{userInfo.TotalTime}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                    <Typography variant="body2">Sessions:</Typography>
                    <Typography variant="body1">{userInfo.Sessions}</Typography>
                    </Grid>
                </Grid>
                </Paper>
            </>
            )}
        </div>
        {/* display threads*/}
        <div style={{ flex: 1, margin: '10px'}}>
            {/* Content for the second div */}
            {/* For example, you can add another Paper component or any other content */}
            <Paper elevation={3} style={{ padding: '20px', marginTop: '10px' }}>
            {/* <Typography variant="h4">User Threads</Typography> */}
                <div style={{ flex: 1, margin: '10px'}}>
                <Tabs value={currentTab} onChange={handleTabChange} centered>
                    <Tab label="Your Posts" />
                </Tabs>
                <TabPanel value={currentTab} index={0}>
                    {userThreads.map((thread) => (
                    <Card key={thread.ThreadId} style={{ margin: '10px 0' }}>
                        <CardContent>
                        <Typography variant="h6">Thread ID: {thread.ThreadId}</Typography>
                        <Typography variant="body1">Thread Text: {thread.ThreadText}</Typography>
                        <Typography variant="body1">Date: {thread.Date}</Typography>
                        {/* Include other thread info fields here */}
                        </CardContent>
                        {/* Add additional actions if needed */}
                        <CardActions>
                        <Button size="small" color="primary">
                            Edit
                        </Button>
                        <Button size="small" color="secondary">
                            Delete
                        </Button>
                        </CardActions>
                    </Card>
                    ))}
                </TabPanel>
                </div>
            </Paper>
        </div>
        {/* Third Div */}
        <div style={{ flex: 1, margin: '10px'}}>
            {/* Content for the third div */}
            {/* For example, you can add another Paper component or any other content */}
            <Paper elevation={3} style={{ padding: '20px', marginTop: '10px' }}>
            <Typography variant="h5">Start Focus Session</Typography>
            <div style={{ marginBottom: '20px' }}>
                <Typography variant="body2">Choose focus time:</Typography>
                <select
                value={focusTime}
                onChange={(e) => setFocusTime(parseInt(e.target.value, 10))}
                style={{ marginRight: '10px' }}
                >
                <option value={1}>1 minute</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                {/* Add more options as needed */}
                </select>
            </div>
            <Button variant="contained" color="primary" onClick={handleStartFocusSession}>
                Start Focus Session
            </Button>
            </Paper>
        </div>
      </div>
      
    </div>
  );
};

// Custom TabPanel component to conditionally render content based on the selected tab
const TabPanel = ({ children, value, index }) => {
    return (
      <div hidden={value !== index}>
        {value === index && (
          <div>
            {children}
          </div>
        )}
      </div>
    );
  };

export default MainPage;

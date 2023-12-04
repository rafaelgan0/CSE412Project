import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import axios from 'axios';
import Navbar from '../components/Navbar';
import {
  Typography,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Select,
  MenuItem,
  TextField, // Import TextField component
  Modal, // Import Modal component
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MainPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const [userThreads, setUserThreads] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [focusTime, setFocusTime] = useState(30);

  // Add state variables for bio editing
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userInfoResponse = await axios.post('http://127.0.0.1:5000/api/userinfo', {
          user_id: userId,
        });
        setUserInfo(userInfoResponse.data);

        const userThreadsResponse = await axios.post('http://127.0.0.1:5000/api/userthreads', {
          user_id: userId,
        });
        console.log(userThreadsResponse.data.user_threads);
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
    navigate(`/timer/${userId}/${focusTime}`);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleDeleteUser = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete your account?');

    if (confirmDelete) {
      try {
        const response = await axios.post('http://127.0.0.1:5000/api/deleteuser', {
          user_id: userId,
        });

        if (response.status === 200) {
          toast.success('User deleted successfully', {
            position: toast.POSITION.TOP_RIGHT,
            onClose: () => navigate('/login'),
          });
        } else {
          alert('User not found or could not be deleted');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('An error occurred while deleting the user');
      }
    }
  };

  const handleDeleteThread = async (threadId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this thread?');

    if (confirmDelete) {
      try {
        const response = await axios.post('http://127.0.0.1:5000/api/deletethread', {
          thread_id: threadId,
        });

        if (response.status === 200) {
          toast.success('Thread deleted successfully', {
            position: toast.POSITION.TOP_RIGHT,
          });

          // Remove the deleted thread from userThreads state
          setUserThreads((prevThreads) => prevThreads.filter((thread) => thread.ThreadId !== threadId));
        } else {
          toast.error('Thread not found or could not be deleted', {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
      } catch (error) {
        console.error('Error deleting thread:', error);
        toast.error('An error occurred while deleting the thread', {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    }
  };

  // Add a function to handle bio editing
  const handleEditBio = () => {
    setIsEditingBio(true);
  };

  // Add a function to cancel bio editing and restore the original bio text
  const handleCancelEditBio = () => {
    setIsEditingBio(false);
    setEditedBio(userInfo.Bio);
  };

  // Add a function to save the edited bio
  const handleSaveBio = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/updatebio', {
        user_id: userId,
        bio: editedBio,
      });

      if (response.status === 200) {
        toast.success('User bio updated successfully', {
          position: toast.POSITION.TOP_RIGHT,
          onClose: () => setIsEditingBio(false), // Close the edit pop-up
        });
      } else {
        toast.error('Failed to update user bio', {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } catch (error) {
      console.error('Error updating user bio:', error);
      toast.error('An error occurred while updating the user bio', {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, margin: '10px' }}>
          {userId && userInfo && (
            <>
              <Paper elevation={3} style={{ padding: '20px', marginTop: '10px' }}>
                <Typography variant="h5">User Info:</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} style={{ textAlign: 'center' }}>
                    <img
                      src={'../assets/default_img.png'}
                      alt="Profile_Image"
                      style={{ maxWidth: '100px', maxHeight: '100px' }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2">Bio:</Typography>
                    {isEditingBio ? (
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={editedBio}
                        onChange={(e) => setEditedBio(e.target.value)}
                      />
                    ) : (
                      <Typography variant="body1">{userInfo.Bio}</Typography>
                    )}
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
                <Grid item xs={12}>
                  {isEditingBio ? (
                    <>
                      <Button variant="outlined" color="primary" onClick={handleSaveBio}>
                        Save
                      </Button>
                      <Button variant="outlined" color="secondary" onClick={handleCancelEditBio}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button variant="outlined" color="primary" onClick={handleEditBio}>
                      Edit Bio
                    </Button>
                  )}
                </Grid>
              </Paper>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleDeleteUser}
                style={{ marginTop: '10px' }}
              >
                Delete User
              </Button>
            </>
          )}
        </div>
        <div style={{ flex: 1, margin: '10px' }}>
          <Paper elevation={3} style={{ padding: '20px', marginTop: '10px' }}>
            <div style={{ flex: 1, margin: '10px' }}>
              <Tabs value={currentTab} onChange={handleTabChange} centered>
                <Tab label="Your Posts" />
              </Tabs>
              <TabPanel value={currentTab} index={0}>
                {userThreads.map((thread) => (
                  <Card key={thread.ThreadId} style={{ margin: '10px 0' }}>
                    <CardContent>
                      <Typography variant="h6">Thread ID: {thread.threadid}</Typography>
                      <Typography variant="body1">{thread.username} posted</Typography>

                      <Typography variant="body1">Time: {thread.time}</Typography>
                      <Typography variant="body1">Thread Text: {thread.threadtext}</Typography>
                      <Typography variant="body1">Date: {thread.date}</Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" color="primary">
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="secondary"
                        onClick={() => handleDeleteThread(thread.threadid)}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </TabPanel>
            </div>
          </Paper>
        </div>
        <div style={{ flex: 1, margin: '10px' }}>
          <Paper elevation={3} style={{ padding: '20px', marginTop: '10px' }}>
            <Typography variant="h5">Start Focus Session</Typography>
            <div style={{ marginBottom: '20px' }}>
              <Typography variant="body2">Choose focus time:</Typography>
              <Select
                value={focusTime}
                onChange={(e) => setFocusTime(parseInt(e.target.value, 10))}
                style={{ marginRight: '10px' }}
              >
                <MenuItem value={1}>1 minute</MenuItem>
                <MenuItem value={15}>15 minutes</MenuItem>
                <MenuItem value={30}>30 minutes</MenuItem>
                <MenuItem value={45}>45 minutes</MenuItem>
              </Select>
            </div>
            <Button
              variant="contained"
              color="primary"
              onClick={handleStartFocusSession}
            >
              Start Focus Session
            </Button>
          </Paper>
        </div>
      </div>
      <ToastContainer></ToastContainer>
    </div>
  );
};

// Custom TabPanel component to conditionally render content based on the selected tab
const TabPanel = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <div>{children}</div>}
    </div>
  );
};

export default MainPage;

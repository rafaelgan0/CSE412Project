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
  Modal,
  IconButton // Import Modal component
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const MainPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const [userThreads, setUserThreads] = useState([]);

  const [exploreThreads, setExploreThreads] = useState([]);
  
  const [currentTab, setCurrentTab] = useState(0);
  const [focusTime, setFocusTime] = useState(30);

  // Add state variables for bio editing
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState('');

  const [isEditingThread, setIsEditingThread] = useState(-1);
  const [editedThread, setEditedThread] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userInfoResponse = await axios.post('http://127.0.0.1:5000/api/userinfo', {
          user_id: userId,
        });
        

        const userThreadsResponse = await axios.post('http://127.0.0.1:5000/api/userthreads', {
          user_id: userId,
        });

        const userExploreThreadsResponse = await axios.post('http://127.0.0.1:5000/api/explorethreads', {
          user_id: userId,
        });

        // console.log(userExploreThreadsResponse.data.explore_threads);
        console.log(userInfoResponse.data)
        //console.log(userThreadsResponse.data.user_threads);
        setUserInfo(userInfoResponse.data);
        setUserThreads(userThreadsResponse.data.user_threads);
        setExploreThreads(userExploreThreadsResponse.data.explore_threads);
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
          setUserThreads((prevThreads) => prevThreads.filter((thread) => thread.threadid !== threadId));
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

  const handleEditThread = (threadid) => {
    setIsEditingThread(threadid);
  };

  const handleCancelEditThread = () => {
    setIsEditingThread(-1);
    setEditedThread('');
  
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

  const handleSaveThread = async (threadId) => {
    const confirmEdit = window.confirm('Are you sure you want to udpate this thread?');

    if (confirmEdit) {
      try {
          const response = await axios.post("http://127.0.0.1:5000/api/editthread", {
            thread_id: threadId,
            thread_text: editedThread
          });

          if (response.status === 200) {
            toast.success('Thread thread updated successfully', {
              position: toast.POSITION.TOP_RIGHT,
            });
            // Update the userThreads state with the new thread text
            setUserThreads((prevThreads) => {
              return prevThreads.map((thread) =>
                thread.threadid === threadId ? { ...thread, threadtext: editedThread } : thread
              );
            });
            handleCancelEditThread();
          } else {
          toast.error('Thread could not be edited', {
            position: toast.POSITION.TOP_RIGHT,
          });
        }

      } catch (e) {
        console.error('Error editing thread:', e);
        toast.error('An error occurred while editing the thread', {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
      }
    };

  // function to handle liking a thread
  const handleUnfollow = async (userId, threadUserId) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/unfollowuser', {
        user_id1: userId,
        user_id2: threadUserId,
      });
  
      if (response.status === 200) {
        toast.success(response.data.Success, {
          position: toast.POSITION.TOP_RIGHT,
        });
  
        // Update exploreThreads state to set 'following' to false for the specific thread
        setExploreThreads((prevThreads) =>
          prevThreads.map((thread) =>
            thread.threaduserid === threadUserId ? { ...thread, following: false } : thread
          )
        );

        setUserInfo((userInfo) => ({
          ...userInfo,
          Following: userInfo.Following - 1,
        }));
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast.error('An error occurred while unfollowing the user', {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const handleFollow = async (userId, threadUserId) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/followuser', {
        user_id1: userId,
        user_id2: threadUserId,
      });
  
      if (response.status === 200) {
        toast.success(response.data.Success, {
          position: toast.POSITION.TOP_RIGHT,
        });
  
        // Update exploreThreads state to set 'following' to true for the specific thread
        setExploreThreads((prevThreads) =>
          prevThreads.map((thread) =>
            thread.threaduserid === threadUserId ? { ...thread, following: true } : thread
          )
        );

        setUserInfo((userInfo) => ({
          ...userInfo,
          Following: userInfo.Following + 1,
        }));
      }
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('An error occurred while following the user', {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const handleLike = async (userId, threadId) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/likethread', {
        user_id: userId,
        thread_id: threadId,
      });
  
      if (response.status === 200) {
        toast.success(response.data.Success, {
          position: toast.POSITION.TOP_RIGHT,
        });
  
        // Update userThreads state to set 'liked' to true for the specific thread
        // Update userThreads state to set 'liked' to true for the specific thread
        setExploreThreads((prevThreads) =>
          prevThreads.map((thread) =>
            thread.threadid === threadId ? { ...thread, liked: true } : thread
          )
        );
      }
    } catch (error) {
      console.error('Error liking thread:', error);
      toast.error('An error occurred while liking the thread', {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const handleUnlike = async (userId, threadId) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/unlikethread', {
        user_id: userId,
        thread_id: threadId,
      });
  
      if (response.status === 200) {
        toast.success(response.data.Success, {
          position: toast.POSITION.TOP_RIGHT,
        });
  
        // Update userThreads state to set 'liked' to false for the specific thread
        setExploreThreads((prevThreads) =>
          prevThreads.map((thread) =>
            thread.threadid === threadId ? { ...thread, liked: false } : thread
          )
        );
      }
    } catch (error) {
      console.error('Error unliking thread:', error);
      toast.error('An error occurred while unliking the thread', {
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
                <Typography variant="h5">{userInfo.UserName}</Typography>
                <Grid container spacing={2}>
                  {/* <Grid item xs={12} style={{ textAlign: 'center' }}>
                    <img
                      src={'../assets/default_img.png'}
                      alt="Profile_Image"
                      style={{ maxWidth: '100px', maxHeight: '100px' }}
                    />
                  </Grid> */}
                  
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
                    <Typography variant="body2">Likes:</Typography>
                    <Typography variant="body1">{userInfo.TotalLikes}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">Followers:</Typography>
                    <Typography variant="body1">{userInfo.Followers}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">Following:</Typography>
                    <Typography variant="body1">{userInfo.Following}</Typography>
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
          <Paper elevation={3} style={{ padding: '20px', marginTop: '10px', overflowY: 'auto', maxHeight: '83vh'}}>
            <div style={{ flex: 1, margin: '10px' }}>
              <Tabs value={currentTab} onChange={handleTabChange} centered>
                <Tab label="Your Posts" />
                <Tab label = "Explore" />
              </Tabs>
              <TabPanel value={currentTab} index={0}>
                {userThreads.map((thread) => (
                  <Card key={thread.threadid} style={{ margin: '10px 0' }}>
                    <CardContent>
                      {/* <Typography variant="h6">Thread ID: {thread.threadid}</Typography>*/}
                      <Typography variant="body1">On {thread.date} at {thread.time}, {thread.username} posted</Typography>
                      {/* <Typography variant="body1">{thread.threadtext}</Typography> */}
                      {thread.threadid === isEditingThread ? (
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={editedThread}
                        onChange={(e) => setEditedThread(e.target.value)}
                      />
                      ) : (
                        <Typography variant="body1">{thread.threadtext}</Typography>
                      )}

                    </CardContent>
                    <CardActions>
                      {thread.threadid === isEditingThread ? (
                        <>
                        <Button variant="outlined" color="primary" onClick={() => handleSaveThread(thread.threadid, editedThread)}>
                          Save
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={() => handleCancelEditThread()}>
                          Cancel
                        </Button>
                      </>
                      ) : (
                      <>
                          <Button size="small" 
                        color="primary"
                        onClick={() => handleEditThread(thread.threadid)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="secondary"
                          onClick={() => handleDeleteThread(thread.threadid)}
                        >
                          Delete
                        </Button>
                        </>
                      )}
                      
                    </CardActions>
                  </Card>
                ))}
              </TabPanel>
              <TabPanel value={currentTab} index={1}>
                {exploreThreads.map((thread) => (
                  <Card key={thread.threadid} style={{ margin: '10px 0' }}>
                    <CardContent>
                      <Typography variant="body1">On {thread.date} at {thread.time}, {thread.threadusername} posted</Typography>

                      {/* Follow/Unfollow */}
                      {thread.following ? (
                        <Button variant="outlined" color="secondary" onClick={() => handleUnfollow(userId, thread.threaduserid)}>
                          Unfollow
                        </Button>
                      ) : (
                        <Button variant="outlined" color="primary" onClick={() => handleFollow(userId, thread.threaduserid)}>
                          Follow
                        </Button>
                      )}

                      <Typography variant="body1">{thread.threadtext}</Typography>

                      {/* Like/Unlike */}
                      {thread.liked ? (
                        <IconButton color="secondary" onClick={() => handleUnlike(userId, thread.threadid)}>
                          <FavoriteIcon />
                        </IconButton>
                      ) : (
                        <IconButton color="primary" onClick={() => handleLike(userId, thread.threadid)}>
                          <FavoriteBorderIcon />
                        </IconButton>
                      )}
                    </CardContent>
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

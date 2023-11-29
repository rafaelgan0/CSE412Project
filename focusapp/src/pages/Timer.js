// Timer.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button } from '@mui/material';

const Timer = () => {
  const { userId, focusTime } = useParams();
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState(parseInt(focusTime, 10) * 60);

  useEffect(() => {
    let timer;
    if (timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else {
      // Timer is done, calculate the focus time interval
      const minutes = Math.floor(focusTime / 60);
      const seconds = focusTime % 60;
      const formattedFocusTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
      // Navigate to the session information collection page with the formatted focus time interval
      navigate(`/session-info/${userId}/${formattedFocusTime}`);
    }
  
    return () => clearInterval(timer);
  }, [timeRemaining, userId, focusTime, navigate]);
  
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const getBackgroundColor = () => {
    const percentage = timeRemaining / (parseInt(focusTime, 10) * 60);
    const startColor = [119, 221, 119];
    const endColor = [250, 160, 160];
  
    const interpolateColor = (start, end, percentage) => {
      const color = start.map((channel, index) => {
        const delta = end[index] - channel;
        return Math.round(channel + delta * percentage);
      });
  
      return `rgb(${color.join(', ')})`;
    };
  
    return interpolateColor(startColor, endColor, percentage);
  };
  
  return (
    <div
      style={{
        textAlign: 'center',
        backgroundColor: getBackgroundColor(),
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Typography variant="h1" style={{ color: `rgba(255, 255, 255, 0.8)`, fontSize: '6rem', margin: 0 }}>
        {formatTime(timeRemaining)}
      </Typography>
      {timeRemaining > 0 && (
        <Typography variant="h6" style={{ marginBottom: '10px', color: 'rgba(255, 255, 255, 0.6)' }}>
          Time Remaining
        </Typography>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
            const totalTimePassedSeconds = focusTime * 60 - timeRemaining;
            const minutes = Math.floor(totalTimePassedSeconds / 60);
            const seconds = totalTimePassedSeconds % 60;
            const formattedInterval = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            navigate(`/session-info/${userId}/${formattedInterval}`);
        }}
        style={{
          marginTop: '20px',
          width: '200px', // Adjust the width as needed
          backgroundColor: 'transparent',
          color: 'white',
          border: '1px solid white',
        }}
      >
        Skip Focus Session
      </Button>
    </div>
  );
};

export default Timer;

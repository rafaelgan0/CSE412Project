import React, { useState } from 'react';
import { useParams } from 'react-router'; // Import useParams from react-router to get the user ID
import Navbar from '../components/Navbar';

const Main = () => {
    const [userid, setUserId] = useState('');

    function getUserId(id) {
        setUserId(id);
    }
    return (
        <div>
            <Navbar />
            <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
                <h2>Welcome to the Main Page!</h2>
                {userid && (
                    <p>
                        User ID {userid} successfully logged in.
                    </p>
                )}
            </div>
        </div>
    );
};

export default Main;

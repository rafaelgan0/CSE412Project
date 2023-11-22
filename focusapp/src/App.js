import React, { useEffect, useState } from 'react';
import axios from 'axios';

const App = () => {
    const [data, setData] = useState([]);
    useEffect(() => {
        axios.get("http://127.0.0.1:5000/api/data")
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);

    return (
        <div>
            <h1>Your React App</h1>
            <ul>
                {data.map(user => (
                    <li key={user.UserID}>
                        <strong>User ID:</strong> {user.UserID}<br />
                        <strong>Password:</strong> {user.Password}<br />
                        <strong>Birthday:</strong> {user.Birthday}<br />
                        <strong>Bio:</strong> {user.Bio}<br />
                        <strong>Profile Image URL:</strong> {user.ProfileImageUrl}
                        <hr />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default App;

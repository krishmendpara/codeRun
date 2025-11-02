import React, { useContext, useEffect } from 'react'
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const UserAuth = ({ children }) => {

    const { user } = useContext(UserContext);
    const token = localStorage.getItem('token');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        if (token && !user) {
            return;   //wait for user to load
        }
        if (user) {
            setLoading(false);  //here it is loaded
        }
    }, [token, user]);

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <>
            {children}
        </>

    )

}

export default UserAuth
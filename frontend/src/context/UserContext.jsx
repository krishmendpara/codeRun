import axios from '../config/axios.js';
import { createContext, useEffect } from 'react'
import { useState } from 'react';


export const UserContext = createContext();


export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get('/user/profile').then((res) => {
                setUser(res.data.user)
             
                
            }).catch((err) => {
                localStorage.removeItem('token');
                console.log(err)
                setUser(null);
            })

        }
        else {
            console.log('No token found');

        }
    }, []);



    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    )
}

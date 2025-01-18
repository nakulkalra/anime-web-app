"use client"
import React, { useEffect, useState } from 'react'

const dashboard = () => {
  const [adminUser, setAdminUser] = useState<{ email: string, id:any } | null>(null);
    

    useEffect(() => {
        // Fetch session data from the API
        const checkSession = async () => {
          try {
            const response = await fetch('http://localhost:4000/api/admin/check-session', {
              method: 'GET',
              credentials: 'include', // Ensure cookies are sent with the request
            });
    
            
            if (response.ok) {
              const data = await response.json();
              // console.log(data.user);
              
              setAdminUser(data.user); 
            } else {
              setAdminUser(null); 
            }
          } catch (error) {
            console.error('Error checking session:', error);
            setAdminUser(null);
          }
        };
    
        checkSession();
      }, []);

      const handleRole = async () => {
        const response = await fetch('http://localhost:4000/api/admin/log-role', {
          method: 'GET',
          credentials: 'include', // Ensure cookies are sent with the request
        });
        
      }
  return (
    <>
        <div>dashboard</div>
        <div>{adminUser?.email}</div>
        <div>{adminUser?.id}</div>
        {console.log(adminUser)}
        <button onClick={handleRole}>Role</button>
    
    </>
  )
}

export default dashboard
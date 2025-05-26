"use client"
import React, { useEffect,useState } from 'react'

const page = () => {
  const [user, setUser] = useState<{ email: string, id:any } | null>(null);


    useEffect(() => {
        // Fetch session data from the API
        const checkSession = async () => {
          try {
            const response = await fetch('/api/check-session', {
              method: 'GET',
              credentials: 'include', // Ensure cookies are sent with the request
            });
    
            
            if (response.ok) {
              const data = await response.json();
              setUser(data.user); 
            } else {
              setUser(null); 
            }
          } catch (error) {
            console.error('Error checking session:', error);
            setUser(null);
          }
        };
    
        checkSession();
      }, []);



  return (
    <>
    <div>Hello</div>
    <div>{user?.email}</div>
    <div>{user?.id}</div>
    

    
    </>
  )
}

export default page
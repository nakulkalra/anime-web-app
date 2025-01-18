"use client"
import React from 'react'

const Home = () => {

  const handlelogin = async () => {
    window.location.href = '/login';
  }

  return (
    <>
    <div>Home</div>
    <button
      className='border-5 bg-grey-400'
      onClick={handlelogin}
    >signin</button>
    </>
  )
}

export default Home
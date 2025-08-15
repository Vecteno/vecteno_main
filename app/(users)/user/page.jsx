'use client'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { BarLoader } from 'react-spinners';

const page = () => {

  const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    useEffect(() => {
      const getUser = async () => {
        try {
          const res = await fetch('/api/profileInfo');
          const data = await res.json();
          if (res.ok) {
            setUser(data.user);
            console.log(data.user);
          } else {
            setError(data.error || 'Something went wrong');
          }
        } catch (err) {
          setError('Failed to fetch user');
        }
      };
  
      getUser();
    }, []);
    if (error) return <p className="p-4 text-red-600">{error}</p>;
    if (!user) return <p className="p-4 flex items-center justify-center w-full bg-white"><BarLoader/></p>;

  return (
    <div>
      <div className='flex flex-col items-center  h-screen bg-gray-100'>
        Welcome to Vecteno, {user.name}
        <p>Browse through thousands of graphics and images</p>
        <Link href='/user/dashboard'>Dashboard</Link>
      </div>
    </div>
  )
}

export default page

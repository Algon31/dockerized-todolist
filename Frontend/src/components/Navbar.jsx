import React from 'react'
// import { HiMenu } from "react-icons/hi";

const Navbar = () => {
  return (
    <nav className='flex justify-between items-center p-5 bg-amber-400'>
        <div className="flex gap-3 items-center">
        <div className="">
        <img className='w-7' src="./favicon.svg" alt="" />
        </div>
        <div className="logo font-bold">
        ToDo 
        </div>
        </div>
        <ul>
            <li className='hover:cursor-pointer hover:transition-tranfom transform scale-110 hover:font-bold'><a href='https://ravibhuvan31.vercel.app/' target='_blank' className=''>contact me</a></li>
        </ul>
    </nav>
  )
}

export default Navbar

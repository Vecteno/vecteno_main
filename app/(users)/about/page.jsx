import React from 'react'

const About = () => {
  return (
    <div className='flex m-20 justify-end'>
      <div className='flex flex-col border border-yellow-200 h-[50] w-[40%] p-15 rounded-3xl items-center justify-center'>
        <h1 className='font-semibold'>VECTENO: "Design Without Limits, Resources Without Cost"</h1>
        <p className='font-extralight'>"Welcome to Vecteno, your one-stop destination for free, high-quality PSD, CDR, and vector files! I'm Jitendra Rajpurohit, founder of Vecteno and a passionate designer with years of experience in animation, VFX, and digital art. Our platform is dedicated to empowering creators by providing them with the best design resources for personal and professional use. Whether you're a graphic designer, photographer, or digital artist, Vecteno has something to elevate your creativity. Join our growing community and discover the freedom to design like never before. Let's create magic together with every click!"</p>
      </div>
      <div className='h-[50] w-[40%] m-15 '>
        <img src='/Untitled-design-2024-02-23T113955.486-2048x2048.webp' alt='Mr.Jitendra'className='h-75'/>
        <h3>Founder : Jitendra Rajpurohit</h3>
      </div>
    </div>
  )
}

export default About

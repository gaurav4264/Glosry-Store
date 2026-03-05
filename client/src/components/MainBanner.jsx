import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';
import banner1 from '../assets/banner1.png';
import banner2 from '../assets/banner2.png';
import banner3 from '../assets/banner3.png';
import banner4 from '../assets/banner4.png';

const MainBanner = () => {
  const sliderData = [
    {
      id: 1,
      image: banner1,
      imageSm: banner1,
      title: "Freshness You Can Trust, Savings You Will Love!",
      buttonText: "Shop Now",
      link: "/products"
    },
    {
      id: 2,
      image: banner2,
      imageSm: banner2,
      title: "Fresh Groceries Delivered to Your Doorstep!",
      buttonText: "Order Now",
      link: "/products"
    },
    {
      id: 3,
      image: banner3,
      imageSm: banner3,
      title: "Farm Fresh Organic Produce Every Day!",
      buttonText: "Explore Now",
      link: "/products/vegetables"
    },
    {
      id: 4,
      image: banner4,
      imageSm: banner4,
      title: "Shop Smart, Eat Fresh, Live Healthy!",
      buttonText: "Start Shopping",
      link: "/products/fruits"
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % sliderData.length);
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [sliderData.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % sliderData.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + sliderData.length) % sliderData.length);
  };

  return (
    <div className='relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden group'>
      {sliderData.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
        >
          <img src={slide.image} alt="banner" className='w-full h-full object-cover hidden md:block' />
          <img src={slide.imageSm} alt="banner" className='w-full h-full object-cover md:hidden' />

          <div className='absolute inset-0 flex flex-col items-center md:items-start justify-end md:justify-center pb-12 md:pb-0 px-4 md:pl-18 lg:pl-24 bg-gradient-to-t from-black/70 via-black/30 to-transparent md:bg-gradient-to-r md:from-black/65 md:via-black/30 md:to-transparent'>
            <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-center md:text-left max-w-lg leading-tight lg:leading-snug text-white drop-shadow-lg transition-transform duration-700 ease-out transform translate-y-0'>
              {slide.title}
            </h1>

            <Link to={slide.link} className='mt-6 px-8 py-3 bg-primary hover:bg-primary-dull text-white font-medium rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2'>
              {slide.buttonText}
              <img className='w-4 h-4 invert brightness-0' src={assets.white_arrow_icon} alt="arrow" />
            </Link>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className='absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 p-2 rounded-full backdrop-blur-sm transition-all hidden group-hover:flex items-center justify-center z-10'
      >
        <img src={assets.white_arrow_icon} className='w-6 h-6 rotate-180 invert brightness-0 md:invert-0 md:brightness-100' alt="prev" />
      </button>

      <button
        onClick={nextSlide}
        className='absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 p-2 rounded-full backdrop-blur-sm transition-all hidden group-hover:flex items-center justify-center z-10'
      >
        <img src={assets.white_arrow_icon} className='w-6 h-6 invert brightness-0 md:invert-0 md:brightness-100' alt="next" />
      </button>

      {/* Dots Indicator */}
      <div className='absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10'>
        {sliderData.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-primary scale-110' : 'bg-gray-400 hover:bg-gray-300'
              }`}
          />
        ))}
      </div>
    </div>
  );
};

export default MainBanner

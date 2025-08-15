'use client';

import { useState } from 'react';
import SkeletonImage from './SkeletonImage';

// Simple watermark component without event handlers
function WatermarkImage({ className }) {
  return (
    <div 
      className={`${className} bg-contain bg-no-repeat bg-center`}
      style={{
        backgroundImage: "url('https://vecteno.com/wp-content/uploads/2024/08/vecteno-2-01.png')",
        width: '80px',
        height: '20px'
      }}
    />
  );
}

export default function ImageWithWatermarks({ src, alt, className, containerClassName }) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  return (
    <div className="relative">
      <SkeletonImage
        src={src}
        alt={alt}
        className={className}
        containerClassName={containerClassName}
        onImageLoad={handleImageLoad}
      />
      
      {/* Multiple Watermark logos scattered across the image - Only show when image is loaded */}
      {isImageLoaded && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden watermarks-overlay">
          {/* Row 1 - Top */}
          <WatermarkImage className="absolute top-4 left-4 w-20 h-auto opacity-30" />
          <WatermarkImage className="absolute top-4 left-28 w-18 h-auto opacity-25" />
          <WatermarkImage className="absolute top-4 left-52 w-20 h-auto opacity-30" />
          <WatermarkImage className="absolute top-4 left-76 w-18 h-auto opacity-25" />
          <WatermarkImage className="absolute top-4 right-76 w-20 h-auto opacity-30" />
          <WatermarkImage className="absolute top-4 right-52 w-18 h-auto opacity-25" />
          <WatermarkImage className="absolute top-4 right-28 w-20 h-auto opacity-30" />
          <WatermarkImage className="absolute top-4 right-4 w-18 h-auto opacity-25" />
          
          
          {/* Center Row */}
          <img src="https://vecteno.com/wp-content/uploads/2024/08/vecteno-2-01.png" alt="Vecteno" className="absolute top-1/2 left-8 transform -translate-y-1/2 w-18 h-auto opacity-25" />
          <img src="https://vecteno.com/wp-content/uploads/2024/08/vecteno-2-01.png" alt="Vecteno" className="absolute top-1/2 left-32 transform -translate-y-1/2 w-20 h-auto opacity-30" />
          <img src="https://vecteno.com/wp-content/uploads/2024/08/vecteno-2-01.png" alt="Vecteno" className="absolute top-1/2 left-56 transform -translate-y-1/2 w-18 h-auto opacity-25" />
          <img src="https://vecteno.com/wp-content/uploads/2024/08/vecteno-2-01.png" alt="Vecteno" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-auto opacity-35" />
          <img src="https://vecteno.com/wp-content/uploads/2024/08/vecteno-2-01.png" alt="Vecteno" className="absolute top-1/2 right-56 transform -translate-y-1/2 w-18 h-auto opacity-25" />
          <img src="https://vecteno.com/wp-content/uploads/2024/08/vecteno-2-01.png" alt="Vecteno" className="absolute top-1/2 right-32 transform -translate-y-1/2 w-20 h-auto opacity-30" />
          <img src="https://vecteno.com/wp-content/uploads/2024/08/vecteno-2-01.png" alt="Vecteno" className="absolute top-1/2 right-8 transform -translate-y-1/2 w-18 h-auto opacity-25" />
          
          {/* Row 6 - Bottom */}
          <img src="https://vecteno.com/wp-content/uploads/2024/08/vecteno-2-01.png" alt="Vecteno" className="absolute bottom-4 left-4 w-20 h-auto opacity-30" />
          <img src="https://vecteno.com/wp-content/uploads/2024/08/vecteno-2-01.png" alt="Vecteno" className="absolute bottom-4 left-32 w-18 h-auto opacity-25" />
          <img src="https://vecteno.com/wp-content/uploads/2024/08/vecteno-2-01.png" alt="Vecteno" className="absolute bottom-4 left-56 w-20 h-auto opacity-30" />
          <img src="https://vecteno.com/wp-content/uploads/2024/08/vecteno-2-01.png" alt="Vecteno" className="absolute bottom-4 left-80 w-18 h-auto opacity-25" />
          <img src="https://vecteno.com/wp-content/uploads/2024/08/vecteno-2-01.png" alt="Vecteno" className="absolute bottom-4 right-80 w-20 h-auto opacity-30" />
          <img src="https://vecteno.com/wp-content/uploads/2024/08/vecteno-2-01.png" alt="Vecteno" className="absolute bottom-4 right-56 w-18 h-auto opacity-25" />
          <img src="https://vecteno.com/wp-content/uploads/2024/08/vecteno-2-01.png" alt="Vecteno" className="absolute bottom-4 right-32 w-20 h-auto opacity-30" />
          <img src="https://vecteno.com/wp-content/uploads/2024/08/vecteno-2-01.png" alt="Vecteno" className="absolute bottom-4 right-4 w-18 h-auto opacity-25" />
        </div>
      )}
    </div>
  );
}

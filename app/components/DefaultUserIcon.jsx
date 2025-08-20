"use client";

const DefaultUserIcon = ({ size = 44, className = "" }) => {
  return (
    <img
      src="/api/uploads/profileImages/default-image.jpg"
      alt="Default Avatar"
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

export default DefaultUserIcon;

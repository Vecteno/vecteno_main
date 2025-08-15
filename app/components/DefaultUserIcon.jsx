"use client";

const DefaultUserIcon = ({ size = 44, className = "" }) => {
  return (
    <img
      src="/uploads/profile-images/default-avatar.jpg"
      alt="Default Avatar"
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

export default DefaultUserIcon;

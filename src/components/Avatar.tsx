import React from 'react';

interface AvatarProps {
  name: string;
  image?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({ name, image, size = 'md', className = '', onClick }) => {

  const getSrc = () => {
    if (image && image.trim() !== "" && image !== "undefined") {
      return image;
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=006ACB&color=fff&bold=true`;
  };


  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-36 h-36 text-2xl',
  };

  return (
    <img
      src={getSrc()}
      alt={name}
      onClick={onClick}
      className={`rounded-full object-cover transition-all ${sizeClasses[size]} ${className}`}

      onError={(e) => {
        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=006ACB&color=fff`;
      }}
    />
  );
};

export default Avatar;
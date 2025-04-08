import { IconButtonProps } from "@/models/IconButtonProps";
import React from "react";


const IconButton: React.FC<IconButtonProps> = ({ 
  icon, 
  onClick, 
  selected, 
  size = "md", // Mặc định là medium
  selectedIcon,
  className = "",
  ...props
}) => {
  // Base classes áp dụng cho mọi button
  let buttonClass = "flex items-center justify-center rounded-lg transition-colors duration-300 cursor-pointer" ;
  
  // Thêm classes tùy theo size
  switch(size) {
    case "sm":
      buttonClass += " p-2"; // Padding nhỏ
      break;
    case "md":
      buttonClass += " p-3"; // Padding trung bình
      break;
    case "lg":
      buttonClass += " p-4"; // Padding lớn
      break;
    case "none":
      buttonClass += " rounded-full"; // Padding trung bình
    break;
  }

  // Thêm classes tùy theo trạng thái selected
  buttonClass += selected 
    ? " bg-blue-700 shadow-inner" 
    : " bg-blue-600 hover:bg-blue-700";
  // Thêm className từ prop
  buttonClass += ` ${className}`;
  // console.log(buttonClass);
  return (
    <button 
      className={buttonClass} 
      onClick={onClick}
      aria-selected={selected}
      style={{ ...props.style }}
    >
      <span className="flex items-center justify-center ">
        {selected && selectedIcon ? selectedIcon : icon}
      </span>
    </button>
  );
};

export default IconButton;
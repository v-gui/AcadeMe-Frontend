import React from 'react';
import './ProjectCard.css'; 
import { Icon } from './Icon'; 

interface ProjectCardProps {
  id: string;          
  title: string;
  description: string;
  tags: string[];
  date: string;
  imageUrl: string;
  onView: (id: string) => void;
  // 1. TORNAMOS AS FUNÇÕES OPCIONAIS COM A "?"
  onDelete?: (id: string) => void; 
  onEdit?: (id: string) => void;   
}

const ProjectCard: React.FC<ProjectCardProps> = ({ id, title, description, tags, date, imageUrl, onDelete, onEdit, onView }) => {
  return (
    <div 
      onClick={() => onView(id)}
      className="cursor-pointer border-gray-300 rounded p-4 mb-4 bg-gray-50 flex items-start relative project-card shadow-sm hover:shadow-md transition-all"
    >
      
      {/* Quadrado com imagem */}
      <div className="w-24 h-24 mr-4 border border-l-8 border-[#006ACB] bg-white z-10 flex shrink-0 items-center justify-center overflow-hidden"> 
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
      </div>
      
      <div className="relative z-10 flex-1">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-[#006ACB] leading-tight hover:underline">{title}</h3>
          
          <div className="flex gap-2 ml-4">
            {/* 2. SÓ RENDERIZA SE onEdit EXISTIR */}
            {onEdit && (
              <Icon 
                iconCenter="edit" 
                buttonStyle="light" 
                shape="round"
                className="w-10 h-10 p-0 flex items-center justify-center bg-blue-500 hover:bg-blue-600 border-none shadow-sm active:scale-90"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation(); 
                  onEdit(id);
                }}
                title="Editar projeto"
              />
            )}
            
            {/* 3. SÓ RENDERIZA SE onDelete EXISTIR */}
            {onDelete && (
              <Icon 
                iconCenter="trash" 
                buttonStyle="dark" 
                shape="round"
                className="w-10 h-10 p-0 flex items-center justify-center bg-[#003465] hover:bg-red-600 border-none shadow-sm active:scale-90"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation(); 
                  onDelete(id);
                }}
                title="Excluir projeto"
              />
            )}
          </div>
        </div>

        <p className="mt-2 text-[#565656] text-sm md:text-base leading-relaxed">
          {description}
        </p>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-wrap gap-2">
            {tags && tags.map((tag, index) => (
              <span key={index} className="bg-[#006ACB] text-white text-[10px] px-2 py-1 rounded-sm font-bold uppercase tracking-wider">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-[#94A2B7] text-sm whitespace-nowrap ml-4 font-medium">{date}</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
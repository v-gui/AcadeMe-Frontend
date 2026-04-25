import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentCard.css';
import Avatar from './Avatar';

interface StudentCardProps {
    id: string;
    name: string;
    course: string;
    profileImage?: string;
}

const StudentCard: React.FC<StudentCardProps> = ({ id, name, course, profileImage }) => {
    const navigate = useNavigate();

    return (
        <div className="student-card-v2">
            
            <div className="student-avatar-wrapper">
                <Avatar 
                    name={name} 
                    image={profileImage} 
                    size="xl" 
                    className="student-avatar-img" 
                />
            </div>
            
            <div className="student-info-v2">
                <h3 className="student-name-v2">{name}</h3>
                <p className="student-course-v2">{course}</p>
                
                <span 
                    className="student-portfolio-link"
                    onClick={() => navigate(`/student/${id}`)}
                >
                    Ver o portfólio <span className="external-icon">↗</span>
                </span>
            </div>
        </div>
    );
};

export default StudentCard;
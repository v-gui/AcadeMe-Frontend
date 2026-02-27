import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import UserIcon from '../assets/UserIcon.svg';
import logoBlockchain from '../assets/logoBlockchain.svg';

const StudentProfileView: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [student, setStudent] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    useEffect(() => {
        // 1. Busca os dados do estudante
        fetch(`${apiUrl}/students/${id}`)
            .then(res => res.json())
            .then(data => setStudent(data))
            .catch(err => console.error("Erro ao carregar estudante:", err));

        // 2. Busca os projetos
        fetch(`${apiUrl}/students/${id}/projects`)
            .then(res => res.json())
            .then(data => setProjects(data))
            .catch(err => console.error("Erro ao carregar projetos:", err));
    }, [id, apiUrl]);

    if (!student) return <div className="flex h-screen items-center justify-center font-bold text-[#003465] text-xl">Carregando Perfil AcadeMe...</div>;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex flex-col md:flex-row flex-grow">
                
                {/* SIDEBAR COM DESIGN PADRONIZADO */}
                <div className="w-full md:w-[350px] bg-gradient-to-b from-[#003465] to-[#006ACB] p-10 text-white shrink-0 shadow-2xl">
                    <div className="flex flex-col items-center">
                        <img 
                            src={student.profileImage || UserIcon} 
                            className="w-40 h-40 rounded-full border-4 border-white/30 p-1 object-cover shadow-2xl mb-8" 
                            alt={student.name}
                        />
                        <h1 className="text-3xl font-black text-center mb-2 tracking-tighter">{student.name}</h1>
                        <p className="text-blue-100/70 text-center text-sm mb-8">{student.email}</p>
                        
                        <div className="w-full border-b border-white/10 my-4" />

                        {/* SEÇÃO: CURSO (Acima da Bio) */}
                        <div className="w-full mb-6 text-left">
                            <label className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Curso</label>
                            <p className="text-white mt-2 font-bold text-sm leading-snug">
                                {student.course}
                            </p>
                        </div>

                        <div className="w-full border-b border-white/10 my-4" />
                        
                        {/* SEÇÃO: BIOGRAFIA */}
                        <div className="w-full mb-6 text-left">
                            <label className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Sobre o Estudante</label>
                            <p className="text-white mt-4 text-sm italic leading-relaxed opacity-90">
                                {student.bio || "Este talento ainda não adicionou uma biografia."}
                            </p>
                        </div>

                        <div className="w-full border-b border-white/10 my-6" />

                        {/* SEÇÃO: ÁREAS DE INTERESSE (Somente Leitura) */}
                        <div className="w-full text-left">
                            <h2 className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-4">Áreas de Interesse</h2>
                            <div className="flex flex-wrap gap-2">
                                {student.interests && student.interests.length > 0 ? (
                                    student.interests.map((interest: string, i: number) => (
                                        <span key={i} className="bg-white/20 text-white text-[10px] px-3 py-1 rounded-full uppercase font-bold border border-white/10 shadow-sm">
                                            {interest}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-white/40 text-[10px] italic">Nenhuma área selecionada.</p>
                                )}
                            </div>
                        </div>

                        <button 
                            onClick={() => navigate('/')}
                            className="mt-12 w-full py-3 bg-white/10 hover:bg-black/20 border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                        >
                            Voltar para Home
                        </button>
                    </div>
                </div>

                {/* ÁREA DE PROJETOS */}
                <div className="flex-1 p-12 overflow-y-auto">
                    <h2 className="text-2xl font-black text-[#003465] mb-10 border-b-4 border-[#006ACB] w-fit pb-2 uppercase tracking-tighter">
                        Portfólio Acadêmico
                    </h2>

                    <div className="grid grid-cols-1 gap-8">
                        {projects.length > 0 ? (
                            projects.map((proj) => (
                                <ProjectCard
                                    key={proj._id}
                                    id={proj._id}
                                    title={proj.title}
                                    description={proj.description}
                                    tags={proj.tags || ["AcadeMe"]}
                                    date={new Date(proj.createdAt).toLocaleDateString()}
                                    imageUrl={proj.imageUrl || logoBlockchain}
                                    onView={(id) => navigate(`/project/${id}`)}
                                />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 opacity-30 border-2 border-dashed border-gray-300 rounded-3xl">
                                <p className="italic font-medium">Nenhum projeto publicado por este aluno ainda.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfileView;
/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import { TextBar } from '../components/TextBar';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import coloredLogo from '../assets/colored-logo.svg';
import logoBlockchain from '../assets/logoBlockchain.svg';
import { toast } from 'react-toastify';
import Avatar from '../components/Avatar';
import ValidatedBadge from '../components/ValidatedBadge';
import AppHeader from '../components/AppHeader';
import EmptyState from '../components/EmptyState';
import { SearchResults } from '../types/models';
import { getProjectNavigationPath, isProjectValidated } from '../utils/project';
import useInviteMenu from '../hooks/useInviteMenu';

interface Aluno {
    _id: string;
    name: string;
    course: string;
    profileImage?: string; 
    role?: string;
}

const StudentProfileView: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const menuRef = useRef<HTMLDivElement>(null);
    
    const [student, setStudent] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    
    // --- ESTADOS DA BUSCA GLOBAL (HEADER) ---
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [searchResultStudents, setSearchResultStudents] = useState<SearchResults['students']>([]);
    const [searchResultProfessors, setSearchResultProfessors] = useState<SearchResults['professors']>([]);
    const [searchResultProjects, setSearchResultProjects] = useState<SearchResults['projects']>([]);
    
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const { inviteMenu } = useInviteMenu(currentUser, {
        onSelect: (projectId) => {
            navigate(`/project/${projectId}`);
        }
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsAccountMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Carregamento de dados do Estudante e do Usuário Logado
    useEffect(() => {
        const savedUser = localStorage.getItem('@AcadeMe:user');
        if (savedUser) setCurrentUser(JSON.parse(savedUser));

        fetch(`${apiUrl}/students/${id}`)
            .then(res => res.json())
            .then(data => setStudent(data))
            .catch(err => console.error("Erro ao carregar estudante:", err));

        fetch(`${apiUrl}/students/${id}/projects`)
            .then(res => res.json())
            .then(data => setProjects(data))
            .catch(err => console.error("Erro ao carregar projetos:", err));
    }, [id, apiUrl]);

    // --- LÓGICA DE BUSCA GLOBAL (OMNIBOX) ---
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResultStudents([]);
            setSearchResultProfessors([]);
            setSearchResultProjects([]);
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            fetch(`${apiUrl}/search?q=${encodeURIComponent(searchTerm)}`)
                .then(res => res.json())
                .then((data: SearchResults) => {
                    setSearchResultStudents(data.students || []);
                    setSearchResultProfessors(data.professors || []);
                    setSearchResultProjects(data.projects || []);
                })
                .catch(err => console.error("Erro na busca:", err));
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, apiUrl]);

    const handleLogout = () => {
        localStorage.removeItem('@AcadeMe:user');
        setCurrentUser(null);
        toast.info("Sessão encerrada.");
        navigate('/');
    };

    if (!student) return <div className="flex h-screen items-center justify-center font-bold text-[#003465] text-xl animate-pulse uppercase tracking-widest">Carregando Perfil AcadeMe...</div>;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 relative pt-20"> 
            
            <AppHeader
                searchTerm={searchTerm}
                isDropdownVisible={isDropdownVisible}
                searchResultStudents={searchResultStudents}
                searchResultProfessors={searchResultProfessors}
                searchResultProjects={searchResultProjects}
                onSearchChange={(value) => {
                    setSearchTerm(value);
                    setIsDropdownVisible(true);
                }}
                onSearchBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)}
                onStudentSelect={(studentId) => navigate(`/student/${studentId}`)}
                onProjectSelect={(project) => navigate(getProjectNavigationPath(project, currentUser?._id, currentUser?.role))}
                currentUser={currentUser}
                menuRef={menuRef}
                isAccountMenuOpen={isAccountMenuOpen}
                onToggleAccountMenu={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                onNavigateHome={() => navigate('/')}
                onNavigateProfile={() => navigate(currentUser?.role === 'professor' ? '/professor-profile' : '/profile')}
                onLogout={handleLogout}
                inviteMenu={inviteMenu}
                unauthenticatedActions={
                    <div className="flex gap-4">
                        <Button shape="pill" size="sm" className="text-xs font-bold px-6" onClick={() => navigate('/login')}>Login</Button>
                        <Button shape="pill" size="sm" className="text-xs font-bold px-6" onClick={() => navigate('/signup')}>Cadastre-se</Button>
                    </div>
                }
            />

            <div className="flex flex-col md:flex-row flex-grow">
                
                {/** --- SIDEBAR DO ESTUDANTE --- **/}
                <div className="w-full min-w-80 md:w-[350px] bg-gradient-to-b from-[#003465] to-[#006ACB] p-10 text-white shrink-0 shadow-2xl z-20">
                    <div className="flex flex-col items-center">
                        <Avatar 
                            name={student.name} 
                            image={student.profileImage} 
                            size="xl" 
                            className="border-4 border-white/20 p-1 shadow-2xl mb-8" 
                        />
                        <h1 className="text-2xl font-black text-center mb-1 tracking-tighter leading-tight uppercase">{student.name}</h1>
                        <p className="text-blue-100/60 text-center text-sm mb-8 font-medium">{student.email}</p>
                        
                        <div className="w-full border-b border-white/10 my-4" />

                        <div className="w-full mb-6 text-left">
                            <label className="text-blue-200 text-[10px] font-black uppercase tracking-widest opacity-70">Curso</label>
                            <p className="text-white mt-2 font-bold text-sm leading-snug">{student.course}</p>
                        </div>

                        <div className="w-full border-b border-white/10 my-4" />
                        
                        <div className="w-full mb-6 text-left">
                            <label className="text-blue-200 text-[10px] font-black uppercase tracking-widest opacity-70">Sobre o Estudante</label>
                            <p className="text-white mt-4 text-sm italic leading-relaxed opacity-90">
                                {student.bio || "Este talento ainda não adicionou uma biografia."}
                            </p>
                        </div>

                        <div className="w-full border-b border-white/10 my-6" />

                        <div className="w-full text-left">
                            <h2 className="text-blue-200 text-[10px] font-black uppercase tracking-widest opacity-70 mb-4">Áreas de Interesse</h2>
                            <div className="flex flex-wrap gap-2">
                                {student.interests?.map((interest: string, i: number) => (
                                    <span key={i} className="bg-white/10 text-white text-[10px] px-3 py-1.5 rounded-full uppercase font-black border border-white/10 shadow-sm">
                                        {interest}
                                    </span>
                                ))}
                                {(!student.interests || student.interests.length === 0) && (
                                    <span className="text-xs italic text-blue-100/40">Nenhum interesse listado.</span>
                                )}
                            </div>
                        </div>

                        <button 
                            onClick={() => navigate('/')}
                            className="mt-12 w-full py-4 bg-white/10 hover:bg-black/20 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                        >
                            Voltar para Home
                        </button>
                    </div>
                </div>

                {/** --- CONTEÚDO PRINCIPAL (PORTFÓLIO) --- **/}
                <div className="flex-1 p-8 md:p-12 lg:p-16 overflow-y-auto bg-[#F8FAFC]">
                    <div className="max-w-none mx-auto text-left">
                        <h2 className="text-2xl font-black text-[#003465] mb-12 border-b-4 border-[#006ACB] w-fit pb-2 uppercase tracking-tighter">
                            Portfólio Acadêmico
                        </h2>

                        <div className="grid grid-cols-1 gap-8 pb-20">
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
                                        isValidated={isProjectValidated(proj)}
                                        onView={() => navigate(getProjectNavigationPath(proj, currentUser?._id, currentUser?.role))}
                                    />
                                ))
                            ) : (
                                <EmptyState
                                    title="Nenhum projeto publicado"
                                    description="Os trabalhos publicados por este estudante aparecerão aqui."
                                    icon="search"
                                    className="py-24"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfileView;

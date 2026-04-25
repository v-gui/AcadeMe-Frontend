/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Avatar from '../components/Avatar';
import AppHeader from '../components/AppHeader';
import { Button } from '../components/Button';
import EmptyState from '../components/EmptyState';
import ProjectCard from '../components/ProjectCard';
import logoBlockchain from '../assets/logoBlockchain.svg';
import { ProfessorSummary, ProjectRecord, SearchResults } from '../types/models';
import { getProjectNavigationPath, isProjectValidated, withViewerQuery } from '../utils/project';
import useInviteMenu from '../hooks/useInviteMenu';

const ProfessorProfileView: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const menuRef = useRef<HTMLDivElement>(null);

    const [professor, setProfessor] = useState<ProfessorSummary | null>(null);
    const [projects, setProjects] = useState<ProjectRecord[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [searchResultStudents, setSearchResultStudents] = useState<SearchResults['students']>([]);
    const [searchResultProfessors, setSearchResultProfessors] = useState<SearchResults['professors']>([]);
    const [searchResultProjects, setSearchResultProjects] = useState<SearchResults['projects']>([]);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const { inviteMenu } = useInviteMenu(currentUser, {
        onSelect: (projectId) => navigate(`/project/${projectId}`)
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsAccountMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const savedUser = localStorage.getItem('@AcadeMe:user');
        const parsedUser = savedUser ? JSON.parse(savedUser) : null;
        if (parsedUser) setCurrentUser(parsedUser);

        fetch(`${apiUrl}/professors/${id}`)
            .then((res) => res.json())
            .then((data) => setProfessor({ ...data, role: 'professor' }))
            .catch(() => toast.error('Erro ao carregar perfil docente.'));

        fetch(`${apiUrl}/professors/${id}/projects`)
            .then((res) => res.json())
            .then((data: ProjectRecord[]) => setProjects(Array.isArray(data) ? data : []))
            .catch(() => console.error('Erro ao carregar projetos chancelados.'));
    }, [id, apiUrl]);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResultStudents([]);
            setSearchResultProfessors([]);
            setSearchResultProjects([]);
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            fetch(withViewerQuery(`${apiUrl}/search?q=${encodeURIComponent(searchTerm)}`, currentUser))
                .then((res) => res.json())
                .then((data: SearchResults) => {
                    setSearchResultStudents(data.students || []);
                    setSearchResultProfessors(data.professors || []);
                    setSearchResultProjects(data.projects || []);
                })
                .catch((err) => console.error('Erro na busca:', err));
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, apiUrl, currentUser]);

    const handleLogout = () => {
        localStorage.removeItem('@AcadeMe:user');
        setCurrentUser(null);
        toast.info('Sessao encerrada.');
        navigate('/');
    };

    if (!professor) {
        return <div className="flex h-screen items-center justify-center font-bold text-[#003465] text-xl animate-pulse uppercase tracking-widest">Carregando Perfil Docente...</div>;
    }

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
                onProfessorSelect={(professorId) => navigate(`/professor/${professorId}`)}
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
                <aside className="w-full min-w-80 md:w-[350px] bg-gradient-to-b from-[#003465] to-[#001a33] p-10 text-white shrink-0 shadow-2xl z-20">
                    <div className="flex flex-col items-center">
                        <Avatar
                            name={professor.name}
                            image={professor.profileImage}
                            size="xl"
                            className="border-4 border-white/20 p-1 shadow-2xl mb-8"
                        />
                        <h1 className="text-2xl font-black text-center mb-1 tracking-tighter leading-tight uppercase">
                            {professor.academicTitle || 'Prof.'} {professor.name}
                        </h1>
                        <p className="text-blue-100/60 text-center text-sm mb-8 font-medium">{professor.email}</p>

                        <div className="w-full border-b border-white/10 my-4" />

                        <div className="w-full mb-6 text-left">
                            <label className="text-blue-200 text-[10px] font-black uppercase tracking-widest opacity-70">Departamento</label>
                            <p className="text-white mt-2 font-bold text-sm leading-snug">{professor.department || 'Docente'}</p>
                        </div>

                        <div className="w-full border-b border-white/10 my-4" />

                        <div className="w-full mb-6 text-left">
                            <label className="text-blue-200 text-[10px] font-black uppercase tracking-widest opacity-70">Resumo Acadêmico</label>
                            <p className="text-white mt-4 text-sm italic leading-relaxed opacity-90">
                                {professor.bio || 'Este docente ainda não adicionou um resumo acadêmico.'}
                            </p>
                        </div>

                        <div className="w-full border-b border-white/10 my-6" />

                        <div className="w-full text-left">
                            <h2 className="text-blue-200 text-[10px] font-black uppercase tracking-widest opacity-70 mb-4">Áreas de Expertise</h2>
                            <div className="flex flex-wrap gap-2">
                                {professor.areasOfExpertise?.map((area, i) => (
                                    <span key={`${area}-${i}`} className="bg-white/10 text-white text-[10px] px-3 py-1.5 rounded-full uppercase font-black border border-white/10 shadow-sm">
                                        {area}
                                    </span>
                                ))}
                                {(!professor.areasOfExpertise || professor.areasOfExpertise.length === 0) && (
                                    <span className="text-xs italic text-blue-100/40">Nenhuma área listada.</span>
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
                </aside>

                <main className="flex-1 p-8 md:p-12 lg:p-16 overflow-y-auto bg-[#F8FAFC]">
                    <div className="max-w-none mx-auto text-left">
                        <h2 className="text-2xl font-black text-[#003465] mb-12 border-b-4 border-[#006ACB] w-fit pb-2 uppercase tracking-tighter">
                            Trabalhos Chancelados
                        </h2>

                        <div className="grid grid-cols-1 gap-8 pb-20">
                            {projects.length > 0 ? (
                                projects.map((project) => (
                                    <ProjectCard
                                        key={project._id}
                                        id={project._id}
                                        title={project.title}
                                        description={project.description}
                                        tags={project.tags || ['AcadeMe']}
                                        date={new Date(project.createdAt || Date.now()).toLocaleDateString()}
                                        imageUrl={project.imageUrl || logoBlockchain}
                                        isValidated={isProjectValidated(project)}
                                        onView={() => navigate(getProjectNavigationPath(project, currentUser?._id, currentUser?.role))}
                                    />
                                ))
                            ) : (
                                <EmptyState
                                    title="Nenhum chancelamento"
                                    description="Os trabalhos validados por este docente aparecerão aqui."
                                    icon="search"
                                    className="py-24"
                                />
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProfessorProfileView;

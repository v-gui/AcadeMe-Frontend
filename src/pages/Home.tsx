/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Button } from '../components/Button';
import { TextBar } from '../components/TextBar';
import logo from '../assets/white-logo.svg';
import coloredLogo from '../assets/colored-logo.svg';
import classroom from '../assets/classroom.svg';
import studentsMoldure from '../assets/happy-students.svg';
import githubLogo from '../assets/GithubLogo.svg';
import moldure from '../assets/squares-moldure.svg';
import logoBlockchain from '../assets/logoBlockchain.svg'; 
import './Home.css';
import { useNavigate } from 'react-router-dom';
import StudentCard from '../components/StudentCard';
import ShowcaseProjectCard from '../components/ShowcaseProjectCard';
import { Icon } from '../components/Icon';
import { toast } from 'react-toastify';
import Avatar from '../components/Avatar';
import ValidatedBadge from '../components/ValidatedBadge';
import { ProjectRecord, SearchResults } from '../types/models';
import { getProjectNavigationPath, isProjectValidated, withViewerQuery } from '../utils/project';
import InviteMenu from '../components/InviteMenu';
import useInviteMenu from '../hooks/useInviteMenu';

interface Aluno {
    _id: string;
    name: string;
    course: string;
    bio: string;
    profileImage?: string; 
    role?: string
}

const Home: React.FC = () => {
    const navigate = useNavigate();
    const menuRef = useRef<HTMLDivElement>(null);
    

    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [endorsedProjects, setEndorsedProjects] = useState<ProjectRecord[]>([]);
    

    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [searchResultStudents, setSearchResultStudents] = useState<SearchResults['students']>([]);
    const [searchResultProfessors, setSearchResultProfessors] = useState<SearchResults['professors']>([]);
    const [searchResultProjects, setSearchResultProjects] = useState<SearchResults['projects']>([]);
    
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const { inviteMenu } = useInviteMenu(currentUser, {
        onSelect: (projectId) => {
            navigate(`/project/${projectId}`);
        }
    });


    useEffect(() => {
        fetch(`${apiUrl}/students-active`)
            .then((res) => res.json())
            .then((data) => setAlunos(data))
            .catch((err) => console.error("Erro ao carregar vitrine de talentos:", err));

        fetch(`${apiUrl}/projects-endorsed`)
            .then((res) => res.json())
            .then((data) => setEndorsedProjects(data))
            .catch((err) => console.error("Erro ao carregar projetos validados:", err));

        const savedUser = localStorage.getItem('@AcadeMe:user');
        if (savedUser) setCurrentUser(JSON.parse(savedUser));

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsAccountMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [apiUrl]);


    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResultStudents([]);
            setSearchResultProfessors([]);
            setSearchResultProjects([]);
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            fetch(withViewerQuery(`${apiUrl}/search?q=${encodeURIComponent(searchTerm)}`, currentUser))
                .then(res => res.json())
                .then((data: SearchResults) => {
                    setSearchResultStudents(data.students || []);
                    setSearchResultProfessors(data.professors || []);
                    setSearchResultProjects(data.projects || []);
                })
                .catch(err => console.error("Erro na busca global:", err));
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, apiUrl, currentUser]);

    const vitrineAlunos = useMemo(() => {
        if (alunos.length === 0) return [];
        return [...alunos].sort(() => 0.5 - Math.random()).slice(0, 3);
    }, [alunos]);

    const vitrineExcelencia = useMemo(() => endorsedProjects.slice(0, 3), [endorsedProjects]);

    const handleLogout = () => {
        localStorage.removeItem('@AcadeMe:user');
        setCurrentUser(null);
        toast.info("Sessão encerrada.");
        navigate('/');
    };

    return (
        <div className="Home relative overflow-x-hidden pt-20"> 
            
            
            <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-md z-[1000] py-3 border-b border-gray-100">
                <div className="w-full flex items-center justify-between px-6 md:px-12 lg:px-20">
                    <div className="flex-shrink-0">
                        <img src={coloredLogo} alt="logo" className="h-10 cursor-pointer" onClick={() => navigate('/')} />
                    </div>
                    
                    
                    <div className="flex-1 max-w-2xl mx-8 relative">
                        <TextBar 
                            variant="default" 
                            placeholder="Pesquisar talentos ou projetos..." 
                            iconLeft="search" 
                            hideIconsOnInput 
                            value={searchTerm}
                            onChange={(e: any) => {
                                setSearchTerm(e.target.value);
                                setIsDropdownVisible(true);
                            }}
                            onBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)}
                        />

                        {searchTerm && isDropdownVisible && (
                            <div className="absolute top-full left-0 w-full bg-white shadow-[0_20px_60px_rgba(0,52,101,0.15)] rounded-b-3xl mt-1 border border-gray-100 overflow-hidden text-left z-[1100] max-h-[500px] overflow-y-auto">
                                
                                
                                {searchResultStudents.length > 0 && (
                                    <div>
                                        <div className="bg-blue-50 px-5 py-3 border-y border-blue-200">
                                            <span className="text-[10px] font-black text-[#006ACB] uppercase tracking-[0.2em] flex items-center gap-2"> Alunos </span>
                                            
                                        </div>
                                        {searchResultStudents.map(aluno => (
                                            <div key={aluno._id} onClick={() => navigate(`/student/${aluno._id}`)} className="flex items-center gap-4 p-4 hover:bg-blue-50/50 cursor-pointer border-b border-gray-50 last:border-none group">
                                                <Avatar name={aluno.name} image={aluno.profileImage} size="sm" className="shadow-sm" />
                                                <div className="flex flex-col flex-1">
                                                    <span className="font-bold text-[#003465] text-xs group-hover:text-[#006ACB] transition-colors">{aluno.name}</span>
                                                    <span className="text-gray-400 text-[9px] uppercase font-black tracking-wider mt-0.5">{aluno.course}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {searchResultProfessors.length > 0 && (
                                    <div>
                                        <div className="bg-blue-50 px-5 py-3 border-y border-blue-200">
                                            <span className="text-[10px] font-black text-[#006ACB] uppercase tracking-[0.2em] flex items-center gap-2"> Professores </span>
                                        </div>
                                        {searchResultProfessors.map(professor => (
                                            <div key={professor._id} onClick={() => navigate(`/professor/${professor._id}`)} className="flex items-center gap-4 p-4 hover:bg-blue-50/50 cursor-pointer border-b border-gray-50 last:border-none group">
                                                <Avatar name={professor.name} image={professor.profileImage} size="sm" className="shadow-sm" />
                                                <div className="flex flex-col flex-1">
                                                    <span className="font-bold text-[#003465] text-xs group-hover:text-[#006ACB] transition-colors">
                                                        {professor.academicTitle ? `${professor.academicTitle} ${professor.name}` : professor.name}
                                                    </span>
                                                    <span className="text-gray-400 text-[9px] uppercase font-black tracking-wider mt-0.5">
                                                        {professor.department || 'Docente'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {searchResultProjects.length > 0 && (
                                    <div>
                                        <div className="bg-blue-50 px-5 py-3 border-y border-blue-200">
                                            <span className="text-[10px] font-black text-[#006ACB] uppercase tracking-[0.2em] flex items-center gap-2"> Projetos </span>
                                            
                                        </div>
                                        {searchResultProjects.map(proj => (
                                            <div key={proj._id} onClick={() => navigate(getProjectNavigationPath(proj, currentUser?._id, currentUser?.role))} className="flex items-center gap-4 p-4 hover:bg-green-50/50 cursor-pointer border-b border-gray-50 last:border-none group">
                                                <div className="flex flex-col flex-1 overflow-hidden">
                                                    <div className="font-bold text-[#003465] text-xs group-hover:text-[#006ACB] transition-colors flex items-center gap-2">
                                                        <span className="truncate">{proj.title}</span>
                                                        {isProjectValidated(proj) && <ValidatedBadge compact />}
                                                    </div>
                                                    <span className="text-gray-400 text-[9px] uppercase font-black tracking-wider mt-0.5 truncate">
                                                        Tags: <span className="text-blue-400">{proj.tags?.join(', ') || 'Nenhuma'}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {searchResultStudents.length === 0 && searchResultProfessors.length === 0 && searchResultProjects.length === 0 && (
                                    <div className="p-10 text-center flex flex-col items-center justify-center opacity-50">
                                        <Icon iconCenter="search" className="w-8 h-8 mb-3 text-[#003465]" />
                                        <p className="text-[#003465] font-black text-xs uppercase tracking-widest">Nenhum resultado</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex-shrink-0 flex items-center gap-4">
                        {inviteMenu && <InviteMenu {...inviteMenu} />}

                        <div className="relative" ref={menuRef}>
                        {currentUser ? (
                            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}>
                                <div className="hidden md:flex flex-col items-end mr-1">
                                    <span className="text-[9px] font-black text-[#006ACB] uppercase tracking-widest leading-none mb-1">
                                        {currentUser.role === 'professor' ? 'Docente' : 'Online'}
                                    </span>
                                    <span className="text-[#003465] font-bold text-xs">{currentUser?.name?.split(' ')[0] || "User"}</span>
                                </div>
                                <Avatar name={currentUser?.name} image={currentUser?.profileImage} size="md" className={`border-2 transition-all ${isAccountMenuOpen ? 'border-[#006ACB] scale-105 shadow-lg' : 'border-gray-200'}`} />
                                {isAccountMenuOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,52,101,0.15)] border border-gray-100 py-6 z-[1100] animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                                        <div className="px-8 pb-4 border-b border-gray-50 flex flex-col items-center text-center">
                                            <p className="text-[#006ACB] text-[10px] font-black uppercase tracking-[0.2em] mb-4">Conta AcadeMe</p>
                                            <Avatar name={currentUser?.name} image={currentUser?.profileImage} size="lg" className="border-4 border-blue-50 p-0.5 mb-3" />
                                            <p className="text-[#003465] font-black text-lg tracking-tighter leading-tight truncate w-full">{currentUser?.name}</p>
                                            <p className="text-gray-400 text-xs truncate w-full">{currentUser?.email}</p>
                                        </div>
                                        <div className="pt-4 px-2">
                                            <button 
                                                onClick={() => navigate(currentUser?.role === 'professor' ? '/professor-profile' : '/profile')} 
                                                className="w-full flex items-center gap-4 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-[#006ACB] rounded-xl transition-all group"
                                            >
                                                Meu Perfil
                                            </button>
                                            <div className="my-2 border-t border-gray-50 mx-4" />
                                            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all group">
                                                Sair da conta
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                               <div className="flex gap-4">
                                <Button shape="pill" size="sm" className="text-xs font-bold px-6" onClick={() => navigate('/login')}>Login</Button>
                                 <Button shape="pill" size="sm" className="text-xs font-bold px-6" onClick={() => navigate('/signup')}>Cadastre-se</Button>
                               </div>
                        )}
                        </div>
                    </div>
                </div>
            </header>

            
            <section id="top-section" className="bg-gradient-to-br from-[#006ACB] to-[#003465] min-h-[90vh] flex items-center justify-center">
                 <div className="top-container flex flex-col items-center justify-center text-center w-full px-6">
                    <img src={logo} alt="logo" className="w-32 md:w-48 mb-8" />
                    <h1 className='slogan text-[#f4f0f5] text-[32px] md:text-[50px] mb-[21px] font-medium leading-tight'>
                         Seja bem-vindo ao seu<br/>futuro acadêmico
                    </h1>
                    {!currentUser && (
                        <div className="top-buttons-container flex flex-col md:flex-row items-center justify-center gap-4">
                            <Button size='default' shape='pill' className='font-bold min-w-[171px] justify-center text-center hover:bg-black transition-all' onClick={() => navigate('/signup')}>
                                Cadastre-se
                            </Button>
                            <Button size='default' shape='pill' className='font-bold min-w-[171px] justify-center text-center hover:bg-black transition-all' onClick={() => navigate('/login')}>
                                Login
                            </Button>
                        </div>
                    )}
                </div>
             </section>

            
            <section id="search-section" className="relative h-screen flex items-center justify-center px-8 md:px-16 lg:px-32 bg-white">
                <div className="absolute inset-y-0 left-0 w-auto h-full hidden md:block">
                    <img src={moldure} alt="Moldura" className="h-full object-contain rotate-180 opacity-20" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full gap-10 md:gap-40">
                    <img src={classroom} alt="classroom" className="w-80 md:w-[500px]" />
                    <div className="search-content-body flex flex-col items-center text-center md:items-start md:text-left flex-1 lg:ml-20">
                        <h1 className='search-title text-[#006ACB] text-[28px] md:text-[40px] mb-4 font-bold'>O que é o AcadeMe?</h1>
                        <p className='about-search text-[#006ACB] text-[18px] md:text-[24px] mb-10 leading-relaxed'>
                            Com o AcadeMe o aluno é capaz de destacar toda a sua trajetória acadêmica, trazendo visibilidade para todas atividades feitas na faculdade.
                        </p>
                    </div>
                </div>
            </section>

            
            <section id="share-section" className='bg-gradient-to-r from-[#006ACB] to-[#003465] min-h-screen flex items-center justify-center px-8 md:px-16 lg:px-32'>
                
                <div className="share-container flex flex-col md:flex-row items-center justify-between w-full gap-10 md:gap-56">
                    <div className="search-content-body flex flex-col items-center text-center md:items-start md:text-left flex-1 lg:mr-20">
                        <h1 className='share-title text-[#F0F2F5] text-[28px] md:text-[40px] mb-4 font-bold'>Compartilhe</h1>
                        <p className='about-share text-[#F0F2F5] text-[18px] md:text-[24px] mb-10 leading-relaxed'>
                            Você pode compartilhar seu portfólio com colegas, professores e possíveis recrutadores.
                        </p>
                    </div>
                    <img src={studentsMoldure} alt="happy-students" className="w-80 md:w-[500px]" />
                </div>
            </section>

            
            <section className="py-24 bg-gray-50 flex flex-col items-center px-8 md:px-16 lg:px-32">
                <h1 className='text-[#006ACB] font-black text-[28px] md:text-[40px] mb-20 text-center uppercase tracking-tighter'>Nossos Talentos</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 w-full max-w-7xl">
                    {vitrineAlunos.map((aluno) => (
                        <StudentCard key={aluno._id} id={aluno._id} name={aluno.name} course={aluno.course} profileImage={aluno.profileImage} />
                    ))}
                </div>
            </section>

            <section id='endorsed-projects-section' className='bg-gradient-to-r from-[#006ACB] to-[#003465] py-24 px-8 md:px-16 lg:px-32 relative flex flex-col items-center'>
                <div className="text-center mb-16 text-white">
                    <h1 className='font-black text-[28px] md:text-[40px] mb-4 uppercase tracking-tighter'>Trabalhos de Excelência</h1>
                    <p className="text-blue-200 text-sm md:text-base max-w-2xl mx-auto font-medium">Projetos que receberam validação oficial do corpo docente.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 w-full max-w-7xl">
                    {vitrineExcelencia.map((proj) => (
                        <ShowcaseProjectCard
                            key={proj._id} id={proj._id} title={proj.title} description={proj.description} tags={proj.tags || []}
                            date={new Date(proj.createdAt || Date.now()).toLocaleDateString()} imageUrl={proj.imageUrl || logoBlockchain}
                            onView={() => navigate(getProjectNavigationPath(proj, currentUser?._id, currentUser?.role))}
                        />
                    ))}
                </div>
            </section>

            
            <footer className='footer-container flex flex-col md:flex-row md:items-end justify-between gap-6 px-10 md:px-20 lg:px-32 py-8 bg-white border-t border-gray-100'>
                <img src={coloredLogo} alt="Logo" className="w-16 mx-auto md:mx-0 shrink-0" />

                <div className="w-full md:w-auto flex justify-center md:justify-end md:self-end">
                    <ul className='flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-8 text-[#006ACB] font-semibold'>
                        <li><a href="https://github.com/v-gui" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4"><img src={githubLogo} className='h-4 w-4'/><span>github.com/v-gui</span></a></li>
                        <li><a href="https://github.com/lucasmmps" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4"><img src={githubLogo} className='h-4 w-4'/><span>github.com/lucasmmps</span></a></li>
                        <li><a href="https://github.com/caique18" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4"><img src={githubLogo} className='h-4 w-4'/><span>github.com/caique18</span></a></li>
                    </ul>
                </div>
            </footer>

            <img src={moldure} alt="Moldura" className="absolute bottom-0 right-0 z-0 pointer-events-none w-[500px] opacity-10 hidden md:block" />
        </div>
    );
}

export default Home;

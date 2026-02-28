/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import { TextBar } from '../components/TextBar';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import UserIcon from '../assets/UserIcon.svg';
import coloredLogo from '../assets/colored-logo.svg';
import logoBlockchain from '../assets/logoBlockchain.svg';
import { toast } from 'react-toastify';

interface Aluno {
    _id: string;
    name: string;
    course: string;
    profileImage?: string; 
}

const StudentProfileView: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const menuRef = useRef<HTMLDivElement>(null);
    
    // Estados do Estudante Visualizado (Target)
    const [student, setStudent] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);
    
    // Estados do Usuário Autenticado (Quem está navegando)
    const [currentUser, setCurrentUser] = useState<any>(null);
    
    // Estados da Busca Global (Header)
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    // Lógica para fechar menu ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsAccountMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        // 1. Verifica se existe usuário logado para o Header
        const savedUser = localStorage.getItem('@AcadeMe:user');
        if (savedUser) setCurrentUser(JSON.parse(savedUser));

        // 2. Busca os dados do estudante visualizado (Perfil do dono)
        fetch(`${apiUrl}/students/${id}`)
            .then(res => res.json())
            .then(data => setStudent(data))
            .catch(err => console.error("Erro ao carregar estudante:", err));

        // 3. Busca os projetos do estudante visualizado
        fetch(`${apiUrl}/students/${id}/projects`)
            .then(res => res.json())
            .then(data => setProjects(data))
            .catch(err => console.error("Erro ao carregar projetos:", err));

        // 4. Busca lista de todos os alunos (para a busca global no header)
        fetch(`${apiUrl}/students`)
            .then(res => res.json())
            .then(data => setAlunos(data))
            .catch(err => console.error("Erro ao carregar lista de alunos:", err));
    }, [id, apiUrl]);

    // Lógica de Filtro para o Dropdown do Header
    const filteredAlunos = useMemo(() => {
        if (!searchTerm) return [];
        return alunos.filter(aluno => 
            aluno.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            aluno.course.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [alunos, searchTerm]);

    const handleLogout = () => {
        localStorage.removeItem('@AcadeMe:user');
        toast.info("Sessão encerrada.");
        navigate('/');
    };

    if (!student) return <div className="flex h-screen items-center justify-center font-bold text-[#003465] text-xl animate-pulse">Carregando Perfil AcadeMe...</div>;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 pt-20"> 
            
            {/** --- HEADER FIXO ACADEME (EXTREMIDADE A EXTREMIDADE) --- **/}
            <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-md z-[1000] py-3  border-b border-gray-100">   
                <div className="w-full flex items-center justify-between px-6 md:px-12">
                    
                    {/* Extremidade Esquerda: Logo */}
                    <div className="flex-shrink-0">
                        <img src={coloredLogo} alt="logo" className="h-10 cursor-pointer" onClick={() => navigate('/')} />
                    </div>
                    
                    {/* Centro: Barra de Pesquisa Global */}
                    <div className="flex-1 max-w-2xl mx-8 relative">
                        <TextBar 
                            variant="default" 
                            placeholder="Pesquisar talentos ou cursos..." 
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
                            <div className="absolute top-full left-0 w-full bg-white shadow-2xl rounded-b-xl mt-1 border border-gray-100 overflow-hidden text-left animate-in fade-in slide-in-from-top-1 duration-200">
                                {filteredAlunos.length > 0 ? (
                                    filteredAlunos.map(aluno => (
                                        <div key={aluno._id} onClick={() => navigate(`/student/${aluno._id}`)} className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer border-b last:border-none">
                                            <img src={aluno.profileImage || UserIcon} className="w-8 h-8 rounded-full object-cover border" />
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[#003465] text-xs">{aluno.name}</span>
                                                <span className="text-gray-400 text-[10px] uppercase font-bold">{aluno.course}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-gray-400 text-xs italic">Nenhum resultado...</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Extremidade Direita: Menu de Conta (Logado) ou Auth (Deslogado) */}
                    <div className="flex-shrink-0 relative" ref={menuRef}>
                        {currentUser ? (
                            <div 
                                className="flex items-center gap-3 cursor-pointer group"
                                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                            >
                                <div className="hidden md:flex flex-col items-end mr-1">
                                    <span className="text-[9px] font-black text-[#006ACB] uppercase tracking-widest leading-none">Online</span>
                                    <span className="text-[#003465] font-bold text-xs">{currentUser.name.split(' ')[0]}</span>
                                </div>
                                <img 
                                    src={currentUser.profileImage || UserIcon} 
                                    className={`w-10 h-10 rounded-full border-2 transition-all object-cover ${isAccountMenuOpen ? 'border-[#006ACB] shadow-lg scale-105' : 'border-gray-200 group-hover:border-[#006ACB]'}`}
                                />
                                
                                {isAccountMenuOpen && (
                                    <div className="absolute right-0 mt-[3.5rem] w-72 bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,52,101,0.15)] border border-gray-100 py-6 z-[1100] animate-in fade-in slide-in-from-top-3 duration-200">
                                        <div className="px-8 pb-4 border-b border-gray-50 flex flex-col items-center text-center">
                                            <p className="text-[#006ACB] text-[10px] font-black uppercase tracking-[0.2em] mb-4">Minha Conta</p>
                                            <img src={currentUser.profileImage || UserIcon} className="w-16 h-16 rounded-full border-4 border-blue-50 p-0.5 object-cover mb-3" />
                                            <p className="text-[#003465] font-black text-lg tracking-tighter leading-tight truncate w-full">{currentUser.name}</p>
                                            <p className="text-gray-400 text-xs truncate w-full">{currentUser.email}</p>
                                        </div>
                                        <div className="pt-4 px-2 text-left">
                                            <button onClick={() => navigate('/Profile')} className="w-full flex items-center gap-4 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-[#006ACB] rounded-xl transition-all">
                                                Dashboard
                                            </button>
                                            <div className="my-2 border-t border-gray-50 mx-4" />
                                            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all">
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
            </header>

            <div className="flex flex-col md:flex-row flex-grow">
                
                {/* SIDEBAR DO ESTUDANTE (TARGET) */}
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

                        <div className="w-full mb-6 text-left">
                            <label className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Curso</label>
                            <p className="text-white mt-2 font-bold text-sm leading-snug">{student.course}</p>
                        </div>

                        <div className="w-full border-b border-white/10 my-4" />
                        
                        <div className="w-full mb-6 text-left">
                            <label className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Sobre o Estudante</label>
                            <p className="text-white mt-4 text-sm italic leading-relaxed opacity-90">
                                {student.bio || "Este talento ainda não adicionou uma biografia."}
                            </p>
                        </div>

                        <div className="w-full border-b border-white/10 my-6" />

                        <div className="w-full text-left">
                            <h2 className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-4">Áreas de Interesse</h2>
                            <div className="flex flex-wrap gap-2">
                                {student.interests?.map((interest: string, i: number) => (
                                    <span key={i} className="bg-white/20 text-white text-[10px] px-3 py-1 rounded-full uppercase font-bold border border-white/10 shadow-sm">
                                        {interest}
                                    </span>
                                ))}
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

                {/* ÁREA DE PROJETOS DO ESTUDANTE (TARGET) */}
                <div className="flex-1 p-12 overflow-y-auto">
                    <h2 className="text-2xl font-black text-[#003465] mb-10 border-b-4 border-[#006ACB] w-fit pb-2 uppercase tracking-tighter text-left">
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
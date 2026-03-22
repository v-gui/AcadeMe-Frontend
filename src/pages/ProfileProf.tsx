/* eslint-disable jsx-a11y/alt-text */
import React, { useRef, useEffect, useState } from 'react';
import coloredLogo from '../assets/colored-logo.svg'; 
import logoBlockchain from '../assets/logoBlockchain.svg'; // <-- IMPORTAÇÃO DO FALLBACK AQUI
import { useNavigate } from 'react-router-dom';
import { TextBar } from '../components/TextBar';
import { Icon } from '../components/Icon';
import { toast } from 'react-toastify';
import Avatar from '../components/Avatar';
import ProjectCard from '../components/ProjectCard';

interface ProfessorData {
    _id: string;
    name: string;
    email: string;
    department: string;
    academicTitle: string;
    bio: string;
    areasOfExpertise: string[];
    profileImage?: string; 
    role: string;
}

const EXPERTISE_OPTIONS = [
    "Engenharia de Software", "Banco de Dados", "Redes de Computadores", 
    "Inteligência Artificial", "Sistemas Distribuídos", "Interação Humano-Computador", 
    "Matemática Discreta", "Algoritmos", "Gestão de Projetos", "Empreendedorismo Inovador"
].sort();

const ProfileProf: React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement>(null); 
    const menuRef = useRef<HTMLDivElement>(null); 
    const navigate = useNavigate();
    
    const [user, setUser] = useState<ProfessorData | null>(null);
    const [endorsedProjects, setEndorsedProjects] = useState<any[]>([]); 
    
    // Estados de edição do Perfil
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [tempBio, setTempBio] = useState("");
    
    // Estados da Área de Expertise
    const [isEditingExpertise, setIsEditingExpertise] = useState(false);
    const [expertiseSearch, setExpertiseSearch] = useState("");

    // Estados da Busca Global (Omnibox do Header)
    const [searchTerm, setSearchTerm] = useState(""); 
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [searchResultStudents, setSearchResultStudents] = useState<any[]>([]);
    const [searchResultProjects, setSearchResultProjects] = useState<any[]>([]);

    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false); 

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    // Fecha menus ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsAccountMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Carrega dados do Professor logado e seus projetos validados
    useEffect(() => {
        const savedUser = localStorage.getItem('@AcadeMe:user');
        if (!savedUser) {
            navigate('/login'); 
            return;
        }
        
        const parsedUser = JSON.parse(savedUser);
        
        if (parsedUser.role !== 'professor') {
            navigate('/profile');
            return;
        }

        // Buscar dados do professor
        fetch(`${apiUrl}/professors/${parsedUser._id}`)
            .then(res => res.json())
            .then(data => {
                const fullUserData = { 
                    ...data, 
                    role: 'professor', 
                    areasOfExpertise: Array.isArray(data.areasOfExpertise) ? data.areasOfExpertise : [] 
                };
                setUser(fullUserData);
                setTempBio(data.bio || "");
                localStorage.setItem('@AcadeMe:user', JSON.stringify(fullUserData));
            })
            .catch(() => toast.error("Erro ao carregar perfil de docente."));

        // Buscar projetos já validados
        fetch(`${apiUrl}/professors/${parsedUser._id}/projects`)
            .then(res => res.json())
            .then(data => setEndorsedProjects(data))
            .catch(() => console.error("Erro ao carregar projetos chancelados."));

    }, [navigate, apiUrl]);

    // Busca Global Unificada (Debounce)
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResultStudents([]);
            setSearchResultProjects([]);
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            fetch(`${apiUrl}/search?q=${encodeURIComponent(searchTerm)}`)
                .then(res => res.json())
                .then(data => {
                    setSearchResultStudents(data.students || []);
                    setSearchResultProjects(data.projects || []);
                })
                .catch(err => console.error("Erro na busca global:", err));
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, apiUrl]);


    const handleLogout = () => {
        localStorage.removeItem('@AcadeMe:user');
        toast.info("Sessão docente encerrada.");
        navigate('/');
    };

    const handleUpdateProfile = async (updates: Partial<ProfessorData>, silent = false) => {
        if (!user) return;
        try {
            const response = await fetch(`${apiUrl}/professors/${user._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                const newUserState = { ...updatedUser, role: 'professor' };
                setUser(newUserState);
                localStorage.setItem('@AcadeMe:user', JSON.stringify(newUserState));
                if (!silent) toast.success('✨ Perfil atualizado!');
            }
        } catch (err) {
            toast.error('Erro de conexão.');
        }
    };

    const addExpertise = (expertise: string) => {
        if (!user) return;
        if (user.areasOfExpertise.includes(expertise)) return;
        
        handleUpdateProfile({ areasOfExpertise: [...user.areasOfExpertise, expertise] }, true);
        setExpertiseSearch("");
    };

    const removeExpertise = (expertise: string) => {
        if (!user) return;
        handleUpdateProfile({ areasOfExpertise: user.areasOfExpertise.filter(i => i !== expertise) }, true);
    };

    const availableExpertises = EXPERTISE_OPTIONS.filter(opt => 
        opt.toLowerCase().includes(expertiseSearch.toLowerCase()) && 
        !user?.areasOfExpertise.includes(opt)
    );

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && user) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                await handleUpdateProfile({ profileImage: reader.result as string }, true);
                toast.success('📸 Foto atualizada!');
            };
        }
    };

    if (!user) return <div className="flex h-screen items-center justify-center font-bold text-[#003465]">Carregando Painel Docente...</div>;

    return (
        <div className="ProfessorProfile flex flex-col min-h-screen bg-gray-50 relative pt-20">
            
            {/** --- HEADER FIXO (OMNIBOX) --- **/}
            <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-md z-[1000] py-3 border-b border-gray-100 h-20 flex items-center">
                <div className="w-full flex items-center justify-between px-6 md:px-12 lg:px-20">
                    
                    <div className="flex-shrink-0">
                        <img src={coloredLogo} alt="logo" className="h-10 cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/')} />
                    </div>
                    
                    <div className="flex-1 max-w-2xl mx-8 relative">
                        <TextBar 
                            variant="default" 
                            placeholder="Buscar alunos ou projetos para validar..." 
                            iconLeft="search" 
                            hideIconsOnInput 
                            value={searchTerm}
                            onChange={(e: any) => {
                                setSearchTerm(e.target.value);
                                setIsDropdownVisible(true);
                            }}
                            onBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)}
                        />

                        {/* DROPDOWN UNIFICADO */}
                        {searchTerm && isDropdownVisible && (
                            <div className="absolute top-full left-0 w-full bg-white shadow-[0_20px_60px_rgba(0,52,101,0.15)] rounded-b-3xl mt-1 border border-gray-100 overflow-hidden text-left z-[1100] max-h-[500px] overflow-y-auto custom-scrollbar">
                                
                                {searchResultStudents.length > 0 && (
                                    <div>
                                        <div className="bg-gray-50/80 px-5 py-2.5 border-b border-gray-100">
                                            <span className="text-[9px] font-black text-[#006ACB] uppercase tracking-[0.2em]">🎓 Alunos</span>
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

                                {searchResultProjects.length > 0 && (
                                    <div>
                                        <div className="bg-gray-50/80 px-5 py-2.5 border-y border-gray-100">
                                            <span className="text-[9px] font-black text-[#006ACB] uppercase tracking-[0.2em]">🚀 Projetos</span>
                                        </div>
                                        {searchResultProjects.map(proj => (
                                            <div key={proj._id} onClick={() => navigate(`/project/${proj._id}`)} className="flex items-center gap-4 p-4 hover:bg-blue-50/50 cursor-pointer border-b border-gray-50 last:border-none group">
                                                <div className="flex flex-col flex-1 overflow-hidden">
                                                    <span className="font-bold text-[#003465] text-xs group-hover:text-[#006ACB] transition-colors truncate">{proj.title}</span>
                                                    <span className="text-gray-400 text-[9px] uppercase font-black tracking-wider mt-0.5 truncate">
                                                        Tags: <span className="text-blue-400">{proj.tags?.join(', ') || 'Nenhuma'}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {searchResultStudents.length === 0 && searchResultProjects.length === 0 && (
                                    <div className="p-10 text-center flex flex-col items-center justify-center opacity-50">
                                        <Icon iconCenter="search" className="w-8 h-8 mb-3 text-[#003465]" />
                                        <p className="text-[#003465] font-black text-xs uppercase tracking-widest">Nenhum resultado</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex-shrink-0 relative" ref={menuRef}>
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}>
                            <div className="hidden md:flex flex-col items-end mr-1">
                                <span className="text-[9px] font-black text-[#006ACB] uppercase tracking-widest leading-none mb-1">Docente</span>
                                <span className="text-[#003465] font-bold text-xs">{user.name.split(' ')[0]}</span>
                            </div>
                            <Avatar name={user.name} image={user.profileImage} size="md" className={`border-2 transition-all ${isAccountMenuOpen ? 'border-[#006ACB] scale-105' : 'border-gray-200 group-hover:border-[#006ACB]'}`} />
                        </div>
                        {isAccountMenuOpen && (
                            <div className="absolute right-0 top-full mt-3 w-72 bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,52,101,0.15)] border border-gray-100 py-6 z-[1100] animate-in fade-in slide-in-from-top-3 duration-200">
                                <div className="px-8 pb-4 border-b border-gray-50 flex flex-col items-center text-center">
                                    <p className="text-[#006ACB] text-[10px] font-black uppercase tracking-[0.2em] mb-4">Painel Docente</p>
                                    <Avatar name={user.name} image={user.profileImage} size="lg" className="border-4 border-blue-50 p-0.5 mb-3" />
                                    <p className="text-[#003465] font-black text-lg tracking-tighter leading-tight truncate w-full">{user.name}</p>
                                    <p className="text-gray-400 text-xs truncate w-full">{user.email}</p>
                                </div>
                                <div className="pt-4 px-2 text-left">
                                    <button 
                                        onClick={() => { 
                                            setIsAccountMenuOpen(false); 
                                            navigate('/professor-profile'); 
                                            window.scrollTo({ top: 0, behavior: 'smooth' }); 
                                        }} 
                                        className="w-full flex items-center gap-4 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-[#006ACB] rounded-xl transition-all group"
                                    >
                                        Meu Perfil
                                    </button>
                                    <div className="my-2 border-t border-gray-50 mx-4" />
                                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                        Sair da conta
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            
            <div className="profile-section flex flex-col md:flex-row flex-grow">
                {/** --- SIDEBAR DOCENTE --- **/}
                <div className="profile-sidebar hidden md:flex flex-col bg-gradient-to-b from-[#003465] to-[#001a33] w-full min-w-80 md:w-[350px] shrink-0 p-8 text-white shadow-2xl z-20">
                    <div className="profile-header flex flex-col items-center">
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                        <div className="relative group mt-6">
                            <Avatar name={user.name} image={user.profileImage} size="xl" className="border-4 border-white/20 p-1 cursor-pointer hover:scale-105 transition-transform shadow-2xl" onClick={() => fileInputRef.current?.click()} />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <span className="bg-black/40 backdrop-blur-sm text-white text-[9px] px-3 py-1.5 rounded-full uppercase font-black">Trocar Foto</span>
                            </div>
                        </div>
                        
                        <h1 className="profile-name font-black mt-6 text-center text-2xl tracking-tighter leading-tight">{user.academicTitle || 'Prof.'} {user.name}</h1>
                        <p className="text-blue-100/70 text-center text-sm mb-6 font-medium">{user.email}</p>
                        
                        <div className="w-full border-b border-white/10 my-4" />
                        
                        <div className="w-full mb-6 text-left">
                            <label className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Departamento</label>
                            <p className="text-white mt-2 font-bold text-sm leading-snug">{user.department}</p>
                        </div>
                        
                        <div className="w-full border-b border-white/10 my-4" />
                        
                        <div className="w-full group text-left">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Resumo Acadêmico</label>
                                {!isEditingBio ? (
                                    <button onClick={() => setIsEditingBio(true)} className="opacity-0 group-hover:opacity-100 transition text-[10px] font-bold underline text-blue-200 hover:text-white">Editar</button>
                                ) : (
                                    <button onClick={async () => { await handleUpdateProfile({ bio: tempBio }); setIsEditingBio(false); }} className="text-[10px] font-bold text-green-300 hover:text-green-200">Salvar</button>
                                )}
                            </div>
                            {isEditingBio ? (
                                <textarea className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none h-24 italic resize-none" value={tempBio} onChange={(e) => setTempBio(e.target.value)} />
                            ) : (
                                <p className="text-white text-sm italic leading-relaxed opacity-90">{user.bio || "Descreva sua formação e áreas de pesquisa principal..."}</p>
                            )}
                        </div>
                        
                        <div className="w-full border-b border-white/10 my-6" />
                        
                        <div className="interest-area w-full text-left">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-black text-white text-[11px] uppercase tracking-widest">Áreas de Expertise</h2>
                                <button onClick={() => { setIsEditingExpertise(!isEditingExpertise); setExpertiseSearch(""); }} className="text-[10px] font-bold underline text-blue-200 hover:text-white">
                                    {isEditingExpertise ? "Pronto" : "Gerenciar"}
                                </button>
                            </div>
                            
                            {/* CAIXA DE BUSCA PARA NOVAS ÁREAS DE EXPERTISE */}
                            {isEditingExpertise && (
                                <div className="mb-4 relative">
                                    <input 
                                        type="text" 
                                        placeholder="Pesquisar especialidade..." 
                                        className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-2 text-[10px] text-white outline-none focus:bg-white/20 transition-all placeholder:text-white/40"
                                        value={expertiseSearch}
                                        onChange={(e) => setExpertiseSearch(e.target.value)}
                                    />
                                    {expertiseSearch && availableExpertises.length > 0 && (
                                        <div className="absolute top-full mt-2 left-0 w-full bg-[#001a33] rounded-xl shadow-2xl z-[500] border border-white/10 overflow-hidden max-h-48 overflow-y-auto">
                                            {availableExpertises.map(opt => (
                                                <div key={opt} onClick={() => addExpertise(opt)} className="px-4 py-3 text-[10px] font-bold text-white hover:bg-white/10 cursor-pointer uppercase transition-colors">
                                                    + {opt}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ÁREAS JÁ SELECIONADAS */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {user.areasOfExpertise?.map((exp, i) => (
                                    <div key={i} className={`flex items-center gap-2 text-[10px] px-3 py-1.5 rounded-full uppercase font-bold border transition-all ${isEditingExpertise ? "bg-white text-[#003465] border-white animate-pulse shadow-xl scale-105" : "bg-white/10 text-white border-white/10"}`}>
                                        {exp}
                                        {isEditingExpertise && <button onClick={() => removeExpertise(exp)} className="hover:text-red-500 transition-colors bg-gray-100 rounded-full w-4 h-4 flex items-center justify-center text-[8px] text-[#003465]">✕</button>}
                                    </div>
                                ))}
                                {user.areasOfExpertise?.length === 0 && !isEditingExpertise && (
                                    <span className="text-xs text-white/50 italic">Nenhuma área adicionada.</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/** --- PAINEL DIREITO --- **/}
                <div className="projects-section flex flex-col h-auto w-full bg-[#F8FAFC] p-8 md:p-12 lg:p-16 overflow-y-auto">
                    
                    <div className="mb-10 text-left w-full">
                        <h2 className="text-2xl font-black text-[#003465] uppercase tracking-tighter mb-2">Trabalhos Chancelados</h2>
                        <p className="text-gray-500 font-medium text-sm">Histórico de projetos que receberam sua validação acadêmica.</p>
                    </div>

                    {endorsedProjects.length > 0 ? (
                        <div className="projects-list w-full max-w-none mx-auto space-y-8 pb-20">
                            {endorsedProjects.map((proj) => (
                                <ProjectCard
                                    key={proj._id}
                                    id={proj._id}
                                    title={proj.title}
                                    description={proj.description}
                                    tags={proj.tags || ["AcadeMe"]}
                                    date={new Date(proj.createdAt).toLocaleDateString()}
                                    imageUrl={proj.imageUrl || logoBlockchain} // <-- FALLBACK APLICADO AQUI!
                                    onView={(id) => navigate(`/project/${id}`)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full opacity-40 py-20 text-center border-4 border-dashed border-gray-200 rounded-[40px] bg-white/50">
                            <Icon iconCenter="search" className="w-16 h-16 text-[#003465] mb-4" />
                            <h2 className="font-black text-[#003465] text-xl tracking-tighter uppercase mb-2">Nenhum chancelamento</h2>
                            <p className="text-gray-500 text-sm max-w-md italic font-medium leading-relaxed">
                                Utilize a barra de pesquisa no topo da tela para encontrar trabalhos e emitir seu selo de validação formal.
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ProfileProf;
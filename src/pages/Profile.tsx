/* eslint-disable jsx-a11y/alt-text */
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Button } from '../components/Button';
import ProjectCard from '../components/ProjectCard';
import coloredLogo from '../assets/colored-logo.svg'; 
import { useNavigate } from 'react-router-dom';
import logoBlockchain from '../assets/logoBlockchain.svg';
import { TextBar } from '../components/TextBar';
import { Icon } from '../components/Icon';
import { toast } from 'react-toastify';
import Avatar from '../components/Avatar';

interface UserData {
    _id: string;
    name: string;
    email: string;
    course: string;
    bio: string;
    interests: string[];
    profileImage?: string; 
    role?: string;
}

const INTEREST_OPTIONS = [
    "Tecnologia", "Inovação", "Programação", "Python", "React", "Node.js", "Blockchain", 
    "Inteligência Artificial", "Cibersegurança", "Data Science", "Mobile Dev", "Cloud Computing",
    "Design", "UX/UI Design", "Branding", "Economia", "Marketing", "Marketing Digital", 
    "Gestão", "Empreendedorismo", "Finanças", "RH", "Logística",
    "Educação", "Ciência", "Artes", "Saúde", "Direito", "Psicologia", "Sociologia", 
    "Filosofia", "História", "Relações Internacionais", "Comunicação",
    "Sustentabilidade", "Fotografia", "Escrita Criativa", "Liderança", "Projetos Sociais"
].sort();

const Profile: React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement>(null); 
    const menuRef = useRef<HTMLDivElement>(null); 
    const inviteMenuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    
    const [user, setUser] = useState<UserData | null>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [invites, setInvites] = useState<any[]>([]); 

    // Estados de edição do Perfil
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [tempBio, setTempBio] = useState("");
    const [isEditingInterests, setIsEditingInterests] = useState(false);
    const [interestSearch, setInterestSearch] = useState(""); // Novo: específico para sidebar

    // --- ESTADOS DA BUSCA GLOBAL (HEADER) ---
    const [searchTerm, setSearchTerm] = useState(""); 
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [searchResultStudents, setSearchResultStudents] = useState<any[]>([]);
    const [searchResultProjects, setSearchResultProjects] = useState<any[]>([]);

    const [projectSearchTerm, setProjectSearchTerm] = useState(""); 
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false); 
    const [isInviteMenuOpen, setIsInviteMenuOpen] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    const fetchProjects = (userId: string) => {
        fetch(`${apiUrl}/students/${userId}/projects`)
            .then(res => res.json())
            .then(data => setProjects(data))
            .catch(() => toast.error("Erro ao carregar projetos."));
    };

    const fetchInvites = (userId: string) => {
        fetch(`${apiUrl}/students/${userId}/invites`)
            .then(res => res.json())
            .then(data => setInvites(data))
            .catch(() => console.error("Erro ao buscar convites"));
    };

    // Fecha menus ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsAccountMenuOpen(false);
            if (inviteMenuRef.current && !inviteMenuRef.current.contains(event.target as Node)) setIsInviteMenuOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Carrega dados iniciais
    useEffect(() => {
        const savedUser = localStorage.getItem('@AcadeMe:user');
        if (!savedUser) {
            navigate('/login'); 
            return;
        }
        const parsedUser = JSON.parse(savedUser);
        
        setUser({ 
            ...parsedUser, 
            interests: Array.isArray(parsedUser.interests) ? parsedUser.interests : [] 
        });
        setTempBio(parsedUser.bio || "");

        fetchProjects(parsedUser._id);
        fetchInvites(parsedUser._id);
    }, [navigate, apiUrl]);

    // --- LÓGICA DE BUSCA GLOBAL (HEADER) ---
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
                .catch(err => console.error("Erro na busca:", err));
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, apiUrl]);

    const handleRespondInvite = async (projectId: string, status: 'accepted' | 'declined') => {
        if (!user) return;
        try {
            const response = await fetch(`${apiUrl}/projects/${projectId}/respond-invite`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: user._id, status })
            });

            if (response.ok) {
                toast.success(status === 'accepted' ? "✨ Equipe atualizada!" : "Convite recusado.");
                setInvites(prev => prev.filter(i => i._id !== projectId));
                if (status === 'accepted') fetchProjects(user._id);
            }
        } catch (err) { toast.error("Erro ao processar convite."); }
    };

    const handleLogout = () => {
        localStorage.removeItem('@AcadeMe:user');
        toast.info("Até logo!");
        navigate('/');
    };

    // Filtro de Projetos locais do portfólio
    const filteredProjects = useMemo(() => {
        return projects.filter(proj => 
            proj.title.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
            proj.description.toLowerCase().includes(projectSearchTerm.toLowerCase())
        );
    }, [projects, projectSearchTerm]);

    // Filtro de Interesses (Sidebar)
    const availableInterests = useMemo(() => {
        if (!interestSearch) return [];
        return INTEREST_OPTIONS.filter(opt => 
            opt.toLowerCase().includes(interestSearch.toLowerCase()) && !user?.interests.includes(opt)
        );
    }, [interestSearch, user?.interests]);

    const handleUpdateProfile = async (updates: Partial<UserData>, silent = false) => {
        if (!user) return;
        try {
            const response = await fetch(`${apiUrl}/students/${user._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
                localStorage.setItem('@AcadeMe:user', JSON.stringify(updatedUser));
                if (!silent) toast.success('✨ Perfil atualizado!');
            }
        } catch (err) { toast.error('Erro de conexão.'); }
    };

    const openDeleteModal = (id: string) => {
        setIdToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!idToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`${apiUrl}/projects/${idToDelete}`, { method: 'DELETE' });
            if (res.ok) {
                setProjects(projects.filter(p => p._id !== idToDelete));
                toast.info('🗑️ Projeto removido.');
                setShowDeleteModal(false);
            }
        } finally {
            setIsDeleting(false);
            setIdToDelete(null);
        }
    };

    const addInterest = (interest: string) => {
        if (!user) return;
        handleUpdateProfile({ interests: [...user.interests, interest] }, true);
        setInterestSearch("");
    };

    const removeInterest = (interest: string) => {
        if (!user) return;
        handleUpdateProfile({ interests: user.interests.filter(i => i !== interest) }, true);
    };

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

    if (!user) return <div className="flex h-screen items-center justify-center font-bold text-[#003465]">Carregando Dashboard...</div>;

    return (
        <div className="Profile flex flex-col min-h-screen bg-gray-50 relative pt-20">
            
            {/** --- HEADER FIXO ACADEME --- **/}
            <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-md z-[1000] py-3 border-b border-gray-100 h-20 flex items-center">
                <div className="w-full flex items-center justify-between px-6 md:px-12 lg:px-20">
                    
                    <div className="flex-shrink-0">
                        <img src={coloredLogo} alt="logo" className="h-10 cursor-pointer" onClick={() => navigate('/')} />
                    </div>
                    
                    {/** BARRA DE PESQUISA GLOBAL **/}
                    <div className="flex-1 max-w-2xl mx-8 relative">
                        <TextBar 
                            variant="default" 
                            placeholder="Pesquisar talentos ou projetos..." 
                            iconLeft="search" 
                            hideIconsOnInput 
                            value={searchTerm}
                            onChange={(e: any) => { setSearchTerm(e.target.value); setIsDropdownVisible(true); }}
                            onBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)}
                        />

                        {searchTerm && isDropdownVisible && (
                            <div className="absolute top-full left-0 w-full bg-white shadow-2xl rounded-b-2xl mt-1 border border-gray-100 overflow-hidden text-left z-[1100] max-h-[500px] overflow-y-auto">
                                
                                {/** CATEGORIA: ALUNOS **/}
                                {searchResultStudents.length > 0 && (
                                    <div>
                                        <div className="bg-blue-50 px-5 py-3 border-y border-blue-200">
                                            <span className="text-[10px] font-black text-[#006ACB] uppercase tracking-[0.2em] flex items-center gap-2"> Alunos </span>
                                        </div>
                                        {searchResultStudents.map(aluno => (
                                            <div key={aluno._id} onClick={() => navigate(`/student/${aluno._id}`)} className="flex items-center gap-3 p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-none">
                                                <Avatar name={aluno.name} image={aluno.profileImage} size="sm" />
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[#003465] text-xs">{aluno.name}</span>
                                                    <span className="text-gray-400 text-[10px] uppercase font-bold">{aluno.course}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/** CATEGORIA: PROJETOS **/}
                                {searchResultProjects.length > 0 && (
                                    <div>
                                        <div className="bg-blue-50 px-5 py-3 border-y border-blue-200">
                                            <span className="text-[10px] font-black text-[#006ACB] uppercase tracking-[0.2em] flex items-center gap-2"> Projetos </span>
                                        </div>
                                        {searchResultProjects.map(proj => (
                                            <div key={proj._id} onClick={() => navigate(`/project/${proj._id}`)} className="flex items-center gap-3 p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-none">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[#003465] text-xs">{proj.title}</span>
                                                    <span className="text-gray-400 text-[9px] uppercase font-black">Tags: <span className="text-blue-400">{proj.tags?.join(', ')}</span></span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {searchResultStudents.length === 0 && searchResultProjects.length === 0 && (
                                    <div className="p-10 text-center text-gray-400 text-xs italic">Nenhum resultado encontrado...</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex-shrink-0 relative" ref={menuRef}>
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}>
                            <div className="hidden md:flex flex-col items-end mr-1">
                                <span className="text-[9px] font-black text-[#006ACB] uppercase tracking-widest leading-none">Online</span>
                                <span className="text-[#003465] font-bold text-xs">{user.name.split(' ')[0]}</span>
                            </div>
                            <Avatar name={user.name} image={user.profileImage} size="md" className={`border-2 transition-all ${isAccountMenuOpen ? 'border-[#006ACB] scale-105 shadow-lg' : 'border-gray-200 group-hover:border-[#006ACB]'}`} />
                        </div>
                        {isAccountMenuOpen && (
                            <div className="absolute right-0 mt-4 w-72 bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,52,101,0.15)] border border-gray-100 py-6 z-[1100] animate-in fade-in slide-in-from-top-3 duration-200">
                                <div className="px-8 pb-4 border-b border-gray-50 flex flex-col items-center text-center">
                                    <p className="text-[#006ACB] text-[10px] font-black uppercase tracking-[0.2em] mb-4">Conta AcadeMe</p>
                                    <Avatar name={user.name} image={user.profileImage} size="lg" className="border-4 border-blue-50 p-0.5 mb-3" />
                                    <p className="text-[#003465] font-black text-lg tracking-tighter leading-tight truncate w-full">{user.name}</p>
                                    <p className="text-gray-400 text-xs truncate w-full">{user.email}</p>
                                </div>
                                <div className="pt-4 px-2 text-left">
                                    <button 
                                        onClick={() => navigate(user?.role === 'professor' ? '/professor-profile' : '/Profile')} 
                                        className="w-full flex items-center gap-4 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-[#006ACB] rounded-xl transition-all group"
                                    >
                                        Meu Perfil
                                    </button>
                                    <div className="my-2 border-t border-gray-50 mx-4" />
                                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all">Sair da conta</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/** --- MODAL DELETAR --- **/}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-10 max-w-sm w-[90%] shadow-2xl flex flex-col items-center text-center border border-gray-100">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6"><Icon iconCenter="trash" className="w-8 h-8" /></div>
                        <h3 className="text-2xl font-black text-[#003465] uppercase tracking-tighter">Excluir Projeto?</h3>
                        <p className="text-gray-500 text-sm my-4 font-medium">Esta ação não pode ser desfeita e removerá o trabalho do seu portfólio.</p>
                        <div className="flex flex-col w-full gap-3 mt-4">
                            <Button onClick={confirmDelete} disabled={isDeleting} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-full shadow-lg shadow-red-100">{isDeleting ? "Excluindo..." : "Sim, Excluir"}</Button>
                            <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 font-bold py-2 text-xs uppercase tracking-widest hover:text-gray-600 transition-colors">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="profile-section flex flex-col md:flex-row flex-grow">
                {/** --- SIDEBAR --- **/}
                <div className="profile-sidebar hidden md:flex flex-col bg-gradient-to-b from-[#003465] to-[#006ACB] w-full min-w-80 md:w-[350px] shrink-0 p-8 text-white shadow-2xl z-20">
                    <div className="profile-header flex flex-col items-center">
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                        <div className="relative group mt-6">
                            <Avatar name={user.name} image={user.profileImage} size="xl" className="border-4 border-white/20 p-1 cursor-pointer hover:scale-105 transition-transform shadow-2xl" onClick={() => fileInputRef.current?.click()} />
                        </div>
                        <h1 className="profile-name font-black mt-6 text-center text-2xl tracking-tighter leading-tight">{user.name}</h1>
                        <p className="text-blue-100/70 text-center text-sm mb-6 font-medium">{user.email}</p>
                        <div className="w-full border-b border-white/10 my-4" />
                        <div className="w-full mb-6 text-left">
                            <label className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Curso</label>
                            <p className="text-white mt-2 font-bold text-sm leading-snug">{user.course}</p>
                        </div>
                        <div className="w-full border-b border-white/10 my-4" />
                        <div className="w-full group text-left">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Biografia</label>
                                {!isEditingBio ? (
                                    <button onClick={() => setIsEditingBio(true)} className="opacity-0 group-hover:opacity-100 transition text-[10px] font-bold underline text-blue-200 hover:text-white">Editar</button>
                                ) : (
                                    <button onClick={async () => { await handleUpdateProfile({ bio: tempBio }); setIsEditingBio(false); }} className="text-[10px] font-bold text-green-300 hover:text-green-200">Salvar</button>
                                )}
                            </div>
                            {isEditingBio ? (
                                <textarea className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none h-24 italic resize-none" value={tempBio} onChange={(e) => setTempBio(e.target.value)} />
                            ) : (
                                <p className="text-white text-sm italic leading-relaxed opacity-90">{user.bio || "Escreva uma breve biografia..."}</p>
                            )}
                        </div>
                        <div className="w-full border-b border-white/10 my-6" />
                        <div className="interest-area w-full text-left">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-black text-white text-[11px] uppercase tracking-widest">Interesses</h2>
                                <button onClick={() => { setIsEditingInterests(!isEditingInterests); setInterestSearch(""); }} className="text-[10px] font-bold underline text-blue-200 hover:text-white">{isEditingInterests ? "Pronto" : "Gerenciar"}</button>
                            </div>

                            {/** DROPDOWN DE INTERESSES (SIDEBAR) **/}
                            {isEditingInterests && (
                                <div className="mb-4 relative">
                                    <input 
                                        type="text" 
                                        placeholder="Pesquisar interesse..." 
                                        className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-2 text-[10px] text-white outline-none focus:bg-white/20 transition-all placeholder:text-white/40"
                                        value={interestSearch}
                                        onChange={(e) => setInterestSearch(e.target.value)}
                                    />
                                    {interestSearch && availableInterests.length > 0 && (
                                        <div className="absolute top-full mt-2 left-0 w-full bg-[#001a33] rounded-xl shadow-2xl z-[500] border border-white/10 overflow-hidden max-h-48 overflow-y-auto">
                                            {availableInterests.map(opt => (
                                                <div key={opt} onClick={() => addInterest(opt)} className="px-4 py-3 text-[10px] font-bold text-white hover:bg-white/10 cursor-pointer uppercase transition-colors">+ {opt}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2 mb-6">
                                {user.interests.map((interest, i) => (
                                    <div key={i} className={`flex items-center gap-2 text-[10px] px-3 py-1.5 rounded-full uppercase font-bold border transition-all ${isEditingInterests ? "bg-white text-[#003465] border-white animate-pulse shadow-xl scale-105" : "bg-white/10 text-white border-white/10"}`}>
                                        {interest}
                                        {isEditingInterests && <button onClick={() => removeInterest(interest)} className="hover:text-red-500 transition-colors bg-gray-100 rounded-full w-4 h-4 flex items-center justify-center text-[8px] text-[#003465]">✕</button>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/** --- SEÇÃO PROJETOS --- **/}
                <div className="projects-section flex flex-col h-auto w-full bg-[#F8FAFC] p-8 md:p-12 lg:p-16 overflow-y-auto">
                    
                    <div className="projects-filters flex flex-col lg:flex-row items-center justify-between w-full mb-10 gap-6">
                        <div className="flex-1 max-w-2xl w-full">
                            <TextBar 
                                type='search' 
                                placeholder='O que você quer encontrar no seu portfólio?'                                 
                                className="bg-white shadow-sm text-gray-800 font-medium rounded-2xl h-14"
                                value={projectSearchTerm}
                                onChange={(e: any) => setProjectSearchTerm(e.target.value || "")}
                            />
                        </div>

                        <div className="flex items-center gap-4 w-full lg:w-auto justify-center lg:justify-end">
                            
                            {/** MENU DE CONVITES **/}
                            <div className="relative" ref={inviteMenuRef}>
                                <button 
                                    onClick={() => setIsInviteMenuOpen(!isInviteMenuOpen)}
                                    className={`relative p-3 rounded-full transition-all flex items-center justify-center ${isInviteMenuOpen ? 'bg-blue-100 text-blue-600 shadow-inner' : 'bg-white text-gray-400 hover:bg-gray-100 shadow-sm border border-gray-100'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                    </svg>
                                    {invites.length > 0 && (
                                        <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-bounce">{invites.length}</span>
                                    )}
                                </button>

                                {isInviteMenuOpen && (
                                    <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-[1001] animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-4 border-b border-gray-50 bg-gray-50/50 text-left">
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Convites de Projeto</h3>
                                        </div>
                                        <div className="max-h-72 overflow-y-auto text-left">
                                            {invites.length > 0 ? (
                                                invites.map(invite => {
                                                    const sender = invite.students?.find((s: any) => s.status === 'accepted')?.student;
                                                    return (
                                                        <div key={invite._id} className="p-4 border-b border-gray-50 last:border-none flex flex-col gap-3">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar name={sender?.name || "A"} image={sender?.profileImage} size="sm" />
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-bold text-[#003465]">{invite.title}</span>
                                                                    <span className="text-[10px] text-gray-400 font-medium">Convidado por {sender?.name.split(' ')[0]}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button onClick={() => handleRespondInvite(invite._id, 'accepted')} className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg text-[10px] font-bold uppercase hover:bg-blue-700 transition">Aceitar</button>
                                                                <button onClick={() => handleRespondInvite(invite._id, 'declined')} className="px-3 bg-red-100 text-red-500 py-1.5 rounded-lg text-[10px] font-bold uppercase hover:bg-red-200 transition">×</button>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="p-8 text-center text-gray-400 text-xs italic font-medium">Nenhuma nova notificação</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Button shape="pill" className="p-4 px-8 w-full lg:w-auto justify-center shadow-lg hover:bg-black transition-all uppercase tracking-[0.2em] font-black text-xs h-14" iconRight='add' onClick={() => navigate('/upload')}>
                                Novo Trabalho
                            </Button>
                        </div>
                    </div>

                    <div className="projects-list w-full max-w-none mx-auto space-y-8 pb-20">
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map((proj) => (
                                <ProjectCard
                                    key={proj._id}
                                    id={proj._id}
                                    title={proj.title}
                                    description={proj.description}
                                    tags={proj.tags || ["AcadeMe"]}
                                    date={new Date(proj.createdAt).toLocaleDateString()}
                                    imageUrl={proj.imageUrl || logoBlockchain} 
                                    onDelete={() => openDeleteModal(proj._id)}
                                    onEdit={(id) => navigate(`/upload?edit=${id}`)}
                                    onView={(id) => navigate(`/project/${id}`)}
                                />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 opacity-30 border-2 border-dashed border-gray-300 rounded-[32px] bg-white/50 text-center">
                                <div className="p-6 bg-white rounded-full shadow-sm mb-6">
                                    <Icon iconCenter="add" className="w-16 h-16 mb-4 text-gray-400" />
                                </div>
                                <p className="italic font-bold text-[#003465] text-lg uppercase tracking-tighter">
                                    {projectSearchTerm ? "Sem resultados para a busca." : "Nenhum projeto publicado ainda."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
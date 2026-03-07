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
    const navigate = useNavigate();
    
    const [user, setUser] = useState<UserData | null>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [alunos, setAlunos] = useState<any[]>([]); 

    const [isEditingBio, setIsEditingBio] = useState(false);
    const [tempBio, setTempBio] = useState("");
    const [isEditingInterests, setIsEditingInterests] = useState(false);
    const [searchTerm, setSearchTerm] = useState(""); 
    const [projectSearchTerm, setProjectSearchTerm] = useState(""); 

    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false); 

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

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

        fetch(`${apiUrl}/students/${parsedUser._id}/projects`)
            .then(res => res.json())
            .then(data => setProjects(data))
            .catch(() => toast.error("Erro ao carregar projetos."));

        fetch(`${apiUrl}/students`)
            .then(res => res.json())
            .then(data => setAlunos(data));
    }, [navigate, apiUrl]);

    const handleLogout = () => {
        localStorage.removeItem('@AcadeMe:user');
        toast.info("Até logo!");
        navigate('/');
    };

    const filteredAlunos = useMemo(() => {
        if (!searchTerm) return [];
        return alunos.filter(aluno => 
            aluno.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            aluno.course.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [alunos, searchTerm]);

    const filteredProjects = useMemo(() => {
        return projects.filter(proj => 
            proj.title.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
            proj.description.toLowerCase().includes(projectSearchTerm.toLowerCase())
        );
    }, [projects, projectSearchTerm]);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return [];
        return INTEREST_OPTIONS.filter(option => 
            option.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !(user?.interests || []).includes(option)
        );
    }, [searchTerm, user?.interests]);

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
        } catch (err) {
            toast.error('Erro de conexão.');
        }
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
        const currentInterests = user?.interests || [];
        if (currentInterests.length >= 5) {
            toast.warning("Limite de 5 interesses atingido.");
            return;
        }
        handleUpdateProfile({ interests: [...currentInterests, interest] }, true);
        setSearchTerm("");
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
            <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-md z-[1000] py-3  border-b border-gray-100">            
                <div className="w-full flex items-center justify-between px-6 md:px-12">
                    
                    <div className="flex-shrink-0">
                        <img src={coloredLogo} alt="logo" className="h-10 cursor-pointer" onClick={() => navigate('/')} />
                    </div>
                    
                    <div className="flex-1 max-w-2xl mx-8 relative">
                        <TextBar 
                            variant="default" 
                            placeholder="Pesquisar outros talentos..." 
                            iconLeft="search" 
                            hideIconsOnInput 
                            value={searchTerm}
                            onChange={(e: any) => {
                                setSearchTerm(e.target.value);
                                setIsDropdownVisible(true);
                            }}
                            onBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)}
                        />

                        {searchTerm && isDropdownVisible && !isEditingInterests && (
                            <div className="absolute top-full left-0 w-full bg-white shadow-2xl rounded-b-xl mt-1 border border-gray-100 overflow-hidden text-left">
                                {filteredAlunos.length > 0 ? (
                                    filteredAlunos.map(aluno => (
                                        <div key={aluno._id} onClick={() => navigate(`/student/${aluno._id}`)} className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer border-b last:border-none">
                                            {/* Alteração: Avatar na busca de alunos */}
                                            <Avatar name={aluno.name} image={aluno.profileImage} size="sm" className="border" />
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

                    <div className="flex-shrink-0 relative" ref={menuRef}>
                        <div 
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                        >
                            <div className="hidden md:flex flex-col items-end mr-1">
                                <span className="text-[9px] font-black text-[#006ACB] uppercase tracking-widest leading-none">Online</span>
                                <span className="text-[#003465] font-bold text-xs">{user.name.split(' ')[0]}</span>
                            </div>
                            {/* Alteração: Avatar no Header principal */}
                            <Avatar 
                                name={user.name} 
                                image={user.profileImage} 
                                size="md" 
                                className={`border-2 ${isAccountMenuOpen ? 'border-[#006ACB] shadow-lg scale-105' : 'border-gray-200 group-hover:border-[#006ACB]'}`} 
                            />
                        </div>

                        {isAccountMenuOpen && (
                            <div className="absolute right-0 mt-4 w-72 bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,52,101,0.15)] border border-gray-100 py-6 z-[1100] animate-in fade-in slide-in-from-top-3 duration-200">
                                <div className="px-8 pb-4 border-b border-gray-50 flex flex-col items-center text-center">
                                    <p className="text-[#006ACB] text-[10px] font-black uppercase tracking-[0.2em] mb-4">Conta AcadeMe</p>
                                    {/* Alteração: Avatar no Menu Dropdown */}
                                    <Avatar name={user.name} image={user.profileImage} size="lg" className="border-4 border-blue-50 p-0.5 mb-3" />
                                    <p className="text-[#003465] font-black text-lg tracking-tighter leading-tight truncate w-full">{user.name}</p>
                                    <p className="text-gray-400 text-xs truncate w-full">{user.email}</p>
                                </div>
                                <div className="pt-4 px-2 text-left">
                                    <button onClick={() => { setIsAccountMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-full flex items-center gap-4 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-[#006ACB] rounded-xl transition-all group">
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
                </div>
            </header>

            {/* MODAL DE EXCLUSÃO */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-10 max-w-sm w-[90%] shadow-2xl flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                            <Icon iconCenter="trash" className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black text-[#003465] uppercase tracking-tighter">Excluir Projeto?</h3>
                        <p className="text-gray-500 text-sm my-4">Esta ação não pode ser desfeita.</p>
                        <div className="flex flex-col w-full gap-3 mt-4">
                            <Button onClick={confirmDelete} disabled={isDeleting} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-full">
                                {isDeleting ? "Excluindo..." : "Sim, Excluir"}
                            </Button>
                            <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 font-bold py-2 text-xs uppercase">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="profile-section flex flex-col md:flex-row flex-grow">
                {/* Sidebar */}
                <div className="profile-sidebar hidden md:flex flex-col bg-gradient-to-b from-[#003465] to-[#006ACB] w-full min-w-80 md:w-[350px] shrink-0 p-8 text-white shadow-2xl">
                    <div className="profile-header flex flex-col items-center">
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                        <div className="relative group">
                            {/* Alteração: Avatar na Sidebar (Foto Principal) */}
                            <Avatar 
                                name={user.name} 
                                image={user.profileImage} 
                                size="xl" 
                                className="border-4 border-white/30 p-1 mt-6 cursor-pointer hover:scale-105 shadow-xl"
                                onClick={() => fileInputRef.current?.click()} 
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mt-6">
                                <span className="bg-black/50 text-white text-[8px] px-2 py-1 rounded-full uppercase font-bold">Trocar Foto</span>
                            </div>
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
                                    <button onClick={async () => { await handleUpdateProfile({ bio: tempBio }); setIsEditingBio(false); }} className="text-[10px] font-bold text-green-300">Salvar</button>
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
                                <button 
                                    onClick={() => { 
                                        setIsEditingInterests(!isEditingInterests); 
                                        setSearchTerm(""); 
                                    }} 
                                    className="text-[10px] font-bold underline text-blue-200 hover:text-white"
                                >
                                    {isEditingInterests ? "Pronto" : "Gerenciar"}
                                </button>
                            </div>

                            {isEditingInterests && (
                                <div className="relative mb-4 animate-in fade-in slide-in-from-top-1">
                                    <input 
                                        type="text"
                                        placeholder="Procurar interesse..."
                                        className="w-full bg-white/10 border border-white/20 rounded-xl p-2.5 text-xs text-white placeholder:text-blue-200/50 focus:outline-none focus:border-white/50 transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        autoFocus
                                    />
                                    
                                    {searchTerm && filteredOptions.length > 0 && (
                                        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
                                            {filteredOptions.slice(0, 6).map(option => (
                                                <div 
                                                    key={option}
                                                    onClick={() => addInterest(option)}
                                                    className="px-4 py-2.5 text-[11px] font-black text-[#003465] hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-none uppercase flex justify-between items-center group"
                                                >
                                                    {option}
                                                    <span className="text-blue-400 opacity-0 group-hover:opacity-100">+</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2 mb-6">
                                {user.interests.map((interest, i) => (
                                    <div 
                                        key={i} 
                                        className={`flex items-center gap-2 text-[10px] px-3 py-1.5 rounded-full uppercase font-bold border transition-all ${
                                            isEditingInterests 
                                            ? "bg-white text-[#003465] border-white animate-pulse shadow-md" 
                                            : "bg-white/20 text-white border-white/10"
                                        }`}
                                    >
                                        {interest}
                                        {isEditingInterests && (
                                            <button 
                                                onClick={() => removeInterest(interest)} 
                                                className="hover:text-red-500 transition-colors bg-gray-100 rounded-full w-4 h-4 flex items-center justify-center text-[8px]"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {user.interests.length === 0 && !isEditingInterests && (
                                    <p className="text-blue-200/40 text-[10px] italic">Nenhum interesse selecionado.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="projects-section flex flex-col h-auto w-full bg-gray-50 p-6 md:p-12 overflow-y-auto">
                    <div className="projects-filters flex flex-col lg:flex-row items-center justify-between w-full mb-10 gap-6">
                        <div className="w-full lg:w-[400px]">                                                
                            <TextBar 
                                type='search' 
                                placeholder='O que você quer encontrar no seu portfólio?'                                 
                                className="bg-white shadow-sm text-gray-800 font-medium rounded-full"
                                value={projectSearchTerm}
                                onChange={(e: any) => setProjectSearchTerm(e.target.value || "")}
                            />
                        </div>
                        <Button shape="pill" className="p-4 px-8 w-full lg:w-auto justify-center shadow-lg hover:bg-black transition-all uppercase tracking-widest font-black text-xs" iconRight='add' onClick={() => navigate('/upload')}>
                            Novo Trabalho
                        </Button>
                    </div>

                    <div className="projects-list w-full space-y-8 pb-10">
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
                                <Icon iconCenter="add" className="w-16 h-16 mb-4 text-gray-400" />
                                <p className="italic font-bold text-[#003465] text-lg uppercase tracking-tighter">
                                    {projectSearchTerm ? "Sem resultados para a busca." : "Nenhum projeto publicado."}
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
/* eslint-disable jsx-a11y/alt-text */
import React, { useRef, useEffect, useState } from 'react';
import coloredLogo from '../assets/colored-logo.svg'; 
import logoBlockchain from '../assets/logoBlockchain.svg'; 
import { useNavigate } from 'react-router-dom';
import { TextBar } from '../components/TextBar';
import { Icon } from '../components/Icon';
import { toast } from 'react-toastify';
import Avatar from '../components/Avatar';
import ProjectCard from '../components/ProjectCard';
import ValidatedBadge from '../components/ValidatedBadge';
import InviteMenu from '../components/InviteMenu';
import AppHeader from '../components/AppHeader';
import EmptyState from '../components/EmptyState';
import { ProfessorSummary, ProjectRecord, SearchResults } from '../types/models';
import { isProjectValidated } from '../utils/project';

const EXPERTISE_OPTIONS = [
    "Engenharia de Software", "Banco de Dados", "Redes de Computadores", 
    "Inteligência Artificial", "Sistemas Distribuídos", "Interação Humano-Computador", 
    "Matemática Discreta", "Algoritmos", "Gestão de Projetos", "Empreendedorismo Inovador"
].sort();

const ProfileProf: React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement>(null); 
    const menuRef = useRef<HTMLDivElement>(null); 
    const inviteMenuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    
    const [user, setUser] = useState<ProfessorSummary | null>(null);
    const [endorsedProjects, setEndorsedProjects] = useState<ProjectRecord[]>([]); 
    const [invites, setInvites] = useState<ProjectRecord[]>([]);
    
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [tempBio, setTempBio] = useState("");
    
    const [isEditingExpertise, setIsEditingExpertise] = useState(false);
    const [expertiseSearch, setExpertiseSearch] = useState("");

    const [searchTerm, setSearchTerm] = useState(""); 
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [searchResultStudents, setSearchResultStudents] = useState<SearchResults['students']>([]);
    const [searchResultProjects, setSearchResultProjects] = useState<SearchResults['projects']>([]);

    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false); 
    const [isInviteMenuOpen, setIsInviteMenuOpen] = useState(false);

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsAccountMenuOpen(false);
            }
            if (inviteMenuRef.current && !inviteMenuRef.current.contains(event.target as Node)) {
                setIsInviteMenuOpen(false);
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
        
        if (parsedUser.role !== 'professor') {
            navigate('/profile');
            return;
        }

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

        fetch(`${apiUrl}/professors/${parsedUser._id}/projects`)
            .then(res => res.json())
            .then((data: ProjectRecord[]) => setEndorsedProjects(data))
            .catch(() => console.error("Erro ao carregar projetos chancelados."));

        fetch(`${apiUrl}/professors/${parsedUser._id}/invites`)
            .then(res => res.json())
            .then((data: ProjectRecord[]) => setInvites(data))
            .catch(() => console.error("Erro ao carregar convites de validação."));

    }, [navigate, apiUrl]);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResultStudents([]);
            setSearchResultProjects([]);
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            fetch(`${apiUrl}/search?q=${encodeURIComponent(searchTerm)}`)
                .then(res => res.json())
                .then((data: SearchResults) => {
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

    const handleUpdateProfile = async (updates: Partial<ProfessorSummary>, silent = false) => {
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
                if (!silent) toast.success('Perfil atualizado.');
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
                toast.success('Foto atualizada.');
            };
        }
    };

    const handleRespondInvite = async (projectId: string, status: 'accepted' | 'declined') => {
        if (!user) return;

        try {
            const response = await fetch(`${apiUrl}/projects/${projectId}/respond-professor-invite`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ professorId: user._id, status })
            });

            const data = await response.json();

            if (response.ok) {
                setInvites(prev => prev.filter((invite) => invite._id !== projectId));
                toast.success(status === 'accepted' ? 'Convite aceito. Você já pode validar o projeto.' : 'Convite recusado.');
                if (status === 'accepted') {
                    navigate(`/project/${projectId}`);
                }
            } else {
                toast.error(data.error || 'Não foi possível responder ao convite.');
            }
        } catch (err) {
            toast.error('Erro de conexão.');
        }
    };

    const inviteMenuItems = invites.map((invite) => ({
        id: invite._id,
        title: invite.title,
        subtitle: 'Convite para validação docente',
        avatarName: invite.title || 'P',
        avatarImage: invite.imageUrl
    }));

    if (!user) return <div className="flex h-screen items-center justify-center font-bold text-[#003465]">Carregando Painel Docente...</div>;

    return (
        <div className="ProfessorProfile flex flex-col min-h-screen bg-gray-50 relative pt-20">
            
            <AppHeader
                searchTerm={searchTerm}
                isDropdownVisible={isDropdownVisible}
                searchResultStudents={searchResultStudents}
                searchResultProjects={searchResultProjects}
                onSearchChange={(value) => {
                    setSearchTerm(value);
                    setIsDropdownVisible(true);
                }}
                onSearchBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)}
                onStudentSelect={(studentId) => navigate(`/student/${studentId}`)}
                onProjectSelect={(projectId) => navigate(`/project/${projectId}`)}
                currentUser={user}
                menuRef={menuRef}
                isAccountMenuOpen={isAccountMenuOpen}
                onToggleAccountMenu={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                onNavigateHome={() => navigate('/')}
                onNavigateProfile={() => {
                    setIsAccountMenuOpen(false);
                    navigate('/professor-profile');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onLogout={handleLogout}
                inviteMenu={{
                    menuRef: inviteMenuRef,
                    title: 'Convites de Validação',
                    emptyMessage: 'Nenhuma nova notificação',
                    isOpen: isInviteMenuOpen,
                    count: invites.length,
                    items: inviteMenuItems,
                    onToggle: () => setIsInviteMenuOpen(!isInviteMenuOpen),
                    onAccept: (projectId) => handleRespondInvite(projectId, 'accepted'),
                    onDecline: (projectId) => handleRespondInvite(projectId, 'declined')
                }}
            />
            
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
                                        {isEditingExpertise && <button onClick={() => removeExpertise(exp)} className="hover:text-red-500 transition-colors bg-gray-100 rounded-full w-4 h-4 flex items-center justify-center text-[8px] text-[#003465]">X</button>}
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
                                    date={new Date(proj.createdAt || Date.now()).toLocaleDateString()}
                                    imageUrl={proj.imageUrl || logoBlockchain} 
                                    isValidated={isProjectValidated(proj)}
                                    onView={(id) => navigate(`/project/${id}`)}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="Nenhum chancelamento"
                            description="Use a busca no topo para localizar trabalhos e registrar sua validação."
                            icon="search"
                            className="py-20"
                        />
                    )}

                </div>
            </div>
        </div>
    );
};

export default ProfileProf;



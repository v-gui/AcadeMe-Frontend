/* eslint-disable jsx-a11y/alt-text */
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Button } from '../components/Button';
import ProjectCard from '../components/ProjectCard';
import { useNavigate } from 'react-router-dom';
import logoBlockchain from '../assets/logoBlockchain.svg';
import { TextBar } from '../components/TextBar';
import { Icon } from '../components/Icon';
import { toast } from 'react-toastify';
import Avatar from '../components/Avatar';
import AppHeader from '../components/AppHeader';
import EmptyState from '../components/EmptyState';
import { ProjectRecord, SearchResults, StudentSummary } from '../types/models';
import { canDeleteProject, countAcceptedMembers, getProjectNavigationPath, isAcceptedProjectMember, isProjectAdmin, isProjectValidated, withViewerQuery } from '../utils/project';
import useInviteMenu from '../hooks/useInviteMenu';

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
    
    const [user, setUser] = useState<StudentSummary | null>(null);
    const [projects, setProjects] = useState<ProjectRecord[]>([]);

    // Estados de edição do Perfil
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [tempBio, setTempBio] = useState("");
    const [isEditingInterests, setIsEditingInterests] = useState(false);
    const [interestSearch, setInterestSearch] = useState(""); // Novo: específico para sidebar

    // --- ESTADOS DA BUSCA GLOBAL (HEADER) ---
    const [searchTerm, setSearchTerm] = useState(""); 
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [searchResultStudents, setSearchResultStudents] = useState<SearchResults['students']>([]);
    const [searchResultProfessors, setSearchResultProfessors] = useState<SearchResults['professors']>([]);
    const [searchResultProjects, setSearchResultProjects] = useState<SearchResults['projects']>([]);

    const [projectSearchTerm, setProjectSearchTerm] = useState(""); 
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false); 

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    const { inviteMenu } = useInviteMenu(user, {
        onSelect: (projectId) => {
            navigate(`/project/${projectId}`);
        },
        onAccepted: async () => {
            if (user?._id) {
                fetchProjects(user._id, user);
            }
        }
    });

    const fetchProjects = (userId: string, viewer = user) => {
        fetch(withViewerQuery(`${apiUrl}/students/${userId}/projects`, viewer))
            .then(res => res.json())
            .then((data: ProjectRecord[]) => setProjects(data))
            .catch(() => toast.error("Erro ao carregar projetos."));
    };

    // Fecha menus ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsAccountMenuOpen(false);
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

        fetchProjects(parsedUser._id, parsedUser);
    }, [navigate, apiUrl]);

    // --- LÓGICA DE BUSCA GLOBAL (HEADER) ---
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResultStudents([]);
            setSearchResultProfessors([]);
            setSearchResultProjects([]);
            return;
        }
        const delayDebounceFn = setTimeout(() => {
            fetch(withViewerQuery(`${apiUrl}/search?q=${encodeURIComponent(searchTerm)}`, user))
                .then(res => res.json())
                .then((data: SearchResults) => {
                    setSearchResultStudents(data.students || []);
                    setSearchResultProfessors(data.professors || []);
                    setSearchResultProjects(data.projects || []);
                })
                .catch(err => console.error("Erro na busca:", err));
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, apiUrl, user]);

    const handleLogout = () => {
        localStorage.removeItem('@AcadeMe:user');
        toast.info("Até logo.");
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

    const handleUpdateProfile = async (updates: Partial<StudentSummary>, silent = false) => {
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
                if (!silent) toast.success('Perfil atualizado.');
            }
        } catch (err) { toast.error('Erro de conexão.'); }
    };

    const openDeleteModal = (project: ProjectRecord) => {
        if (!canDeleteProject(project, user?._id)) {
            toast.warn(
                !isProjectAdmin(project, user?._id)
                    ? 'Apenas o admin do projeto pode excluir o trabalho.'
                    : 'Projetos com mais de um membro aceito nao podem ser excluidos. Os integrantes devem sair ate restar apenas uma pessoa.'
            );
            return;
        }

        setIdToDelete(project._id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!idToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`${apiUrl}/projects/${idToDelete}?requesterStudentId=${user?._id}`, { method: 'DELETE' });
            const data = await res.json().catch(() => null);

            if (res.ok) {
                setProjects(projects.filter(p => p._id !== idToDelete));
                toast.info('Projeto removido.');
                setShowDeleteModal(false);
            } else {
                toast.error(data?.error || 'Nao foi possivel excluir o projeto.');
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
                toast.success('Foto atualizada!');
            };
        }
    };

    if (!user) return <div className="flex h-screen items-center justify-center font-bold text-[#003465]">Carregando Dashboard...</div>;

    return (
        <div className="Profile flex flex-col min-h-screen bg-gray-50 relative pt-20">
            
            <AppHeader
                searchTerm={searchTerm}
                isDropdownVisible={isDropdownVisible}
                searchResultStudents={searchResultStudents}
                searchResultProfessors={searchResultProfessors}
                searchResultProjects={searchResultProjects}
                onSearchChange={(value) => { setSearchTerm(value); setIsDropdownVisible(true); }}
                onSearchBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)}
                onStudentSelect={(studentId) => navigate(`/student/${studentId}`)}
                onProfessorSelect={(professorId) => navigate(`/professor/${professorId}`)}
                onProjectSelect={(project) => navigate(getProjectNavigationPath(project, user?._id, user?.role))}
                currentUser={user}
                menuRef={menuRef}
                isAccountMenuOpen={isAccountMenuOpen}
                onToggleAccountMenu={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                onNavigateHome={() => navigate('/')}
                onNavigateProfile={() => navigate('/profile')}
                onLogout={handleLogout}
                inviteMenu={inviteMenu}
            />

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
                                        {isEditingInterests && <button onClick={() => removeInterest(interest)} className="hover:text-red-500 transition-colors bg-gray-100 rounded-full w-4 h-4 flex items-center justify-center text-[8px] text-[#003465]">X</button>}
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
                            
                            <Button shape="pill" className="p-4 px-8 w-full lg:w-auto justify-center shadow-lg hover:bg-black transition-all uppercase tracking-[0.2em] font-black text-xs h-14" iconRight='add' onClick={() => navigate('/upload')}>
                                Novo Trabalho
                            </Button>
                        </div>
                    </div>

                    <div className="projects-list w-full max-w-none mx-auto space-y-8 pb-20">
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map((proj) => {
                                const isAdmin = canDeleteProject(proj, user?._id);
                                const acceptedMembersCount = countAcceptedMembers(proj);
                                const canEdit = isAcceptedProjectMember(proj, user?._id);
                                const deleteLocked = !isAdmin;
                                const deleteTitle = deleteLocked
                                    ? acceptedMembersCount > 1
                                        ? 'Exclusao bloqueada: ha mais de um membro aceito'
                                        : 'Exclusao bloqueada: apenas o admin pode excluir'
                                    : 'Excluir projeto';

                                return (
                                    <ProjectCard
                                        key={proj._id}
                                        id={proj._id}
                                        title={proj.title}
                                        description={proj.description}
                                        tags={proj.tags || ["AcadeMe"]}
                                        date={new Date(proj.createdAt || Date.now()).toLocaleDateString()}
                                        imageUrl={proj.imageUrl || logoBlockchain} 
                                        isValidated={isProjectValidated(proj)}
                                        onDelete={() => openDeleteModal(proj)}
                                        isDeleteDisabled={deleteLocked}
                                        deleteTitle={deleteTitle}
                                        onEdit={canEdit ? (id) => navigate(`/upload?edit=${id}`) : undefined}
                                        onView={() => navigate(`/project/${proj._id}`)}
                                    />
                                );
                            })
                        ) : (
                            <EmptyState
                                title={projectSearchTerm ? 'Sem resultados' : 'Nenhum projeto publicado'}
                                description={projectSearchTerm ? 'Tente buscar por outro título ou descrição.' : 'Quando você publicar um trabalho, ele aparecerá aqui.'}
                                icon={projectSearchTerm ? 'search' : 'add'}
                                className="py-24"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;



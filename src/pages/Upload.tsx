/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import './Upload.css';
import logoPlaceholder from '../assets/white-logo.svg'; 
import coloredLogo from '../assets/colored-logo.svg';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';
import { TextBar } from '../components/TextBar';
import { toast } from 'react-toastify';
import Avatar from '../components/Avatar';
import ValidatedBadge from '../components/ValidatedBadge';
import AppHeader from '../components/AppHeader';
import EmptyState from '../components/EmptyState';
import { SearchResults } from '../types/models';
import { getProjectNavigationPath, isProjectValidated, withViewerQuery } from '../utils/project';
import useInviteMenu from '../hooks/useInviteMenu';

interface Aluno {
    _id: string;
    name: string;
    course: string;
    profileImage?: string; 
    role?: string;
}

interface CollaboratorWithStatus {
    student: Aluno;
    status: 'accepted' | 'pending' | 'declined';
}

interface ProfessorData {
    _id: string;
    name: string;
    academicTitle?: string;
    department?: string;
    profileImage?: string;
}

interface InvitedProfessorWithStatus {
    professor: ProfessorData;
    status: 'accepted' | 'pending' | 'declined';
}

const TAG_OPTIONS = [
    "React", "Node.js", "TypeScript", "Python", "Java", "C#", "C++", "Next.js", 
    "Vue.js", "Angular", "Express", "MongoDB", "PostgreSQL", "Firebase", "AWS", 
    "Docker", "Kubernetes", "UI/UX Design", "Figma", "Adobe XD", "Blockchain", 
    "Inteligência Artificial", "Data Science", "Machine Learning", "Mobile Dev", 
    "React Native", "Flutter", "Swift", "Kotlin", "PHP", "Laravel", "Tailwind CSS"
].sort();

const Upload: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit'); 
    const menuRef = useRef<HTMLDivElement>(null);
    const tagDropdownRef = useRef<HTMLDivElement>(null);
    
    const coverInputRef = useRef<HTMLInputElement>(null);
    const fileUploadRef = useRef<HTMLInputElement>(null);
    const posterInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagSearch, setTagSearch] = useState('');
    const [isTagDropdownVisible, setIsTagDropdownVisible] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const [collaborators, setCollaborators] = useState<CollaboratorWithStatus[]>([]); 
    const [teamSearch, setTeamSearch] = useState(''); 
    const [isTeamDropdownVisible, setIsTeamDropdownVisible] = useState(false);
    const [professors, setProfessors] = useState<ProfessorData[]>([]);
    const [invitedProfessors, setInvitedProfessors] = useState<InvitedProfessorWithStatus[]>([]);
    const [professorSearch, setProfessorSearch] = useState('');
    const [isProfessorDropdownVisible, setIsProfessorDropdownVisible] = useState(false);

    const [posters, setPosters] = useState<{url: string, name: string}[]>([]);
    const [files, setFiles] = useState<{name: string, date: string, base64?: string}[]>([]);
    const [references, setReferences] = useState<string[]>([]);
    const [refInput, setRefInput] = useState('');

    // --- ESTADOS PARA A BUSCA GLOBAL NO HEADER ---
    const [alunos, setAlunos] = useState<Aluno[]>([]); // Usado para a lista de convites da equipe
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [searchResultStudents, setSearchResultStudents] = useState<SearchResults['students']>([]);
    const [searchResultProfessors, setSearchResultProfessors] = useState<SearchResults['professors']>([]);
    const [searchResultProjects, setSearchResultProjects] = useState<SearchResults['projects']>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const [isLeavingTeam, setIsLeavingTeam] = useState(false);
    const [showLeaveTeamModal, setShowLeaveTeamModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const { inviteMenu } = useInviteMenu(currentUser, {
        onSelect: (projectId) => {
            navigate(`/project/${projectId}`);
        }
    });
    const acceptedCollaboratorsCount = collaborators.filter((collaborator) => collaborator.status === 'accepted').length;
    const isCurrentUserStudent = currentUser?.role === 'student';
    const acceptedMembersCount = (isCurrentUserStudent && userId ? 1 : 0) + acceptedCollaboratorsCount;
    const canDeleteCurrentProject = Boolean(editId && isCurrentUserStudent && acceptedMembersCount <= 1);
    const invitedProfessorsLabel = invitedProfessors.length > 1 ? 'Docentes Convidados' : 'Docente Convidado';
    const invitedProfessorsCountLabel = `${invitedProfessors.length} ${invitedProfessors.length === 1 ? 'DOCENTE' : 'DOCENTES'}`;

    // Fecha menus ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsAccountMenuOpen(false);
            if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) setIsTagDropdownVisible(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Carregamento de dados
    useEffect(() => {
        const savedUser = localStorage.getItem('@AcadeMe:user');
        let parsedUser: any = null;
        if (savedUser) {
            parsedUser = JSON.parse(savedUser);
            setUserId(parsedUser._id);
            setCurrentUser(parsedUser);
        } else {
            navigate('/login');
            return;
        }

        // Carrega alunos para o campo de convite da equipe
        fetch(`${apiUrl}/students`).then(res => res.json()).then(data => setAlunos(data || []));
        fetch(`${apiUrl}/professors`).then(res => res.json()).then(data => setProfessors(data || []));

        if (editId) {
            if (parsedUser.role !== 'student') {
                toast.error('Apenas alunos da equipe podem editar o projeto.');
                navigate(`/project/${editId}`);
                return;
            }

            fetch(withViewerQuery(`${apiUrl}/projects/${editId}`, parsedUser))
                .then(async res => {
                    const data = await res.json().catch(() => null);
                    if (!res.ok) throw new Error(data?.error || 'Voce nao tem acesso a este projeto.');
                    return data;
                })
                .then(data => {
                    if (!data) return;
                    setTitle(data.title || '');
                    setDescription(data.description || '');
                    if (data.tags) setTags(data.tags);
                    if (data.imageUrl) setImagePreview(data.imageUrl);
                    if (data.posters) setPosters(data.posters);
                    if (data.files) setFiles(data.files);
                    if (data.references) setReferences(data.references);
                    if (data.students) {
                        const savedCurrentUser = JSON.parse(savedUser);
                        const currentUserId = savedCurrentUser._id;
                        const shouldHideCurrentStudent = savedCurrentUser.role === 'student';
                        const others = data.students
                            .filter((s: any) => s.student && (!shouldHideCurrentStudent || s.student._id !== currentUserId))
                            .map((s: any) => ({ student: s.student, status: s.status || 'pending' }));
                        setCollaborators(others);
                    }
                    if (data.invitedProfessors) {
                        const invited = data.invitedProfessors
                            .filter((p: any) => p.professor)
                            .map((p: any) => ({ professor: p.professor, status: p.status || 'pending' }));
                        setInvitedProfessors(invited);
                    }
                })
                .catch((error) => {
                    toast.error(error.message || 'Voce nao tem acesso a este projeto.');
                    navigate('/');
                });
        }
    }, [editId, navigate, apiUrl]);

    // --- LÓGICA DE BUSCA GLOBAL (OMNIBOX) ---
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
                .catch(err => console.error("Erro na busca:", err));
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, apiUrl, currentUser]);

    const teamSearchResults = useMemo(() => {
        if (teamSearch.length < 2) return [];
        return alunos.filter(a => 
            a?.name?.toLowerCase().includes(teamSearch.toLowerCase()) &&
            a?._id !== userId && !collaborators.find(c => c.student?._id === a?._id)
        );
    }, [alunos, teamSearch, userId, collaborators]);

    const filteredTagOptions = useMemo(() => {
        if (!tagSearch) return [];
        return TAG_OPTIONS.filter(option => 
            option.toLowerCase().includes(tagSearch.toLowerCase()) && !tags.includes(option)
        );
    }, [tagSearch, tags]);

    const professorSearchResults = useMemo(() => {
        if (professorSearch.length < 2) return [];
        return professors.filter((p) =>
            p?.name?.toLowerCase().includes(professorSearch.toLowerCase()) &&
            !invitedProfessors.find((i) => i.professor?._id === p?._id)
        );
    }, [professors, professorSearch, invitedProfessors]);

    const handleLogout = () => {
        localStorage.removeItem('@AcadeMe:user');
        setCurrentUser(null);
        toast.info("Sessão encerrada.");
        navigate('/');
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const filesSelect = e.target.files;
        if (filesSelect) {
            const newPosters = await Promise.all(
                Array.from(filesSelect).map(async (file) => ({
                    url: await convertToBase64(file),
                    name: file.name
                }))
            );
            setPosters([...posters, ...newPosters]);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles) {
            const uploadedFiles = await Promise.all(
                Array.from(selectedFiles).map(async (file) => ({
                    name: file.name,
                    date: new Date().toLocaleDateString(),
                    base64: await convertToBase64(file)
                }))
            );
            setFiles([...files, ...uploadedFiles]);
            toast.success("Documentação anexada!");
        }
    };

    const handleDownload = (base64: string, name: string) => {
        const link = document.createElement("a");
        link.href = base64;
        link.download = name;
        link.click();
    };

    const handleAddReference = () => {
        if (refInput.trim()) {
            setReferences([...references, refInput.trim()]);
            setRefInput('');
        }
    };

    const addTag = (tag: string) => {
        if (tags.length >= 5) { toast.warning("Máximo de 5 tecnologias."); return; }
        setTags([...tags, tag]); setTagSearch(""); setIsTagDropdownVisible(false);
    };

    const handleRemoveCollaborator = (collaboratorId?: string, status?: CollaboratorWithStatus['status']) => {
        if (!collaboratorId) return;

        if (status === 'accepted') {
            toast.info('Membros aceitos precisam sair do projeto pela propria pagina do projeto.');
            return;
        }

        setCollaborators(collaborators.filter((item) => item.student?._id !== collaboratorId));
    };

    const handleLeaveTeam = async () => {
        if (!currentUser || currentUser.role !== 'student' || !editId) return;

        setIsLeavingTeam(true);

        try {
            const response = await fetch(`${apiUrl}/projects/${editId}/leave`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: currentUser._id })
            });

            const data = await response.json().catch(() => null);

            if (response.ok) {
                toast.success(data?.message || 'Voce saiu da equipe.');
                setShowLeaveTeamModal(false);
                navigate('/profile');
            } else {
                toast.error(data?.error || 'Nao foi possivel sair da equipe.');
            }
        } catch (error) {
            toast.error('Erro de conexao.');
        } finally {
            setIsLeavingTeam(false);
        }
    };

    const openDeleteModal = () => {
        if (!canDeleteCurrentProject) {
            toast.warn('Projetos com mais de um membro aceito nao podem ser excluidos. Cada integrante deve sair do projeto ate restar apenas uma pessoa.');
            return;
        }

        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!editId || !canDeleteCurrentProject) return;

        setIsDeleting(true);

        try {
            const response = await fetch(`${apiUrl}/projects/${editId}`, { method: 'DELETE' });
            const data = await response.json().catch(() => null);

            if (response.ok) {
                toast.info('Projeto removido.');
                setShowDeleteModal(false);
                navigate('/profile');
            } else {
                toast.error(data?.error || 'Nao foi possivel excluir o projeto.');
            }
        } catch (error) {
            toast.error('Erro de conexao.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSaveProject = async () => {
        if (!title.trim() || !description.trim()) {
            toast.warn("Título e descrição são obrigatórios.");
            return;
        }
        setLoading(true);
        const studentsData = [
            ...(isCurrentUserStudent ? [{ student: userId, status: 'accepted' }] : []),
            ...collaborators.map(c => ({ student: c.student?._id, status: c.status }))
        ].filter((item) => item.student);
        const invitedProfessorsData = invitedProfessors.map((p) => ({
            professor: p.professor?._id,
            status: p.status
        }));
        try {
            const endpoint = editId ? `${apiUrl}/projects/${editId}` : `${apiUrl}/projects`;
            const response = await fetch(endpoint, {
                method: editId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, imageUrl: imagePreview, students: studentsData, invitedProfessors: invitedProfessorsData, tags, posters, files, references })
            });
            const data = await response.json().catch(() => null);

            if(response.ok) {
                toast.success("Sucesso!");
                navigate(editId ? `/project/${editId}` : '/Profile');
            } else {
                toast.error(data?.error || 'Nao foi possivel salvar o projeto.');
            }
        } catch (error) { toast.error("Erro de conexão."); } finally { setLoading(false); }
    };

    return (
        <div className="upload-page bg-[#F0F2F5] min-h-screen pt-20">
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
                onProjectSelect={(project) => navigate(getProjectNavigationPath(project, currentUser?._id, currentUser?.role))}
                currentUser={currentUser}
                menuRef={menuRef}
                isAccountMenuOpen={isAccountMenuOpen}
                onToggleAccountMenu={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                onNavigateHome={() => navigate('/')}
                onNavigateProfile={() => navigate(currentUser?.role === 'professor' ? '/professor-profile' : '/profile')}
                onLogout={handleLogout}
                inviteMenu={inviteMenu}
                unauthenticatedActions={<Button shape="pill" size="sm" className="text-xs font-bold px-6" onClick={() => navigate('/login')}>Login</Button>}
            />

            {showLeaveTeamModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-10 max-w-sm w-[90%] shadow-2xl flex flex-col items-center text-center border border-gray-100">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                            <Icon iconCenter="userLock" className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black text-[#003465] uppercase tracking-tighter">Sair Da Equipe?</h3>
                        <p className="text-gray-500 text-sm my-4 font-medium">
                            Você perderá o vínculo com este projeto e voltará para o seu perfil.
                        </p>
                        <div className="flex flex-col w-full gap-3 mt-4">
                            <Button
                                onClick={handleLeaveTeam}
                                disabled={isLeavingTeam}
                                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-full shadow-lg shadow-red-100"
                            >
                                {isLeavingTeam ? "Saindo..." : "Sim, Sair"}
                            </Button>
                            <button
                                onClick={() => setShowLeaveTeamModal(false)}
                                disabled={isLeavingTeam}
                                className="text-gray-400 font-bold py-2 text-xs uppercase tracking-widest hover:text-gray-600 transition-colors disabled:opacity-60"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-10 max-w-sm w-[90%] shadow-2xl flex flex-col items-center text-center border border-gray-100">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                            <Icon iconCenter="trash" className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black text-[#003465] uppercase tracking-tighter">Excluir Projeto?</h3>
                        <p className="text-gray-500 text-sm my-4 font-medium">
                            Esta ação não pode ser desfeita e removerá o trabalho do seu portfólio.
                        </p>
                        <div className="flex flex-col w-full gap-3 mt-4">
                            <Button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-full shadow-lg shadow-red-100"
                            >
                                {isDeleting ? "Excluindo..." : "Sim, Excluir"}
                            </Button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="text-gray-400 font-bold py-2 text-xs uppercase tracking-widest hover:text-gray-600 transition-colors disabled:opacity-60"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/** --- CONTEÚDO PRINCIPAL (MANTIDO IGUAL) --- **/}
            <div className="w-full px-6 md:px-12 lg:px-20 mt-6 text-left">
                <header className="bg-[#003465] text-white p-6 md:p-10 rounded-[40px] shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr_240px] gap-8 items-start">
                        {/* Capa */}
                        <div className="flex flex-col gap-5">
                            <div onClick={() => coverInputRef.current?.click()} className="relative group w-full aspect-square cursor-pointer hover:scale-105 transition-all">
                                <div className="w-full h-full bg-white rounded-[28px] flex items-center justify-center p-2 shadow-inner overflow-hidden border-4 border-white/10">
                                    <img src={imagePreview || logoPlaceholder} alt="Capa" className="w-full h-full object-contain" />
                                </div>
                                <div className="absolute inset-1 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-[28px] pointer-events-none">
                                    <span className="text-white text-[9px] font-black uppercase">Alterar</span>
                                </div>
                                <input type="file" ref={coverInputRef} onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if(file) setImagePreview(await convertToBase64(file));
                                }} className="hidden" accept="image/*" />
                            </div>

                            {/* Tags */}
                            <div className="flex flex-col gap-2 relative" ref={tagDropdownRef}>
                                <label className="text-blue-300/60 text-[8px] font-black uppercase tracking-widest opacity-70">Tecnologias</label>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {tags.map((tag, i) => (
                                        <span key={i} className="bg-blue-500/40 border border-blue-400/30 text-white text-[8px] px-2.5 py-1 rounded-full flex items-center gap-1.5 font-black uppercase shadow-sm">
                                            {tag} <button onClick={() => setTags(tags.filter((_, idx) => idx !== i))} className="hover:text-red-400">×</button>
                                        </span>
                                    ))}
                                    {tags.length < 5 && (
                                        <div className="relative w-full">
                                            <input className="bg-white/10 border border-white/10 rounded-full px-3 py-1 outline-none text-[9px] text-white w-full focus:bg-white/20 transition-all" value={tagSearch} onChange={(e) => {setTagSearch(e.target.value); setIsTagDropdownVisible(true);}} placeholder="+ Tech" />
                                            {tagSearch && isTagDropdownVisible && filteredTagOptions.length > 0 && (
                                                <div className="absolute top-full mt-2 left-0 w-full bg-white rounded-xl shadow-2xl overflow-hidden z-[500] text-left border border-gray-100">
                                                    {filteredTagOptions.slice(0, 6).map(opt => (
                                                        <div key={opt} onClick={() => addTag(opt)} className="px-3 py-2 text-[10px] font-black text-[#003465] hover:bg-blue-50 cursor-pointer uppercase transition-colors">{opt}</div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Título e Descrição */}
                        <div className="flex flex-col gap-4">
                            <div className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-[20px] shadow-inner focus-within:bg-white/[0.06] transition-all">
                                <label className="text-blue-300/60 text-[8px] font-black uppercase tracking-[0.2em] block mb-1">Título do Trabalho</label>
                                <input className="bg-transparent text-xl md:text-2xl font-black border-none outline-none w-full text-white placeholder:text-white/10 tracking-tighter " value={title} onChange={(e) => setTitle(e.target.value)} placeholder="NOME DO PROJETO" />
                            </div>
                            <div className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-[20px] shadow-inner flex-1 flex flex-col focus-within:bg-white/[0.06] transition-all">
                                <label className="text-blue-300/60 text-[8px] font-black uppercase tracking-[0.2em] block mb-1">Sobre o projeto</label>
                                <textarea className="bg-transparent border-none outline-none w-full text-xs md:text-sm resize-none italic flex-1 text-blue-50/80 placeholder:text-white/10 min-h-[220px] leading-relaxed" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva o processo de desenvolvimento e objetivos deste trabalho..." />
                            </div>
                        </div>

                        {/* Equipe */}
                        <div className="bg-white/[0.02] backdrop-blur-xl rounded-[28px] p-4 md:p-5 border border-white/[0.08] flex flex-col gap-4 shadow-xl">
                            <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
                                <h3 className="text-white/80 text-[9px] font-black uppercase tracking-widest">Equipe</h3>
                                <span className="bg-blue-600/40 text-blue-100 text-[7px] px-2 py-0.5 rounded-full font-black uppercase">
                                    {collaborators.length + (isCurrentUserStudent ? 1 : 0)} MEMBROS
                                </span>
                            </div>
                            <div className="relative">
                                <input className="w-full bg-white/5 border border-white/5 rounded-lg py-2 px-3 text-[10px] text-white outline-none focus:bg-white/10 transition-all placeholder:text-white/10" value={teamSearch} onChange={(e) => {setTeamSearch(e.target.value); setIsTeamDropdownVisible(true);}} placeholder="Convidar..." />
                                {teamSearch && isTeamDropdownVisible && teamSearchResults.length > 0 && (
                                    <div className="absolute top-full mt-2 left-0 right-0 bg-[#002a52] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden text-left max-h-52 overflow-y-auto">
                                        {teamSearchResults.map(s => (
                                            <div key={s?._id} onClick={() => {setCollaborators([...collaborators, { student: s, status: 'pending' }]); setTeamSearch(''); setIsTeamDropdownVisible(false);}} className="p-2.5 hover:bg-white/10 cursor-pointer flex items-center gap-2.5 transition-colors">
                                                <Avatar name={s?.name} image={s?.profileImage} size="sm" />
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-white text-[9px] font-bold truncate">{s?.name}</span>
                                                    <span className="text-blue-300 text-[8px] font-black uppercase truncate">{s?.course || 'Aluno'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[280px] custom-scrollbar pr-1">
                                {isCurrentUserStudent && (
                                    <div className="flex items-center gap-2.5 bg-white/5 p-2.5 rounded-lg border border-white/5">
                                        <Avatar name={currentUser?.name} image={currentUser?.profileImage} size="sm" />
                                        <div className="flex flex-col text-left">
                                            <span className="text-white font-bold text-[12px]">{currentUser?.name?.split(' ')[0] || "Você"}</span>
                                            <span className="text-blue-400 text-[8px] font-black uppercase">Membro</span>
                                        </div>
                                    </div>
                                )}
                                {collaborators.map(c => (
                                    <div key={c.student?._id} className="group flex items-center gap-2.5 p-2 rounded-lg border border-transparent hover:bg-white/5 transition-all">
                                        <Avatar name={c.student?.name} image={c.student?.profileImage} size="sm" className={c.status === 'accepted' ? 'opacity-100' : 'opacity-40'} />
                                        <div className="flex-1 flex flex-col text-left">
                                            <span className={`font-bold text-[12px] ${c.status === 'accepted' ? 'text-white' : 'text-white/50'}`}>{c.student?.name}</span>
                                            <span className={`text-[8px] font-black uppercase tracking-tighter ${c.status === 'accepted' ? 'text-green-400' : c.status === 'pending' ? 'text-yellow-500' : 'text-red-400'}`}>{c.status === 'accepted' ? 'Membro' : c.status === 'pending' ? 'Pendente' : 'Recusado'}</span>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveCollaborator(c.student?._id, c.status)}
                                            className={`text-xs ${c.status === 'accepted' ? 'text-amber-300 opacity-100' : 'text-red-400 opacity-0 group-hover:opacity-100'}`}
                                            title={c.status === 'accepted' ? 'Membros aceitos precisam sair do projeto pela propria pagina do projeto.' : 'Remover colaborador'}
                                        >
                                            {c.status === 'accepted' ? '!' : 'X'}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-white/[0.05] pt-4 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-white/80 text-[9px] font-black uppercase tracking-widest">{invitedProfessorsLabel}</h4>
                                    <span className="bg-amber-500/20 text-amber-100 text-[7px] px-2 py-0.5 rounded-full font-black uppercase">
                                        {invitedProfessorsCountLabel}
                                    </span>
                                </div>
                                <div className="relative">
                                    <input
                                        className="w-full bg-white/5 border border-white/5 rounded-lg py-2 px-3 text-[10px] text-white outline-none focus:bg-white/10 transition-all placeholder:text-white/10"
                                        value={professorSearch}
                                        onChange={(e) => { setProfessorSearch(e.target.value); setIsProfessorDropdownVisible(true); }}
                                        placeholder="Convidar professor..."
                                    />
                                    {professorSearch && isProfessorDropdownVisible && professorSearchResults.length > 0 && (
                                        <div className="absolute top-full mt-2 left-0 right-0 bg-[#002a52] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden text-left max-h-52 overflow-y-auto">
                                            {professorSearchResults.map((p) => (
                                                <div
                                                    key={p._id}
                                                    onClick={() => {
                                                        setInvitedProfessors([...invitedProfessors, { professor: p, status: 'pending' }]);
                                                        setProfessorSearch('');
                                                        setIsProfessorDropdownVisible(false);
                                                    }}
                                                    className="p-2.5 hover:bg-white/10 cursor-pointer flex items-center gap-2.5 transition-colors"
                                                >
                                                    <Avatar name={p.name} image={p.profileImage} size="sm" />
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-white text-[9px] font-bold truncate">{p.academicTitle || 'Prof.'} {p.name}</span>
                                                        <span className="text-amber-300 text-[8px] font-black uppercase truncate">{p.department || 'Docente'}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[180px] custom-scrollbar pr-1">
                                    {invitedProfessors.map((p) => (
                                        <div key={p.professor?._id} className="group flex items-center gap-2.5 p-2 rounded-lg border border-amber-400/10 bg-amber-500/5 transition-all">
                                            <Avatar name={p.professor?.name} image={p.professor?.profileImage} size="sm" />
                                            <div className="flex-1 flex flex-col text-left">
                                                <span className="font-bold text-[12px] text-white">{p.professor?.academicTitle || 'Prof.'} {p.professor?.name}</span>
                                                <span className={`text-[8px] font-black uppercase tracking-tighter ${p.status === 'accepted' ? 'text-green-400' : p.status === 'pending' ? 'text-yellow-400' : 'text-red-400'}`}>
                                                    {p.status === 'accepted' ? 'Docente Confirmado' : p.status === 'pending' ? 'Convite Pendente' : 'Convite Recusado'}
                                                </span>
                                            </div>
                                            <button onClick={() => setInvitedProfessors(invitedProfessors.filter(i => i.professor?._id !== p.professor?._id))} className="opacity-0 group-hover:opacity-100 text-red-400 text-xs">×</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {editId && currentUser?.role === 'student' && (
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => setShowLeaveTeamModal(true)}
                                        disabled={isLeavingTeam || acceptedMembersCount <= 1}
                                        className="w-full mt-1 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-200 transition-all hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                        title={acceptedMembersCount <= 1 ? 'O ultimo membro aceito nao pode sair do projeto.' : 'Sair da equipe'}
                                    >
                                        {isLeavingTeam ? 'Saindo...' : 'Sair da equipe'}
                                    </button>
                                    {canDeleteCurrentProject && (
                                        <button
                                            onClick={openDeleteModal}
                                            disabled={isDeleting}
                                            className="w-full rounded-xl border border-red-500/30 bg-red-500/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-100 transition-all hover:bg-red-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                                            title="Excluir projeto"
                                        >
                                            {isDeleting ? 'Excluindo...' : 'Excluir projeto'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </header>
            </div>

            {/** --- SEÇÕES INFERIORES --- **/}
            <main className="w-full px-6 md:px-12 lg:px-20 py-10 space-y-12">
                {/* Pôsteres */}
                <section className="text-left">
                    <h2 className="text-xl font-black text-[#003465] mb-6 border-b-4 border-[#006ACB] w-fit pb-1 uppercase tracking-tighter">Pôsteres</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <input type="file" ref={posterInputRef} onChange={handlePosterUpload} className="hidden" accept="image/*" multiple />
                        {posters.map((p, i) => (
                            <div key={i} className="bg-white p-1.5 rounded-[20px] border border-gray-100 relative group overflow-hidden shadow-sm">
                                <img src={p.url} className="rounded-[14px] w-full h-48 object-cover" />
                                <button onClick={() => setPosters(posters.filter((_, idx) => idx !== i))} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all font-bold shadow-lg text-sm">X</button>
                            </div>
                        ))}
                        <button onClick={() => posterInputRef.current?.click()} className="bg-gray-100/50 border-4 border-dashed border-gray-200 rounded-[20px] h-48 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-200 transition-all">
                            <Icon iconCenter="add" className="w-8 h-8 mb-1" /><span className="font-black text-[9px] uppercase">Novo Pôster</span>
                        </button>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Documentação */}
                    <section className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden text-left flex flex-col">
                        <div className="p-4 bg-gray-50 border-b flex justify-between items-center h-14">
                            <h2 className="font-black text-[#003465] text-xs uppercase tracking-widest border-l-4 border-[#006ACB] pl-3">Documentação</h2>
                            <input type="file" ref={fileUploadRef} onChange={handleFileUpload} className="hidden" multiple />
                            <Button onClick={() => fileUploadRef.current?.click()} shape="pill" size="sm" className="px-5 text-[9px] font-black uppercase">Importar</Button>
                        </div>
                        <div className="p-5 min-h-[220px] space-y-2">
                            {files.map((file, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all group">
                                    <span className="text-blue-900 font-bold text-xs truncate max-w-xs">{file.name}</span>
                                    <div className="flex items-center gap-3">
                                        {file.base64 && (
                                            <Button onClick={() => handleDownload(file.base64 as string, file.name)} size="sm" shape="pill" className="text-[9px] px-5 py-2 uppercase font-black shadow-sm">Baixar</Button>
                                        )}
                                        <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-red-400 font-black text-sm">X</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Referências */}
                    <section className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden text-left flex flex-col">
                        <div className="p-4 bg-gray-50 border-b flex justify-between items-center h-14">
                            <h2 className="font-black text-[#003465] text-xs uppercase tracking-widest border-l-4 border-[#006ACB] pl-3">Referências</h2>
                            <Button onClick={handleAddReference} shape="pill" size="sm" className="px-5 text-[9px] font-black uppercase">Adicionar</Button>
                        </div>
                        <div className="p-5 flex flex-col h-full space-y-4">
                            <input className="w-full bg-gray-50 rounded-lg px-4 py-3 text-xs outline-none border border-transparent focus:border-blue-500 transition-all" placeholder="Link ou referência ABNT..." value={refInput} onChange={(e) => setRefInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddReference()} />
                            <div className="flex-1 space-y-2 min-h-[145px]">
                                {references.map((ref, i) => (
                                    <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-xl border-l-4 border-blue-400">
                                        <span className="text-[10px] text-blue-600 italic truncate flex-1">{ref}</span>
                                        <button onClick={() => setReferences(references.filter((_, idx) => idx !== i))} className="text-red-400 ml-4">X</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                <div className="flex justify-center gap-6 py-6 pb-20">
                    <Button onClick={() => navigate('/profile')} shape="pill" className="font-black text-white border-2 border-gray-200 uppercase text-[10px] tracking-[0.2em] px-12 py-4">Cancelar</Button>
                    <Button className="font-black text-white uppercase text-[10px] tracking-[0.2em] px-16 py-4 shadow-2xl shadow-blue-200" shape="pill" onClick={handleSaveProject} disabled={loading}>
                        {loading ? "..." : editId ? "Salvar" : "Publicar"}
                    </Button>
                </div>
            </main>
        </div>
    );
};

export default Upload;


/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';
import coloredLogo from '../assets/colored-logo.svg';
import logoPlaceholder from '../assets/white-logo.svg';
import { TextBar } from '../components/TextBar';
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
}

const ProjectView: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const menuRef = useRef<HTMLDivElement>(null);
    
    const [project, setProject] = useState<any>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

    // --- ESTADOS DA BUSCA GLOBAL (HEADER) ---
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [searchResultStudents, setSearchResultStudents] = useState<SearchResults['students']>([]);
    const [searchResultProfessors, setSearchResultProfessors] = useState<SearchResults['professors']>([]);
    const [searchResultProjects, setSearchResultProjects] = useState<SearchResults['projects']>([]);

    // Estados da validação docente
    const [endorseComment, setEndorseComment] = useState("");
    const [isEndorsing, setIsEndorsing] = useState(false);
    const [isLeavingTeam, setIsLeavingTeam] = useState(false);
    const [showLeaveTeamModal, setShowLeaveTeamModal] = useState(false);

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

    // Carregamento do Projeto e Usuário
    useEffect(() => {
        const savedUser = localStorage.getItem('@AcadeMe:user');
        if (savedUser) setCurrentUser(JSON.parse(savedUser));

        fetch(`${apiUrl}/projects/${id}`)
            .then(res => res.json())
            .then(data => setProject(data))
            .catch(err => console.error("Erro ao carregar projeto:", err));
    }, [id, apiUrl]);

    // --- LÓGICA DE BUSCA GLOBAL (HEADER) ---
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

    const handleDownload = (base64: string, name: string) => {
        const link = document.createElement("a");
        link.href = base64;
        link.download = name;
        link.click();
    };

    // Função para o professor validar o projeto
    const handleEndorse = async () => {
        if (!currentUser || currentUser.role !== 'professor') return;
        if (!endorseComment.trim()) {
            toast.warn("Por favor, insira um breve comentário para o chancelamento.");
            return;
        }
        setIsEndorsing(true);
        
        try {
            const response = await fetch(`${apiUrl}/projects/${id}/endorse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ professorId: currentUser._id, comment: endorseComment })
            });
            
            if (response.ok) {
                const data = await response.json();
                toast.success('Chancelamento acadêmico registrado com sucesso.');
                setProject(data.project); 
                setEndorseComment("");
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || "Erro ao registrar validação.");
            }
        } catch (err) {
            toast.error("Erro de conexão com o servidor.");
        } finally {
            setIsEndorsing(false);
        }
    };

    const hasAlreadyEndorsed = useMemo(() => {
        if (!currentUser || currentUser.role !== 'professor' || !project?.endorsements) return false;
        return project.endorsements.some((end: any) => end.professor?._id === currentUser._id || end.professor === currentUser._id);
    }, [currentUser, project]);

    const currentProfessorInvite = useMemo(() => {
        if (!currentUser || currentUser.role !== 'professor' || !project?.invitedProfessors) return null;
        return project.invitedProfessors.find(
            (invite: any) =>
                invite.professor?._id === currentUser._id || invite.professor === currentUser._id
        ) || null;
    }, [currentUser, project]);

    const canCurrentProfessorEndorse = currentProfessorInvite?.status === 'accepted';
    const invitedProfessorsCount = project?.invitedProfessors?.length ?? 0;
    const invitedProfessorsLabel = invitedProfessorsCount > 1 ? 'Docentes Convidados' : 'Docente Convidado';

    const isCurrentUserAcceptedMember = useMemo(() => {
        if (!currentUser || currentUser.role !== 'student' || !project?.students) return false;
        return project.students.some(
            (item: any) =>
                item.status === 'accepted' &&
                (item.student?._id === currentUser._id || item.student === currentUser._id)
        );
    }, [currentUser, project]);

    const handleLeaveTeam = async () => {
        if (!currentUser || currentUser.role !== 'student' || !id) return;

        setIsLeavingTeam(true);

        try {
            const response = await fetch(`${apiUrl}/projects/${id}/leave`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: currentUser._id })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || 'Você saiu da equipe.');
                setShowLeaveTeamModal(false);
                navigate('/profile');
            } else {
                toast.error(data.error || 'Não foi possível sair da equipe.');
            }
        } catch (err) {
            toast.error("Erro de conexão com o servidor.");
        } finally {
            setIsLeavingTeam(false);
        }
    };

    const handleRespondProfessorInvite = async (status: 'accepted' | 'declined') => {
        if (!currentUser || currentUser.role !== 'professor' || !id) return;

        try {
            const response = await fetch(`${apiUrl}/projects/${id}/respond-professor-invite`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ professorId: currentUser._id, status })
            });

            const data = await response.json();

            if (response.ok) {
                setProject(data.project);
                toast.success(status === 'accepted' ? 'Convite de validação aceito.' : 'Convite recusado.');
            } else {
                toast.error(data.error || 'Não foi possível responder ao convite.');
            }
        } catch (err) {
            toast.error("Erro de conexão com o servidor.");
        }
    };

    if (!project) return <div className="flex h-screen items-center justify-center font-bold text-[#003465] animate-pulse uppercase tracking-widest text-[10px]">Carregando projeto...</div>;

    return (
        <div className="bg-[#F0F2F5] min-h-screen pb-20 relative pt-20"> 
            
            <AppHeader
                searchTerm={searchTerm}
                isDropdownVisible={isDropdownVisible}
                searchResultStudents={searchResultStudents}
                searchResultProfessors={searchResultProfessors}
                searchResultProjects={searchResultProjects}
                onSearchChange={(value) => { setSearchTerm(value); setIsDropdownVisible(true); }}
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
                unauthenticatedActions={<Button shape="pill" size="sm" className="text-xs font-bold px-6" onClick={() => navigate('/login')}>Login</Button>}
            />

            {/* MODAL ZOOM */}
            {selectedImage && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 backdrop-blur-sm cursor-zoom-out p-4 animate-in fade-in duration-300" onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} className="max-w-full max-h-full rounded-lg shadow-2xl animate-in zoom-in duration-300" />
                </div>
            )}

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

            {/* --- ÁREA PRINCIPAL DO PROJETO --- */}
            <div className="w-full px-6 md:px-12 lg:px-20 mt-6 text-left">
                <header className="bg-[#003465] text-white p-6 md:p-10 rounded-[40px] shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr_240px] gap-8 items-stretch">
                        {/* COLUNA 1: CAPA + TAGS */}
                        <div className="flex flex-col gap-5">
                            <div className="relative w-full aspect-square">
                                <div className="w-full h-full bg-white rounded-[28px] flex items-center justify-center p-2 shadow-inner overflow-hidden border-4 border-white/10">
                                    <img src={project.imageUrl || logoPlaceholder} alt="Capa" className="w-full h-full object-contain" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-blue-300/60 text-[12px] font-black uppercase tracking-widest opacity-70">Tecnologias</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {project.tags?.map((tag: string, i: number) => (
                                        <span key={i} className="bg-blue-500/20 border border-blue-400/20 text-white text-[8px] px-2.5 py-1 rounded-full font-black uppercase shadow-sm">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* COLUNA 2: TÍTULO E DESCRIÇÃO */}
                        <div className="flex flex-col gap-4">
                            <div className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-[20px] shadow-inner">
                                <label className="text-blue-300/60 text-[12px] font-black uppercase tracking-[0.2em] block mb-1">Título do Trabalho</label>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase">{project.title}</h1>
                                    {isProjectValidated(project) && <ValidatedBadge compact />}
                                </div>
                            </div>
                            <div className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-[20px] shadow-inner flex-1 flex flex-col">
                                <label className="text-blue-300/60 text-[12px] font-black uppercase tracking-[0.2em] block mb-1">Sobre o projeto</label>
                                <p className="text-xs md:text-sm text-blue-50/80 italic leading-relaxed whitespace-pre-wrap min-h-[220px]">{project.description}</p>
                            </div>
                        </div>

                        {/* COLUNA 3: EQUIPE */}
                        <div className="bg-white/[0.02] backdrop-blur-xl rounded-[28px] p-4 md:p-5 border border-white/[0.08] flex flex-col gap-4 shadow-xl">
                            <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
                                <h3 className="text-white/80 text-[12px] font-black uppercase tracking-widest">Equipe</h3>
                                <span className="bg-blue-600/40 text-blue-100 text-[8px] px-2 py-0.5 rounded-full font-black">
                                    {project.students?.filter((s: any) => s.status === 'accepted').length} MEMBROS
                                </span>
                            </div>
                            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[300px] custom-scrollbar pr-1">
                                {project.students?.filter((item: any) => item.status === 'accepted').map((item: any, i: number) => (
                                    <div key={i} onClick={() => navigate(`/student/${item.student?._id}`)} className="flex items-center gap-2.5 bg-white/[0.04] p-2.5 rounded-lg border border-white/[0.03] hover:bg-white/[0.08] transition-all cursor-pointer group">
                                        <Avatar name={item.student?.name} image={item.student?.profileImage} size="sm" className="border border-white/10" />
                                        <div className="flex flex-col flex-1">
                                            <span className="text-white/90 font-bold text-[12px] group-hover:text-blue-300 transition-colors">{item.student?.name}</span>
                                            <span className="text-green-400 text-[8px] font-black uppercase tracking-widest">Membro</span>
                                        </div>                                            
                                    </div>
                                ))}
                            </div>
                            {project.invitedProfessors?.length > 0 && (
                                <div className="border-t border-white/[0.05] pt-3 flex flex-col gap-2.5">
                                    <h4 className="text-amber-100 text-[10px] font-black uppercase tracking-widest">{invitedProfessorsLabel}</h4>
                                    {project.invitedProfessors.map((invite: any, i: number) => (
                                        <div key={`prof-${i}`} className="flex items-center gap-2.5 bg-amber-500/10 p-2.5 rounded-lg border border-amber-300/10">
                                            <Avatar name={invite.professor?.name} image={invite.professor?.profileImage} size="sm" className="border border-amber-200/20" />
                                            <div className="flex flex-col flex-1">
                                                <span className="text-white/90 font-bold text-[12px]">{invite.professor?.academicTitle || 'Prof.'} {invite.professor?.name}</span>
                                                <span className={`text-[8px] font-black uppercase tracking-widest ${invite.status === 'accepted' ? 'text-green-400' : invite.status === 'pending' ? 'text-yellow-400' : 'text-red-400'}`}>
                                                    {invite.status === 'accepted' ? 'Docente Confirmado' : invite.status === 'pending' ? 'Convite Pendente' : 'Convite Recusado'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {isCurrentUserAcceptedMember && (
                                <button
                                    onClick={() => setShowLeaveTeamModal(true)}
                                    disabled={isLeavingTeam}
                                    className="w-full mt-1 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-200 transition-all hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isLeavingTeam ? 'Saindo...' : 'Sair da equipe'}
                                </button>
                            )}
                        </div>
                    </div>
                </header>
            </div>

            {/* SEÇÕES INFERIORES */}
            <main className="w-full px-6 md:px-12 lg:px-20 py-10 space-y-12">
                
                {/* --- 1. SESSÃO DO PROFESSOR (VALIDAÇÃO) --- */}
                {currentUser?.role === 'professor' && currentProfessorInvite?.status === 'pending' && (
                    <section className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 md:p-8 text-left relative overflow-hidden">
                        <div className="absolute left-0 top-0 h-full w-2 bg-amber-500" />
                        <div className="flex flex-col gap-5 pl-4">
                            <div className="flex items-center gap-3">
                                <h2 className="font-black text-[#003465] uppercase text-xs tracking-[0.2em]">Convite de Validação</h2>
                                <span className="text-[10px] bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-bold border border-amber-100">Pendente</span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">Você foi convidado para avaliar este trabalho. Aceite o convite para liberar o chancelamento acadêmico.</p>
                            <div className="flex gap-3 justify-end">
                                <Button onClick={() => handleRespondProfessorInvite('declined')} shape="pill" className="text-red-500 bg-red-50 border border-red-100 font-black uppercase tracking-widest text-[10px] px-8 py-4 shadow-none">
                                    Recusar
                                </Button>
                                <Button onClick={() => handleRespondProfessorInvite('accepted')} shape="pill" className="text-white font-black uppercase tracking-widest text-[10px] px-10 py-4 shadow-md">
                                    Aceitar Convite
                                </Button>
                            </div>
                        </div>
                    </section>
                )}

                {currentUser?.role === 'professor' && !currentProfessorInvite && (
                    <section className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 md:p-8 text-left relative overflow-hidden">
                        <div className="absolute left-0 top-0 h-full w-2 bg-gray-300" />
                        <div className="flex flex-col gap-3 pl-4">
                            <h2 className="font-black text-[#003465] uppercase text-xs tracking-[0.2em]">Validação Restrita</h2>
                            <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">Este projeto pode ser visualizado por qualquer professor, mas apenas docentes convidados e confirmados podem emitir a validação.</p>
                        </div>
                    </section>
                )}

                {currentUser?.role === 'professor' && canCurrentProfessorEndorse && !hasAlreadyEndorsed && (
                    <section className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 md:p-8 text-left relative overflow-hidden">
                        <div className="absolute left-0 top-0 h-full w-2 bg-green-500" />
                        <div className="flex flex-col gap-5 pl-4">
                            <div className="flex items-center gap-3">
                                <h2 className="font-black text-[#003465] uppercase text-xs tracking-[0.2em]">Chancelamento Acadêmico</h2>
                                <span className="text-[10px] bg-green-50 text-green-600 px-3 py-1 rounded-full font-bold border border-green-100">Ação Formal</span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">Como docente, sua validação atesta a integridade e qualidade deste trabalho.</p>
                            <textarea
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs text-[#003465] focus:outline-none focus:border-green-200 transition-all min-h-[100px] resize-none placeholder:text-gray-400 font-medium"
                                placeholder="Insira seu parecer acadêmico aqui..."
                                value={endorseComment}
                                onChange={(e) => setEndorseComment(e.target.value)}
                            />
                            <div className="flex justify-end pt-2">
                                <Button onClick={handleEndorse} disabled={isEndorsing} shape="pill" className="text-white font-black uppercase tracking-widest text-[10px] px-12 py-4 shadow-md">
                                    {isEndorsing ? 'Registrando...' : 'Emitir Chancelamento'}
                                </Button>
                            </div>
                        </div>
                    </section>
                )}

                {/* --- 2. VITRINE DE VALIDAÇÕES --- */}
                {project.endorsements && project.endorsements.length > 0 && (
                    <section className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 md:p-8 text-left relative overflow-hidden">
                        <h2 className="font-black text-[#003465] uppercase text-xs tracking-[0.2em] mb-8 border-l-4 border-green-500 pl-4">Verificações Docentes</h2>
                        <div className="space-y-5">
                            {project.endorsements.map((end: any, i: number) => {
                                const isMyEndorsement = currentUser?.role === 'professor' && (end.professor?._id === currentUser._id || end.professor === currentUser._id);
                                return (
                                    <div key={i} className={`flex gap-4 p-5 bg-gray-50 rounded-2xl border ${isMyEndorsement ? 'border-green-200' : 'border-gray-100'} items-start`}>
                                        <Avatar name={end.professor?.name || "P"} image={end.professor?.profileImage} size="md" className="shrink-0 border border-gray-200" />
                                        <div className="flex flex-col flex-1 pt-1">
                                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100 w-full">
                                                <div className="flex flex-col">
                                                    <p className="text-xs font-black text-[#003465] tracking-tight uppercase">{end.professor?.academicTitle || 'Prof.'} {end.professor?.name}</p>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{end.professor?.department || "Docente"}</p>
                                                </div>
                                                <span className="text-[8px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-black uppercase tracking-wider">Trabalho Validado</span>
                                            </div>
                                            {isMyEndorsement ? (
                                                <div className="flex flex-col gap-3">
                                                    <textarea 
                                                        className="w-full bg-white border border-green-100 rounded-xl p-3 text-xs text-[#006ACB] focus:outline-none focus:border-green-300 font-medium italic min-h-[80px]"
                                                        defaultValue={end.comment}
                                                        id={`edit-comment-${end.professor?._id}`}
                                                    />
                                                    <div className="flex gap-3 justify-end">
                                                        <button onClick={async () => {
                                                            const newComment = (document.getElementById(`edit-comment-${end.professor?._id}`) as HTMLTextAreaElement).value;
                                                            try {
                                                                const res = await fetch(`${apiUrl}/projects/${project._id}/endorse/${currentUser._id}`, {
                                                                    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment: newComment })
                                                                });
                                                                if(res.ok) { const data = await res.json(); setProject(data.project); toast.success('Parecer atualizado!'); }
                                                            } catch(e) { toast.error("Erro ao atualizar."); }
                                                        }} className="text-[9px] uppercase font-black tracking-widest text-green-600 hover:text-green-700">Salvar</button>
                                                        <span className="text-gray-300">|</span>
                                                        <button onClick={async () => {
                                                            if(window.confirm('Remover chancelamento?')) {
                                                                try {
                                                                    const res = await fetch(`${apiUrl}/projects/${project._id}/endorse/${currentUser._id}`, { method: 'DELETE' });
                                                                    if(res.ok) { const data = await res.json(); setProject(data.project); toast.info('Removido.'); }
                                                                } catch(e) { toast.error("Erro ao excluir."); }
                                                            }
                                                        }} className="text-[9px] uppercase font-black tracking-widest text-red-400 hover:text-red-500">Excluir</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-[#006ACB] font-medium leading-relaxed bg-white p-4 rounded-xl border border-gray-100 shadow-inner italic">"{end.comment}"</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* --- 3. PÔSTERES --- */}
                <section className="text-left">
                    <h2 className="text-xl font-black text-[#003465] mb-6 border-b-4 border-[#006ACB] w-fit pb-1 uppercase tracking-tighter">Pôsteres</h2>
                    {project.posters?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {project.posters.map((p: any, i: number) => (
                                <div key={i} className="bg-white p-1.5 rounded-[20px] border border-gray-100 overflow-hidden cursor-zoom-in group shadow-sm" onClick={() => setSelectedImage(p.url)}>
                                    <div className="relative overflow-hidden rounded-[14px]">
                                        <img src={p.url} className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState title="Nenhum pôster enviado" description="Os materiais visuais deste projeto aparecerão aqui." icon="search" compact />
                    )}
                </section>

                {/* --- 4. DOCUMENTOS E REFERÊNCIAS --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <section className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 md:p-8 text-left">
                        <h2 className="font-black text-[#003465] uppercase text-xs tracking-[0.2em] mb-6 border-l-4 border-[#006ACB] pl-4">Documentação</h2>
                        {project.files?.length > 0 ? (
                            <div className="space-y-2.5">
                                {project.files.map((file: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center p-3.5 bg-gray-50 rounded-2xl hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all group">
                                        <span className="text-blue-900 font-bold text-xs truncate max-w-xs">{file.name}</span>
                                        <Button onClick={() => handleDownload(file.base64, file.name)} size="sm" shape="pill" className="text-[9px] px-5 py-2 uppercase font-black shadow-sm">Baixar</Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState title="Nenhum documento anexado" description="Arquivos complementares do projeto serão exibidos aqui." icon="search" compact />
                        )}
                    </section>

                    <section className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 md:p-8 text-left">
                        <h2 className="font-black text-[#003465] uppercase text-xs tracking-[0.2em] mb-6 border-l-4 border-[#006ACB] pl-4">Referências</h2>
                        {project.references?.length > 0 ? (
                            <div className="space-y-2.5">
                                {project.references.map((ref: string, i: number) => (
                                    <div key={i} className="p-3.5 bg-gray-50 rounded-2xl border-l-4 border-blue-400 hover:bg-blue-50 transition-colors">
                                        <a href={ref.startsWith('http') ? ref : `https://${ref}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 hover:text-blue-800 underline italic break-all font-bold">{ref}</a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState title="Nenhuma referência cadastrada" description="As referências bibliográficas do projeto aparecerão nesta área." icon="search" compact />
                        )}
                    </section>
                </div>

                <div className="flex justify-center pt-10">
                    <Button onClick={() => navigate(-1)} shape="pill" className="font-black text-white uppercase text-[10px] tracking-[0.2em] px-14 py-4 shadow-xl hover:bg-black transition-all">Voltar para Galeria</Button>
                </div>
            </main>
        </div>
    );
};

export default ProjectView;


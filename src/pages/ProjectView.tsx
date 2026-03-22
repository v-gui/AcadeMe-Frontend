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
    const [searchResultStudents, setSearchResultStudents] = useState<any[]>([]);
    const [searchResultProjects, setSearchResultProjects] = useState<any[]>([]);

    // Estados da validação docente
    const [endorseComment, setEndorseComment] = useState("");
    const [isEndorsing, setIsEndorsing] = useState(false);

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

    if (!project) return <div className="flex h-screen items-center justify-center font-bold text-[#003465] animate-pulse uppercase tracking-widest text-[10px]">Carregando projeto...</div>;

    return (
        <div className="bg-[#F0F2F5] min-h-screen pb-20 relative pt-20"> 
            
            {/* --- HEADER FIXO --- */}
            <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-md z-[1000] h-20 flex items-center border-b border-gray-100">
                <div className="w-full flex items-center justify-between px-6 md:px-12 lg:px-20">
                    <img src={coloredLogo} alt="logo" className="h-10 cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/')} />
                    
                    <div className="flex-1 max-w-2xl mx-8 relative">
                        <TextBar 
                            variant="default" 
                            placeholder="Pesquisar talentos ou projetos..." 
                            iconLeft="search" 
                            value={searchTerm}
                            onChange={(e: any) => { setSearchTerm(e.target.value); setIsDropdownVisible(true); }}
                            onBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)}
                        />
                        {searchTerm && isDropdownVisible && (
                            <div className="absolute top-full left-0 w-full bg-white shadow-2xl rounded-b-2xl mt-1 border border-gray-100 overflow-hidden z-[1100] text-left max-h-[500px] overflow-y-auto">
                                
                                {/** CATEGORIA: ALUNOS **/}
                                {searchResultStudents.length > 0 && (
                                    <div>
                                        <div className="bg-blue-50 px-5 py-3 border-y border-blue-200">
                                            <span className="text-[10px] font-black text-[#006ACB] uppercase tracking-[0.2em] flex items-center gap-2"> Alunos </span>
                                        </div>
                                        {searchResultStudents.map(aluno => (
                                            <div key={aluno._id} onClick={() => navigate(`/student/${aluno._id}`)} className="flex items-center gap-3 p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-none transition-colors">
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
                                            <div key={proj._id} onClick={() => navigate(`/project/${proj._id}`)} className="flex items-center gap-3 p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-none transition-colors">
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
                        {currentUser ? (
                            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}>
                                <div className="hidden md:flex flex-col items-end mr-1">
                                    <span className="text-[9px] font-black text-[#006ACB] uppercase tracking-widest leading-none mb-1">
                                        {currentUser?.role === 'professor' ? 'Docente' : 'Online'}
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
                            <Button shape="pill" size="sm" className="text-xs font-bold px-6" onClick={() => navigate('/login')}>Login</Button>
                        )}
                    </div>
                </div>
            </header>

            {/* MODAL ZOOM */}
            {selectedImage && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 backdrop-blur-sm cursor-zoom-out p-4 animate-in fade-in duration-300" onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} className="max-w-full max-h-full rounded-lg shadow-2xl animate-in zoom-in duration-300" />
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
                                <h1 className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase">{project.title}</h1>
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
                        </div>
                    </div>
                </header>
            </div>

            {/* SEÇÕES INFERIORES */}
            <main className="w-full px-6 md:px-12 lg:px-20 py-10 space-y-12">
                
                {/* --- 1. SESSÃO DO PROFESSOR (VALIDAÇÃO) --- */}
                {currentUser?.role === 'professor' && !hasAlreadyEndorsed && (
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
                {project.posters?.length > 0 && (
                    <section className="text-left">
                        <h2 className="text-xl font-black text-[#003465] mb-6 border-b-4 border-[#006ACB] w-fit pb-1 uppercase tracking-tighter">Pôsteres</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {project.posters.map((p: any, i: number) => (
                                <div key={i} className="bg-white p-1.5 rounded-[20px] border border-gray-100 overflow-hidden cursor-zoom-in group shadow-sm" onClick={() => setSelectedImage(p.url)}>
                                    <div className="relative overflow-hidden rounded-[14px]">
                                        <img src={p.url} className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* --- 4. DOCUMENTOS E REFERÊNCIAS --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <section className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 md:p-8 text-left">
                        <h2 className="font-black text-[#003465] uppercase text-xs tracking-[0.2em] mb-6 border-l-4 border-[#006ACB] pl-4">Documentação</h2>
                        <div className="space-y-2.5">
                            {project.files?.map((file: any, i: number) => (
                                <div key={i} className="flex justify-between items-center p-3.5 bg-gray-50 rounded-2xl hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all group">
                                    <span className="text-blue-900 font-bold text-xs truncate max-w-xs">{file.name}</span>
                                    <Button onClick={() => handleDownload(file.base64, file.name)} size="sm" shape="pill" className="text-[9px] px-5 py-2 uppercase font-black shadow-sm">Baixar</Button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 md:p-8 text-left">
                        <h2 className="font-black text-[#003465] uppercase text-xs tracking-[0.2em] mb-6 border-l-4 border-[#006ACB] pl-4">Referências</h2>
                        <div className="space-y-2.5">
                            {project.references?.map((ref: string, i: number) => (
                                <div key={i} className="p-3.5 bg-gray-50 rounded-2xl border-l-4 border-blue-400 hover:bg-blue-50 transition-colors">
                                    <a href={ref.startsWith('http') ? ref : `https://${ref}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 hover:text-blue-800 underline italic break-all font-bold">{ref}</a>
                                </div>
                            ))}
                        </div>
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
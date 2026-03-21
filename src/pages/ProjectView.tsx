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
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

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
        if (savedUser) setCurrentUser(JSON.parse(savedUser));

        fetch(`${apiUrl}/projects/${id}`)
            .then(res => res.json())
            .then(data => setProject(data))
            .catch(err => console.error("Erro ao carregar projeto:", err));

        fetch(`${apiUrl}/students`)
            .then(res => res.json())
            .then(data => setAlunos(data))
            .catch(err => console.error("Erro ao carregar lista de alunos:", err));
    }, [id, apiUrl]);

    const filteredAlunos = useMemo(() => {
        if (!searchTerm) return [];
        return alunos.filter(aluno => 
            aluno.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            aluno.course.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [alunos, searchTerm]);

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

    if (!project) return <div className="flex h-screen items-center justify-center font-bold text-[#003465] animate-pulse uppercase tracking-widest text-[10px]">Carregando projeto...</div>;

    return (
        <div className="bg-[#F0F2F5] min-h-screen pb-20 relative pt-20"> 
            
            {/* --- HEADER FIXO (80px Altura e Menu de Conta) --- */}
            <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-md z-[1000] h-20 flex items-center border-b border-gray-100">
                <div className="w-full flex items-center justify-between px-6 md:px-12 lg:px-20">
                    <img src={coloredLogo} alt="logo" className="h-10 cursor-pointer" onClick={() => navigate('/')} />
                    
                    <div className="flex-1 max-w-2xl mx-8 relative">
                        <TextBar 
                            variant="default" 
                            placeholder="Pesquisar talentos..." 
                            iconLeft="search" 
                            value={searchTerm}
                            onChange={(e: any) => { setSearchTerm(e.target.value); setIsDropdownVisible(true); }}
                            onBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)}
                        />
                        {searchTerm && isDropdownVisible && (
                            <div className="absolute top-full left-0 w-full bg-white shadow-2xl rounded-b-xl mt-1 border border-gray-100 overflow-hidden z-[1100] text-left">
                                {filteredAlunos.map(aluno => (
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
                    </div>

                    <div className="flex-shrink-0 relative" ref={menuRef}>
                        {currentUser ? (
                            <div 
                                className="flex items-center gap-3 cursor-pointer group"
                                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                            >
                                <div className="hidden md:flex flex-col items-end mr-1">
                                    <span className="text-[9px] font-black text-[#006ACB] uppercase tracking-widest leading-none mb-1">Online</span>
                                    <span className="text-[#003465] font-bold text-xs">{currentUser?.name?.split(' ')[0] || "User"}</span>
                                </div>
                                
                                <Avatar 
                                    name={currentUser?.name} 
                                    image={currentUser?.profileImage} 
                                    size="md" 
                                    className={`border-2 transition-all ${isAccountMenuOpen ? 'border-[#006ACB] scale-105 shadow-lg' : 'border-gray-200'}`} 
                                />

                                {/* O MENU DROPDOWN - AJUSTADO ABAIXO */}
                                {isAccountMenuOpen && (
                                    /* top-full garante que ele alinhe com a base do header, right-0 alinha com a direita do avatar */
                                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,52,101,0.15)] border border-gray-100 py-6 z-[1100] animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                                        <div className="px-8 pb-4 border-b border-gray-50 flex flex-col items-center text-center">
                                            <p className="text-[#006ACB] text-[10px] font-black uppercase tracking-[0.2em] mb-4">Conta AcadeMe</p>
                                            <Avatar name={currentUser?.name} image={currentUser?.profileImage} size="lg" className="border-4 border-blue-50 p-0.5 mb-3" />
                                            <p className="text-[#003465] font-black text-lg tracking-tighter leading-tight truncate w-full">{currentUser?.name}</p>
                                            <p className="text-gray-400 text-xs truncate w-full">{currentUser?.email}</p>
                                        </div>
                                        <div className="pt-4 px-2">
                                            <button onClick={() => navigate('/Profile')} className="w-full flex items-center gap-4 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-[#006ACB] rounded-xl transition-all group">
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

            {/* --- ÁREA PRINCIPAL DO PROJETO (AZUL COMPACTO) --- */}
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
                                        <span key={i} className="bg-blue-500/20 border border-blue-400/20 text-white text-[8px] px-2.5 py-1 rounded-full font-black uppercase shadow-sm">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* COLUNA 2: TÍTULO E DESCRIÇÃO (Refinado) */}
                        <div className="flex flex-col gap-4">
                            <div className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-[20px] shadow-inner">
                                <label className="text-blue-300/60 text-[12px] font-black uppercase tracking-[0.2em] block mb-1">Título do Trabalho</label>
                                <h1 className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase">{project.title}</h1>
                            </div>

                            <div className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-[20px] shadow-inner flex-1 flex flex-col">
                                <label className="text-blue-300/60 text-[12px] font-black uppercase tracking-[0.2em] block mb-1">Sobre o projeto</label>
                                <p className="text-xs md:text-sm text-blue-50/80 italic leading-relaxed whitespace-pre-wrap min-h-[220px]">
                                    {project.description}
                                </p>
                            </div>
                        </div>

                        {/* COLUNA 3: EQUIPE (Compacta) */}
                        <div className="bg-white/[0.02] backdrop-blur-xl rounded-[28px] p-4 md:p-5 border border-white/[0.08] flex flex-col gap-4 shadow-xl">
                            <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
                                <h3 className="text-white/80 text-[12px] font-black uppercase tracking-widest">Equipe</h3>
                                <span className="bg-blue-600/40 text-blue-100 text-[8px] px-2 py-0.5 rounded-full font-black">
                                    {project.students?.filter((s: any) => s.status === 'accepted').length} MEMBROS
                                </span>
                            </div>

                            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[300px] custom-scrollbar pr-1">
                                {project.students
                                    ?.filter((item: any) => item.status === 'accepted')
                                    .map((item: any, i: number) => (
                                        <div 
                                            key={i} 
                                            onClick={() => navigate(`/student/${item.student?._id}`)}
                                            className="flex items-center gap-2.5 bg-white/[0.04] p-2.5 rounded-lg border border-white/[0.03] hover:bg-white/[0.08] transition-all cursor-pointer group"
                                        >
                                            <Avatar name={item.student?.name} image={item.student?.profileImage} size="sm" className="border border-white/10" />
                                            <div className="flex flex-col flex-1">
                                                <span className="text-white/90 font-bold text-[12px] group-hover:text-blue-300 transition-colors">
                                                    {item.student?.name}
                                                </span>
                                                <span className="text-green-400 text-[8px] font-black uppercase tracking-widest">
                                                    Membro
                                                </span>
                                            </div>                                            
                                        </div>
                                    ))
                                }
                                {project.students?.filter((s: any) => s.status === 'accepted').length === 0 && (
                                    <p className="text-white/20 text-[8px] italic text-center py-10 uppercase font-black">Sem membros.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </header>
            </div>

            {/* SEÇÕES DE DOCUMENTAÇÃO E PÔSTERES */}
            <main className="w-full px-6 md:px-12 lg:px-20 py-10 space-y-12">
                {project.posters?.length > 0 && (
                    <section className="text-left">
                        <h2 className="text-xl font-black text-[#003465] mb-6 border-b-4 border-[#006ACB] w-fit pb-1 uppercase tracking-tighter">Pôsteres</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {project.posters.map((p: any, i: number) => (
                                <div key={i} className="bg-white p-1.5 rounded-[20px] border border-gray-100 overflow-hidden cursor-zoom-in group shadow-sm" onClick={() => setSelectedImage(p.url)}>
                                    <div className="relative overflow-hidden rounded-[14px]">
                                        <img src={p.url} className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="bg-white/90 text-[#003465] px-4 py-1.5 rounded-full text-[9px] font-black uppercase shadow-lg tracking-widest">Visualizar</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <section className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 md:p-8 text-left">
                        <h2 className="font-black text-[#003465] uppercase text-xs tracking-[0.2em] mb-6 border-l-4 border-[#006ACB] pl-4">Documentação</h2>
                        <div className="space-y-2.5">
                            {project.files?.map((file: any, i: number) => (
                                <div key={i} className="flex justify-between items-center p-3.5 bg-gray-50 rounded-2xl hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all group">
                                    <span className="text-blue-900 font-bold text-xs truncate max-w-xs">{file.name}</span>
                                    <Button onClick={() => handleDownload(file.base64, file.name)} size="sm" shape="pill" className="text-[9px] px-5 py-2 uppercase font-black">Baixar</Button>
                                </div>
                            ))}
                            {(!project.files || project.files.length === 0) && <p className="text-gray-400 text-[10px] italic">Nenhum arquivo disponível.</p>}
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
                            {(!project.references || project.references.length === 0) && <p className="text-gray-400 text-[10px] italic">Nenhuma referência citada.</p>}
                        </div>
                    </section>
                </div>

                <div className="flex justify-center pt-10">
                    <Button 
                        onClick={() => navigate(-1)} 
                        shape="pill" 
                        className="font-black text-white uppercase text-[10px] tracking-[0.2em] px-14 py-4 shadow-xl hover:bg-black transition-all"
                    >
                        Voltar para Galeria
                    </Button>
                </div>
            </main>
        </div>
    );
};

export default ProjectView;
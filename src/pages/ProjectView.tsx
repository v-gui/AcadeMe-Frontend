/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';
import coloredLogo from '../assets/colored-logo.svg';
import UserIcon from '../assets/UserIcon.svg';
import logoPlaceholder from '../assets/white-logo.svg';
import { TextBar } from '../components/TextBar';
import { toast } from 'react-toastify';

// Interface para a busca de alunos no header
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
    
    // Estados do Projeto
    const [project, setProject] = useState<any>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    
    // Estados da Busca Global (Header)
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    // Estados do Usuário Logado
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    // Fecha o menu de conta ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsAccountMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 1. Busca os dados do projeto, alunos e usuário logado
    useEffect(() => {
        // Verifica login para o Header
        const savedUser = localStorage.getItem('@AcadeMe:user');
        if (savedUser) setCurrentUser(JSON.parse(savedUser));

        // Busca o projeto atual
        fetch(`${apiUrl}/projects/${id}`)
            .then(res => res.json())
            .then(data => setProject(data))
            .catch(err => console.error("Erro ao carregar projeto:", err));

        // Busca lista de alunos para a busca global
        fetch(`${apiUrl}/students`)
            .then(res => res.json())
            .then(data => setAlunos(data))
            .catch(err => console.error("Erro ao carregar lista de alunos:", err));
    }, [id, apiUrl]);

    // 2. Lógica de Filtro para o Dropdown do Header
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

    if (!project) return <div className="flex h-screen items-center justify-center font-bold text-[#003465] animate-pulse">Carregando projeto...</div>;

    return (
        <div className="bg-[#F0F2F5] min-h-screen pb-20 relative pt-20"> 
            
            {/** --- HEADER FIXO ACADEME (EXTREMIDADE A EXTREMIDADE) --- **/}
            <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-sm z-[1000] py-3 border-b border-gray-100">
                <div className="w-full flex items-center justify-between px-6 md:px-12">
                    
                    {/* Extremidade Esquerda: Logo */}
                    <div className="flex-shrink-0">
                        <img src={coloredLogo} alt="logo" className="h-10 cursor-pointer" onClick={() => navigate('/')} />
                    </div>
                    
                    {/* Centro: Barra de Pesquisa Global */}
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

                        {/** DROPDOWN DE RESULTADOS **/}
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

                    {/* Extremidade Direita: Menu de Conta ou Botão Login */}
                    <div className="flex-shrink-0 relative" ref={menuRef}>
                        {currentUser ? (
                            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}>
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

            {/* --- MODAL DE ZOOM --- */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 backdrop-blur-sm cursor-zoom-out p-4 md:p-10 animate-in fade-in duration-300"
                    onClick={() => setSelectedImage(null)}
                >
                    <button className="absolute top-10 right-10 text-white hover:text-blue-400"><span className="text-4xl font-light">×</span></button>
                    <img src={selectedImage} className="max-w-full max-h-full rounded-lg shadow-2xl animate-in zoom-in duration-300" />
                </div>
            )}
            
            {/* Header do Projeto (Capa e Título) */}
            <header className="bg-[#003465] text-white p-10 shadow-lg">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-start">
                    <img src={project.imageUrl || logoPlaceholder} alt="Capa" className="w-48 h-48 bg-white rounded-lg object-contain p-2 shadow-2xl" />
                    <div className="flex-1">
                        <h1 className="text-4xl font-black mb-2 leading-tight">{project.title}</h1>
                        <p className="text-blue-200 text-sm mb-4 uppercase font-bold tracking-widest"></p>
                        <p className="text-lg text-white/80 leading-relaxed max-w-3xl">{project.description}</p>
                        <div className="flex flex-wrap gap-2 mt-6">
                            {project.tags?.map((tag: string, i: number) => (
                                <span key={i} className="bg-blue-500/30 border border-blue-400/50 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-tighter">{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-10 space-y-12">
                {/* Visualização de Pôsteres */}
                {project.posters?.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-black text-[#003465] mb-6 border-b-4 border-blue-500 w-fit pb-1 uppercase tracking-wider">Pôsteres</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {project.posters.map((p: any, i: number) => (
                                <div key={i} className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-zoom-in group" onClick={() => setSelectedImage(p.url)}>
                                    <div className="relative overflow-hidden rounded-lg">
                                        <img src={p.url} className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="bg-white/90 text-[#003465] px-4 py-2 rounded-full text-xs font-black uppercase shadow-lg">Ampliar</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-left">
                        <h2 className="font-black text-[#003465] uppercase text-sm tracking-widest mb-6">Documentos</h2>
                        <div className="space-y-4">
                            {project.files?.map((file: any, i: number) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all group">
                                    <span className="text-blue-900 font-bold text-sm truncate max-w-[70%]">{file.name}</span>
                                    <Button onClick={() => handleDownload(file.base64, file.name)} size="sm" className="text-[10px] px-6 py-2 shadow-sm group-hover:bg-blue-600">Baixar</Button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-left">
                        <h2 className="font-black text-[#003465] uppercase text-sm tracking-widest mb-6">Referências</h2>
                        <div className="space-y-4">
                            {project.references?.map((ref: string, i: number) => (
                                <div key={i} className="border-l-4 border-blue-400 pl-4 py-2 bg-gray-50 rounded-r-xl">
                                    <a href={ref.startsWith('http') ? ref : `https://${ref}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 underline italic break-all font-medium">{ref}</a>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="flex justify-center pt-10">
                    <Button 
                        onClick={() => navigate(-1)} 
                        shape="pill" 
                        className="font-bold text-[#ffffff] uppercase text-xs tracking-[0.2em] px-12 py-4 hover:bg-black transition-all shadow-xl"
                    >
                        Voltar
                    </Button>
                </div>
            </main>
        </div>
    );
};

export default ProjectView;
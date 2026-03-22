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

    const [posters, setPosters] = useState<{url: string, name: string}[]>([]);
    const [files, setFiles] = useState<{name: string, date: string, base64?: string}[]>([]);
    const [references, setReferences] = useState<string[]>([]);
    const [refInput, setRefInput] = useState('');

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
            if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
                setIsTagDropdownVisible(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const savedUser = localStorage.getItem('@AcadeMe:user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUserId(parsedUser._id);
            setCurrentUser(parsedUser);
        } else {
            navigate('/login');
            return;
        }

        fetch(`${apiUrl}/students`).then(res => res.json()).then(data => setAlunos(data || []));

        if (editId) {
            fetch(`${apiUrl}/projects/${editId}`)
                .then(res => res.json())
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
                        const currentUserId = JSON.parse(savedUser)._id;
                        const others = data.students
                            .filter((s: any) => s.student && s.student._id !== currentUserId)
                            .map((s: any) => ({
                                student: s.student,
                                status: s.status || 'pending'
                            }));
                        setCollaborators(others);
                    }
                });
        }
    }, [editId, navigate, apiUrl]);

    const teamSearchResults = useMemo(() => {
        if (teamSearch.length < 2) return [];
        return alunos.filter(a => 
            a?.name?.toLowerCase().includes(teamSearch.toLowerCase()) &&
            a?._id !== userId && !collaborators.find(c => c.student?._id === a?._id)
        );
    }, [alunos, teamSearch, userId, collaborators]);

    const filteredAlunos = useMemo(() => {
        if (!searchTerm) return [];
        return alunos.filter(aluno => 
            aluno?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            aluno?.course?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [alunos, searchTerm]);

    const filteredTagOptions = useMemo(() => {
        if (!tagSearch) return [];
        return TAG_OPTIONS.filter(option => 
            option.toLowerCase().includes(tagSearch.toLowerCase()) && !tags.includes(option)
        );
    }, [tagSearch, tags]);

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

    const handleSaveProject = async () => {
        if (!title.trim() || !description.trim()) {
            toast.warn("Título e descrição são obrigatórios.");
            return;
        }
        setLoading(true);
        const studentsData = [
            { student: userId, status: 'accepted' },
            ...collaborators.map(c => ({ student: c.student?._id, status: c.status }))
        ];
        try {
            const endpoint = editId ? `${apiUrl}/projects/${editId}` : `${apiUrl}/projects`;
            const response = await fetch(endpoint, {
                method: editId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, imageUrl: imagePreview, students: studentsData, tags, posters, files, references })
            });
            if(response.ok) {
                toast.success("🚀 Sucesso!");
                navigate('/Profile');
            }
        } catch (error) { toast.error("Erro de conexão."); } finally { setLoading(false); }
    };

    return (
        <div className="upload-page bg-[#F0F2F5] min-h-screen pt-20">
            {/* --- HEADER FIXO --- */}
            <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-md z-[1000] h-20 flex items-center border-b border-gray-100"> 
                <div className="w-full flex items-center justify-between px-6 md:px-12 lg:px-20">
                    <img src={coloredLogo} alt="logo" className="h-10 cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/')} />
                    
                    <div className="flex-1 max-w-2xl mx-8 relative">
                        <TextBar variant="default" placeholder="Pesquisar outros talentos..." value={searchTerm} onChange={(e: any) => { setSearchTerm(e.target.value); setIsDropdownVisible(true); }} onBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)} />
                        {searchTerm && isDropdownVisible && (
                            <div className="absolute top-full left-0 w-full bg-white shadow-2xl rounded-b-2xl mt-1 border border-gray-100 overflow-hidden z-[1100] text-left">
                                {filteredAlunos.map(aluno => (
                                    <div key={aluno?._id} onClick={() => navigate(`/student/${aluno?._id}`)} className="flex items-center gap-3 p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-none">
                                        <Avatar name={aluno?.name} image={aluno?.profileImage} size="sm" />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[#003465] text-xs">{aluno?.name}</span>
                                            <span className="text-gray-400 text-[10px] uppercase font-bold">{aluno?.course}</span>
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

            {/* --- ÁREA DO PROJETO --- */}
            <div className="w-full px-6 md:px-12 lg:px-20 mt-6 text-left">
                <header className="bg-[#003465] text-white p-6 md:p-10 rounded-[40px] shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr_240px] gap-8 items-start">
                        
                        {/* COLUNA 1: CAPA */}
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

                        {/* COLUNA 2: TÍTULO E DESCRIÇÃO */}
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

                        {/* COLUNA 3: EQUIPE */}
                        <div className="bg-white/[0.02] backdrop-blur-xl rounded-[28px] p-4 md:p-5 border border-white/[0.08] flex flex-col gap-4 shadow-xl">
                            <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
                                <h3 className="text-white/80 text-[9px] font-black uppercase tracking-widest">Equipe</h3>
                                <span className="bg-blue-600/40 text-blue-100 text-[7px] px-2 py-0.5 rounded-full font-black uppercase">
                                    {collaborators.length + 1} MEMBROS
                                </span>
                            </div>

                            <input 
                                className="w-full bg-white/5 border border-white/5 rounded-lg py-2 px-3 text-[10px] text-white outline-none focus:bg-white/10 transition-all placeholder:text-white/10" 
                                value={teamSearch} 
                                onChange={(e) => {setTeamSearch(e.target.value); setIsTeamDropdownVisible(true);}} 
                                placeholder="Convidar..." 
                            />
                            
                            {teamSearch && isTeamDropdownVisible && teamSearchResults.length > 0 && (
                                <div className="absolute mt-24 left-4 right-4 bg-[#002a52] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden text-left">
                                    {teamSearchResults.map(s => (
                                        <div key={s?._id} onClick={() => {setCollaborators([...collaborators, { student: s, status: 'pending' }]); setTeamSearch(''); setIsTeamDropdownVisible(false);}} className="p-2.5 hover:bg-white/10 cursor-pointer flex items-center gap-2.5 transition-colors">
                                            <Avatar name={s?.name} image={s?.profileImage} size="sm" />
                                            <span className="text-white text-[9px] font-bold">{s?.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[280px] custom-scrollbar pr-1">
                                <div className="flex items-center gap-2.5 bg-white/5 p-2.5 rounded-lg border border-white/5">
                                    <Avatar name={currentUser?.name} image={currentUser?.profileImage} size="sm" />
                                    <div className="flex flex-col text-left">
                                        <span className="text-white font-bold text-[12px]">{currentUser?.name?.split(' ')[0] || "Você"}</span>
                                        <span className="text-blue-400 text-[8px] font-black uppercase">Membro</span>
                                    </div>
                                </div>
                                {collaborators.map(c => (
                                    <div key={c.student?._id} className="group flex items-center gap-2.5 p-2 rounded-lg border border-transparent hover:bg-white/5 transition-all">
                                        <Avatar name={c.student?.name} image={c.student?.profileImage} size="sm" className={c.status === 'accepted' ? 'opacity-100' : 'opacity-40'} />
                                        <div className="flex-1 flex flex-col text-left">
                                            <span className={`font-bold text-[12px] ${c.status === 'accepted' ? 'text-white' : 'text-white/50'}`}>{c.student?.name}</span>
                                            <span className={`text-[8px] font-black uppercase tracking-tighter ${c.status === 'accepted' ? 'text-green-400' : c.status === 'pending' ? 'text-yellow-500' : 'text-red-400'}`}>
                                                {c.status === 'accepted' ? 'Membro' : c.status === 'pending' ? 'Pendente' : 'Recusado'}
                                            </span>
                                        </div>
                                        <button onClick={() => setCollaborators(collaborators.filter(i => i.student?._id !== c.student?._id))} className="opacity-0 group-hover:opacity-100 text-red-400 text-xs">✕</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </header>
            </div>

            {/* --- SEÇÕES INFERIORES --- */}
            <main className="w-full px-6 md:px-12 lg:px-20 py-10 space-y-12">
                {/* Pôsteres, Documentação e Referências continuam iguais... */}
                <section className="text-left">
                    <h2 className="text-xl font-black text-[#003465] mb-6 border-b-4 border-[#006ACB] w-fit pb-1 uppercase tracking-tighter">Pôsteres</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <input type="file" ref={posterInputRef} onChange={handlePosterUpload} className="hidden" accept="image/*" multiple />
                        {posters.map((p, i) => (
                            <div key={i} className="bg-white p-1.5 rounded-[20px] border border-gray-100 relative group overflow-hidden shadow-sm">
                                <img src={p.url} className="rounded-[14px] w-full h-48 object-cover" />
                                <button onClick={() => setPosters(posters.filter((_, idx) => idx !== i))} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all font-bold shadow-lg text-sm">✕</button>
                            </div>
                        ))}
                        <button onClick={() => posterInputRef.current?.click()} className="bg-gray-100/50 border-4 border-dashed border-gray-200 rounded-[20px] h-48 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-200 transition-all">
                            <Icon iconCenter="add" className="w-8 h-8 mb-1" /><span className="font-black text-[9px] uppercase">Novo Pôster</span>
                        </button>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                                    <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-red-400 font-black text-sm">✕</button>
                                </div>
                           ))}
                        </div>
                    </section>

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
                                        <button onClick={() => setReferences(references.filter((_, idx) => idx !== i))} className="text-red-400 ml-4">✕</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                <div className="flex justify-center gap-6 py-6 pb-20">
                    <Button onClick={() => navigate('/Profile')} shape="pill" className="font-black text-white border-2 border-gray-200 uppercase text-[10px] tracking-[0.2em] px-12 py-4">Cancelar</Button>
                    <Button className="font-black text-white uppercase text-[10px] tracking-[0.2em] px-16 py-4 shadow-2xl shadow-blue-200" shape="pill" onClick={handleSaveProject} disabled={loading}>
                        {loading ? "..." : editId ? "Salvar" : "Publicar"}
                    </Button>
                </div>
            </main>
        </div>
    );
};

export default Upload;
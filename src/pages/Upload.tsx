/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect, useRef } from 'react';
import './Upload.css';
import logoPlaceholder from '../assets/white-logo.svg'; 
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';
import { toast } from 'react-toastify'; // Importando as notificações

const Upload: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit'); 
    
    const coverInputRef = useRef<HTMLInputElement>(null);
    const fileUploadRef = useRef<HTMLInputElement>(null);
    const posterInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const [posters, setPosters] = useState<{url: string, name: string}[]>([]);
    const [files, setFiles] = useState<{name: string, date: string, base64?: string}[]>([]);
    const [references, setReferences] = useState<string[]>([]);
    const [refInput, setRefInput] = useState('');

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    // 1. CARREGAR DADOS INICIAIS
    useEffect(() => {
        const savedUser = localStorage.getItem('@AcadeMe:user');
        if (savedUser) {
            setUserId(JSON.parse(savedUser)._id);
        } else {
            navigate('/login');
            return;
        }

        if (editId) {
            fetch(`${apiUrl}/projects/${editId}`)
                .then(res => res.json())
                .then(data => {
                    setTitle(data.title);
                    setDescription(data.description);
                    if (data.tags) setTags(data.tags);
                    if (data.imageUrl) setImagePreview(data.imageUrl);
                    if (data.posters) setPosters(data.posters);
                    if (data.files) setFiles(data.files);
                    if (data.references) setReferences(data.references);
                })
                .catch(err => {
                    console.error("Erro ao carregar projeto:", err);
                    toast.error("Não foi possível carregar os dados do projeto.");
                });
        } else {
            const savedDraft = localStorage.getItem('@AcadeMe:project_draft');
            if (savedDraft) {
                const parsed = JSON.parse(savedDraft);
                setPosters(parsed.posters || []);
                setFiles(parsed.files || []);
                setReferences(parsed.references || []);
                if(parsed.title) setTitle(parsed.title);
                if(parsed.description) setDescription(parsed.description);
            }
        }
    }, [editId, navigate, apiUrl]);

    // 2. PERSISTÊNCIA DE RASCUNHO
    useEffect(() => {
        if (!editId) {
            const draft = { posters, files, references, title, description };
            localStorage.setItem('@AcadeMe:project_draft', JSON.stringify(draft));
        }
    }, [posters, files, references, title, description, editId]);

    // --- FUNÇÕES AUXILIARES ---

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleDownloadFile = (base64: string, fileName: string) => {
        const link = document.createElement("a");
        link.href = base64;
        link.download = fileName;
        link.click();
        toast.info(`Baixando: ${fileName}`);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles) {
            const newFilesArray = [...files];
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                const base64 = await convertToBase64(file);
                newFilesArray.push({
                    name: file.name,
                    date: new Date().toLocaleDateString(),
                    base64: base64
                });
            }
            setFiles(newFilesArray);
            toast.success(`${selectedFiles.length} arquivo(s) importado(s).`);
        }
        e.target.value = ''; 
    };

    const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles) {
            const newPostersArray = [...posters];
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                const base64 = await convertToBase64(file);
                newPostersArray.push({ url: base64, name: file.name });
            }
            setPosters(newPostersArray);
            toast.success("Pôster adicionado com sucesso!");
        }
        e.target.value = '';
    };

    const handleAddReference = () => {
        if (refInput.trim()) {
            setReferences([...references, refInput.trim()]);
            setRefInput('');
            toast.info("Referência adicionada.");
        }
    };

    const handleSaveProject = async () => {
        if (!title.trim() || !description.trim()) {
            toast.warn("O título e a descrição são obrigatórios!");
            return;
        }

        setLoading(true);
        try {
            const method = editId ? 'PUT' : 'POST';
            const endpoint = editId ? `${apiUrl}/projects/${editId}` : `${apiUrl}/projects`;
            
            const response = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title, description, tags, imageUrl: imagePreview,
                    student: userId, posters, files, references
                })
            });

            if(response.ok) {
                localStorage.removeItem('@AcadeMe:project_draft');
                toast.success(editId ? "✨ Projeto atualizado!" : "🚀 Projeto publicado com sucesso!");
                navigate('/Profile');
            } else {
                const errData = await response.json();
                toast.error(`Erro: ${errData.error || "Não foi possível salvar."}`);
            }
        } catch (error) {
            toast.error("📡 Erro de conexão. Verifique o tamanho das fotos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-page bg-[#F0F2F5] min-h-screen">
            <Navbar />

            <header className="bg-[#003465] text-white p-10 shadow-lg">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-start">
                    <div className="relative shrink-0">
                        <input type="file" ref={coverInputRef} onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if(file) {
                                setImagePreview(await convertToBase64(file));
                                toast.info("Capa do projeto atualizada.");
                            }
                        }} className="hidden" accept="image/*" />
                        
                        <div onClick={() => coverInputRef.current?.click()} className="w-48 h-48 bg-white rounded-lg flex items-center justify-center p-2 shadow-2xl cursor-pointer hover:scale-105 transition-transform overflow-hidden">
                            <img src={imagePreview || logoPlaceholder} alt="Capa" className="w-full h-full object-contain" />
                        </div>
                    </div>

                    <div className="flex-1 w-full space-y-4">
                        <input className="bg-transparent text-4xl font-black border-none outline-none w-full placeholder:text-white/30" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do Projeto" />
                        <p className="text-blue-200 text-sm">Grade Curricular &gt; Análise e Desenvolvimento de Sistemas</p>
                        <textarea className="bg-transparent border-none outline-none w-full text-lg resize-none placeholder:text-white/50" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva seu feito..." rows={2} />
                        
                        <div className="flex flex-wrap items-center gap-2 p-2 bg-white/10 rounded-lg border border-white/20">
                            {tags.map((tag, i) => (
                                <span key={i} className="bg-blue-500 text-[10px] px-2 py-1 rounded flex items-center gap-1 font-bold">
                                    {tag} <button onClick={() => setTags(tags.filter((_, idx) => idx !== i))}>×</button>
                                </span>
                            ))}
                            <input className="bg-transparent outline-none text-xs flex-1 text-white" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => {
                                if(e.key === 'Enter' && tagInput.trim()) { 
                                    e.preventDefault();
                                    setTags([...tags, tagInput.trim()]); 
                                    setTagInput(''); 
                                }
                            }} placeholder="Adicionar tag..." />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-10 space-y-12">
                <section>
                    <h2 className="text-2xl font-black text-[#003465] mb-6 border-b-4 border-blue-500 w-fit pb-1 uppercase tracking-wider">Pôsteres</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <input type="file" ref={posterInputRef} onChange={handlePosterUpload} className="hidden" accept="image/*" multiple />
                        {posters.map((p, i) => (
                            <div key={i} className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 relative group">
                                <img src={p.url} className="rounded-lg w-full h-56 object-cover" alt="Poster" />
                                <button 
                                    onClick={() => {
                                        setPosters(posters.filter((_, idx) => idx !== i));
                                        toast.info("Pôster removido.");
                                    }} 
                                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold text-lg shadow-md opacity-0 group-hover:opacity-100"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <button onClick={() => posterInputRef.current?.click()} className="bg-gray-100 border-4 border-dashed border-gray-200 rounded-xl h-56 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
                            <Icon iconCenter="add" className="w-10 h-10" />
                            <span className="font-black text-[10px] uppercase mt-2">Adicionar pôster</span>
                        </button>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b flex justify-between items-center h-16">
                            <h2 className="font-bold text-[#003465] uppercase text-sm tracking-wider">Arquivos</h2>
                            <input type="file" ref={fileUploadRef} onChange={handleFileUpload} className="hidden" multiple />
                            <button onClick={() => fileUploadRef.current?.click()} className="bg-[#006ACB] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black flex items-center gap-2 transition-all">
                                Importar <Icon iconCenter="add" className="w-3 h-3"/>
                            </button>
                        </div>
                        <div className="p-0 min-h-[250px]">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold">
                                    <tr><th className="px-6 py-3">Nome</th><th className="px-6 py-3 text-right">Ações</th></tr>
                                </thead>
                                <tbody>
                                    {files.map((file, i) => (
                                        <tr key={i} className="border-t hover:bg-blue-50 transition-colors">
                                            <td className="px-6 py-4 text-blue-600 font-bold text-sm">
                                                <button onClick={() => file.base64 && handleDownloadFile(file.base64, file.name)} className="hover:underline">{file.name}</button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => {
                                                    setFiles(files.filter((_, idx) => idx !== i));
                                                    toast.info("Arquivo removido.");
                                                }} className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white font-bold text-lg">×</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b flex justify-between items-center h-16">
                            <h2 className="font-bold text-[#003465] uppercase text-sm tracking-wider">Referências</h2>
                            <button onClick={handleAddReference} className="bg-[#006ACB] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black flex items-center gap-2 transition-all">
                                Adicionar <Icon iconCenter="add" className="w-3 h-3"/>
                            </button>
                        </div>
                        <div className="p-6 min-h-[250px] space-y-4">
                            <input className="w-full bg-gray-50 border-b-2 border-gray-200 py-2 text-sm outline-none focus:border-blue-500" placeholder="Link ou referência ABNT..." value={refInput} onChange={(e) => setRefInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddReference()} />
                            <div className="space-y-3">
                                {references.map((ref, i) => (
                                    <div key={i} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg border-l-4 border-blue-400 group">
                                        <a 
                                            href={ref.startsWith('http') ? ref : `https://${ref}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-600 hover:text-blue-800 underline italic break-all flex-1 leading-relaxed"
                                        >
                                            {ref}
                                        </a>
                                        <button 
                                            onClick={() => {
                                                setReferences(references.filter((_, idx) => idx !== i));
                                                toast.info("Referência removida.");
                                            }} 
                                            className="text-red-400 hover:text-red-600 font-bold ml-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                <div className="flex justify-center items-center gap-4 pb-20">
                    <Button shape="pill" onClick={() => navigate('/Profile')} className="font-bold text-white uppercase text-sm">Voltar</Button>
                    <Button shape="pill" className="font-bold text-white uppercase text-sm" onClick={handleSaveProject} disabled={loading}>
                        {loading ? "Salvando..." : editId ? "Salvar" : "Publicar"}
                    </Button>
                </div>
            </main>
        </div>
    );
};

export default Upload;
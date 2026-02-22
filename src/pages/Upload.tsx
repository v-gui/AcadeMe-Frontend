import React, { useState, useEffect, useRef } from 'react';
import './Upload.css';
import logoPlaceholder from '../assets/QueimaFitLogo.svg'; 
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';

const Upload: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit'); 
    
    // --- REFS PARA INPUTS OCULTOS ---
    const coverInputRef = useRef<HTMLInputElement>(null);
    const fileUploadRef = useRef<HTMLInputElement>(null);
    // 1. NOVA REF PARA PÔSTERES
    const posterInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<any>(null);

    const [posters, setPosters] = useState<{url: string, name: string}[]>([]);
    const [files, setFiles] = useState<{name: string, date: string, base64?: string}[]>([]);
    const [references, setReferences] = useState<string[]>([]);
    const [refInput, setRefInput] = useState('');

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    useEffect(() => {
        const savedUser = localStorage.getItem('@AcadeMe:user');
        if (savedUser) {
            setUserId(JSON.parse(savedUser)._id);
        } else {
            navigate('/Login');
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
                .catch(err => console.error(err));
        }
    }, [editId, navigate, apiUrl]);

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
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
        }
    };

    // 2. NOVA FUNÇÃO PARA UPLOAD DE PÔSTERES DO PC
    const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles) {
            const newPostersArray = [...posters];
            // Permite selecionar múltiplos pôsteres de uma vez
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                const base64 = await convertToBase64(file);
                newPostersArray.push({
                    url: base64, // A URL agora é a string Base64 da imagem
                    name: file.name // Usamos o nome real do arquivo
                });
            }
            setPosters(newPostersArray);
        }
        // Limpa o input para permitir selecionar o mesmo arquivo novamente se necessário
        e.target.value = '';
    };

    const handleAddReference = () => {
        if (refInput.trim()) {
            setReferences([...references, refInput.trim()]);
            setRefInput('');
        }
    };
    
    // A antiga função addPoster com prompt foi removida

    const handleSaveProject = async () => {
        setLoading(true);
        try {
            const method = editId ? 'PUT' : 'POST';
            const endpoint = editId ? `${apiUrl}/projects/${editId}` : `${apiUrl}/projects`;
            await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title, description, tags, imageUrl: imagePreview,
                    student: userId, posters, files, references
                })
            });
            navigate('/Profile');
        } catch (error) {
            alert("Erro ao salvar. Verifique o tamanho das imagens.");
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
                            if(file) setImagePreview(await convertToBase64(file));
                        }} className="hidden" accept="image/*" />
                        
                        <div onClick={() => coverInputRef.current?.click()} className="w-48 h-48 bg-white rounded-lg flex items-center justify-center p-2 shadow-2xl cursor-pointer hover:scale-105 transition-transform overflow-hidden">
                            <img src={imagePreview || logoPlaceholder} alt="Capa" className="w-full h-full object-contain" />
                        </div>
                    </div>

                    <div className="flex-1 w-full space-y-4">
                        <input className="bg-transparent text-4xl font-black border-none outline-none w-full placeholder:text-white/30" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do Projeto" />
                        <p className="text-blue-200 text-sm">Grade Curricular &gt; ADS &gt; Engenharia de Software</p>
                        <textarea className="bg-transparent border-none outline-none w-full text-lg resize-none placeholder:text-white/50" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva seu feito..." rows={2} />
                        
                        <div className="flex flex-wrap items-center gap-2 p-2 bg-white/10 rounded-lg border border-white/20">
                            {tags.map((tag, i) => (
                                <span key={i} className="bg-blue-500 text-[10px] px-2 py-1 rounded flex items-center gap-1 font-bold">
                                    {tag} <button onClick={() => setTags(tags.filter((_, idx) => idx !== i))}>×</button>
                                </span>
                            ))}
                            <input className="bg-transparent outline-none text-xs flex-1 text-white" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => {
                                if(e.key === 'Enter' && tagInput.trim()) { setTags([...tags, tagInput.trim()]); setTagInput(''); }
                            }} placeholder="Adicionar tag..." />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-10 space-y-12">
                
                <section>
                    <h2 className="text-2xl font-black text-[#003465] mb-6 border-b-4 border-blue-500 w-fit pb-1 uppercase tracking-wider text-sm md:text-2xl">Pôsteres</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 3. INPUT OCULTO PARA PÔSTERES */}
                        <input type="file" ref={posterInputRef} onChange={handlePosterUpload} className="hidden" accept="image/*" multiple />
                        
                        {posters.map((p, i) => (
                            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative group">
                                {/* Exibe a imagem em Base64 */}
                                <img src={p.url} className="rounded-lg mb-2 w-full h-40 object-cover" alt={p.name} />
                                <div className="flex justify-between items-center">
                                    {/* Mostra o nome real do arquivo */}
                                    <span className="text-gray-500 font-bold text-xs truncate">{p.name}</span>
                                    <button onClick={() => setPosters(posters.filter((_, idx) => idx !== i))} className="bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                        <Icon iconCenter="trash" className="w-3 h-3"/>
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        {/* 4. BOTÃO AGORA CLICA NO REF DO INPUT */}
                        <button onClick={() => posterInputRef.current?.click()} className="bg-gray-100 border-4 border-dashed border-gray-200 rounded-xl h-56 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
                            <Icon iconCenter="add" className="w-10 h-10" />
                            <span className="font-black text-[10px] uppercase mt-2">Adicionar pôster</span>
                        </button>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* SEÇÃO ARQUIVOS */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b flex justify-between items-center h-16">
                            <h2 className="font-bold text-[#003465] uppercase text-sm tracking-wider">Arquivos</h2>
                            <input type="file" ref={fileUploadRef} onChange={handleFileUpload} className="hidden" multiple />
                            <button onClick={() => fileUploadRef.current?.click()} className="bg-[#006ACB] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#0056a1] flex items-center gap-2 transition-all">
                                Importar <Icon iconCenter="add" className="w-3 h-3"/>
                            </button>
                        </div>
                        <div className="p-0 min-h-[250px]">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold">
                                    <tr><th className="px-6 py-3">Nome</th><th className="px-6 py-3">Data</th><th className="px-6 py-3 text-right">Ação</th></tr>
                                </thead>
                                <tbody>
                                    {files.map((file, i) => (
                                        <tr key={i} className="border-t hover:bg-blue-50 transition-colors">
                                            <td className="px-6 py-4 text-blue-600 font-bold text-sm truncate max-w-[200px]">{file.name}</td>
                                            <td className="px-6 py-4 text-gray-400 text-xs">{file.date}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600">
                                                    <Icon iconCenter="trash" className="w-4 h-4"/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {files.length === 0 && <p className="text-gray-300 text-xs italic text-center mt-20">Nenhum arquivo importado.</p>}
                        </div>
                    </section>

                    {/* SEÇÃO REFERÊNCIAS */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b flex justify-between items-center h-16">
                            <h2 className="font-bold text-[#003465] uppercase text-sm tracking-wider">Referências</h2>
                            <button onClick={handleAddReference} className="bg-[#003465] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black flex items-center gap-2 transition-all">
                                Adicionar <Icon iconCenter="add" className="w-3 h-3"/>
                            </button>
                        </div>
                        <div className="p-6 min-h-[250px] space-y-4">
                            <div className="flex gap-2">
                                <input 
                                    className="flex-1 bg-gray-50 border-b-2 border-gray-200 py-2 text-sm outline-none focus:border-blue-500 transition-colors placeholder:italic"
                                    placeholder="Insira um link ou referência ABNT..."
                                    value={refInput}
                                    onChange={(e) => setRefInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddReference()}
                                />
                            </div>

                            <div className="space-y-3 mt-4">
                                {references.map((ref, i) => (
                                    <div key={i} className="flex justify-between items-start gap-4 p-3 bg-gray-50 rounded-lg group border-l-4 border-blue-400">
                                        <p className="text-xs text-gray-600 italic break-all leading-relaxed">{ref}</p>
                                        <button onClick={() => setReferences(references.filter((_, idx) => idx !== i))} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Icon iconCenter="trash" className="w-3 h-3"/>
                                        </button>
                                    </div>
                                ))}
                                {references.length === 0 && <p className="text-gray-300 text-xs italic text-center mt-10">Nenhuma referência bibliográfica adicionada.</p>}
                            </div>
                        </div>
                    </section>
                </div>

                <div className="flex justify-center pb-20">
                    <Button size="default" shape="pill" className="px-24 py-6 text-xl font-black shadow-2xl hover:scale-105 transition" onClick={handleSaveProject} disabled={loading}>
                        {loading ? "Processando..." : editId ? "Salvar Alterações" : "Publicar Projeto"}
                    </Button>
                </div>
            </main>
        </div>
    );
};

export default Upload;
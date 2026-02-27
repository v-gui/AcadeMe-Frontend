import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Icon } from '../components/Icon';
import { Button } from '../components/Button';
import logoPlaceholder from '../assets/QueimaFitLogo.svg';

const ProjectView: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState<any>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null); // Estado para o Zoom
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    useEffect(() => {
        fetch(`${apiUrl}/projects/${id}`)
            .then(res => res.json())
            .then(data => setProject(data))
            .catch(err => console.error(err));
    }, [id, apiUrl]);

    const handleDownload = (base64: string, name: string) => {
        const link = document.createElement("a");
        link.href = base64;
        link.download = name;
        link.click();
    };

    if (!project) return <div className="flex h-screen items-center justify-center font-bold text-[#003465]">Carregando projeto...</div>;

    return (
        <div className="bg-[#F0F2F5] min-h-screen pb-20 relative">
            <Navbar />
            
            {/* --- MODAL DE ZOOM (LIGHTBOX) --- */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 backdrop-blur-sm cursor-zoom-out p-4 md:p-10 animate-in fade-in duration-300"
                    onClick={() => setSelectedImage(null)}
                >
                    <button 
                        className="absolute top-10 right-10 text-white hover:text-blue-400 transition-colors"
                        onClick={() => setSelectedImage(null)}
                    >
                        <span className="text-4xl font-light">×</span>
                    </button>
                    <img 
                        src={selectedImage} 
                        alt="Zoom do pôster" 
                        className="max-w-full max-h-full rounded-lg shadow-2xl animate-in zoom-in duration-300"
                    />
                </div>
            )}
            
            {/* Header com Capa e Título */}
            <header className="bg-[#003465] text-white p-10 shadow-lg">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-start">
                    <img src={project.imageUrl || logoPlaceholder} alt="Capa" className="w-48 h-48 bg-white rounded-lg object-contain p-2 shadow-2xl" />
                    <div className="flex-1">
                        <h1 className="text-4xl font-black mb-2 leading-tight">{project.title}</h1>
                        <p className="text-blue-200 text-sm mb-4 uppercase font-bold tracking-widest">Análise e Desenvolvimento de Sistemas</p>
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
                {/* Visualização de Pôsteres com Click para Zoom */}
                {project.posters?.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-black text-[#003465] mb-6 border-b-4 border-blue-500 w-fit pb-1 uppercase tracking-wider">Pôsteres</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {project.posters.map((p: any, i: number) => (
                                <div 
                                    key={i} 
                                    className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-zoom-in group"
                                    onClick={() => setSelectedImage(p.url)}
                                >
                                    <div className="relative overflow-hidden rounded-lg">
                                        <img 
                                            src={p.url} 
                                            className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500" 
                                            alt="Poster do projeto" 
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="bg-white/90 text-[#003465] px-4 py-2 rounded-full text-xs font-black uppercase shadow-lg">Clique para ampliar</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Lista de Arquivos para Download */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <h2 className="font-black text-[#003465] uppercase text-sm tracking-widest mb-6 flex items-center gap-2">
                             Documentos
                        </h2>
                        <div className="space-y-4">
                            {project.files?.map((file: any, i: number) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200 group">
                                    <span className="text-blue-900 font-bold text-sm truncate max-w-[70%]">{file.name}</span>
                                    <Button onClick={() => handleDownload(file.base64, file.name)} size="sm" className="text-[10px] px-6 py-2 shadow-sm group-hover:bg-blue-600">Baixar</Button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Referências Bibliográficas */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <h2 className="font-black text-[#003465] uppercase text-sm tracking-widest mb-6 flex items-center gap-2">
                             Referências
                        </h2>
                        <div className="space-y-4">
                            {project.references?.map((ref: string, i: number) => (
                                <div key={i} className="border-l-4 border-blue-400 pl-4 py-2 bg-gray-50 rounded-r-xl">
                                    <a 
                                        href={ref.startsWith('http') ? ref : `https://${ref}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:text-blue-800 underline italic break-all leading-relaxed font-medium"
                                    >
                                        {ref}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="flex justify-center pt-10">
                    <Button 
                        onClick={() => navigate(-1)} 
                        shape="pill" 
                        className="font-bold text-[#ffffff] uppercase text-xs tracking-[0.2em] px-12 py-4 hover:bg-black flex items-center gap-3 transition-all shadow-xl"
                    >
                        Voltar ao Perfil
                    </Button>
                </div>
            </main>
        </div>
    );
};

export default ProjectView;
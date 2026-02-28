/* eslint-disable jsx-a11y/alt-text */
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Button } from '../components/Button';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import UserIcon from '../assets/UserIcon.svg';
import { useNavigate } from 'react-router-dom';
import logoBlockchain from '../assets/logoBlockchain.svg';
import { TextBar } from '../components/TextBar';
import { Icon } from '../components/Icon';
import { toast } from 'react-toastify'; // Importando o toast

interface UserData {
    _id: string;
    name: string;
    email: string;
    course: string;
    bio: string;
    interests: string[];
    profileImage?: string; 
}

const INTEREST_OPTIONS = [
    "Tecnologia", "Inovação", "Design", "Economia", 
    "Marketing", "Educação", "Ciência", "Artes", 
    "Gestão", "Programação", "Saúde", "Direito",
    "Python", "React", "Node.js", "Blockchain", "Inteligência Artificial"
];

const Profile: React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement>(null); 
    const navigate = useNavigate();
    
    const [user, setUser] = useState<UserData | null>(null);
    const [projects, setProjects] = useState<any[]>([]);

    const [isEditingBio, setIsEditingBio] = useState(false);
    const [tempBio, setTempBio] = useState("");
    const [isEditingInterests, setIsEditingInterests] = useState(false);
    const [searchTerm, setSearchTerm] = useState(""); 
    const [projectSearchTerm, setProjectSearchTerm] = useState(""); 

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        fetch(`${apiUrl}/students/${parsedUser._id}/projects`)
            .then(res => res.json())
            .then(data => setProjects(data))
            .catch(err => {
                console.error("Erro ao buscar projetos:", err);
                toast.error("Não foi possível carregar seus projetos.");
            });
    }, [navigate]);

    const filteredProjects = useMemo(() => {
        return projects.filter(proj => 
            proj.title.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
            proj.description.toLowerCase().includes(projectSearchTerm.toLowerCase())
        );
    }, [projects, projectSearchTerm]);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return [];
        return INTEREST_OPTIONS.filter(option => 
            option.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !(user?.interests || []).includes(option)
        );
    }, [searchTerm, user?.interests]);

    const handleUpdateProfile = async (updates: Partial<UserData>, silent = false) => {
        if (!user) return;
        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/students/${user._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
                localStorage.setItem('@AcadeMe:user', JSON.stringify(updatedUser));
                if (!silent) toast.success('✨ Perfil atualizado com sucesso!');
            } else {
                toast.error('Erro ao salvar alterações.');
            }
        } catch (err) {
            console.error("Erro ao atualizar perfil:", err);
            toast.error('Houve um problema de conexão.');
        }
    };

    const openDeleteModal = (id: string) => {
        setIdToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!idToDelete) return;
        setIsDeleting(true);
        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/projects/${idToDelete}`, { method: 'DELETE' });
            if (res.ok) {
                setProjects(projects.filter(p => p._id !== idToDelete));
                toast.info('🗑️ Projeto removido do seu portfólio.');
                setShowDeleteModal(false);
            } else {
                toast.error('Erro ao excluir o projeto.');
            }
        } catch (error) {
            toast.error("Não foi possível conectar ao servidor.");
        } finally {
            setIsDeleting(false);
            setIdToDelete(null);
        }
    };

    const addInterest = (interest: string) => {
        const currentInterests = user?.interests || [];
        if (currentInterests.length >= 5) {
            toast.warning("🔒 Limite de 5 áreas de interesse atingido.");
            setSearchTerm("");
            return;
        }
        handleUpdateProfile({ interests: [...currentInterests, interest] }, true);
        toast.success(`${interest} adicionado!`);
        setSearchTerm("");
    };

    const removeInterest = (interest: string) => {
        if (!user) return;
        handleUpdateProfile({ interests: user.interests.filter(i => i !== interest) }, true);
        toast.info('Interesse removido.');
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && user) {
            if (file.size > 2000000) { // 2MB aprox
                toast.error("A imagem é muito grande. Tente uma menor.");
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                await handleUpdateProfile({ profileImage: reader.result as string }, true);
                toast.success('📸 Foto de perfil atualizada!');
            };
        }
    };

    if (!user) return <div className="flex h-screen items-center justify-center font-bold text-[#003465]">Carregando Dashboard...</div>;

    return (
        <div className="Profile flex flex-col min-h-screen bg-gray-50 relative">
            <Navbar />

            {/* MODAL DE EXCLUSÃO */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-10 max-w-sm w-[90%] shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                            <Icon iconCenter="trash" className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black text-[#003465] uppercase tracking-tighter">Excluir Projeto?</h3>
                        <p className="text-gray-500 text-sm my-4 leading-relaxed">Esta ação removerá o projeto permanentemente da sua vitrine.</p>
                        
                        <div className="flex flex-col w-full gap-3 mt-4">
                            <Button onClick={confirmDelete} disabled={isDeleting} className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-full shadow-lg transition-all active:scale-95">
                                {isDeleting ? "Excluindo..." : "Sim, Excluir"}
                            </Button>
                            <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 font-bold py-2 text-xs uppercase tracking-widest hover:text-gray-600">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="profile-section flex flex-col md:flex-row flex-grow">
                {/* Sidebar */}
                <div className="profile-sidebar hidden md:flex flex-col bg-gradient-to-b from-[#003465] to-[#006ACB] w-full min-w-80 md:w-[350px] shrink-0 p-8 text-white shadow-2xl">
                    <div className="profile-header flex flex-col items-center">
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                        <div className="relative group">
                            <img 
                                src={user.profileImage || UserIcon}
                                className="profile-image border-4 rounded-full border-white/30 p-1 w-36 h-36 mt-6 object-cover cursor-pointer hover:scale-105 transition shadow-xl"
                                onClick={() => fileInputRef.current?.click()}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <span className="bg-black/50 text-white text-[8px] px-2 py-1 rounded-full uppercase font-bold">Trocar Foto</span>
                            </div>
                        </div>
                        <h1 className="profile-name font-black mt-6 text-center text-2xl tracking-tighter leading-tight">{user.name}</h1>
                        <p className="text-blue-100/70 text-center text-sm mb-6 font-medium">{user.email}</p>
                        
                        <div className="w-full border-b border-white/10 my-4" />

                        <div className="w-full mb-6">
                            <label className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Curso</label>
                            <p className="text-white mt-2 font-bold text-sm leading-snug">{user.course}</p>
                        </div>

                        <div className="w-full border-b border-white/10 my-4" />
                        
                        <div className="w-full group">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Biografia</label>
                                {!isEditingBio ? (
                                    <button onClick={() => setIsEditingBio(true)} className="opacity-0 group-hover:opacity-100 transition text-[10px] font-bold underline text-blue-200 hover:text-white">Editar</button>
                                ) : (
                                    <button onClick={async () => {
                                        await handleUpdateProfile({ bio: tempBio });
                                        setIsEditingBio(false);
                                    }} className="text-[10px] font-bold text-green-300">Salvar</button>
                                )}
                            </div>
                            {isEditingBio ? (
                                <textarea 
                                    className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none h-24 italic resize-none"
                                    value={tempBio}
                                    onChange={(e) => setTempBio(e.target.value)}
                                />
                            ) : (
                                <p className="text-white text-sm italic leading-relaxed opacity-90">{user.bio || "Escreva uma breve biografia sobre seus objetivos acadêmicos..."}</p>
                            )}
                        </div>
                        
                        <div className="w-full border-b border-white/10 my-6" />

                        <div className="interest-area w-full">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-black text-white text-[11px] uppercase tracking-widest">Interesses</h2>
                                <button onClick={() => setIsEditingInterests(!isEditingInterests)} className="text-[10px] font-bold underline text-blue-200 hover:text-white">
                                    {isEditingInterests ? "Pronto" : "Gerenciar"}
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {(user?.interests || []).map((interest, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-white/20 text-white text-[10px] px-3 py-1 rounded-full uppercase font-bold border border-white/10 shadow-sm transition-all hover:bg-white/30">
                                        {interest}
                                        {isEditingInterests && (
                                            <button onClick={() => removeInterest(interest)} className="hover:text-red-300 transition-colors">✕</button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {isEditingInterests && (
                                <div className="relative animate-in slide-in-from-top-2 duration-300">
                                    <input 
                                        type="text" 
                                        placeholder="Buscar competência..."
                                        className="w-full bg-white/10 border border-white/20 rounded-full py-2 px-4 text-[10px] text-white focus:outline-none focus:bg-white/20 transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {filteredOptions.length > 0 && (
                                        <div className="absolute w-full mt-2 bg-white rounded-xl shadow-2xl overflow-hidden z-50">
                                            {filteredOptions.map(option => (
                                                <button key={option} onClick={() => addInterest(option)} className="w-full text-left px-4 py-3 text-[11px] font-bold text-[#003465] hover:bg-blue-50 border-b border-gray-50 last:border-none transition-colors">
                                                    + {option}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ÁREA DE PROJETOS */}
                <div className="projects-section flex flex-col h-auto w-full bg-gray-50 p-6 md:p-12 overflow-y-auto">
                    <div className="projects-filters flex flex-col lg:flex-row items-center justify-between w-full mb-10 gap-6">
                        <div className="w-full lg:w-[400px]">                             
                            <TextBar 
                                type='search' 
                                placeholder='O que você quer encontrar no seu portfólio?'                                 
                                className="bg-white shadow-sm text-gray-800 font-medium rounded-full"
                                value={projectSearchTerm}
                                onChange={(e: any) => setProjectSearchTerm(e.target.value || "")}
                            />
                        </div>

                        <Button shape="pill" className="p-4 px-8 w-full lg:w-auto justify-center shadow-lg hover:bg-black transition-all uppercase tracking-widest font-black text-xs" iconRight='add' onClick={() => navigate('/upload')}>
                            Novo Trabalho
                        </Button>
                    </div>

                    <div className="projects-list w-full space-y-8 pb-10">
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map((proj) => (
                                <ProjectCard
                                    key={proj._id}
                                    id={proj._id}
                                    title={proj.title}
                                    description={proj.description}
                                    tags={proj.tags || ["AcadeMe"]}
                                    date={new Date(proj.createdAt).toLocaleDateString()}
                                    imageUrl={proj.imageUrl || logoBlockchain} 
                                    onDelete={() => openDeleteModal(proj._id)}
                                    onEdit={(id) => navigate(`/upload?edit=${id}`)}
                                    onView={(id) => navigate(`/project/${id}`)}
                                />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 opacity-30 border-2 border-dashed border-gray-300 rounded-[32px] bg-white/50">
                                <Icon iconCenter="add" className="w-16 h-16 mb-4 text-gray-400" />
                                <p className="italic font-bold text-[#003465] text-lg uppercase tracking-tighter">
                                    {projectSearchTerm ? "Sem resultados para a busca." : "Nenhum projeto publicado."}
                                </p>
                                {!projectSearchTerm && (
                                    <button onClick={() => navigate('/upload')} className="mt-4 text-[#006ACB] font-black underline uppercase text-[10px] tracking-widest">Começar agora</button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
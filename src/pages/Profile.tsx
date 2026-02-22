import React, { useRef, useEffect, useState } from 'react';
import { Button } from '../components/Button';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import UserIcon from '../assets/UserIcon.svg';
import { useNavigate } from 'react-router-dom';
import logoBlockchain from '../assets/logoBlockchain.svg';
import { TextBar } from '../components/TextBar';

// Interface do Usuário
interface UserData {
    _id: string;
    name: string;
    email: string;
    course: string;
    bio: string;
    profileImage?: string; 
}

const Profile: React.FC = () => {
    const ref = useRef<HTMLButtonElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null); 
    const navigate = useNavigate();
    
    const [user, setUser] = useState<UserData | null>(null);
    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        const savedUser = localStorage.getItem('@AcadeMe:user');
        
        if (!savedUser) {
            navigate('/Login');
            return;
        }

        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);

        // Busca os projetos reais do aluno
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        fetch(`${apiUrl}/students/${parsedUser._id}/projects`)
            .then(res => res.json())
                // Ordena por data de criação (mais recente primeiro)
            .then(data => setProjects(data))
            .catch(err => console.error("Erro ao buscar projetos:", err));
    }, [navigate]);

    // --- FUNÇÕES DE PROJETO ---

    const handleDeleteProject = async (projectId: string) => {
        if (!window.confirm("Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.")) return;

        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/projects/${projectId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setProjects(projects.filter(p => p._id !== projectId));
                alert("Projeto removido com sucesso!");
            } else {
                alert("Não foi possível excluir o projeto.");
            }
        } catch (error) {
            console.error("Erro ao deletar:", error);
            alert("Erro de conexão com o servidor.");
        }
    };

    const handleEditProject = (projectId: string) => {
        navigate(`/Upload?edit=${projectId}`);
    };

    // --- FIM DAS FUNÇÕES DE PROJETO ---

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && user) {
            try {
                const base64 = await convertToBase64(file);
                const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
                
                const response = await fetch(`${apiUrl}/students/${user._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ profileImage: base64 })
                });

                if (response.ok) {
                    const updatedUser = await response.json();
                    setUser(updatedUser);
                    localStorage.setItem('@AcadeMe:user', JSON.stringify(updatedUser));
                    window.dispatchEvent(new Event('storage'));
                    alert("Foto de perfil atualizada!");
                }
            } catch (err) {
                console.error("Erro ao fazer upload da imagem:", err);
                alert("Erro ao carregar imagem.");
            }
        }
    };

    const handleGoToUpload = () => {
        navigate('/Upload');
    };

    if (!user) return <div className="flex h-screen items-center justify-center font-bold text-blue-600">Carregando...</div>;

    return (
        <div className="Profile flex flex-col min-h-screen">
            <Navbar />
            
            <div className="profile-section flex flex-col md:flex-row flex-grow">
                
                {/* Sidebar Dinâmica */}
                <div className="profile-sidebar hidden md:flex flex-col bg-gradient-to-b from-[#003465] to-[#006ACB] w-full min-w-80 md:w-[350px] shrink-0">
                    <div className="profile-header p-8">
                        
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageChange} 
                            className="hidden" 
                            accept="image/*" 
                        />

                        <img 
                            src={user.profileImage || UserIcon}
                            alt="Foto de perfil" 
                            className="profile-image relative z-50 border-4 rounded-full border-white p-1 w-36 h-36 mt-6 mx-auto object-cover cursor-pointer hover:brightness-110 active:scale-95 transition shadow-lg"
                            onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                            }}
                            title="Clique para alterar sua foto"
                        />
                        
                        <h1 className="profile-name font-extrabold mt-8 mb-2 text-center text-white text-2xl">
                            {user.name}
                        </h1>
                        <p className="text-blue-100 text-center text-sm mb-6">{user.email}</p>
                        
                        <div className="separator border-b border-white/20 my-4" />
                        
                        <label className="text-blue-200 text-xs font-bold uppercase">Biografia</label>
                        <p className="text-white mt-2 text-sm italic leading-relaxed">
                            {user.bio || "Escreva algo sobre você..."}
                        </p>
                        
                        <div className="separator border-b border-white/20 my-4" />
                        
                        <label className="text-blue-200 text-xs font-bold uppercase">Curso</label>
                        <p className="text-white mt-2 font-semibold">{user.course}</p>
                        
                        <div className="separator border-b border-white/20 my-4" />

                        <div className="interest-area">
                            <h2 className="font-extrabold mt-6 text-white">Áreas de Interesse</h2>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <span className="bg-white/20 text-white text-[10px] px-3 py-1 rounded-full uppercase font-bold">Tecnologia</span>
                                <span className="bg-white/20 text-white text-[10px] px-3 py-1 rounded-full uppercase font-bold">Inovação</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Área central - Projetos */}
                <div className="projects-section flex flex-col h-auto w-full bg-gray-50">
                    <div className="projects-filters flex flex-col sm:flex-row items-center justify-between w-full px-8 mt-10 gap-6">
                        <TextBar type='search' placeholder='Pesquisar projeto...' className="project-search-bar w-full sm:w-80 bg-white"/>

                        <Button ref={ref} size="default" shape="pill" className="p-4 w-64 justify-center" iconRight='add'
                        onClick={handleGoToUpload}>
                            Novo Projeto
                        </Button>
                    </div>

                    <div className="projects-list w-full px-8 mt-10 space-y-6 pb-10">
                        {projects.length > 0 ? (
                            projects.map((proj) => (
                                <ProjectCard
                                    key={proj._id}
                                    id={proj._id}
                                    title={proj.title}
                                    description={proj.description}
                                    tags={proj.tags || ["AcadeMe"]}
                                    date={new Date(proj.createdAt).toLocaleDateString()}
                                    
                                    /* MODIFICAÇÃO AQUI: Usa a imagem salva no banco ou o logo padrão */
                                    imageUrl={proj.imageUrl || logoBlockchain} 
                                    
                                    onDelete={handleDeleteProject}
                                    onEdit={handleEditProject}
                                />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 opacity-40">
                                <p className="italic">Nenhum projeto publicado ainda.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
import React, { useRef } from 'react';
import { Button } from '../components/Button';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import { TextArea } from '../components/TextArea';
import UserIcon from '../assets/UserIcon.svg';
import { useNavigate } from 'react-router-dom';
import logoBlockchain from '../assets/logoBlockchain.svg';
import logoVambora from '../assets/logoVamboraFatec.svg';
import logoRedeNeural from '../assets/logoRedeneural.svg';
import { TextBar } from '../components/TextBar';

const Profile: React.FC = () => {
    const ref = useRef<HTMLButtonElement | null>(null);
    const navigate = useNavigate();
    const handleGoToUpload = () => {
        navigate('/Upload');
    };

    return (
        <div className="Profile flex flex-col h-screen">
            {/* Barra de navegação */}
            <Navbar />
            <div className="profile-section flex flex-col md:flex-row flex-grow">
                {/* Sidebar do perfil */}
                <div className="profile-sidebar hidden md:flex flex-col bg-gradient-to-b from-[#003465] to-[#006ACB] w-full min-w-80 md:w-[300px] h-full">
                    <div className="profile-header p-6">
                        <img 
                            src={UserIcon}
                            alt="Foto de perfil" 
                            className="profile-image border-2 rounded-full border-white p-2 w-32 h-32 mt-6 mx-auto"
                        />
                        <h1 className="profile-name font-extrabold mt-10 mb-6 text-center text-white">Mikhael Canarinho Nóbrega</h1>
                        
                        {/* Barra de separação */}
                        <div className="separator border-b border-white my-4" />
                        <TextArea background="transparent" textColor="white" placeholder="Descrição do perfil..." className="w-full" />
                        
                        {/* Barra de separação */}
                        <div className="separator border-b border-white my-4" />
                        <TextArea background="transparent" textColor="white" placeholder="Curso..." className="w-full" />
                        
                        {/* Barra de separação */}
                        <div className="separator border-b border-white my-4" />

                        <div className="interest-area">
                            <h2 className="font-extrabold mt-8 text-white">Áreas de Interesse</h2>
                            <TextArea background="transparent" textColor="white" placeholder="Áreas de interesse..." className="w-full" />
                        </div>
                    </div>
                </div>

                {/* Área central - Projetos */}
                <div className="projects-section flex flex-col h-auto w-full">
                    {/* Filtros */}
                    <div className="projects-filters flex flex-col sm:flex-row items-center justify-between w-full px-4 sm:px-8 mt-6 md:gap-32 gap-6">
                        <TextBar type='search' placeholder='Pesquisar projeto...' className="project-search-bar w-auto sm:w-auto mb-4 sm:mb-0 p-2"/>

                        <Button ref={ref} size="default" shape="pill" className="p-4 w-64 justify-center" iconRight='add'
                        onClick={handleGoToUpload}>
                            Novo Projeto
                        </Button>


                    </div>
                    {/* Lista de Projetos */}
                    <div className="projects-list w-full px-4 sm:px-8 mt-6">
                        <ProjectCard
                            title="Blockchain"
                            description="Este trabalho apresenta a tecnologia blockchain, que organiza dados em blocos ligados de forma cronológica..."
                            tags={["Blockchain", "Criptografia Assimétrica", "Segurança da Informação"]}
                            date="03/12/2024"
                            imageUrl={logoBlockchain}
                        />
                        <ProjectCard
                            title="Vambora Fatec"
                            description="Projeto de aplicativo mobile para agendamento de caronas entre estudantes da Fatec."
                            tags={["Mobile", "Mobilidade Urbana", "Engenharia de Software"]}
                            date="15/10/2024"
                            imageUrl={logoVambora}
                        />
                        <ProjectCard
                            title="Rede Neural para Reconhecimento de Caracteres com Backpropagation"
                            description="Desenvolvimento de uma rede neural simples na linguagem Python para reconhecimento de padrões..."
                            tags={["Inteligência Artificial", "Backpropagation"]}
                            date="23/09/2024"
                            imageUrl={logoRedeNeural}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

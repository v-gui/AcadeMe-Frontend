/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Button } from '../components/Button';
import { TextBar } from '../components/TextBar';
import logo from '../assets/white-logo.svg';
import coloredLogo from '../assets/colored-logo.svg';
import classroom from '../assets/classroom.svg';
import studentsMoldure from '../assets/happy-students.svg';
import bioCaique from '../assets/Imagem bio Caique.svg';
import bioGui from '../assets/Imagem bio_ fundoGuilherme.svg';
import bioLucas from '../assets/Imagem bio_ fundoLucas.svg';
import stars from '../assets/Stars.svg';
import githubLogo from '../assets/GithubLogo.svg';
import moldure from '../assets/squares-moldure.svg';
import UserIcon from '../assets/UserIcon.svg';
import './Home.css';
import { useNavigate } from 'react-router-dom';
import StudentCard from '../components/StudentCard';
import { Icon } from '../components/Icon';
import { toast } from 'react-toastify';

interface Aluno {
    _id: string;
    name: string;
    course: string;
    bio: string;
    profileImage?: string; 
}

const Home: React.FC = () => {
    const navigate = useNavigate();
    const menuRef = useRef<HTMLDivElement>(null);
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    
    // Estados para Usuário Logado e Menu
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

    useEffect(() => {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        fetch(`${apiUrl}/students`)
            .then((res) => res.json())
            .then((data) => setAlunos(data))
            .catch((err) => console.error("Erro ao carregar vitrine:", err));

        // Verifica se há usuário logado
        const savedUser = localStorage.getItem('@AcadeMe:user');
        if (savedUser) setCurrentUser(JSON.parse(savedUser));

        // Fecha menu ao clicar fora
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsAccountMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    const handleGoToLogin = () => navigate('/login');
    const handleGoToSignUp = () => navigate('/signup');

    return (
        <div className="Home relative overflow-x-hidden pt-20"> 
            
            {/** --- HEADER FIXO ACADEME (EXTREMIDADE A EXTREMIDADE) --- **/}
            <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-md z-[1000] py-3  border-b border-gray-100">
                <div className="w-full flex items-center justify-between px-6 md:px-12">
                    
                    {/* Extremidade Esquerda: Logo */}
                    <div className="flex-shrink-0">
                        <img src={coloredLogo} alt="logo" className="h-10 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} />
                    </div>
                    
                    {/* Centro: Barra de Pesquisa */}
                    <div className="flex-1 max-w-2xl mx-8 relative">
                        <TextBar 
                            variant="default" 
                            placeholder="Pesquisar talentos ou cursos..." 
                            iconLeft="search" 
                            hideIconsOnInput 
                            value={searchTerm}
                            onChange={(e: any) => {
                                setSearchTerm(e.target.value);
                                setIsDropdownVisible(true);
                            }}
                            onBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)}
                        />

                        {searchTerm && isDropdownVisible && (
                            <div className="absolute top-full left-0 w-full bg-white shadow-2xl rounded-b-xl mt-1 border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200 text-left">
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

                    {/* Extremidade Direita: Conta ou Login */}
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
                            <div className="flex items-center gap-4">
                                <Button shape="pill" size="sm" className="text-xs font-bold px-6" onClick={handleGoToLogin}>Login</Button>
                                <Button shape="pill" size="sm" className="text-xs font-bold px-6" onClick={handleGoToSignUp}>Cadastre-se</Button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/** 1. TOP SECTION (HERO) **/}
            <section id="top-section" className="bg-gradient-to-br from-[#006ACB] to-[#003465] min-h-[90vh] flex items-center justify-center">
                <div className="top-container flex flex-col items-center justify-center text-center w-full px-6">
                    <img src={logo} alt="logo" className="w-32 md:w-48 mb-8" />
                    <h1 className='slogan text-[#f4f0f5] text-[32px] md:text-[50px] mb-[21px] font-medium leading-tight'>
                        Seja bem-vindo ao seu<br/>futuro acadêmico
                    </h1>
                    <div className="top-buttons-container flex flex-col md:flex-row items-center justify-center gap-4">
                        <Button size='default' shape='pill' className='font-bold min-w-[171px] hover:bg-black flex items-center justify-center gap-2 transition-all' onClick={handleGoToSignUp}>
                            Cadastre-se
                        </Button>
                        <Button size='default' shape='pill' className='font-bold min-w-[171px] hover:bg-black flex items-center justify-center gap-2 transition-all' onClick={handleGoToLogin}>
                            Login
                        </Button>
                    </div>
                </div>
            </section>

            {/** 2. SEARCH SECTION (O QUE É) **/}
            <section id="search-section" className="relative h-screen flex items-center justify-center px-8 md:px-16 bg-white">
                <div className="absolute inset-y-0 left-0 w-auto h-full hidden md:block">
                    <img src={moldure} alt="Moldura" className="h-full object-contain rotate-180 opacity-20" />
                </div>
                <div className="search-container relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-40 max-w-7xl">
                    <img src={classroom} alt="classroom" className="w-80 md:w-[500px]" />
                    <div className="search-content-body flex flex-col items-center text-center md:items-start md:text-left">
                        <h1 className='search-title text-[#006ACB] text-[28px] md:text-[40px] mb-4 font-bold'>O que é o AcadeMe?</h1>
                        <p className='about-search text-[#006ACB] text-[18px] md:text-[24px] mb-10 leading-relaxed'>
                            Com o AcadeMe o aluno é capaz de destacar toda a sua trajetória acadêmica, 
                            trazendo visibilidade para todas atividades feitas na faculdade e credibilidade para seus conhecimentos.
                        </p>
                    </div>
                </div>
            </section>
            
            {/** 3. SEÇÃO SHARE **/}
            <section id="share-section" className='bg-gradient-to-r from-[#006ACB] to-[#003465] min-h-screen flex items-center justify-center px-8 md:px-16'>
                <div className="share-container flex flex-col md:flex-row items-center gap-10 md:gap-56 max-w-7xl">
                    <div className="search-content-body flex flex-col items-center text-center md:items-start md:text-left">
                        <h1 className='share-title text-[#F0F2F5] text-[28px] md:text-[40px] mb-4 font-bold'>Compartilhe</h1>
                        <p className='about-share text-[#F0F2F5] text-[18px] md:text-[24px] mb-10 leading-relaxed'>
                            Você pode compartilhar seu portfólio com colegas, professores e possíveis recrutadores.
                        </p>
                    </div>
                    <img src={studentsMoldure} alt="happy-students" className="w-80 md:w-[500px]" />
                </div>
            </section>

            {/** 4. VITRINE DE ALUNOS (NOSSOS TALENTOS) - CENTRALIZADO **/}
            <section id="vitrine-section" className="py-24 bg-gray-50 flex flex-col items-center">
                <h1 className='text-[#006ACB] font-bold text-[28px] md:text-[40px] mb-20 text-center tracking-tighter'>Nossos Talentos</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-8 max-w-7xl w-full">
                    {alunos.map((aluno) => (
                        <StudentCard 
                            key={aluno._id}
                            id={aluno._id}
                            name={aluno.name}
                            course={aluno.course}
                            profileImage={aluno.profileImage}
                        />
                    ))}
                    {alunos.length === 0 && (
                        <p className="col-span-full text-center text-gray-400 italic py-10">Aguardando novos talentos se cadastrerem...</p>
                    )}
                </div>
            </section>

            {/** 5. FEEDBACK SECTION **/}
            <section id='feedback-section' className='bg-gradient-to-r from-[#006ACB] to-[#003465] py-24 px-6 relative flex flex-col items-center'>
                <h1 className='text-[#ffffff] font-bold text-[28px] md:text-[40px] mb-20 text-center'>Feedback dos Usuários</h1>
                <div className='feedback-container flex flex-col md:flex-row items-center justify-center gap-8 relative z-10 max-w-7xl mx-auto w-full'>
                    <div className='message-container flex flex-col items-center text-[#F0F2F5] bg-gradient-to-b from-[#006ACB] to-[#003465] w-full md:w-[380px] p-10 rounded-3xl gap-6 shadow-2xl transition-transform hover:scale-105'>
                        <div className='userinfo-container flex items-center gap-4'>
                            <img src={bioCaique} alt="Avatar" className='w-24' />
                            <span className='text-2xl font-bold'>Caíque C.</span>
                        </div>
                        <p className="text-center italic leading-relaxed">"Plataforma essencial para organizar meus trabalhos. Pude criar um portfólio que mostra tudo o que desenvolvi!"</p>
                        <img src={stars} alt="Avaliação" className='w-32' />
                    </div>
                    <div className='message-container flex flex-col items-center text-[#F0F2F5] bg-gradient-to-b from-[#006ACB] to-[#003465] w-full md:w-[380px] p-10 rounded-3xl gap-6 shadow-2xl transition-transform hover:scale-105'>
                        <div className='userinfo-container flex items-center gap-4'>
                            <img src={bioGui} alt="Avatar" className='w-24' />
                            <span className='text-2xl font-bold'>Guilherme V.</span>
                        </div>
                        <p className="text-center italic leading-relaxed">"O site me ajudou a apresentar meus trabalhos de forma profissional para recrutadores!"</p>
                        <img src={stars} alt="Avaliação" className='w-32' />
                    </div>
                    <div className='message-container flex flex-col items-center text-[#F0F2F5] bg-gradient-to-b from-[#006ACB] to-[#003465] w-full md:w-[380px] p-10 rounded-3xl gap-6 shadow-2xl transition-transform hover:scale-105'>
                        <div className='userinfo-container flex items-center gap-4'>
                            <img src={bioLucas} alt="Avatar" className='w-24' />
                            <span className='text-2xl font-bold'>Lucas M.</span>
                        </div>
                        <p className="text-center italic leading-relaxed">"Finalmente encontrei um lugar para centralizar todos os meus projetos da faculdade. Satisfeito!"</p>
                        <img src={stars} alt="Avaliação" className='w-32' />
                    </div>
                </div>
            </section>

            {/** 6. FOOTER **/}
            <footer className='footer-container flex flex-col md:flex-row items-center justify-between px-10 md:px-20 py-16 bg-white border-t border-gray-100'>
                <img src={coloredLogo} alt="Logo" className="w-32 mb-8 md:mb-0" />
                <ul className='grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-[#006ACB]'>
                    <li className='font-semibold hover:translate-x-2 transition'> 
                        <a href="https://github.com/caique18" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4"> 
                            <img src={githubLogo} alt="GitLogo" className='h-8 w-8'/><span>github.com/caique18</span>
                        </a>
                    </li>
                    <li className='font-semibold hover:translate-x-2 transition'> 
                        <a href="https://github.com/lucasmmps" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4"> 
                            <img src={githubLogo} alt="GitLogo" className='h-8 w-8'/><span>github.com/lucasmmps</span>
                        </a>
                    </li>                    
                    <li className='font-semibold hover:translate-x-2 transition'> 
                        <a href="https://github.com/v-gui" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4"> 
                            <img src={githubLogo} alt="GitLogo" className='h-8 w-8'/><span>github.com/v-gui</span>
                        </a>
                    </li>
                </ul>
            </footer>

            <img src={moldure} alt="Moldura" className="absolute bottom-0 right-0 z-0 pointer-events-none w-[500px] opacity-10 hidden md:block" />
        </div>
    );
}

export default Home;
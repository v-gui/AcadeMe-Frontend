import React, { useRef, useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { TextBar } from '../components/TextBar';
import logo from '../assets/white-logo.svg';
import classroom from '../assets/classroom.svg';
import studentsMoldure from '../assets/happy-students.svg';
import bioCaique from '../assets/Imagem bio Caique.svg';
import bioGui from '../assets/Imagem bio_ fundoGuilherme.svg';
import bioLucas from '../assets/Imagem bio_ fundoLucas.svg';
import stars from '../assets/Stars.svg';
import coloredLogo from '../assets/colored-logo.svg';
import githubLogo from '../assets/GithubLogo.svg';
import moldure from '../assets/squares-moldure.svg';
import './Home.css';
import { useNavigate } from 'react-router-dom';
import StudentCard from '../components/StudentCard';


interface Aluno {
    _id: string;
    name: string;
    course: string;
    bio: string;
    profileImage?: string; 
}

const Home: React.FC = () => {
    const ref = useRef<HTMLButtonElement | null>(null);
    const navigate = useNavigate();
    
    const [alunos, setAlunos] = useState<Aluno[]>([]);

    useEffect(() => {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        fetch(`${apiUrl}/students`)
            .then((res) => res.json())
            .then((data) => setAlunos(data))
            .catch((err) => console.error("Erro ao carregar vitrine:", err));
    }, []);

    const handleGoToLogin = () => navigate('/login');
    const handleGoToSignUp = () => navigate('/signup');

    return (
        <div className="Home relative overflow-x-hidden">
            
            {/** 1. TOP SECTION (HERO) **/}
            <section id="top-section" className="bg-gradient-to-br from-[#006ACB] to-[#003465] min-h-screen flex items-center justify-center">
                <div className="top-container flex flex-col items-center justify-center text-center w-full">
                    <h1 className='title text-[#F0F2F5] text-[28px] font-bold pb-2 px-4 w-full text-left hidden md:block absolute top-10 left-10'>
                        AcadeMe Inc.
                    </h1>
                    <div className="top-content flex flex-col items-center justify-center">
                        <img src={logo} alt="logo" className="w-32 md:w-48 mb-8" />
                        <h1 className='slogan text-[#f4f0f5] text-[32px] md:text-[50px] mb-[21px] font-medium'>
                            Seja bem-vindo ao seu<br/>futuro acadêmico
                        </h1>
                        <div className="top-buttons-container flex flex-col md:flex-row items-center justify-center gap-4 md:gap-[24px]">
                            <Button size='default' shape='pill' className='font-bold min-w-[171px]  hover:bg-black flex items-center gap-2 transition-all' onClick={handleGoToSignUp}>
                                Cadastre-se
                            </Button>
                            <Button size='default' shape='pill' className='font-bold min-w-[171px]  hover:bg-black flex items-center gap-2 transition-all' onClick={handleGoToLogin}>
                                Login
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/** 2. SEARCH SECTION (O QUE É) **/}
            <section id="search-section" className="relative h-screen flex items-center justify-center px-8 md:px-16">
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
                        <div className='searchbar-container w-full max-w-md'>
                            <TextBar variant="default" textSize="lg" placeholder="Procurar Perfil..." iconLeft="search" hideIconsOnInput />
                        </div>
                    </div>
                </div>
            </section>

            {/** 3. SHARE SECTION **/}
            <section id="share-section" className='bg-gradient-to-r from-[#006ACB] to-[#003465] min-h-screen flex items-center justify-center px-8 md:px-16'>
                <div className="share-container flex flex-col md:flex-row items-center gap-10 md:gap-56 max-w-7xl">
                    <div className="search-content-body flex flex-col items-center text-center md:items-start md:text-left">
                        <h1 className='share-title text-[#F0F2F5] text-[28px] md:text-[40px] mb-4 font-bold'>Compartilhe</h1>
                        <p className='about-share text-[#F0F2F5] text-[18px] md:text-[24px] mb-10 leading-relaxed'>
                            Você pode compartilhar seu portfólio com colegas, professores e possíveis recrutadores, 
                            destacando suas habilidades e conquistas acadêmicas em um ambiente que valoriza seu potencial.
                        </p>
                    </div>
                    <img src={studentsMoldure} alt="happy-students" className="w-80 md:w-[500px]" />
                </div>
            </section>

            {/** 4. VITRINE DE ALUNOS **/}
            <section id="vitrine-section" className="py-20 bg-gray-50 flex flex-col items-center">
                <h1 className='text-[#006ACB] font-bold text-[28px] md:text-[40px] mb-20 text-center'>Nossos Talentos</h1>
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
                        <p className="col-span-3 text-center text-gray-400 italic">Aguardando novos talentos se cadastrarem...</p>
                    )}
                </div>
            </section>

            {/** 5. FEEDBACK SECTION **/}
            <section id='feedback-section' className='bg-white p-10 md:p-20 relative'>
                <h1 className='text-[#006ACB] font-bold text-[28px] md:text-[40px] mb-20 text-center'>Feedback dos Usuários</h1>
                <div className='feedback-container flex flex-col md:flex-row items-center justify-center gap-8 relative z-10'>
                    <div className='message-container flex flex-col items-center text-[#F0F2F5] bg-gradient-to-b from-[#006ACB] to-[#003465] w-full md:w-[380px] p-10 rounded-3xl gap-6 shadow-2xl'>
                        <div className='userinfo-container flex items-center gap-4'>
                            <img src={bioCaique} alt="Avatar" className='w-24' />
                            <span className='text-2xl font-bold'>Caíque C.</span>
                        </div>
                        <p className="text-center italic leading-relaxed">"Plataforma essencial para organizar meus trabalhos. Pude criar um portfólio que mostra tudo o que desenvolvi!"</p>
                        <img src={stars} alt="Avaliação" className='w-32' />
                    </div>
                    <div className='message-container flex flex-col items-center text-[#F0F2F5] bg-gradient-to-b from-[#006ACB] to-[#003465] w-full md:w-[380px] p-10 rounded-3xl gap-6 shadow-2xl'>
                        <div className='userinfo-container flex items-center gap-4'>
                            <img src={bioGui} alt="Avatar" className='w-24' />
                            <span className='text-2xl font-bold'>Guilherme V.</span>
                        </div>
                        <p className="text-center italic leading-relaxed">"O site me ajudou a apresentar meus trabalhos de forma profissional para recrutadores!"</p>
                        <img src={stars} alt="Avaliação" className='w-32' />
                    </div>
                    <div className='message-container flex flex-col items-center text-[#F0F2F5] bg-gradient-to-b from-[#006ACB] to-[#003465] w-full md:w-[380px] p-10 rounded-3xl gap-6 shadow-2xl'>
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
            <footer className='footer-container flex flex-col md:flex-row items-center justify-between px-20 py-16 bg-white border-t border-gray-100'>
                <img src={coloredLogo} alt="Logo" className="w-32 mb-8 md:mb-0" />
                <ul className='grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-[#006ACB]'>
                    <li className='flex items-center gap-4 font-semibold hover:translate-x-2 transition cursor-pointer'><img src={githubLogo} alt="GitLogo" className='h-8 w-8'/><span>github.com/caique18</span></li>
                    <li className='flex items-center gap-4 font-semibold hover:translate-x-2 transition cursor-pointer'><img src={githubLogo} alt="GitLogo" className='h-8 w-8'/><span>github.com/lucasmmps</span></li>                     
                    <li className='flex items-center gap-4 font-semibold hover:translate-x-2 transition cursor-pointer'><img src={githubLogo} alt="GitLogo" className='h-8 w-8'/><span>github.com/v-gui</span></li>
                </ul>
            </footer>

            <img src={moldure} alt="Moldura" className="absolute bottom-0 right-0 z-0 pointer-events-none w-[500px] opacity-10 hidden md:block" />
        </div>
    );
}

export default Home;
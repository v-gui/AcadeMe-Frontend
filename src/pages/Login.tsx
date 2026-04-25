/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Button } from '../components/Button';
import { TextBar } from '../components/TextBar';
import logo from '../assets/white-logo.svg'; 
import coloredLogo from '../assets/colored-logo.svg'; 
import moldure from '../assets/squares-moldure.svg';
import './Login.css';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login: React.FC = () => {
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); 
        if (!email || !password) {
            toast.warn('Preencha todos os campos para entrar.');
            return;
        }

        setLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

        try {

            const response = await fetch(`${apiUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('@AcadeMe:user', JSON.stringify(data.user));
                

                if (data.user.role === 'professor') {
                    toast.success(`Bem-vindo(a), Prof. ${data.user.name.split(' ')[0]}!`);
                    navigate('/professor-profile'); 
                } else {
                    toast.success(`Bem-vindo de volta, ${data.user.name.split(' ')[0]}!`);
                    navigate('/profile'); 
                }

            } else {
                toast.error(data.error || 'E-mail ou senha incorretos.');
            }
        } catch (error) {
            toast.error('O servidor parece estar offline.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="Login w-screen min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
            
            <div className="banner hidden 2xl:flex absolute left-0 top-0 bg-gradient-to-br from-[#006ACB] to-[#003465] p-16 flex-col justify-center items-center w-[400px] h-screen z-20">
                <Link to="/">
                    <img src={logo} alt="logo" className="w-48 mb-8" />
                </Link>
                <p className="text-[#F0F2F5] text-[24px] leading-relaxed text-center font-medium">
                    Acesse sua conta e continue sua jornada
                </p>
            </div>

            <div className="Login-content flex flex-col items-center justify-center w-full max-w-[480px] px-8 z-10 2xl:ml-[200px]">
                
                <Link to="/" className='mb-10'>
                    <img src={coloredLogo} alt="logo" className="hover:scale-105 transition-transform w-[180px] h-auto" />
                </Link>

                <div className="Login-form w-full flex flex-col items-center justify-center p-8 sm:p-10 gap-6 bg-white shadow-[0_20px_60px_rgba(0,52,101,0.12)] rounded-[32px] border border-gray-50">
                    <h1 className="text-[#006ACB] text-2xl font-black uppercase tracking-tighter mb-2">Login</h1>
                    
                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
                        <TextBar 
                            label="E-mail Institucional" 
                            type='email' 
                            placeholder='seu@email.com' 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            name="email"
                            required
                        />
                        
                        <div className="w-full flex flex-col">
                            <TextBar 
                                label="Senha" 
                                type='password' 
                                placeholder='••••••••' 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                name="password"
                                required
                            />
                            <Link to="/forgot-password" className='text-[#006ACB] text-[10px] font-bold uppercase tracking-widest mt-3 self-end hover:underline opacity-70'>
                                Esqueci minha senha
                            </Link>
                        </div>

                        <Button 
                            type="submit"
                            className="p-4 mt-4 w-full justify-center font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 active:scale-95 transition-all" 
                            disabled={loading}
                        >
                            {loading ? 'Validando...' : 'Entrar na conta'}
                        </Button>
                        
                        <div className="flex items-center gap-3 w-full my-2 opacity-20">
                            <hr className="flex-1 border-t border-[#003465]" />
                            <span className="text-[#003465] text-[10px] font-black uppercase">ou</span>
                            <hr className="flex-1 border-t border-[#003465]" />
                        </div>

                        <Link to="/signup" className='text-[#006ACB] text-xs font-black uppercase tracking-widest text-center hover:scale-105 transition-transform'>
                            Criar nova conta
                        </Link>
                    </form>
                </div>
            </div>

            <img src={moldure} alt="Moldura" className="hidden md:block absolute bottom-0 right-0 w-[500px] h-auto z-0 pointer-events-none opacity-10" />
        </div>
    );
}

export default Login;

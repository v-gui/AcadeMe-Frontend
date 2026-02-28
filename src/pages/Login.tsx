/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Button } from '../components/Button';
import { TextBar } from '../components/TextBar';
import logo from '../assets/colored-logo.svg';
import moldure from '../assets/squares-moldure.svg';
import './Login.css';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login: React.FC = () => {
    const navigate = useNavigate();
    
    // Estados para capturar os inputs do usuário
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); 
        
        // Pequena validação de frontend antes de chamar a API
        if (!email || !password) {
            toast.warn('Preencha todos os campos para entrar.');
            return;
        }

        setLoading(true);

        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

        try {
            const response = await fetch(`${apiUrl}/students/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // ✅ SUCESSO
                localStorage.setItem('@AcadeMe:user', JSON.stringify(data.user));
                
                toast.success(`🚀 Bem-vindo de volta, ${data.user.name.split(' ')[0]}!`);
                navigate('/profile'); 
            } else {
                // ❌ CREDENCIAIS INCORRETAS
                toast.error(data.error || 'E-mail ou senha incorretos.');
            }
        } catch (error) {
            // ⚠️ ERRO DE CONEXÃO
            console.error('Erro na conexão com a API:', error);
            toast.error('O servidor parece estar offline. Tente novamente em instantes.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="Login flex items-center justify-center h-screen w-screen px-6 sm:px-8 md:px-16 relative overflow-hidden bg-gray-50">
            <div className="Login-content flex flex-col items-center justify-center w-full max-w-md relative z-10">
                
                {/** Logo com link para a Home **/}
                <Link to="/" className='mb-8'>
                    <img 
                        src={logo} 
                        alt="logo" 
                        className="logo mt-16 sm:mt-12 md:mt-16 hover:scale-105 transition-transform" 
                        style={{ width: '150px', height: 'auto' }} 
                    />
                </Link>

                {/** Formulário de Login **/}
                <div className="Login-form w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 gap-4 bg-white shadow-xl rounded-3xl border border-gray-100">
                    <form onSubmit={handleSubmit} className="w-full flex flex-col items-center justify-center gap-4">
                        
                        <TextBar 
                            label="E-mail Acadêmico" 
                            type='email' 
                            placeholder='seu@email.com' 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            name="email"
                        />
                        
                        <div className="w-full flex flex-col">
                            <TextBar 
                                label="Senha" 
                                type='password' 
                                placeholder='••••••••' 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                name="password"
                            />
                            <a href="#" className='text-[#006ACB] text-[10px] font-bold uppercase tracking-widest mt-2 self-end hover:underline opacity-70'>
                                Esqueci minha senha
                            </a>
                        </div>

                        <Button 
                            type="submit"
                            size="default" 
                            shape="pill" 
                            className="p-4 mt-4 mb-4 w-full justify-center font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all" 
                            disabled={loading}
                        >
                            {loading ? 'Validando Acesso...' : 'Entrar na conta'}
                        </Button>
                        
                        <div className="flex items-center gap-2 w-full opacity-30">
                            <hr className="flex-1 border-t border-[#003465]" />
                            <span className="text-[#003465] text-[10px] font-black uppercase">ou</span>
                            <hr className="flex-1 border-t border-[#003465]" />
                        </div>

                        <Link to="/signup" className='text-[#006ACB] text-xs font-black uppercase tracking-widest mt-2 hover:scale-105 transition-transform'>
                            Criar nova conta
                        </Link>
                    </form>
                </div>
            </div>

            {/** Moldura **/}
            <img 
                src={moldure} 
                alt="Moldura" 
                className="absolute bottom-0 right-0 w-[250px] sm:w-[350px] md:w-[450px] lg:w-[562px] h-auto z-0 pointer-events-none opacity-10" 
            />
        </div>
    );
}

export default Login;
import React, { useState } from 'react';
import { Button } from '../components/Button';
import { TextBar } from '../components/TextBar';
import logo from '../assets/colored-logo.svg';
import moldure from '../assets/squares-moldure.svg';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom'; 

const Login: React.FC = () => {
    const navigate = useNavigate();
    
    // Estados para capturar os inputs do usuário
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); 
        setLoading(true);

        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

        try {
            const response = await fetch(`${apiUrl}/students/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            // Extraímos o JSON da resposta
            const data = await response.json();

            if (response.ok) {
                // ✅ SUCESSO: Agora salvamos os dados que o backend nos enviou
                // Usamos o prefixo @AcadeMe para organizar o LocalStorage
                localStorage.setItem('@AcadeMe:user', JSON.stringify(data.user));
                
                console.log('Login efetuado com sucesso:', data.user);
                alert('Bem-vindo de volta!');
                navigate('/profile'); 
            } else {
                // Caso o e-mail não exista ou a senha esteja errada
                alert(data.error || 'Falha no login. Verifique suas credenciais.');
            }
        } catch (error) {
            console.error('Erro na conexão com a API:', error);
            alert('Não foi possível conectar ao servidor. O backend está rodando na porta 3001?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="Login flex items-center justify-center h-screen w-screen px-6 sm:px-8 md:px-16 relative overflow-hidden">
            <div className="Login-content flex flex-col items-center justify-center w-full max-w-md relative z-10">
                
                {/** Logo com link para a Home **/}
                <Link to="/" className='mb-8'>
                    <img 
                        src={logo} 
                        alt="logo" 
                        className="logo mt-16 sm:mt-12 md:mt-16" 
                        style={{ width: '150px', height: 'auto' }} 
                    />
                </Link>

                {/** Formulário de Login **/}
                <div className="Login-form w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 gap-4 bg-white/50 rounded-2xl">
                    <form onSubmit={handleSubmit} className="w-full flex flex-col items-center justify-center gap-4">
                        
                        <TextBar 
                            label="Login" 
                            type='email' 
                            placeholder='Seu e-mail institucional' 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            name="email"
                            required
                        />
                        
                        <TextBar 
                            label="Senha" 
                            type='password' 
                            placeholder='Sua senha secreta' 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            name="password"
                            required
                        />

                        <a href="#" className='text-[#006ACB] text-sm self-end hover:underline'>
                            Esqueci minha senha
                        </a>

                        <Button 
                            type="submit"
                            size="default" 
                            shape="pill" 
                            className="p-4 mt-4 mb-4 w-full justify-center font-bold" 
                            disabled={loading}
                        >
                            {loading ? 'Validando...' : 'Entrar'}
                        </Button>
                        
                        <div className="flex items-center gap-2 w-full opacity-60">
                            <hr className="flex-1 border-t border-[#006ACB]" />
                            <span className="text-[#006ACB] text-xs font-black uppercase">ou</span>
                            <hr className="flex-1 border-t border-[#006ACB]" />
                        </div>

                        <Link to="/signup" className='text-[#006ACB] font-bold mt-2 hover:scale-105 transition-transform'>
                            Criar nova conta
                        </Link>
                    </form>
                </div>
            </div>

            {/** Moldura decorativa original **/}
            <img 
                src={moldure} 
                alt="Moldura" 
                className="absolute bottom-0 right-0 w-[250px] sm:w-[350px] md:w-[450px] lg:w-[562px] h-auto z-0 pointer-events-none opacity-30" 
            />
        </div>
    );
}

export default Login;
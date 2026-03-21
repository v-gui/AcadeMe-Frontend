/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useMemo } from 'react';
import { Button } from '../components/Button';
import { TextBar } from '../components/TextBar';
import logo from '../assets/white-logo.svg';
import coloredLogo from '../assets/colored-logo.svg';
import moldure from '../assets/squares-moldure.svg';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; 
import './SignUp.css';

const SignUp: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        name: '', email: '', confirmEmail: '', course: '', bio: '', password: '', confirmPassword: '',
    });

    const passwordRequirements = useMemo(() => ({
        length: formData.password.length >= 6,
        uppercase: /[A-Z]/.test(formData.password),
        number: /[0-9]/.test(formData.password)
    }), [formData.password]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // ... lógica de submit permanece a mesma ...
    };

    return (
        <div className="SignUp w-screen min-h-screen flex items-center justify-center bg-white overflow-hidden relative">
            
            {/** * BANNER ESQUERDO: 
             * Agora ele é 'absolute'. Isso retira ele do cálculo de centro da tela, 
             * permitindo que o formulário fique no meio exato do monitor.
             **/}
            <div className="banner hidden 2xl:flex absolute left-0 top-0 bg-gradient-to-br from-[#006ACB] to-[#003465] p-16 flex-col justify-center items-center w-[400px] h-screen z-20">
                <Link to="/">
                    <img src={logo} alt="logo" className="w-48 mb-8" />
                </Link>
                <p className="text-[#F0F2F5] text-[24px] leading-relaxed text-center font-medium">
                    Você está a um passo da sua revolução acadêmica
                </p>
            </div>

            {/** * CONTAINER DO FORMULÁRIO: 
             * Como o pai é 'justify-center', e o banner é 'absolute', 
             * este bloco ficará no centro real da tela (Viewport Center).
             **/}
            <div className='flex flex-col items-center justify-center w-full max-w-[600px] px-8 z-10 2xl:ml-[200px]'>
                
                {/* Logo visível apenas quando o banner lateral some (mobile/tablet) */}
                <div className="2xl:hidden mb-8">
                    <img src={coloredLogo} alt="logo" className="h-10 cursor-pointer" onClick={() => navigate('/')} />
                </div>

                <h1 className="text-[#006ACB] text-4xl mb-10 font-black uppercase tracking-tighter">Cadastro</h1>

                <form onSubmit={handleSubmit} className="flex flex-col w-full gap-5">
                    <TextBar label="Nome" name="name" placeholder="Nome completo" onChange={handleChange} value={formData.name} required />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <TextBar label="Curso" name="course" placeholder="Seu curso" onChange={handleChange} value={formData.course} required />
                        <TextBar label="Bio" name="bio" placeholder="Pequena biografia" onChange={handleChange} value={formData.bio} />
                    </div>
                    
                    <TextBar label="E-mail" name="email" type="email" placeholder="E-mail institucional" onChange={handleChange} value={formData.email} required />
                    <TextBar label="Confirmar E-mail" name="confirmEmail" type="email" placeholder="Repita o e-mail" onChange={handleChange} value={formData.confirmEmail} required />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-2">
                            <TextBar label="Senha" name="password" type="password" placeholder="Crie uma senha" onChange={handleChange} value={formData.password} required />
                            <div className="ml-2 space-y-1">
                                <div className={`flex items-center gap-2 text-[9px] font-bold uppercase ${passwordRequirements.length ? 'text-green-500' : 'text-red-300'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.length ? 'bg-green-500' : 'bg-red-300'}`} />
                                    Mínimo 6 caracteres
                                </div>
                                <div className={`flex items-center gap-2 text-[9px] font-bold uppercase ${passwordRequirements.uppercase ? 'text-green-500' : 'text-red-300'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.uppercase ? 'bg-green-500' : 'bg-red-300'}`} />
                                    Uma letra maiúscula
                                </div>
                                <div className={`flex items-center gap-2 text-[9px] font-bold uppercase ${passwordRequirements.number ? 'text-green-500' : 'text-red-300'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.number ? 'bg-green-500' : 'bg-red-300'}`} />
                                    Pelo menos um número
                                </div>
                            </div>
                        </div>

                        <TextBar label="Confirme a Senha" name="confirmPassword" type="password" placeholder="Confirme a senha" onChange={handleChange} value={formData.confirmPassword} required />
                    </div>

                    <Button type="submit" className="p-4 w-full justify-center mt-4 shadow-lg shadow-blue-50" disabled={loading}>
                        {loading ? "Processando..." : "Cadastrar"}
                    </Button>

                    <p className="w-full text-center mt-4 text-xs text-gray-400 font-medium">
                        Já possui uma conta? <Link to="/login" className="text-[#006ACB] font-black hover:underline ml-1">Faça login</Link>
                    </p>
                </form>
            </div>

            <img src={moldure} alt="Moldura" className="hidden 2xl:flex absolute bottom-0 right-0 w-[450px] opacity-10 pointer-events-none" />
        </div>
    );
}

export default SignUp;
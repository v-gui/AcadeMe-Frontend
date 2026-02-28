/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useMemo } from 'react';
import { Button } from '../components/Button';
import { TextBar } from '../components/TextBar';
import logo from '../assets/white-logo.svg';
import moldure from '../assets/squares-moldure.svg';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Importando o toast
import './SignUp.css';

const SignUp: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        confirmEmail: '',
        course: '',
        bio: '',
        password: '', 
        confirmPassword: '',
    });

    // --- LÓGICA DE VALIDAÇÃO EM TEMPO REAL ---
    const passwordRequirements = useMemo(() => ({
        length: formData.password.length >= 6,
        uppercase: /[A-Z]/.test(formData.password),
        number: /[0-9]/.test(formData.password)
    }), [formData.password]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        // 1. Valida e-mails
        if (formData.email !== formData.confirmEmail) {
            newErrors.confirmEmail = 'Os e-mails não correspondem.';
        }

        // 2. Valida se todos os requisitos da senha estão verdes
        const allMet = Object.values(passwordRequirements).every(req => req);
        if (!allMet) {
            newErrors.password = 'A senha ainda não atende aos requisitos.';
            toast.warn('Revise os requisitos de senha.'); // Aviso amigável
        }

        // 3. Valida confirmação de senha
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'As senhas não correspondem.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    course: formData.course,
                    bio: formData.bio,
                    password: formData.password,
                    interests: []
                }),
            });

            if (response.ok) {
                // Notificação de sucesso
                toast.success('🚀 Cadastro realizado com sucesso! Bem-vindo ao AcadeMe.');
                navigate('/login');
            } else {
                const data = await response.json();
                const serverError = data.error || 'Erro ao cadastrar.';
                setErrors({ server: serverError });
                toast.error(`❌ ${serverError}`); // Notificação de erro do servidor
            }
        } catch (error) {
            setErrors({ server: 'Não foi possível conectar ao servidor.' });
            toast.error('📡 Erro de conexão. Verifique se o servidor está rodando.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="SignUp w-screen min-h-screen flex 2xl:gap-8 2xl:items-start 2xl:justify-start items-center justify-center overflow-x-hidden">
            <div className="banner hidden 2xl:flex bg-gradient-to-br from-[#006ACB] to-[#003465] p-16 flex-col justify-center items-center w-[472px] h-screen shrink-0">
                <Link to="/">
                    <img src={logo} alt="logo" className="banner-logo mb-8" />
                </Link>
                <p className="banner-text text-[#F0F2F5] text-[26px] leading-relaxed text-center">
                    Você está a um passo da sua revolução acadêmica
                </p>
            </div>

            <div className='middle-container flex flex-col items-start w-full 2xl:w-auto h-full py-8'>
                <div className='form-container flex flex-col items-center justify-center w-full px-8'>
                    <h1 className="page-title text-[#006ACB] text-3xl mb-6 font-black uppercase tracking-tighter">Cadastro</h1>

                    <form onSubmit={handleSubmit} className="flex flex-col items-start justify-start w-full 2xl:max-w-xl relative z-10 gap-4">
                        <TextBar label="Nome" name="name" placeholder="Nome completo" onChange={handleChange} value={formData.name} required />
                        <TextBar label="Curso" name="course" placeholder="Seu curso" onChange={handleChange} value={formData.course} required />
                        <TextBar label="Bio" name="bio" placeholder="Pequena biografia" onChange={handleChange} value={formData.bio} />
                        <TextBar label="E-mail" name="email" type="email" placeholder="E-mail institucional" onChange={handleChange} value={formData.email} required />
                        
                        <div className="w-full">
                            <TextBar label="Confirmar E-mail" name="confirmEmail" type="email" placeholder="Repita o e-mail" onChange={handleChange} value={formData.confirmEmail} required />
                            {errors.confirmEmail && <p className="text-red-500 text-[10px] font-bold ml-2 mt-1 uppercase tracking-widest animate-pulse">{errors.confirmEmail}</p>}
                        </div>

                        <div className="password-container w-full flex flex-col md:flex-row items-start 2xl:gap-8 gap-4">
                            <div className="w-full">
                                <TextBar label="Senha" name="password" type="password" placeholder="Crie uma senha" onChange={handleChange} value={formData.password} required />
                                
                                <div className="mt-3 ml-2 space-y-1">
                                    <div className={`flex items-center gap-2 text-[9px] font-bold uppercase tracking-tighter transition-colors ${passwordRequirements.length ? 'text-green-500' : 'text-red-300'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.length ? 'bg-green-500' : 'bg-red-300'}`} />
                                        Mínimo 6 caracteres
                                    </div>
                                    <div className={`flex items-center gap-2 text-[9px] font-bold uppercase tracking-tighter transition-colors ${passwordRequirements.uppercase ? 'text-green-500' : 'text-red-300'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.uppercase ? 'bg-green-500' : 'bg-red-300'}`} />
                                        Uma letra maiúscula
                                    </div>
                                    <div className={`flex items-center gap-2 text-[9px] font-bold uppercase tracking-tighter transition-colors ${passwordRequirements.number ? 'text-green-500' : 'text-red-300'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.number ? 'bg-green-500' : 'bg-red-300'}`} />
                                        Pelo menos um número
                                    </div>
                                </div>
                                {errors.password && <p className="text-red-500 text-[10px] font-bold ml-2 mt-1 uppercase tracking-widest">{errors.password}</p>}
                            </div>

                            <div className="w-full">
                                <TextBar label="Confirme a Senha" name="confirmPassword" type="password" placeholder="Confirme a senha" onChange={handleChange} value={formData.confirmPassword} required />
                                {errors.confirmPassword && <p className="text-red-500 text-[10px] font-bold ml-2 mt-1 uppercase tracking-widest">{errors.confirmPassword}</p>}
                            </div>
                        </div>

                        {errors.server && <p className="w-full text-center text-red-600 font-bold text-xs mt-2 bg-red-50 py-2 rounded-lg">{errors.server}</p>}

                        <Button type="submit" className="p-4 w-full items-center justify-center mt-6" disabled={loading}>
                            {loading ? "Processando..." : "Cadastrar"}
                        </Button>

                        <p className="w-full text-center mt-4 text-xs text-gray-400 font-medium italic">
                            Já possui uma conta? <Link to="/login" className="text-[#006ACB] font-black hover:underline not-italic">Faça login aqui</Link>
                        </p>
                    </form>
                </div>
            </div>
            <img src={moldure} alt="Moldura" className="hidden 2xl:flex absolute bottom-0 right-0 w-[562px] h-auto z-0 pointer-events-none opacity-20" />
        </div>
    );
}

export default SignUp;
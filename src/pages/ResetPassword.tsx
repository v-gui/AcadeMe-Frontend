/* eslint-disable jsx-a11y/alt-text */
import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '../components/Button';
import { TextBar } from '../components/TextBar';
import coloredLogo from '../assets/colored-logo.svg';
import moldure from '../assets/squares-moldure.svg';

const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const passwordRequirements = useMemo(() => ({
        length: password.length >= 6,
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password)
    }), [password]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast.error('Link inválido ou expirado.');
            return;
        }

        if (password !== confirmPassword) {
            toast.warning('As senhas não coincidem.');
            return;
        }

        setLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

        try {
            const response = await fetch(`${apiUrl}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || 'Não foi possível redefinir a senha.');
                return;
            }

            toast.success(data.message || 'Senha atualizada com sucesso.');
            navigate('/login');
        } catch (error) {
            toast.error('O servidor parece estar offline.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-screen min-h-screen flex items-center justify-center bg-white relative overflow-hidden px-6">
            <div className="w-full max-w-[520px] z-10 flex flex-col items-center">
                <Link to="/" className="inline-flex mb-10 justify-center">
                    <img src={coloredLogo} alt="logo" className="w-[180px] h-auto hover:scale-105 transition-transform" />
                </Link>

                <div className="w-full p-8 sm:p-10 bg-white shadow-[0_20px_60px_rgba(0,52,101,0.12)] rounded-[32px] border border-gray-50">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#6C8299] mb-3">Segurança da conta</p>
                    <h1 className="text-[#006ACB] text-3xl font-black uppercase tracking-tighter mb-4">Criar Nova Senha</h1>
                    <p className="text-sm text-[#35516F] leading-relaxed mb-8">
                        Defina uma senha forte para concluir a recuperação do seu acesso.
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <TextBar
                                label="Nova senha"
                                name="password"
                                type="password"
                                placeholder="Digite a nova senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
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

                        <TextBar
                            label="Confirmar senha"
                            name="confirmPassword"
                            type="password"
                            placeholder="Repita a nova senha"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        <Button type="submit" className="p-4 w-full justify-center mt-2 shadow-lg shadow-blue-50 font-black uppercase tracking-widest text-xs" disabled={loading}>
                            {loading ? 'Salvando...' : 'Atualizar senha'}
                        </Button>

                        <Link to="/login" className="text-center text-[#006ACB] text-xs font-black uppercase tracking-widest hover:underline">
                            Voltar para login
                        </Link>
                    </form>
                </div>
            </div>

            <img src={moldure} alt="Moldura" className="hidden md:block absolute bottom-0 right-0 w-[500px] h-auto z-0 pointer-events-none opacity-10" />
        </div>
    );
};

export default ResetPassword;

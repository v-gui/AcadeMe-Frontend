/* eslint-disable jsx-a11y/alt-text */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '../components/Button';
import { TextBar } from '../components/TextBar';
import coloredLogo from '../assets/colored-logo.svg';
import moldure from '../assets/squares-moldure.svg';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.warn('Informe o e-mail para receber o link.');
            return;
        }

        setLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

        try {
            const response = await fetch(`${apiUrl}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || 'Não foi possível enviar o link.');
                return;
            }

            toast.success(data.message || 'Se o e-mail existir, você receberá o link de redefinição.');
        } catch (error) {
            toast.error('O servidor parece estar offline.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-screen min-h-screen flex items-center justify-center bg-white relative overflow-hidden px-6">
            <div className="w-full max-w-[500px] z-10">
                <Link to="/" className="inline-flex mb-10">
                    <img src={coloredLogo} alt="logo" className="w-[180px] h-auto hover:scale-105 transition-transform" />
                </Link>

                <div className="w-full p-8 sm:p-10 bg-white shadow-[0_20px_60px_rgba(0,52,101,0.12)] rounded-[32px] border border-gray-50">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#6C8299] mb-3">Recuperação de acesso</p>
                    <h1 className="text-[#006ACB] text-3xl font-black uppercase tracking-tighter mb-4">Esqueci Minha Senha</h1>
                    <p className="text-sm text-[#35516F] leading-relaxed mb-8">
                        Digite o e-mail da conta e enviaremos um link para cadastrar uma nova senha.
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <TextBar
                            label="E-mail"
                            name="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Button type="submit" className="p-4 w-full justify-center mt-2 shadow-lg shadow-blue-50 font-black uppercase tracking-widest text-xs" disabled={loading}>
                            {loading ? 'Enviando...' : 'Enviar link por e-mail'}
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

export default ForgotPassword;

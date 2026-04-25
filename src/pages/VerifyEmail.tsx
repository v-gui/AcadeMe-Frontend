/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import coloredLogo from '../assets/colored-logo.svg';
import moldure from '../assets/squares-moldure.svg';

const VerifyEmail: React.FC = () => {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Validando seu link de confirmação...');

    useEffect(() => {
        const token = new URLSearchParams(window.location.search).get('token');
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

        if (!token) {
            setStatus('error');
            setMessage('Link de confirmação inválido.');
            return;
        }

        const verify = async () => {
            try {
                const response = await fetch(`${apiUrl}/auth/verify-email?token=${token}`);
                const data = await response.json();

                if (!response.ok) {
                    setStatus('error');
                    setMessage(data.error || 'Não foi possível confirmar seu e-mail.');
                    return;
                }

                setStatus('success');
                setMessage(data.message || 'Seu e-mail foi confirmado com sucesso.');
            } catch (error) {
                setStatus('error');
                setMessage('O servidor parece estar offline.');
            }
        };

        verify();
    }, []);

    return (
        <div className="w-screen min-h-screen flex items-center justify-center bg-white relative overflow-hidden px-6">
            <div className="w-full max-w-[520px] z-10">
                <Link to="/" className="inline-flex mb-10">
                    <img src={coloredLogo} alt="logo" className="w-[180px] h-auto hover:scale-105 transition-transform" />
                </Link>

                <div className="w-full p-8 sm:p-10 bg-white shadow-[0_20px_60px_rgba(0,52,101,0.12)] rounded-[32px] border border-gray-50 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#6C8299] mb-3">Ativação de conta</p>
                    <h1 className="text-[#006ACB] text-3xl font-black uppercase tracking-tighter mb-4">
                        {status === 'loading' ? 'Confirmando E-mail' : status === 'success' ? 'Conta Confirmada' : 'Não Foi Possível Confirmar'}
                    </h1>
                    <p className="text-sm text-[#35516F] leading-relaxed mb-8">{message}</p>

                    <Link to="/login">
                        <Button className="p-4 w-full justify-center shadow-lg shadow-blue-50 font-black uppercase tracking-widest text-xs">
                            Ir para login
                        </Button>
                    </Link>
                </div>
            </div>

            <img src={moldure} alt="Moldura" className="hidden md:block absolute bottom-0 right-0 w-[500px] h-auto z-0 pointer-events-none opacity-10" />
        </div>
    );
};

export default VerifyEmail;

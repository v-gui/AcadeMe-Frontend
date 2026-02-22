import React, { useState } from 'react';
import { Button } from '../components/Button';
import { TextBar } from '../components/TextBar';
import logo from '../assets/white-logo.svg';
import moldure from '../assets/squares-moldure.svg';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import './SignUp.css';

const SignUp: React.FC = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        confirmEmail: '',
        course: '',
        bio: '',
        password: '', // Campo de senha adicionado ao estado
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            alert('As senhas não correspondem.');
            return;
        }

        if (formData.email !== formData.confirmEmail) {
            alert('Os e-mails não correspondem.');
            return;
        }

        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
            
            // Agora enviamos todos os campos necessários para o Backend
            const response = await fetch(`${apiUrl}/students`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    course: formData.course,
                    bio: formData.bio,
                    password: formData.password, // ENVIANDO A SENHA AQUI
                }),
            });

            if (response.ok) {
                alert('Cadastro realizado com sucesso!');
                navigate('/'); 
            } else {
                const data = await response.json();
                alert(data.error || 'Erro ao cadastrar usuário.');
            }
        } catch (error) {
            console.error('Erro ao cadastrar:', error);
            alert('Não foi possível conectar ao servidor.');
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
                    <h1 className="page-title text-[#006ACB] text-3xl mb-6">Cadastro</h1>

                    <form onSubmit={handleSubmit} className="flex flex-col items-start justify-start w-full 2xl:max-w-xl relative z-10 gap-4">
                        <TextBar label="Nome" name="name" placeholder="Nome completo" onChange={handleChange} value={formData.name} />
                        <TextBar label="Curso" name="course" placeholder="Seu curso" onChange={handleChange} value={formData.course} />
                        <TextBar label="Bio" name="bio" placeholder="Pequena biografia" onChange={handleChange} value={formData.bio} />
                        <TextBar label="E-mail" name="email" type="email" placeholder="E-mail institucional" onChange={handleChange} value={formData.email} />
                        <TextBar label="Confirmar E-mail" name="confirmEmail" type="email" placeholder="Repita o e-mail" onChange={handleChange} value={formData.confirmEmail} />

                        <div className="password-container w-full flex flex-col md:flex-row items-start 2xl:gap-8 gap-4">
                            <TextBar 
                                label="Senha" 
                                name="password" 
                                type="password" 
                                placeholder="Crie uma senha" 
                                onChange={handleChange} 
                                value={formData.password}
                            />
                            <TextBar 
                                label="Confirme a Senha" 
                                name="confirmPassword" 
                                type="password" 
                                placeholder="Confirme a senha" 
                                onChange={handleChange} 
                                value={formData.confirmPassword}
                            />
                        </div>

                        <Button type="submit" className="p-4 w-full mt-6">Prosseguir</Button>
                    </form>
                </div>
            </div>
            <img src={moldure} alt="Moldura" className="hidden 2xl:flex absolute bottom-0 right-0 w-[562px] h-auto z-0 pointer-events-none" />
        </div>
    );
}

export default SignUp;
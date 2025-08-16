import { useRef, useState } from 'react';
import { Button } from '../components/Button';
import { TextBar } from '../components/TextBar';
import logo from '../assets/white-logo.svg';
import moldure from '../assets/squares-moldure.svg';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import './SignUp.css';

const SignUp: React.FC = () => {
    const ref = useRef<HTMLButtonElement | null>(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        confirmEmail: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Formulário enviado', formData);

        // Verifica se as senhas e emails correspondem
        if (formData.password !== formData.confirmPassword) {
            alert('As senhas não correspondem.');
            return;
        }

        if (formData.email !== formData.confirmEmail) {
            alert('Os e-mails não correspondem.');
            return;
        }

        try {
            // Faz a requisição POST para o backend
            const response = await fetch('http://localhost:5000/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Se o cadastro foi bem-sucedido, redireciona para a página Profile
                navigate('/profile');
            } else {
                // Se houve um erro, exibe a mensagem de erro
                alert(data.message || 'Erro ao cadastrar usuário.');
            }
        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            alert('Erro ao cadastrar usuário.');
        }
    };

    return (
        <div className="SignUp w-screen flex 2xl:gap-8 2xl:items-start 2xl:justify-start items-center justify-center">
            {/** Left Banner **/}
            <div className="banner hidden 2xl:flex bg-gradient-to-br from-[#006ACB] to-[#003465] p-16 flex-col justify-center items-center w-[472px] h-screen">
                <Link to="/" className='text-[#006ACB]'><img src={logo} alt="logo" className="banner-logo mb-8" /></Link>
                <p className="banner-text text-[#F0F2F5] text-[26px] leading-relaxed text-center">
                    Você está a um passo da sua revolução acadêmica
                </p>
            </div>

            {/** Form **/}
            <div className='middle-container flex flex-col items-start'>
                <Link className='goback-link 2xl:hidden' to='/'><Icon className="back-icon bg-none my-2" iconCenter='arrowLeft'></Icon></Link>
                <div className='form-container flex flex-col items-center justify-center my-2 2xl:w-auto w-full px-8'>
                    <h1 className="page-title text-[#006ACB] text-3xl">Cadastro</h1>

                    <form onSubmit={handleSubmit} className="flex flex-col items-start justify-start w-full 2xl:max-w-xl 2xl:p-2 relative z-10 gap-4">
                        <TextBar 
                            label="Nome" 
                            name="name" 
                            placeholder="Insira seu nome completo" 
                            onChange={handleChange} 
                            value={formData.name}
                        />
                        <TextBar 
                            label="Telefone" 
                            name="phone" 
                            type="phone" 
                            placeholder="Insira seu número com DDD" 
                            onChange={handleChange} 
                            value={formData.phone}
                        />
                        <TextBar 
                            label="E-mail institucional" 
                            name="email" 
                            type="email" 
                            placeholder="Insira seu e-mail institucional" 
                            onChange={handleChange} 
                            value={formData.email}
                        />
                        <TextBar 
                            label="Confirme seu e-mail" 
                            name="confirmEmail" 
                            type="email" 
                            placeholder="Confirme seu e-mail institucional" 
                            onChange={handleChange} 
                            value={formData.confirmEmail}
                        />
                        
                        {/** Password Area **/}
                        <div className="password-container w-auto flex flex-col md:flex-row items-start 2xl:gap-8 gap-4">
                            <TextBar 
                                label="Senha" 
                                name="password" 
                                type="password" 
                                placeholder="Crie uma senha forte" 
                                onChange={handleChange} 
                            />
                            <TextBar 
                                label="Confirme a senha" 
                                name="confirmPassword" 
                                type="password" 
                                placeholder="Confirme sua senha" 
                                onChange={handleChange} 
                                value={formData.confirmPassword}
                            />
                        </div>
                        <div className="password-requirements text-start text-[#94A2B7] text-sm mb-4">
                                    <ul>Mínimo 8 dígitos</ul>
                                    <ul>Mínimo 1 número</ul>
                                    <ul>Mínimo 1 letra maiúscula</ul>
                                    <ul>Mínimo 1 letra minúscula</ul>
                                    <ul>Mínimo 1 caractere especial</ul>
                        </div>
                    </form>
                    <Button type="submit" ref={ref} className="p-4"> Prosseguir </Button>
                </div>
            </div>
            {/** Right Moldure **/}
            <img 
                src={moldure} 
                alt="Moldura" 
                    className="hidden 2xl:flex absolute bottom-0 right-0 w-[562px] h-auto z-0 pointer-events-none" 
            />
        </div>
    );
}

export default SignUp;
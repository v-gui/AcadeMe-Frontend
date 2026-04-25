import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/white-logo.svg';
import UserIcon from '../assets/UserIcon.svg';

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkUser = () => {
            const savedUser = localStorage.getItem('@AcadeMe:user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            } else {
                setUser(null);
            }
        };

        checkUser();
        window.addEventListener('storage', checkUser);
        return () => window.removeEventListener('storage', checkUser);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('@AcadeMe:user');
        setUser(null);
        navigate('/');
    };

    return (
        
        <nav className="Navbar flex items-center justify-between px-6 py-3 bg-[#003465] w-full sticky top-0 z-[100] border-b border-white/10">
            
            
            <div className="flex items-center">
                <img 
                    src={logo} 
                    alt="AcadeMe" 
                    className="w-24 md:w-28 object-contain" 
                />
            </div>

            <div className="nav-actions flex items-center gap-6">
                {user ? (
                    <div className="relative group">
                        <div className="flex items-center gap-3 cursor-pointer p-1">
                            <div className="flex flex-col items-end hidden sm:flex">
                                
                                <span className="text-sm font-bold text-white">{user.name.split(' ')[0]}</span>
                                <span className="text-[10px] text-blue-300">Online</span>
                            </div>
                            <img 
                                src={user.profileImage || UserIcon} 
                                alt="User Profile" 
                                className="w-10 h-10 rounded-full object-cover border-2 border-white/50 shadow-sm"
                            />
                        </div>

                        
                        <div className="absolute right-0 mt-0 w-48 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                            <div className="bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b border-gray-100">
                                    <p className="text-xs font-black text-[#006ACB] uppercase">Conta</p>
                                    <p className="text-sm font-bold truncate text-gray-800">{user.name}</p>
                                </div>
                                
                                <Link to="/profile" className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition">
                                    Meu Perfil
                                </Link>
                                
                                <button 
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-bold border-t border-gray-100 transition"
                                >
                                    Sair da conta
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link to="/signup" className="text-white font-bold hover:underline hidden sm:block">
                            Cadastro
                        </Link>
                        <Link to="/login" className="bg-white text-[#003465] px-6 py-2 rounded-full font-bold hover:bg-blue-100 transition shadow-md">
                            Login
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
import React from 'react';
import { Button } from './Button';
import { TextBar } from './TextBar';
import Avatar from './Avatar';
import InviteMenu from './InviteMenu';
import SearchResultsDropdown from './SearchResultsDropdown';
import coloredLogo from '../assets/colored-logo.svg';
import { ProjectRecord, SearchResults, StudentSummary } from '../types/models';

interface HeaderUser {
  name?: string;
  email?: string;
  profileImage?: string;
  role?: string;
}

interface InviteMenuConfig {
  menuRef: React.RefObject<HTMLDivElement>;
  title: string;
  emptyMessage: string;
  isOpen: boolean;
  count: number;
  items: Array<{
    id: string;
    title: string;
    subtitle: string;
    avatarName: string;
    avatarImage?: string;
  }>;
  onToggle: () => void;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

interface AppHeaderProps {
  searchTerm: string;
  isDropdownVisible: boolean;
  searchResultStudents: SearchResults['students'];
  searchResultProjects: SearchResults['projects'];
  onSearchChange: (value: string) => void;
  onSearchBlur: () => void;
  onStudentSelect: (studentId: string) => void;
  onProjectSelect: (projectId: string) => void;
  currentUser?: HeaderUser | null;
  menuRef: React.RefObject<HTMLDivElement>;
  isAccountMenuOpen: boolean;
  onToggleAccountMenu: () => void;
  onNavigateHome: () => void;
  onNavigateProfile: () => void;
  onLogout: () => void;
  inviteMenu?: InviteMenuConfig;
  unauthenticatedActions?: React.ReactNode;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  searchTerm,
  isDropdownVisible,
  searchResultStudents,
  searchResultProjects,
  onSearchChange,
  onSearchBlur,
  onStudentSelect,
  onProjectSelect,
  currentUser,
  menuRef,
  isAccountMenuOpen,
  onToggleAccountMenu,
  onNavigateHome,
  onNavigateProfile,
  onLogout,
  inviteMenu,
  unauthenticatedActions
}) => {
  return (
    <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-md z-[1000] h-20 flex items-center border-b border-gray-100">
      <div className="w-full flex items-center justify-between px-6 md:px-12 lg:px-20">
        <img src={coloredLogo} alt="logo" className="h-10 cursor-pointer hover:scale-105 transition-transform" onClick={onNavigateHome} />

        <div className="flex-1 max-w-2xl mx-8 relative">
          <TextBar
            variant="default"
            placeholder="Pesquisar talentos ou projetos..."
            iconLeft="search"
            hideIconsOnInput
            value={searchTerm}
            onChange={(e: any) => onSearchChange(e.target.value)}
            onBlur={onSearchBlur}
          />

          {searchTerm && isDropdownVisible && (
            <SearchResultsDropdown
              students={searchResultStudents}
              projects={searchResultProjects}
              onStudentSelect={onStudentSelect}
              onProjectSelect={onProjectSelect}
            />
          )}
        </div>

        <div className="flex-shrink-0 flex items-center gap-4">
          {inviteMenu && <InviteMenu {...inviteMenu} />}

          <div className="relative" ref={menuRef}>
            {currentUser ? (
              <div className="flex items-center gap-3 cursor-pointer group" onClick={onToggleAccountMenu}>
                <div className="hidden md:flex flex-col items-end mr-1">
                  <span className="text-[9px] font-black text-[#006ACB] uppercase tracking-widest leading-none mb-1">
                    {currentUser.role === 'professor' ? 'Docente' : 'Online'}
                  </span>
                  <span className="text-[#003465] font-bold text-xs">{currentUser.name?.split(' ')[0] || 'Usuário'}</span>
                </div>
                <Avatar
                  name={currentUser.name || 'Usuário'}
                  image={currentUser.profileImage}
                  size="md"
                  className={`border-2 transition-all ${isAccountMenuOpen ? 'border-[#006ACB] scale-105 shadow-lg' : 'border-gray-200 group-hover:border-[#006ACB]'}`}
                />

                {isAccountMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-72 bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,52,101,0.15)] border border-gray-100 py-6 z-[1100] animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="px-8 pb-4 border-b border-gray-50 flex flex-col items-center text-center">
                      <p className="text-[#006ACB] text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                        {currentUser.role === 'professor' ? 'Painel Docente' : 'Conta AcadeMe'}
                      </p>
                      <Avatar name={currentUser.name || 'Usuário'} image={currentUser.profileImage} size="lg" className="border-4 border-blue-50 p-0.5 mb-3" />
                      <p className="text-[#003465] font-black text-lg tracking-tighter leading-tight truncate w-full">{currentUser.name}</p>
                      <p className="text-gray-400 text-xs truncate w-full">{currentUser.email}</p>
                    </div>
                    <div className="pt-4 px-2 text-left">
                      <button
                        onClick={onNavigateProfile}
                        className="w-full flex items-center gap-4 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-[#006ACB] rounded-xl transition-all group"
                      >
                        Meu Perfil
                      </button>
                      <div className="my-2 border-t border-gray-50 mx-4" />
                      <button onClick={onLogout} className="w-full flex items-center gap-4 px-6 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        Sair da conta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              unauthenticatedActions || (
                <div className="flex gap-4">
                  <Button shape="pill" size="sm" className="text-xs font-bold px-6">
                    Login
                  </Button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;

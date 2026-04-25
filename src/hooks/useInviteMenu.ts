import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { ProjectRecord } from '../types/models';
import { getAcceptedStudentSender } from '../utils/project';

type UserRole = 'student' | 'professor';

interface InviteUser {
    _id: string;
    role?: string;
}

interface UseInviteMenuOptions {
    onSelect?: (projectId: string) => void;
    onAccepted?: (projectId: string) => void | Promise<void>;
    onDeclined?: (projectId: string) => void | Promise<void>;
}

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const useInviteMenu = (currentUser?: InviteUser | null, options: UseInviteMenuOptions = {}) => {
    const inviteMenuRef = useRef<HTMLDivElement>(null);
    const [invites, setInvites] = useState<ProjectRecord[]>([]);
    const [isInviteMenuOpen, setIsInviteMenuOpen] = useState(false);

    const role = currentUser?.role as UserRole | undefined;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (inviteMenuRef.current && !inviteMenuRef.current.contains(event.target as Node)) {
                setIsInviteMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const refreshInvites = useCallback(async () => {
        if (!currentUser?._id || (role !== 'student' && role !== 'professor')) {
            setInvites([]);
            return;
        }

        const endpoint =
            role === 'professor'
                ? `${apiUrl}/professors/${currentUser._id}/invites`
                : `${apiUrl}/students/${currentUser._id}/invites`;

        try {
            const response = await fetch(endpoint);
            const data = await response.json();
            setInvites(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erro ao carregar convites:', error);
        }
    }, [currentUser?._id, role]);

    useEffect(() => {
        refreshInvites();
    }, [refreshInvites]);

    const handleRespondInvite = useCallback(async (projectId: string, status: 'accepted' | 'declined') => {
        if (!currentUser?._id || (role !== 'student' && role !== 'professor')) {
            return;
        }

        const endpoint =
            role === 'professor'
                ? `${apiUrl}/projects/${projectId}/respond-professor-invite`
                : `${apiUrl}/projects/${projectId}/respond-invite`;

        const payload =
            role === 'professor'
                ? { professorId: currentUser._id, status, comment: '' }
                : { studentId: currentUser._id, status };

        try {
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                toast.error(data?.error || 'Não foi possível responder ao convite.');
                return;
            }

            setInvites((previousInvites) => previousInvites.filter((invite) => invite._id !== projectId));

            if (status === 'accepted') {
                toast.success(role === 'professor' ? 'Convite aceito e validação registrada.' : 'Equipe atualizada.');
                await options.onAccepted?.(projectId);
            } else {
                toast.success(role === 'professor' ? 'Convite recusado.' : 'Convite recusado.');
                await options.onDeclined?.(projectId);
            }
        } catch (error) {
            toast.error('Erro de conexão.');
        }
    }, [currentUser?._id, options, role]);

    const items = useMemo(() => {
        if (role === 'professor') {
            return invites.map((invite) => ({
                id: invite._id,
                title: invite.title,
                subtitle: 'Convite para validação docente',
                avatarName: invite.title || 'P',
                avatarImage: invite.imageUrl
            }));
        }

        return invites.map((invite) => {
            const sender = getAcceptedStudentSender(invite);

            return {
                id: invite._id,
                title: invite.title,
                subtitle: `Convidado por ${sender?.name.split(' ')[0] || 'equipe'}`,
                avatarName: sender?.name || 'A',
                avatarImage: sender?.profileImage
            };
        });
    }, [invites, role]);

    const inviteMenu = useMemo(() => {
        if (role !== 'student' && role !== 'professor') {
            return undefined;
        }

        return {
            menuRef: inviteMenuRef,
            title: role === 'professor' ? 'Convites de Validação' : 'Convites de Projeto',
            emptyMessage: 'Nenhuma nova notificação',
            isOpen: isInviteMenuOpen,
            count: invites.length,
            items,
            onToggle: () => setIsInviteMenuOpen((previousState) => !previousState),
            onSelect: (projectId: string) => {
                setIsInviteMenuOpen(false);
                options.onSelect?.(projectId);
            },
            onAccept: (projectId: string) => handleRespondInvite(projectId, 'accepted'),
            onDecline: (projectId: string) => handleRespondInvite(projectId, 'declined')
        };
    }, [handleRespondInvite, invites.length, isInviteMenuOpen, items, options, role]);

    return {
        invites,
        inviteMenu,
        refreshInvites
    };
};

export default useInviteMenu;

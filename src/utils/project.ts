import { ProjectRecord, StudentSummary, TeamMember } from '../types/models';

export const isProjectValidated = (project?: Partial<ProjectRecord> | null): boolean =>
    Boolean(project?.endorsements?.length);

export const isAcceptedProjectMember = (
    project?: Pick<ProjectRecord, 'students'> | null,
    userId?: string | null
): boolean =>
    Boolean(
        userId &&
        project?.students?.some(
            (member: TeamMember) =>
                member.status === 'accepted' &&
                typeof member.student !== 'string' &&
                member.student._id === userId
        )
    );

export const getProjectNavigationPath = (
    project: Pick<ProjectRecord, '_id'>,
    userId?: string | null,
    role?: string
): string => {
    void userId;
    void role;
    return `/project/${project._id}`;
};

export const getViewerQuery = (currentUser?: { _id?: string; role?: string } | null): string => {
    if (!currentUser?._id || !currentUser?.role) return '';

    const params = new URLSearchParams({
        viewerId: currentUser._id,
        viewerRole: currentUser.role
    });

    return params.toString();
};

export const withViewerQuery = (
    url: string,
    currentUser?: { _id?: string; role?: string } | null
): string => {
    const viewerQuery = getViewerQuery(currentUser);
    if (!viewerQuery) return url;

    return `${url}${url.includes('?') ? '&' : '?'}${viewerQuery}`;
};

export const countAcceptedMembers = (project?: Pick<ProjectRecord, 'students'> | null): number =>
    project?.students?.filter((member: TeamMember) => member.status === 'accepted').length ?? 0;

export const getProjectAdminId = (
    project?: Pick<ProjectRecord, 'adminStudent' | 'students'> | null
): string | null => {
    if (!project) return null;
    if (typeof project.adminStudent === 'string') return project.adminStudent;
    if (project.adminStudent?._id) return project.adminStudent._id;

    const firstAccepted = project.students?.find(
        (member: TeamMember) => member.status === 'accepted' && typeof member.student !== 'string'
    );

    return typeof firstAccepted?.student === 'string' ? null : firstAccepted?.student?._id ?? null;
};

export const isProjectAdmin = (
    project?: Pick<ProjectRecord, 'adminStudent' | 'students'> | null,
    userId?: string | null
): boolean => Boolean(userId && getProjectAdminId(project) === userId);

export const canDeleteProject = (
    project?: Pick<ProjectRecord, 'adminStudent' | 'students'> | null,
    userId?: string | null
): boolean => isProjectAdmin(project, userId) && countAcceptedMembers(project) <= 1;

export const getAcceptedStudentSender = (project: Pick<ProjectRecord, 'students'>): StudentSummary | null => {
    const sender = project.students?.find(
        (member: TeamMember) => member.status === 'accepted' && typeof member.student !== 'string'
    );

    return typeof sender?.student === 'string' ? null : sender?.student ?? null;
};

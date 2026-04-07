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
    project: Pick<ProjectRecord, '_id' | 'students'>,
    userId?: string | null,
    role?: string
): string => {
    if (role !== 'professor' && isAcceptedProjectMember(project, userId)) {
        return `/upload?edit=${project._id}`;
    }

    return `/project/${project._id}`;
};

export const countAcceptedMembers = (project?: Pick<ProjectRecord, 'students'> | null): number =>
    project?.students?.filter((member: TeamMember) => member.status === 'accepted').length ?? 0;

export const canDeleteProject = (project?: Pick<ProjectRecord, 'students'> | null): boolean =>
    countAcceptedMembers(project) <= 1;

export const getAcceptedStudentSender = (project: Pick<ProjectRecord, 'students'>): StudentSummary | null => {
    const sender = project.students?.find(
        (member: TeamMember) => member.status === 'accepted' && typeof member.student !== 'string'
    );

    return typeof sender?.student === 'string' ? null : sender?.student ?? null;
};

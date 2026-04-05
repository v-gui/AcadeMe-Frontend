import { ProjectRecord, StudentSummary, TeamMember } from '../types/models';

export const isProjectValidated = (project?: Partial<ProjectRecord> | null): boolean =>
    Boolean(project?.endorsements?.length);

export const getAcceptedStudentSender = (project: Pick<ProjectRecord, 'students'>): StudentSummary | null => {
    const sender = project.students?.find(
        (member: TeamMember) => member.status === 'accepted' && typeof member.student !== 'string'
    );

    return typeof sender?.student === 'string' ? null : sender?.student ?? null;
};

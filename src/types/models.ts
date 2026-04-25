

export type InviteStatus = 'accepted' | 'pending' | 'declined';

export interface StudentSummary {
    _id: string;
    name: string;
    email?: string;
    course: string;
    bio?: string;
    interests: string[];
    profileImage?: string;
    role?: string;
}

export interface ProfessorSummary {
    _id: string;
    name: string;
    email?: string;
    department?: string;
    academicTitle?: string;
    bio?: string;
    areasOfExpertise: string[];
    profileImage?: string;
    role?: string;
}

export interface TeamMember {
    student: StudentSummary | string;
    status: InviteStatus;
}

export interface ProfessorInvite {
    professor: ProfessorSummary | string;
    status: InviteStatus;
}

export interface ProjectEndorsement {
    professor: ProfessorSummary | string;
    comment?: string;
    createdAt?: string;
}

export interface ProjectRecord {
    _id: string;
    title: string;
    description: string;
    imageUrl?: string;
    createdAt?: string;
    adminStudent?: StudentSummary | string;
    tags?: string[];
    posters?: Array<{ url: string; name: string }>;
    files?: Array<{ name: string; date: string; base64?: string }>;
    references?: string[];
    students?: TeamMember[];
    invitedProfessors?: ProfessorInvite[];
    endorsements?: ProjectEndorsement[];
}

export interface SearchResults {
    students: StudentSummary[];
    professors: ProfessorSummary[];
    projects: ProjectRecord[];
}

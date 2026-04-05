import React from 'react';
import Avatar from './Avatar';
import ValidatedBadge from './ValidatedBadge';
import EmptyState from './EmptyState';
import { ProjectRecord, SearchResults, StudentSummary } from '../types/models';
import { isProjectValidated } from '../utils/project';

interface SearchResultsDropdownProps {
  students: SearchResults['students'];
  projects: SearchResults['projects'];
  onStudentSelect: (studentId: string) => void;
  onProjectSelect: (projectId: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

const SearchResultsDropdown: React.FC<SearchResultsDropdownProps> = ({
  students,
  projects,
  onStudentSelect,
  onProjectSelect,
  emptyTitle = 'Nenhum resultado',
  emptyDescription = 'Tente ajustar o termo pesquisado.',
  className = ''
}) => {
  return (
    <div className={`absolute top-full left-0 w-full bg-white shadow-[0_20px_60px_rgba(0,52,101,0.15)] rounded-b-3xl mt-1 border border-gray-100 overflow-hidden text-left z-[1100] max-h-[500px] overflow-y-auto ${className}`}>
      {students.length > 0 && (
        <div>
          <div className="bg-blue-50 px-5 py-3 border-y border-blue-200">
            <span className="text-[10px] font-black text-[#006ACB] uppercase tracking-[0.2em] flex items-center gap-2">
              Alunos
            </span>
          </div>
          {students.map((student: StudentSummary) => (
            <div
              key={student._id}
              onClick={() => onStudentSelect(student._id)}
              className="flex items-center gap-4 p-4 hover:bg-blue-50/50 cursor-pointer border-b border-gray-50 last:border-none group"
            >
              <Avatar name={student.name} image={student.profileImage} size="sm" className="shadow-sm" />
              <div className="flex flex-col flex-1">
                <span className="font-bold text-[#003465] text-xs group-hover:text-[#006ACB] transition-colors">
                  {student.name}
                </span>
                <span className="text-gray-400 text-[9px] uppercase font-black tracking-wider mt-0.5">
                  {student.course}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && (
        <div>
          <div className="bg-blue-50 px-5 py-3 border-y border-blue-200">
            <span className="text-[10px] font-black text-[#006ACB] uppercase tracking-[0.2em] flex items-center gap-2">
              Projetos
            </span>
          </div>
          {projects.map((project: ProjectRecord) => (
            <div
              key={project._id}
              onClick={() => onProjectSelect(project._id)}
              className="flex items-center gap-4 p-4 hover:bg-blue-50/50 cursor-pointer border-b border-gray-50 last:border-none group"
            >
              <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <div className="font-bold text-[#003465] text-xs group-hover:text-[#006ACB] transition-colors flex items-center gap-2">
                  <span className="truncate">{project.title}</span>
                  {isProjectValidated(project) && <ValidatedBadge compact />}
                </div>
                <span className="text-gray-400 text-[9px] uppercase font-black tracking-wider mt-0.5 truncate">
                  Tags: <span className="text-blue-400">{project.tags?.join(', ') || 'Nenhuma'}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {students.length === 0 && projects.length === 0 && (
        <EmptyState title={emptyTitle} description={emptyDescription} compact className="m-4 border-none shadow-none bg-transparent" />
      )}
    </div>
  );
};

export default SearchResultsDropdown;

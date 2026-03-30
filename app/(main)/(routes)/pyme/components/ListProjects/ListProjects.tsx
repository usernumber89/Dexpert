import { ListProjectsProps } from './ListProjects.types';
import { ProjectCard } from './ProjectCard';
import { FolderOpen } from 'lucide-react';

export default function ListProjects({ projects }: ListProjectsProps) {
  if (projects.length === 0) {
    return (
      <div className="mx-6 my-4 rounded-xl border border-dashed border-gray-200 bg-white p-16 flex flex-col items-center gap-3 text-center">
        <FolderOpen size={32} className="text-gray-300" />
        <p className="text-sm font-medium text-gray-400">No projects yet</p>
        <p className="text-xs text-gray-300">Click "Add project" to publish your first one</p>
      </div>
    );
  }

  return (
    <div className="mx-6 my-4 flex flex-col gap-3">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-widest px-1">
        {projects.length} {projects.length === 1 ? "project" : "projects"}
      </p>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
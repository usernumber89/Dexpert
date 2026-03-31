"use client";

import Link from "next/link";
import Image from "next/image";
import { Project } from "@prisma/client";
import { ArrowRight } from "lucide-react";


export type ProjectPyme = {
  name: string;
  logoUrl: string | null;
};

export type ListProjectsProps = {
  title: string;
  projects: ( Project & { pyme: ProjectPyme | null } )[];
  studentSkills?: string[];
};

function calculateMatch( projectSkills: string, studentSkills: string[] = [] ) {
  const projectSkillList = projectSkills
    ?.split( "," )
    .map( ( s ) => s.trim().toLowerCase() ) || [];

  const normalizedStudentSkills = studentSkills.map( ( s ) => s.trim().toLowerCase() );

  const matchCount = projectSkillList.filter( skill =>
    normalizedStudentSkills.includes( skill )
  ).length;

  const percentage = Math.round( ( matchCount / projectSkillList.length ) * 100 );
  return isNaN( percentage ) ? 0 : percentage;
}


export default function ProjectsView( { title, projects, studentSkills }: ListProjectsProps ) {
  return (
    <div className="mt-8">
      <div className="my-4 mx-6 rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-center text-[#0a2342]">{title}</h2>
        <div className="border-b border-[#0a2342] my-4" />

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {projects.map( ( { id, skills, title, description, pyme } ) => {
              const match = calculateMatch( skills, studentSkills );
              return (
                <Link
                  key={id}
                  href={`/student/projects/${id}`}
                  className="bg-white text-gray-800 rounded-2xl p-4 flex flex-col justify-between transition-shadow hover:shadow-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm">
                      <p className="font-medium text-gray-600">{pyme?.name ?? "PYME"}</p>
                      <p className="text-xs text-gray-400">Remote</p>
                    </div>
                    {pyme?.logoUrl ? (
                      <Image
                        src={pyme.logoUrl}
                        alt="Pyme Logo"
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                        <Image src="/lgo.png" height={40} width={40} alt="logo" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">{title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-3 mb-3">{description}</p>
                    {skills && (
                      <p className="text-xs text-blue-500 font-medium">{skills}</p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center text-blue-500 font-semibold gap-1">
                      <ArrowRight className="w-4 h-4" />
                      See Details
                    </div>
                    <div className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-bold">
                      {match}% match
                    </div>
                  </div>
                </Link>
              );
            } )}
          </div>
        ) : (
          <p className="text-center text-gray-600 mt-6">No projects found.</p>
        )}
      </div>
    </div>
  );
}

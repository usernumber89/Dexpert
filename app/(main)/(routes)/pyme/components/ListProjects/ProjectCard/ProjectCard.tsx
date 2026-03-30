'use client'
import Image from "next/image";
import { ProjectCardProps } from "./ProjectCard.types";
import Actions from "./Actions/Actions";

export function ProjectCard({ project }: ProjectCardProps) {
  const { id, title, description, skills, imageUrl, status, isPublished } = project;

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start justify-between p-5 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-200">
      
      {/* Image */}
      <div className="flex-shrink-0">
        <Image
          src={imageUrl || "/lgo.png"}
          alt={title}
          width={100}
          height={100}
          className="rounded-xl object-cover w-24 h-24"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h2 className="text-base font-semibold text-[#0A2243] truncate">{title}</h2>
          {isPublished ? (
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-xs font-medium px-2 py-0.5 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Published
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-400 text-xs font-medium px-2 py-0.5 rounded-full border border-gray-100">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
              Draft
            </span>
          )}
          {status === "closed" && (
            <span className="inline-flex items-center gap-1 bg-red-50 text-red-400 text-xs font-medium px-2 py-0.5 rounded-full border border-red-100">
              Closed
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {skills.split(",").map((skill, i) => (
            <span
              key={i}
              className="text-xs bg-blue-50 text-[#2196F3] px-2 py-0.5 rounded-full border border-blue-100"
            >
              {skill.trim()}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 w-full lg:w-36">
        <Actions projectId={id} projectStatus={status} />
      </div>
    </div>
  );
}
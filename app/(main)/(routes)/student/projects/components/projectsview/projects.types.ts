import { Project } from "@prisma/client"

export type ListProjectsProps = {
    title : string
    projects : Project[] | undefined
}

export type ProjectDetailsProps = {
  params: {
    id: string;
  };
};


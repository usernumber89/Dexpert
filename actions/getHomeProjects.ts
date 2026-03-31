import prisma from "@/lib/prisma";
import { Project } from "@prisma/client";

export const getHomeProjects = async (): Promise<Project[] | null> => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        isPublished: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return projects;
  } catch (error) {
    console.log(error);
    return null;
  }
};

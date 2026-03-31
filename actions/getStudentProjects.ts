import { Project, Pyme } from "@prisma/client";
import prisma from "@/lib/prisma";

export const getStudentProjects = async (): Promise<(Project & { pyme: { name: string; logoUrl: string | null } | null })[] | null> => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        isPublished: true,
      },
      include: {
        pyme: {
          select: {
            name: true,
            logoUrl: true, // si usas el logo
          },
        },
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

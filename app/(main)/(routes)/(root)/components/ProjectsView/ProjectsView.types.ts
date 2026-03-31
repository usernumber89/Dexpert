import { Project } from "@prisma/client"

export type ListProjectsProps = {
    title : string
    projects : Project[] | null
}

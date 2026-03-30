import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Header } from "./components";
import prisma from "@/lib/prisma";
import ListProjects from "./components/ListProjects/ListProjects";
import {PaymentFeedback} from "./components/PaymentFeedback/PaymentFeedback";

export default async function PymePage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const projects = await prisma.project.findMany({
    where: { userId: user.id }
  });

  return (
    <div>
      <Suspense fallback={null}>
        <PaymentFeedback />
      </Suspense>
      <Header />
      <ListProjects projects={projects} />
    </div>
  )
}
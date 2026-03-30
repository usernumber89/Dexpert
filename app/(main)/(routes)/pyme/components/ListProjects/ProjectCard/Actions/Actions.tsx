'use client'
import { ActionsProps } from './Actions.types';
import { Button } from '@/components/ui/button';
import { Edit, Trash, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

export default function Actions({ projectId, projectStatus }: ActionsProps) {
  const router = useRouter();
  const isClosed = projectStatus === "closed";

  const onEdit = () => router.push(`/pyme/${projectId}`);

  const deleteProject = async () => {
    await axios.delete(`/api/project/${projectId}`);
    toast.success("Project deleted");
    router.refresh();
  };

  const closeProject = async () => {
    try {
      await axios.post(`/api/project/${projectId}/close`);
      toast.success("Project closed and certificates generated");
      router.refresh();
    } catch {
      toast.error("Error closing project");
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <button
        onClick={onEdit}
        className="w-full flex items-center justify-center gap-2 text-sm font-medium px-3 py-2 rounded-lg bg-[#0A2243] text-white hover:bg-[#0d2d57] transition"
      >
        <Edit size={14} /> Edit
      </button>

      <button
        onClick={closeProject}
        disabled={isClosed}
        className="w-full flex items-center justify-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <X size={14} /> {isClosed ? "Closed" : "Close project"}
      </button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            disabled={isClosed}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash size={14} /> Remove
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0A2243]">Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The project and all its data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteProject}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
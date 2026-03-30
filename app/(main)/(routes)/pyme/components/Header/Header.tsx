import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { FormCreateProject } from "./FormCreateProject";

export function Header() {
  return (
    <div className="mx-6 my-4">
      <div className="flex justify-between items-center py-4 px-5 rounded-xl border border-gray-100 bg-white">
        <div>
          <h1 className="text-sm font-semibold text-[#0A2243]">My Projects</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage and publish your projects</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#2196F3] hover:bg-[#0A2243] text-white gap-1.5 text-sm">
              <Plus size={15} /> Add project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-[#0A2243]">Create your project</DialogTitle>
            </DialogHeader>
            <FormCreateProject />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
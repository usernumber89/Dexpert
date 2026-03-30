'use client'
import axios from 'axios';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formSchema } from "./FormCreateProject.form";
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export function FormCreateProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { prompt: "", projectName: "", description: "", skills: "" },
  });

  const { setValue, watch } = form;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const res = await axios.post("/api/project", values);
      toast.success("Project created successfully");
      router.push(`/pyme/${res.data.id}`);
    } catch {
      toast.error("Error creating project");
    }
  };

  const generateIdea = async () => {
    const prompt = watch('prompt')?.trim();
    if (!prompt) { toast.error("Write a prompt first"); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/GenerateIdea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.title && data.description) {
        setValue('projectName', data.title);
        setValue('description', data.description);
        setValue('skills', data.skills);
        toast.success("Idea generated!");
      } else {
        toast.error("Generation failed. Try another prompt.");
      }
    } catch {
      toast.error("Error contacting the AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">

        {/* AI Prompt */}
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 space-y-3">
          <p className="text-xs font-medium text-[#2196F3] uppercase tracking-widest">
            Generate with AI
          </p>
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="e.g. I need a website for my bakery"
                    className="bg-white text-gray-800 text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <button
            type="button"
            onClick={generateIdea}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-medium text-[#2196F3] hover:text-[#0A2243] transition disabled:opacity-50"
          >
            <Sparkles size={14} />
            {loading ? "Generating..." : "Generate project brief"}
          </button>
        </div>

        {/* Manual fields */}
        <FormField
          control={form.control}
          name="projectName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-gray-600">Project name</FormLabel>
              <FormControl>
                <Input placeholder="E-commerce store" className="text-gray-800 text-sm" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-gray-600">Description</FormLabel>
              <FormControl>
                <Input placeholder="My project is about..." className="text-gray-800 text-sm" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-gray-600">Required skills</FormLabel>
              <FormControl>
                <Input placeholder="React, UX Design, etc." className="text-gray-800 text-sm" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-[#2196F3] hover:bg-[#0A2243] text-white text-sm"
        >
          Publish project
        </Button>
      </form>
    </Form>
  );
}
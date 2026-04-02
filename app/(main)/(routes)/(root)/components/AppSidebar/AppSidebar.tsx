'use client';

import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton, // Cambiado por MenuButton para mejor compatibilidad
  useSidebar,
} from '@/components/ui/sidebar';

import Link from 'next/link';
import Image from 'next/image';
import { studentRoutes, pymeRoutes } from './AppSidebar.data';
import { useUserRole } from '@/hooks/useUserRole';
import { usePathname } from 'next/navigation';
import {useUser} from '@clerk/nextjs'

export function AppSidebar() {
  const { state } = useSidebar();
  const { role, isLoading } = useUserRole();
  const pathname = usePathname();
  const { user } = useUser();
  const isCollapsed = state === 'collapsed';
  if (isLoading) {
    return (
      <Sidebar collapsible="icon" className="border-r border-slate-200/60">
        <div className="flex flex-col items-center justify-center h-full space-y-4 bg-slate-50/50">
          <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </Sidebar>
    );
  }

  const routes = role === 'STUDENT' ? studentRoutes : pymeRoutes;
  const accentColor = role === 'STUDENT' ? 'blue' : 'slate';

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r border-slate-200/80 shadow-[0_0_15px_rgba(0,0,0,0.02)] transition-all duration-300"
    >
      {/* Header con Background sutil */}
      <SidebarHeader className="p-4 mb-2">
        <Link 
          href="/" 
          className="flex items-center gap-3 transition-transform duration-200 hover:scale-[1.02]"
        >
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-xl shadow-lg shadow-blue-200/50">
            <Image
              src="/lgo.png" // Asegúrate que sea un icono pequeño para modo colapsado
              alt="Logo"
              width={24}
              height={24}
              className="invert brightness-0"
            />
          </div>
          {state !== 'collapsed' && (
            <span className="text-xl font-bold tracking-tight text-slate-800">
              Dexpert<span className="text-blue-600">.</span>
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400/80">
            {role} Workspace
          </SidebarGroupLabel>
          
          <SidebarMenu className="gap-1.5">
            {routes.map((item) => {
              const isActive = pathname === item.url;
              
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className={`
                      relative flex items-center gap-3 px-3 py-6 rounded-xl transition-all duration-300 group
                      ${isActive 
                        ? 'bg-blue-50/80 text-blue-700 shadow-[0_4px_12px_rgba(37,99,235,0.08)]' 
                        : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900'}
                    `}
                  >
                    <Link href={item.url}>
                      {/* Indicador lateral activo */}
                      {isActive && (
                        <div className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full" />
                      )}
                      
                      <item.icon className={`
                        w-5 h-5 transition-transform duration-300 group-hover:scale-110
                        ${isActive ? 'text-blue-600' : 'text-slate-400'}
                      `} />
                      
                      <span className={`font-medium transition-all ${isActive ? 'translate-x-0.5' : ''}`}>
                        {item.title}
                      </span>

                      {/* Brillo sutil al estar activo */}
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent rounded-xl pointer-events-none" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer del Sidebar (Opcional - Perfil) */}
      {!isCollapsed && (
        <div className="p-3 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gray-50">
            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-xs font-medium text-[#0C447C] flex-shrink-0">
              {user?.firstName ? user.firstName[0].toUpperCase() : 'D'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">
                {user?.firstName ?? 'Dexpert User'}
              </p>
              <p className="text-[10px] text-gray-400 capitalize">
                {role?.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}
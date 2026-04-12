import { LayoutDashboard, PlusCircle, History, User, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const items = [
  { title: "Dashboard",        url: "/dashboard",              icon: LayoutDashboard },
  { title: "New Analysis",     url: "/dashboard/new-analysis", icon: PlusCircle },
  { title: "Analysis History", url: "/dashboard/history",      icon: History },
  { title: "Profile",          url: "/dashboard/profile",      icon: User },
];

export function DashboardSidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Get the current session token directly without triggering lock
      const sessionStr = Object.keys(localStorage)
        .find(k => k.includes("auth-token"));
      
      let accessToken = SUPABASE_ANON_KEY;
      if (sessionStr) {
        try {
          const session = JSON.parse(localStorage.getItem(sessionStr) || "{}");
          accessToken = session?.access_token || SUPABASE_ANON_KEY;
        } catch { /* use anon key */ }
      }

      // Call Supabase logout via direct REST
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      // Clear all local storage keys related to supabase
      Object.keys(localStorage)
        .filter(k => k.includes("supabase") || k.includes("sb-"))
        .forEach(k => localStorage.removeItem(k));

      toast.success("Logged out successfully ✅");
      setTimeout(() => { window.location.href = "/"; }, 500);

    } catch (err) {
      console.error("Logout error:", err);
      // Even if REST call fails, clear storage and redirect
      Object.keys(localStorage)
        .filter(k => k.includes("supabase") || k.includes("sb-"))
        .forEach(k => localStorage.removeItem(k));
      window.location.href = "/";
    }
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <div className="flex items-center gap-2 px-4 py-5">
        <Logo size={28} />
        <span className="font-heading text-sm font-bold text-sidebar-foreground">
          SolarMap AI
        </span>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

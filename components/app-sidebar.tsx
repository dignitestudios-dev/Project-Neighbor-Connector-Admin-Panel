"use client";

import * as React from "react";
import {
  Bell,
  LayoutDashboard,
  AlertTriangle,
  CircleUserRound,
  FileText,
  Group,
} from "lucide-react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";

const data = {
  user: {
    name: "Next js",
    email: "admin@example.com",
    avatar: "",
  },
  navGroups: [
    {
      label: "Dashboards",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "Apps",
      items: [
        
        {
          title: "Users",
          url: "/dashboard/users",
          icon: CircleUserRound,
        },
        {
          title: "Notifications",
          url: "/dashboard/Notification",
          icon: Bell,
        },
        {
          title: "Circles",
          url: "/dashboard/circles",
          icon: Group,
        },
        {
          title: "Posts",
          url: "/dashboard/post",
          icon: FileText,
        },
        
        {
          title: "Reports",
          url: "/dashboard/Reports",
          icon: AlertTriangle,
        }
        
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useSelector((state: RootState) => state.auth.user);

  const userData = user
    ? {
        name: user.name,
        email: user.email,
        avatar: "",
      }
    : {
        name: "Admin",
        email: "",
        avatar: "",
      };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex  aspect-square  items-center justify-center   ">
                  <Image src="/images/Logo.png" alt="Logo" width={124} height={124} />
                </div>
                
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}

import { Home, Building2, FileText, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Overview", url: "/", icon: Home, group: "GENERAL" },
  { title: "Houses", url: "/houses", icon: Building2, group: "GENERAL" },
  { title: "Reports", url: "/reports", icon: FileText, group: "REPORTS" },
  { title: "Settings", url: "/settings", icon: Settings, group: "SETTINGS" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const groupedItems = navItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  return (
    <Sidebar className="border-r border-border glass-panel">
      <div className="p-4 border-b border-border">
        <NavLink to="/">
          <Button
            variant="ghost"
            className="w-full justify-center hover:bg-primary/10 border-2 border-primary/30 hover:border-primary transition-all"
          >
            <span className={`font-bold text-primary text-lg ${isCollapsed ? "hidden" : ""}`}>
              OptiBroiler
            </span>
            {isCollapsed && <span className="font-bold text-primary text-xl">OB</span>}
          </Button>
        </NavLink>
      </div>

      <SidebarContent>
        {Object.entries(groupedItems).map(([group, items]) => (
          <SidebarGroup key={group}>
            <SidebarGroupLabel className="text-xs text-muted-foreground px-3">
              {!isCollapsed && group}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                            isActive
                              ? "bg-primary/20 text-primary font-medium border-l-2 border-primary"
                              : "hover:bg-muted/50 text-muted-foreground"
                          }`
                        }
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

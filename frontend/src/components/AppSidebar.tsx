import {
  Home, BarChart3, Settings2, Brain, Trophy, FileText,
  Play, Upload, Database, Bot, Network, ChevronLeft, ChevronRight, ChevronDown, Sparkles,
  LayoutDashboard, Gauge, Clock, FileBarChart, ImageIcon, Type
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import rakutenLogo from "@/assets/rakuten-logo-red.png";
import rakutenRLogo from "@/assets/rakuten-r-logo.png";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const mainItems = [
  { title: "Accueil", url: "/", icon: Home },
  { title: "Exploration", url: "/exploration", icon: BarChart3 },
  { title: "Preprocessing", url: "/preprocessing", icon: Settings2 },
  { title: "Modèles", url: "/modeles", icon: Brain },
  { title: "Résultats", url: "/resultats", icon: Trophy },
  { title: "Conclusion", url: "/conclusion", icon: FileText },
];

const demoItems = [
  { title: "Texte", url: "/demo/texte", icon: Type },
  { title: "Multimodal", url: "/demo/multimodal", icon: ImageIcon },
];

const dashboardItems = [
  { title: "KPIs", url: "/dashboard/kpis", icon: Gauge },
  { title: "Graphiques", url: "/dashboard/graphiques", icon: BarChart3 },
  { title: "Timeline", url: "/dashboard/timeline", icon: Clock },
  { title: "Résumé", url: "/dashboard/resume", icon: FileBarChart },
];

const bonusItems = [
  { title: "RAG", url: "/rag", icon: Database },
  { title: "RAG Pipeline", url: "/rag-patterns", icon: Network },
  { title: "AI Agents", url: "/agents", icon: Bot },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const [bonusOpenExpanded, setBonusOpenExpanded] = useState(false);
  const [bonusOpenCollapsed, setBonusOpenCollapsed] = useState(false);
  const prevCollapsed = useRef(collapsed);

  // Reset bonus states when toggling sidebar (but keep dashboard)
  useEffect(() => {
    if (prevCollapsed.current !== collapsed) {
      setBonusOpenExpanded(false);
      setBonusOpenCollapsed(false);
      prevCollapsed.current = collapsed;
    }
  }, [collapsed]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={`${collapsed ? 'p-0 overflow-visible flex items-center justify-center' : 'p-4'}`}>
        {!collapsed && (
          <img
            src={rakutenLogo}
            alt="Rakuten"
            className="h-6 w-auto object-contain dark:brightness-0 dark:invert"
          />
        )}
        {collapsed && (
          <div className="flex items-center justify-center overflow-visible py-1">
            <img
              src={rakutenRLogo}
              alt="R"
              className="h-[60px] w-[60px] min-w-[60px] min-h-[60px] object-contain dark:brightness-0 dark:invert"
            />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Projet */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/60 text-[10px] uppercase tracking-wider">
            {!collapsed && "Projet"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent/50 transition-colors"
                      activeClassName="bg-primary/10 text-primary border-r-2 border-primary"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Démo */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/60 text-[10px] uppercase tracking-wider">
            {!collapsed && "Démo"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {demoItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      className="hover:bg-sidebar-accent/50 transition-colors"
                      activeClassName="bg-primary/10 text-primary border-r-2 border-primary"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Dashboard */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/60 text-[10px] uppercase tracking-wider">
            {!collapsed && "Dashboard"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      className="hover:bg-sidebar-accent/50 transition-colors"
                      activeClassName="bg-primary/10 text-primary border-r-2 border-primary"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Extra */}
        <SidebarGroup>
          {collapsed ? (
            <Collapsible open={bonusOpenCollapsed} onOpenChange={setBonusOpenCollapsed}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton className="flex items-center justify-center hover:bg-sidebar-accent/50 transition-colors mx-auto">
                  <Sparkles className="h-4 w-4" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenu>
                  {bonusItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)}>
                        <NavLink
                          to={item.url}
                          className="hover:bg-sidebar-accent/50 transition-colors"
                          activeClassName="bg-accent/10 text-accent border-r-2 border-accent"
                        >
                          <item.icon className="h-4 w-4" />
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <Collapsible open={bonusOpenExpanded} onOpenChange={setBonusOpenExpanded}>
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" />
                    Extra
                  </span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${bonusOpenExpanded ? "rotate-0" : "-rotate-90"}`} />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {bonusItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isActive(item.url)}>
                          <NavLink
                            to={item.url}
                            className="hover:bg-sidebar-accent/50 transition-colors"
                            activeClassName="bg-accent/10 text-accent border-r-2 border-accent"
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          )}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="w-full h-8 text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

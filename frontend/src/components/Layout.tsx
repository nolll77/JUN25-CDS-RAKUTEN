import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnimatedTitle } from "@/components/AnimatedTitle";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const pageTitles: Record<string, { section: string; title: string }> = {
  "/": { section: "Projet", title: "Accueil" },
  "/exploration": { section: "Projet", title: "Exploration" },
  "/preprocessing": { section: "Projet", title: "Preprocessing" },
  "/modeles": { section: "Projet", title: "Modèles" },
  "/resultats": { section: "Projet", title: "Résultats" },
  "/conclusion": { section: "Projet", title: "Conclusion" },
  "/demo/texte": { section: "Démo", title: "Texte" },
  "/demo/multimodal": { section: "Démo", title: "Multimodal" },
  "/dashboard/kpis": { section: "Dashboard", title: "KPIs Globaux" },
  "/dashboard/graphiques": { section: "Dashboard", title: "Graphiques" },
  "/dashboard/timeline": { section: "Dashboard", title: "Timeline" },
  "/dashboard/resume": { section: "Dashboard", title: "Résumé" },
  "/rag": { section: "Extra", title: "RAG" },
  "/rag-patterns": { section: "Extra", title: "RAG Pipeline" },
  "/agents": { section: "Extra", title: "AI Agents" },
};

export default function Layout() {
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname];
  const section = pageInfo ? pageInfo.section : "";
  const title = pageInfo ? pageInfo.title : "Rakuten ML";
  const fullTitle = section ? `${section} / ${title}` : title;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-14 flex items-center justify-between border-b border-border px-4 sticky top-0 z-10 dark:bg-background dark:border-border bg-primary border-primary">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="dark:text-muted-foreground dark:hover:text-foreground text-primary-foreground/80 hover:text-primary-foreground" />
              <div className="hidden dark:flex items-center gap-2 ml-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
                <AnimatedTitle text={fullTitle} className="text-xs font-mono text-muted-foreground" />
              </div>
              <div className="flex dark:hidden items-center gap-2 ml-1">
                <AnimatedTitle text={fullTitle} className="text-sm font-bold text-primary-foreground tracking-tight" />
              </div>
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto" key={location.pathname}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onAnimationComplete={() => {
                  window.dispatchEvent(new Event('resize'));
                }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

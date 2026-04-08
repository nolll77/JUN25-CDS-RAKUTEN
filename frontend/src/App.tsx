import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Accueil from "@/pages/Accueil";
import Exploration from "@/pages/Exploration";
import Preprocessing from "@/pages/Preprocessing";
import Modeles from "@/pages/Modeles";
import Resultats from "@/pages/Resultats";
import Conclusion from "@/pages/Conclusion";
import DemoTexte from "@/pages/DemoTexte";
import DemoImage from "@/pages/DemoImage";
import RAG from "@/pages/RAG";
import RAGPatterns from "@/pages/RAGPatterns";
import Agents from "@/pages/Agents";
import DashboardKPIs from "@/pages/DashboardKPIs";
import DashboardGraphiques from "@/pages/DashboardGraphiques";
import DashboardTimeline from "@/pages/DashboardTimeline";
import DashboardResume from "@/pages/DashboardResume";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Accueil />} />
            <Route path="/exploration" element={<Exploration />} />
            <Route path="/preprocessing" element={<Preprocessing />} />
            <Route path="/modeles" element={<Modeles />} />
            <Route path="/resultats" element={<Resultats />} />
            <Route path="/conclusion" element={<Conclusion />} />
            <Route path="/demo" element={<Navigate to="/demo/texte" replace />} />
            <Route path="/demo/texte" element={<DemoTexte />} />
            <Route path="/demo/image" element={<DemoImage />} />
            <Route path="/dashboard/kpis" element={<DashboardKPIs />} />
            <Route path="/dashboard/graphiques" element={<DashboardGraphiques />} />
            <Route path="/dashboard/timeline" element={<DashboardTimeline />} />
            <Route path="/dashboard/resume" element={<DashboardResume />} />
            <Route path="/rag" element={<RAG />} />
            <Route path="/rag-patterns" element={<RAGPatterns />} />
            <Route path="/agents" element={<Agents />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

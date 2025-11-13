import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Platform from "./pages/Platform";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AppLayout from "./pages/AppLayout";
import Dashboard from "./pages/Dashboard";
import Guardians from "./pages/Guardians";
import Cashflow from "./pages/Cashflow";
import Compliance from "./pages/Compliance";
import Stockage from "./pages/Stockage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/platform" element={<Platform />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="guardians" element={<Guardians />} />
            <Route path="cashflow" element={<Cashflow />} />
            <Route path="compliance" element={<Compliance />} />
            <Route path="stockage" element={<Stockage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

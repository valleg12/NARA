import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppSidebar from "@/components/AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const AppLayout = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Desktop */}
      {!isMobile && <AppSidebar />}
      
      {/* Sidebar Mobile (Drawer) */}
      {isMobile && (
        <AppSidebar 
          isOpen={sidebarOpen} 
          onOpenChange={setSidebarOpen}
          mobile={true}
        />
      )}

      <main className="flex-1 p-4 md:p-8 overflow-auto">
        {/* Header Mobile avec menu hamburger */}
        {isMobile && (
          <div className="mb-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;

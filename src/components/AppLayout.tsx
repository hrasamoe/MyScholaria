import { ReactNode, useState } from "react";
import { Box } from "@mui/material";
import AppSidebar, { DRAWER_WIDTH, COLLAPSED_WIDTH } from "./AppSidebar";

const AppLayout = ({ children }: { children: ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppSidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed((c) => !c)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${sidebarWidth}px)` },
          px: { xs: 2, sm: 3, lg: 4 },
          py: { xs: 2, sm: 3 },
          pt: { xs: 7, lg: 3 },
          transition: (theme) => theme.transitions.create("width"),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AppLayout;

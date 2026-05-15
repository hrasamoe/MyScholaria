import { ReactNode, useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import AppSidebar, { DRAWER_WIDTH, COLLAPSED_WIDTH } from "./AppSidebar";
import { Outlet } from "react-router-dom";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useSnackbar } from "notistack";

const AppLayout = ({}: {}) => {
  const isFirstRender = useRef(true);
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;
  const { enqueueSnackbar } = useSnackbar();
  const isOnline: any = useOnlineStatus();

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!isOnline) {
      enqueueSnackbar("You are offline", {
        variant: "warning",
        autoHideDuration: 3000,
        preventDuplicate: true,
      });
    } else {
      enqueueSnackbar("You are back online", {
        variant: "success",
        autoHideDuration: 3000,
        preventDuplicate: true,
      });
    }
  }, [isOnline, enqueueSnackbar]);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <AppSidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
      />
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
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;

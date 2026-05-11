import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  IconButton,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  Tooltip,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import ClassIcon from "@mui/icons-material/MenuBook";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import ShieldIcon from "@mui/icons-material/Shield";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventIcon from "@mui/icons-material/Event";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import BadgeIcon from "@mui/icons-material/Badge";
import EventNoteIcon from "@mui/icons-material/EventNote";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import WorkIcon from "@mui/icons-material/Work";
import GradingIcon from "@mui/icons-material/Grading";
import QuizIcon from "@mui/icons-material/Quiz";
import SavingsIcon from "@mui/icons-material/Savings";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import PersonIcon from "@mui/icons-material/Person";
import ChatIcon from "@mui/icons-material/Chat";
import CampaignIcon from "@mui/icons-material/Campaign";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import ScienceIcon from "@mui/icons-material/Science";
import VerifiedIcon from "@mui/icons-material/Verified";
import AssessmentIcon from "@mui/icons-material/Assessment";
import LockIcon from "@mui/icons-material/Lock";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../hooks/Authcontext";
import { logout } from "@/services/auth.service";

export const DRAWER_WIDTH = 260;
export const COLLAPSED_WIDTH = 72;

const navGroups = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", path: "/", icon: <DashboardIcon /> }],
  },
  {
    label: "People",
    items: [
      { label: "Students", path: "/students", icon: <SchoolIcon /> },
      { label: "Teachers", path: "/teachers", icon: <PeopleIcon /> },
      { label: "Staff", path: "/staff", icon: <BadgeIcon /> },
    ],
  },
  {
    label: "Academic",
    items: [
      { label: "Classes", path: "/classes", icon: <ClassIcon /> },
      { label: "Classrooms", path: "/classrooms", icon: <MeetingRoomIcon /> },
      { label: "School Calendar", path: "/calendar", icon: <EventNoteIcon /> },
      { label: "Timetable", path: "/timetable", icon: <CalendarMonthIcon /> },
      { label: "Subjects", path: "/subjects", icon: <ClassIcon /> },
      { label: "Coursebook", path: "/coursebook", icon: <HistoryEduIcon /> },
      { label: "Internships", path: "/internships", icon: <WorkIcon /> },
      { label: "Library", path: "/library", icon: <LibraryBooksIcon /> },
    ],
  },
  {
    label: "Assessment",
    items: [
      { label: "Attendance", path: "/attendance", icon: <FactCheckIcon /> },
      { label: "Duty", path: "/duty", icon: <ShieldIcon /> },
      { label: "Grades", path: "/grades", icon: <GradingIcon /> },
      { label: "Exams", path: "/exams", icon: <QuizIcon /> },
    ],
  },
  {
    label: "Financial",
    items: [
      { label: "Payments", path: "/payments", icon: <PaymentIcon /> },
      { label: "Facturation", path: "/facturation", icon: <ReceiptIcon /> },
      { label: "Scholarships", path: "/scholarships", icon: <SavingsIcon /> },
      { label: "Budget", path: "/budget", icon: <AccountBalanceIcon /> },
    ],
  },
  {
    label: "Portals",
    items: [
      {
        label: "Parent Portal",
        path: "/portal/parent",
        icon: <FamilyRestroomIcon />,
      },
      {
        label: "Student Portal",
        path: "/portal/student",
        icon: <PersonIcon />,
      },
    ],
  },
  {
    label: "Communication",
    items: [
      { label: "Messages", path: "/messages", icon: <ChatIcon /> },
      {
        label: "Announcements",
        path: "/announcements",
        icon: <CampaignIcon />,
      },
      { label: "Events", path: "/events", icon: <EventIcon /> },
      {
        label: "Notifications",
        path: "/notifications",
        icon: <NotificationsIcon />,
      },
    ],
  },
  {
    label: "University",
    items: [
      {
        label: "Programs (LMD)",
        path: "/programs",
        icon: <WorkspacePremiumIcon />,
      },
      { label: "Theses", path: "/theses", icon: <ScienceIcon /> },
      { label: "Diplomas", path: "/diplomas", icon: <VerifiedIcon /> },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Reports & KPIs", path: "/reports", icon: <AssessmentIcon /> },
      { label: "Users", path: "/users", icon: <ManageAccountsIcon /> },
      { label: "Roles", path: "/roles", icon: <LockIcon /> },
      { label: "Settings", path: "/settings", icon: <SettingsIcon /> },
    ],
  },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

const AppSidebar = ({ collapsed, onToggleCollapsed }: AppSidebarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  const { clearAuth } = useAuth();
  const handleLogOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.log("Logout error: ", error);
    } finally {
      clearAuth();
      navigate("/auth/signin");
    }
  };

  const renderContent = (mini: boolean) => (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: mini ? "center" : "space-between",
          gap: 1,
          px: mini ? 1 : 2.5,
          py: 2.5,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}
        >
          <img src="/logo.png" width={44} />
          {!mini && (
            <Typography
              variant="h6"
              fontWeight={700}
              color="text.primary"
              noWrap
            >
              MyScholaria
            </Typography>
          )}
        </Box>
        {!mini && isDesktop && (
          <IconButton size="small" onClick={onToggleCollapsed}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        {navGroups.map((group) => (
          <List
            key={group.label}
            subheader={
              !mini ? (
                <ListSubheader
                  sx={{
                    bgcolor: "transparent",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    color: "text.secondary",
                    lineHeight: 3,
                  }}
                >
                  {group.label}
                </ListSubheader>
              ) : undefined
            }
            disablePadding
          >
            {group.items.map((item) => {
              const active = location.pathname === item.path;
              const button = (
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  selected={active}
                  sx={{
                    borderRadius: 1,
                    mb: 0.3,
                    justifyContent: mini ? "center" : "flex-start",
                    px: mini ? 1 : 2,
                    "&.Mui-selected": {
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      "&:hover": { bgcolor: "primary.dark" },
                      "& .MuiListItemIcon-root": {
                        color: "primary.contrastText",
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: mini ? 0 : 36,
                      justifyContent: "center",
                      color: active ? "inherit" : "text.secondary",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!mini && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                      }}
                    />
                  )}
                </ListItemButton>
              );
              return (
                <ListItem key={item.path} disablePadding sx={{ px: 1 }}>
                  {mini ? (
                    <Tooltip title={item.label} placement="right" arrow>
                      {button}
                    </Tooltip>
                  ) : (
                    button
                  )}
                </ListItem>
              );
            })}
          </List>
        ))}
      </Box>

      <Box sx={{ p: 1, mt: "auto", borderTop: 1, borderColor: "divider" }}>
        <ListItem disablePadding sx={{ px: 1 }}>
          <ListItemButton
            onClick={handleLogOut}
            sx={{
              borderRadius: 1,
              justifyContent: mini ? "center" : "flex-start",
              px: mini ? 1 : 2,
              color: "inherit",
              "&:hover": {
                bgcolor: "error.light",
                color: "error.contrastText",
                "& .MuiListItemIcon-root": { color: "error.contrastText" },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: mini ? 0 : 36,
                justifyContent: "center",
                color: "inherit",
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            {!mini && (
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              />
            )}
          </ListItemButton>
        </ListItem>

        {mini && isDesktop && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
            <Tooltip title="Expand menu" placement="right" arrow>
              <IconButton size="small" onClick={onToggleCollapsed}>
                <MenuIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      {!isDesktop && (
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{
            position: "fixed",
            top: 8,
            left: 8,
            zIndex: 1300,
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            boxShadow: 1,
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
          <IconButton onClick={() => setMobileOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        {renderContent(false)}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", lg: "block" },
          width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
            boxSizing: "border-box",
            overflowX: "hidden",
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
        open
      >
        {renderContent(collapsed)}
      </Drawer>
    </>
  );
};

export default AppSidebar;

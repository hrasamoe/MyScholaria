import { logout } from "@/services/auth.service";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AssessmentIcon from "@mui/icons-material/Assessment";
import BadgeIcon from "@mui/icons-material/Badge";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CampaignIcon from "@mui/icons-material/Campaign";
import ChatIcon from "@mui/icons-material/Chat";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CloseIcon from "@mui/icons-material/Close";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import EventIcon from "@mui/icons-material/Event";
import EventNoteIcon from "@mui/icons-material/EventNote";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import GradingIcon from "@mui/icons-material/Grading";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import LockIcon from "@mui/icons-material/Lock";
import LogoutIcon from "@mui/icons-material/Logout";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import MenuIcon from "@mui/icons-material/Menu";
import ClassIcon from "@mui/icons-material/MenuBook";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import PaymentIcon from "@mui/icons-material/Payment";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import QuizIcon from "@mui/icons-material/Quiz";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SavingsIcon from "@mui/icons-material/Savings";
import SchoolIcon from "@mui/icons-material/School";
import ScienceIcon from "@mui/icons-material/Science";
import SettingsIcon from "@mui/icons-material/Settings";
import ShieldIcon from "@mui/icons-material/Shield";
import VerifiedIcon from "@mui/icons-material/Verified";
import WorkIcon from "@mui/icons-material/Work";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import {
  Badge,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Popover,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/Authcontext";

export const DRAWER_WIDTH = 260;
export const COLLAPSED_WIDTH = 72;

interface Announcement {
  id: string;
  title: string;
  message: string;
  created_at: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const navGroups = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", path: "/", icon: <DashboardIcon /> }],
  },
  {
    label: "People",
    items: [
      { label: "Students", path: "/students", icon: <SchoolIcon /> },
      { label: "Parents", path: "/parents", icon: <FamilyRestroomIcon /> },
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
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const userID = user.id;
  const establishmentID = user.establishment_id;
  const location = useLocation();
  const theme = useTheme();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const { clearAuth } = useAuth();

  const fetchAlerts = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notification/alerts/${establishmentID}`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      const data = await response.json();
      if (response.ok) {
        setAnnouncements(data.announcements || []);
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notification/mark-read/${id}/${userID}`,
        {
          method: "PUT",
          credentials: "include",
        },
      );
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

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

  const unreadCount =
    notifications.filter((n) => !n.is_read).length + announcements.length;
  const hasAlerts = unreadCount > 0 || announcements.length > 0;

  const renderContent = (mini: boolean) => (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: mini ? "column" : "row",
          alignItems: "center",
          justifyContent: mini ? "center" : "space-between",
          gap: mini ? 1.5 : 1,
          px: mini ? 1 : 2.5,
          py: 2.5,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: mini ? "column" : "row",
            alignItems: "center",
            gap: 1,
            minWidth: 0,
            width: mini ? "100%" : "auto",
          }}
        >
          <Tooltip
            title={mini && isDesktop ? "Expand menu" : ""}
            placement="right"
            arrow
          >
            <Box
              component="img"
              src="/logo.png"
              width={44}
              onClick={mini && isDesktop ? onToggleCollapsed : undefined}
              sx={{ cursor: mini && isDesktop ? "pointer" : "default" }}
              alt="Logo"
            />
          </Tooltip>

          {!mini ? (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ minWidth: 0, flexGrow: 1, justifyContent: "space-between" }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                color="text.primary"
                noWrap
                sx={{ mr: 1 }}
              >
                MyScholaria
              </Typography>
              <Tooltip title="Notifications & Announcements">
                <IconButton
                  size="small"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                >
                  <Badge
                    badgeContent={unreadCount}
                    color="error"
                    variant={
                      unreadCount === 0 && announcements.length > 0
                        ? "dot"
                        : "standard"
                    }
                  >
                    {hasAlerts ? (
                      <NotificationsIcon fontSize="small" color="primary" />
                    ) : (
                      <NotificationsNoneIcon fontSize="small" />
                    )}
                  </Badge>
                </IconButton>
              </Tooltip>
            </Stack>
          ) : (
            <Tooltip
              title="Notifications & Announcements"
              placement="right"
              arrow
            >
              <IconButton
                size="small"
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  variant={
                    unreadCount === 0 && announcements.length > 0
                      ? "dot"
                      : "standard"
                  }
                >
                  {hasAlerts ? (
                    <NotificationsIcon fontSize="small" color="primary" />
                  ) : (
                    <NotificationsNoneIcon fontSize="small" />
                  )}
                </Badge>
              </IconButton>
            </Tooltip>
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
              const test =
                item.path === "/"
                  ? false
                  : location.pathname.startsWith(item.path);
              const button = (
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  selected={active || test}
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
      </Box>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              width: 340,
              maxHeight: 480,
              borderRadius: 2,
              ml: 1,
              display: "flex",
              flexDirection: "column",
              boxShadow: 4,
            },
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            School Bulletins & Alerts
          </Typography>
          {unreadCount > 0 && (
            <Typography variant="caption" color="error.main" fontWeight={600}>
              {unreadCount} unread
            </Typography>
          )}
        </Box>
        <Divider />

        <Box
          sx={{
            p: 1.5,
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {announcements.length > 0 && (
            <Box>
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                sx={{ mb: 1, color: "error.main" }}
              >
                <CampaignIcon sx={{ fontSize: "1.1rem" }} />
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{ letterSpacing: 0.5, textTransform: "uppercase" }}
                >
                  Announcements
                </Typography>
              </Stack>
              <Stack spacing={1}>
                {announcements.map((ann) => (
                  <Box
                    key={ann.id}
                    sx={{
                      p: 1.5,
                      bgcolor: "action.hover",
                      borderRadius: 1,
                      borderLeft: "3px solid",
                      borderColor: "error.main",
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="text.primary"
                      display="block"
                    >
                      {ann.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: "0.7rem", display: "block", mb: 0.5 }}
                    >
                      {new Date(ann.created_at).toLocaleDateString()}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ whiteSpace: "pre-wrap" }}
                    >
                      {ann.message}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          <Box>
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{ mb: 1, color: "primary.main" }}
            >
              <NotificationsIcon sx={{ fontSize: "1.1rem" }} />
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{ letterSpacing: 0.5, textTransform: "uppercase" }}
              >
                Notifications
              </Typography>
            </Stack>
            <List disablePadding>
              {notifications.length === 0 ? (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    textAlign: "center",
                    py: 2,
                    fontStyle: "italic",
                  }}
                >
                  No recent notifications
                </Typography>
              ) : (
                notifications.map((notif) => (
                  <ListItem
                    key={notif.id}
                    dense
                    sx={{
                      bgcolor: notif.is_read
                        ? "transparent"
                        : "action.selected",
                      borderRadius: 1,
                      mb: 0.5,
                      alignItems: "start",
                      p: 1,
                    }}
                    secondaryAction={
                      !notif.is_read && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                        >
                          <DoneAllIcon sx={{ fontSize: "0.9rem" }} />
                        </IconButton>
                      )
                    }
                  >
                    <ListItemText
                      sx={{ whiteSpace: "pre-wrap" }}
                      primary={notif.title}
                      secondary={notif.message}
                      primaryTypographyProps={{
                        variant: "caption",
                        fontWeight: notif.is_read ? 600 : 700,
                        color: "text.primary",
                      }}
                      secondaryTypographyProps={{
                        variant: "caption",
                        color: "text.secondary",
                        display: "block",
                        sx: { mt: 0.25, pr: 2 },
                      }}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Box>
        </Box>
      </Popover>
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

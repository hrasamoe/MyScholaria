import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { SnackbarProvider } from "notistack";
import { AppThemeProvider } from "./hooks/Themecontext";
import { AuthProvider } from "./hooks/Authcontext";
import { ProtectedRoute, RoleRoute } from "./hooks/ProtectRoute";
import AppLayout from "./components/AppLayout";

import VerifyEmailMember from "./pages/VerifyEmailMember";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Staff from "./pages/Staff";
import Classes from "./pages/Classes";
import Classrooms from "./pages/Classrooms";
import Attendance from "./pages/Attendance";
import Duty from "./pages/Duty";
import Payments from "./pages/Payments";
import Facturation from "./pages/Facturation";
import Timetable from "./pages/Timetable";
import Events from "./pages/Events";
import Notifications from "./pages/Notifications";
import Users from "./pages/Users";
import SchoolCalendar from "./pages/SchoolCalendar";
import Subjects from "./pages/Subjects";
import Coursebook from "./pages/Coursebook";
import Internships from "./pages/Internships";
import Library from "./pages/Library";
import Grades from "./pages/Grades";
import Exams from "./pages/Exams";
import Scholarships from "./pages/Scholarships";
import Budget from "./pages/Budget";
import ParentPortal from "./pages/ParentPortal";
import StudentPortal from "./pages/StudentPortal";
import Messages from "./pages/Messages";
import Announcements from "./pages/Announcements";
import Programs from "./pages/Programs";
import Theses from "./pages/Theses";
import Diplomas from "./pages/Diplomas";
import Reports from "./pages/Reports";
import Roles from "./pages/Roles";
import Settings from "./pages/Settings";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import VerifyEmail from "./pages/VerifyEmail";
import ChangePassword from "./pages/ChangePassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import CreateEstablishment from "./pages/CreateEstablishment";

const App = () => (
  <AppThemeProvider>
    <AuthProvider>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <BrowserRouter>
          <Routes>
            <Route
              path="/auth/verify-email-member"
              element={<VerifyEmailMember />}
            />

            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/policy" element={<Privacy />} />
            <Route path="/auth/verify-email" element={<VerifyEmail />} />

            <Route element={<ProtectedRoute></ProtectedRoute>}>
              <Route
                path="/auth/etablissement"
                element={<CreateEstablishment />}
              />
              <Route path="/auth/verify-email" element={<VerifyEmail />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route
                path="/auth/change-password"
                element={<ChangePassword />}
              />
              <Route
                path="/auth/verify-email-member"
                element={<VerifyEmailMember />}
              />
            </Route>

            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/calendar" element={<SchoolCalendar />} />
              <Route path="/timetable" element={<Timetable />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/events" element={<Events />} />
              <Route path="/settings" element={<Settings />} />

              <Route element={<RoleRoute roles={["admin", "staff"]} />}>
                <Route path="/users" element={<Users />} />
                <Route path="/roles" element={<Roles />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/facturation" element={<Facturation />} />
                <Route path="/scholarships" element={<Scholarships />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/classrooms" element={<Classrooms />} />
              </Route>

              <Route element={<RoleRoute roles={["admin", "teacher"]} />}>
                <Route path="/students" element={<Students />} />
                <Route path="/teachers" element={<Teachers />} />
                <Route path="/classes" element={<Classes />} />
                <Route path="/subjects" element={<Subjects />} />
                <Route path="/grades" element={<Grades />} />
                <Route path="/exams" element={<Exams />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/duty" element={<Duty />} />
                <Route path="/coursebook" element={<Coursebook />} />
                <Route path="/internships" element={<Internships />} />
                <Route path="/programs" element={<Programs />} />
                <Route path="/theses" element={<Theses />} />
                <Route path="/diplomas" element={<Diplomas />} />
              </Route>

              <Route path="/library" element={<Library />} />
              <Route
                path="/portal/student"
                element={
                  <RoleRoute roles={["student"]}>
                    <StudentPortal />
                  </RoleRoute>
                }
              />
              <Route
                path="/portal/parent"
                element={
                  <RoleRoute roles={["parent"]}>
                    <ParentPortal />
                  </RoleRoute>
                }
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SnackbarProvider>
    </AuthProvider>
  </AppThemeProvider>
);

export default App;

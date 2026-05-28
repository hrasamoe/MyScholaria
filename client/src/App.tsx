import { CssBaseline } from "@mui/material";
import { SnackbarProvider } from "notistack";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import { AuthProvider } from "./hooks/Authcontext";
import {
  GuestGuard,
  PendinRoute,
  ProtectedRoute,
  RoleRoute,
} from "./hooks/ProtectRoute";
import { AppThemeProvider } from "./hooks/Themecontext";

import Announcements from "./pages/Announcements";
import Attendance from "./pages/Attendance";
import Budget from "./pages/Budget";
import ChangePassword from "./pages/ChangePassword";
import Classes from "./pages/Classes";
import Classrooms from "./pages/Classrooms";
import Coursebook from "./pages/Coursebook";
import CreateEstablishment from "./pages/CreateEstablishment";
import CreateParent from "./pages/CreateParent";
import CreateStudent from "./pages/CreateStudent";
import Dashboard from "./pages/Dashboard";
import Diplomas from "./pages/Diplomas";
import Duty from "./pages/Duty";
import EditParent from "./pages/EditParent";
import Events from "./pages/Events";
import Exams from "./pages/Exams";
import Facturation from "./pages/Facturation";
import ForgotPassword from "./pages/ForgotPassword";
import Grades from "./pages/Grades";
import Internships from "./pages/Internships";
import Library from "./pages/Library";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";
import ParentPortal from "./pages/ParentPortal";
import ParentsList from "./pages/Parents";
import Payments from "./pages/Payments";
import PendingApproval from "./pages/PendingEvaluation";
import Privacy from "./pages/Privacy";
import Programs from "./pages/Programs";
import Reports from "./pages/Reports";
import ResetPassword from "./pages/ResetPassword";
import Roles from "./pages/Roles";
import Scholarships from "./pages/Scholarships";
import SchoolCalendar from "./pages/SchoolCalendar";
import Settings from "./pages/Settings";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Staff from "./pages/Staff";
import StudentPortal from "./pages/StudentPortal";
import Students from "./pages/Students";
import Subjects from "./pages/Subjects";
import Teachers from "./pages/Teachers";
import Terms from "./pages/Terms";
import Theses from "./pages/Theses";
import Timetable from "./pages/Timetable";
import Users from "./pages/Users";
import VerifyEmail from "./pages/VerifyEmail";
import VerifyEmailMember from "./pages/VerifyEmailMember";

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
              path="/auth/signin"
              element={
                <GuestGuard>
                  {" "}
                  <SignIn />
                </GuestGuard>
              }
            />
            <Route
              path="/auth/signup"
              element={
                <GuestGuard>
                  <SignUp />
                </GuestGuard>
              }
            />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/policy" element={<Privacy />} />
            <Route path="/auth/verify-email" element={<VerifyEmail />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/auth/change-password" element={<ChangePassword />} />
            <Route
              path="/auth/verify-email-member"
              element={<VerifyEmailMember />}
            />
            <Route element={<ProtectedRoute></ProtectedRoute>}>
              <Route
                path="/auth/etablissement"
                element={<CreateEstablishment />}
              />
              <Route path="/auth/verify-email" element={<VerifyEmail />} />
            </Route>
            <Route
              path="/pending-aproval"
              element={
                <ProtectedRoute>
                  <PendingApproval />
                </ProtectedRoute>
              }
            />
            <Route
              element={
                <PendinRoute>
                  <AppLayout />
                </PendinRoute>
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
                <Route path="/parents" element={<ParentsList />} />
                <Route path="/parents/create" element={<CreateParent />} />
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
                <Route path="/students/create" element={<CreateStudent />} />
                <Route path="/students" element={<Students />} />
                <Route path="/teachers" element={<Teachers />} />
                <Route path="/parents/edit/:id" element={<EditParent />} />
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
                  <RoleRoute roles={["student", "admin"]}>
                    <StudentPortal />
                  </RoleRoute>
                }
              />
              <Route
                path="/portal/parent"
                element={
                  <RoleRoute roles={["parent", "admin"]}>
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

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { SnackbarProvider } from "notistack";
import theme from "./theme";
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
import ChangePassword from "./pages/ChangePassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/classrooms" element={<Classrooms />} />
          <Route path="/calendar" element={<SchoolCalendar />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/coursebook" element={<Coursebook />} />
          <Route path="/internships" element={<Internships />} />
          <Route path="/library" element={<Library />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/duty" element={<Duty />} />
          <Route path="/grades" element={<Grades />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/facturation" element={<Facturation />} />
          <Route path="/scholarships" element={<Scholarships />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/portal/parent" element={<ParentPortal />} />
          <Route path="/portal/student" element={<StudentPortal />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/events" element={<Events />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/theses" element={<Theses />} />
          <Route path="/diplomas" element={<Diplomas />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/users" element={<Users />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/change-password" element={<ChangePassword />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </SnackbarProvider>
  </ThemeProvider>
);

export default App;

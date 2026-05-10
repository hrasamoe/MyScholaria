import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Box, Card, Typography, Chip, Stack } from "@mui/material";
import Grid from "@mui/material/Grid";
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import PaymentIcon from "@mui/icons-material/Payment";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const todaySchedule = [
  { time: "08:00", class: "Mathematics", teacher: "Mr. Dupont", room: "A101" },
  { time: "09:00", class: "Physics", teacher: "Mrs. Bernard", room: "B203" },
  { time: "10:30", class: "English", teacher: "Ms. Martin", room: "A105" },
  { time: "13:00", class: "History", teacher: "Mr. Leclerc", room: "C301" },
  { time: "14:30", class: "Biology", teacher: "Mrs. Moreau", room: "B102" },
];

const recentPayments = [
  { student: "Ahmed Ben Ali", amount: "1,500 DT", status: "Paid", date: "2026-03-15" },
  { student: "Sarah Bouazizi", amount: "1,500 DT", status: "Pending", date: "2026-03-14" },
  { student: "Youssef Trabelsi", amount: "750 DT", status: "Paid", date: "2026-03-13" },
  { student: "Fatma Chaari", amount: "1,500 DT", status: "Overdue", date: "2026-03-10" },
];

const statusColor = (s: string) =>
  s === "Paid" ? "success" : s === "Pending" ? "warning" : "error";

const Dashboard = () => (
  <>
    <PageHeader title="Dashboard" subtitle="Welcome back! Here's an overview of your school." />

    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
        <StatCard title="Total Students" value={1248} icon={<SchoolIcon />} trend="+12 this month" color="primary" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
        <StatCard title="Total Teachers" value={86} icon={<PeopleIcon />} color="success" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
        <StatCard title="Attendance Rate" value="94.2%" icon={<FactCheckIcon />} trend="+1.3% vs last week" color="primary" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
        <StatCard title="Revenue (March)" value="45,200 DT" icon={<PaymentIcon />} color="warning" />
      </Grid>
    </Grid>

    <Grid container spacing={3}>
      <Grid size={{ xs: 12, lg: 6 }}>
        <Card>
          <Box sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
            <AccessTimeIcon fontSize="small" color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>Today's Schedule</Typography>
          </Box>
          {todaySchedule.map((item, i) => (
            <Box key={i} sx={{ px: 2.5, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: i < todaySchedule.length - 1 ? 1 : 0, borderColor: "divider" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace", width: 48 }}>{item.time}</Typography>
                <Box>
                  <Typography variant="body2" fontWeight={500}>{item.class}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.teacher}</Typography>
                </Box>
              </Box>
              <Chip label={item.room} size="small" variant="outlined" />
            </Box>
          ))}
        </Card>
      </Grid>

      <Grid size={{ xs: 12, lg: 6 }}>
        <Card>
          <Box sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
            <PaymentIcon fontSize="small" color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>Recent Payments</Typography>
          </Box>
          {recentPayments.map((item, i) => (
            <Box key={i} sx={{ px: 2.5, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, borderBottom: i < recentPayments.length - 1 ? 1 : 0, borderColor: "divider" }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={500} noWrap>{item.student}</Typography>
                <Typography variant="caption" color="text.secondary">{item.date}</Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="body2" fontWeight={600}>{item.amount}</Typography>
                <Chip label={item.status} size="small" color={statusColor(item.status) as any} sx={{ mt: 0.5 }} />
              </Box>
            </Box>
          ))}
        </Card>
      </Grid>
    </Grid>
  </>
);

export default Dashboard;

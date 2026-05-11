import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import {
  Button, Card, Box, Typography, Checkbox, FormControlLabel,
  Select, MenuItem, FormControl, InputLabel, TextField, Chip, Stack,
} from "@mui/material";
import { useSnackbar } from "notistack";

const studentsInClass = [
  { id: 1, name: "Ahmed Ben Ali", present: true },
  { id: 2, name: "Sarah Bouazizi", present: true },
  { id: 3, name: "Youssef Trabelsi", present: false },
  { id: 4, name: "Fatma Chaari", present: true },
  { id: 5, name: "Khaled Mansouri", present: true },
  { id: 6, name: "Nour Ayari", present: false },
  { id: 7, name: "Amine Haddad", present: true },
  { id: 8, name: "Rania Khelifi", present: true },
];

const Attendance = () => {
  const [selectedClass, setSelectedClass] = useState("3A");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState(studentsInClass);
  const { enqueueSnackbar } = useSnackbar();

  const toggle = (id: number) => {
    setAttendance(attendance.map((s) => s.id === id ? { ...s, present: !s.present } : s));
  };

  const presentCount = attendance.filter((s) => s.present).length;
  const rate = Math.round((presentCount / attendance.length) * 100);

  return (
    <>
      <PageHeader title="Attendance" subtitle="Mark daily class attendance" />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Class</InputLabel>
          <Select value={selectedClass} label="Class" onChange={(e) => setSelectedClass(e.target.value)}>
            <MenuItem value="3A">Class 3A</MenuItem>
            <MenuItem value="4B">Class 4B</MenuItem>
            <MenuItem value="5C">Class 5C</MenuItem>
          </Select>
        </FormControl>
        <TextField size="small" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Stack>

      <Card>
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: 1, borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="body2" color="text.secondary">
            {presentCount}/{attendance.length} present
          </Typography>
          <Chip label={`${rate}%`} size="small" color={rate > 80 ? "success" : "warning"} />
        </Box>
        {attendance.map((student) => (
          <Box
            key={student.id}
            onClick={() => toggle(student.id)}
            sx={{ px: 2.5, py: 1, display: "flex", alignItems: "center", gap: 2, cursor: "pointer", borderBottom: 1, borderColor: "divider", "&:hover": { bgcolor: "action.hover" }, "&:last-child": { borderBottom: 0 } }}
          >
            <Checkbox checked={student.present} size="small" />
            <Typography
              variant="body2"
              fontWeight={500}
              sx={{ textDecoration: student.present ? "none" : "line-through", color: student.present ? "text.primary" : "text.secondary" }}
            >
              {student.name}
            </Typography>
          </Box>
        ))}
        <Box sx={{ px: 2.5, py: 2, borderTop: 1, borderColor: "divider" }}>
          <Button variant="contained" onClick={() => enqueueSnackbar("Attendance saved!", { variant: "success" })}>
            Save Attendance
          </Button>
        </Box>
      </Card>
    </>
  );
};

export default Attendance;

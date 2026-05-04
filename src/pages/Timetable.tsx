import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import {
  Box, Card, Typography, MenuItem, Select, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Stack,
} from "@mui/material";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const slots = ["08:00-09:00", "09:00-10:00", "10:15-11:15", "11:15-12:15", "13:30-14:30", "14:30-15:30"];

type Cell = { subject: string; teacher: string; room: string } | null;

const sample: Record<string, Cell[][]> = {
  "Class 6A": [
    [{ subject: "Math", teacher: "Mr. Dupont", room: "A101" }, { subject: "French", teacher: "Ms. Martin", room: "A102" }, { subject: "Physics", teacher: "Mrs. Bernard", room: "B203" }, null, { subject: "English", teacher: "Ms. Martin", room: "A105" }],
    [{ subject: "English", teacher: "Ms. Martin", room: "A105" }, { subject: "Math", teacher: "Mr. Dupont", room: "A101" }, { subject: "Biology", teacher: "Mrs. Moreau", room: "B102" }, { subject: "History", teacher: "Mr. Leclerc", room: "C301" }, { subject: "Sport", teacher: "Mr. Said", room: "Gym" }],
    [{ subject: "Physics", teacher: "Mrs. Bernard", room: "B203" }, { subject: "English", teacher: "Ms. Martin", room: "A105" }, { subject: "Math", teacher: "Mr. Dupont", room: "A101" }, { subject: "Art", teacher: "Mrs. Karim", room: "D101" }, null],
    [{ subject: "Biology", teacher: "Mrs. Moreau", room: "B102" }, { subject: "Math", teacher: "Mr. Dupont", room: "A101" }, { subject: "French", teacher: "Ms. Martin", room: "A102" }, { subject: "Physics", teacher: "Mrs. Bernard", room: "B203" }, { subject: "Music", teacher: "Mr. Ali", room: "D202" }],
    [{ subject: "History", teacher: "Mr. Leclerc", room: "C301" }, { subject: "Sport", teacher: "Mr. Said", room: "Gym" }, { subject: "English", teacher: "Ms. Martin", room: "A105" }, { subject: "Math", teacher: "Mr. Dupont", room: "A101" }, null],
    [null, { subject: "Art", teacher: "Mrs. Karim", room: "D101" }, null, { subject: "French", teacher: "Ms. Martin", room: "A102" }, { subject: "Biology", teacher: "Mrs. Moreau", room: "B102" }],
  ],
  "Class 7B": [
    [{ subject: "French", teacher: "Ms. Martin", room: "A102" }, { subject: "Math", teacher: "Mr. Dupont", room: "A101" }, null, { subject: "Physics", teacher: "Mrs. Bernard", room: "B203" }, { subject: "History", teacher: "Mr. Leclerc", room: "C301" }],
    [{ subject: "Math", teacher: "Mr. Dupont", room: "A101" }, { subject: "Biology", teacher: "Mrs. Moreau", room: "B102" }, { subject: "English", teacher: "Ms. Martin", room: "A105" }, null, { subject: "Sport", teacher: "Mr. Said", room: "Gym" }],
    [{ subject: "English", teacher: "Ms. Martin", room: "A105" }, { subject: "French", teacher: "Ms. Martin", room: "A102" }, { subject: "Physics", teacher: "Mrs. Bernard", room: "B203" }, { subject: "Math", teacher: "Mr. Dupont", room: "A101" }, { subject: "Art", teacher: "Mrs. Karim", room: "D101" }],
    [{ subject: "Sport", teacher: "Mr. Said", room: "Gym" }, { subject: "History", teacher: "Mr. Leclerc", room: "C301" }, { subject: "Math", teacher: "Mr. Dupont", room: "A101" }, { subject: "French", teacher: "Ms. Martin", room: "A102" }, null],
    [{ subject: "Biology", teacher: "Mrs. Moreau", room: "B102" }, { subject: "English", teacher: "Ms. Martin", room: "A105" }, { subject: "Music", teacher: "Mr. Ali", room: "D202" }, { subject: "Physics", teacher: "Mrs. Bernard", room: "B203" }, { subject: "Math", teacher: "Mr. Dupont", room: "A101" }],
    [null, null, { subject: "Sport", teacher: "Mr. Said", room: "Gym" }, { subject: "Art", teacher: "Mrs. Karim", room: "D101" }, { subject: "French", teacher: "Ms. Martin", room: "A102" }],
  ],
};

const subjectColor = (s: string) => {
  const map: Record<string, string> = {
    Math: "primary.main", French: "secondary.main", Physics: "info.main",
    English: "warning.main", Biology: "success.main", History: "error.main",
    Sport: "success.dark", Art: "secondary.dark", Music: "info.dark",
  };
  return map[s] || "grey.500";
};

const Timetable = () => {
  const [klass, setKlass] = useState("Class 6A");
  const grid = sample[klass];

  return (
    <AppLayout>
      <PageHeader title="Timetable" subtitle="Weekly schedule per class" />
      <Card sx={{ p: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Class</InputLabel>
          <Select value={klass} label="Class" onChange={(e) => setKlass(e.target.value)}>
            {Object.keys(sample).map((k) => <MenuItem key={k} value={k}>{k}</MenuItem>)}
          </Select>
        </FormControl>
      </Card>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small" sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "action.hover" }}>
              <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
              {days.map((d) => <TableCell key={d} sx={{ fontWeight: 700 }}>{d}</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {slots.map((slot, rowIdx) => (
              <TableRow key={slot}>
                <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem", color: "text.secondary", whiteSpace: "nowrap" }}>{slot}</TableCell>
                {days.map((_, colIdx) => {
                  const cell = grid[rowIdx]?.[colIdx];
                  if (!cell) return <TableCell key={colIdx} sx={{ color: "text.disabled", fontSize: "0.8rem" }}>—</TableCell>;
                  return (
                    <TableCell key={colIdx}>
                      <Stack spacing={0.3}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: subjectColor(cell.subject) }} />
                          <Typography variant="body2" fontWeight={600}>{cell.subject}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">{cell.teacher}</Typography>
                        <Chip label={cell.room} size="small" variant="outlined" sx={{ alignSelf: "flex-start", height: 18, fontSize: "0.65rem" }} />
                      </Stack>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </AppLayout>
  );
};

export default Timetable;

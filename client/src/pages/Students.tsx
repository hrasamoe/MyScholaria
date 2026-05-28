import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { Button, TextField, Box, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";

interface Student {
  id: number | string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  class: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  parentName: string;
  parentPhone: string;
}

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");

  const filtered = students.filter(
    (s) =>
      s.firstName.toLowerCase().includes(search.toLowerCase()) ||
      s.lastName.toLowerCase().includes(search.toLowerCase()) ||
      s.class.toLowerCase().includes(search.toLowerCase()),
  );

  const handleView = (student: Student) => {
    // Logique pour voir les détails de l'étudiant
  };

  const handleEdit = (student: Student) => {
    // Logique pour éditer l'étudiant
  };

  const columns = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "class", label: "Class" },
    { key: "gender", label: "Gender", hideOnMobile: true },
    { key: "phone", label: "Phone", hideOnMobile: true },
    { key: "email", label: "Email", hideOnMobile: true },
    {
      key: "actions",
      label: "Actions",
      render: (r: Student) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton size="small" onClick={() => handleView(r)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleEdit(r)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Students"
        subtitle={`${students.length} students enrolled`}
        action={
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            href="/students/create"
          >
            Add Student
          </Button>
        }
      />

      <TextField
        placeholder="Search students..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, maxWidth: 360, width: "100%" }}
      />

      <DataTable columns={columns} data={filtered} />
    </>
  );
};

export default Students;

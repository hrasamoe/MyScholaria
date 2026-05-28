import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import {
  Button,
  Box,
  TextField,
  IconButton,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DataTable from "@/components/DataTable";

interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
}

const ParentsList = () => {
  const navigate = useNavigate();
  const [parent, setParent] = useState<Parent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const handleView = (parent: Parent) => {};
  const handleEdit = (parent: Parent) => {};
  const filtered = parent.filter(
    (p) =>
      p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm),
  );
  const columns = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "address", label: "Address" },
    { key: "created_at", label: "Registered On" },
    {
      key: "actions",
      label: "Actions",
      render: (r: Parent) => (
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
  const [parents] = useState<Parent[]>([
    {
      id: "404dbc2c-865e-43c8-8796-8398a5942256",
      firstName: "Heritiana",
      lastName: "Hasina",
      email: "heritiana@example.com",
      phone: "0340000001",
      address: "Lot II M 45 Antananarivo",
      created_at: "2026-01-15",
    },
    {
      id: "a1e922e1-4202-4430-95a8-8cc6e902e566",
      firstName: "Naël",
      lastName: "Hasinirina",
      email: "nael@example.com",
      phone: "0340000002",
      address: "Analamahitsy Ville",
      created_at: "2026-02-20",
    },
  ]);

  const filteredParents = parents.filter(
    (p) =>
      p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm),
  );

  return (
    <Box sx={{ p: 2 }}>
      <PageHeader
        title="Parents & Guardians"
        subtitle="Manage information and contact links for student guardians"
        action={
          <Button
            variant="contained"
            onClick={() => {
              navigate("/parents/create");
            }}
            color="success"
            startIcon={<AddIcon />}
          >
            Add New Parent
          </Button>
        }
      />

      <Box sx={{ mt: 3, mb: 4, display: "flex", justifyContent: "flex-start" }}>
        <TextField
          size="small"
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: 300 }}
        />
      </Box>

      <DataTable columns={columns} data={filtered} />
    </Box>
  );
};

export default ParentsList;

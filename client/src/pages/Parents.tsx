import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import {
  Button,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";

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

  const [searchTerm, setSearchTerm] = useState("");
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
            color="primary"
            startIcon={<AddIcon />}
          >
            Add New Parent
          </Button>
        }
      />

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-start" }}>
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

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ mt: 3, borderRadius: 2 }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "action.hover" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Full Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email Address</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Phone Number</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Home Address</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Registration Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredParents.map((parent) => (
              <TableRow key={parent.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>
                  {parent.firstName} {parent.lastName}
                </TableCell>
                <TableCell>{parent.email || "—"}</TableCell>
                <TableCell>{parent.phone}</TableCell>
                <TableCell>{parent.address || "—"}</TableCell>
                <TableCell>{parent.created_at}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton color="error" size="small">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ParentsList;

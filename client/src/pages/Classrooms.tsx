import DataTable from "@/components/DataTable";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/hooks/Authcontext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import AddIcon from "@mui/icons-material/Add";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";

interface Classroom {
  id: string;
  name: string;
  building: string;
  capacity: number;
  type: string;
  equipment: string;
}

const CLASSROOM_TYPES = [
  "Lecture Hall",
  "Standard Classroom",
  "Computer Lab",
  "Science Lab",
  "Workshop",
  "Meeting Room",
  "Exam Hall",
];

const Classrooms = () => {
  const { user } = useAuth();
  const establishmentID = user?.establishment_id;
  const { enqueueSnackbar } = useSnackbar();
  const online = useOnlineStatus();
  const [rooms, setRooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Classroom | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const fetchClassrooms = async () => {
    if (!establishmentID) return;
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/utils/get-classrooms/${establishmentID}`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to fetch classrooms");
      setRooms(result);
    } catch (error: any) {
      enqueueSnackbar(error.message || "Error loading classrooms", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, [online, establishmentID]);

  const handleOpenCreate = () => {
    setSelectedRoom(null);
    setForm({});
    setOpenFormDialog(true);
  };

  const handleOpenEdit = (room: Classroom) => {
    setSelectedRoom(room);
    setForm({
      name: room.name,
      building: room.building,
      capacity: room.capacity.toString(),
      type: room.type,
      equipment: room.equipment,
    });
    setOpenFormDialog(true);
  };

  const handleOpenDelete = (room: Classroom) => {
    setSelectedRoom(room);
    setOpenDeleteDialog(true);
  };

  const handleSave = async () => {
    if (!form.name) {
      enqueueSnackbar("Please fill required fields", { variant: "error" });
      return;
    }

    const payload = {
      name: form.name,
      building: form.building || "",
      capacity: parseInt(form.capacity || "0"),
      type: form.type || "",
      equipment: form.equipment || "",
    };

    try {
      setActionLoading(true);
      const url = selectedRoom
        ? `${import.meta.env.VITE_API_URL}/api/utils/update-classroom/${selectedRoom.id}`
        : `${import.meta.env.VITE_API_URL}/api/utils/create-classroom/${establishmentID}`;

      const method = selectedRoom ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "An error occurred");

      enqueueSnackbar(
        selectedRoom
          ? "Classroom updated successfully"
          : "Classroom added successfully",
        { variant: "success" },
      );
      setOpenFormDialog(false);
      fetchClassrooms();
    } catch (error: any) {
      enqueueSnackbar(error.message || "Error saving classroom", {
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRoom) return;

    try {
      setActionLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/utils/delete-classroom/${selectedRoom.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to delete classroom");

      enqueueSnackbar("Classroom deleted successfully", { variant: "success" });
      setOpenDeleteDialog(false);
      fetchClassrooms();
    } catch (error: any) {
      enqueueSnackbar(error.message || "Error deleting classroom", {
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { key: "name", label: "Room" },
    { key: "building", label: "Building" },
    { key: "capacity", label: "Capacity" },
    { key: "type", label: "Type", hideOnMobile: true },
    { key: "equipment", label: "Equipment", hideOnMobile: true },
  ];

  const skeletonData = [1, 2, 3].map((id) => ({
    id: `skeleton-${id}`,
    name: <Skeleton variant="text" width="60%" />,
    building: <Skeleton variant="text" width="40%" />,
    capacity: <Skeleton variant="text" width="20%" />,
    type: <Skeleton variant="text" width="50%" />,
    equipment: <Skeleton variant="text" width="70%" />,
  })) as unknown as Classroom[];

  return (
    <>
      <PageHeader
        title="Classrooms"
        subtitle={`${rooms.length} classrooms`}
        action={
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            disabled={loading || actionLoading}
          >
            Add Classroom
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={loading ? skeletonData : rooms}
        onEdit={loading ? undefined : (room: Classroom) => handleOpenEdit(room)}
        onDelete={
          loading ? undefined : (room: Classroom) => handleOpenDelete(room)
        }
      />

      <Dialog
        open={openFormDialog}
        onClose={() => !actionLoading && setOpenFormDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedRoom ? "Edit Classroom" : "Add Classroom"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Room Name *"
                value={form.name || ""}
                disabled={actionLoading}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Building"
                value={form.building || ""}
                disabled={actionLoading}
                onChange={(e) => setForm({ ...form, building: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Capacity"
                type="number"
                slotProps={{
                  htmlInput: { min: 0, step: 1 },
                }}
                value={form.capacity || ""}
                disabled={actionLoading}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Type"
                value={form.type || ""}
                disabled={actionLoading}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {CLASSROOM_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                label="Equipment"
                value={form.equipment || ""}
                disabled={actionLoading}
                onChange={(e) =>
                  setForm({ ...form, equipment: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpenFormDialog(false)}
            color="inherit"
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            color="success"
            disabled={actionLoading}
          >
            {actionLoading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={() => !actionLoading && setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete classroom{" "}
            <strong>{selectedRoom?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            color="inherit"
            disabled={actionLoading}
          >
            No
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? "Deleting..." : "Yes, Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Classrooms;

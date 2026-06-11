import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/hooks/Authcontext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { apiRequest } from "@/services/api.service";
import AddIcon from "@mui/icons-material/Add";
import BusinessIcon from "@mui/icons-material/Business";
import CategoryIcon from "@mui/icons-material/Category";
import ConstructionIcon from "@mui/icons-material/Construction";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import PeopleIcon from "@mui/icons-material/People";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Skeleton,
  Stack,
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

interface ClassroomForm {
  name: string;
  building: string;
  capacity: string;
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
  const [expanded, setExpanded] = useState<string | false>(false);

  const [form, setForm] = useState<ClassroomForm>({
    name: "",
    building: "",
    capacity: "",
    type: "",
    equipment: "",
  });

  const fetchClassrooms = async () => {
    if (!establishmentID) return;
    try {
      setLoading(true);
      const response = await apiRequest(`/api/utils/get-classrooms/${establishmentID}`,
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

  const handleChangeAccordion =
    (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const handleOpenCreate = () => {
    setSelectedRoom(null);
    setForm({
      name: "",
      building: "",
      capacity: "",
      type: "",
      equipment: "",
    });
    setOpenFormDialog(true);
  };

  const handleOpenEdit = (room: Classroom, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRoom(room);
    setForm({
      name: room.name || "",
      building: room.building || "",
      capacity:
        room.capacity !== undefined && room.capacity !== null
          ? room.capacity.toString()
          : "",
      type: room.type || "",
      equipment: room.equipment || "",
    });
    setOpenFormDialog(true);
  };

  const handleOpenDelete = (room: Classroom, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRoom(room);
    setOpenDeleteDialog(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      enqueueSnackbar("Room name is required", { variant: "error" });
      return;
    }

    const parsedCapacity = parseInt(form.capacity || "0", 10);
    const payload = {
      name: form.name.trim(),
      building: form.building.trim(),
      capacity: parsedCapacity,
      type: form.type,
      equipment: form.equipment.trim(),
    };

    try {
      setActionLoading(true);
      const url = selectedRoom
        ? `/api/utils/update-classroom/${selectedRoom.id}`
        : `/api/utils/create-classroom/${establishmentID}`;

      const method = selectedRoom ? "PUT" : "POST";

      const response = await apiRequest(url, {
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
      const response = await apiRequest(
        `/api/utils/delete-classroom/${selectedRoom.id}`,
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

  const skeletonAccordions = [1, 2, 3, 4].map((id) => (
    <Box key={`skeleton-acc-${id}`} sx={{ mb: 1.5 }}>
      <Skeleton
        variant="rounded"
        width="100%"
        height={56}
        sx={{ borderRadius: 1.5 }}
      />
    </Box>
  ));

  return (
    <>
      <PageHeader
        title="Classrooms"
        subtitle={
          loading
            ? "Loading classrooms..."
            : `${rooms.length} classrooms registered`
        }
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

      <Box sx={{ mt: 3 }}>
        {loading
          ? skeletonAccordions
          : rooms.map((room) => (
              <Accordion
                key={room.id}
                expanded={expanded === room.id}
                onChange={handleChangeAccordion(room.id)}
                variant="outlined"
                sx={{
                  mb: 1.5,
                  borderRadius: "8px !important",
                  overflow: "hidden",
                  "&:before": { display: "none" },
                  boxShadow: expanded === room.id ? 1 : 0,
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ width: "100%", pr: 2 }}
                  >
                    <MeetingRoomIcon
                      color={expanded === room.id ? "primary" : "action"}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {room.name}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        color="text.secondary"
                      >
                        <BusinessIcon sx={{ fontSize: "0.9rem" }} />
                        <Typography variant="caption">
                          {room.building || "No building specified"}
                        </Typography>
                      </Stack>
                    </Box>
                    {room.type && (
                      <Chip
                        label={room.type}
                        size="small"
                    
                        color="primary"
                        sx={{
                          display: { xs: "none", sm: "inline-flex" },
                          height: 24,
                          fontSize: "0.75rem",
                        }}
                      />
                    )}
                  </Stack>
                </AccordionSummary>

                <AccordionDetails
                  sx={{ px: 3, pb: 3, pt: 1, bgcolor: "background.default" }}
                >
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <PeopleIcon color="action" fontSize="small" />
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={600}
                            display="block"
                          >
                            CAPACITY
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {room.capacity} seats
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <CategoryIcon color="action" fontSize="small" />
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={600}
                            display="block"
                          >
                            ROOM TYPE
                          </Typography>
                          <Typography variant="body2">
                            {room.type || "Standard"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Stack direction="row" spacing={1.5} alignItems="start">
                        <ConstructionIcon
                          color="action"
                          fontSize="small"
                          sx={{ mt: 0.25 }}
                        />
                        <Box sx={{ width: "100%" }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={600}
                            display="block"
                          >
                            EQUIPMENT & ASSETS
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace: "pre-wrap",
                              mt: 0.5,
                              fontStyle: room.equipment ? "normal" : "italic",
                              color: room.equipment
                                ? "text.primary"
                                : "text.secondary",
                            }}
                          >
                            {room.equipment ||
                              "No registered equipment or inventory for this classroom."}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 1.5,
                      mt: 3,
                    }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      startIcon={<EditIcon />}
                      onClick={(e) => handleOpenEdit(room, e)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={(e) => handleOpenDelete(room, e)}
                    >
                      Delete
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
      </Box>

      <Dialog
        open={openFormDialog}
        onClose={() => !actionLoading && setOpenFormDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedRoom ? "Edit Classroom" : "Add New Classroom"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Room Name *"
                value={form.name}
                disabled={actionLoading}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Building"
                value={form.building}
                disabled={actionLoading}
                onChange={(e) => setForm({ ...form, building: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Capacity"
                type="number"
                slotProps={{ htmlInput: { min: 0, step: 1 } }}
                value={form.capacity}
                disabled={actionLoading}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Type"
                value={form.type}
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
                rows={3}
                label="Equipment & Assets"
                value={form.equipment}
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
          Are you sure you want to completely remove classroom{" "}
          <strong>{selectedRoom?.name}</strong>?
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

import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { useAuth } from "@/hooks/Authcontext";
import { apiRequest } from "@/services/api.service";
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Autocomplete,
  Skeleton,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSnackbar } from "notistack";

interface ClassItem {
  id: string;
  name: string;
  room_name: string | null;
  teacher_full_name: string | null;
}

interface FinancialConfigItem {
  id: string;
  class_id: string;
  class_name: string;
  room_name: string | null;
  teacher_full_name: string | null;
  tuition_fee: number;
  registration_fee: number;
  academic_year: string;
}

const Payments = () => {
  const { user } = useAuth();
  const establishmentID = user?.establishment_id || "";
  const { enqueueSnackbar } = useSnackbar();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [configs, setConfigs] = useState<FinancialConfigItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedConfig, setSelectedConfig] =
    useState<FinancialConfigItem | null>(null);

  const [form, setForm] = useState({
    class_id: "",
    tuition_fee: "",
    registration_fee: "",
    academic_year: "",
  });

  const [classInputValue, setClassInputValue] = useState("");

  const fetchData = async () => {
    if (!establishmentID) return;
    try {
      setLoading(true);
      const [resClasses, resConfigs] = await Promise.all([
        apiRequest(`/api/establishment/classes-list`, {
          credentials: "include",
        }),
        apiRequest(`/api/finance/tuition-rules`, { credentials: "include" }),
      ]);

      if (resClasses.ok) setClasses(await resClasses.json());
      if (resConfigs.ok) setConfigs(await resConfigs.json());
    } catch (error) {
      enqueueSnackbar("Error loading data", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [establishmentID]);

  const handleOpenCreate = () => {
    setSelectedConfig(null);
    setForm({
      class_id: "",
      tuition_fee: "",
      registration_fee: "",
      academic_year: "",
    });
    setClassInputValue("");
    setOpenDialog(true);
  };

  const handleOpenEdit = (item: FinancialConfigItem) => {
    setSelectedConfig(item);
    setForm({
      class_id: item.class_id,
      tuition_fee: item.tuition_fee.toString(),
      registration_fee: item.registration_fee.toString(),
      academic_year: item.academic_year,
    });
    const currentClass = classes.find((c) => c.id === item.class_id);
    setClassInputValue(currentClass ? currentClass.name : "");
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (
      !form.class_id ||
      !form.tuition_fee ||
      !form.registration_fee ||
      !form.academic_year
    ) {
      enqueueSnackbar("Please fill all required fields", { variant: "error" });
      return;
    }

    const matchedClass = classes.find((c) => c.id === form.class_id);
    if (!matchedClass) {
      enqueueSnackbar(
        "The selected class is invalid or does not exist in the list",
        { variant: "error" },
      );
      return;
    }

    const payload = {
      classID: form.class_id,
      tuitionFee: parseFloat(form.tuition_fee),
      registrationFee: parseFloat(form.registration_fee),
      academicYear: form.academic_year,
      establishmentID,
    };

    try {
      setActionLoading(true);
      const url = selectedConfig
        ? `/api/finance/tuition-rules/${selectedConfig.id}`
        : `/api/finance/tuition-rules`;
      const method = selectedConfig ? "PUT" : "POST";

      const res = await apiRequest(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Error saving configuration");
      }

      const responseData = await res.json();
      const generatedID =
        responseData?.id || selectedConfig?.id || crypto.randomUUID();

      const updatedItem: FinancialConfigItem = {
        id: generatedID,
        class_id: form.class_id,
        class_name: matchedClass.name,
        room_name: matchedClass.room_name,
        teacher_full_name: matchedClass.teacher_full_name,
        tuition_fee: payload.tuitionFee,
        registration_fee: payload.registrationFee,
        academic_year: payload.academicYear,
      };

      if (selectedConfig) {
        setConfigs((prev) =>
          prev.map((c) => (c.id === selectedConfig.id ? updatedItem : c)),
        );
        enqueueSnackbar("Configuration updated", { variant: "success" });
      } else {
        setConfigs((prev) => [updatedItem, ...prev]);
        enqueueSnackbar("Configuration created", { variant: "success" });
      }

      setOpenDialog(false);
    } catch (err: any) {
      enqueueSnackbar(err.message || "Error saving configuration", {
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedConfig) return;
    try {
      setActionLoading(true);
      const res = await apiRequest(
        `/api/finance/tuition-rules/${selectedConfig.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Error deleting configuration");
      }

      setConfigs((prev) => prev.filter((c) => c.id !== selectedConfig.id));
      enqueueSnackbar("Configuration deleted successfully", {
        variant: "success",
      });
      setOpenDelete(false);
    } catch (err: any) {
      enqueueSnackbar(err.message || "Error deleting configuration", {
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredConfigs = (configs || []).filter((c) =>
    c.class_name?.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    { key: "class_name", label: "Class Name" },
    {
      key: "room_name",
      label: "Room",
      render: (row: FinancialConfigItem) => row.room_name || "N/A",
    },
    {
      key: "teacher_full_name",
      label: "Main Teacher",
      render: (row: FinancialConfigItem) => row.teacher_full_name || "None",
    },
    {
      key: "tuition_fee",
      label: "Tuition Fee (Écolage)",
      render: (row: FinancialConfigItem) => `${row.tuition_fee} AR`,
    },
    {
      key: "registration_fee",
      label: "Registration Fee",
      render: (row: FinancialConfigItem) => `${row.registration_fee} AR`,
    },
    { key: "academic_year", label: "Academic Year" },
    {
      key: "actions",
      label: "Actions",
      render: (row: FinancialConfigItem) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton size="small" onClick={() => handleOpenEdit(row)}>
            <EditIcon fontSize="small" color="primary" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setSelectedConfig(row);
              setOpenDelete(true);
            }}
          >
            <DeleteIcon fontSize="small" color="error" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="School Fees Configuration"
        subtitle="Manage tuition and registration fees per class"
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            Configure Fees
          </Button>
        }
      />

      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TextField
          placeholder="Filter by class..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ maxWidth: 360, width: "100%" }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Skeleton
            variant="rectangular"
            width="100%"
            height={50}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton
            variant="rectangular"
            width="100%"
            height={50}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton
            variant="rectangular"
            width="100%"
            height={50}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton
            variant="rectangular"
            width="100%"
            height={50}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton
            variant="rectangular"
            width="100%"
            height={50}
            sx={{ borderRadius: 1 }}
          />
        </Box>
      ) : (
        <DataTable columns={columns} data={filteredConfigs} />
      )}

      {/* DIALOG ADD / EDIT */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedConfig ? "Modify Fees Structure" : "New Fees Configuration"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                freeSolo
                disabled={!!selectedConfig}
                options={classes}
                getOptionLabel={(option) => {
                  if (typeof option === "string") return option;
                  return `${option.name} ${option.room_name ? `[Room: ${option.room_name}]` : ""} ${option.teacher_full_name ? `— Prof: ${option.teacher_full_name}` : ""}`;
                }}
                value={classes.find((c) => c.id === form.class_id) || null}
                onChange={(_, newValue) => {
                  if (typeof newValue === "string" || !newValue) {
                    setForm({ ...form, class_id: "" });
                  } else {
                    setForm({ ...form, class_id: newValue.id });
                  }
                }}
                inputValue={classInputValue}
                onInputChange={(_, newInputValue) => {
                  setClassInputValue(newInputValue);
                  const matched = classes.find(
                    (c) => c.name.toLowerCase() === newInputValue.toLowerCase(),
                  );
                  if (matched) {
                    setForm({ ...form, class_id: matched.id });
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Class *" required fullWidth />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Tuition Fee (AR) *"
                type="number"
                value={form.tuition_fee}
                onChange={(e) =>
                  setForm({ ...form, tuition_fee: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Registration Fee (AR) *"
                type="number"
                value={form.registration_fee}
                onChange={(e) =>
                  setForm({ ...form, registration_fee: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Academic Year *"
                placeholder="e.g., 2025-2026"
                value={form.academic_year}
                onChange={(e) =>
                  setForm({ ...form, academic_year: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={actionLoading}
          >
            Save Setup
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG DELETE */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Delete Fee Configuration</DialogTitle>
        <DialogContent>
          <Typography component="div">
            Are you sure you want to remove the financial configurations for{" "}
            <strong>{selectedConfig?.class_name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDelete(false)} color="inherit">
            No
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={actionLoading}
          >
            Yes, Remove
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Payments;

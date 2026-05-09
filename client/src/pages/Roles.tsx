import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, Checkbox, Box } from "@mui/material";

const roles = ["Admin", "Teacher", "Accountant", "Supervisor", "Parent", "Student"];
const perms = [
  { mod: "Students", view: [1, 1, 1, 1, 0, 0], edit: [1, 0, 0, 1, 0, 0] },
  { mod: "Grades", view: [1, 1, 0, 1, 1, 1], edit: [1, 1, 0, 0, 0, 0] },
  { mod: "Payments", view: [1, 0, 1, 0, 1, 0], edit: [1, 0, 1, 0, 0, 0] },
  { mod: "Library", view: [1, 1, 0, 1, 1, 1], edit: [1, 1, 0, 1, 0, 0] },
  { mod: "Users", view: [1, 0, 0, 0, 0, 0], edit: [1, 0, 0, 0, 0, 0] },
  { mod: "Reports", view: [1, 0, 1, 1, 0, 0], edit: [1, 0, 0, 0, 0, 0] },
];

const Roles = () => (
  <AppLayout>
    <PageHeader title="Roles & Permissions" subtitle="Module-level access control" />
    <Card>
      <CardContent sx={{ overflowX: "auto" }}>
        <Typography variant="caption" color="text.secondary">View / Edit per role</Typography>
        <Table size="small" sx={{ mt: 1, minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Module</TableCell>
              {roles.map(r => <TableCell key={r} align="center" sx={{ fontWeight: 600 }}>{r}</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {perms.map(p => (
              <TableRow key={p.mod} hover>
                <TableCell sx={{ fontWeight: 500 }}>{p.mod}</TableCell>
                {roles.map((_, i) => (
                  <TableCell key={i} align="center">
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <Checkbox size="small" defaultChecked={!!p.view[i]} />
                      <Checkbox size="small" defaultChecked={!!p.edit[i]} color="warning" />
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </AppLayout>
);

export default Roles;

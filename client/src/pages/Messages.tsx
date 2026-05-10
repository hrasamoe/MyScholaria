import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, Box, List, ListItemButton, ListItemAvatar, Avatar, ListItemText, Typography, Divider, TextField, Button, Stack, Chip } from "@mui/material";
import Grid from "@mui/material/Grid";
import SendIcon from "@mui/icons-material/Send";

interface Conv { id: number; name: string; role: string; last: string; time: string; unread: number; }
const convs: Conv[] = [
  { id: 1, name: "Mr. Dupont", role: "Teacher", last: "Thanks for the feedback!", time: "10:24", unread: 2 },
  { id: 2, name: "Mme. Karoui", role: "Admin", last: "Meeting on Monday at 3pm.", time: "Yesterday", unread: 0 },
  { id: 3, name: "Mrs. Bernard", role: "Teacher", last: "Please send the medical note.", time: "Mon", unread: 1 },
  { id: 4, name: "Mr. Frikha", role: "Accountant", last: "Receipt #INV-204 attached.", time: "Apr 28", unread: 0 },
];

const Messages = () => {
  const [active, setActive] = useState(1);
  const [text, setText] = useState("");
  const current = convs.find(c => c.id === active)!;

  return (
    <>
      <PageHeader title="Messages" subtitle="Internal messaging" />
      <Grid container spacing={2} sx={{ height: { md: "70vh" } }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <List sx={{ p: 0 }}>
              {convs.map((c, i) => (
                <Box key={c.id}>
                  <ListItemButton selected={c.id === active} onClick={() => setActive(c.id)}>
                    <ListItemAvatar><Avatar sx={{ bgcolor: "primary.main" }}>{c.name[0]}</Avatar></ListItemAvatar>
                    <ListItemText primary={<Stack direction="row" justifyContent="space-between"><span>{c.name}</span><Typography variant="caption" color="text.secondary">{c.time}</Typography></Stack>} secondary={<Stack direction="row" justifyContent="space-between" alignItems="center"><span>{c.last}</span>{c.unread > 0 && <Chip size="small" color="primary" label={c.unread} />}</Stack>} />
                  </ListItemButton>
                  {i < convs.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
              <Typography fontWeight={700}>{current.name}</Typography>
              <Typography variant="caption" color="text.secondary">{current.role}</Typography>
            </Box>
            <CardContent sx={{ flex: 1, overflowY: "auto" }}>
              <Stack spacing={1.5}>
                <Box sx={{ alignSelf: "flex-start", maxWidth: "70%", bgcolor: "action.hover", p: 1.2, borderRadius: 2 }}><Typography variant="body2">Hello, do you have a minute?</Typography></Box>
                <Box sx={{ alignSelf: "flex-end", maxWidth: "70%", bgcolor: "primary.main", color: "primary.contrastText", p: 1.2, borderRadius: 2 }}><Typography variant="body2">Yes, what's up?</Typography></Box>
                <Box sx={{ alignSelf: "flex-start", maxWidth: "70%", bgcolor: "action.hover", p: 1.2, borderRadius: 2 }}><Typography variant="body2">{current.last}</Typography></Box>
              </Stack>
            </CardContent>
            <Box sx={{ p: 2, borderTop: 1, borderColor: "divider", display: "flex", gap: 1 }}>
              <TextField fullWidth size="small" placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} />
              <Button variant="contained" endIcon={<SendIcon />} onClick={() => setText("")} disabled={!text}>Send</Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default Messages;

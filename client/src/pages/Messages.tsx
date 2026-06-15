import { useState, useEffect, useRef } from "react";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/hooks/Authcontext";
import { createClient } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  Box,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Divider,
  TextField,
  Button,
  Stack,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SendIcon from "@mui/icons-material/Send";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { apiRequest } from "@/services/api.service";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

interface Member {
  id: string;
  name: string;
  role: string;
}

// ✅ Fixed: matches your actual DB schema (send_at, not created_at)
interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  read_at: string;
  send_at: string;
}

const Messages = () => {
  const { user } = useAuth();
  const establishmentId = user?.establishment_id;
  const currentUserId = user?.id;

  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [displayedMembers, setDisplayedMembers] = useState<Member[]>([]);
  const [chatHistoryUserIds, setChatHistoryUserIds] = useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");

  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ─── 1. Init: fetch chat history + all members ───────────────────────────
  useEffect(() => {
    if (!establishmentId || !currentUserId) return;

    const initData = async () => {
      try {
        // Fetch all message pairs involving the current user
        const { data: userMessages, error } = await supabase
          .from("messages")
          .select("sender_id, recipient_id")
          .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`);

        const interactedUserIds = new Set<string>();
        if (!error && userMessages) {
          userMessages.forEach((msg) => {
            if (msg.sender_id !== currentUserId)
              interactedUserIds.add(msg.sender_id);
            if (msg.recipient_id !== currentUserId)
              interactedUserIds.add(msg.recipient_id);
          });
          setChatHistoryUserIds(interactedUserIds);
        }

        const response = await apiRequest(
          `/api/establishment/${establishmentId}/all-users`,
          { method: "GET", credentials: "include" },
        );

        if (response.ok) {
          const data = await response.json();
          const formatted: Member[] = data
            .map((m: any) => ({
              id: m.user_id,
              name: m.name,
              role: m.role,
            }))
            .filter((m: Member) => m.id !== currentUserId);

          setAllMembers(formatted);

          // Default list: only people we've already chatted with
          const defaultList = formatted.filter((m) =>
            interactedUserIds.has(m.id),
          );
          setDisplayedMembers(defaultList);
        }
      } catch (error) {
        console.error(error);
      }
    };

    initData();
  }, [establishmentId, currentUserId]);

  // ─── 2. Search filter ────────────────────────────────────────────────────
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      const defaultList = allMembers.filter((m) =>
        chatHistoryUserIds.has(m.id),
      );
      setDisplayedMembers(defaultList);
    } else {
      const filtered = allMembers.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.role.toLowerCase().includes(query),
      );
      setDisplayedMembers(filtered);
    }
  }, [searchQuery, allMembers, chatHistoryUserIds]);

  // ─── 3. Realtime subscription (inbound messages only) ───────────────────
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel(`messages-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          // ✅ Only receive messages sent TO the current user
          // (sent messages are handled optimistically in handleSendMessage)
          filter: `recipient_id=eq.${currentUserId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;

          // ✅ Use functional updater so we always read the latest activeMemberId
          setActiveMemberId((activeId) => {
            if (newMsg.sender_id === activeId) {
              // The message belongs to the currently open conversation
              setMessages((prev) => [...prev, newMsg]);
            }
            return activeId;
          });

          // Keep chat history sidebar up to date
          setChatHistoryUserIds((prev) => new Set([...prev, newMsg.sender_id]));
        },
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  // ─── 4. Load conversation when active member changes ────────────────────
  useEffect(() => {
    if (!currentUserId || !activeMemberId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentUserId},recipient_id.eq.${activeMemberId}),and(sender_id.eq.${activeMemberId},recipient_id.eq.${currentUserId})`,
        )
        // ✅ Fixed: order by send_at (matches your DB schema)
        .order("send_at", { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
    };

    fetchMessages();
  }, [activeMemberId, currentUserId]);

  // ─── 5. Auto-scroll to latest message ───────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── 6. Send message (with optimistic update + rollback on failure) ──────
  const handleSendMessage = async () => {
    if (!text.trim() || !currentUserId || !activeMemberId) return;

    const now = new Date().toISOString();

    // ✅ Optimistic message matches your DB schema
    const optimisticMsg: Message = {
      id: crypto.randomUUID(),
      sender_id: currentUserId,
      recipient_id: activeMemberId,
      body: text.trim(),
      read_at: now,
      send_at: now,
    };

    // Show immediately in the UI
    setMessages((prev) => [...prev, optimisticMsg]);
    setText("");

    try {
      const response = await apiRequest(`/api/messages/send/${currentUserId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          recipient_id: activeMemberId,
          content: optimisticMsg.body,
        }),
      });

      if (!response.ok) {
        // ✅ Roll back optimistic message if API fails
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
        setText(optimisticMsg.body);
      } else {
        setChatHistoryUserIds((prev) => new Set([...prev, activeMemberId]));
      }
    } catch (error) {
      console.error(error);
      // ✅ Roll back on network error too
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setText(optimisticMsg.body);
    }
  };

  const currentMember = allMembers.find((m) => m.id === activeMemberId);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      <PageHeader title="Messages" subtitle="Internal messaging" />
      <Grid container spacing={2} sx={{ height: "calc(110vh - 200px)" }}>
        {/* ── Left panel: member list ── */}
        <Grid
          size={{ xs: 12, md: 4 }}
          sx={{
            height: "100%",
            display: { xs: activeMemberId ? "none" : "flex", md: "flex" },
            flexDirection: "column",
          }}
        >
          <Box sx={{ mb: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Card sx={{ flex: 1, overflowY: "auto" }}>
            <List sx={{ p: 0 }}>
              {displayedMembers.map((m, i) => (
                <Box key={m.id}>
                  <ListItemButton
                    selected={m.id === activeMemberId}
                    onClick={() => setActiveMemberId(m.id)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        {m.name[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight={500}>
                          {m.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {m.role}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                  {i < displayedMembers.length - 1 && <Divider />}
                </Box>
              ))}
              {displayedMembers.length === 0 && (
                <Box sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    No users found
                  </Typography>
                </Box>
              )}
            </List>
          </Card>
        </Grid>

        {/* ── Right panel: chat window ── */}
        <Grid
          size={{ xs: 12, md: 8 }}
          sx={{
            height: "100%",
            display: { xs: activeMemberId ? "flex" : "none", md: "flex" },
            flexDirection: "column",
          }}
        >
          <Card
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            {currentMember ? (
              <>
                {/* Header */}
                <Box
                  sx={{
                    p: 2,
                    borderBottom: 1,
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <IconButton
                    onClick={() => setActiveMemberId(null)}
                    sx={{
                      display: { xs: "inline-flex", md: "none" },
                      p: 0,
                      mr: 1,
                    }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                  <Box>
                    <Typography fontWeight={700}>
                      {currentMember.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {currentMember.role}
                    </Typography>
                  </Box>
                </Box>

                {/* Messages */}
                <CardContent sx={{ flex: 1, overflowY: "auto", p: 2 }}>
                  <Stack spacing={1.5}>
                    {messages.map((msg) => {
                      const isMe = msg.sender_id === currentUserId;
                      return (
                        <Box
                          key={msg.id}
                          sx={{
                            alignSelf: isMe ? "flex-end" : "flex-start",
                            maxWidth: "75%",
                            bgcolor: isMe ? "primary.main" : "action.hover",
                            color: isMe
                              ? "primary.contrastText"
                              : "text.primary",
                            p: 1.2,
                            borderRadius: 2,
                          }}
                        >
                          {/* ✅ msg.body matches your DB schema */}
                          <Typography variant="body2">{msg.body}</Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              mt: 0.5,
                              opacity: 0.65,
                              fontSize: "0.65rem",
                            }}
                          >
                            {new Date(msg.send_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Typography>
                        </Box>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </Stack>
                </CardContent>

                {/* Input */}
                <Box
                  sx={{
                    p: 2,
                    borderTop: 1,
                    borderColor: "divider",
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={handleSendMessage}
                    disabled={!text.trim()}
                  >
                    Send
                  </Button>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography color="text.secondary">
                  Select a user to start messaging
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default Messages;

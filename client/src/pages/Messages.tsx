import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/hooks/Authcontext";
import { useNotification } from "@/hooks/NotificationContext";
import { apiRequest } from "@/services/api.service";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertSharpIcon from "@mui/icons-material/MoreVertSharp";
import ReplyIcon from "@mui/icons-material/Reply";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useSnackbar } from "notistack";
import { useEffect, useRef, useState } from "react";

interface Member {
  id: string;
  name: string;
  role: string;
}

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
  const { unreadCounts, clearUnread, onNewMessage, playSound } =
    useNotification();

  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [displayedMembers, setDisplayedMembers] = useState<Member[]>([]);
  const [chatHistory, setChatHistory] = useState<Map<string, string>>(
    new Map(),
  );
  const { enqueueSnackbar } = useSnackbar();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [isChannelsLoading, setIsChannelsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{
    element: HTMLElement;
    message: Message;
  } | null>(null);
  const isMy = menuAnchor?.message.sender_id === currentUserId;

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsubscribe = onNewMessage((newMsg) => {
      setChatHistory((prev) => {
        const next = new Map(prev);
        next.set(newMsg.sender_id, newMsg.send_at);
        return next;
      });

      setActiveMemberId((activeId) => {
        if (newMsg.sender_id === activeId) {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === newMsg.id);
            if (exists) return prev;
            return [...prev, newMsg];
          });
          clearUnread(newMsg.sender_id);
        }
        return activeId;
      });
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!establishmentId || !currentUserId) return;

    const initData = async () => {
      setIsChannelsLoading(true);
      try {
        const channelsResponse = await apiRequest(
          "/api/messages/history-channels",
          {
            method: "GET",
            credentials: "include",
          },
        );

        let historyMap = new Map<string, string>();
        if (channelsResponse.ok) {
          const channelsData: { member_id: string; last_message_at: string }[] =
            await channelsResponse.json();
          historyMap = new Map(
            channelsData.map(({ member_id, last_message_at }) => [
              member_id,
              last_message_at,
            ]),
          );
          setChatHistory(historyMap);
        }

        const response = await apiRequest(
          `/api/establishment/${establishmentId}/all-users`,
          { method: "GET", credentials: "include" },
        );

        if (response.ok) {
          const data = await response.json();
          const formatted: Member[] = data
            .map((m: any) => ({ id: m.user_id, name: m.name, role: m.role }))
            .filter((m: Member) => m.id !== currentUserId);

          setAllMembers(formatted);

          const defaultList = formatted
            .filter((m) => historyMap.has(m.id))
            .sort((a, b) => {
              const dateA = historyMap.get(a.id) ?? "0";
              const dateB = historyMap.get(b.id) ?? "0";
              return dateB.localeCompare(dateA);
            });

          setDisplayedMembers(defaultList);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsChannelsLoading(false);
      }
    };

    initData();
  }, [establishmentId, currentUserId]);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();

    let filtered: Member[];
    if (!query) {
      filtered = allMembers.filter((m) => chatHistory.has(m.id));
    } else {
      filtered = allMembers.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.role.toLowerCase().includes(query),
      );
    }

    filtered.sort((a, b) => {
      const dateA = chatHistory.get(a.id) ?? "0";
      const dateB = chatHistory.get(b.id) ?? "0";
      return dateB.localeCompare(dateA);
    });

    setDisplayedMembers(filtered);
  }, [searchQuery, allMembers, chatHistory]);

  useEffect(() => {
    if (!currentUserId || !activeMemberId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setIsMessagesLoading(true);
      try {
        const response = await apiRequest(
          `/api/messages/history/${activeMemberId}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsMessagesLoading(false);
      }
    };

    fetchMessages();
  }, [activeMemberId, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectMember = (id: string) => {
    setActiveMemberId(id);
    clearUnread(id);
  };

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    msg: Message,
  ) => {
    setMenuAnchor({ element: event.currentTarget, message: msg });
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleAction = (action: string) => {
    handleCloseMenu();
    if (action === "delete" && menuAnchor) {
      setMessageToDelete(menuAnchor.message);
      setIsConfirmOpen(true);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmOpen(false);
    setMessageToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;
    try {
    } catch (error) {
      console.log(error);
    } finally {
      setIsConfirmOpen(false);
      setMessageToDelete(null);
    }
  };

  const handleContextMenu = (
    event: React.MouseEvent<HTMLDivElement>,
    msg: Message,
  ) => {
    event.preventDefault();
    setMenuAnchor({ element: event.currentTarget, message: msg });
  };

  const copyMessage = (text: string) => {
    if (text.trim()) {
      navigator.clipboard.writeText(text);
    }
    handleCloseMenu();
  };

  const deleteMessageForMe = async (messageID: string) => {
    try {
      const response = await apiRequest(
        `/api/messages/remove-for-me/${messageID}`,
        {
          method: "PUT",
          credentials: "include",
        },
      );
      if (response.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== messageID));
        enqueueSnackbar("The messsage have been deleted for you", {
          variant: "success",
          autoHideDuration: 3000,
          preventDuplicate: true,
        });
      } else {
        const error = await response.json();
        console.log(error);
        enqueueSnackbar(error.message, {
          variant: "error",
          autoHideDuration: 3000,
          preventDuplicate: true,
        });
      }
    } catch (error: any) {
      console.log(error.message);
      enqueueSnackbar(error.message, {
        variant: "warning",
        autoHideDuration: 3000,
        preventDuplicate: true,
      });
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const deleteMessageForEveryone = async (messageID: string) => {
    try {
      const response = await apiRequest(
        `/api/messages/remove-for-everyone/${messageID}`,
        {
          method: "PUT",
          credentials: "include",
        },
      );
      if (!response.ok) {
        const error = await response.json();
        console.log(error);
        enqueueSnackbar(error.message, {
          variant: "error",
          autoHideDuration: 3000,
          preventDuplicate: true,
        });
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== messageID));
        enqueueSnackbar("The messsage have been deleted for everyone", {
          variant: "success",
          autoHideDuration: 3000,
          preventDuplicate: true,
        });
      }
    } catch (error: any) {
      console.log(error.message);
      enqueueSnackbar(error.message, {
        variant: "warning",
        autoHideDuration: 3000,
        preventDuplicate: true,
      });
    } finally {
      setIsConfirmOpen(false);
    }
  };
  const handleSendMessage = async () => {
    const cleanedText = text.trim();
    if (!cleanedText || !currentUserId || !activeMemberId) return;

    const now = new Date().toISOString();
    const optimisticMsg: Message = {
      id: crypto.randomUUID(),
      sender_id: currentUserId,
      recipient_id: activeMemberId,
      body: cleanedText,
      read_at: now,
      send_at: now,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setText("");
    playSound("send_message");

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
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
        setText(optimisticMsg.body);
        playSound("message_error");
      } else {
        const { message: realMsg } = await response.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? realMsg : m)),
        );
        setChatHistory((prev) => {
          const next = new Map(prev);
          next.set(activeMemberId, realMsg.send_at);
          return next;
        });
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setText(optimisticMsg.body);
      playSound("message_error");
    }
  };

  const currentMember = allMembers.find((m) => m.id === activeMemberId);

  return (
    <>
      <PageHeader title="Messages" subtitle="Internal messaging" />

      <Grid container spacing={2} sx={{ height: "calc(107vh - 200px)" }}>
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
              {isChannelsLoading ? (
                Array.from(new Array(4)).map((_, index) => (
                  <Box key={index}>
                    <ListItemButton disabled>
                      <ListItemAvatar>
                        <Skeleton variant="circular" width={40} height={40} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Skeleton variant="text" width="60%" height={20} />
                        }
                        secondary={
                          <Skeleton variant="text" width="40%" height={15} />
                        }
                      />
                    </ListItemButton>
                    {index < 3 && <Divider />}
                  </Box>
                ))
              ) : (
                <>
                  {displayedMembers.map((m, i) => (
                    <Box key={m.id}>
                      <ListItemButton
                        selected={m.id === activeMemberId}
                        onClick={() => handleSelectMember(m.id)}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: "primary.main" }}>
                            {m.name[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <Typography
                                variant="body1"
                                fontWeight={unreadCounts.has(m.id) ? 900 : 500}
                              >
                                {m.name}
                              </Typography>
                              {unreadCounts.has(m.id) && (
                                <Box
                                  sx={{
                                    minWidth: 20,
                                    height: 20,
                                    borderRadius: "50%",
                                    bgcolor: "primary.main",
                                    color: "primary.contrastText",
                                    fontSize: "0.7rem",
                                    fontWeight: 700,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    px: 0.5,
                                  }}
                                >
                                  {unreadCounts.get(m.id)}
                                </Box>
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {m.role.charAt(0).toUpperCase() +
                                m.role.slice(1).toLowerCase()}
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
                </>
              )}
            </List>
          </Card>
        </Grid>

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
                  </Box>
                </Box>

                <CardContent sx={{ flex: 1, overflowY: "auto", p: 2 }}>
                  <Stack spacing={1.5}>
                    {isMessagesLoading ? (
                      Array.from(new Array(3)).map((_, index) => {
                        const isEven = index % 2 === 0;
                        return (
                          <Box
                            key={index}
                            sx={{
                              alignSelf: isEven ? "flex-end" : "flex-start",
                              width: "50%",
                            }}
                          >
                            <Skeleton
                              variant="rounded"
                              height={45}
                              sx={{ borderRadius: 2 }}
                            />
                          </Box>
                        );
                      })
                    ) : (
                      <>
                        {messages.map((msg) => {
                          const isMe = msg.sender_id === currentUserId;
                          return (
                            <Box
                              key={msg.id}
                              onContextMenu={(e) => handleContextMenu(e, msg)}
                              sx={{
                                display: "flex",
                                alignSelf: isMe ? "flex-end" : "flex-start",
                                maxWidth: "75%",
                                alignItems: "center",
                                justifyContent: "center",
                                "&:hover .menu-trigger": {
                                  opacity: 1,
                                },
                              }}
                            >
                              {isMe && (
                                <>
                                  <IconButton
                                    className="menu-trigger"
                                    size="small"
                                    onClick={(e) => handleOpenMenu(e, msg)}
                                    sx={{
                                      borderRadius: "50%",
                                      height: 24,
                                      width: 24,
                                      p: 0,
                                      mr: 0.5,
                                      mt: 0.5,
                                      opacity: 0,
                                      color: "text.secondary",
                                      transition: "opacity 0.2s",
                                    }}
                                  >
                                    <MoreVertSharpIcon />
                                  </IconButton>
                                  <IconButton
                                    className="menu-trigger"
                                    size="small"
                                    sx={{
                                      borderRadius: "50%",
                                      height: 24,
                                      width: 24,
                                      p: 0,
                                      mr: 0.5,
                                      mt: 0.5,
                                      opacity: 0,
                                      color: "text.secondary",
                                      transition: "opacity 0.2s",
                                    }}
                                  >
                                    <ReplyIcon />
                                  </IconButton>
                                </>
                              )}
                              <Box
                                sx={{
                                  maxWidth: "100%",
                                  bgcolor: isMe
                                    ? "primary.main"
                                    : "action.hover",
                                  color: isMe
                                    ? "primary.contrastText"
                                    : "text.primary",
                                  p: 1.2,
                                  borderRadius: 2,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ whiteSpace: "pre-wrap" }}
                                >
                                  {msg.body}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    alignSelf: isMe ? "flex-end" : "flex-start",
                                    display: "flex",
                                    mt: 0.5,
                                    opacity: 0.65,
                                    fontSize: "0.65rem",
                                  }}
                                >
                                  {new Date(msg.send_at).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </Typography>
                              </Box>
                              {!isMe && (
                                <>
                                  <IconButton
                                    className="menu-trigger"
                                    size="small"
                                    onClick={(e) => handleOpenMenu(e, msg)}
                                    sx={{
                                      borderRadius: "50%",
                                      height: 24,
                                      width: 24,
                                      p: 0,
                                      ml: 0.5,
                                      mt: 0.5,
                                      opacity: 0,
                                      color: "text.secondary",
                                      transition: "opacity 0.2s",
                                    }}
                                  >
                                    <MoreVertSharpIcon />
                                  </IconButton>
                                  <IconButton
                                    className="menu-trigger"
                                    size="small"
                                    sx={{
                                      borderRadius: "50%",
                                      height: 24,
                                      width: 24,
                                      p: 0,
                                      ml: 0.5,
                                      mt: 0.5,
                                      opacity: 0,
                                      color: "text.secondary",
                                      transition: "opacity 0.2s",
                                    }}
                                  >
                                    <ReplyIcon />
                                  </IconButton>
                                </>
                              )}
                            </Box>
                          );
                        })}
                      </>
                    )}
                    <div ref={messagesEndRef} />
                  </Stack>
                </CardContent>

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
                    multiline
                    size="small"
                    maxRows={3}
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={handleSendMessage}
                    disabled={!text.trim() || isMessagesLoading}
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

      <Menu
        anchorEl={menuAnchor?.element}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        sx={{
          borderRadius: 4,
        }}
        MenuListProps={{
          sx: {
            display: "flex",
            flexDirection: "row",
            p: 0.5,
            borderRadius: 2,
          },
        }}
      >
        <MenuItem
          onClick={() => copyMessage(menuAnchor.message.body)}
          sx={{ borderRadius: 4 }}
        >
          Copy
        </MenuItem>
        {isMy && (
          <MenuItem
            onClick={() => handleAction("editer")}
            sx={{ borderRadius: 4 }}
          >
            Edit
          </MenuItem>
        )}
        <MenuItem
          onClick={() => handleAction("delete")}
          sx={{
            color: "error.main",
            borderRadius: 4,
            "&:hover": {
              bgcolor: "error.main",
              color: "white",
            },
          }}
        >
          Delete
        </MenuItem>
      </Menu>


      <Dialog open={isConfirmOpen} onClose={handleCancelDelete}>
        <DialogTitle>Delete the message?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you really want to delete this message? This action is
            irreversible.
          </DialogContentText>
          <DialogActions>
            <Button
              color="error"
              autoFocus
              variant="contained"
              onClick={() => {
                if (messageToDelete) {
                  deleteMessageForMe(messageToDelete.id);
                }
              }}
            >
              Delete for me
            </Button>
            {messageToDelete?.sender_id === currentUserId && (
              <Button
                color="error"
                variant="contained"
                onClick={() => {
                  if (messageToDelete) {
                    deleteMessageForEveryone(messageToDelete.id);
                  }
                }}
              >
                Delete for everyone
              </Button>
            )}

            <Button onClick={handleCancelDelete}>Cancel</Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Messages;

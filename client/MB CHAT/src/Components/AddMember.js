import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { useSelector } from "react-redux";
import { bufferToImage } from "./Utils";
import { useNavigate } from "react-router-dom";

export default function AddMember({
  open,
  onClose,
  groupId,
  existingMembers, // Array of user IDs already in the group
  onMembersAdded,  // Callback to update group info in parent
}) {
  const URL = process.env.REACT_APP_API_KEY;
  const token = localStorage.getItem("token");
  const lightTheme = useSelector((state) => state.themeKey);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [fetchedUsers, setFetchedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  // Fetch users based on the search term (with a 500ms debounce)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFetchedUsers([]);
      return;
    }
    setLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(
          `${URL}/user/fetchUsers?search=${encodeURIComponent(searchTerm)}`,
          config
        );
        setFetchedUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, token, URL]);

  // Filter out users already in the group
  const availableUsers = fetchedUsers.filter(
    (user) => !existingMembers.includes(user._id)
  );

  // Immediately add a user when selected
  const handleAddUser = async (user) => {
    setAdding(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = { groupId, usersToAdd: [user._id] };
      const { data } = await axios.put(`${URL}/chat/addMember`, payload, config);
      if (onMembersAdded) onMembersAdded(data);
      // Real-time notification is assumed to be handled on the backend.
      // If the added user is the current user, redirect to the group chat.
      if (user._id === localStorage.getItem("userId")) {
        navigate(`/chat/${groupId}`); // Adjust this route as needed.
      }
    } catch (error) {
      console.error("Error adding user:", error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Members to Group</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Search users"
          variant="outlined"
          margin="normal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {loading ? (
          <CircularProgress />
        ) : (
          <List>
            {availableUsers.map((user) => (
              <ListItem
                key={user._id}
                button
                onClick={() => handleAddUser(user)}
              >
                <ListItemAvatar>
                  {user.image ? (
                    <Avatar src={bufferToImage(user.image)} />
                  ) : (
                    <Avatar>
                      {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                    </Avatar>
                  )}
                </ListItemAvatar>
                <ListItemText primary={user.name || "Unknown"} secondary={user.email || ""} />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleAddUser(user)}
                    disabled={adding}
                  >
                    <AddIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {availableUsers.length === 0 && !loading && (
              <ListItem>
                <ListItemText primary="No users found" />
              </ListItem>
            )}
          </List>
        )}
      </DialogContent>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "1rem",
        }}
      >
        <Button onClick={onClose} disabled={adding}>
          Cancel
        </Button>
      </div>
    </Dialog>
  );
}

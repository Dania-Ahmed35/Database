import * as React from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import InventoryIcon from "@mui/icons-material/Inventory";

const drawerWidth = 240;
const navbarHeight = 64;

export default function SideBar({ isAdmin }) {
  const drawer = (
    <div>
      {/* USER SECTION */}
      <List>
        {["Inbox", "Starred", "Send email", "Drafts"].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      <List>
        {["All mail", "Trash", "Spam"].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* 🔒 ADMIN SECTION */}
      {isAdmin && (
        <>
          <Divider sx={{ my: 2 }} />

          <List>
            <ListItem>
              <ListItemText
                primary="Admin"
                primaryTypographyProps={{ fontWeight: 700 }}
              />
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary="Add New Book" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <EditIcon />
                </ListItemIcon>
                <ListItemText primary="History" />
              </ListItemButton>
            </ListItem>
              <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <EditIcon />
                </ListItemIcon>
                <ListItemText primary="Top 5 customers" />
              </ListItemButton>
            </ListItem>

                <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <EditIcon />
                </ListItemIcon>
                <ListItemText primary="History" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <InventoryIcon />
                </ListItemIcon>
                <ListItemText primary="Confirm Orders" />
              </ListItemButton>
            </ListItem>
          </List>
        </>
      )}
    </div>
  );

  return (
    <Box sx={{ width: drawerWidth, flexShrink: 0 }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        sx={{
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            top: `${navbarHeight}px`,
            height: `calc(100% - ${navbarHeight}px)`,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}

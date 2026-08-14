import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  drawer: {
    width: 240,
    flexShrink: 0,
  },
  drawerPaper: {
    width: 240,
  },
  drawerContainer: {
    overflow: 'auto',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  logo: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
  },
  logoText: {
    marginLeft: theme.spacing(2),
    fontWeight: 'bold',
  },
  sidebarItem: {
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  sidebarIcon: {
    minWidth: 0,
  },
  footer: {
    backgroundColor: theme.palette.primary.dark,
    padding: theme.spacing(2),
  },
  footerText: {
    color: theme.palette.text.secondary,
  },
}));

const DashboardLayout = () => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleListItemClick = (path) => {
    // Handle navigation to the selected page
    console.log(`Navigating to ${path}`);
  };

  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          <div className={classes.logo}>
            <Typography variant="h6" className={classes.logoText}>
              JobBuddy AI
            </Typography>
          </div>
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="temporary"
        anchor="left"
        open={open}
        onClose={handleDrawerToggle}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerContainer}>
          <List>
            <ListItem button onClick={() => handleListItemClick('jobs')}>
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary="Jobs" />
            </ListItem>
            <ListItem button onClick={() => handleListItemClick('resume')}>
              <ListItemIcon>
                <MailIcon />
              </ListItemIcon>
              <ListItemText primary="Resume" />
            </ListItem>
            <ListItem button onClick={() => handleListItemClick('profile')}>
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem
              button
              onClick={() => handleListItemClick('applicationStatus')}
              className={classes.sidebarItem}
            >
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary="Application Status" />
            </ListItem>
          </List>
          <div
            className={classes.footer}
          >
            <Typography
              variant="body2"
              className={classes.footerText}
            >
              <span>Billing / Credits</span>
              <span>Credits: 100</span>
              <span>Profile Settings</span>
            </Typography>
          </div>
        </div>
      </Drawer>
      <main
        className={classes.content}
      >
        {/* Page content goes here */}
      </main>
    </div>
  );
};

export default DashboardLayout;
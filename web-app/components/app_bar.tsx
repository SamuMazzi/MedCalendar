import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { useAppDispatch, useAppSelector }  from '../logic/redux/store'
import { setAdmin, setUser } from '../logic/redux/auth_slice'
import { logoutFirebase } from '../logic/server/auth';

export function MenuAppBar() {
  const [ anchorEl, setAnchorEl ] = useState<null | HTMLElement>(null);
  const authState = useAppSelector(state => state.auth)
  const dispatch = useAppDispatch()

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const logout = async () => {
    if(authState.admin) {
        await logoutFirebase()
    }
    dispatch(setAdmin(false))
    dispatch(setUser({
        id: "",
        data: {
            nome: "",
            ruolo: "",
            distretti: []
        }
    }))
    handleClose()
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Programmazione turni
          </Typography>
          {authState.id !== "" && (
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>{authState.id}</MenuItem>
                <MenuItem onClick={logout}>Logout</MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}

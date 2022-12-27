import MenuItem from '@mui/material/MenuItem'
import Menu from '@mui/material/Menu'
import IconButton from '@mui/material/IconButton'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Person from '@mui/icons-material/Person'
import Image from 'next/image';
import { useState } from 'react';
import { useAppDispatch, useAppSelector }  from '../logic/redux/store'
import { setAdmin, setUser } from '../logic/redux/auth_slice'
import { logoutFirebase } from '../logic/server/auth';
import Link from 'next/link'

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
    <Grid container
      direction="row"
      justifyContent="space-around"
      alignItems="center"
      sx={{pb: 3, pt: 2}}
    >
      <Grid item>
        <Link href="/">
          <Image priority alt="logo" src="/logo.png" width="130" height="80"/>
        </Link>
      </Grid>
      <Grid item>
          {authState.id !== "" && (
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Person fontSize="large" style={{ color: '#1976D2' }} />
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
                style={{
                  color: '#D8ECFD',
                  borderRadius: 30,
                  boxShadow: 'none'
                }}
                sx={{
                  mb: 1,
                  
                  borderRadius: '20px',
                  boxShadow: 'none',

                  '.MuiMenu-paper': {
                    backgroundColor: '#D8ECFD',
                    borderRadius: '20px',
                    boxShadow: 'none',
                  },
                }}
              >
              <Typography style={{ fontWeight: "bold", display: 'inline-block', whiteSpace: 'pre-line', fontSize: 20 }} sx={{px: 2, pt: 1}}>
                  {"Benvenuto\n" + authState.id
                    //* Valutare di creare una box unica con dentro testo e button e non dei menuItem 
                  }
                </Typography>
                <MenuItem onClick={logout}>
                  <Typography style={{textDecoration: 'underline', color: 'black'}}>
                    Logout
                  </Typography>
                </MenuItem>
              </Menu>
            </div>
          )}
      </Grid>
    </Grid>
  );
}

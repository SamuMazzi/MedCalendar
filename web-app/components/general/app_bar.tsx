import MenuItem from '@mui/material/MenuItem'
import Menu from '@mui/material/Menu'
import IconButton from '@mui/material/IconButton'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Person from '@mui/icons-material/Person'
import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link'
import PlaceIcon from '@mui/icons-material/Place';
import useUser from '../../logic/hooks/use_user'

export function MedAppBar() {
  const [ anchorEl, setAnchorEl ] = useState<null | HTMLElement>(null);
  const [user, distretto, logout, fbUser] = useUser()

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLogout = async () => {
    await logout()
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
          <Image priority alt="logo" src="/logo@2x.png" width="130" height="72" data-cy="logo_image_appbar"/>
        </Link>
      </Grid>
      <Grid item display="flex" alignItems="center">
          {
            distretto !== undefined && user.districts.concat(user.ownedDistricts).includes(distretto) && <>
              <PlaceIcon />
              <Typography sx={{pr: 3, pl: 1}}>
                {distretto}
              </Typography>
            </>
          }
          {user.uid !== "" && (
            <>
              <IconButton
                data-cy="profile_button"
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
                  {user.name}
                </Typography>
                {
                  fbUser != null && <MenuItem sx={{textAlign:'left'}}>
                    <Typography textAlign='left' style={{ fontSize: 14, fontWeight: 400 }} sx={{px: 2, pt: 1}}>
                      {"Email: " + fbUser.email}
                    </Typography>
                  </MenuItem>
                }
                <MenuItem onClick={handleLogout}>
                  <Typography style={{textDecoration: 'underline', color: 'black'}}>
                    Logout
                  </Typography>
                </MenuItem>
              </Menu>
            </>
          )}
      </Grid>
    </Grid>
  );
}

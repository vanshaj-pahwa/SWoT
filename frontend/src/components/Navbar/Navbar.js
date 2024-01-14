import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

const Navbar = () => {
  return (
    <AppBar position="static" style={{backgroundColor: '#7077A1'}}>
      <Toolbar style={{display: 'flex', justifyContent:'flex-end'}}>
        <Typography variant="h6" style={{padding: '10px', fontFamily: 'Poppins', fontSize: '16px'}}>vanshajpahwa07@gmail</Typography>
        <Button variant="outlined" style={{color: '#2D3250', border: '2px solid', borderColor: '#2D3250', fontWeight: 'bold', fontFamily: 'Poppins'}}>Logout</Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;

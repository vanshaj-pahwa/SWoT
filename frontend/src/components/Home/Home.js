import React from 'react';
import WorkoutForm from '../WorkoutManagement/WorkoutForm';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import './Home.css';
import Activity from '../Activity/Activity';
import Navbar from '../Navbar/Navbar';

const Home = () => {
  const userName = localStorage.getItem("userName");
  return (
    <React.Fragment>
      <Navbar />
      <Grid container>
        <Grid item xs={12} md={8}>
          <Card className="material-card">
            <CardContent className="workout-content" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <Typography variant='h5' style={{ fontFamily: 'Poppins', color: '#424769' }}>
                  Hello, {userName}
                </Typography>
                <Typography variant='h4' style={{ fontFamily: 'Poppins', fontWeight: 'bold', color: '#2D3250' }}>
                  Let's work out
                </Typography>
              </div>
              <img src='./image1.jpg' alt='workout' className='workout-image' />
            </CardContent>
          </Card>
          <Activity />
        </Grid>
        <Grid item xs={12} md={4}>
          <WorkoutForm />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export default Home;

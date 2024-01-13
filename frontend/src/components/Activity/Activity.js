import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import './Activity.css'

const Activity = () => {
    return (
        <div className="activity">
            <Typography variant='h6' style={{ fontFamily: 'Poppins', color: '#424769'}}>Your Activity</Typography>
            <Grid container spacing={2} marginTop={'1px'}>
                {/* Card for Your Next Workout */}
                <Grid item xs={6}>
                    <Card style={{backgroundColor: '#7077A1', color: 'white'}}>
                        <CardContent>
                            <Typography style={{fontFamily: 'Poppins', fontSize: '12px'}}>YOUR NEXT WORKOUT</Typography>
                            <Typography style={{fontFamily: 'Poppins', marginTop: '10px'}} variant='h5'>Chest, Shoulder, Triceps</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Card for Your Last Workout */}
                <Grid item xs={6}>
                    <Card style={{backgroundColor: '#424769', color: 'white'}}> 
                        <CardContent>
                            <Typography style={{fontFamily: 'Poppins', fontSize: '12px'}}>YOUR LAST WORKOUT</Typography>
                            <Typography style={{fontFamily: 'Poppins', marginTop: '10px'}} variant='h5'>Back, Biceps</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
}

export default Activity;

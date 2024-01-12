import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addWorkout, deleteWorkout, selectWorkout } from './workoutSlice';

const WorkoutForm = () => {
  const dispatch = useDispatch();
  const workouts = useSelector(selectWorkout);
  const [newWorkout, setNewWorkout] = useState('');

  const handleAddWorkout = () => {
    if (newWorkout.trim() !== '') {
      dispatch(addWorkout(newWorkout));
      setNewWorkout('');
    }
  };

  const handleDeleteWorkout = (workout) => {
    dispatch(deleteWorkout(workout));
  };

  return (
    <div>
      <h2>Workout Tracker</h2>
      <input
        type="text"
        value={newWorkout}
        onChange={(e) => setNewWorkout(e.target.value)}
        placeholder="Enter workout name"
      />
      <button onClick={handleAddWorkout}>Add Workout</button>

      <div>
        <h3>Added Workouts:</h3>
        <ul>
          {workouts?.map((workout, index) => (
            <li key={index}>{workout}
              <button onClick={() => handleDeleteWorkout(workout)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WorkoutForm;
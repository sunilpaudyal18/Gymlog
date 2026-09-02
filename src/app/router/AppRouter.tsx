import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { DashboardScreen } from '../../features/dashboard/DashboardScreen';
import { WorkoutsScreen } from '../../features/workouts/WorkoutsScreen';
import { CreateRoutineScreen } from '../../features/routines/CreateRoutineScreen';
import { RoutinePreviewScreen } from '../../features/routines/RoutinePreviewScreen';
import { ExercisesScreen } from '../../features/exercises/ExercisesScreen';
import { MuscleCategoryScreen } from '../../features/exercises/MuscleCategoryScreen';
import { ExerciseDetailScreen } from '../../features/exercises/ExerciseDetailScreen';
import { WorkoutModeScreen } from '../../features/workout-mode/WorkoutModeScreen';
import { WorkoutCompleteScreen } from '../../features/workout-mode/WorkoutCompleteScreen';
import { ProgressScreen } from '../../features/progress/ProgressScreen';
import { HistoryScreen } from '../../features/history/HistoryScreen';
import { HistoryDetailScreen } from '../../features/history/HistoryDetailScreen';
import { ProfileScreen } from '../../features/profile/ProfileScreen';
import { SettingsScreen } from '../../features/profile/SettingsScreen';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardScreen />} />
          <Route path="/workouts" element={<WorkoutsScreen />} />
          <Route path="/create-routine" element={<CreateRoutineScreen />} />
          <Route path="/create-routine/:id" element={<CreateRoutineScreen />} />
          <Route path="/edit-routine/:id" element={<CreateRoutineScreen />} />
          <Route path="/routine-preview/:id" element={<RoutinePreviewScreen />} />

          {/* Exercises & Category Drill-Down Routes */}
          <Route path="/exercises" element={<ExercisesScreen />} />
          <Route path="/exercises/category/:muscleId" element={<MuscleCategoryScreen />} />
          <Route path="/exercises/muscle/:muscleId" element={<MuscleCategoryScreen />} />
          <Route path="/exercises/:exerciseId" element={<ExerciseDetailScreen />} />
          <Route path="/exercises/:id" element={<ExerciseDetailScreen />} />
          <Route path="/add-exercise" element={<ExerciseDetailScreen />} />
          <Route path="/add-exercise/:exerciseId" element={<ExerciseDetailScreen />} />
          <Route path="/add-exercise/:id" element={<ExerciseDetailScreen />} />
          <Route path="/edit-exercise/:exerciseId" element={<ExerciseDetailScreen />} />
          <Route path="/edit-exercise/:id" element={<ExerciseDetailScreen />} />

          {/* Workout Modes */}
          <Route path="/workout-mode" element={<WorkoutModeScreen />} />
          <Route path="/workout/:routineId" element={<WorkoutModeScreen />} />
          <Route path="/workout-complete" element={<WorkoutCompleteScreen />} />

          {/* Analytics, History, Profile & Settings */}
          <Route path="/progress" element={<ProgressScreen />} />
          <Route path="/history" element={<HistoryScreen />} />
          <Route path="/history/:sessionId" element={<HistoryDetailScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};


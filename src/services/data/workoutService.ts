/**
 * Workout Data Service - Local-First Data Layer
 * Encapsulates IndexedDB persistence for completed workouts, active sessions, and personal records.
 */

import { WorkoutSession, PersonalRecord } from '../../types';
import { workoutRepository } from '../database/repositories/workoutRepository';
import { kvGet, kvSet } from '../database/db';

const PR_STORAGE_KEY = 'gym_personal_records_v3';

export const workoutService = {
  /**
   * Retrieves all completed historical workouts from IndexedDB.
   */
  async getCompletedWorkouts(): Promise<WorkoutSession[]> {
    try {
      return await workoutRepository.getAllCompletedWorkouts();
    } catch (err) {
      console.warn('[WorkoutService] Error reading completed workouts from IndexedDB:', err);
      return [];
    }
  },

  /**
   * Saves a completed workout session to IndexedDB.
   */
  async saveCompletedWorkout(session: WorkoutSession): Promise<boolean> {
    try {
      await workoutRepository.saveCompletedWorkout(session);
      return true;
    } catch (err) {
      console.error('[WorkoutService] Error saving completed workout to IndexedDB:', err);
      return false;
    }
  },

  /**
   * Retrieves active in-progress workout session from IndexedDB.
   */
  async getActiveSession(): Promise<WorkoutSession | null> {
    try {
      return await workoutRepository.getActiveSession();
    } catch (err) {
      console.warn('[WorkoutService] Error reading active session from IndexedDB:', err);
      return null;
    }
  },

  /**
   * Persists active in-progress workout session to IndexedDB (asynchronously, non-blocking).
   */
  async saveActiveSession(session: WorkoutSession): Promise<boolean> {
    try {
      await workoutRepository.saveActiveSession(session);
      return true;
    } catch (err) {
      console.warn('[WorkoutService] Error persisting active session to IndexedDB:', err);
      return false;
    }
  },

  /**
   * Clears active workout session from IndexedDB.
   */
  async clearActiveSession(): Promise<boolean> {
    try {
      await workoutRepository.clearActiveSession();
      return true;
    } catch (err) {
      console.warn('[WorkoutService] Error clearing active session from IndexedDB:', err);
      return false;
    }
  },

  /**
   * Retrieves personal records from IndexedDB kv_store.
   */
  async getPersonalRecords(): Promise<PersonalRecord[]> {
    try {
      const prs = await kvGet<PersonalRecord[]>(PR_STORAGE_KEY);
      return prs || [];
    } catch (err) {
      console.warn('[WorkoutService] Error reading PRs from kv_store:', err);
      return [];
    }
  },

  /**
   * Persists personal records to IndexedDB kv_store.
   */
  async savePersonalRecords(records: PersonalRecord[]): Promise<boolean> {
    try {
      await kvSet(PR_STORAGE_KEY, records);
      return true;
    } catch (err) {
      console.error('[WorkoutService] Error saving PRs to kv_store:', err);
      return false;
    }
  },
};

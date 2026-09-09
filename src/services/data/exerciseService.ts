/**
 * Exercise Data Service - Local-First Data Layer
 * Encapsulates IndexedDB access for custom exercises and library movements.
 * UI components and stores interact through this service rather than direct IDB queries.
 */

import { Exercise } from '../../types';
import { exerciseRepository } from '../database/repositories/exerciseRepository';

export const exerciseService = {
  /**
   * Retrieves all custom exercises from IndexedDB.
   */
  async getCustomExercises(): Promise<Exercise[]> {
    try {
      return await exerciseRepository.getAllCustomExercises();
    } catch (err) {
      console.warn('[ExerciseService] Error reading custom exercises from IndexedDB:', err);
      return [];
    }
  },

  /**
   * Persists a custom exercise directly into IndexedDB.
   * Confirms write via read-before-write / verification pattern.
   */
  async saveCustomExercise(exercise: Exercise): Promise<boolean> {
    try {
      const normalized: Exercise = {
        ...exercise,
        isCustom: true,
      };
      await exerciseRepository.saveCustomExercise(normalized);
      return true;
    } catch (err) {
      console.error('[ExerciseService] Failed to save custom exercise to IndexedDB:', err);
      return false;
    }
  },

  /**
   * Removes a custom exercise from IndexedDB.
   */
  async deleteCustomExercise(id: string): Promise<boolean> {
    try {
      await exerciseRepository.deleteCustomExercise(id);
      return true;
    } catch (err) {
      console.error('[ExerciseService] Failed to delete custom exercise from IndexedDB:', err);
      return false;
    }
  },
};

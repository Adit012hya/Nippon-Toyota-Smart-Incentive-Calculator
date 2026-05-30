import { useCallback, useEffect, useState } from 'react';
import { requireSupabase } from '../lib/supabase';
import type { CarModel } from '../types';

export function useCarModels() {
  const [models, setModels] = useState<CarModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await requireSupabase()
        .from('car_models')
        .select('*')
        .order('model_name', { ascending: true });

      if (fetchError) throw fetchError;
      setModels((data as CarModel[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load car models.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const addModel = async (
    model: Omit<CarModel, 'id' | 'created_at'>
  ): Promise<boolean> => {
    setError(null);
    try {
      const { error: insertError } = await requireSupabase()
        .from('car_models')
        .insert(model);
      if (insertError) throw insertError;
      await fetchModels();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add car model.');
      return false;
    }
  };

  const updateModel = async (
    id: string,
    updates: Partial<Omit<CarModel, 'id' | 'created_at'>>
  ): Promise<boolean> => {
    setError(null);
    try {
      const { error: updateError } = await requireSupabase()
        .from('car_models')
        .update(updates)
        .eq('id', id);
      if (updateError) throw updateError;
      await fetchModels();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update car model.');
      return false;
    }
  };

  const deleteModel = async (id: string): Promise<boolean> => {
    setError(null);
    try {
      const { error: deleteError } = await requireSupabase()
        .from('car_models')
        .delete()
        .eq('id', id);
      if (deleteError) throw deleteError;
      await fetchModels();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete car model.');
      return false;
    }
  };

  return { models, loading, error, fetchModels, addModel, updateModel, deleteModel };
}

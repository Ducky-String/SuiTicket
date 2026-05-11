import { supabase } from './supabaseClient';

export interface TicketData {
  movie_title: string;
  image_url: string;
  showtime: string;
  seats: string;
  quantity: number;
  owner_address: string;
  transaction_digest: string;
  status: 'valid' | 'used' | 'refunded';
}

export const saveTicketToSupabase = async (ticketData: TicketData) => {
  if (!supabase) {
    console.warn('Supabase is not initialized. Skipping database save.');
    return { success: false, error: 'Supabase not initialized' };
  }

  try {
    const { data, error } = await supabase
      .from('tickets')
      .insert([
        {
          ...ticketData,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Error saving ticket to Supabase:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error saving ticket:', err);
    return { success: false, error: err };
  }
};

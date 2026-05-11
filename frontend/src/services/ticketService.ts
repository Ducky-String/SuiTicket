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
    console.log('Attempting to save ticket to Supabase:', ticketData);
    const { data, error } = await supabase
      .from('tickets')
      .insert([
        {
          ...ticketData,
          created_at: new Date().toISOString(),
        },
      ])
      .select(); // Ensure we get the inserted data back

    if (error) {
      console.error('Supabase Insert Error:', error);
      return { success: false, error };
    }

    console.log('Ticket saved successfully to Supabase:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error during Supabase operation:', err);
    return { success: false, error: err };
  }
};

export const getOccupiedSeats = async (movieTitle: string, showtime: string): Promise<string[]> => {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('seats')
      .eq('movie_title', movieTitle)
      .eq('showtime', showtime)
      .eq('status', 'valid');

    if (error) {
      console.error('Error fetching occupied seats:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Parse comma-separated strings and flatten into a single array
    const allSeats = data.flatMap(row => 
      row.seats.split(',').map((s: string) => s.trim())
    );

    // Return unique seat IDs
    return [...new Set(allSeats)];
  } catch (err) {
    console.error('Unexpected error fetching occupied seats:', err);
    return [];
  }
};

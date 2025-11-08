import { supabase } from '@/integrations/supabase/client';

export interface Note {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  subject?: string;
  tags?: string[];
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  is_private: boolean;
  is_favorite: boolean;
  is_published: boolean;
  views_count: number;
  downloads_count: number;
  uploader_role: 'student' | 'teacher';
  uploader_name: string;
  created_at: string;
  updated_at: string;
}

// Upload a file to storage
export async function uploadNoteFile(file: File, userId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('notes-files')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('notes-files')
    .getPublicUrl(fileName);

  return { path: data.path, url: publicUrl };
}

// Create a new note
export async function createNote(noteData: {
  title: string;
  description?: string;
  subject?: string;
  tags?: string[];
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  is_private: boolean;
  is_published: boolean;
  uploader_role: 'student' | 'teacher';
  uploader_name: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('notes')
    .insert([{ ...noteData, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get all notes (public + user's private notes)
export async function getNotes(filters?: {
  subject?: string;
  tags?: string[];
  search?: string;
  onlyPublished?: boolean;
  onlyMyNotes?: boolean;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  
  let query = supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.subject) {
    query = query.eq('subject', filters.subject);
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`);
  }

  if (filters?.onlyPublished) {
    query = query.eq('is_published', true);
  }

  if (filters?.onlyMyNotes) {
    if (user) {
      query = query.eq('user_id', user.id);
    }
  }

  const { data, error } = await query;

  if (error) throw error;
  
  // Get user's favorites to mark notes
  if (user) {
    const { data: favData } = await supabase
      .from('notes_favorites')
      .select('note_id')
      .eq('user_id', user.id);
    
    const favoriteIds = new Set(favData?.map(f => f.note_id) || []);
    
    return (data || []).map(note => ({
      ...note,
      is_favorite: favoriteIds.has(note.id)
    })) as Note[];
  }
  
  return data as Note[];
}

// Get a single note by ID
export async function getNote(noteId: string) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .single();

  if (error) throw error;
  return data as Note;
}

// Update a note
export async function updateNote(noteId: string, updates: Partial<Note>) {
  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', noteId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a note
export async function deleteNote(noteId: string) {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId);

  if (error) throw error;
}

// Toggle favorite
export async function toggleFavorite(noteId: string, isFavorite: boolean) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  if (isFavorite) {
    // Add to favorites
    const { error } = await supabase
      .from('notes_favorites')
      .insert([{ user_id: user.id, note_id: noteId }]);
    
    if (error) throw error;
  } else {
    // Remove from favorites
    const { error } = await supabase
      .from('notes_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('note_id', noteId);
    
    if (error) throw error;
  }
}

// Get user's favorite notes
export async function getFavoriteNotes() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('notes_favorites')
    .select('note_id, notes(*)')
    .eq('user_id', user.id);

  if (error) throw error;
  
  // Mark all as favorite since these are from favorites table
  const notes = data?.map((item: { notes: Note }) => ({
    ...item.notes,
    is_favorite: true
  })).filter(Boolean) || [];
  
  return notes as Note[];
}

// Track note view
export async function trackNoteView(noteId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { error } = await supabase
    .from('notes_views')
    .insert([{ 
      user_id: user?.id || null, 
      note_id: noteId 
    }]);

  if (error) console.error('Error tracking view:', error);
}

// Track note download
export async function trackNoteDownload(noteId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { error } = await supabase
    .from('notes_downloads')
    .insert([{ 
      user_id: user?.id || null, 
      note_id: noteId 
    }]);

  if (error) console.error('Error tracking download:', error);
}

// Delete file from storage
export async function deleteNoteFile(filePath: string) {
  const { error } = await supabase.storage
    .from('notes-files')
    .remove([filePath]);

  if (error) throw error;
}

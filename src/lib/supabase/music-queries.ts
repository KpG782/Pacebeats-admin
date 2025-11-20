import { supabase } from "./client";
import { MusicTrack } from "./music-types";

// Fetch all music tracks with optional filters
export async function getMusicTracks(filters?: {
  genre?: string;
  mood?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = supabase.from("music").select("*", { count: "exact" });

    // Apply filters
    if (filters?.genre) {
      query = query.eq("genre", filters.genre);
    }
    if (filters?.mood) {
      query = query.eq("mood", filters.mood);
    }
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,artist.ilike.%${filters.search}%`
      );
    }

    // Apply pagination
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 50) - 1
      );
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      tracks: (data as MusicTrack[]) || [],
      total: count || 0,
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error fetching music tracks:", {
      message: err.message,
      name: err.name,
    });
    throw err;
  }
}

// Fetch a single track by ID
export async function getMusicTrack(trackId: string) {
  try {
    const { data, error } = await supabase
      .from("music")
      .select("*")
      .eq("track_id", trackId)
      .single();

    if (error) throw error;

    return data as MusicTrack;
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error fetching music track:", {
      message: err.message,
      name: err.name,
      trackId,
    });
    throw err;
  }
}

// Get tracks by genre
export async function getTracksByGenre(genre: string, limit = 50) {
  try {
    const { data, error } = await supabase
      .from("music")
      .select("*")
      .eq("genre", genre)
      .limit(limit);

    if (error) throw error;

    return (data as MusicTrack[]) || [];
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error fetching tracks by genre:", {
      message: err.message,
      name: err.name,
      genre,
    });
    throw err;
  }
}

// Get tracks by mood
export async function getTracksByMood(mood: string, limit = 50) {
  try {
    const { data, error } = await supabase
      .from("music")
      .select("*")
      .eq("mood", mood)
      .limit(limit);

    if (error) throw error;

    return (data as MusicTrack[]) || [];
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error fetching tracks by mood:", {
      message: err.message,
      name: err.name,
      mood,
    });
    throw err;
  }
}

// Get tracks by tempo range
export async function getTracksByTempoRange(
  minTempo: number,
  maxTempo: number,
  limit = 50
) {
  try {
    const { data, error } = await supabase
      .from("music")
      .select("*")
      .gte("tempo", minTempo)
      .lte("tempo", maxTempo)
      .limit(limit);

    if (error) throw error;

    return (data as MusicTrack[]) || [];
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error fetching tracks by tempo:", {
      message: err.message,
      name: err.name,
      minTempo,
      maxTempo,
    });
    throw err;
  }
}

// Get tracks by energy level
export async function getTracksByEnergy(
  minEnergy: number,
  maxEnergy: number,
  limit = 50
) {
  try {
    const { data, error } = await supabase
      .from("music")
      .select("*")
      .gte("energy", minEnergy)
      .lte("energy", maxEnergy)
      .limit(limit);

    if (error) throw error;

    return (data as MusicTrack[]) || [];
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error fetching tracks by energy:", {
      message: err.message,
      name: err.name,
      minEnergy,
      maxEnergy,
    });
    throw err;
  }
}

// Search tracks with audio feature filters
export async function searchTracksAdvanced(params: {
  search?: string;
  genre?: string;
  mood?: string;
  minTempo?: number;
  maxTempo?: number;
  minEnergy?: number;
  maxEnergy?: number;
  minValence?: number;
  maxValence?: number;
  minDanceability?: number;
  maxDanceability?: number;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = supabase.from("music").select("*", { count: "exact" });

    // Text search
    if (params.search) {
      query = query.or(
        `name.ilike.%${params.search}%,artist.ilike.%${params.search}%`
      );
    }

    // Category filters
    if (params.genre) {
      query = query.eq("genre", params.genre);
    }
    if (params.mood) {
      query = query.eq("mood", params.mood);
    }

    // Audio feature filters
    if (params.minTempo !== undefined) {
      query = query.gte("tempo", params.minTempo);
    }
    if (params.maxTempo !== undefined) {
      query = query.lte("tempo", params.maxTempo);
    }
    if (params.minEnergy !== undefined) {
      query = query.gte("energy", params.minEnergy);
    }
    if (params.maxEnergy !== undefined) {
      query = query.lte("energy", params.maxEnergy);
    }
    if (params.minValence !== undefined) {
      query = query.gte("valence", params.minValence);
    }
    if (params.maxValence !== undefined) {
      query = query.lte("valence", params.maxValence);
    }
    if (params.minDanceability !== undefined) {
      query = query.gte("danceability", params.minDanceability);
    }
    if (params.maxDanceability !== undefined) {
      query = query.lte("danceability", params.maxDanceability);
    }

    // Pagination
    if (params.limit) {
      query = query.limit(params.limit);
    }
    if (params.offset) {
      query = query.range(
        params.offset,
        params.offset + (params.limit || 50) - 1
      );
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      tracks: (data as MusicTrack[]) || [],
      total: count || 0,
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error searching tracks:", {
      message: err.message,
      name: err.name,
      params,
    });
    throw err;
  }
}

// Get unique genres from the database
export async function getGenres() {
  try {
    const { data, error } = await supabase
      .from("music")
      .select("genre")
      .not("genre", "is", null)
      .order("genre");

    if (error) throw error;

    // Get unique genres
    const uniqueGenres = Array.from(
      new Set(data?.map((item) => item.genre) || [])
    );
    return uniqueGenres;
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error fetching genres:", {
      message: err.message,
      name: err.name,
    });
    throw err;
  }
}

// Get unique moods from the database
export async function getMoods() {
  try {
    const { data, error } = await supabase
      .from("music")
      .select("mood")
      .not("mood", "is", null)
      .order("mood");

    if (error) throw error;

    // Get unique moods
    const uniqueMoods = Array.from(
      new Set(data?.map((item) => item.mood) || [])
    );
    return uniqueMoods;
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error fetching moods:", {
      message: err.message,
      name: err.name,
    });
    throw err;
  }
}

// Get track statistics
export async function getMusicStats() {
  try {
    const { count, error } = await supabase
      .from("music")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    const genres = await getGenres();
    const moods = await getMoods();

    return {
      totalTracks: count || 0,
      totalGenres: genres.length,
      totalMoods: moods.length,
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error fetching music stats:", {
      message: err.message,
      name: err.name,
    });
    throw err;
  }
}

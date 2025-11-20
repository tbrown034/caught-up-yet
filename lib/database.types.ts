// Database types for Supabase tables
// Auto-generated from schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================
// GAME POSITION TYPES
// ============================================

export type NflPosition = {
  quarter: 1 | 2 | 3 | 4 | 5; // 5 = OT
  minutes: number;
  seconds: number;
};

export type MlbPosition = {
  inning: number;
  half: "TOP" | "BOTTOM";
  outs?: 0 | 1 | 2;
};

export type NbaPosition = {
  quarter: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; // 5+ = OT periods
  minutes: number;
  seconds: number;
};

export type NhlPosition = {
  period: 1 | 2 | 3 | 4 | 5; // 4 = OT, 5 = 2OT (playoffs)
  minutes: number;
  seconds: number;
};

export type GamePosition =
  | NflPosition
  | MlbPosition
  | NbaPosition
  | NhlPosition;

// ============================================
// DATABASE TYPES
// ============================================

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string;
          game_id: string;
          sport: "nfl" | "mlb" | "nba" | "nhl";
          share_code: string;
          created_by: string;
          created_at: string;
          expires_at: string;
          game_data: Json | null;
          is_active: boolean;
          name: string | null;
        };
        Insert: {
          id?: string;
          game_id: string;
          sport: "nfl" | "mlb" | "nba" | "nhl";
          share_code: string;
          created_by: string;
          created_at?: string;
          expires_at: string;
          game_data?: Json | null;
          is_active?: boolean;
          name?: string | null;
        };
        Update: {
          id?: string;
          game_id?: string;
          sport?: "nfl" | "mlb" | "nba" | "nhl";
          share_code?: string;
          created_by?: string;
          created_at?: string;
          expires_at?: string;
          game_data?: Json | null;
          is_active?: boolean;
          name?: string | null;
        };
      };
      room_members: {
        Row: {
          room_id: string;
          user_id: string;
          current_position: Json;
          current_position_encoded: number | null;
          show_spoilers: boolean;
          joined_at: string;
          last_updated: string;
          display_name: string | null;
        };
        Insert: {
          room_id: string;
          user_id: string;
          current_position?: Json;
          current_position_encoded?: number | null;
          show_spoilers?: boolean;
          joined_at?: string;
          last_updated?: string;
          display_name?: string | null;
        };
        Update: {
          room_id?: string;
          user_id?: string;
          current_position?: Json;
          current_position_encoded?: number | null;
          show_spoilers?: boolean;
          joined_at?: string;
          last_updated?: string;
          display_name?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          content: string;
          position: Json;
          position_encoded: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          user_id: string;
          content: string;
          position: Json;
          position_encoded?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          user_id?: string;
          content?: string;
          position?: Json;
          position_encoded?: number | null;
          created_at?: string;
        };
      };
    };
  };
}

// ============================================
// CONVENIENCE TYPES
// ============================================

export type Room = Database["public"]["Tables"]["rooms"]["Row"];
export type RoomInsert = Database["public"]["Tables"]["rooms"]["Insert"];
export type RoomUpdate = Database["public"]["Tables"]["rooms"]["Update"];

export type RoomMember = Database["public"]["Tables"]["room_members"]["Row"];
export type RoomMemberInsert =
  Database["public"]["Tables"]["room_members"]["Insert"];
export type RoomMemberUpdate =
  Database["public"]["Tables"]["room_members"]["Update"];

export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];
export type MessageUpdate = Database["public"]["Tables"]["messages"]["Update"];

// ============================================
// EXTENDED TYPES (with joined data)
// ============================================

export type RoomWithCreator = Room & {
  creator_email?: string;
  member_count?: number;
};

export type MessageWithAuthor = Message & {
  author_email?: string;
};

export type RoomMemberWithUser = RoomMember & {
  user_email?: string;
};

// ============================================
// SCORING PLAY TYPE (for real-time score display)
// ============================================

export type ScoringPlay = {
  id: string;
  period: number; // Quarter/Period/Inning number
  clock: string; // "8:14", "5:55", etc.
  clockValue: number; // Seconds remaining (for sorting)
  awayScore: number; // Running total after this play
  homeScore: number; // Running total after this play
  description?: string; // "Derrick Henry 5 Yd Run"
  teamId?: string; // Which team scored
};

// ============================================
// GAME DATA TYPE (stored in room.game_data)
// ============================================

export type GameStatus = {
  type: string; // "STATUS_SCHEDULED", "STATUS_IN_PROGRESS", "STATUS_FINAL", etc.
  displayClock?: string; // "8:14", "5:55", etc.
  period?: number; // Quarter/Period/Inning number
  detail?: string;
};

export type GameData = {
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status?: string | GameStatus; // Can be string for backward compatibility or full object
  gameDate?: string;
  venue?: string;
  // Quarter/Period/Inning scores for spoiler-safe display
  homeLinescores?: number[]; // [7, 3, 14, 7] for NFL quarters, [2, 0, 1, ...] for MLB innings
  awayLinescores?: number[];
  // Scoring plays for real-time score calculation
  scoringPlays?: ScoringPlay[];
};

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
  quarter: 1 | 2 | 3 | 4;
  minutes: number;
  seconds: number;
};

export type MlbPosition = {
  inning: number;
  half: "TOP" | "BOTTOM";
  outs?: 0 | 1 | 2;
};

export type NbaPosition = {
  quarter: 1 | 2 | 3 | 4;
  minutes: number;
  seconds: number;
};

export type NhlPosition = {
  period: 1 | 2 | 3;
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
        };
      };
      room_members: {
        Row: {
          room_id: string;
          user_id: string;
          current_position: Json;
          show_spoilers: boolean;
          joined_at: string;
          last_updated: string;
        };
        Insert: {
          room_id: string;
          user_id: string;
          current_position?: Json;
          show_spoilers?: boolean;
          joined_at?: string;
          last_updated?: string;
        };
        Update: {
          room_id?: string;
          user_id?: string;
          current_position?: Json;
          show_spoilers?: boolean;
          joined_at?: string;
          last_updated?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          content: string;
          position: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          user_id: string;
          content: string;
          position: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          user_id?: string;
          content?: string;
          position?: Json;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          user_id: string;
          display_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          display_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          display_name?: string;
          created_at?: string;
          updated_at?: string;
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

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

// ============================================
// EXTENDED TYPES (with joined data)
// ============================================

export type RoomWithCreator = Room & {
  creator_email?: string;
  member_count?: number;
};

export type MessageWithAuthor = Message & {
  author_email?: string;
  author_name?: string;
};

export type RoomMemberWithUser = RoomMember & {
  user_email?: string;
};

// ============================================
// GAME DATA TYPE (stored in room.game_data)
// ============================================

export type GameData = {
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status?: string;
  gameDate?: string;
  venue?: string;
};

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Button from "@/components/ui/Button";
import { Trophy, UserPlus, Users, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatShareCode } from "@/lib/share-code";
import type { GameData } from "@/lib/database.types";
import RoomManager from "@/components/profile/RoomManager";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Fetch user's room memberships
  const { data: memberships } = await supabase
    .from("room_members")
    .select("room_id")
    .eq("user_id", user.id);

  let roomsCreated = 0;
  let roomsJoined = 0;
  let totalRooms = 0;
  let createdParties: Array<{
    id: string;
    sport: string;
    share_code: string;
    created_at: string;
    game_data: GameData;
    is_active: boolean;
  }> = [];
  let joinedParties: Array<{
    id: string;
    sport: string;
    share_code: string;
    created_at: string;
    game_data: GameData;
    is_active: boolean;
  }> = [];

  if (memberships && memberships.length > 0) {
    const roomIds = memberships.map((m) => m.room_id);

    // Get room details to calculate stats
    const { data: rooms } = await supabase
      .from("rooms")
      .select("id, created_by, sport, share_code, created_at, game_data, is_active")
      .in("id", roomIds)
      .order("created_at", { ascending: false });

    if (rooms) {
      totalRooms = rooms.length;
      createdParties = rooms.filter((room) => room.created_by === user.id) as typeof createdParties;
      joinedParties = rooms.filter((room) => room.created_by !== user.id) as typeof joinedParties;
      roomsCreated = createdParties.length;
      roomsJoined = joinedParties.length;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Profile</h1>

          <div className="space-y-4 mb-6">
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Email
              </p>
              <p className="text-gray-900 dark:text-white">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                User ID
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-mono">{user.id}</p>
            </div>
          </div>

          <form action="/auth/signout" method="post">
            <Button type="submit" variant="secondary">
              Sign Out
            </Button>
          </form>
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Stats</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {roomsCreated}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Parties Created</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {roomsJoined}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Parties Joined</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalRooms}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Parties</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Parties Created */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Parties You Created
          </h2>
          <RoomManager createdParties={createdParties} />
        </div>

        {/* Parties Joined */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Parties You Joined
          </h2>

          {joinedParties.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              You haven&apos;t joined any parties yet.
            </p>
          ) : (
            <div className="space-y-3">
              {joinedParties.map((party) => {
                const gameData = party.game_data;
                return (
                  <Link
                    key={party.id}
                    href={`/rooms/${party.id}`}
                    className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-green-500 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                            {party.sport}
                          </span>
                          {!party.is_active && (
                            <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded">
                              INACTIVE
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {gameData?.awayTeam} @ {gameData?.homeTeam}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(party.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Share Code</p>
                        <p className="font-mono font-semibold text-green-600 dark:text-green-400">
                          {formatShareCode(party.share_code)}
                        </p>
                        <ExternalLink className="w-4 h-4 text-gray-400 ml-auto mt-2" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

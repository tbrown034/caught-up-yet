import { fetchAllSportsGames } from "@/lib/espn-api";
import GamesContainer from "@/components/games/GamesContainer";

export default async function GamesPage() {
  const today = new Date();
  const initialGames = await fetchAllSportsGames(today);

  return <GamesContainer initialGames={initialGames} initialDate={today} />;
}

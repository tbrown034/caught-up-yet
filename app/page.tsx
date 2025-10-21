import Link from "next/link";
export default function Home() {
  return (
    <div className="flex flex-col gap-8 justify-center items-center min-h-screen">
      <div className="flex flex-col gap-4 items-center">
        <h1 className=" text-6xl">Caught Up Yet?</h1>
        <h2 className="text-2xl">Watch on your time. No spoilers.</h2>
      </div>
      <div className="flex gap-4">
        <Link className="border-2 p-2 rounded-lg" href="/signin">
          Sign In
        </Link>
        <Link className="border-2 p-2 rounded-lg" href="/games">
          Games
        </Link>
      </div>
    </div>
  );
}

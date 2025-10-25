import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 justify-center items-center min-h-screen">
      <div className="flex flex-col gap-4 items-center text-center">
        <h1 className="text-6xl font-bold">Caught Up Yet?</h1>
        <h2 className="text-2xl text-gray-600">
          Watch on your time. No spoilers.
        </h2>
      </div>
      <div className="flex gap-4">
        <Button variant="primary" size="lg" href="/login" asLink>
          Sign In
        </Button>
        <Button variant="secondary" size="lg" href="/dashboard" asLink>
          Dashboard
        </Button>
      </div>
    </div>
  );
}

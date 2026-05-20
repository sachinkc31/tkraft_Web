import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-8xl mb-6">🔍</p>
      <h1 className="text-4xl font-display font-bold text-[hsl(222,47%,11%)] mb-3">
        Page Not Found
      </h1>
      <p className="text-[hsl(215,16%,47%)] mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/">
          <Button variant="primary" size="lg">Go Home</Button>
        </Link>
        <Link href="/shop">
          <Button variant="outline" size="lg">Browse Products</Button>
        </Link>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
      <h1 className="text-3xl font-bold mb-2 text-foreground">Page Not Found</h1>
      <p className="text-muted-foreground mb-6">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-foreground text-background rounded-md hover:opacity-90 transition-all font-semibold cursor-pointer"
      >
        Go To Homepage
      </Link>
    </div>
  );
}

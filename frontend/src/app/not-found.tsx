import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="text-center max-w-md">
        <h1 className="font-display text-6xl font-bold text-bark/20 mb-2">404</h1>
        <h2 className="font-display text-2xl font-bold text-bark mb-2">Page Not Found</h2>
        <p className="font-body text-bark-light mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/" className="btn-primary">Go Home</Link>
          <Link href="/sarees" className="btn-outline">Browse Sarees</Link>
        </div>
      </div>
    </div>
  );
}

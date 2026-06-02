import Link from "next/link";

export default function NotFound() {
  return (
    <section>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 prose-body">
        <p className="eyebrow mb-4">404</p>
        <h1 className="text-4xl font-semibold mb-4">Record not found.</h1>
        <p>
          The page you requested does not exist in the Council&apos;s public
          record. Maybe you were looking for:
        </p>
        <ul>
          <li>
            <Link href="/governance">What the Council governs</Link>
          </li>
          <li>
            <Link href="/members">Members</Link>
          </li>
          <li>
            <Link href="/news">Recent news</Link>
          </li>
          <li>
            <Link href="/join">Apply for a Council seat</Link>
          </li>
        </ul>
        <p className="not-prose mt-6">
          <Link href="/" className="btn btn-primary">
            Return home
          </Link>
        </p>
      </div>
    </section>
  );
}

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/data";
import { FALLBACK_LOGO } from "@/lib/site";

export default async function NotFound() {
  const site = await getSettings().catch(() => null);
  return (
    <section className="relative flex min-h-[80vh] items-center justify-center px-5 pb-20 pt-40 text-center">
      <div className="max-w-lg">
        <Image src={site?.logo || FALLBACK_LOGO} alt="" width={96} height={96} className="mx-auto rounded-full" />
        <p className="font-display mt-8 text-8xl font-extrabold text-amber-700">404</p>
        <h1 className="font-display-tight mt-2 text-3xl font-bold text-slate-900">This lift went off the map</h1>
        <p className="mt-4 text-slate-600">The page you are looking for doesn&apos;t exist or has been moved.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <Link href="/products" className="btn-ghost">
            Browse products
          </Link>
        </div>
      </div>
    </section>
  );
}

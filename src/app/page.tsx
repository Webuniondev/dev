import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col">
      <SiteHeader />
      <main className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-10 flex-1" />
    </div>
  );
}

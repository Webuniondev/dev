import { SiteHeader } from "@/components/site-header";

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <SiteHeader />
      {children}
    </div>
  );
}



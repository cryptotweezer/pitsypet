import { LandingHeader } from "@/components/landing/landing-header";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-dvh bg-gradient-to-r from-brand via-brand-container to-[#c3a3e8] pt-24 font-sans sm:pt-28">
      <LandingHeader />
      {children}
    </div>
  );
}

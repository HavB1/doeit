// import RequireOnboarding from "@/components/require-onboarding";
import { DashboardNav } from "@/components/nav";
import { MobileNav } from "@/components/mobile-nav";
import { UserNav } from "@/app/(dashboard)/dashboard/components/user-nav";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <RequireOnboarding>
    <div className="flex min-h-screen w-full flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <MobileNav />
          <div className="flex items-center justify-center w-full h-10 overflow-hidden">
            <Image
              src="/doeit.png"
              alt="Doeit"
              width={50}
              height={50}
              className="object-contain"
            />
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* Add search here if needed */}
            </div>
            <UserNav />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto  w-screen flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        {/* Sidebar */}
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <DashboardNav />
        </aside>

        {/* Main Content */}
        <main className="flex px-4 w-full flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
    // </RequireOnboarding>
  );
}

import Sidebar from "./nav-sidebar";
import Navbar from "./navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-full">
      <Navbar />
      <div className="hidden md:flex! h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <Sidebar />
      </div>
      <main className="pl-0 md:pl-[72px] h-full">{children}</main>
    </div>
  );
}

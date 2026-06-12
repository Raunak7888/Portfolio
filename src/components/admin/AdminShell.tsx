import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <AdminSidebar />
      <div className="ml-56 flex flex-col min-h-screen">
        <AdminTopbar />
        <main className="flex-1 p-6 max-w-5xl w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
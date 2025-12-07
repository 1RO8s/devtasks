import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-56 border-r h-full p-4 bg-gray-50">
      <nav className="flex flex-col gap-2">
        <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
        <Link href="/projects" className="hover:text-blue-600">Projects</Link>
        <Link href="/tasks" className="hover:text-blue-600">Tasks</Link>
      </nav>
    </aside>
  );
}

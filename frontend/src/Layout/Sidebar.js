
import { Link } from "react-router-dom";

export function Sidebar({ sidebarOpen, setSidebarOpen, sidebarRef }) {
  return (
    <div
      ref={sidebarRef}
      className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md transform transition-transform duration-300 z-40 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-4 font-bold border-b">Navigation</div>
      <ul className="p-4 space-y-2">
        <li>
          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
            className="block text-blue-500 font-bold text-lg hover:underline"
          >
            홈
          </Link>
        </li>
        <li>
          <Link
            to="/Board"
            onClick={() => setSidebarOpen(false)}
            className="block text-blue-500 font-bold text-lg hover:underline"
          >
            게시판
          </Link>
        </li>
      </ul>
    </div>
  );
}


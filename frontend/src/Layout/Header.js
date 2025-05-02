import { Link } from "react-router-dom";

export function Header({ onToggleSidebar, hamburgerRef }) {
  return (
    <div className="flex items-center space-x-2">
      <button
        ref={hamburgerRef}
        className="text-2xl font-bold focus:outline-none"
        onClick={onToggleSidebar}
      >
        &#9776;
      </button>
      <h1 className="text-2xl font-bold">
        <Link to="/">TEST.COM</Link>
      </h1>
    </div>
  );
}

import { Link } from "react-router-dom";
import Logout from "../Pages/Logout";

export function Navigation({ user, onLogout }) {
  return (
    <nav className="space-x-4">
      {user ? (
        <>
          <Link to="/profile" className="hover:underline">
            <img
                src="   https://cdn-icons-png.flaticon.com/512/11081/11081570.png" 
                alt="Profile Icon"
                className="inline-block w-6 h-6"
                title="프로필"
            />
            </Link>
          <Logout onLogout={onLogout} />
        </>
      ) : (
        <Link to="/login" className="hover:underline">로그인</Link>
      )}
    </nav>
  );
}

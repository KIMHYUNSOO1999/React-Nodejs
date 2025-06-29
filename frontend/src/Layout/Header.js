import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";

export function Header({ onToggleSidebar, hamburgerRef }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    setKeyword(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (trimmed.length > 0) {
      navigate(`/boardlist?search=${encodeURIComponent(trimmed)}&page=1`);
    } else {
      navigate(`/boardlist`);
    }
  };

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

      <form
        onSubmit={handleSearchSubmit}
        className="ml-4 flex items-center space-x-3"
      >
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="게시판 검색"
          className="border rounded px-2 py-1 text-black"
        />
        <button type="submit" className="hidden">검색</button>
      </form>
    </div>
  );
}

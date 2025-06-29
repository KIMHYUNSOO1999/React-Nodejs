import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../Components/LoadingSpinner";

function BoardList() {
  const [boards, setBoards] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const pageGroupSize = 5;
  const currentGroup = Math.ceil(page / pageGroupSize);
  const totalGroups = Math.ceil(totalPages / pageGroupSize);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await axios.get(
          `/api/v1/board/list?page=${page}&search=${encodeURIComponent(search)}`
        );
        setBoards(res.data.boards);
        setTotalPages(res.data.totalPages);
         setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchBoards();
  }, [page, search]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    navigate(`?page=${newPage}${search ? `&search=${encodeURIComponent(search)}` : ""}`);
  };

  const startPage = (currentGroup - 1) * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <LoadingSpinner />
      </div>
    );

return (
  <div className="max-w-3xl mx-auto p-10">
    {boards.length === 0 ? (
      <p className="text-center text-gray-500 mt-8">유사한 게시판은 없습니다.</p>
    ) : (
      <>
        <ul className="space-y-2">
          {boards.map((board) => (
            <li
              key={board.type}
              className="border p-4 rounded shadow hover:bg-gray-100"
            >
              <Link
                to={`/${board.type}`}
                className="text-blue-600 font-semibold text-lg hover:underline"
              >
                {board.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex justify-center mt-6 space-x-2 items-center">
          <button
            onClick={() => handlePageChange(startPage - 1)}
            disabled={currentGroup === 1}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            &lt;
          </button>

          {Array.from({ length: endPage - startPage + 1 }, (_, idx) => startPage + idx).map(
            (num) => (
              <button
                key={num}
                onClick={() => handlePageChange(num)}
                className={`px-3 py-1 border rounded ${
                  page === num ? "bg-blue-600 text-white" : "bg-white"
                }`}
              >
                {num}
              </button>
            )
          )}

          <button
            onClick={() => handlePageChange(endPage + 1)}
            disabled={currentGroup === totalGroups}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            &gt;
          </button>
        </div>
      </>
    )}
  </div>
);

}

export default BoardList;

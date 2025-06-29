import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../Components/LoadingSpinner";

function Board() {
  const { boardName } = useParams();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [posts, setPosts] = useState([]);
  const [isValidBoard, setIsValidBoard] = useState(true);
  const [boardInfo, setBoardInfo] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const page = parseInt(searchParams.get("page")) || 1;
  const searchType = searchParams.get("searchType") || "title";
  const searchText = searchParams.get("search") || "";

  const pageGroupSize = 5;
  const currentGroup = Math.ceil(page / pageGroupSize);
  const totalGroups = Math.ceil(totalPages / pageGroupSize);
  const startPage = (currentGroup - 1) * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  const [searchSelect, setSearchSelect] = useState(searchType);
  const [searchInput, setSearchInput] = useState(searchText);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchBoardAndPosts = async () => {
      try {
        let url = `/api/v1/board/${boardName}?page=${page}`;
        if (searchText.trim() !== "") {
          url += `&searchType=${encodeURIComponent(searchType)}&search=${encodeURIComponent(searchText)}`;
        }

        const res = await axios.get(url);
        setBoardInfo(res.data.board);
        setPosts(res.data.posts);
        setTotalPages(res.data.totalPages || 1);
        setIsValidBoard(true);
         setLoading(false);
      } catch (error) {
        setIsValidBoard(false);
      }
    };

    fetchBoardAndPosts();
  }, [boardName, page, searchType, searchText]);

  const handleSearchSelectChange = (e) => {
    setSearchSelect(e.target.value);
  };

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const params = { page: 1 };
    if (searchInput.trim() !== "") {
      params.searchType = searchSelect;
      params.search = searchInput.trim();
    }
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;

    const params = { page: newPage };
    if (searchInput.trim() !== "") {
      params.searchType = searchSelect;
      params.search = searchInput.trim();
    }
    setSearchParams(params);
  };

  if (!isValidBoard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
        <h1 className="text-2xl font-bold text-red-500">존재하지 않는 페이지입니다.</h1>
        <Link to="/" className="mt-4 font-bold text-blue-600 underline">
          홈으로 이동
        </Link>
      </div>
    );
  }

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
    <div className="w-full min-h-screen bg-gray-100 pt-6 px-2 sm:px-6 lg:px-8">
      <div className="bg-white rounded shadow p-4 w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-blue-800">{boardInfo?.name}</h1>
          <button
            onClick={() => navigate(`/${boardName}/write`)}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-m"
          >
            글작성
          </button>
        </div>

        {isMobile ? (
          <div className="space-y-2">
            {posts.map((post) => (
              <div
                key={post._id || post.index}
                onClick={() => navigate(`/${boardName}/${post.index}`)}
                className="text-black p-3 rounded-md shadow hover:bg-gray-100 cursor-pointer"
              >
                <div className="font-medium text-sm mb-1 truncate text-blue-800">
                  {post.title}
                </div>
                <div className="text-xs text-gray-400 flex justify-between">
                  <span className="w-20 truncate">작성자 {post.nickname}</span>
                  <span className="w-20 text-right">{formatDate(post.regdate)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-300 text-sm table-fixed">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-1 py-2 w-12">번호</th>
                  <th className="border px-1 py-2 w-96">제목</th>     
                  <th className="border px-1 py-2 w-16">작성자</th>    
                  <th className="border px-1 py-2 w-16">작성일</th>     
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post._id || post.index}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/${boardName}/${post.index}`)}
                  >
                    <td className="border px-1 py-3 text-center w-12">{post.index}</td>
                    <td className="border px-1 py-3 truncate w-96">{post.title}</td>      
                    <td className="border px-1 py-3 text-center truncate w-16">{post.nickname}</td> 
                    <td className="border px-1 py-3 text-center text-xs w-16">{formatDate(post.regdate)}</td> 
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <form onSubmit={handleSearchSubmit} className="mt-3 mb-4 flex space-x-2 items-center justify-end">
          <select
            value={searchSelect}
            onChange={handleSearchSelectChange}
            className="border rounded px-1 py-0.5 text-xs w-30"
          >
            <option value="title">제목</option>
            <option value="nickname">작성자</option>
          </select>
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchInputChange}
            placeholder="검색어를 입력하세요"
            className="border rounded px-2 py-0.5 text-xs w-48"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-3 py-0.5 rounded text-xs hover:bg-blue-700"
          >
            검색
          </button>
        </form>

        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => handlePageChange(startPage - 1)}
            disabled={currentGroup === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            &lt;
          </button>

          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((p) => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={`px-3 py-1 border rounded ${p === page ? "bg-blue-600 text-white" : ""}`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(endPage + 1)}
            disabled={currentGroup === totalGroups}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}

export default Board;

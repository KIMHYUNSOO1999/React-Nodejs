import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Board() {


    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const posts = [];


    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);
  
    return (
      <div className="w-full min-h-screen bg-gray-100 pt-6 px-2 sm:px-6 lg:px-8">
        <div className="bg-white rounded shadow p-4 w-full">
          <h1 className="text-xl sm:text-2xl font-bold text-blue-800 mb-4 text-left">
            <Link to="/Board">게시판</Link>
          </h1>
          {isMobile ? (
            <div className="space-y-2">
              {posts.map((post, index) => (
                <div key={post.id} className="text-black p-3 rounded-md shadow">
                  <div className="font-medium text-sm mb-1 truncate">{post.title}</div>
                  <div className="text-xs text-gray-400 flex justify-between">
                    <span>작성자 {post.author}</span>
                    <div className="flex gap-2">
                      <span>{post.date}</span>
                      <span>조회 {post.views}</span>
                      <span>추천 {post.likes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-1 py-2 whitespace-nowrap min-w-[30px]">번호</th>
                    <th className="border px-1 py-2 whitespace-nowrap min-w-[150px]">제목</th>
                    <th className="border px-1 py-2 whitespace-nowrap min-w-[60px]">작성자</th>
                    <th className="border px-1 py-2 whitespace-nowrap min-w-[60px]">작성일</th>
                    <th className="border px-1 py-2 whitespace-nowrap min-w-[50px]">조회수</th>
                    <th className="border px-1 py-2 whitespace-nowrap min-w-[50px]">추천</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post, index) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="border px-1 py-2 text-center whitespace-nowrap">{index + 1}</td>
                      <td className="border px-1 py-2 whitespace-nowrap">{post.title}</td>
                      <td className="border px-1 py-2 text-center whitespace-nowrap text-xs">{post.author}</td>
                      <td className="border px-1 py-2 text-center whitespace-nowrap text-xs">{post.date}</td>
                      <td className="border px-1 py-2 text-center whitespace-nowrap text-xs">{post.views}</td>
                      <td className="border px-1 py-2 text-center whitespace-nowrap text-xs">{post.likes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  export default Board;
  
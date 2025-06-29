import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../Components/LoadingSpinner";

function Home() {
  const [boards, setBoards] = useState([]);
  const [postsByBoard, setPostsByBoard] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const boardRes = await axios.get("/api/v1/board/list", {
          params: { page: 1 }
        });

        if (boardRes.data.success) {
          const boards = boardRes.data.boards;
          setBoards(boards);

          const postsPromises = boards.map(board =>
            axios.get(`/api/v1/board/${board.type}`, {
              params: { page: 1 }
            })
          );

          const postsResults = await Promise.all(postsPromises);

          const newPostsByBoard = {};
          postsResults.forEach((res, idx) => {
            if (res.data.success) {
              newPostsByBoard[boards[idx].type] = res.data.posts.slice(0, 3);
            } else {
              newPostsByBoard[boards[idx].type] = [];
            }
          });

          setPostsByBoard(newPostsByBoard);
        } else {
          console.error("게시판 리스트 불러오기 실패");
        }
      } catch (err) {
        console.error("서버 호출 에러", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

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
    <div style={{ maxWidth: 1200, margin: "auto", padding: 20 }}>

      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 20,
          marginBottom: 20,
          backgroundColor: "#fff",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          onClick={() => navigate(`/boardlist`)}
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: "bold",
            color: "#2563eb",         
            cursor: "pointer",
            userSelect: "none",
            transition: "color 0.3s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#93c5fd")} 
          onMouseLeave={e => (e.currentTarget.style.color = "#3b82f6")}
        >
          다중게시판 조회
        </h1>
      </section>

      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 20,
          marginBottom: 20,
          backgroundColor: "#fff",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: "600", marginBottom: 12 }}>
          최신 게시물 
        </h2>
        {boards.map(board => (
          <div
            key={board.type}
            style={{
              marginBottom: 24,
              border: "1px solid #eee",
              borderRadius: 6,
              padding: 16,
              backgroundColor: "#fafafa",
            }}
          >
            <h3
              onClick={() => navigate(`/${board.type}`)}
              style={{
                cursor: "pointer",
                color: "#1e40af",
                marginBottom: 12,
                userSelect: "none",
              }}
            >
              {board.name}
            </h3>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {(postsByBoard[board.type] || []).length === 0 && (
                <li style={{ color: "#999" }}>게시물이 없습니다.</li>
              )}
              {(postsByBoard[board.type] || []).map(post => (
                <li
                  key={post.index}
                  style={{
                    marginBottom: 6,
                    cursor: "pointer",
                    color: "#111",
                    userSelect: "none",
                  }}
                  onClick={() => navigate(`/${board.type}/${post.index}`)}
                >
                  <strong>{post.title}</strong>{" "}
                  <small style={{ color: "#666", marginLeft: 8 }}>
                    ({new Date(post.regdate).toLocaleDateString()})
                  </small>{" "}
                  <small style={{ color: "#999", marginLeft: 8 }}>
                    [{post.nickname}]
                  </small>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Home;
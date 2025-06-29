import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAlert } from "../Layout/SetAlert";

function WritePost() {
  const { boardName } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { showAlert } = useAlert();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/v1/user/auth", {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch {
        showAlert("로그인이 필요합니다.","error");
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate, showAlert]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `/api/v1/board/write`,
        {
          boardType: boardName,
          title,
          content,
        },
        {
          withCredentials: true,
        }
      );
      navigate(`/${boardName}`);
    } catch (err) {
      showAlert("글 작성에 실패했습니다.","error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">{boardName} 게시판</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
        <textarea
          placeholder="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 h-48 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            작성
          </button>
        </div>
      </form>
    </div>
  );
}

export default WritePost;

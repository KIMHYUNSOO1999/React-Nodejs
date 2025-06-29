import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAlert } from "../Layout/SetAlert";
import LoadingSpinner from "../Components/LoadingSpinner";

function EditPost() {
  const { boardName, postIndex } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermissionAndFetch = async () => {
      try {
        const checkRes = await axios.post(
          `/api/v1/board/${boardName}/${postIndex}/check-edit`,
          { withCredentials: true }
        );

        if (!checkRes.data.success) {
          showAlert(checkRes.data.msg || "수정 권한이 없습니다.", "error");
          navigate(`/${boardName}`);
          return;
        }

        const postRes = await axios.get(`/api/v1/board/${boardName}/${postIndex}`, {
          withCredentials: true,
        });

        const post = postRes.data.post;
        setTitle(post.title);
        setContent(post.content);
        setLoading(false);
      } catch (err) {
        showAlert(err.response?.data?.msg || "데이터를 불러오는데 실패했습니다.", "error");
        navigate(`/${boardName}`);
      }
    };

    checkPermissionAndFetch();
  }, [boardName, postIndex, navigate, showAlert]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `/api/v1/board/${boardName}/${postIndex}/edit`,
        {
          title,
          content,
        },
        { withCredentials: true }
      );
      showAlert("글이 수정되었습니다.", "success");
      navigate(`/${boardName}/${postIndex}`);
    } catch (err) {
      showAlert(err.response?.data?.msg || "수정에 실패했습니다.", "error");
    }
  };
  
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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">{boardName} 게시판 글 수정</h2>
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
        <div className="flex justify-end gap-2">
           <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
           >
            수정
          </button>
          <button
            type="button"
            onClick={() => navigate(`/${boardName}/${postIndex}`)}
            className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditPost;

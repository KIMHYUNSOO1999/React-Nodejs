import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAlert } from "../Layout/SetAlert";
import LoadingSpinner from "../Components/LoadingSpinner";

function DetailPost() {
  const { boardName, postIndex } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [editCommentIndex, setEditCommentIndex] = useState(null); 
  const [editCommentContent, setEditCommentContent] = useState("");

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
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/api/v1/board/${boardName}/${postIndex}`);
        setPost(res.data.post);
      } catch (err) {
        setError("게시글을 찾을 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [boardName, postIndex]);

  useEffect(() => {
    if (!post) return;

    const fetchComments = async () => {
      setCommentLoading(true);
      try {
        const res = await axios.get(`/api/v1/comment/list`, {
          params: { boardType: boardName, postindex: Number(postIndex) },
        });

        if (res.data.success && Array.isArray(res.data.comments)) {
          setComments(res.data.comments);
        } else {
          setComments([]);
          showAlert(res.data.msg || "댓글을 불러오는 중 오류가 발생했습니다.", "error");
        }
      } catch (err) {
        showAlert("댓글을 불러오는 중 오류가 발생했습니다.", "error");
      } finally {
        setCommentLoading(false);
      }
    };

    fetchComments();
  }, [boardName, postIndex, post, showAlert]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      showAlert("댓글 내용을 입력하세요.", "error");
      return;
    }
    try {
      const res = await axios.post(
        `/api/v1/comment/create`,
        {
          boardType: boardName,
          postindex: Number(postIndex),
          content: newComment,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        setNewComment("");
        showAlert("댓글이 등록되었습니다.", "success");

        if (res.data.comment) {
          setComments((prev) => [...prev, res.data.comment]);
        }
      } else {
        showAlert(res.data.msg || "댓글 등록에 실패했습니다.", "error");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.msg === "만료된 토큰") {
      showAlert("로그인이 필요합니다.", "error");
      navigate("/login");
    } else {
      showAlert("댓글 등록 중 오류가 발생했습니다.", "error");
    }
    }
  };

const handleCommentDelete = async (commentIndex) => {
  if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

  try {
    const res = await axios.post(
      `/api/v1/comment/delete`,
      {
        boardType: boardName,
        postindex: Number(postIndex),
        commentIndex: commentIndex,
      },
      { withCredentials: true }
    );

    if (res.data.success) {
      showAlert("댓글이 삭제되었습니다.", "success");
      setComments((prev) => prev.filter((c) => c.index !== commentIndex));
    } else {
      showAlert(res.data.msg || "댓글 삭제에 실패했습니다.", "error");
    }
  } catch (err) {
    if (err.response?.data?.msg === "만료된 토큰") {
      showAlert("로그인이 필요합니다.", "error");
      navigate("/login");
    } else {
      showAlert("삭제 권한이 없습니다.", "error");
    }
  }
};

  const startEditComment = async (comment) => {
    try {
      const res = await axios.post(
        `/api/v1/comment/check-edit`,
        {
            boardType: boardName,
            postIndex: Number(postIndex),
            commentIndex: comment.index,
         },
        { withCredentials: true }
      );

      if (res.data.success) {
        setEditCommentIndex(comment.index);
        setEditCommentContent(comment.content);
      }
    } catch (error) {
      showAlert("수정 권한이 없습니다.", "error");
    }
  };

  const cancelEditComment = () => {
    setEditCommentIndex(null);
    setEditCommentContent("");
  };

 const handleEditCommentSubmit = async () => {
    if (!editCommentContent.trim()) {
      showAlert("댓글 내용을 입력하세요.", "error");
      return;
    }

    try {
      const res = await axios.post(
        `/api/v1/comment/edit`,
        {
          boardType: boardName,
          postindex: Number(postIndex),
          commentIndex: editCommentIndex,
          content: editCommentContent,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        showAlert("댓글이 수정되었습니다.", "success");
        setComments((prev) =>
          prev.map((comment) =>
            comment.index === editCommentIndex
              ? { ...comment, content: editCommentContent, editdate: new Date() }
              : comment
          )
        );
        cancelEditComment();
      } else {
        showAlert(res.data.msg || "수정 권한이 없습니다.", "error");
      }
    } catch (err) {
      if (err.response?.data?.msg === "만료된 토큰") {
        showAlert("로그인이 필요합니다.", "error");
        navigate("/login");
      } else {
        showAlert("댓글 수정 중 오류가 발생했습니다.", "error");
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) return;

    try {
      const res = await axios.post(
        `/api/v1/board/${boardName}/${postIndex}/delete`,
        {},
        { withCredentials: true }
      );

      if (res.status === 200 && res.data.success) {
        showAlert("게시글이 삭제되었습니다.", "success");
        setTimeout(() => {
          navigate(`/${boardName}`);
        }, 2000);
      } else {
        showAlert("삭제 권한이 없습니다.", "error");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.msg === "만료된 토큰") {
      showAlert("로그인이 필요합니다.", "error");
      navigate("/login");
      } else {
        showAlert("댓글 등록 중 오류가 발생했습니다.", "error");
      }
      showAlert("오류가 발생했습니다.", "error");
    }
  };

  const handleEdit = async () => {
    try {
      const res = await axios.post(
        `/api/v1/board/${boardName}/${postIndex}/check-edit`,
        {},
        { withCredentials: true }
      );

      if (res.status === 200 && res.data.success) {
        navigate(`/${boardName}/${postIndex}/edit`, { state: { post } });
      } else {
        showAlert("수정 권한이 없습니다.", "error");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.msg === "만료된 토큰") {
      showAlert("로그인이 필요합니다.", "error");
      navigate("/login");
    } else {
      showAlert("댓글 등록 중 오류가 발생했습니다.", "error");
    }
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
        <h2 className="text-xl font-bold text-red-500">{error}</h2>
        <Link
          to={`/${boardName}`}
          className="mt-4 font-bold text-blue-600 underline"
        >
          ← 게시판으로 돌아가기
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
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md border border-gray-300">
        <div className="border-b border-gray-300 px-6 py-4">
          <h1 className="text-3xl font-extrabold text-blue-600 break-words">
            {post.title}
          </h1>
          <div className="text-sm text-gray-500 mt-1">
            작성자: <span className="font-medium">{post.nickname}</span> |{" "}
            {formatDate(post.regdate)}
          </div>
        </div>

        <div className="px-6 py-6 text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
          {post.content}
        </div>

        <div className="border-t border-gray-300 px-6 py-6">
          <h2 className="text-sm font-semibold mb-4">댓글</h2>

          {commentLoading ? (
            <LoadingSpinner />
          ) : comments.length === 0 ? (
            ""
          ) : (
            <ul className="space-y-2">
              {comments.map((comment, i) => (
                <div key={comment.index}>
                  <li className="border rounded p-3 bg-gray-50">
                    <div className="flex justify-between items-center mb-1 text-xs text-gray-500">
                      <div className="font-medium">{comment.nickname}</div>
                      <div>
                        {formatDate(comment.editdate || comment.regdate)} |{" "}
                        {editCommentIndex === comment.index ? null : (
                          <>
                            <button
                              onClick={() => startEditComment(comment)}
                              className="text-blue-600 hover:underline px-1"
                              style={{ fontSize: "0.75rem" }}
                            >
                              수정
                            </button>
                            |
                            <button
                              onClick={() => handleCommentDelete(comment.index)}
                              className="text-red-600 hover:underline px-1"
                              style={{ fontSize: "0.75rem" }}
                            >
                              삭제
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="whitespace-pre-wrap break-words text-gray-700">
                      {editCommentIndex === comment.index ? (
                        <textarea
                          className="w-full border rounded p-2"
                          rows={3}
                          value={editCommentContent}
                          onChange={(e) => setEditCommentContent(e.target.value)}
                        />
                      ) : (
                        comment.content
                      )}
                    </div>

                    {editCommentIndex === comment.index && (
                      <div className="mt-2 flex gap-2 justify-end">
                        <button
                          onClick={handleEditCommentSubmit}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                        >
                          저장
                        </button>
                        <button
                          onClick={cancelEditComment}
                          className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 text-sm"
                        >
                          취소
                        </button>
                      </div>
                    )}
                  </li>
                  {i !== comments.length - 1 && (
                    <hr className="my-2 border-gray-300" />
                  )}
                </div>
              ))}
            </ul>
          )}

          <div className="mt-4 flex items-center gap-2">
            <input
              type="text"
              className="flex-grow border rounded px-3 py-1 text-sm"
              placeholder="댓글을 입력하세요..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleCommentSubmit();
                }
              }}
            />
            <button
              onClick={handleCommentSubmit}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              작성
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-300">
          <button
            onClick={() => navigate(`/${boardName}`)}
            className="text-blue-600 hover:underline text-sm"
          >
            ← 목록으로 돌아가기
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 text-sm"
            >
              수정
            </button>

            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 text-sm"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailPost;

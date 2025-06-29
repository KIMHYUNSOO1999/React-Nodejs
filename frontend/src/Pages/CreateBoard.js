import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { useAlert } from "../Layout/SetAlert";
import LoadingSpinner from "../Components/LoadingSpinner";

function CreateBoard() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();


  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/api/v1/user/auth", {
          withCredentials: true,
        });

        if (!res.data.admin) {
          showAlert("접근 권한이 없습니다.","error");
          navigate("/");
        } else {
          setLoading(false); 
        }
      } catch (err) {
        navigate("/"); 
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !type.trim()) {
      showAlert("모든 필드를 입력해주세요.","info");
      return;
    }

    try {
      const res = await axios.post(
        "/api/v1/board/create",
        { name, type },
        { withCredentials: true }
      );

      if (res.data.success) {
        showAlert("게시판이 생성되었습니다.","success");
        navigate("/");
      }
    } catch (err) {
      showAlert(
        err.response?.data?.msg || "게시판 생성 중 오류가 발생했습니다.",
        "error"
      );
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
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">게시판 생성</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">게시판 티거 (영문)</label>
          <input
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="예: game"
          />
        </div>
        <div>
          <label className="block font-medium">게시판 이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="예: 게임"
          />
        </div>
        <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          생성하기
        </button>
        </div>
      </form>
    </div>
  );
}

export default CreateBoard;

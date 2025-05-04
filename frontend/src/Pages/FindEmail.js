import { useState } from "react";
import axios from "axios";
import { useAlert } from "../Layout/SetAlert";
import LoadingSpinner from "../Components/LoadingSpinner"; 

function FindEmail() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showAlert } = useAlert();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/api/v1/auth/send-forgot", { email });
      setSent(true);
      showAlert("이메일로 변경 링크를 전송했습니다.", "success");
    } catch (err) {
      if (err.response?.data?.msg) {
        showAlert(err.response.data.msg, "error");
      } else {
        showAlert("이메일이 유효하지 않습니다.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 p-6 border rounded shadow space-y-4">
      <h2 className="text-xl font-bold">비밀번호 찾기</h2>

      {loading ? (
        <LoadingSpinner />
      ) : sent ? (
        <p className="text-green-600 p-4 font-semibold text-center">이메일을 성공적으로 발송했습니다.</p>
      ) : (
        <>
          <input
            type="email"
            className="w-full p-2 border rounded"
            placeholder="이메일 주소"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            이메일 발송
          </button>
        </>
      )}
    </form>
  );
}

export default FindEmail;

import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../Layout/SetAlert";

function Login({ onLogin }) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const navigate = useNavigate(); 
  const { showAlert } = useAlert();


  const onSubmit = async (e) => {
    e.preventDefault();
    try {

      await axios.post("/api/v1/user/login", { id, pw }, { withCredentials: true });
      const authRes = await axios.get("/api/v1/user/auth", { withCredentials: true });
      onLogin(authRes.data.user);
      window.location.replace("/");

    } catch (err) {

      showAlert("아이디/비밀번호를 확인해주세요.", "error");

    }
  };

  const goRegister = () => {
    navigate("/register");
  };

  const goFindEmail = () => {
    navigate("/find-email");
  };


  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto mt-10 p-6 border rounded shadow space-y-4">
      <h2 className="text-2xl font-bold">로그인</h2>
      <input
        className="w-full p-2 border rounded"
        placeholder="아이디"
        value={id}
        onChange={(e) => setId(e.target.value)}
        required
      />
      <input
        className="w-full p-2 border rounded"
        placeholder="비밀번호"
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        required
      />

      <p className="text-center text-sm text-gray-600">
        아직 회원가입을 안하셨나요?{" "}
        <span
          onClick={goRegister}
          className="text-green-600 font-semibold cursor-pointer hover:underline"
        >
          회원가입
        </span>
      </p>

      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
        로그인
      </button>

      <p className="text-center text-sm">
        <span
          onClick={goFindEmail}
          className="text-gray-600 font-semibold cursor-pointer hover:underline"
        >
          아이디/비밀번호 찾기
        </span>
      </p>
    </form>
  );
  
}

export default Login;

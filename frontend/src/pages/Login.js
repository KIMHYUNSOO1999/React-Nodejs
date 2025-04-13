import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login({ onLogin }) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const navigate = useNavigate(); 

  const onSubmit = async (e) => {
    e.preventDefault();
    try {

      const res = await axios.post("/api/v1/user/login", { id, pw }, { withCredentials: true });
      const authRes = await axios.get("/api/v1/user/auth", { withCredentials: true });
      onLogin(authRes.data.user);
      navigate("/");

    } catch (err) {

      alert("아이디/비밀번호를 확인해주세요.");

    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto mt-10 p-6 border rounded shadow space-y-4">
      <h2 className="text-2xl font-bold">로그인</h2>
      <input
        className="w-full p-2 border rounded"
        placeholder="아이디"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <input
        className="w-full p-2 border rounded"
        placeholder="비밀번호"
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
      />
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
        로그인
      </button>
    </form>
  );
  
}

export default Login;

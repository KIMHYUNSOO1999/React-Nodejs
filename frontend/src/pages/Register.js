import { useState } from "react";
import axios from "axios";

function Register() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("api/v1/user/signup", { id, pw });
      alert("회원가입 성공");
    } catch (err) {
      alert("이미 존재하는 아이디입니다.");
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto mt-10 p-6 border rounded shadow space-y-4">
      <h2 className="text-2xl font-bold">회원가입</h2>
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
      <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
        회원가입
      </button>
    </form>
  );
  
}

export default Register;

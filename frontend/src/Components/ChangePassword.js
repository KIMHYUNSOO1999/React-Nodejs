import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAlert } from "../Layout/SetAlert";

function ChangePassword({ onLogout }) {
  
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [step, setStep] = useState(1); 
  const { showAlert } = useAlert();

  const navigate = useNavigate();

  const checkCurrentPw = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "/api/v1/user/pwCheck",
        { pw: currentPw },
        { withCredentials: true }
      );
      if (res.data.success) {
        setStep(2);
      } else {
        showAlert("비밀번호 확인 실패", "error");
      }
    } catch (err) {
      showAlert("비밀번호를 확인해주세요", "error");
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();

    if (newPw !== confirmPw) {
      showAlert("새 비밀번호가 일치하지 않습니다.", "error");
      return;
    }

    try {
      const res = await axios.post(
        "/api/v1/user/pwChange",
        { newPw },
        { withCredentials: true }
      );
      if (res.data.success) {

        setStep(1);
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
        onLogout(); 
        navigate("/"); 
        
      } else {
        showAlert("비밀번호 변경 실패","error");
      }
    } catch (err) {
      showAlert("기존 비밀번호 일치", "error");
    }
  };

  return (
      <div className="max-w-md mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-center">비밀번호 변경</h2>

      {step === 1 && (
        <form onSubmit={checkCurrentPw} className="space-y-4">
          <input
            type="password"
            className="w-full p-2 border rounded"
            placeholder="현재 비밀번호"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            비밀번호 확인
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={changePassword} className="space-y-4">
          <input
            type="password"
            className="w-full p-2 border rounded"
            placeholder="새 비밀번호"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full p-2 border rounded"
            placeholder="새 비밀번호 확인"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
          >
            비밀번호 변경
          </button>
        </form>
      )}
    </div>
  );
}

export default ChangePassword;

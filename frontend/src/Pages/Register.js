import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import IdCheck from "../Components/IdCheck";
import NicknameCheck from "../Components/NicknameCheck"; 
import SendRegister from "../Components/SendRegister";
import VerifyRegister from "../Components/VerifyRegister";

import { useAlert } from "../Layout/SetAlert";

function Register() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showVerificationInput, setShowVerificationInput] = useState(false);

  const [isIdChecked, setIsIdChecked] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState("");

  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState("");

  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const handleEmailVerificationRequest = (verifiedEmail) => {
    setEmail(verifiedEmail);
    setShowVerificationInput(false);
    setTimeout(() => setShowVerificationInput(true), 10);
  };

  const handleVerificationComplete = () => {
    setIsEmailVerified(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!isIdChecked) {
        showAlert("아이디 중복 확인을 해주세요.", "error");
        return;
      }

      if (!isNicknameChecked) {
        showAlert("닉네임 중복 확인을 해주세요.", "error");
        return;
      }

      if (!isEmailVerified) {
        showAlert("이메일 인증을 완료해주세요.", "error");
        return;
      }

      await axios.post("api/v1/user/signup", {
        id,
        pw,
        email,
        nickname,
      });

      showAlert("회원가입 성공", "success");
      navigate("/");
    } catch (err) {
      showAlert("회원가입에 실패했습니다.", "error");
    }
  };

  const handleIdChange = (e) => {
    setId(e.target.value);
    setIsIdChecked(false);
    setIdCheckMessage("");
  };

  const handleIdCheckResult = (success, message) => {
    setIsIdChecked(success);
    setIdCheckMessage(message);
  };

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
    setIsNicknameChecked(false);
    setNicknameCheckMessage("");
  };

  const handleNicknameCheckResult = (success, message) => {
    setIsNicknameChecked(success);
    setNicknameCheckMessage(message);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-sm mx-auto mt-10 p-6 border rounded shadow space-y-4"
    >
      <h2 className="text-2xl font-bold">회원가입</h2>

      {/* 아이디 입력 + 중복확인 */}
      <div className="flex gap-2">
        <input
          className="w-full p-2 border rounded"
          placeholder="아이디"
          value={id}
          onChange={handleIdChange}
          required
        />
        <IdCheck id={id} onCheckResult={handleIdCheckResult} />
      </div>
      {idCheckMessage && (
        <p
          className={`text-sm ${
            isIdChecked ? "text-green-600" : "text-red-600"
          }`}
        >
          {idCheckMessage}
        </p>
      )}

      {/* 닉네임 입력 + 중복확인 */}
      <div className="flex gap-2">
        <input
          className="w-full p-2 border rounded"
          placeholder="닉네임"
          value={nickname}
          onChange={handleNicknameChange}
          required
        />
        <NicknameCheck nickname={nickname} onCheckResult={handleNicknameCheckResult} />
      </div>
      {nicknameCheckMessage && (
        <p
          className={`text-sm ${
            isNicknameChecked ? "text-green-600" : "text-red-600"
          }`}
        >
          {nicknameCheckMessage}
        </p>
      )}

      {/* 이메일 인증 요청 */}
      <SendRegister
        onVerificationRequest={handleEmailVerificationRequest}
        isEmailVerified={isEmailVerified}
      />

      {/* 이메일 인증 입력창 */}
      {showVerificationInput && !isEmailVerified && (
        <VerifyRegister
          email={email}
          onVerificationComplete={handleVerificationComplete}
        />
      )}

      {isEmailVerified && (
        <p className="text-sm text-green-600">이메일 인증이 완료되었습니다.</p>
      )}

      {/* 비밀번호 입력 */}
      <input
        className="w-full p-2 border rounded"
        placeholder="비밀번호"
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        required
      />

      {/* 회원가입 버튼 */}
      <button
        type="submit"
        className={`w-full text-white p-2 rounded ${
          isIdChecked && isNicknameChecked && isEmailVerified
            ? "bg-green-600 hover:bg-green-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
        disabled={!isIdChecked || !isNicknameChecked || !isEmailVerified}
      >
        회원가입
      </button>
    </form>
  );
}

export default Register;

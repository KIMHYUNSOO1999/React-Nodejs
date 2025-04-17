import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import IdCheck from "../Components/IdCheck";
import SendRegister from "../Components/SendRegister";
import VerifyRegister from "../Components/VerifyRegister";
import Alert from "../Components/Alert";

function Register() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [email, setEmail] = useState("");

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showVerificationInput, setShowVerificationInput] = useState(false);

  const [isIdChecked, setIsIdChecked] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState("");

  const [alert, setAlert] = useState(null);
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
        setAlert({ message: "아이디 중복 확인을 해주세요.", type: "error" });
        return;
      }

      if (!isEmailVerified) {
        setAlert({ message: "이메일 인증을 완료해주세요.", type: "error" });
        return;
      }

      await axios.post("api/v1/user/signup", { id, pw, email });
      setAlert({ message: "회원가입 성공", type: "success" });
      navigate("/");
    } catch (err) {
      setAlert({ message: "회원가입에 실패했습니다.", type: "error" });
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

  return (
    <>
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      <form
        onSubmit={onSubmit}
        className="max-w-sm mx-auto mt-10 p-6 border rounded shadow space-y-4"
      >
        <h2 className="text-2xl font-bold">회원가입</h2>

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

        <SendRegister
          onVerificationRequest={handleEmailVerificationRequest}
          isEmailVerified={isEmailVerified}
        />

        {showVerificationInput && !isEmailVerified && (
          <VerifyRegister
            email={email}
            onVerificationComplete={handleVerificationComplete}
          />
        )}

        {isEmailVerified && (
          <p className="text-sm text-green-600">이메일 인증이 완료되었습니다.</p>
        )}

        <input
          className="w-full p-2 border rounded"
          placeholder="비밀번호"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
        />

        <button
          type="submit"
          className={`w-full text-white p-2 rounded ${
            isIdChecked && isEmailVerified
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!isIdChecked || !isEmailVerified}
        >
          회원가입
        </button>
      </form>
    </>
  );
}

export default Register;

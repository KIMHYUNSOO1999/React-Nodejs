import { useState } from "react";
import axios from "axios";
import { useAlert } from "../Layout/SetAlert";

function SendRegister({ onVerificationRequest, isEmailVerified }) {
  const [emailId, setEmailId] = useState("");
  const [emailDomain, setEmailDomain] = useState("naver.com");
  const [isEmailSending, setIsEmailSending] = useState(false);
  const { showAlert } = useAlert();

  const email = `${emailId}@${emailDomain}`;

  const handleEmailVerification = async () => {
    try {
      if (!emailId) {
        showAlert("이메일을 입력해주세요","error");
        return;
      }
      setIsEmailSending(true);
      await axios.post("api/v1/auth/send-Register", { email });
      onVerificationRequest(email);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        showAlert("이미 인증된 이메일입니다.","error");
      } else {
        showAlert("이메일을 확인해주세요.","error");
      }
    } finally {
      setIsEmailSending(false);
    }
  };

  return (

      <div className="flex gap-2">
        <div className="flex gap-2 w-full">
          <input
            className="w-1/2 p-2 border rounded"
            placeholder="이메일"
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
            disabled={isEmailVerified}
            required
          />
          <select
            className="w-1/2 p-1 border rounded"
            value={emailDomain}
            onChange={(e) => setEmailDomain(e.target.value)}
            disabled={isEmailVerified}
          >
            <option value="naver.com">naver.com</option>
            <option value="gmail.com">gmail.com</option>
          </select>
        </div>
        <button
          type="button"
          onClick={handleEmailVerification}
          disabled={isEmailSending || isEmailVerified}
          className={`text-sm px-3 py-1 rounded whitespace-nowrap ${
            isEmailSending || isEmailVerified
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {isEmailSending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "인증요청"
          )}
        </button>
      </div>
  );
}

export default SendRegister; 
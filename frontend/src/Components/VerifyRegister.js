import { useState, useEffect } from "react";
import axios from "axios";
import { useAlert } from "../Layout/SetAlert";

function VerifyRegister({ email, onVerificationComplete }) {
  const [verificationCode, setVerificationCode] = useState("");
  const [timer, setTimer] = useState(180);
  const [timerActive, setTimerActive] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    let interval;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const formatTime = (seconds) => {

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    
  };

  const handleVerificationCheck = async () => {
    try {
      await axios.post("api/v1/auth/verify-register", {
        token: verificationCode
      });
      onVerificationComplete();
      setTimerActive(false);
    } catch (err) {
      showAlert("인증 코드가 올바르지 않습니다.","error");
    }
  };

  return (

      <div className="space-y-2">
        {timer > 0 && (
          <div className="flex gap-2">
            <input
              className="w-full p-2 border rounded"
              placeholder="인증코드"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <button
              type="button"
              onClick={handleVerificationCheck}
              className="text-sm px-3 py-1 rounded whitespace-nowrap bg-green-500 hover:bg-green-600 text-white"
            >
              인증확인
            </button>
          </div>
        )}

        <p className="text-sm text-red-600">
          {timer > 0
            ? `남은 시간: ${formatTime(timer)}`
            : "인증 시간이 만료되었습니다."}
        </p>
      </div>
  );
}

export default VerifyRegister;

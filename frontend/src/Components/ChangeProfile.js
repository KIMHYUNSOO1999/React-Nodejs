import { useState } from "react";
import axios from "axios";
import { useAlert } from "../Layout/SetAlert";
import NicknameCheck from "./NicknameCheck"; 
import { useNavigate  } from 'react-router-dom';

function ChangeProfile({ currentNickname, onUpdate }) {
  const [nickname, setNickname] = useState(currentNickname);
  const [nicknameValid, setNicknameValid] = useState(false);
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const handleCheckResult = (isValid, msg) => {
    setNicknameValid(isValid);
    showAlert(msg, isValid ? "success" : "error");
  };

  const handleUpdateNickname = async () => {
    try {
      const res = await axios.post(
        "/api/v1/user/change-profile",
        { newNickname : nickname},
        { withCredentials: true }
      );
      if (res.data.success) {
        showAlert("닉네임이 변경되었습니다.", "success");
        onUpdate(nickname); 
        navigate("/profile");
      } else {
        showAlert("닉네임 변경 실패", "error");
      }
    } catch (err) {
      showAlert("닉네임 변경 실패", "error");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-blue-600">프로필 수정</h3>
      <div className="flex gap-2">
        <div className="text-l font-semibold text-blue-800">닉네임</div>
        <input
          type="text"
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            setNicknameValid(false); 
          }}
          className="flex-1 p-2 border rounded"
        />
        <NicknameCheck nickname={nickname} onCheckResult={handleCheckResult} />
      </div>
      <button
        onClick={handleUpdateNickname}
        className="w-full text-white p-2 rounded bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={!nicknameValid}
      >
        변경 저장
      </button>
    </div>
  );
}

export default ChangeProfile;

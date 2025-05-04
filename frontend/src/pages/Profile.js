import { useEffect, useState } from "react";
import axios from "axios";
import ChangePassword from "../Components/ChangePassword";
import LoadingSpinner from "../Components/LoadingSpinner"; 
import { useAlert } from "../Layout/SetAlert";
import { useNavigate } from "react-router-dom";

function Profile({ onLogout }) {
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChangePw, setShowChangePw] = useState(false);
  const { showAlert } = useAlert();
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/v1/user/auth", {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (err) {
        showAlert("인증 실패", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow text-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow text-center">
        <h3 className="text-xl font-semibold text-red-600">
          로그인된 사용자가 없습니다.
        </h3>
      </div>
    );
  }

  const handleDeleteAccount = async () => {

    const isConfirmed = window.confirm("회원 탈퇴를 하시겠습니까?");
    
    if (!isConfirmed) {
      showAlert("회원 탈퇴가 취소되었습니다.", "info");
      return;
    }
  
    try {
      
      await axios.post("/api/v1/user/signoff", {}, { withCredentials: true });
      onLogout();
      navigate("/");
      showAlert("회원 탈퇴가 완료되었습니다.", "success");

    } catch (err) {

      if (err.response && err.response.data && err.response.data.msg) {
        showAlert(err.response.data.msg, "error");
      } 
      else {
        showAlert("회원 탈퇴 중 오류가 발생했습니다.", "error");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-5 p-6 border rounded shadow bg-white space-y-4">
      {!showChangePw ? (
        <>
          <h3 className="text-2xl font-bold text-blue-600 mb-2">
            닉네임: {user}
          </h3>
          <button
            onClick={() => setShowChangePw(true)}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            비밀번호 변경
          </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-700"
          >
            회원탈퇴
          </button>
        </>
      ) : (
        <ChangePassword onLogout={onLogout} />
      )}
    </div>
  );
}

export default Profile;

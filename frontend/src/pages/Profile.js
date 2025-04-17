import { useEffect, useState } from "react";
import axios from "axios";
import ChangePassword from "../Components/ChangePassword";
import LoadingSpinner from "../Components/LoadingSpinner"; 

function Profile({ onLogout }) {
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChangePw, setShowChangePw] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/v1/user/auth", {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (err) {
        console.log("인증 실패:", err.message);
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

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow bg-white space-y-4">
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
        </>
      ) : (
        <ChangePassword onLogout={onLogout} />
      )}
    </div>
  );
}

export default Profile;

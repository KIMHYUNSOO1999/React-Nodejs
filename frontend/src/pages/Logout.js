import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../Layout/SetAlert";

function Logout({ onLogout }) {

  const navigate = useNavigate(); 
  const { showAlert } = useAlert();
  const handleLogout = async () => {
    try {
      
      await axios.get("/api/v1/user/logout", {}, { withCredentials: true });
      onLogout(); 
      navigate("/");

    } catch (err) {

      showAlert("서버오류", "error");

    }
  };

  return (

    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
    >
      로그아웃
    </button>
    
  );
}

export default Logout;

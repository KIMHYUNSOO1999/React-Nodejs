import axios from "axios";

function IdCheck({ id, onCheckResult }) {
  
  const handleCheck = async () => {
    
    if (!id) {
      onCheckResult(false, "아이디를 입력해주세요.");
      return;
    }

    try {
      
      const res = await axios.post("/api/v1/user/idCheck", { id });
      
      if (res.data.success) {
        onCheckResult(true, "사용 가능한 아이디입니다.");
      } 

    } catch (err) {
      onCheckResult(false, "이미 사용 중인 아이디입니다.");
    }

  };

  return (
    <button
      type="button"
      onClick={handleCheck}
      className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 whitespace-nowrap"
    >
      중복확인
    </button>
  );
}

export default IdCheck;

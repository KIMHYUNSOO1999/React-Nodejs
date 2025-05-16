import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAlert } from "../Layout/SetAlert";
import LoadingSpinner from "../Components/LoadingSpinner";

const ResetPw = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { showAlert } = useAlert();

  const token = searchParams.get('token');
  const navigate = useNavigate();

  useEffect(() => {

    if (!token) {
      showAlert('유효하지 않은 링크입니다.', 'error');

    } 
    else {
      setLoading(true);
      axios.post('/api/v1/auth/check-email', { token })
        .then(response => {
          if (response.status === 200) {
          }
        })
        .catch(() => {
          showAlert('무효 또는 만료된 링크입니다.', 'error');
          navigate("/");
        })
        .finally(() => setLoading(false));
    }
  }, [token, navigate, showAlert]);

  const handleSubmit = async (e) => {

    e.preventDefault();
    setLoading(true);

    if (newPassword !== confirmPassword) {
      showAlert('비밀번호가 일치하지 않습니다.', 'error');
      setLoading(false);
      return;
    }

    try {
      
      const response = await axios.post('/api/v1/user/reset-password', {
        token,
        newPw: newPassword
      });

      if (response.status === 200) {
        showAlert('비밀번호가 성공적으로 변경되었습니다.', 'success');
        navigate('/login');
      }
    }
    catch (error) {
      showAlert('비밀번호 변경 중 오류가 발생했습니다.', 'error');
    }

    setLoading(false);
  };

  return (
    <div className="reset-password-container max-w-md mx-auto mt-10 p-6 border rounded shadow space-y-4">
      <h2 className="text-xl font-bold">비밀번호 변경</h2>

      {loading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block mb-1 font-medium">새 비밀번호</label>
            <input
              type="password"
              id="newPassword"
              className="w-full p-2 border rounded"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block mb-1 font-medium">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full p-2 border rounded"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            비밀번호 변경
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPw;

import { useEffect, useState } from "react";
import axios from "axios";

function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/v1/user/auth", { withCredentials: true });
        if (res.data.success) {
          setUser(res.data.user); 
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center px-4">
      <h1 className="text-4xl font-bold mb-4 text-blue-700">MAIN</h1>
    </div>
  );
}

export default Home;

import axios from "axios";
import { useEffect, useState } from "react";
import { serverUrl } from "../App";

function useGetCurrUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get(`${serverUrl}/user/get`, {
          withCredentials: true,
        });
        setUser(result.data.data); // adjust based on your ApiResponse shape
      } catch (error) {
        console.log(error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading };
}

export default useGetCurrUser;
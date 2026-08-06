import axios from "axios";
import { useEffect, useState } from "react";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

function useGetShop() {
  const dispatch=useDispatch();

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const result = await axios.get(`${serverUrl}/shop/get`, {
          withCredentials: true,
        });
        dispatch(setUserData(result.data.data));
      } catch (error) {
        console.log(error);
        dispatch(setUserData(null));
      }
    };

    fetchShop();
  }, []);

}

export default useGetShop;
import axios from "axios";
import { useEffect, useState } from "react";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setMyOrders, setUserData } from "../redux/userSlice";

function useGetMyOrders() {
  const dispatch=useDispatch();

  useEffect(() => {
    const fetchMyorders = async () => {
      try {
        const result = await axios.get(`${serverUrl}/order/myorders`, {
          withCredentials: true,
        });
        dispatch(setMyOrders(result.data.data));
      } catch (error) {
        console.log(error);
        dispatch(setMyOrders(null));
      }
    };

    fetchMyorders();
  }, []);

}

export default useGetMyOrders;
import axios from "axios";
import { useEffect, useState } from "react";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setItems } from "../redux/userSlice";


function useGetItemByCity() {
  const dispatch=useDispatch();
  const {currCity}=useSelector(state=>state.user)

  useEffect(() => {
    const fetchItemByCity = async () => {
      if(!currCity) return;
      try {
        const result = await axios.get(`${serverUrl}/item/getbycity/${currCity}`, {
          withCredentials: true,
        });
        dispatch(setItems(result.data.data));
        console.log(result.data.data);
      } catch (error) {
        console.log(error);
        dispatch(setItems(null));
      }
    };

    fetchItemByCity();
  }, [currCity]);

}

export default useGetItemByCity;
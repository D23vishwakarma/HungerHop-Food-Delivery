import axios from "axios";
import { useEffect, useState } from "react";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setShops } from "../redux/userSlice";


function useGetShopByCity() {
  const dispatch=useDispatch();
  const {currCity}=useSelector(state=>state.user)

  useEffect(() => {
    const fetchShopByCity = async () => {
      if(!currCity) return;
      try {
        const result = await axios.get(`${serverUrl}/shop/get-shops/${currCity}`, {
          withCredentials: true,
        });
        dispatch(setShops(result.data.data));
      } catch (error) {
        console.log(error);
        dispatch(setShops(null));
      }
    };

    fetchShopByCity();
  }, [currCity]);

}

export default useGetShopByCity;
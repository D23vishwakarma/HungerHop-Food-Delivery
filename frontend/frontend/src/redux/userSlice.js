import { createSlice } from "@reduxjs/toolkit";

const userSlice=createSlice({
    name:"user",
    initialState:{
        userData:null,
        currCity:null,
        currState:null,
        currAddress:null,
        shops:null
    },
    reducers:{
        setUserData:(state,action)=>{
            state.userData=action.payload
        },
        setCurrCity:(state,action)=>{
            state.currCity=action.payload
        },
        setCurrState:(state,action)=>{
            state.currState=action.payload
        },
        setCurrAddress:(state,action)=>{
            state.currAddress=action.payload
        },
        setShops:(state,action)=>{
            state.shops=action.payload
        }
    }
})
export const {setUserData,setCurrCity,setCurrState,setCurrAddress,setShops}=userSlice.actions
export default userSlice.reducer
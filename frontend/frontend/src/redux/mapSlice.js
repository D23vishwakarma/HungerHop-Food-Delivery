import { createSlice } from "@reduxjs/toolkit";

const mapSlice=createSlice({
    name:"map",
    initialState:{
        location:{
            lati:null,
            long:null
        },
        address:null
    },
    reducers:{
        setLocation:(state,action)=>{
            const {lati,long}=action.payload
            state.location.lati=lati
            state.location.long=long
        },
        setAddress:(state,action)=>{
            state.address=action.payload
        }
    }
})
export const {setLocation,setAddress}=mapSlice.actions
export default mapSlice.reducer
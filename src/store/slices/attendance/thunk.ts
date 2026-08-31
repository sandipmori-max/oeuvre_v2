import { createAsyncThunk } from "@reduxjs/toolkit";
import { DevERPService, AttendanceResponse } from "../../../services/api";

export const markAttendanceThunk = createAsyncThunk<
  AttendanceResponse,
  { type: any; rawData: any; user: any; id: any },
  { rejectValue: string }
>(
  "attendance/markAttendance",
  async ({ rawData, type, user, id }, { rejectWithValue }) => {
    try {
      const response = await DevERPService.markAttendance(
        rawData,
        type,
        user,
        id,
      );
      return response;
    } catch (error: any) {
      
      if(error?.message === 'Invalid Token'){
        return rejectWithValue("Please check your network and try again. You can tap Refresh or close and reopen the app");
      } else if(error?.message === 'Token Expire'){
       return rejectWithValue(
          "Your session has expired. Please log in again to continue."
        );
      } else{
        return rejectWithValue(error?.message || "Failed to mark attendacne");
      }
      // return rejectWithValue(error?.message || "Failed to mark attendance");
    }
  },
);

export const getLastPunchInThunk = createAsyncThunk<
  AttendanceResponse,
  void,
  { rejectValue: string }
>("attendance/getLastPunchIn", async (_, { rejectWithValue }) => {
  try {
    const response = await DevERPService.getLastPunchIn();
    return response;
  } catch (error: any) {
      if(error?.message === 'Invalid Token'){
        return rejectWithValue("Please check your network and try again. You can tap Refresh or close and reopen the app");
      } else if(error?.message === 'Token Expire'){
       return rejectWithValue(
          "Your session has expired. Please log in again to continue."
        );
      } else{
        return rejectWithValue(error?.message || "Failed to fetch last punch-in");
      }
    // return rejectWithValue(error?.message || "Failed to fetch last punch-in");
  }
});

export const getLastPunchInList = createAsyncThunk<
  AttendanceResponse,
  { id: any; fd: any; td: any },
  { rejectValue: string }
>(
  "attendance/getLastPunchInList",
  async ({ id, fd, td }, { rejectWithValue }) => {
    try {
      const response = await DevERPService.getLastPunchList(id, fd, td);
      return response;
    } catch (error: any) {
       if(error?.message === 'Invalid Token'){
        return rejectWithValue("Please check your network and try again. You can tap Refresh or close and reopen the app");
      } else if(error?.message === 'Token Expire'){
       return rejectWithValue(
          "Your session has expired. Please log in again to continue."
        );
      } else{
        return rejectWithValue(error?.message || "Failed to fetch last punch-in");
      }
      // return rejectWithValue(error?.message || "Failed to fetch last punch-in");
    }
  },
);

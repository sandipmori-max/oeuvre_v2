import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { Platform } from "react-native";
import { store } from "../../store/store";
import { logoutUserThunk, switchAccountThunk } from "../../store/slices/auth/thunk";
import { clearAuthState, setDashboard, setEmptyMenu } from "../../store/slices/auth/authSlice";
import { resetAjaxState } from "../../store/slices/ajax/ajaxSlice";
import { resetAttendanceState } from "../../store/slices/attendance/attendanceSlice";
import { resetDropdownState } from "../../store/slices/dropdown/dropdownSlice";
import { resetSyncLocationState } from "../../store/slices/location/syncLocationSlice";
import { setERPAppColor } from "../../utils/constants";
import { createAccountsTable, getActiveAccount, getDBConnection, logoutUser } from "../../utils/sqlite";
import { batch } from "react-redux";
import { activeControllers } from "../../../networkManager";
const ENV = {
  development: {
    BASE_URL:
      Platform.OS === "ios"
        ? "https://support.deverp.net"
        : "http://support.deverp.net",
    TIMEOUT: 1800000,
  },
  staging: {
    BASE_URL:
      Platform.OS === "ios"
        ? "https://support.deverp.net"
        : "http://support.deverp.net",
    TIMEOUT: 1800000,
  },
  production: {
    BASE_URL:
      Platform.OS === "ios"
        ? "https://support.deverp.net"
        : "http://support.deverp.net",
    TIMEOUT: 1800000,
  },
};

const getEnvVars = () => ENV.development;
const { BASE_URL, TIMEOUT } = getEnvVars();
 

export interface ApiResponse<T = any> {
  d?: string;
  success?: string | number;
  message?: string;
  data?: T;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  data?: any;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
  
});

function unwrapString(value: any): any {
  if (typeof value !== "string") return value;

  let current = value;
  while (true) {
    try {
      const parsed = JSON.parse(current);
      if (typeof parsed === "string") {
        current = parsed;
      } else {
        return parsed;
      }
    } catch {
      return current;
    }
  }
}

function deepClean(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(deepClean);
  } else if (obj !== null && typeof obj === "object") {
    const cleaned: any = {};
    for (const key in obj) {
      if (["Data", "footer"].includes(key)) {
        cleaned[key] = String(obj[key]);
      } else {
        cleaned[key] = deepClean(obj[key]);
      }
    }
    return cleaned;
  } else {
    return unwrapString(obj);
  }
}

apiClient.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
  const controller = new AbortController();
  config.signal = controller.signal;
  activeControllers.add(controller);

    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      return Promise.reject({
        message: "Please check your network and try again. You can tap Refresh or close and reopen the app",
        statusCode: 0,
      });
    }

    const token = await AsyncStorage.getItem("erp_token");
    if (token) {
      config.headers = {
        ...config?.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    return config;
  },
  (error) => {
    if (error.code === "ERR_CANCELED" || error === 'canceled' || error.code === 'canceled') {
      return Promise.reject({
        message: "Request cancelled due to network change, You can tap Refresh or close and reopen the app",
        statusCode: 0,
      });
    }
   return Promise.reject(error)},
   
);
const safeParse = (data: any) => {
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    return data;
  }
};

apiClient.interceptors.response.use(
  async (response: AxiosResponse<ApiResponse>) => {
     
    let raw = response?.data?.d;
    let parsedData = safeParse(safeParse(raw));
    // if ((parsedData?.success === "0" || parsedData?.success === 0) && parsedData?.message === "Invalid Token") {
    //   const db = await getDBConnection();
    //   await createAccountsTable(db);
    //   const activeUser = await getActiveAccount(db);
    //   const newActiveUser = await logoutUser(db, activeUser?.id);
    //   if (newActiveUser) {
    //     batch(() => {
    //       store.dispatch(setDashboard([]));
    //       store.dispatch(setEmptyMenu([]));
    //       store.dispatch(resetAjaxState());
    //       store.dispatch(resetAttendanceState());
    //       store.dispatch(clearAuthState());
    //       store.dispatch(resetDropdownState());
    //       store.dispatch(resetSyncLocationState());
    //       store.dispatch(resetAttendanceState());
    //       store.dispatch(switchAccountThunk(newActiveUser?.id));
    //     });

    //     return;
    //   }
    //   batch(() => {
    //     store.dispatch(setDashboard([]));
    //     store.dispatch(setEmptyMenu([]));
    //     store.dispatch(resetAjaxState());
    //     store.dispatch(resetAttendanceState());
    //     store.dispatch(clearAuthState());
    //     store.dispatch(resetDropdownState());
    //     store.dispatch(resetSyncLocationState());
    //     store.dispatch(resetAttendanceState());
    //     setERPAppColor('#1565C0');
    //     store.dispatch(logoutUserThunk());
    //   });

    //   return Promise.reject({
    //     message: parsedData?.message + " ---+++--- " + `${response?.config?.url?.split("/").filter(Boolean).pop()}` || "API request failed",
    //     statusCode: response?.status,
    //     data: {},
    //   });
    // }
    try {
      if (response.data && response.data.d) {
        let raw = response?.data?.d;
        let parsedData: any;
        try {
          if (typeof raw === "string") {
            let sanitized = raw.replace(/[\u0000-\u001F]+/g, "");
            sanitized = sanitized.replace(/^\uFEFF/, "");
            sanitized = sanitized.replace(/\\"/g, '"');
            sanitized = sanitized.replace(/\\\\n/g, "");
            sanitized = sanitized.replace(/\\\\/g, "");
            parsedData = JSON.parse(sanitized);
          } else if (typeof raw === "object") {
            parsedData = raw;
          } else {
            throw new Error("Unsupported response format");
          }
        } catch (error) {
          console.error("Error parsing API response:", error, "Raw response:", raw);
          if (typeof raw === "string" && raw.includes(",")) {
            const [successPart, ...msgParts] = raw.split(",");
            parsedData = {
              success: successPart.trim(),
              message: msgParts.join(",").trim(),
            };
          } else {
            parsedData = { message: raw };
          }
        }

        const cleanedData = deepClean(parsedData);

        if (String(cleanedData.success) !== "0") {
          return {
            ...response,
            data: cleanedData,
          };
        } else {
          return Promise.reject({
            message: cleanedData.message || "API request failed",
            statusCode: response.status,
            data: cleanedData,
          });
        }
      }
      return response;
    } catch (err) {
      return Promise.reject({
        message: "Invalid response format",
        statusCode: response?.status,
        data: response?.data,
      });
    }
  },
  (error) => {
    if (error?.response) {

      console.error("API Error Response: + + + + + + +", `${error}`);
      return Promise.reject({
        message: error?.response?.data?.message  || "Configuration missing / " + `${error?.response?.config?.url?.split("/").filter(Boolean).pop()}`,
        statusCode: error?.response?.status,
        data: error?.response?.data,
      });
    } else if (error?.request) {
      return Promise.reject({
        message: "No response from server, Check your network, then tap Refresh or reopen the app.",
        statusCode: 0,
      });
    } else {
      return Promise.reject({
        message: error?.message  || "Unknown error occurred" + "  " + `${error?.response?.config?.url?.split("/").filter(Boolean).pop()}`,
        statusCode: 0,
      });
    }
  },
);

export default apiClient;

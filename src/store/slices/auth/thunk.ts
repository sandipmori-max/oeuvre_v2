import { createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getDBConnection,
  createAccountsTable,
  insertAccount,
  updateAccountActive,
  getAccounts,
  getActiveAccount,
  removeAccount as sqliteRemoveAccount,
} from "../../../utils/sqlite";
import { Account, User } from "./type";
import { DevERPService } from "../../../services/api";
export const checkAuthStateThunk = createAsyncThunk(
  "auth/checkAuthState",
  async (_, { rejectWithValue }) => {
    try {
      const db = await getDBConnection();
      await createAccountsTable(db);

      // const accounts = await getAccounts(db);
      // const activeAccount = await getActiveAccount(db);

      // if (activeAccount?.user?.token && activeAccount?.user?.tokenValidTill) {
      //   const validTill =
      //     typeof activeAccount.user.tokenValidTill === "number"
      //       ? new Date(activeAccount.user.tokenValidTill * 1000)
      //       : new Date(activeAccount.user.tokenValidTill);

      //   if (validTill.getTime() > Date.now()) {
      //   console.error(" 👈 👈 👈 validTill validTill validTill: 👈👈👈👈 ---- -- - -- - - - - -", validTill); // 👈 added log
      //     DevERPService.setToken(activeAccount.user.token);
      //     return {
      //       accounts,
      //       activeAccountId: activeAccount.id,
      //       user: activeAccount.user,
      //     };
      //   }
      // }
      console.error(" 👈 👈 👈 getAuth getAuth getAuth: 👈👈👈👈 ---- -- - -- - - - - -"); // 👈 added log
      // 🔄 Token expired → try refresh
      try {
        const res = await DevERPService.getAuth();
        console.error(" 👈 👈 👈 res res res: 👈👈👈👈 ---- -- - -- - - - - -", res);
        if (res === 'token_expired') {
          return rejectWithValue("token_expired");
        }
      } catch (err: any) {
        // 👇 THIS is where you detect expiry / failure
        return rejectWithValue("token_expired");
      }

      const updatedAccounts = await getAccounts(db);
      const updatedActiveAccount = await getActiveAccount(db);
      DevERPService.setToken(updatedActiveAccount?.user?.token || "");
      return {
        accounts: updatedAccounts,
        activeAccountId: updatedActiveAccount?.id || null,
        user: updatedActiveAccount?.user || null,
      };

    } catch (error) {
      return rejectWithValue("Failed to check authentication state");
    }
  }
);

export const loginUserThunk = createAsyncThunk(
  "auth/loginUser",
  async (
    {
      newToken,
      newvalidTill,
      company_code,
      password,
      isAddingAccount = false,
      user_credentials,
      response,
      companyData,
    }: {
      company_code: string;
      password: string;
      isAddingAccount?: boolean;
      newToken?: string;
      newvalidTill?: string;
      user_credentials?: { user: string; name?: string };
      response;
      companyData;
    },
    { rejectWithValue },
  ) => {
    try {
      const token = isAddingAccount
        ? newToken
        : await AsyncStorage.getItem("erp_token");

      const tokenValidTill = isAddingAccount
        ? newvalidTill
        : await AsyncStorage.getItem("erp_token_valid_till");

      if (!token) {
        return rejectWithValue(
          "No authentication token found. Please login again.",
        );
      }

      await AsyncStorage.setItem("auth_token", token);

      const erpUser: User = {
        id: response?.userid || "",
        name:
          user_credentials?.name ||
          user_credentials?.user ||
          company_code.toUpperCase() ||
          "",
        company_code: company_code || "",
        avatar:
          `https://ui-avatars.com/api/?name=${(
            user_credentials?.name ||
            user_credentials?.user ||
            company_code
          ).toUpperCase()}&background=007AFF&color=fff` || "",
        accountType: "",
        token: token || "",
        tokenValidTill: tokenValidTill || "",
        emailid: response?.emailid || "",
        fullname: response?.fullname || "",
        mobileno: response?.mobileno || "",
        roleid: response?.roleid || "",
        rolename: response?.rolename || "",
        username: response?.username || "",
        companyLink: companyData?.response?.link || "",
        companyName: companyData?.response?.name || "",
        app_id: response?.app_id || "",
        password: password || "",
        faceDetectionRequired: response?.faceDetectionRequired || false
      };
      const db = await getDBConnection();
      await createAccountsTable(db);
      const currentAccounts = await getAccounts(db);
      const existingAccount = currentAccounts?.find(
        (acc: Account) => acc.user.company_code === company_code,
      );

      if (existingAccount && !isAddingAccount) {
        await updateAccountActive(db, existingAccount?.id);
        return {
          user: existingAccount.user,
          accountId: existingAccount.id,
          isNewAccount: false,
        };
      }

      const newAccount: Account = {
        id: erpUser?.id,
        user: erpUser,
        isActive: true,
        lastLoginAt: new Date().toISOString(),
      };

      for (const acc of currentAccounts ?? []) {
        await insertAccount(db, { ...acc, isActive: false });
      }

      await insertAccount(db, newAccount);
      await updateAccountActive(db, newAccount?.id);
      const updatedAccounts = await getAccounts(db);

      return {
        user: erpUser,
        accountId: erpUser?.id,
        isNewAccount: true,
        accounts: updatedAccounts,
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Login failed. Please try again.",
      );
    }
  },
);

export const switchAccountThunk = createAsyncThunk(
  "auth/switchAccount",
  async (accountId: string, { rejectWithValue }) => {
    try {
      const db = await getDBConnection();
      await createAccountsTable(db);

      await updateAccountActive(db, accountId);
      const accounts = await getAccounts(db);
      const targetAccount = accounts?.find(
        (acc: Account) => acc?.id === accountId,
      );

      if (!targetAccount) {
        return rejectWithValue("Account not found");
      }

      if (targetAccount?.user?.token) {
        const tokenValidTill = targetAccount.user.tokenValidTill;
        if (tokenValidTill) {
          const validTill = new Date(tokenValidTill);
          if (validTill > new Date()) {
            await AsyncStorage.setItem(
              "erp_token",
              targetAccount?.user?.token || "",
            );
            await AsyncStorage.setItem(
              "auth_token",
              targetAccount?.user?.token || "",
            );
            DevERPService.setToken(targetAccount?.user?.token);
            return {
              user: targetAccount.user,
              accountId,
              accounts,
            };
          }
        }
      }
      await DevERPService.getAuth();
      const updatedAccounts = await getAccounts(db);
      const updatedActiveAccount = await getActiveAccount(db);

      return {
        accounts: updatedAccounts,
        activeAccountId: updatedActiveAccount?.id || null,
        user: updatedActiveAccount?.user || null,
      };
    } catch (error) {
      return rejectWithValue("Failed to switch account");
    }
  },
);

export const removeAccountThunk = createAsyncThunk(
  "auth/removeAccount",
  async (accountId: string, { rejectWithValue }) => {
    try {
      const db = await getDBConnection();
      await createAccountsTable(db);
      await sqliteRemoveAccount(db, accountId);
      const updatedAccounts = await getAccounts(db);
      let newActiveAccountId = null;
      let newActiveAccount = null;
      if (updatedAccounts && updatedAccounts?.length > 0) {
        const wasActive = !updatedAccounts.some((acc) => acc.isActive);
        if (wasActive) {
          await updateAccountActive(db, updatedAccounts[0].id);
        }
        const activeAccount = await getActiveAccount(db);
        newActiveAccountId = activeAccount?.id || null;
        newActiveAccount = activeAccount?.user || null;
      }
      return {
        accounts: updatedAccounts,
        user: newActiveAccount,
        activeAccountId: newActiveAccountId,
      };
    } catch (error) {
      return rejectWithValue("Failed to remove account");
    }
  },
);

export const logoutUserThunk = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await DevERPService.clearData();
      await AsyncStorage.multiRemove([
        "auth_token",
        "refresh_token",
        "token_expires_at",
        "erp_link",
        "erp_token",
        "erp_token_valid_till",
        "erp_appid",
      ]);
      return { success: true };
    } catch (error) {
      await AsyncStorage.multiRemove([
        "auth_token",
        "refresh_token",
        "token_expires_at",
        "erp_link",
        "erp_token",
        "erp_token_valid_till",
        "erp_appid",
      ]);
      return { success: true };
    }
  },
);

export const validateCompanyCodeThunk = createAsyncThunk(
  "auth/validateCompanyCode",
  async (
    { companyCode, user }: { companyCode: string; user: string },
    { rejectWithValue },
  ) => {
    try {
      const result = await DevERPService.validateCompanyCode(companyCode, user);
      return result;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to validate company code",
      );
    }
  },
);

export const getERPMenuThunk = createAsyncThunk(
  "auth/getERPMenu",
  async (_, { rejectWithValue }) => {
    try {
      const response = await DevERPService.getMenu();

      if (response && typeof response === "string") {
        return response;
      } else if (response && typeof response === "object") {
        return response;
      }

      return rejectWithValue("Invalid menu response format");
    } catch (error: any) {
      if (error?.message === 'Invalid Token') {
        return rejectWithValue("Please check your network and try again. You can tap Refresh or close and reopen the app");
      } else {
        return rejectWithValue(error?.message || "Failed to get ERP menu");
      }

    }
  },
);

export const getERPAppConfigMenuThunk = createAsyncThunk(
  'auth/getERPAppConfigMenu',
  async (_, { rejectWithValue }) => {
    try {
      const response = await DevERPService.getAppMenu();
      console.log("response------------------=========================================", response)
      if (response && typeof response === 'string') {
        return response;
      } else if (response && typeof response === 'object') {
        return response;
      }

      return rejectWithValue('Invalid menu response format');
    } catch (error: any) {
      console.log("response---error---------------=======================", error)
      if (error?.message === 'Invalid Token') {
        return rejectWithValue("Please check your network and try again. You can tap Refresh or close and reopen the app");
      } else {
        return rejectWithValue(error?.message || "Failed to get ERP menu");
      }
      // return rejectWithValue(error?.message || 'Failed to get ERP menu');
    }
  },
);
type ERPDashboardParams = {
  branch: string;
  type: string;
  fd: string;
  td: string;
};

export const getERPDashboardThunk = createAsyncThunk(
  "auth/getERPDashboard",
  async ({ branch, type, fd, td }: ERPDashboardParams, { rejectWithValue }) => {
    try {
      if (branch === '' && type === '') {
        return []
      }
      console.log("#######dashboard----------- api. called with params +++++++++++++++", "branch----", branch, "type------", type, "fd-----", fd, "td-----", td)
      const dashboard = await DevERPService.getDashboard(branch, type, fd, td);
      console.log("dashboard-----------response----------", branch, type, fd, td, "-------", dashboard)
      return dashboard;
    } catch (error: any) {
      console.log("dashboard-----------error----------", error);
      if (error?.message === 'Invalid Token') {
        return rejectWithValue("Please check your network and try again. You can tap Refresh or close and reopen the app");
      } else {
        return rejectWithValue(error?.message || "Failed to get ERP Dashboard");
      }
      // return rejectWithValue(error?.message || "Failed to get ERP dashboard");
    }
  },
);

export const getERPPageThunk = createAsyncThunk<
  any,
  { page: string; id: string },
  { rejectValue: string }
>("auth/getERPPage", async ({ page, id }, { rejectWithValue }) => {
  try {
    const pageData = await DevERPService.getPage(page, id);
    return pageData;
  } catch (error: any) {
    if (error?.message === 'Invalid Token') {
      return rejectWithValue("Please check your network and try again. You can tap Refresh or close and reopen the app");
    } else {
      return rejectWithValue(error?.message || "Failed to get ERP page data");
    }
    // return rejectWithValue(error || "Failed to get ERP page data");
  }
});

export const getERPListDataThunk = createAsyncThunk(
  "auth/getERPListData",
  async (
    {
      page,
      fromDate,
      toDate,
      param,
      branch
    }: { page: string; fromDate: string; toDate: string; param: string, branch: string },
    { rejectWithValue },
  ) => {
    console.log("page,,,,fromDate,,,,toDate,,,,,param,,,,branch", page, fromDate, toDate)
    try {
      const listData = await DevERPService.getListData(
        page,
        fromDate,
        toDate,
        param,
        branch
      );
      return listData;
    } catch (error: any) {
      if (error?.message === 'Invalid Token') {
        return rejectWithValue("Please check your network and try again. You can tap Refresh or close and reopen the app");
      } else {
        return rejectWithValue(error?.message || "Failed to get ERP List data");
      }
      // return rejectWithValue(error?.message || "Failed to get ERP list data");
    }
  },
);


export const getERPConfigDataThunk = createAsyncThunk(
  "auth/getListConfig",
  async (
    {
      page,
    }: { page: string },
    { rejectWithValue },
  ) => {
    try {
      console.log("page =================", page)
      const listData = await DevERPService.getConfigData(
        page,
      );
      return listData;
    } catch (error: any) {
      console.log("error =================", error)
      if (error?.message === 'Invalid Token') {
        return rejectWithValue("Please check your network and try again. You can tap Refresh or close and reopen the app");
      } else {
        return rejectWithValue(error?.message || "Failed to get ERP list data");
      }
      // return rejectWithValue(error?.message || "Failed to get ERP list data");
    }
  },
);
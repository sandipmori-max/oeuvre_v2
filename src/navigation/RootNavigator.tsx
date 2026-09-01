import React, { useEffect, useState, useRef } from "react";
import {
  PermissionsAndroid,
  Platform,
  NativeModules,
  AppState,
  Linking,
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  checkAuthStateThunk,
  getERPAppConfigMenuThunk,
} from "../store/slices/auth/thunk";
import DevERPService from "../services/api/deverp";
import AuthNavigator from "./AuthNavigator";
import StackNavigator from "./StackNavigator";
import FullViewLoader from "../components/loader/FullViewLoader";
import DeviceInfo from "react-native-device-info";
import CustomAlert from "../components/alert/CustomAlert";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ERP_COLOR_CODE, setERPAppColor } from "../utils/constants";
import { changeLanguage } from "../i18n";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";
import { getLastPunchInThunk } from "../store/slices/attendance/thunk";
import { setReloadApp } from "../store/slices/reloadApp/reloadAppSlice";
import {
  setLoading,
  updateAppMenuList,
  updateAttendanceState,
  updatePinVerifyLoadedState,
} from "../store/slices/auth/authSlice";
import { useTranslation } from "react-i18next";
import NetInfo from "@react-native-community/netinfo";
import NoInternetScreen from "../screens/noInternet/NoInternet";
import { getActiveAccount, getDBConnection } from "../utils/sqlite";

// ------------------------- Location Permission Helper -------------------------
export async function requestLocationPermissions(): Promise<
  "granted" | "foreground-only" | "denied" | "blocked"
> {
  if (Platform.OS === "android") {
    const fine = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (fine === PermissionsAndroid.RESULTS.GRANTED) {
      // Android 9 and below
      if (Platform.Version < 29) {
        return "granted";
      }

      // Android 10+
      const background = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
      );

      return background === PermissionsAndroid.RESULTS.GRANTED
        ? "granted"
        : "foreground-only";
    }

    if (fine === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      return "blocked";
    }

    return "denied";
  }

  // -------------------- iOS --------------------
  const whenInUse = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

  if (whenInUse === RESULTS.GRANTED || whenInUse === RESULTS.LIMITED) {
    const always = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);

    return always === RESULTS.GRANTED
      ? "granted"
      : "foreground-only";
  }

  if (whenInUse === RESULTS.BLOCKED) {
    return "blocked";
  }

  return "denied";
}

// ------------------------- RootNavigator -------------------------
const RootNavigator = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const LOCATION_MESSAGES = {
    PERMISSION_DENIED: t("text1"),
    SERVICE_DISABLED: t("text2"),
  };
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const { isLoading, isAuthenticated, accounts, user, attendanceDone, appColorCode, attendanceSecurityLevel } =
    useAppSelector((state) => state.auth);

  const [forceLoader, setForceLoader] = useState(false);
  const { reLoading } = useAppSelector((state) => state.reloadApp);

  const langCode = useAppSelector((state) => state.theme.langcode);

  const [alertVisible, setAlertVisible] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);

  const [backgroundDeniedModal, setBackgroundDeniedModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "error" as "error" | "success" | "info" | "location",
  });

  const locationModalShownRef = useRef(false);
  const appState = useRef(AppState.currentState);

  const locationServiceIntervalRef = useRef(null);
  const gpsModalShownRef = useRef(false);
  const { appBottomMenuList, appDrawerMenuList } = useAppSelector((state) => state?.auth);
  const checkLocationServiceOnly = async () => {
    if (!isAuthenticated) return;

    const enabled = await DeviceInfo.isLocationEnabled();

    console.log("Location Service Enabled:", enabled);
    // GPS OFF → show modal once & stop features
    if (!enabled && !gpsModalShownRef.current) {
      setAlertConfig({
        title: t("test3"),
        message: LOCATION_MESSAGES.SERVICE_DISABLED,
        type: "location",
      });

      setAlertVisible(true);
      setOpenSettings(false);
      setBackgroundDeniedModal(false);

      gpsModalShownRef.current = true;
      locationModalShownRef.current = true; // reuse existing stop-flow logic
      return;
    }

    // GPS ON again → reset flags & resume
    if (enabled && gpsModalShownRef.current) {
      gpsModalShownRef.current = false;
      locationModalShownRef.current = false;
      setAlertVisible(false);
    }
  };

  const app_id = user?.app_id;
  const [noInterNet, setNoInterNet] = useState(false)
  // ------------------------- Device Setup -------------------------
  const init = async () => {
    setForceLoader(true)
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      setNoInterNet(true)
      return Promise.reject({
        message: "Please check your network and try again. You can tap Refresh or close and reopen the app",
        statusCode: 0,
      });
    }
    setNoInterNet(false)

    const name =
      Platform.OS === "ios"
        ? DeviceInfo.getModel() + " " + (await DeviceInfo.getUniqueId())
        : await DeviceInfo.getDeviceName();

    console.log("name", name);
    let appid = await AsyncStorage.getItem("appid");
    await new Promise(res => setTimeout(res, 600));

    if (!appid) {
      appid = app_id;
      await AsyncStorage.setItem("appid", appid || "");
    }
    await AsyncStorage.setItem("device", name);

    await DevERPService.initialize().then(async () => {
      DevERPService.setAppId(appid || "");
      DevERPService.setDevice(name);
      const db = await getDBConnection();
       const activeAccount = await getActiveAccount(db);
       if(activeAccount){
        DevERPService.setToken(activeAccount.user.token);
       }
      try {
        const state = await NetInfo.fetch();
        if (!state.isConnected) {
          return;
        }
        dispatch(setLoading(true));
        console.log("Checking auth state...");
        await dispatch(checkAuthStateThunk()).unwrap();
        await new Promise(res => setTimeout(res, 900));
        console.log("Auth state checked successfully.");
        if (isAuthenticated) {
          setERPAppColor(appColorCode)
          try {
            await dispatch(getLastPunchInThunk())
              .unwrap()
              .then((res) => {
                if (res?.success === 1 || res?.success === "1") {
                  dispatch(updateAttendanceState(true));
                } else {
                  dispatch(updateAttendanceState(false));
                }
              })
              .catch((err) => {
                dispatch(updateAttendanceState(false));
              });
          } catch (error) {
            dispatch(updateAttendanceState(false));
            console.log("error*******", error);
          }
          if (appDrawerMenuList.length === 0 || appBottomMenuList.length === 0) {
            try {
              await dispatch(getERPAppConfigMenuThunk());
            } catch (error) {
              dispatch(updateAppMenuList([]));
              console.log("Error fetching app config menu:", error);
            }
          }

        }
      } catch (err) {
        if (err === "token_expired") {
          console.log("Token expired during initialization. Logging out.");
          // 👉 logout logic here
        } else {
          console.log("Other error:", err);
        }
      } finally {
        dispatch(setLoading(false));
      }
    })
      .catch((err) => {
        console.log("Initialization failed", err);
      });
    setForceLoader(false)


  };

  useEffect(() => {

    init();
    return () => {
      dispatch(setReloadApp());
      dispatch(updatePinVerifyLoadedState(false));
    };
  }, []);

  // ------------------------- AppState Listener -------------------------
  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        if (attendanceDone) {
          dispatch(updateAttendanceState(true));
          checkLocation();
        } else {
          dispatch(updateAttendanceState(false));
        }
      }
      appState.current = nextAppState;
    };

    const sub = AppState.addEventListener("change", handleAppStateChange);
    return () => sub.remove();
  }, [isAuthenticated, reLoading, attendanceDone]);

useEffect(() => {
  if (!isAuthenticated) return;

  const checkAttendance = async () => {
    if (!attendanceDone) {
      dispatch(updateAttendanceState(false));
      return;
    }

    try {
      const res = await dispatch(getLastPunchInThunk()).unwrap();

      if (res?.success === 1 || res?.success === "1") {
        dispatch(updateAttendanceState(true));

        await checkLocation();
        checkLocationServiceOnly();
      } else {
        dispatch(updateAttendanceState(false));

        setAlertVisible(false);
        setOpenSettings(false);
        setBackgroundDeniedModal(false);

        // User actually punched out
        NativeModules.LocationModule.clearUserTokens?.();
        NativeModules.LocationModule.stopService();
      }
    } catch (error) {
      // Network/API error:
      // DON'T stop location service
      console.log("Punch status error", error);

      checkLocationServiceOnly();
    }
  };

  // Initial check immediately
  checkAttendance();

  // Check every 1 minute
  locationServiceIntervalRef.current = setInterval(() => {
    checkAttendance();
  }, 60 * 1000);

  return () => {
    if (locationServiceIntervalRef.current) {
      clearInterval(locationServiceIntervalRef.current);
      locationServiceIntervalRef.current = null;
    }
  };
}, [isAuthenticated, reLoading, attendanceDone]);

  // ------------------------- Language -------------------------
  useEffect(() => {
    changeLanguage(langCode);
  }, [langCode]);

  // ------------------------- Check Location -------------------------
  const checkLocation = async () => {
    if (!isAuthenticated) return;

    const enabled = await DeviceInfo.isLocationEnabled();

    const permission = await requestLocationPermissions();
    console.log("permission+++++++++++++++++++++++++++++++++++++++++++++++++++++++", permission);
    await new Promise(res => setTimeout(res, 400));
    if (enabled && permission === "granted") {
      locationModalShownRef.current = false;
      setAlertVisible(false);
      setBackgroundDeniedModal(false);

      if (accounts.length) {
        const data = accounts
          .map((u) => {
            if (user?.id.toString() === u?.user?.id.toString()) {
              return {
                token: u?.user?.token,
                link: u?.user?.companyLink.replace(/^https:\/\//i, "http://"),
              };
            }
            return null;
          })
          .filter(Boolean);

        NativeModules.LocationModule.setUserTokens(data);
        NativeModules.LocationModule.startService();
      }
      return;
    }

    if (
      permission === "foreground-only" &&
      Platform.OS === "android" &&
      Platform.Version >= 29
    ) {
      setBackgroundDeniedModal(true);
      setAlertVisible(false);
      return;
    }

    // ------------------------- Denied / Disabled Handling -------------------------
    if (!locationModalShownRef.current) {
      // CASE 1: Location service disabled (GPS OFF)
      if (!enabled) {
        setAlertConfig({
          title: t("test3"),
          message: LOCATION_MESSAGES.SERVICE_DISABLED,
          type: "location",
        });

        setAlertVisible(true);
        setOpenSettings(false);
        setBackgroundDeniedModal(false); // ❌ no Open Settings modal
        locationModalShownRef.current = true;
        return;
      }

      // CASE 2: Permission denied or blocked
      if (permission === "denied" || permission === "blocked") {
        setAlertConfig({
          title: "Permission Denied",
          message: LOCATION_MESSAGES.PERMISSION_DENIED,
          type: "location",
        });

        setAlertVisible(true);
        setOpenSettings(true);
        setBackgroundDeniedModal(false); // ❌ background modal not needed here
        locationModalShownRef.current = true;
        return;
      }
    }
  };

    useEffect(() => {
    if (!isAuthenticated) return;
    locationServiceIntervalRef.current = setInterval(() => {
      if (attendanceDone) {
        dispatch(updateAttendanceState(true));
        checkLocationServiceOnly();
      } else {
        dispatch(updateAttendanceState(false));
      }
    }, 1000);

    return () => {
      // Cleanup on logout / unmount
      if (locationServiceIntervalRef.current) {
        clearInterval(locationServiceIntervalRef.current);
        locationServiceIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, reLoading, attendanceDone]);

 // ------------------------- Focus -------------------------
  useEffect(() => {
    if (!isAuthenticated) return;

    setERPAppColor(appColorCode);

    const checkPunchStatus = async () => {
      try {
        const res = await dispatch(getLastPunchInThunk()).unwrap();
        if (res?.success === 1 || res?.success === "1") {
          dispatch(updateAttendanceState(true));
          await checkLocation();
        } else {

          dispatch(updateAttendanceState(false));
          setAlertVisible(false);
          setOpenSettings(false);
          setBackgroundDeniedModal(false);
          // clear tokens and stop service only when user is actually punched out
          NativeModules.LocationModule.clearUserTokens?.();
          NativeModules.LocationModule.stopService();
        }

      } catch (error) {
        NativeModules.LocationModule.clearUserTokens?.();
        NativeModules.LocationModule.stopService();
        // ❌ IMPORTANT:
        // network error par service stop mat karo
        console.log("Punch status error", error);
      }
    };

    // run immediately
    checkPunchStatus();

    // then repeat every 30 sec (3 sec bahut aggressive hai)
    const interval = setInterval(checkPunchStatus, 30000);

    return () => clearInterval(interval);

  }, [isAuthenticated, appColorCode, attendanceDone, reLoading]);
  // ------------------------- Render -------------------------
  if (isLoading || forceLoader) return <FullViewLoader />;

  return (
    <>
      {
        noInterNet && <View style={[StyleSheet.absoluteFillObject, { zIndex: 1000 }]}>
          <NoInternetScreen onRetry={() => { }} />
        </View>
      }
      {
        forceLoader ? <>
          <FullViewLoader />
        </> : <>

          {isAuthenticated ? <StackNavigator /> : <AuthNavigator />}
          {isAuthenticated && (
            <CustomAlert
              visible={alertVisible}
              title={alertConfig.title}
              message={alertConfig.message}
              type={alertConfig.type}
              onClose={() => {
                // setAlertVisible(true)
              }}
              isSettingVisible={openSettings}
              actionLoader={undefined}
              closeHide={true}
            />
          )}
          {isAuthenticated && (
            <Modal
              visible={backgroundDeniedModal}
              supportedOrientations={["portrait", "landscape"]}
              transparent
            >
              <View
                style={[
                  styles.overlay,
                  isLandscape && {
                    alignContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <View style={[styles.modalContainer, {}]}>
                  <Text style={styles.title}>{t("test21")}</Text>
                  <Text style={styles.message}>{t("test22")}</Text>
                  <TouchableOpacity
                    style={styles.btnPrimary}
                    onPress={() => Linking.openSettings()}
                  >
                    <Text style={styles.btnText}>{t("test23")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
        </>
      }
    </>
  );
};

export default RootNavigator;

// ------------------------- Styles -------------------------
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "85%",
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    textAlign: "center",
    marginBottom: 16,
  },
  btnPrimary: {
    backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
    padding: 12,
    borderRadius: 10,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
});

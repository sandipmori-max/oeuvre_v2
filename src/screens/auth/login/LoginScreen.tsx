import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  ImageBackground,
  useWindowDimensions,
} from "react-native";
import DeviceInfo from "react-native-device-info";

import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getERPAppConfigMenuThunk, loginUserThunk } from "../../../store/slices/auth/thunk";
import CustomAlert from "../../../components/alert/CustomAlert";
import useTranslations from "../../../hooks/useTranslations";
import { styles } from "./login_style";
import LoginHeader from "./components/LoginHeader";
import LoginForm from "./components/LoginForm";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ERP_COLOR_CODE } from "../../../utils/constants";
import { setReloadApp } from "../../../store/slices/reloadApp/reloadAppSlice";
import { ERP_GIF } from "../../../assets";
import { updateAppMenuList } from "../../../store/slices/auth/authSlice";
import { requestAndroidPermission, requestNotificationPermission } from "../../../utils/helpers";
import messaging from "@react-native-firebase/messaging";

const LoginScreen = ({ navigation, route }: any) => {
  const { t } = useTranslations();
  const dispatch = useAppDispatch();
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;

  const isAddingAccount = route?.params?.isAddingAccount || false;
  const { isLoading } = useAppSelector((state) => state.auth);
  const theme = useAppSelector((state) => state?.theme.mode);

  const [deviceId, setDeviceId] = useState<string>("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "error" | "success" | "info",
  });
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const isIpad =
    (Platform.OS === "ios" && Platform.isPad) || DeviceInfo.isTablet() || Platform.isTV;
  useEffect(() => {
    const fetchDeviceName = async () => {
      const name = Platform.OS === 'ios' ? DeviceInfo.getModel() + " " + await DeviceInfo.getUniqueId() : await DeviceInfo.getDeviceName();
      setDeviceId(name);
      AsyncStorage.setItem("device", name);
    };
    fetchDeviceName();

    const keyboardDidShow = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height + 10);
    });
    const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);


  const setupNotification = async () => {
    try {
      let granted = false;

      if (Platform.OS === "android") {
        granted = await requestAndroidPermission();
      } else {
        granted = await requestNotificationPermission();
      }

      // if (!granted) {
      //   console.log("Permission not granted");
      //   return;
      // }

    } catch (error) {
      console.log(error);
    }
  };

  const handlePersistAfterLogin = async (
    company_code: string,
    password: string,
    user_credentials: { user: string; name?: string },
    response: any,
    companyData: any,
  ) => {
    await setupNotification();
    dispatch(
      loginUserThunk({
        company_code,
        password,
        isAddingAccount,
        user_credentials,
        response,
        companyData,
      }),
    );
    try {
      await dispatch(getERPAppConfigMenuThunk());
    } catch (error) {
      dispatch(updateAppMenuList([])); // Clear menu on error
      console.log("Error fetching app config menu:", error);
    }
    setTimeout(() => {
      dispatch(setReloadApp());
    }, 1000);
  };

  const showAlert = (config: {
    title: string;
    message: string;
    type: "error" | "success" | "info";
  }) => {
    setAlertConfig(config);
    setAlertVisible(true);
  };
  const pressAnim = useRef(new Animated.Value(1)).current;
  const onPressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 4,
      tension: 150,
      useNativeDriver: true,
    }).start();
  };

  return (

    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: ERP_COLOR_CODE.ERP_WHITE }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ImageBackground
          source={theme === "dark" ? "" : ERP_GIF.BACK_IMG}
          style={{
            height: Dimensions.get("screen").height,
            width: Dimensions.get("screen").width,
          }}
          resizeMode="cover"
        >
          <FlatList
            data={[""]}
            bounces={false}

            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: keyboardHeight / 2 || 20,
            }}
            renderItem={() => (
              <>
                <View
                  style={[
                    styles.formContainer,

                    isIpad && {
                      padding: 80,
                    }
                  ]}
                >
                  {isLandscape ? (
                    <>
                      <View
                        style={{
                          flexDirection: "row",
                          alignContent: "center",
                          alignItems: "center",
                          justifyContent: "center",


                        }}
                      >
                        <View
                          style={{
                            left: -40,
                            width: "40%",
                          }}
                        >
                          <LoginHeader
                            isAddingAccount={isAddingAccount}
                            t={t}
                          />
                        </View>

                        <View
                          style={{
                            width: "35%",
                            left: -20,
                            right: 10,
                          }}
                        >
                          <LoginForm
                            deviceId={deviceId}
                            isAddingAccount={isAddingAccount}
                            isLoading={isLoading}
                            onLoginSuccess={handlePersistAfterLogin}
                            showAlert={showAlert}
                          />
                        </View>
                      </View>
                    </>
                  ) : (
                    <View  >
                      <LoginHeader isAddingAccount={isAddingAccount} t={t} />
                      <LoginForm
                        deviceId={deviceId}
                        isAddingAccount={isAddingAccount}
                        isLoading={isLoading}
                        onLoginSuccess={handlePersistAfterLogin}
                        showAlert={showAlert}
                      />
                      {isAddingAccount && (
                        <Animated.View
                          style={{
                            transform: [{ scale: pressAnim }],
                          }}
                        >
                          <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.8}
                            onPressIn={onPressIn}
                            onPressOut={onPressOut}
                          >
                            <Text style={styles.cancelButtonText}>
                              {t("auth.cancel")}
                            </Text>
                          </TouchableOpacity>
                        </Animated.View>
                      )}
                    </View>
                  )}
                </View>
              </>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </ImageBackground>
        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setAlertVisible(false)}
          actionLoader={undefined}
          closeHide={undefined}
        />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;

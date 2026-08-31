import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
  FlatList,
  Animated,
  Easing,
  Platform,
  ImageBackground,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  useWindowDimensions,
} from "react-native";
import { Formik } from "formik";

import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getERPAppConfigMenuThunk,
  loginUserThunk,
} from "../../../store/slices/auth/thunk";

import { styles } from "./add_account_style";
import { erpAddAccountValidationSchema } from "../../../utils/validations/add_accounts";
import { AddAccountScreenProps } from "./type";
import { ERP_GIF, ERP_ICON } from "../../../assets";
import { DevERPService } from "../../../services/api";
import { useApi } from "../../../hooks/useApi";
import CustomAlert from "../../../components/alert/CustomAlert";
import { getMessaging } from "@react-native-firebase/messaging";
import useFcmToken from "../../../hooks/useFcmToken";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DeviceInfo from "react-native-device-info";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { useTranslation } from "react-i18next";
import { ERP_COLOR_CODE } from "../../../utils/constants";
import {
  clearAuthState,
  setBirthdayUsers,
  setDashboard,
  setEmptyMenu,
  updateAppMenuList,
} from "../../../store/slices/auth/authSlice";
import { resetAjaxState } from "../../../store/slices/ajax/ajaxSlice";
import { resetAttendanceState } from "../../../store/slices/attendance/attendanceSlice";
import { resetDropdownState } from "../../../store/slices/dropdown/dropdownSlice";
import { resetSyncLocationState } from "../../../store/slices/location/syncLocationSlice";
import { setReloadApp } from "../../../store/slices/reloadApp/reloadAppSlice";
import { generateGUID } from "../../../utils/helpers";
import { useBaseLink } from "../../../hooks/useBaseLink";
import FastImage from "react-native-fast-image";

const AddAccountScreen: React.FC<AddAccountScreenProps> = ({
  visible,
  onClose,
  isSwitchAccountOpen,
}) => {
  const { t } = useTranslation();
  const baseLink = useBaseLink();
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state?.theme.mode);

  const { execute: validateCompanyCode, execute: loginWithERP } = useApi();
  const { accounts, user } = useAppSelector((state) => state.auth);
  const { token: fcmToken } = useFcmToken();
  const [imageExists, setImageExists] = useState(true);

  const [isInputEditCC, setIsInputEditCC] = useState(false);
  const [isInputEditUSer, setIsInputEditUser] = useState(false);
  const [isInputEditPass, setIsInputEditPass] = useState(false);

  const [deviceId, setDeviceId] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [loader, setLoader] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "error" | "success" | "info",
  });

  // Animated values
  const slideAnim = useRef(new Animated.Value(0)).current; // modal
  const formAnim = useRef(new Animated.Value(0)).current; // form container
  const buttonAnim = useRef(new Animated.Value(0)).current; // Add button
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const isIpad =
    (Platform.OS === "ios" && Platform.isPad) || DeviceInfo.isTablet() || Platform.isTV;

  useEffect(() => {
    setLoader(false);
  }, [visible]);

  useEffect(() => {
    return () => {
      setIsInputEditCC(false);
      setIsInputEditUser(false);
      setIsInputEditPass(false);
    };
  }, []);

  useEffect(() => {
    const fetchDeviceName = async () => {
      const name =
        Platform.OS === "ios"
          ? DeviceInfo.getModel() + " " + (await DeviceInfo.getUniqueId())
          : await DeviceInfo.getDeviceName();
      setDeviceId(name);
      AsyncStorage.setItem("device", name);
    };
    fetchDeviceName();
  }, []);

  // Animate modal, form, and button
  useEffect(() => {
    if (visible) {
      slideAnim.setValue(0);
      formAnim.setValue(0);
      buttonAnim.setValue(0);

      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      Animated.timing(formAnim, {
        toValue: 1,
        duration: 600,
        delay: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 600,
        delay: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim, formAnim, buttonAnim]);

  const handleClose = () => {
    setLoader(false);
    setAlertVisible(false);

    Animated.parallel([
      Animated.timing(buttonAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(formAnim, {
        toValue: 0,
        duration: 750,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 950,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 850,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      DevERPService.setAppId(user?.app_id);
      DevERPService.setToken(user?.token);
      await AsyncStorage.setItem("erp_token", user?.token || "");
      await AsyncStorage.setItem("auth_token", user?.token || "");
      await AsyncStorage.setItem(
        "erp_token_valid_till",
        user?.tokenValidTill || "",
      );

      DevERPService.setAppId(user?.app_id || "");
      const validation = await validateCompanyCode(() =>
        DevERPService.validateCompanyCode(user?.company_code),
      );
      const currentFcmToken =
        Platform.OS === "ios"
          ? ""
          : fcmToken || (await getMessaging().getToken());
      const loginResult = await loginWithERP(() =>
        DevERPService.loginToERP({
          user: user?.username,
          pass: user?.password,
          firebaseid: currentFcmToken,
        }),
      );
      DevERPService.setToken(loginResult?.token);
      await AsyncStorage.setItem("erp_token", loginResult?.token || "");
      await AsyncStorage.setItem("auth_token", loginResult?.token || "");
      await AsyncStorage.setItem(
        "erp_token_valid_till",
        loginResult?.tokenValidTill || "",
      );
      onClose();
    });
  };

  const handleAddAccount = async (values: {
    company_code: string;
    user: string;
    password: string;
  }) => {
    try {
      DevERPService.setDevice(deviceId);
      setLoader(true);
      const accountExists = accounts?.some(
        (acc) =>
          acc?.user?.name === values?.user &&
          acc?.user?.company_code === values?.company_code,
      );
      if (accountExists) {
        setAlertConfig({
          title: t("test5"),
          message: t("msg.msg1"),
          type: "error",
        });
        setAlertVisible(true);
        return;
      }
      const app_id = generateGUID();
      await AsyncStorage.setItem("appid", app_id);
      DevERPService.setAppId(app_id || "");
      const validation = await validateCompanyCode(() =>
        DevERPService.validateCompanyCode(values?.company_code),
      );
      if (!validation?.isValid) {
        setLoader(false);
        return;
      }
      let currentFcmToken = '';
      const androidVersion = parseInt(DeviceInfo.getSystemVersion(), 10);

      if (androidVersion <= 9 && Platform.OS !== 'ios') {
        currentFcmToken = fcmToken || (await getMessaging().getToken()) || '';
      } else if (androidVersion >= 10 && Platform.OS !== 'ios') {
        currentFcmToken = fcmToken || (await getMessaging().getToken())
      } else {
        currentFcmToken = '';
      }

      const loginResult = await loginWithERP(() =>
        DevERPService.loginToERP({
          user: values?.user,
          pass: values?.password,
          firebaseid: currentFcmToken,
        }),
      );

      if (loginResult?.success !== 1) {
        DevERPService.setAppId(user?.app_id);
        DevERPService.setToken(user?.token);
        await AsyncStorage.setItem("erp_token", user?.token || "");
        await AsyncStorage.setItem("auth_token", user?.token || "");
        await AsyncStorage.setItem(
          "erp_token_valid_till",
          user?.tokenValidTill || "",
        );
        await validateCompanyCode(() =>
          DevERPService.validateCompanyCode(user?.company_code),
        );
        const currentFcmToken =
          Platform.OS === "ios"
            ? ""
            : fcmToken || (await getMessaging().getToken());
        const loginResult = await loginWithERP(() =>
          DevERPService.loginToERP({
            user: user?.username,
            pass: user?.password,
            firebaseid: currentFcmToken,
          }),
        );
        DevERPService.setToken(loginResult?.token);
        await AsyncStorage.setItem("erp_token", loginResult?.token || "");
        await AsyncStorage.setItem("auth_token", loginResult?.token || "");
        await AsyncStorage.setItem(
          "erp_token_valid_till",
          loginResult?.tokenValidTill || "",
        );
        setAlertVisible(true);
        setLoader(false);
        setAlertConfig({
          title: t("test4"),
          message: loginResult?.message || t("msg.msg2"),
          type: "error",
        });
        return;
      }
      dispatch(setBirthdayUsers([]));
      dispatch(setDashboard([]));
      dispatch(setEmptyMenu([]));
      dispatch(resetAjaxState());
      dispatch(resetAttendanceState());
      dispatch(clearAuthState());
      dispatch(resetDropdownState());
      dispatch(resetSyncLocationState());
      DevERPService.setToken(loginResult?.token);
      await AsyncStorage.setItem("erp_token", loginResult?.token || "");
      await AsyncStorage.setItem("auth_token", loginResult?.token || "");
      await AsyncStorage.setItem(
        "erp_token_valid_till",
        loginResult?.tokenValidTill || "",
      );

      dispatch(
        loginUserThunk({
          newToken: loginResult?.token,
          newvalidTill: loginResult?.validtill,
          company_code: values?.company_code,
          password: values?.password,
          isAddingAccount: true,
          user_credentials: { user: values?.user, name: values?.user },
          response: loginResult,
          companyData: validation,
        }),
      );
      setAlertConfig({
        title: t("title.title3"),
        message: t("msg.msg3"),
        type: "success",
      });
      setAlertVisible(true);
      onClose();
      setLoader(false);
      try {
        await dispatch(getERPAppConfigMenuThunk());
      } catch (error) {
        dispatch(updateAppMenuList([])); // Clear menu on error
        console.log("Error fetching app config menu:", error);
      }

      setTimeout(() => {
        dispatch(setReloadApp());
      }, 1000);
    } catch (e: any) {
      setAlertConfig({
        title: t("title.title1"),
        message: e?.message || t("msg.msg4"),
        type: "error",
      });
      setAlertVisible(true);
      setLoader(false);
    }
  };

  const ccErrorAnim = useRef(new Animated.Value(0)).current;
  const userErrorAnim = useRef(new Animated.Value(0)).current;
  const passErrorAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.86,
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

  useEffect(() => {
    Image.prefetch(`${baseLink}fileupload/1/InvoiceByConfig/1/logo.jpg`)
      .then(() => setImageExists(true))
      .catch(() => setImageExists(false));
  }, [baseLink]);

  return (
    <Modal
      visible={visible}
      transparent
      supportedOrientations={["portrait", "landscape"]}
      onRequestClose={handleClose}
    >
      <ImageBackground
        source={theme === "dark" ? "black" : ERP_GIF.BACK_IMG}
        style={[{
          height: Dimensions.get("screen").height,
        },
        ]}
        resizeMode="cover"
      >
        <View
          style={[
            styles.header,
            theme === "dark" && { backgroundColor: "black" },
            isLandscape && {
              marginTop: 10,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              handleClose();
            }}
            style={styles.closeButton}
          >
            {Platform.OS === "ios" ? (
              <>
                <MaterialIcons
                  name="chevron-left"
                  size={28}
                  color={theme === "dark" ? "white" : "#000"}
                />
              </>
            ) : (
              <Image source={ERP_ICON.BACK} style={styles.back} />
            )}
          </TouchableOpacity>
          <Text
            style={[
              styles.title,
              {
                color: theme === "dark" ? "white" : "black",
              },
            ]}
          >
            {t("account.addAccount")}
          </Text>
        </View>
        <View style={{ height: 34 }}></View>
        {isLandscape ? (
          <>
            <View style={[
              { flexDirection: "row" }, isIpad && {
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
                padding: 40,
              }]}>
              <View
                style={{
                  width: "46%",
                  padding: 2,
                  justifyContent: "center",
                  alignContent: "center",
                  alignItems: "center",
                }}
              >
                <>
                  <View
                    style={{
                      alignContent: "center",
                      alignSelf: "center",
                      borderRadius: 20,
                      height: 100,
                      width: 140,
                      marginBottom: 12,
                      backgroundColor: "white",
                    }}
                  >
                    <FastImage
                      source={
                        !imageExists
                          ? ERP_ICON.APP_LOGO
                          : {
                            uri: `${baseLink}fileupload/1/InvoiceByConfig/1/logo.jpg`,
                          }
                      }
                      // source={ERP_ICON.APP_LOGO}
                      style={[
                        styles.logo,
                        {
                          marginTop: 0,
                        },
                      ]}
                      onError={() => {
                        setImageExists(false);
                      }}
                      resizeMode="contain"
                    />
                  </View>

                  <Text
                    style={[
                      styles.subtitle,
                      theme === "dark" && { color: "white" },
                    ]}
                  >
                    {t("account.msg")}
                  </Text>

                  <Text style={styles.note}>{t("account.msg1")}</Text>
                </>
              </View>

              <View style={{ width: "50%", height: isIpad ? 450 : 320, padding: 2 }}>
                <KeyboardAvoidingView
                  style={{ flex: 1 }}
                  behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                  <ScrollView
                    bounces={false}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                  >
                    <Formik
                      initialValues={{
                        company_code: user?.company_code?.toLowerCase()?.includes("oeuvre01") ? 'oeuvre01' : "",
                        user: "",
                        password: "",
                      }}
                      validationSchema={erpAddAccountValidationSchema(t)}
                      onSubmit={handleAddAccount}
                    >
                      {({
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        values,
                        errors,
                        touched,
                      }) => {

                        return (
                          <>
                            {/* Company Code Input */}
                            {
                              !user?.company_code?.toLowerCase()?.includes("oeuvre01") && <View style={styles.inputContainer}>
                                <Text
                                  style={[
                                    styles.inputLabel,
                                    theme === "dark" && { color: "white" },
                                  ]}
                                >
                                  {t("account.companyCode")}
                                </Text>
                                <View
                                  style={[
                                    styles.inputContainer,
                                    {
                                      justifyContent: "center",
                                      alignContent: "center",
                                      flexDirection: "row",
                                      alignItems: "center",
                                      borderRadius: 8,
                                      borderWidth: 1,
                                      borderColor: ERP_COLOR_CODE.ERP_BORDER_LINE,
                                      paddingLeft: 12,
                                    },
                                    touched?.company_code &&
                                    errors?.company_code && {
                                      borderColor: ERP_COLOR_CODE.ERP_ERROR,
                                      borderWidth: 0.8,
                                    },
                                    isInputEditCC && {
                                      borderColor: "#81b5e4",
                                      borderWidth: 0.8,
                                    },
                                    values?.company_code && {
                                      borderColor: "green",
                                      borderWidth: 0.8,
                                    },
                                    theme === "dark" && {
                                      backgroundColor: "black",
                                    },
                                  ]}
                                >
                                  <MaterialIcons
                                    name="closed-caption-off"
                                    size={20}
                                    color={ERP_COLOR_CODE.ERP_999}
                                  />
                                  <TextInput
                                    style={[
                                      styles.input,
                                      theme === "dark" && {
                                        backgroundColor: "black",
                                        color: "white",
                                      },
                                    ]}
                                    placeholder={t("auth.enterCompanyCode")}
                                    placeholderTextColor={ERP_COLOR_CODE.ERP_999}
                                    autoCapitalize="none"
                                    onChangeText={handleChange("company_code")}
                                    value={values?.company_code}
                                    onFocus={() => setIsInputEditCC(true)}
                                    onBlur={() => {
                                      if (!values?.company_code) {
                                        handleBlur("company_code");
                                        setIsInputEditCC(false);
                                      }
                                    }}
                                  />
                                </View>
                                {touched?.company_code &&
                                  errors?.company_code && (
                                    <Text
                                      style={[
                                        styles.errorText,

                                      ]}
                                    >
                                      {errors?.company_code}
                                    </Text>
                                  )}
                              </View>
                            }


                            {/* User Input */}
                            <View style={styles.inputContainer}>
                              <Text
                                style={[
                                  styles.inputLabel,
                                  theme === "dark" && { color: "white" },
                                ]}
                              >
                                {t("auth.user")}
                              </Text>
                              <View
                                style={[
                                  styles.inputContainer,
                                  {
                                    justifyContent: "center",
                                    alignContent: "center",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: ERP_COLOR_CODE.ERP_BORDER_LINE,
                                    paddingLeft: 12,
                                  },
                                  touched?.user &&
                                  errors?.user && {
                                    borderColor: ERP_COLOR_CODE.ERP_ERROR,
                                    borderWidth: 0.8,
                                  },
                                  isInputEditUSer && {
                                    borderColor: "#81b5e4",
                                    borderWidth: 0.8,
                                  },
                                  values?.user && {
                                    borderColor: "green",
                                    borderWidth: 0.8,
                                  },
                                ]}
                              >
                                <MaterialIcons
                                  name="person"
                                  size={20}
                                  color={ERP_COLOR_CODE.ERP_999}
                                />
                                <TextInput
                                  style={[
                                    styles.input,
                                    theme === "dark" && {
                                      backgroundColor: "black",
                                      color: "white",
                                    },
                                  ]}
                                  placeholder={t("auth.enterUser")}
                                  placeholderTextColor={ERP_COLOR_CODE.ERP_999}
                                  autoCapitalize="none"
                                  onChangeText={handleChange("user")}
                                  value={values?.user}
                                  onFocus={() => setIsInputEditUser(true)}
                                  onBlur={() => {
                                    if (!values?.user) {
                                      handleBlur("user");
                                      setIsInputEditUser(false);
                                    }
                                  }}
                                />
                              </View>
                              {touched?.user && errors?.user && (
                                <Text
                                  style={[
                                    styles.errorText,

                                  ]}
                                >
                                  {errors?.user}
                                </Text>
                              )}
                            </View>

                            {/* Password Input */}
                            <View style={styles.inputContainer}>
                              <Text
                                style={[
                                  styles.inputLabel,
                                  theme === "dark" && { color: "white" },
                                ]}
                              >
                                {t("auth.password")}
                              </Text>
                              <View
                                style={[
                                  styles.inputContainer,
                                  {
                                    justifyContent: "center",
                                    alignContent: "center",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: ERP_COLOR_CODE.ERP_BORDER_LINE,
                                    paddingLeft: 12,
                                  },
                                  touched?.password &&
                                  errors?.password && {
                                    borderColor: ERP_COLOR_CODE.ERP_ERROR,
                                    borderWidth: 0.8,
                                  },
                                  isInputEditPass && {
                                    borderColor: "#81b5e4",
                                    borderWidth: 0.8,
                                  },
                                  values?.password && {
                                    borderColor: "green",
                                    borderWidth: 0.8,
                                  },
                                ]}
                              >
                                <MaterialIcons
                                  name="password"
                                  size={20}
                                  color={ERP_COLOR_CODE.ERP_999}
                                />
                                <TextInput
                                  style={[
                                    styles.input1,
                                    theme === "dark" && {
                                      backgroundColor: "black",
                                      color: "white",
                                    },
                                  ]}
                                  placeholder={t("auth.enterPassword")}
                                  secureTextEntry={!showPassword}
                                  placeholderTextColor={ERP_COLOR_CODE.ERP_999}
                                  value={values?.password}
                                  onChangeText={handleChange("password")}
                                  onFocus={() => setIsInputEditPass(true)}
                                  onBlur={() => {
                                    if (!values?.password) {
                                      handleBlur("password");
                                      setIsInputEditPass(false);
                                    }
                                  }}
                                />
                                <TouchableOpacity
                                  onPress={() => setShowPassword((s) => !s)}
                                  style={styles.toggleButton}
                                >
                                  <MaterialIcons
                                    name={
                                      !showPassword
                                        ? "visibility-off"
                                        : "visibility"
                                    }
                                    color={ERP_COLOR_CODE.ERP_999}
                                    size={20}
                                  />
                                </TouchableOpacity>
                              </View>
                              {touched?.password && errors?.password && (
                                < Text
                                  style={[
                                    styles.errorText,

                                  ]}
                                >
                                  {errors?.password}
                                </Text>
                              )}
                            </View>

                            {/* Add Button */}

                            <TouchableOpacity
                              style={[
                                styles.addButton,
                                {
                                  backgroundColor:
                                    theme === "dark"
                                      ? "white"
                                      : ERP_COLOR_CODE.ERP_APP_COLOR,
                                },
                                loader && styles.disabledButton,
                                theme === "dark" && {
                                  backgroundColor: "white",
                                  borderColor: "white",
                                  borderWidth: 1,
                                },
                              ]}
                              onPress={() => handleSubmit()}
                              onPressIn={onPressIn}
                              onPressOut={onPressOut}
                              disabled={loader}
                              activeOpacity={1} // avoid opacity conflict
                            >
                              <MaterialIcons
                                name="person-add-alt"
                                size={24}
                                color={
                                  theme === "dark"
                                    ? "black"
                                    : ERP_COLOR_CODE.ERP_WHITE
                                }
                              />
                              <Text
                                style={[
                                  styles.addButtonText,
                                  theme === "dark" && { color: "black" },
                                ]}
                              >
                                {loader
                                  ? t("account.adding")
                                  : t("account.add")}
                              </Text>
                            </TouchableOpacity>

                            <View
                              style={{
                                height: 140,
                              }}
                            />
                          </>
                        );
                      }}
                    </Formik>
                  </ScrollView>
                </KeyboardAvoidingView>
              </View>
            </View>
          </>
        ) : (
          <>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              <>
                <ScrollView
                  bounces={false}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <View
                    style={[
                      styles.container,
                      theme === "dark" && { backgroundColor: "black" },

                      theme === "dark" && {
                        marginTop: 0,
                      },
                      isIpad && {
                        padding: 80,
                      }
                    ]}
                  >
                    <FlatList
                      bounces={false}

                      showsHorizontalScrollIndicator={false}
                      showsVerticalScrollIndicator={false}
                      keyExtractor={(item, index) => index.toString()}
                      keyboardShouldPersistTaps="handled"
                      data={[""]}
                      renderItem={() => (

                        <View style={styles.formContainer}>
                          <View
                            style={{
                              alignContent: "center",
                              alignSelf: "center",
                              borderRadius: 20,
                              height: 100,
                              width: 140,
                              marginBottom: 12,
                              backgroundColor: "white",
                            }}
                          >
                            <FastImage
                              source={
                                !imageExists
                                  ? ERP_ICON.APP_LOGO
                                  : {
                                    uri: `${baseLink}fileupload/1/InvoiceByConfig/1/logo.jpg`,
                                  }
                              }
                              // source={ERP_ICON.APP_LOGO}
                              style={[
                                styles.logo,
                                {
                                  marginTop: 0,
                                },
                                user?.company_code
                                  ?.toLowerCase()
                                  ?.includes("deverp") && {
                                  width: 80,
                                  height: 80,
                                  marginTop: 10,
                                },
                              ]}
                              onError={() => {
                                setImageExists(false);
                              }}
                              resizeMode="contain"
                            />
                          </View>

                          <Text
                            style={[
                              styles.subtitle,
                              theme === "dark" && { color: "white" },
                            ]}
                          >
                            {t("account.msg")}
                          </Text>

                          <Formik
                            initialValues={{
                              company_code: user?.company_code?.toLowerCase()?.includes("oeuvre01") ? 'oeuvre01' : "",
                              user: "",
                              password: "",
                            }}
                            validationSchema={erpAddAccountValidationSchema(
                              t,
                            )}
                            onSubmit={handleAddAccount}
                          >
                            {({
                              handleChange,
                              handleBlur,
                              handleSubmit,
                              values,
                              errors,
                              touched,
                            }) => {


                              return (
                                <>
                                  {/* Company Code Input */}
                                  {
                                    !user?.company_code?.toLowerCase()?.includes("oeuvre01") && <View style={styles.inputContainer}>
                                      <Text
                                        style={[
                                          styles.inputLabel,
                                          theme === "dark" && {
                                            color: "white",
                                          },
                                        ]}
                                      >
                                        {t("account.companyCode")}
                                      </Text>
                                      <View
                                        style={[
                                          styles.inputContainer,
                                          {
                                            justifyContent: "center",
                                            alignContent: "center",
                                            flexDirection: "row",
                                            alignItems: "center",
                                            borderRadius: 8,
                                            borderWidth: 1,
                                            borderColor:
                                              ERP_COLOR_CODE.ERP_BORDER_LINE,
                                            paddingLeft: 12,
                                          },
                                          touched?.company_code &&
                                          errors?.company_code && {
                                            borderColor:
                                              ERP_COLOR_CODE.ERP_ERROR,
                                            borderWidth: 0.8,
                                          },
                                          isInputEditCC && {
                                            borderColor: "#81b5e4",
                                            borderWidth: 0.8,
                                          },
                                          values?.company_code && {
                                            borderColor: "green",
                                            borderWidth: 0.8,
                                          },
                                          theme === "dark" && {
                                            backgroundColor: "black",
                                          },
                                        ]}
                                      >
                                        <MaterialIcons
                                          name="closed-caption-off"
                                          size={20}
                                          color={ERP_COLOR_CODE.ERP_999}
                                        />
                                        <TextInput
                                          style={[
                                            styles.input,
                                            theme === "dark" && {
                                              backgroundColor: "black",
                                              color: "white",
                                            },
                                            isIpad && {
                                              paddingVertical: 16,
                                            }
                                          ]}
                                          placeholder={t(
                                            "auth.enterCompanyCode",
                                          )}
                                          placeholderTextColor={
                                            ERP_COLOR_CODE.ERP_999
                                          }
                                          autoCapitalize="none"
                                          onChangeText={handleChange(
                                            "company_code",
                                          )}
                                          value={values?.company_code}
                                          onFocus={() => setIsInputEditCC(true)}
                                          onBlur={() => {
                                            if (!values?.company_code) {
                                              handleBlur("company_code");
                                              setIsInputEditCC(false);
                                            }
                                          }}
                                        />
                                      </View>
                                      {touched?.company_code &&
                                        errors?.company_code && (
                                          <Text
                                            style={[
                                              styles.errorText,

                                            ]}
                                          >
                                            {errors?.company_code}
                                          </Text>
                                        )}
                                    </View>
                                  }


                                  {/* User Input */}
                                  <View style={styles.inputContainer}>
                                    <Text
                                      style={[
                                        styles.inputLabel,
                                        theme === "dark" && {
                                          color: "white",
                                        },
                                      ]}
                                    >
                                      {t("auth.user")}
                                    </Text>
                                    <View
                                      style={[
                                        styles.inputContainer,
                                        {
                                          justifyContent: "center",
                                          alignContent: "center",
                                          flexDirection: "row",
                                          alignItems: "center",
                                          borderRadius: 8,
                                          borderWidth: 1,
                                          borderColor:
                                            ERP_COLOR_CODE.ERP_BORDER_LINE,
                                          paddingLeft: 12,
                                        },
                                        touched?.user &&
                                        errors?.user && {
                                          borderColor:
                                            ERP_COLOR_CODE.ERP_ERROR,
                                          borderWidth: 0.8,
                                        },
                                        isInputEditUSer && {
                                          borderColor: "#81b5e4",
                                          borderWidth: 0.8,
                                        },
                                        values?.user && {
                                          borderColor: "green",
                                          borderWidth: 0.8,
                                        },
                                      ]}
                                    >
                                      <MaterialIcons
                                        name="person"
                                        size={20}
                                        color={ERP_COLOR_CODE.ERP_999}
                                      />
                                      <TextInput
                                        style={[
                                          styles.input,
                                          theme === "dark" && {
                                            backgroundColor: "black",
                                            color: "white",
                                          },
                                          isIpad && {
                                            paddingVertical: 16,
                                          }
                                        ]}
                                        placeholder={t("auth.enterUser")}
                                        placeholderTextColor={
                                          ERP_COLOR_CODE.ERP_999
                                        }
                                        autoCapitalize="none"
                                        onChangeText={handleChange("user")}
                                        value={values?.user}
                                        onFocus={() =>
                                          setIsInputEditUser(true)
                                        }
                                        onBlur={() => {
                                          if (!values?.user) {
                                            handleBlur("user");
                                            setIsInputEditUser(false);
                                          }
                                        }}
                                      />
                                    </View>
                                    {touched?.user && errors?.user && (
                                      <Text
                                        style={[
                                          styles.errorText,

                                        ]}
                                      >
                                        {errors?.user}
                                      </Text>
                                    )}
                                  </View>

                                  {/* Password Input */}
                                  <View style={styles.inputContainer}>
                                    <Text
                                      style={[
                                        styles.inputLabel,
                                        theme === "dark" && {
                                          color: "white",
                                        },
                                      ]}
                                    >
                                      {t("auth.password")}
                                    </Text>
                                    <View
                                      style={[
                                        styles.inputContainer,
                                        {
                                          justifyContent: "center",
                                          alignContent: "center",
                                          flexDirection: "row",
                                          alignItems: "center",
                                          borderRadius: 8,
                                          borderWidth: 1,
                                          borderColor:
                                            ERP_COLOR_CODE.ERP_BORDER_LINE,
                                          paddingLeft: 12,
                                        },
                                        touched?.password &&
                                        errors?.password && {
                                          borderColor:
                                            ERP_COLOR_CODE.ERP_ERROR,
                                          borderWidth: 0.8,
                                        },
                                        isInputEditPass && {
                                          borderColor: "#81b5e4",
                                          borderWidth: 0.8,
                                        },
                                        values?.password && {
                                          borderColor: "green",
                                          borderWidth: 0.8,
                                        },
                                      ]}
                                    >
                                      <MaterialIcons
                                        name="password"
                                        size={20}
                                        color={ERP_COLOR_CODE.ERP_999}
                                      />
                                      <TextInput
                                        style={[
                                          styles.input1,
                                          theme === "dark" && {
                                            backgroundColor: "black",
                                            color: "white",
                                          },
                                          isIpad && {
                                            paddingVertical: 16,
                                          }
                                        ]}
                                        placeholder={t("auth.enterPassword")}
                                        secureTextEntry={!showPassword}
                                        placeholderTextColor={
                                          ERP_COLOR_CODE.ERP_999
                                        }
                                        value={values?.password}
                                        onChangeText={handleChange(
                                          "password",
                                        )}
                                        onFocus={() =>
                                          setIsInputEditPass(true)
                                        }
                                        onBlur={() => {
                                          if (!values?.password) {
                                            handleBlur("password");
                                            setIsInputEditPass(false);
                                          }
                                        }}
                                      />
                                      <TouchableOpacity
                                        onPress={() =>
                                          setShowPassword((s) => !s)
                                        }
                                        style={styles.toggleButton}
                                      >
                                        <MaterialIcons
                                          name={
                                            !showPassword
                                              ? "visibility-off"
                                              : "visibility"
                                          }
                                          color={ERP_COLOR_CODE.ERP_999}
                                          size={20}
                                        />
                                      </TouchableOpacity>
                                    </View>
                                    {touched?.password && errors?.password && (
                                      < Text
                                        style={[
                                          styles.errorText,

                                        ]}
                                      >
                                        {errors?.password}
                                      </Text>
                                    )}
                                  </View>

                                  {/* Add Button */}

                                  <TouchableOpacity
                                    style={[
                                      styles.addButton,
                                      {
                                        backgroundColor:
                                          theme === "dark"
                                            ? "white"
                                            : ERP_COLOR_CODE.ERP_APP_COLOR,
                                      },
                                      loader && styles.disabledButton,
                                      theme === "dark" && {
                                        backgroundColor: "white",
                                        borderColor: "white",
                                        borderWidth: 1,
                                      },
                                      isIpad && {
                                        paddingVertical: 16,
                                      }
                                    ]}
                                    onPress={() => handleSubmit()}
                                    onPressIn={onPressIn}
                                    onPressOut={onPressOut}
                                    disabled={loader}
                                    activeOpacity={1} // avoid opacity conflict
                                  >
                                    <MaterialIcons
                                      name="person-add-alt"
                                      size={24}
                                      color={
                                        theme === "dark"
                                          ? "black"
                                          : ERP_COLOR_CODE.ERP_WHITE
                                      }
                                    />
                                    <Text
                                      style={[
                                        styles.addButtonText,
                                        theme === "dark" && {
                                          color: "black",
                                        },
                                      ]}
                                    >
                                      {loader
                                        ? t("account.adding")
                                        : t("account.add")}
                                    </Text>
                                  </TouchableOpacity>

                                  {/* <Text style={styles.note}>
                                      {t("account.msg1")}
                                    </Text> */}
                                </>
                              );
                            }}
                          </Formik>
                        </View>
                      )}
                    />
                  </View>
                </ScrollView>
              </>
            </KeyboardAvoidingView>
          </>
        )}
        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={async () => {
            setLoader(false);
            setAlertVisible(false);
            DevERPService.setAppId(user?.app_id);
            DevERPService.setToken(user?.token);
            await AsyncStorage.setItem("erp_token", user?.token || "");
            await AsyncStorage.setItem("auth_token", user?.token || "");
            await AsyncStorage.setItem(
              "erp_token_valid_till",
              user?.tokenValidTill || "",
            );

            DevERPService.setAppId(user?.app_id || "");
            const validation = await validateCompanyCode(() =>
              DevERPService.validateCompanyCode(user?.company_code),
            );

            const currentFcmToken =
              Platform.OS === "ios"
                ? ""
                : fcmToken || (await getMessaging().getToken());

            const loginResult = await loginWithERP(() =>
              DevERPService.loginToERP({
                user: user?.username,
                pass: user?.password,
                firebaseid: currentFcmToken,
              }),
            );

            DevERPService.setToken(loginResult?.token);
            await AsyncStorage.setItem("erp_token", loginResult?.token || "");
            await AsyncStorage.setItem("auth_token", loginResult?.token || "");
            await AsyncStorage.setItem(
              "erp_token_valid_till",
              loginResult?.tokenValidTill || "",
            );

            setAlertVisible(false);
            setLoader(false);
            setAlertConfig({
              title: t("test4"),
              message: loginResult?.message || t("msg.msg2"),
              type: "error",
            });
          }}
          actionLoader={undefined}
          closeHide={undefined}
        />
      </ImageBackground>
    </Modal>
  );
};

export default AddAccountScreen;

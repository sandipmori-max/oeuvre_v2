import {
  View,
  Text,
  Image,
  TextInput,
  AppState,
  Animated,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  NativeModules,
  ScrollView
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import Geolocation from "@react-native-community/geolocation";

import { AttendanceFormValues, UserLocation } from "../types";
import {
  firstLetterUpperCase,
  requestCameraAndLocationPermission,
} from "../../../../utils/helpers";
import useTranslations from "../../../../hooks/useTranslations";
import { styles } from "../attendance_style";
import CustomAlert from "../../../../components/alert/CustomAlert";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { markAttendanceThunk } from "../../../../store/slices/attendance/thunk";
import { ERP_COLOR_CODE } from "../../../../utils/constants";
import { useNavigation } from "@react-navigation/native";
import SlideButton from "./SlideButton";
import { useBaseLink } from "../../../../hooks/useBaseLink";
import ProfileImage from "../../../../components/profile/ProfileImage";
import DeviceInfo from "react-native-device-info";
import { setReloadApp } from "../../../../store/slices/reloadApp/reloadAppSlice";
import { Easing } from "react-native";
import ImageBottomSheetModal from "../../../../components/bottomsheet/ImageBottomSheetModal";
import TranslatedText from "../../tabs/home/TranslatedText";
import { updateAttendanceState } from "../../../../store/slices/auth/authSlice";
import SlideButtonIOS from "./SlideButtonIOS";
import RNFS from "react-native-fs";
import ImageResizer from "@bam.tech/react-native-image-resizer";
import { launchCamera } from "react-native-image-picker";

const AttendanceForm = ({ setBlockAction, resData, isFromDashboard }: any) => {
  console.log("isFromDashboard", isFromDashboard)
  const { user, attendanceDone: isAttendanceDone, attendanceSecurityLevel, accounts } = useAppSelector(
    (state) => state?.auth,
  );
  let ATTENDANCE_LEVEL = attendanceSecurityLevel ? parseInt(attendanceSecurityLevel) : 0;
  const { t } = useTranslations();
  const [showModal, setShowModal] = useState(false);
  const [img, setImg] = useState("");
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const formikRef = useRef(null);
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const baseLink = useBaseLink();
  const theme = useAppSelector((state) => state?.theme.mode);
  const [statusImage, setStatusImage] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [attendanceDone, setAttendanceDone] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [isSettingVisible, setIsSettingVisible] = useState(false);
  const [modalClose, setModalClose] = useState(false);
  const [alertLocationVisible, setLocationAlertVisible] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "error" | "success" | "info",
  });
  const [alertMapVisible, setAlertMapVisible] = useState(false);

  const [alertMapConfig, setAlertMapConfig] = useState({
    title: "",
    message: "",
    type: "info" as "error" | "success" | "info" | "location",
  });
  // -------------------- Pending Camera Action --------------------
  const pendingCameraAction = useRef<{
    setFieldValue: (field: keyof AttendanceFormValues, value: any) => void;
    handleSubmit: () => void;
  } | null>(null);

  // -------------------- AppState Listener --------------------
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (nextAppState === "active" && pendingCameraAction.current) {
          const hasPermission = await requestCameraAndLocationPermission();
          await new Promise(res => setTimeout(res, 400));
          if (hasPermission) {
            setIsSettingVisible(false);
            setAlertVisible(false);
            const { setFieldValue, handleSubmit } = pendingCameraAction.current;
            pendingCameraAction.current = null;
            // if(ATTENDANCE_LEVEL === 0){
            //   openCameraV2(setFieldValue, handleSubmit);
            // }else{
            //   openCamera(setFieldValue, handleSubmit);
            // }
            openCamera(setFieldValue, handleSubmit);
          }
        }
      },
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const handleCamera = async () => {
      if (!isFromDashboard || !formikRef.current) return;
      const { setFieldValue, handleSubmit } = formikRef.current;
      handleStatusToggle(setFieldValue, handleSubmit);
    };

    handleCamera();
  }, [isFromDashboard]);

  const openCamera = (setFieldValue, handleSubmit) => {
    setLocationLoading(false);
    setBlockAction(false);
    navigation.navigate("FaceCameraScreen", {
      onCapture: async (photoPath) => {
        setTimeout(async () => {
          try {
            setLocationLoading(true);
            setBlockAction(true);
            if (!photoPath) {
              setLocationLoading(false);
              setBlockAction(false);
              return;
            }

            const photoUri = "file://" + photoPath;
            const compressedPhoto = await ImageResizer.createResizedImage(
              photoPath,
              600, // optional: adjust to safe dimensions
              600,
              "JPEG",
              60,
              0
            );

            const base64 = await RNFS.readFile(compressedPhoto.uri, "base64");
            // const base64 = await RNFS.readFile(photoPath, "base64");

            if (base64) {
              setFieldValue(
                "imageBase64",
                `${resData?.success === 1 || resData?.success === "1"
                  ? "punchOut.jpeg"
                  : "punchIn.jpeg"
                }; data:image/jpeg;base64,${base64}`,
              );
            }

            setStatusImage(photoUri);

            setTimeout(() => {
              handleSubmit();
            }, 1000);
          } catch (error) {
            console.log("---------------------11", error);

            setLocationLoading(false);
            setBlockAction(false);
          }
        }, 300);
      },
      isFromDashboard: isFromDashboard,
      isBackActive: false,
      isFromAttendance: true,
    });
  };
  const openCameraV2 = (
    setFieldValue: (field: keyof AttendanceFormValues, value: any) => void,
    handleSubmit: () => void,
  ) => {
    setTimeout(() => {
      launchCamera(
        {
          mediaType: "photo",

          // ⚡ keep base64 OFF from camera (we generate after resize)
          includeBase64: false,

          quality: 0.5,
          maxWidth: 800,
          maxHeight: 800,
          saveToPhotos: false,
        },
        async (response) => {
          try {
            if (response?.didCancel || response?.errorCode) {
              setLocationLoading(false);
              setBlockAction(false);
              return;
            }

            const asset = response?.assets?.[0];

            if (!asset?.uri) return;

            let finalUri = asset.uri;
            let finalBase64 = "";

            // 📌 STEP 1: Resize image (IMPORTANT FIX)
            const resizedImage = await ImageResizer.createResizedImage(
              asset.uri,
              800, // width
              800, // height
              "JPEG",
              60,  // quality
              0,
            );

            finalUri = resizedImage.uri;

            // 📌 STEP 2: Convert resized image to base64
            const RNFS = require("react-native-fs");

            finalBase64 = await RNFS.readFile(resizedImage.uri, "base64");

            setStatusImage(finalUri);

            // 📌 STEP 3: Prepare payload
            const fileName =
              resData?.success === 1 || resData?.success === "1"
                ? "punchOut.jpeg"
                : "punchIn.jpeg";

            setFieldValue(
              "imageBase64",
              `${fileName};data:${asset.type};base64,${finalBase64}`,
            );

            // 📌 STEP 4: Submit safely
            setTimeout(() => {
              handleSubmit();
            }, 300);
          } catch (err) {
            console.log("Camera Error:", err);
            setLocationLoading(false);
            setBlockAction(false);
          }
        },
      );
    }, 800); // 🔥 300–700ms ideal
  };
  const handleStatusToggle = async (
    setFieldValue: (field: keyof AttendanceFormValues, value: any) => void,
    handleSubmit: () => void,
  ) => {
    const enabled = await DeviceInfo.isLocationEnabled();
    if (!enabled) {
      setBlocked(false);
      setLocationLoading(false);
      setAttendanceDone(false);
      setLocationAlertVisible(true);
      return;
    } else {
      setLocationAlertVisible(false);
    }
    setBlockAction(true);

    if (locationLoading) return;

    const hasPermission = await requestCameraAndLocationPermission();
    await new Promise(res => setTimeout(res, 400));
    if (!hasPermission) {
      pendingCameraAction.current = { setFieldValue, handleSubmit };
      setAlertConfig({
        title: t("errors.permissionRequired"),
        message: t("errors.cameraLocationPermission"),
        type: "error",
      });
      setModalClose(false);
      setAlertVisible(true);
      setIsSettingVisible(true);

      setBlockAction(false);
      return;
    }

    setBlocked(false);
    setLocationLoading(true);

    const getLocationWithRetry = async () => {
      setLocationLoading(true);

      try {
        // ⚡ STEP 1: Native fast location
        const androidVersion = parseInt(DeviceInfo.getSystemVersion(), 10);
        if (androidVersion <= 9 && Platform.OS === "android") {
          Geolocation.getCurrentPosition(
            position => {
              const { latitude, longitude } = position.coords;
              setUserLocation({ latitude, longitude });
              setFieldValue('latitude', String(latitude));
              setFieldValue('longitude', String(longitude));
              setLocationLoading(false);
              openCamera(setFieldValue, handleSubmit);
            },
            error => {
              console.log('FINAL ERROR:', error);

              let message = '';

              switch (error.code) {
                case 1:
                  message = 'Location permission denied';
                  break;
                case 2:
                  message = 'Location unavailable (GPS/Network issue)';
                  break;
                case 3:
                  message = 'Location timeout (slow network)';
                  break;
                default:
                  message = error?.message || t('msg.msg5');
              }

              setAlertConfig({
                title: t('errors.locationError'),
                message,
                type: 'error',
              });

              setAlertVisible(true);
              setLocationLoading(false);
            },
            {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 10000,
            },
          );
          return;
        }
        const res = await NativeModules.LocationModule.getCurrentLocation();

        console.log('res++++++++++++++++++++++++++++++', res);
        let { latitude, longitude, accuracy } = res;

        // 🎯 Accuracy check (optional but recommended)
        if (accuracy && accuracy > 150) {
          throw new Error('Low accuracy location');
        }

        // ✅ SUCCESS
        setUserLocation({ latitude, longitude });
        setFieldValue('latitude', String(latitude));
        setFieldValue('longitude', String(longitude));

        setLocationLoading(false);

        // 📸 Continue flow
        // if (ATTENDANCE_LEVEL === 0) {
        //   openCameraV2(setFieldValue, handleSubmit);
        // } else {
        //   openCamera(setFieldValue, handleSubmit);
        // }
        openCamera(setFieldValue, handleSubmit);
      } catch (err) {
        console.log('Native failed → fallback to JS', err);

        // 🔁 STEP 2: Fallback (your old code)
        Geolocation.getCurrentPosition(
          position => {
            const { latitude, longitude } = position.coords;

            setUserLocation({ latitude, longitude });
            setFieldValue('latitude', String(latitude));
            setFieldValue('longitude', String(longitude));

            setLocationLoading(false);

            // if (ATTENDANCE_LEVEL === 0) {
            //   openCameraV2(setFieldValue, handleSubmit);
            // } else {
            //   openCamera(setFieldValue, handleSubmit);
            // }
            openCamera(setFieldValue, handleSubmit);
          },
          error => {
            console.log('FINAL ERROR:', error);

            let message = '';

            switch (error.code) {
              case 1:
                message = 'Location permission denied';
                break;
              case 2:
                message = 'Location unavailable (GPS/Network issue)';
                break;
              case 3:
                message = 'Location timeout (slow network)';
                break;
              default:
                message = error?.message || t('msg.msg5');
            }

            setAlertConfig({
              title: t('errors.locationError'),
              message,
              type: 'error',
            });

            setAlertVisible(true);
            setLocationLoading(false);
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 10000,
          },
        );
      }
    };

    getLocationWithRetry();
  };

  const formatName = (name = "") =>
    name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const animProfile = useRef(new Animated.Value(20)).current;
  const animName = useRef(new Animated.Value(20)).current;
  const animRemark = useRef(new Animated.Value(20)).current;
  const animImage = useRef(new Animated.Value(20)).current;
  const animButton = useRef(new Animated.Value(20)).current;

  const fadeProfile = useRef(new Animated.Value(0)).current;
  const fadeName = useRef(new Animated.Value(0)).current;
  const fadeRemark = useRef(new Animated.Value(0)).current;
  const fadeImage = useRef(new Animated.Value(0)).current;
  const fadeButton = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.parallel([
        Animated.timing(animProfile, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeProfile, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(animName, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(fadeName, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(animRemark, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(fadeRemark, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(animImage, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(fadeImage, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(animButton, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(fadeButton, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View
      style={{
        width: "100%",
        padding: 16,
      }}
    >
      <Formik
        innerRef={formikRef}
        initialValues={{
          name: user?.name,
          latitude: userLocation ? String(userLocation?.latitude) : "",
          longitude: userLocation ? String(userLocation?.longitude) : "",
          remark: "",
          dateTime: new Date().toISOString(),
          imageBase64: "",
        }}
        validationSchema={Yup.object({
          name: Yup.string().required(t("attendance.nameRequired")),
          longitude: Yup.string().optional(),
          remark: Yup.string().optional(),
          dateTime: Yup.string().optional(),
          imageBase64: Yup.string().required(t("msg.msg6")),
        })}
        onSubmit={(values) => {
          dispatch(
            markAttendanceThunk({
              rawData: values,
              type:
                resData?.success === 1 || resData?.success === "1"
                  ? false
                  : true,
              user,
              id:
                resData?.success === 1 || resData?.success === "1"
                  ? resData?.id
                  : "0",
            }),
          )
            .unwrap()
            .then((res) => {
              if (resData?.success === 1 || resData?.success === "1") {
                dispatch(updateAttendanceState(true));
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
                        console.log("aaaaddgjsaddfdjfdhjfdhdhdhdfhdfdshfdsfdsfsadfadfadf")
                        NativeModules.LocationModule.setUserTokens(data);
                        NativeModules.LocationModule.startService();
                        console.log("start")

                      }
              } else {
                dispatch(updateAttendanceState(false));
                        console.log("clsoslslssllslsslslslsleed")

                  NativeModules.LocationModule.clearUserTokens?.();
                        NativeModules.LocationModule.stopService();
                         console.log("stop")
              }
              setAttendanceDone(true);
              setAlertConfig({
                title: t("title.title3"),
                message: t("msg.msg7"),
                type: "success",
              });
              setAlertVisible(true);
              setLocationLoading(false);
              setBlockAction(false);

              setTimeout(() => {
                setAlertVisible(false);
                setAlertMapVisible(true);

                setAlertMapConfig({
                  title: "Location tracked status",
                  message: !isAttendanceDone
                    ? "Location tracking has started and will continue until you punch out."
                    : "Location tracking has been stopped.",
                  type: "location",
                });

                setTimeout(() => {
                  setAlertMapVisible(false);
                  dispatch(setReloadApp());
                  navigation.goBack();
                }, 1500);
              }, 1100);
            })
            .catch((err) => {
              setAttendanceDone(false);
              setAlertConfig({
                title: t("title.title1"),
                message: err || t("msg.msg4"),
                type: "error",
              });
              setAlertVisible(true);
              setLocationLoading(false);
              setBlockAction(false);
            });
        }}
      >
        {({ values, errors, touched, setFieldValue, handleSubmit }) => (
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: theme === "dark" ? "black" : "transparent",
              },
            ]}
          >
            {isLandscape ? (
              <>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ width: "50%", justifyContent: "center" }}>
                    <View style={styles.profileRow}>
                      <View style={styles.imageCol}>
                        {`${baseLink}/FileUpload/1/UserMaster/${user?.id}/profileimage.jpeg` ? (
                          <TouchableOpacity
                            onPress={() => {
                              setImg(
                                `${baseLink}/FileUpload/1/UserMaster/${user?.id}/profileimage.jpeg`,
                              );
                              setShowModal(true);
                            }}
                          >
                            <Animated.View
                              style={{
                                opacity: fadeProfile,
                                transform: [{ translateY: animProfile }],
                              }}
                            >
                              <View style={styles.profileRow}>
                                <ProfileImage
                                  userId={user?.id}
                                  baseLink={baseLink}
                                  userName={firstLetterUpperCase(
                                    user?.name || "",
                                  )}
                                />
                              </View>
                            </Animated.View>
                          </TouchableOpacity>
                        ) : (
                          <View
                            style={[
                              styles.profileAvatar,
                              {
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
                              },
                            ]}
                          >
                            <Animated.View
                              style={{
                                opacity: fadeName,
                                transform: [{ translateY: animName }],
                              }}
                            >
                              <TranslatedText
                                text={firstLetterUpperCase(user?.name || "")}
                                numberOfLines={1}
                                style={{
                                  color: ERP_COLOR_CODE.ERP_WHITE,
                                  fontWeight: "bold",
                                  fontSize: 26,
                                }}
                              ></TranslatedText>
                            </Animated.View>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  <ScrollView 
                    bounces={false}
                  style={{ width: "50%" }} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
                    <View >
                      <View style={{}}>
                        <Animated.View
                          style={{
                            opacity: fadeRemark,
                            transform: [{ translateY: animRemark }],
                          }}
                        >
                          <View style={styles.formGroup}>
                            <Text
                              style={[
                                styles.label,
                                theme === "dark" && {
                                  color: "white",
                                },
                              ]}
                            >
                              {t("attendance.employeeName")}
                            </Text>
                            <TextInput
                              style={[
                                styles.input,
                                styles.inputReadonly,
                                theme === "dark" && {
                                  borderWidth: 1,
                                  borderColor: "white",
                                  color: "black",
                                  backgroundColor: "black",
                                },
                                {
                                  backgroundColor: ERP_COLOR_CODE.ERP_BORDER_LINE,
                                },
                              ]}
                              value={formatName(values?.name)}
                              editable={false}
                            />
                            {touched?.name && errors?.name ? (
                              <TranslatedText
                                numberOfLines={1}
                                text={errors?.name}
                                style={styles.errorText}
                              ></TranslatedText>
                            ) : null}
                          </View>
                          <View style={styles.formGroup}>
                            <Text
                              style={[
                                styles.label,
                                theme === "dark" && {
                                  color: "white",
                                },
                              ]}
                            >
                              {resData?.success === 1 || resData?.success === "1"
                                ? t("attendance.outremark")
                                : t("attendance.remark")}
                            </Text>

                            <TextInput
                              style={[
                                styles.input,
                                { minHeight: 100, textAlignVertical: "top" },
                                theme === "dark" && {
                                  borderWidth: 0.4,
                                  borderColor: "white",
                                  color: "white",
                                  backgroundColor: "black",
                                },
                              ]}
                              placeholderTextColor={
                                theme === "dark" ? "white" : "black"
                              }
                              value={values?.remark}
                              onChangeText={(text) =>
                                setFieldValue("remark", text)
                              }
                              placeholder={t("attendance.enterRemark")}
                              multiline
                              numberOfLines={3}
                            />
                          </View>
                        </Animated.View>
                        {statusImage && (
                          <View>
                            <Image
                              source={{ uri: statusImage }}
                              style={styles.selfyAvatar}
                            />
                            <Text style={styles.imageLabel}>
                              {t("attendance.capturedPhoto")}
                            </Text>
                          </View>
                        )}
                        <View>
                          <Animated.View
                            style={{
                              opacity: fadeButton,
                              transform: [{ translateY: animButton }],
                            }}
                          >
                            <View>
                              <SlideButtonIOS
                                label={
                                  resData?.success === 1 ||
                                    resData?.success === "1"
                                    ? `${t("text.texti3")} ${t(
                                      "attendance.checkOut",
                                    )}`
                                    : `${t("text.texti3")} ${t(
                                      "attendance.checkIn",
                                    )}`
                                }
                                successColor={
                                  resData?.success === 1 ||
                                    resData?.success === "1"
                                    ? ERP_COLOR_CODE.ERP_ERROR
                                    : ERP_COLOR_CODE.ERP_APP_COLOR
                                }
                                loading={locationLoading}
                                completed={attendanceDone}
                                onSlideSuccess={() => {
                                  handleStatusToggle(
                                    setFieldValue,
                                    handleSubmit,
                                  );
                                }}
                              />
                            </View>
                          </Animated.View>
                        </View>
                      </View>
                    </View>
                  </ScrollView>

                </View>
              </>
            ) : (
              <>
                <View style={styles.profileRow}>
                  <View style={styles.imageCol}>
                    {`${baseLink}/FileUpload/1/UserMaster/${user?.id}/profileimage.jpeg` ? (
                      <TouchableOpacity
                        onPress={() => {
                          setImg(
                            `${baseLink}/FileUpload/1/UserMaster/${user?.id}/profileimage.jpeg`,
                          );
                          setShowModal(true);
                        }}
                      >
                        <Animated.View
                          style={{
                            opacity: fadeProfile,
                            transform: [{ translateY: animProfile }],
                          }}
                        >
                          <View style={styles.profileRow}>
                            <ProfileImage
                              userId={user?.id}
                              baseLink={baseLink}
                              userName={firstLetterUpperCase(user?.name || "")}
                            />
                          </View>
                        </Animated.View>
                      </TouchableOpacity>
                    ) : (
                      <View
                        style={[
                          styles.profileAvatar,
                          {
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
                          },
                        ]}
                      >
                        <Animated.View
                          style={{
                            opacity: fadeName,
                            transform: [{ translateY: animName }],
                          }}
                        >
                          <TranslatedText
                            text={firstLetterUpperCase(user?.name || "")}
                            numberOfLines={1}
                            style={{
                              color: ERP_COLOR_CODE.ERP_WHITE,
                              fontWeight: "bold",
                              fontSize: 26,
                            }}
                          ></TranslatedText>
                        </Animated.View>
                      </View>
                    )}
                  </View>
                </View>

                <View style={{}}>
                  <Animated.View
                    style={{
                      opacity: fadeRemark,
                      transform: [{ translateY: animRemark }],
                    }}
                  >
                    <View style={styles.formGroup}>
                      <Text
                        style={[
                          styles.label,
                          theme === "dark" && {
                            color: "white",
                          },
                        ]}
                      >
                        {t("attendance.employeeName")}
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          styles.inputReadonly,
                          theme === "dark" && {
                            borderWidth: 1,
                            borderColor: "white",
                            color: "black",
                            backgroundColor: "black",
                          },
                          { backgroundColor: ERP_COLOR_CODE.ERP_BORDER_LINE },
                        ]}
                        value={formatName(values?.name)}
                        editable={false}
                      />
                      {touched?.name && errors?.name ? (
                        <TranslatedText
                          numberOfLines={1}
                          text={errors?.name}
                          style={styles.errorText}
                        ></TranslatedText>
                      ) : null}
                    </View>
                    <View style={styles.formGroup}>
                      <Text
                        style={[
                          styles.label,
                          theme === "dark" && {
                            color: "white",
                          },
                        ]}
                      >
                        {resData?.success === 1 || resData?.success === "1"
                          ? t("attendance.outremark")
                          : t("attendance.remark")}
                      </Text>

                      <TextInput
                        style={[
                          styles.input,
                          { minHeight: 100, textAlignVertical: "top" },
                          theme === "dark" && {
                            borderWidth: 0.4,
                            borderColor: "white",
                            color: "white",
                            backgroundColor: "black",
                          },
                        ]}
                        placeholderTextColor={
                          theme === "dark" ? "white" : "black"
                        }
                        value={values?.remark}
                        onChangeText={(text) => setFieldValue("remark", text)}
                        placeholder={t("attendance.enterRemark")}
                        multiline
                        numberOfLines={3}
                      />
                    </View>
                  </Animated.View>
                  {statusImage && (
                    <View>
                      <Image
                        source={{ uri: statusImage }}
                        style={styles.selfyAvatar}
                      />
                      <Text style={styles.imageLabel}>
                        {t("attendance.capturedPhoto")}
                      </Text>
                    </View>
                  )}
                  <Animated.View
                    style={{
                      opacity: fadeButton,
                      transform: [{ translateY: animButton }],
                    }}
                  >
                    <View>
                      {Platform.OS === "ios" ? (
                        <SlideButtonIOS
                          label={
                            resData?.success === 1 || resData?.success === "1"
                              ? `${t("text.texti3")} ${t(
                                "attendance.checkOut",
                              )}`
                              : `${t("text.texti3")} ${t("attendance.checkIn")}`
                          }
                          successColor={
                            resData?.success === 1 || resData?.success === "1"
                              ? ERP_COLOR_CODE.ERP_ERROR
                              : ERP_COLOR_CODE.ERP_APP_COLOR
                          }
                          loading={locationLoading}
                          completed={attendanceDone}
                          onSlideSuccess={() => {
                            handleStatusToggle(setFieldValue, handleSubmit);
                          }}
                        />
                      ) : (
                        <SlideButton
                          label={
                            resData?.success === 1 || resData?.success === "1"
                              ? `${t("text.text3")} ${t("attendance.checkOut")}`
                              : `${t("text.text3")} ${t("attendance.checkIn")}`
                          }
                          successColor={
                            resData?.success === 1 || resData?.success === "1"
                              ? ERP_COLOR_CODE.ERP_ERROR
                              : ERP_COLOR_CODE.ERP_APP_COLOR
                          }
                          loading={locationLoading}
                          completed={attendanceDone}
                          blocked={blocked}
                          onSlideSuccess={() => {
                            handleStatusToggle(setFieldValue, handleSubmit);
                          }}
                        />
                      )}
                    </View>
                  </Animated.View>
                </View>
              </>
            )}
          </View>
        )}
      </Formik>

      <ImageBottomSheetModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        imageUrl={img}
      />

      <CustomAlert
        visible={alertLocationVisible}
        title={t("title.title4")}
        message={t("msg.msg8")}
        type={"error"}
        onClose={() => {
          setBlocked(true);
          setAlertVisible(false);
          setTimeout(() => {
            setBlocked(false);
          }, 1000);
          setLocationLoading(false);
          setAttendanceDone(false);
          setLocationAlertVisible(false);
        }}
        actionLoader={undefined}
        isSettingVisible={false}
        closeHide={undefined}
      />

      <CustomAlert
        visible={alertMapVisible}
        title={alertMapConfig?.title}
        message={alertMapConfig?.message}
        type={alertMapConfig?.type}
        onClose={() => {
          navigation?.goBack();
          setAlertMapVisible(false);
          dispatch(setReloadApp());
        }}
        actionLoader={undefined}
        isSettingVisible={false}
        closeHide={undefined}
      />

      <CustomAlert
        visible={alertVisible}
        title={alertConfig?.title}
        message={alertConfig?.message}
        type={alertConfig?.type}
        onClose={() => {
          if (!modalClose) {
            if (attendanceDone) {
              navigation?.goBack();
              setAlertVisible(false);
            } else {
              setBlocked(true);
              setAlertVisible(false);
              setTimeout(() => {
                setBlocked(false);
              }, 1000);
            }
          }
        }}
        actionLoader={undefined}
        isSettingVisible={isSettingVisible}
        closeHide={undefined}
      />
    </View>
  );
};

export default AttendanceForm;

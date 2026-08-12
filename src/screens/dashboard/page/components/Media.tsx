import MaterialIcons from "@react-native-vector-icons/material-icons";
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Image,
  Dimensions,
  Text,
  TouchableOpacity,
  Platform,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Animated,
  PanResponder,
  AppState,
  useWindowDimensions,
  Alert,
} from "react-native";
import {
  launchImageLibrary,
  Asset,
} from "react-native-image-picker";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import CustomAlert from "../../../../components/alert/CustomAlert";
import { ERP_COLOR_CODE } from "../../../../utils/constants";
import { useAppSelector } from "../../../../store/hooks";
import { useTranslation } from "react-i18next";
import InputError from "../../../../components/error/InputError";
import ImageResizer from "@bam.tech/react-native-image-resizer";
import RNFS from "react-native-fs";
import LableInfo from "./LableInfo";
import { useNavigation } from "@react-navigation/native";
import DeviceInfo from "react-native-device-info";
import { downloadAndShare } from "../../../../utils/helpers";
 
const Media = ({
  isValidate,
  item,
  handleAttachment,
  infoData,
  baseLink,
  isFromNew,
  errors,
}: any) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [modalClose, setModalClose] = useState(false);
  const [loadingSmall, setLoadingSmall] = useState(false);
  const [loadingLarge, setLoadingLarge] = useState(false);
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const [alertVisible, setAlertVisible] = useState(false);
  const [isSettingVisible, setIsSettingVisible] = useState(false);
  const [imageExists, setImageExists] = useState(true);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "error" | "success" | "info",
  });
 const isIpad =
   ( Platform.OS === "ios" && Platform.isPad) || DeviceInfo.isTablet() || Platform.isTV;
   
  console.log("Media Rendered with imageUri:", imageUri, "and errors:", errors);
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastScale = useRef(1);
  const lastTranslate = useRef({ x: 0, y: 0 });
  const theme = useAppSelector((state) => state?.theme.mode);

  const pendingCameraAction = useRef(false);
  const appState = useRef(AppState.currentState);

  const getImageUri = (type: "small" | "large") => {
    const base =
      imageUri || `${baseLink}fileupload/1/${infoData?.tableName}/${infoData?.id}/${type === "small" ? `${item?.text}` : `${item?.text}`}`;
   
      console.log(`${base}?cb=${cacheBuster}`)
      return `${base}?cb=${cacheBuster}`;
  };

 
  // -------------------- Permissions --------------------
  const requestPermission = async (
    type: "camera" | "gallery",
  ): Promise<boolean> => {
    try {
      let permission;

      if (type === "gallery") {
        return true;
      }
      if (type === "camera") {
        permission =
          Platform.OS === "ios"
            ? PERMISSIONS.IOS.CAMERA
            : PERMISSIONS.ANDROID.CAMERA;
      } else {
        // Gallery / Photos
        if (Platform.OS === "ios") {
          permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
        }
        // else {
        //   // Android 13+
        //   if (Platform.Version >= 33) {
        //     permission = PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
        //   } else {
        //     permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
        //   }
        // }
      }

      let result = await check(permission);

      if (result === RESULTS.GRANTED) return true;

      if (result === RESULTS.DENIED) {
        result = await request(permission);
        if (result === RESULTS.GRANTED) return true;
      }

      if (result === RESULTS.BLOCKED || result === RESULTS.DENIED) {
        setAlertConfig({
          title: `${type === "camera" ? "Camera" : "Gallery"} ${t("text28")}`,
          message: `${t("text29")} ${type === "camera" ? "camera" : "gallery"
            } ${t("text30")}`,
          type: "error",
        });
        setModalClose(true);
        setIsSettingVisible(true);
        setAlertVisible(true);

        if (type === "camera") pendingCameraAction.current = true;
        return false;
      }

      return result === RESULTS.GRANTED;
    } catch (error) {
      return false;
    }
  };

  // -------------------- AppState listener --------------------
  useEffect(() => {


    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        try {


          if (
            appState.current.match(/inactive|background/) &&
            nextAppState === "active" &&
            pendingCameraAction.current
          ) {
            const granted = await requestPermission("camera");
            if (granted) {
              setIsSettingVisible(false);
              setAlertVisible(false);
              pendingCameraAction.current = false;
              navigation.navigate("FaceCameraScreen", {
                onCapture: async (photoPath) => {
                  setTimeout(async () => {
                    try {
                      console.log("========== CAMERA START ==========");
                      if (!photoPath) {
                        console.log("Photo Path Missing");
                        return;
                      }
                      // ✅ SAFE URI
                      const originalUri = photoPath.startsWith("file://")
                        ? photoPath
                        : `file://${photoPath}`;

                      console.log("Original Photo:", originalUri);

                      let finalUri = originalUri;
                      let finalBase64 = "";

                      // ⚡ STEP 1: COMPRESS IMAGE
                      console.log("Compressing Image...");

                      let resizedImage;

                      try {
                        resizedImage = await ImageResizer.createResizedImage(
                          originalUri,
                          800,
                          800,
                          "JPEG",
                          70,
                          0,
                        );
                      } catch (err) {
                        console.log("⚠️ Primary compression failed, fallback...");

                        resizedImage = await ImageResizer.createResizedImage(
                          originalUri,
                          600,
                          600,
                          "JPEG",
                          50,
                          0,
                        );
                      }

                      console.log("Compressed Image:", resizedImage.uri);

                      // ⚡ STEP 2: BASE64 AFTER COMPRESSION
                      finalBase64 = await RNFS.readFile(
                        resizedImage.uri.replace("file://", ""),
                        "base64",
                      );

                      const compressedSizeMB =
                        (finalBase64.length * 3) / 4 / 1024 / 1024;

                      console.log(
                        "Final Base64 Size:",
                        compressedSizeMB.toFixed(2),
                        "MB",
                      );

                      finalUri = resizedImage.uri;
                      setImageExists(true);
                      setImageUri(finalUri);
                      setCacheBuster(Date.now());

                      console.log("Image State Updated");

                      // 🚀 SEND TO BACKEND
                      handleAttachment(
                        `${item?.field}.jpeg;data:image/jpeg;base64,${finalBase64}`,
                        item?.field,
                      );


                      console.log("========== CAMERA SUCCESS ==========");
                    } catch (error) {
                      console.log(
                        "Image Process Error:",
                        JSON.stringify(error, null, 2),
                      );
                      setImageExists(false);

                    }
                  }, 300);
                },

                isFromDashboard: false,
                isBackActive: true,
                isFromAttendance: false,
              });
            }
          }

          appState.current = nextAppState;
        } catch (error) {
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // useLayoutEffect(()=>{
  //     setLoadingSmall(false)
  // },[])
  // -------------------- Render Media Options --------------------

 


  const renderMedia = () => {
    if (item?.field?.startsWith("gallary_camera_") && item?.ctltype === "IMAGE") {
      return [
        {
          text: "Camera",
          icon: "photo-camera",

           onPress: async () => {
            try {
              console.log("========== CAMERA START ==========");

              const granted = await requestPermission("camera");
              console.log("Camera Permission:", granted);

              if (!granted) {
                console.log("Permission Denied");
                return;
              }

              navigation.navigate("FaceCameraScreen", {
                onCapture: async (photoPath) => {
                  setTimeout(async () => {
                    try {
                      console.log("========== CAMERA START ==========");


                      if (!photoPath) {
                        console.log("Photo Path Missing");
                        return;
                      }

                      // ✅ SAFE URI
                      const originalUri = photoPath.startsWith("file://")
                        ? photoPath
                        : `file://${photoPath}`;

                      console.log("Original Photo:", originalUri);

                      let finalUri = originalUri;
                      let finalBase64 = "";

                      // ⚡ STEP 1: COMPRESS IMAGE
                      console.log("Compressing Image...");

                      let resizedImage;

                      try {
                        resizedImage = await ImageResizer.createResizedImage(
                          originalUri,
                          800,
                          800,
                          "JPEG",
                          70,
                          0,
                        );
                      } catch (err) {
                        console.log("⚠️ Primary compression failed, fallback...");

                        resizedImage = await ImageResizer.createResizedImage(
                          originalUri,
                          600,
                          600,
                          "JPEG",
                          50,
                          0,
                        );
                      }

                      console.log("Compressed Image:", resizedImage.uri);

                      // ⚡ STEP 2: BASE64 AFTER COMPRESSION
                      finalBase64 = await RNFS.readFile(
                        resizedImage.uri.replace("file://", ""),
                        "base64",
                      );

                      const compressedSizeMB =
                        (finalBase64.length * 3) / 4 / 1024 / 1024;

                      console.log(
                        "Final Base64 Size:",
                        compressedSizeMB.toFixed(2),
                        "MB",
                      );

                      finalUri = resizedImage.uri;
                      setImageExists(true);
                      setImageUri(finalUri);
                      setCacheBuster(Date.now());

                      console.log("Image State Updated");

                      // 🚀 SEND TO BACKEND
                      handleAttachment(
                        `${item?.field}.jpeg;data:image/jpeg;base64,${finalBase64}`,
                        item?.field,
                      );


                      console.log("========== CAMERA SUCCESS ==========");
                    } catch (error) {
                      console.log(
                        "Image Process Error:",
                        JSON.stringify(error, null, 2),
                      );
                      setImageExists(false);

                    }
                  }, 300);
                },

                isFromDashboard: false,
                isBackActive: true,
                isFromAttendance: false,
              });
            } catch (error) {
              console.log("Camera Launch Error:", JSON.stringify(error, null, 2));
            }
          }
        },
        {
          text: "Gallery",
          icon: "photo-library",
          onPress: async () => {


            const granted = await requestPermission("gallery");
            if (!granted) {
              Alert.alert("STOP", "Permission not granted");
              return;
            }

            setTimeout(async () => {
              launchImageLibrary(
                {
                  mediaType: "photo",
                  quality: 0.5,
                  includeBase64: true,
                },
                (response) => {
                  if (response.didCancel) {
                    Alert.alert("CANCELLED", "User cancelled gallery");
                    return;
                  }

                  if (response.errorCode) {
                    Alert.alert(
                      "ERROR",
                      `${response.errorCode}\n${response.errorMessage}`,
                    );

                    return;
                  }
                  if (response.assets && response.assets.length > 0) {
                    const asset: Asset = response.assets[0];
                    let uri = asset.uri!;
                    if (Platform.OS === "android" && !uri.startsWith("file://")) {
                      uri = "file://" + uri;
                    }
                    setImageExists(true);
                    setImageUri(uri || null);
                    setCacheBuster(Date.now());
                    // handleAttachment(
                    //   `${item?.field}.jpeg;data:image/jpeg;base64,${finalBase64}`,
                    //   item?.field,
                    // );
                    handleAttachment(
                      `${item?.field}.jpeg;data:${asset.type};base64,${asset.base64}`,
                      item.field,
                    );
                  } else {
                    Alert.alert("NO ASSETS", "No image selected");
                  }
                },
              );
            }, 400)
          },
        },
      ];
    } else if (item?.ctltype === "IMAGE" && !item?.field?.startsWith("gallary_camera_")) {
      return [
        {
          text: "Camera",
          icon: "photo-camera",

          onPress: async () => {
            try {
              console.log("========== CAMERA START ==========");

              const granted = await requestPermission("camera");
              console.log("Camera Permission:", granted);

              if (!granted) {
                console.log("Permission Denied");
                return;
              }

              navigation.navigate("FaceCameraScreen", {
                onCapture: async (photoPath) => {
                  setTimeout(async () => {
                    try {
                      console.log("========== CAMERA START ==========");


                      if (!photoPath) {
                        console.log("Photo Path Missing");
                        return;
                      }

                      // ✅ SAFE URI
                      const originalUri = photoPath.startsWith("file://")
                        ? photoPath
                        : `file://${photoPath}`;

                      console.log("Original Photo:", originalUri);

                      let finalUri = originalUri;
                      let finalBase64 = "";

                      // ⚡ STEP 1: COMPRESS IMAGE
                      console.log("Compressing Image...");

                      let resizedImage;

                      try {
                        resizedImage = await ImageResizer.createResizedImage(
                          originalUri,
                          800,
                          800,
                          "JPEG",
                          70,
                          0,
                        );
                      } catch (err) {
                        console.log("⚠️ Primary compression failed, fallback...");

                        resizedImage = await ImageResizer.createResizedImage(
                          originalUri,
                          600,
                          600,
                          "JPEG",
                          50,
                          0,
                        );
                      }

                      console.log("Compressed Image:", resizedImage.uri);

                      // ⚡ STEP 2: BASE64 AFTER COMPRESSION
                      finalBase64 = await RNFS.readFile(
                        resizedImage.uri.replace("file://", ""),
                        "base64",
                      );

                      const compressedSizeMB =
                        (finalBase64.length * 3) / 4 / 1024 / 1024;

                      console.log(
                        "Final Base64 Size:",
                        compressedSizeMB.toFixed(2),
                        "MB",
                      );

                      finalUri = resizedImage.uri;
                      setImageExists(true);
                      setImageUri(finalUri);
                      setCacheBuster(Date.now());

                      console.log("Image State Updated");

                      // 🚀 SEND TO BACKEND
                      handleAttachment(
                        `${item?.field}.jpeg;data:image/jpeg;base64,${finalBase64}`,
                        item?.field,
                      );


                      console.log("========== CAMERA SUCCESS ==========");
                    } catch (error) {
                      console.log(
                        "Image Process Error:",
                        JSON.stringify(error, null, 2),
                      );
                      setImageExists(false);

                    }
                  }, 300);
                },

                isFromDashboard: false,
                isBackActive: true,
                isFromAttendance: false,
              });
            } catch (error) {
              console.log("Camera Launch Error:", JSON.stringify(error, null, 2));
            }
          }
        },
      ];
    } else {
      return [];
    }
  };

  const handleChooseImage = () => {
    setPickerModalVisible(true);
  };
  // -------------------- PanResponder & Zoom --------------------
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gesture) => {
        if (gesture.numberActiveTouches === 1) {
          translateX.setValue(lastTranslate.current.x + gesture.dx);
          translateY.setValue(lastTranslate.current.y + gesture.dy);
        } else if (gesture.numberActiveTouches === 2) {
          const touches = evt.nativeEvent.touches;
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (!lastScale.currentDistance) lastScale.currentDistance = distance;
          const scaleFactor = distance / lastScale.currentDistance;
          scale.setValue(
            Math.max(1, Math.min(3, lastScale.current * scaleFactor)),
          );
        }
      },
      onPanResponderRelease: (_, gesture) => {
        lastTranslate.current.x += gesture.dx;
        lastTranslate.current.y += gesture.dy;
        lastScale.current = scale.__getValue();
        lastScale.currentDistance = undefined;
      },
    }),
  ).current;

  const zoomIn = () => {
    scale.setValue(Math.min(3, scale.__getValue() + 0.2));
    lastScale.current = scale.__getValue();
  };

  const zoomOut = () => {
    scale.setValue(Math.max(1, scale.__getValue() - 0.2));
    lastScale.current = scale.__getValue();
  };
  // -------------------- JSX --------------------
  return (
    <>
      <LableInfo
        item={item}
        theme={theme} />
      <TouchableOpacity
        onPress={() => {
          if (!imageExists) {
            handleChooseImage();
          } else if (!isFromNew) {
            setModalVisible(true);
          }
        }}
        style={[
          styles.imageWrapper,
          !imageExists && {
            width:   !isLandscape &&isIpad ? "50%" : "100%",
            borderWidth: 1.5,
            borderRadius: 10,
            borderColor:
              theme === "dark" ? "#fff" : ERP_COLOR_CODE.ERP_APP_COLOR ,
            marginBottom: 8,
            borderStyle: "dashed",
            backgroundColor: theme === "dark" ? "#000" : "#f8f9ff",
          },
          errors[item?.field] && {
            borderColor: ERP_COLOR_CODE.ERP_ERROR,
          },
        ]}
      >
        <View
          style={[
            theme === "dark" && {
              borderWidth: imageExists ? 1 : 0,
              borderColor: "white",
            },
            { width: imageExists ? 100 : 200, height: 100 },
          ]}
        >
          {/* {loadingSmall && (
      <ActivityIndicator
        style={StyleSheet.absoluteFill}
        size="small"
        color={theme === 'dark' ? 'white' : 'black'}
      />
    )} */}

          {!imageExists && (
            <View
              style={{
                marginTop: 18,
                alignItems: "center",
                gap: 4,
              }}
            >
              <MaterialIcons
                name="add-photo-alternate"
                color={
                  theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_APP_COLOR
                }
                size={38}
              />
              <Text style={{ color: ERP_COLOR_CODE.ERP_999 }}>
                Please upload image
              </Text>
            </View>
          )}

          {imageExists && (
            <Image
              source={{
                uri: imageUri ? imageUri : getImageUri("small"),
              }}
              style={styles.imageThumb}
              resizeMode="cover"
              onLoadStart={() => setLoadingSmall(true)}
              onLoad={() => {
                setImageExists(true);
                setLoadingSmall(false);
              }}
              onError={() => {
                setImageExists(false);
                setLoadingSmall(false);
              }}
              fadeDuration={0}
            />
          )}
        </View>

        {imageExists && (
          <TouchableOpacity
            onPress={handleChooseImage}
            style={[
              styles.editBtn,
             (isIpad ||  isLandscape) && {
                left: 206,
              },
              theme === "dark" && {
                borderWidth: 1,
                borderColor: "white",
                backgroundColor: "black",
              },
            ]}
          >
            <MaterialIcons
              name="edit"
              color={theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_BLACK}
              size={20}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {!imageExists && errors[item?.field] && (
        <>
          <InputError error={errors[item?.field]} />
          <View style={{ height: 8 }} />
        </>
      )}
      {/* Fullscreen Image Modal */}
      {modalVisible && (
        <Modal
          supportedOrientations={["portrait", "landscape"]}
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            scale.setValue(1);
            translateX.setValue(0);
            translateY.setValue(0);
            lastTranslate.current = { x: 0, y: 0 };
            lastScale.current = 1;
            setModalVisible(false);
          }}
        >
          <View
            style={[
              styles.fullscreenModalOverlay,
              (isIpad || isLandscape) && {
                alignContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <View
              style={[
                styles.fullscreenModalContent,
                {
                  width:  (isIpad || isLandscape) ? "50%" : "100%",
                },
              ]}
            >
            <TouchableOpacity
                style={styles.closeBtnShare}
                onPress={() => {
                  downloadAndShare(getImageUri("large"), "image/jpeg");
                }}
              >
                <MaterialIcons
                  name="share"
                  size={30}
                  color={theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_WHITE}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => {
                  scale.setValue(1);
                  translateX.setValue(0);
                  translateY.setValue(0);
                  lastTranslate.current = { x: 0, y: 0 };
                  lastScale.current = 1;
                  setModalVisible(false);
                }}
              >
                <MaterialIcons
                  name="close"
                  size={30}
                  color={theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_WHITE}
                />
              </TouchableOpacity>

              {loadingLarge && (
                <ActivityIndicator
                  style={StyleSheet.absoluteFill}
                  size="large"
                  color={ERP_COLOR_CODE.ERP_WHITE}
                />
              )}

              <Animated.View
                style={{
                  width: "100%",
                  height: "100%",
                  transform: [{ scale }, { translateX }, { translateY }],
                }}
                {...panResponder.panHandlers}
              >
                <Image
                  source={{ uri: getImageUri("large") }}
                  style={styles.fullscreenImage}
                  resizeMode="contain"
                  onLoadStart={() => setLoadingLarge(true)}
                  onLoadEnd={() => setLoadingLarge(false)}
                />
              </Animated.View>

              <View style={styles.zoomControls}>
                <TouchableOpacity style={styles.zoomBtn} onPress={zoomIn}>
                  <MaterialIcons name="zoom-in" size={28} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.zoomBtn} onPress={zoomOut}>
                  <MaterialIcons name="zoom-out" size={28} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Picker Modal */}
      {pickerModalVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          supportedOrientations={["portrait", "landscape"]}
          visible={pickerModalVisible}
          onRequestClose={() => setPickerModalVisible(false)}
        >
          <View
            style={[
              styles.modalOverlay,
              (isIpad || isLandscape) && {
                alignContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <View
              style={[
                styles.modalContent,
                theme === "dark" && {
                  borderWidth: 1,
                  borderColor: "white",
                  backgroundColor: "black",
                },
                {
                  width:  (isIpad || isLandscape) ? "50%" : "100%",
                },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text
                  style={[
                    styles.modalTitle,
                    theme === "dark" && {
                      color: "white",
                    },
                  ]}
                >
                  {t("text31")}
                </Text>
                <TouchableOpacity onPress={() => setPickerModalVisible(false)}>
                  <MaterialIcons
                    name="close"
                    size={24}
                    color={theme === "dark" ? "white" : "black"}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.optionRow}>
                {renderMedia().map((option, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.optionCard,
                      theme === "dark" && {
                        backgroundColor: "black",
                        borderWidth: 1,
                        borderColor: "white",
                      },
                    ]}
                    onPress={async () => {
                      setPickerModalVisible(false);
                      await option.onPress();
                    }}
                  >
                    <MaterialIcons
                      name={option?.icon}
                      size={36}
                      color={theme === "dark" ? "white" : "black"}
                    />
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color: theme === "dark" ? "white" : "black",
                        },
                      ]}
                    >
                      {option?.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Custom Alert for permissions */}
      {alertVisible && (
        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => {
            if (!modalClose) {
              setAlertVisible(false);
            }
          }}
          isSettingVisible={isSettingVisible}
          actionLoader={undefined}
          closeHide={undefined}
        />
      )}
    </>
  );
};
const styles = StyleSheet.create({
  imageWrapper: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  label: {
    fontSize: 14,
    color: ERP_COLOR_CODE.ERP_333,
    marginBottom: 6,
    fontWeight: "600",
  },

  imageThumb: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderRadius: 10,
  },

  editBtn: {
    height: 36,
    width: 36,
    borderRadius: 8,
    backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
    position: "absolute",
    bottom: 28,
    left: Dimensions.get("screen").width / 1.84,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },

  /* ---------- Bottom Sheet ---------- */

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalContent: {
    backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    alignItems: "center",
    maxHeight: "60%",
    width: "100%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  optionRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    marginTop: 12,
  },

  optionCard: {
    width: 100,
    height: 100,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },

  optionLabel: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "500",
  },

  /* ---------- FULLSCREEN IMAGE MODAL (IMPROVED) ---------- */

  fullscreenModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },

  fullscreenModalContent: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  fullscreenImage: {
    width: "100%",
    height: "100%",
  },
  closeBtnShare: {
position: "absolute",
    top: 80,
    right: 80,
    zIndex: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },

  closeBtn: {
    position: "absolute",
    top: 80,
    right: 20,
    zIndex: 20,

    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },

  zoomControls: {
    position: "absolute",
    bottom: 40,
    flexDirection: "row",
    gap: 16,

    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },

  zoomBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Media;

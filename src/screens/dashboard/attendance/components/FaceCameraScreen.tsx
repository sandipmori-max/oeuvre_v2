import React, { useRef, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useFrameProcessor,
  useCameraFormat,
} from "react-native-vision-camera";
import { useFaceDetector } from "react-native-vision-camera-face-detector";
import { Worklets } from "react-native-worklets-core";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import ImageResizer from "@bam.tech/react-native-image-resizer";
import { useBaseLink } from "../../../../hooks/useBaseLink";
import { useAppSelector } from "../../../../store/hooks";
import CustomAlert from "../../../../components/alert/CustomAlert";

const FaceCameraScreen = ({ navigation, route }: any) => {
  const { user, attendanceSecurityLevel } = useAppSelector(
    (state) => state.auth,
  );
  let ATTENDANCE_LEVEL = attendanceSecurityLevel
    ? parseInt(attendanceSecurityLevel)
    : 0;
  const { onCapture, isFromDashboard, isBackActive, isFromAttendance } = route.params;
  const camera = useRef(null);
  const [cameraPosition, setCameraPosition] = useState<"front" | "back">(
    "front",
  );
  const device = useCameraDevice(cameraPosition); const baseLink = useBaseLink();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "error" | "success" | "info",
  });
  const [hasPermission, setHasPermission] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  useEffect(() => {
    const getPermission = async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === "granted");
    };
    getPermission();
  }, []);
  const toggleCamera = () => {
    setCameraPosition(prev => (prev === "front" ? "back" : "front"));
  };
  const { detectFaces } = useFaceDetector({
    performanceMode: "fast",
    landmarkMode: "all",
  });

  const updateFacesJS = Worklets.createRunOnJS((faces) => {
    setFaceDetected(faces.length > 0);
  });

  const frameProcessor = useFrameProcessor((frame) => {
    "worklet";
    const faces = detectFaces(frame);
    updateFacesJS(faces);
  }, []);

  useEffect(() => {
    const backAction = () => {
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  const [loading, setLoading] = useState(false);
  const verifyFace = async (capturedImageUri) => {
    try {
      setLoading(true);
      const formData = new FormData();

      formData.append("api_key", "D-UA4X5kTeKl3B166FxcJcC1z3K6LYYV");
      formData.append("api_secret", "0cpN_-Lq2IUvAMvRy7asqLU-rV1y8fvT");

      // Image 1 → your reference image (URL)
      formData.append(
        "image_url1",
        `${baseLink}/FileUpload/1/UserMaster/${user?.id}/profileimage.jpeg`,
      );

      // Image 2 → captured image (local file)
      formData.append("image_file2", {
        uri: capturedImageUri,
        type: "image/jpeg",
        name: "photo.jpg",
      });

      const res = await fetch(
        "https://api-us.faceplusplus.com/facepp/v3/compare",
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const data = await res.json();
      console.log("🔍 Face API Response:", data);

      return data;
    } catch (err) {
      setAlertVisible(true);
      setAlertConfig({
        title: "Error",
        message: `${err}`,
        type: "error",
      });
      console.log("❌ API ERROR:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const takePhotov2 = async () => {
    try {
      setLoading(true); // loader start

      const photo = await camera?.current?.takePhoto({
        qualityPrioritization: "speed",
        flash: "off",
        enableAutoRedEyeReduction: true,
        skipMetadata: false,
        enableShutterSound: user?.company_code?.toLowerCase()?.includes("oeuvre01") ? false : true,
        quality: 0.8,
        width: 800,
        height: 800,
      });

      const photoPath = photo?.path;

      console.log("📸 Original Path:", photoPath);

      // 🔥 Compression
      let compressedImage;

      try {
        compressedImage = await ImageResizer.createResizedImage(
          photoPath,
          800,
          800,
          "JPEG",
          60,
          0,
          undefined,
          false,
          { mode: "contain" },
        );
      } catch (err) {
        console.log("⚠️ Primary compression failed, fallback...");

        compressedImage = await ImageResizer.createResizedImage(
          photoPath,
          800,
          800,
          "JPEG",
          50,
          0,
        );
      }

      // 🔥 Safe path
      const compressedUri =
        Platform.OS === "android"
          ? "file://" + compressedImage.uri.replace("file://", "")
          : compressedImage.uri;

      console.log("🗜️ Compressed Image:", compressedUri);

      // 🔥 API CALL (compressed image)
      const result = await verifyFace(compressedUri);

      if (!result) {
        Alert.alert("Error", "Face verification failed");
        return;
      }

      const confidence = result.confidence;

      console.log("🎯 Confidence:", confidence);

      if (confidence > 75) {
        onCapture(compressedUri);
        navigation.goBack();
      } else {
        setAlertVisible(true);
        setAlertConfig({
          title: "Face not matched ",
          message: `The captured face does not match with your profile image. Please try again.`,
          type: "error",
        });
      }
    } catch (error) {
      console.log("❌ Error:", error);
    } finally {
      setLoading(false); // loader stop
    }
  };

  const takePhoto = async () => {
    try {
      const photo = await camera?.current?.takePhoto({
        qualityPrioritization: "speed",
        flash: "off",
        enableAutoRedEyeReduction: true,
        skipMetadata: false,
        enableShutterSound: user?.company_code?.toLowerCase()?.includes("oeuvre01") ? false : true,
        quality: 0.3,
        width: 640,
        height: 480,
      });

      const photoPath = photo?.path;
      let compressedImage;
      try {
        compressedImage = await ImageResizer.createResizedImage(
          photoPath,
          600,
          600,
          "JPEG",
          60,
          0,
          undefined,
          false,
          { mode: "contain" },
        );
      } catch (err) {
        console.log("⚠️ Primary compression failed, fallback...");

        compressedImage = await ImageResizer.createResizedImage(
          photoPath,
          400,
          400,
          "JPEG",
          50,
          0,
        );
      }

      onCapture(compressedImage?.uri);
      navigation.goBack();
    } catch (error) {
      console.log("❌ error++++++", error);
    }
  };

  const format = useCameraFormat(device, [
    { photoResolution: { width: 1280, height: 1280 } }, // 🔥 prevents crash
  ]);

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text>Requesting Camera Permission...</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <Text>Loading Camera...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Camera */}
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 10 }}>
            Face verifying...
          </Text>
        </View>
      )}

      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        frameProcessor={ isFromAttendance ? ATTENDANCE_LEVEL === 1 ? frameProcessor : undefined : undefined}
        frameProcessorFps={isFromAttendance ? ATTENDANCE_LEVEL === 1 ? 3 : undefined : undefined}
        format={format}
      />

      {/* Header */}
      <View
        style={[
          styles.header,
          isLandscape && {
            top: 10,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            if (isFromDashboard) {
              navigation.goBack();

              setTimeout(() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                }
              }, 1);
            } else {
              navigation.goBack();
            }
          }}
        >
          <MaterialIcons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>

        {
         isFromAttendance && ATTENDANCE_LEVEL === 1 ? <Text style={styles.title}>Face Verification</Text> : <Text style={styles.title}>Capture photo</Text>
        }

        <View style={{ width: 30 }} />
      </View>
      <View style={styles.faceFrameContainer}>
        <View
          style={[
            styles.faceFrame,
            !isLandscape && {
              borderWidth: isFromAttendance && ATTENDANCE_LEVEL === 1 ? 1 : 0,

              borderColor: isFromAttendance && ATTENDANCE_LEVEL === 1 ? faceDetected ? "#00ff00" : "#ff3b30" : "",
            },
          ]}
        />
      </View>

      {
       isFromAttendance && ATTENDANCE_LEVEL === 1 && <View
          style={[
            styles.messageContainer,
            isLandscape && {
              top: 50,
            },
          ]}
        >
          <Text style={styles.message}>
            {faceDetected ? "Face Detected" : "Align your face in the frame"}
          </Text>
        </View>
      }


      <View style={styles.bottomContainer}>
        <View
          style={[styles.captureOuter2,]}
        >

        </View>

        <TouchableOpacity
          disabled={isFromAttendance && ATTENDANCE_LEVEL === 1 ? !faceDetected : false}
          onPress={takePhoto}
          style={[styles.captureOuter, { opacity: isFromAttendance && ATTENDANCE_LEVEL === 1 ? faceDetected ? 1 : 0.4 : 1 }]}
        >
          <View style={styles.captureInner} >
            <MaterialIcons name="camera" size={24} color="#000" />
          </View>
        </TouchableOpacity>
        {
          (isBackActive ||  ATTENDANCE_LEVEL === 0) ? <TouchableOpacity
            onPress={toggleCamera}
            style={[styles.captureOuter, { opacity: isFromAttendance && ATTENDANCE_LEVEL === 1 ? faceDetected ? 1 : 0.4 : 1 }]}
          >
            <View style={styles.captureInner3} >
              <MaterialIcons name="settings-backup-restore" size={34} color="#000" />
            </View>
          </TouchableOpacity> : <View
            style={[styles.captureOuter2,]}
          >

          </View>
        }


      </View>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => {
          setAlertVisible(false);
        }}
        actionLoader={undefined}
        closeHide={undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  header: {
    position: "absolute",
    top: Platform.OS === "android" ? 20 : 30,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    // backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
    paddingVertical: 12,
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  faceFrameContainer: {
    position: "absolute",
    top: "18%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  faceFrame: {
    width: Dimensions.get("screen").width * 0.94,
    height: Dimensions.get("screen").height * 0.5,
    borderRadius: 10,
  },

  messageContainer: {
    position: "absolute",
    top: "11%",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },

  message: {
    color: "#fff",
    fontSize: 14,
  },

  bottomContainer: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
  },

  captureOuter2: {
    width: 80,
    height: 80,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  captureOuter: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: "#d8d4d4",
    justifyContent: "center",
    alignItems: "center",
  },
captureInner3: {
    width: 55,
    height: 55,
    borderRadius: 10,
    backgroundColor: "#d8d4d4",
    justifyContent: "center",
    alignItems: "center",
  },
  captureInner: {
    width: 55,
    height: 55,
    borderRadius: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FaceCameraScreen;

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  BackHandler,
  Linking,
  Modal,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
} from "react-native";
import Sound from "react-native-sound";
import { useIsFocused } from "@react-navigation/native";
import { RNHoleView } from "react-native-hole-view";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import {
  Camera,
  CameraRuntimeError,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera";
import { useTranslation } from "react-i18next";

import { styles } from "./CameraScanner.styles";
import { useAppStateListener } from "../../hooks/useAppStateListener";
import { ICameraScannerProps } from "../../utils/helpers/types";
import { getWindowHeight, getWindowWidth } from "../../utils/helpers";
import { ui } from "./style";
import { ERP_SOUNDS } from "../../assets";

export const BarCodeCameraScanner = ({
  setIsCameraShown,
  onReadCode,
}: ICameraScannerProps) => {
  const { t } = useTranslation();
  const device = useCameraDevice("back");
  const isFocused = useIsFocused();
  const { appState } = useAppStateListener();
  const { hasPermission, requestPermission } = useCameraPermission();
  const beepSoundRef = useRef<Sound | null>(null);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  const scannedRef = useRef(false);
  const permissionAlertShownRef = useRef(false);
  const requestingPermissionRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);

  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const [flash, setFlash] = useState<"on" | "off">("off");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [codeScanned, setCodeScanned] = useState<string | null>(null);
  const [permissionRetry, setPermissionRetry] = useState(0);

  const closeScanner = useCallback(() => {
    setIsCameraShown(false);
  }, [setIsCameraShown]);

  const openSettings = useCallback(() => {
    closeScanner();

    Linking.openSettings().catch(error => {
      console.error("[BarCodeCameraScanner] Settings error:", error);

      Alert.alert(
        "Unable to Open Settings",
        "Please open your device settings manually and enable camera permission.",
      );
    });
  }, [closeScanner]);

  const showPermissionAlert = useCallback(() => {
    if (permissionAlertShownRef.current) {
      return;
    }

    permissionAlertShownRef.current = true;

    Alert.alert(
      "Camera Permission Required",
      "Camera access is required to scan barcodes. Please allow camera permission to continue.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: closeScanner,
        },
        {
          text: "Open Settings",
          onPress: openSettings,
        },
      ],
      { cancelable: false },
    );
  }, [closeScanner, openSettings]);

  console.log("ERP_SOUNDS.BEEP:", ERP_SOUNDS.BEEP);
  console.log("Type:", typeof ERP_SOUNDS.BEEP);


  useEffect(() => {
    Sound.setCategory("Playback");

    const sound = new Sound(
      "beep.mp3",
      Sound.MAIN_BUNDLE,
      (error) => {
        if (error) {
          console.error("[BarCodeCameraScanner] Beep load failed:", error);
          return;
        }

        beepSoundRef.current = sound;
        console.log("[BarCodeCameraScanner] Beep loaded successfully");
      },
    );

    return () => {
      beepSoundRef.current = null;
      sound.release();
    };
  }, []);

  const playBeep = useCallback(() => {
    const sound = beepSoundRef.current;

    if (!sound) {
      console.warn("[BarCodeCameraScanner] Beep sound is not loaded yet.");
      return;
    }

    sound.stop(() => {
      sound.setCurrentTime(0);
      sound.play((success) => {
        if (!success) {
          console.warn("[BarCodeCameraScanner] Beep playback failed.");
        }
      });
    });
  }, []);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    if (isActive) {
      animation.start();
    }

    return () => {
      animation.stop();
      scanLineAnim.setValue(0);
    };
  }, [isActive, scanLineAnim]);

  useEffect(() => {
    let cancelled = false;

    const requestCameraAccess = async () => {
      if (!isFocused || requestingPermissionRef.current) {
        return;
      }

      if (hasPermission) {
        setPermissionDenied(false);
        permissionAlertShownRef.current = false;
        return;
      }

      requestingPermissionRef.current = true;

      try {
        const granted = await requestPermission();

        if (cancelled) {
          return;
        }

        if (granted) {
          setPermissionDenied(false);
          permissionAlertShownRef.current = false;
        } else {
          setPermissionDenied(true);
          showPermissionAlert();
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "[BarCodeCameraScanner] Permission request failed:",
            error,
          );

          setPermissionDenied(true);
          showPermissionAlert();
        }
      } finally {
        requestingPermissionRef.current = false;
      }
    };

    requestCameraAccess();

    return () => {
      cancelled = true;
    };
  }, [
    isFocused,
    hasPermission,
    requestPermission,
    showPermissionAlert,
    permissionRetry,
  ]);


  console.log("[CameraScanner] DEBUG", {
    hasPermission,
    permissionDenied,
    deviceAvailable: Boolean(device),
    deviceId: device?.id,
    isFocused,
    appState,
    isCameraInitialized,
    isActive:
      hasPermission &&
      Boolean(device) &&
      isFocused &&
      appState === "active" &&
      isCameraInitialized &&
      !codeScanned &&
      !permissionDenied,
  });
  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextState => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;

      if (
        previousState.match(/inactive|background/) &&
        nextState === "active" &&
        isFocused
      ) {
        setIsCameraInitialized(false);
        setPermissionRetry(value => value + 1);
      }
    });

    return () => subscription.remove();
  }, [isFocused]);

  useEffect(() => {
    if (!isFocused) {
      scannedRef.current = false;
      permissionAlertShownRef.current = false;
      setCodeScanned(null);
      setIsCameraInitialized(false);
      setFlash("off");
      setPermissionDenied(false);
    }
  }, [isFocused]);

  useEffect(() => {
    if (codeScanned) {
      onReadCode(codeScanned);
      closeScanner();
    }
  }, [codeScanned, onReadCode, closeScanner]);

  const codeScanner = useCodeScanner({
    codeTypes: [
      "qr",
      "ean-13",
      "ean-8",
      "code-128",
      "code-39",
      "codabar",
      "itf",
      "upc-a",
      "upc-e",
    ],
    onCodeScanned: codes => {
      if (scannedRef.current) {
        return;
      }

      const value = codes.find(code => Boolean(code.value))?.value;

      if (value) {
        scannedRef.current = true;
        playBeep();
        setCodeScanned(value);
      }
    },
  });

  const onInitialized = useCallback(() => {
    setIsCameraInitialized(true);
  }, []);

  const onError = useCallback(
    (error: CameraRuntimeError) => {
      console.error(
        "[BarCodeCameraScanner]",
        error.code,
        error.message,
      );

      Alert.alert(
        "Camera Error",
        `${error.message}\n\nPlease check your camera permission and try again.`,
        [
          {
            text: "OK",
            onPress: closeScanner,
          },
        ],
      );
    },
    [closeScanner],
  );

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        closeScanner();
        return true;
      },
    );

    return () => subscription.remove();
  }, [isFocused, closeScanner]);

  const isActive =
    hasPermission &&
    Boolean(device) &&
    isFocused &&
    appState === "active" &&
    isCameraInitialized &&
    !codeScanned &&
    !permissionDenied;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Modal
        visible
        presentationStyle="fullScreen"
        supportedOrientations={["portrait", "landscape"]}
        animationType="slide"
        onRequestClose={closeScanner}
      >
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          {hasPermission && device && !permissionDenied && (
            <Camera
              device={device}
              style={styles.fullScreenCamera}
              isActive={isActive}
              codeScanner={codeScanner}
              photo={false}
              torch={flash}
              onInitialized={onInitialized}
              onError={onError}
            />
          )}

          {(!hasPermission || !device || !isCameraInitialized) && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#111",
                padding: 24,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                {!hasPermission
                  ? "Camera permission is required. Please allow access to continue."
                  : !device
                    ? "Back camera is not available on this device."
                    : "Loading camera..."}
              </Text>

              {!hasPermission && (
                <TouchableOpacity
                  onPress={() => {
                    permissionAlertShownRef.current = false;
                    setPermissionRetry(value => value + 1);
                  }}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    backgroundColor: "#1565C0",
                    borderRadius: 8,
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    Try Again
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={closeScanner}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                }}
              >
                <Text style={{ color: "#fff" }}>Close Scanner</Text>
              </TouchableOpacity>
            </View>
          )}

          {hasPermission && device && !permissionDenied && (
            <>
              <RNHoleView
                holes={[
                  {
                    x: (getWindowWidth() - 350) / 2,
                    y: (getWindowHeight() - 250) / 2,
                    width: 350,
                    height: 200,
                    borderRadius: 8,
                  },
                ]}
                style={[
                  styles.rnholeView,
                  {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "black",
                  },
                ]}
              />

              {/* Green scanning frame + animated wave */}
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left: (getWindowWidth() - 350) / 2,
                  top: (getWindowHeight() - 250) / 2,
                  width: 350,
                  height: 200,
                  borderWidth: 2,
                  borderColor: "#095227",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <Animated.View
                  style={{
                    position: "absolute",
                    top: (getWindowHeight() - 250) / 2,
                    width: 250,
                    height: 2,
                    backgroundColor: "#1f653b",
                    zIndex: 10,
                    elevation: 10,
                    shadowColor: "#00FF66",
                    shadowOpacity: 0.8,
                    shadowRadius: 5,
                    transform: [
                      {
                        translateY: scanLineAnim.interpolate({
                          inputRange: [0, 1], outputRange: [0, 248],
                        }),
                      },
                    ],
                  }}
                />
              </View>

              <TouchableOpacity
                style={ui.backButton}
                onPress={closeScanner}
                accessibilityRole="button"
                accessibilityLabel="Close scanner"
              >
                <MaterialIcons
                  name="arrow-back"
                  size={30}
                  color="#fff"
                />
              </TouchableOpacity>

              <View style={ui.descriptionBox}>
                <Text style={ui.descriptionText}>{t("test17")}</Text>
              </View>

              <View style={ui.bottomPanel}>
                <Text style={ui.bottomText}>{t("test18")}</Text>
              </View>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default BarCodeCameraScanner;
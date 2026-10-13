import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import Sound from "react-native-sound";
import { styles } from "./CameraScanner.styles";
import { RNHoleView } from "react-native-hole-view";
import {
  Camera,
  CameraRuntimeError,
  useCameraDevice,
  useCodeScanner,
} from "react-native-vision-camera";
import { useIsFocused } from "@react-navigation/native";
import { useAppStateListener } from "../../hooks/useAppStateListener";
import { ICameraScannerProps } from "../../utils/helpers/types";
import { getWindowHeight, getWindowWidth, isIos } from "../../utils/helpers";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { useTranslation } from "react-i18next";
import { uiStyles } from "./style";

export const CameraScanner = ({
  setIsCameraShown,
  onReadCode,
  item,
  onValueChange
}: ICameraScannerProps) => {

  const { t } = useTranslation();
  const device = useCameraDevice("back");
  const camera = useRef<Camera>(null);
  const isFocused = useIsFocused();
  const { appState } = useAppStateListener();

  const [isCameraInitialized, setIsCameraInitialized] = useState(isIos);
  const [isActive, setIsActive] = useState(isIos);
  const [flash, setFlash] = useState<"on" | "off">(isIos ? "off" : "on");
  const [codeScanned, setCodeScanned] = useState("");
  const beepSoundRef = useRef<Sound | null>(null);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (codeScanned) {
      onReadCode(codeScanned);
    }
  }, [codeScanned, onReadCode]);

  useEffect(() => {
    let timeout: any;

    if (isCameraInitialized) {
      timeout = setTimeout(() => {
        setIsActive(true);
        setFlash("off");
      }, 1000);
    }
    setIsActive(false);
    return () => {
      clearTimeout(timeout);
    };
  }, [isCameraInitialized]);


  useEffect(() => {
    Sound.setCategory("Playback");

    const sound = new Sound(
      "beep.mp3",
      (error) => {
        if (error) {
          console.error("[BarCodeCameraScanner] Beep load failed:", error);
          return;
        }

        beepSoundRef.current = sound;
      },
    );

    return () => {
      beepSoundRef.current = null;
      sound.release();
    };
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

  const onInitialized = () => setIsCameraInitialized(true);

  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && codes[0].value) {
        setIsActive(false);
        setTimeout(() => {
          playBeep();
          setCodeScanned(codes[0]?.value)
        }, 500);
      }
    },
  });

  const onCrossClick = () => setIsCameraShown(false);

  const onError = (error: CameraRuntimeError) => {
    Alert.alert("Error!", error.message);
  };

  if (device == null) {
    Alert.alert("Error!", "Camera could not be started");
  }

  if (isFocused && device) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Modal
          supportedOrientations={["portrait", "landscape"]}
          presentationStyle="fullScreen"
          animationType="slide"
        >
          {/* ---------- Header ---------- */}
          <View style={uiStyles.header}>
            <Text style={uiStyles.headerTitle}>{t("test19")}</Text>
            <TouchableOpacity style={uiStyles.closeBtn} onPress={onCrossClick}>
              <MaterialIcons name="close" size={26} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* ---------- Description ---------- */}
          <View style={uiStyles.descriptionContainer}>
            <Text style={uiStyles.descriptionText}>{t("test20")}</Text>
          </View>

          {/* ---------- Camera ---------- */}
          <Camera
            torch={flash}
            onInitialized={onInitialized}
            ref={camera}
            onError={onError}
            photo={false}
            style={styles.fullScreenCamera}
            device={device}
            codeScanner={codeScanner}
            isActive={
              isActive &&
              isFocused &&
              appState === "active" &&
              isCameraInitialized
            }
          />

          {/* ---------- Scanning Window ---------- */}
          <RNHoleView
            holes={[
              {
                x: (getWindowWidth() - 250) / 2,
                y: (getWindowHeight() - 250) / 2,
                width: 250,
                height: 250,
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
              left: (getWindowWidth() - 250) / 2,
              top: (getWindowHeight() - 250) / 2,
              width: 250,
              height: 250,
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
                backgroundColor: "#04a045",
                zIndex: 10,
                elevation: 10,
                shadowColor: "#04a045",
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
          {/* ---------- Bottom Fade Panel ---------- */}
          <View style={uiStyles.bottomPanel}>
            <Text style={uiStyles.bottomText}>{t("test18")}</Text>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }
};

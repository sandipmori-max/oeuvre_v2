import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Linking,
  BackHandler,
  Animated,
  Easing,
  useWindowDimensions,
  Platform,
  Image
} from "react-native"; 

import { CustomAlertProps } from "../types";
import { getGifSource } from "../../utils/helpers";
import { styles } from "./custom_alert_style";
import { getAlertStyles } from "./helper";
import ERPTextInput from "../input/ERPTextInput";
import { ERP_COLOR_CODE } from "../../utils/constants";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { useAppSelector } from "../../store/hooks";
import { useTranslation } from "react-i18next";
import TranslatedText from "../../screens/dashboard/tabs/home/TranslatedText";
import DeviceInfo from "react-native-device-info";

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type = "info",
  onClose,
  onDone,
  onCancel,
  doneText = "Done",
  cancelText = "Cancel",
  isFromButtonList = false,
  actionLoader,
  color = ERP_COLOR_CODE.ERP_BLACK,
  isBottomButtonVisible,
  isSettingVisible,
  closeHide = false,
  isForLoading = false
}) => {
  const { t } = useTranslation();
  const alertStyles = getAlertStyles(type);
  const gifSource = getGifSource(type);
  const theme = useAppSelector((state) => state?.theme.mode);
  const { height, width } = useWindowDimensions();

  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  const containerAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  const isLandscape = width > height;
const isIpad =
   ( Platform.OS === "ios" && Platform.isPad) || DeviceInfo.isTablet() || Platform.isTV;
 
  useEffect(() => {
    if (visible) {
      Animated.stagger(120, [
        Animated.timing(containerAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(headerAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(contentAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(buttonAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      containerAnim.setValue(0);
      headerAnim.setValue(0);
      contentAnim.setValue(0);
      buttonAnim.setValue(0);
    }
  }, [visible]);

  useEffect(() => {
    const onBackPress = () => {
      if (visible) {
        onClose?.();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );
    return () => backHandler.remove();
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setRemarks("");
      setError("");
    }
  }, [visible]);

  const handleChangedRemarks = (val: string) => {
    setRemarks(val);
    if (val.trim()) setError("");
  };

  const handleDonePress = () => {
    if (isFromButtonList && !remarks.trim()) {
      setError("Please enter remarks before proceeding.");
      return;
    }
    onDone?.(remarks);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => {
        onClose();
      }}
      supportedOrientations={["portrait", "landscape"]}
    >
      <View style={[styles.overlay, (isLandscape || isIpad) && {
        alignContent: 'center',
        alignItems: 'center'
      }]}>
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              width: isLandscape || isIpad ? '50%' : '100%'
            },
            alertStyles.container,
            theme === "dark" && {
              backgroundColor: "black",
              borderWidth: 1,
              borderColor: "white",
            },
            {
              opacity: containerAnim,
              transform: [
                {
                  translateY: containerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
            },

          ]}
        >
          {/* Header */}
          <Animated.View style={{ opacity: headerAnim }}>
            <View style={styles.header}>
              <TranslatedText
                numberOfLines={2}
                text={title || ""}
                style={alertStyles.title}
              ></TranslatedText>
              {!isForLoading && !closeHide && (
                <TouchableOpacity
                  onPress={() => {
                    Animated.parallel([
                      Animated.timing(containerAnim, {
                        toValue: 0,
                        duration: 260,
                        easing: Easing.in(Easing.ease),
                        useNativeDriver: true,
                      }),
                      Animated.timing(headerAnim, {
                        toValue: 0,
                        duration: 260,
                        useNativeDriver: true,
                      }),
                    ]).start(() => {
                      onClose();
                    });
                  }}
                  style={styles.closeIcon}
                >
                  <Text style={styles.closeIconText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          {
            isForLoading && <View style={{ marginVertical: 22 }}>
              <ActivityIndicator size={'large'} color={ERP_COLOR_CODE.ERP_APP_COLOR} />
            </View>
          }
          {/* GIF */}
          {!isForLoading && !isFromButtonList && (
            <Animated.View
              style={{
                opacity: contentAnim,
                transform: [{ scale: contentAnim }],
              }}
            >
              <Image
                source={gifSource}
                style={styles.gif} 
              />
            </Animated.View>
          )}

          {/* Message / Input */}
          {
            !isForLoading && <Animated.View style={{ opacity: contentAnim }}>
              {isFromButtonList ? (
                <View style={{ width: "100%" }}>
                  <TranslatedText
                    style={[
                      alertStyles.message,
                      { textAlign: "left", fontSize: 14, fontWeight: "800" },
                    ]}
                    numberOfLines={3}
                    text={message || ""}
                  ></TranslatedText>

                  <ERPTextInput
                    label={t("test11")}
                    placeholder={t("test12")}
                    placeholderTextColor={ERP_COLOR_CODE.ERP_999}
                    autoCapitalize="none"
                    onChangeText={handleChangedRemarks}
                    value={remarks}
                    labelStyle={[
                      styles.inputLabel,
                      { fontWeight: "400", fontSize: 12 },
                    ]}
                    inputStyle={[styles.input]}
                  />

                  {error ? (
                    <TranslatedText
                      numberOfLines={3}
                      text={error}
                      style={{ color: ERP_COLOR_CODE.ERP_ERROR }}
                    ></TranslatedText>
                  ) : null}
                </View>
              ) : (
                <TranslatedText
                  numberOfLines={3}
                  text={message || ""}
                  style={alertStyles.message}
                ></TranslatedText>
              )}
            </Animated.View>

          }

          {/* Buttons */}
          {!isForLoading && isBottomButtonVisible && (
            <Animated.View
              style={{
                opacity: buttonAnim,
                transform: [
                  {
                    translateY: buttonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              }}
            >
              <View style={styles.buttonRow}>
                {onCancel && (
                  <TouchableOpacity
                    style={styles.buttonCancel}
                    onPress={() => {
                      Animated.parallel([
                        Animated.timing(containerAnim, {
                          toValue: 0,
                          duration: 260,
                          easing: Easing.in(Easing.ease),
                          useNativeDriver: true,
                        }),
                        Animated.timing(headerAnim, {
                          toValue: 0,
                          duration: 260,
                          useNativeDriver: true,
                        }),
                      ]).start(() => {
                        setRemarks("");
                        setError("");
                        onCancel();
                      });
                    }}
                  >
                    <Text style={styles.cancelButtonText}>{cancelText}</Text>
                  </TouchableOpacity>
                )}

                {onDone &&
                  (actionLoader ? (
                    <TouchableOpacity style={styles.buttonCancel}>
                      <ActivityIndicator
                        size="small"
                        color={ERP_COLOR_CODE.ERP_BLACK}
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: color }]}
                      onPress={() => {
                        setRemarks("");
                        setError("");
                        handleDonePress();
                      }}
                    >
                      <Text style={styles.buttonText}>{doneText}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </Animated.View>
          )}

          {/* Settings */}
          {!isForLoading && isSettingVisible && (
            <Animated.View style={{ opacity: buttonAnim }}>
              <TouchableOpacity onPress={() => Linking.openSettings()}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <MaterialIcons name="settings" size={20} color="#000" />
                  <Text
                    style={{
                      color: ERP_COLOR_CODE.ERP_BLACK,
                      fontWeight: "600",
                      fontSize: 16,
                    }}
                  >
                    {t("test10")}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CustomAlert;

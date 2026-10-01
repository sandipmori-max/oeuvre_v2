import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  ScrollView,
  Easing,
  useWindowDimensions,
} from "react-native";
import { formatTo12Hour, getWorkedHours2 } from "../../../../utils/helpers";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import FastImage from "react-native-fast-image";
import { ERP_COLOR_CODE } from "../../../../utils/constants";
import { useAppSelector } from "../../../../store/hooks";
import useTranslations from "../../../../hooks/useTranslations";
import ImageBottomSheetModal from "../../../../components/bottomsheet/ImageBottomSheetModal";
import TranslatedText from "../../tabs/home/TranslatedText";
import NoData from "../../../../components/no_data/NoData";
import { ERP_GIF } from "../../../../assets";

const DetailsBottomSheet = ({ visible, onClose, item, baseLink }: any) => {
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const theme = useAppSelector((state) => state?.theme.mode);
  const { t } = useTranslations();
  const [showImgModal, setShowImgModal] = useState(false);
  const [img, setImg] = useState("");
  const sheetTranslateY = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: -350,
            useNativeDriver: true,
          }),
          Animated.timing(sheetTranslateY, {
            toValue: 0,
            duration: -950,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 350,
          delay: 60,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      sheetTranslateY.setValue(height);
      backdropOpacity.setValue(0);
      contentOpacity.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      onRequestClose={onClose}
      supportedOrientations={["portrait", "landscape"]}
    >
      <Animated.View
        style={[
          {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "flex-end",
            opacity: backdropOpacity,
          },
          isLandscape && {
            width: "100%",
            alignContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Animated.View
          style={[
            {
              backgroundColor:
                theme === "dark" ? "black" : ERP_COLOR_CODE.ERP_WHITE,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 16,
              transform: [{ translateY: sheetTranslateY }],
            },
            !isLandscape && {
              height: height * 0.45,
            },
            isLandscape && {
              width: "50%",
            },

            theme === "dark" && {
              borderWidth: 1,
              borderColor: "white",
            },
          ]}
        >
          {/* Close */}
          <Animated.View style={{ opacity: contentOpacity }}>
            <TouchableOpacity
              onPress={onClose}
              style={{ alignSelf: "flex-end", padding: 6 }}
            >
              <MaterialIcons
                name="close"
                size={28}
                color={theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_333}
              />
            </TouchableOpacity>
          </Animated.View>

          {item ? (
            <ScrollView 
              bounces={false}
            showsVerticalScrollIndicator={false}>
              {/* Images */}
              <Animated.View
                style={{
                  opacity: contentOpacity,
                  transform: [
                    {
                      translateY: contentOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0], // ⭐ visible movement
                      }),
                    },
                  ],
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  {item?.image && (
                    <TouchableOpacity
                      onPress={() => {
                        setImg(`${baseLink}/${item?.image}`);
                        setShowImgModal(true);
                      }}
                    >
                      <FastImage
                        source={{ uri: baseLink + "/" + item?.image }}
                        style={{ width: 80, height: 80, borderRadius: 40 }}
                      />
                    </TouchableOpacity>
                  )}
                  {item?.image2 && (
                    <TouchableOpacity
                      onPress={() => {
                        setImg(`${baseLink}/${item?.image2}`);
                        setShowImgModal(true);
                      }}
                    >
                      <FastImage
                        source={{ uri: baseLink + "/" + item?.image2 }}
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 40,
                          marginLeft: -20,
                        }}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </Animated.View>

              {/* Name */}
              <Animated.Text
                style={{
                  opacity: contentOpacity,
                  transform: [
                    {
                      translateY: contentOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: "700",
                  color: theme === "dark" ? "white" : "black",
                }}
              >
                {item?.employee}
              </Animated.Text>

              {/* Status */}
              <Animated.Text
                style={{
                  opacity: contentOpacity,
                  textAlign: "center",
                  marginBottom: 16,
                  color: ERP_COLOR_CODE.ERP_666,
                }}
              >
                {item?.status?.toUpperCase()}
              </Animated.Text>
              {/* Card */}
              <Animated.View
                style={{
                  opacity: contentOpacity,
                  transform: [
                    {
                      translateY: contentOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [40, 0],
                      }),
                    },
                  ],
                  backgroundColor: theme === "dark" ? "black" : "#f5f5f5",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                {/* content unchanged */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      color:
                        theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_444,
                    }}
                  >
                    {t("text.text4")}
                  </Text>
                  <TranslatedText
                    numberOfLines={1}
                    text={item?.date}
                    style={{
                      fontWeight: "600",
                      color: theme === "dark" ? "white" : "black",
                    }}
                  ></TranslatedText>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      color:
                        theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_444,
                    }}
                  >
                    {t("text.text5")}
                  </Text>
                  <TranslatedText
                    numberOfLines={1}
                    text={formatTo12Hour(item?.intime) || "--"}
                    style={{
                      fontWeight: "600",
                      color: theme === "dark" ? "white" : "black",
                    }}
                  ></TranslatedText>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      color:
                        theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_444,
                    }}
                  >
                    {t("text.text6")}
                  </Text>
                  <TranslatedText
                    numberOfLines={1}
                    text={formatTo12Hour(item?.outtime) || "--"}
                    style={{
                      fontWeight: "600",
                      color: theme === "dark" ? "white" : "black",
                    }}
                  ></TranslatedText>
                </View>

                {
                  item?.workinghours &&   item?.workinghours  !== '00:00' && <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      color:
                        theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_444,
                    }}
                  >
                    {t("text.text7")}
                  </Text>
                  <TranslatedText
                    numberOfLines={1}
                    text={item?.workinghours}
                    style={{
                      fontWeight: "600",
                      color: theme === "dark" ? "white" : "black",
                    }}
                  ></TranslatedText>
                </View>

                }
                 {
                 item?.latein && item?.latein !== '00:00' &&  <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                     marginVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      color:
                        theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_444,
                    }}
                  >
                    Late in
                  </Text>
                  <TranslatedText
                    numberOfLines={1}
                    text={item?.latein}
                    style={{
                      fontWeight: "600",
                      color: theme === "dark" ? "white" : "black",
                    }}
                  ></TranslatedText>
                </View>
                }

                {
                 item?.earlyout && item?.earlyout !== '00:00' &&  <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                     marginVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      color:
                        theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_444,
                    }}
                  >
                    Early out
                  </Text>
                  <TranslatedText
                    numberOfLines={1}
                    text={item?.earlyout}
                    style={{
                      fontWeight: "600",
                      color: theme === "dark" ? "white" : "black",
                    }}
                  ></TranslatedText>
                </View>
                }

                {
                  item?.overtime && item?.overtime !== '00:00' &&   <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                     marginVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      color:
                        theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_444,
                    }}
                  >
                    Overtime
                  </Text>
                  <TranslatedText
                    numberOfLines={1}
                    text={item?.overtime}
                    style={{
                      fontWeight: "600",
                      color: theme === "dark" ? "white" : "black",
                    }}
                  ></TranslatedText>
                </View>
                }


              </Animated.View>
            </ScrollView>
          ) : (
            <View style={{justifyContent : 'center', alignContent:'center', alignItems:'center'}}>
              <FastImage
                source={ERP_GIF.NO_DATA}
                style={[
                  {
                    width: width * 0.3,
                    height: width * 0.4,
                  },
                ]}
                resizeMode="contain"
              />
              <Text style={{marginVertical: 10}}>
                {t("test8")}
              </Text>
              <Text style={{textAlign:'center'}}>
                {t("test9")}
              </Text>
            </View>
          )}
        </Animated.View>

        <ImageBottomSheetModal
          visible={showImgModal}
          onClose={() => setShowImgModal(false)}
          imageUrl={img}
        />
      </Animated.View>
    </Modal>
  );
};

export default DetailsBottomSheet;

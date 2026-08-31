import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Image,
  Animated,
  PanResponder,
  LayoutAnimation,
  UIManager,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Linking } from 'react-native';
import { formatDateList } from "../../../../utils/helpers";
import { styles } from "../list_page_style";
import NoData from "../../../../components/no_data/NoData";
import { ERP_COLOR_CODE } from "../../../../utils/constants";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { useAppSelector } from "../../../../store/hooks";
import useTranslations from "../../../../hooks/useTranslations";
import ImageBottomSheetModal from "../../../../components/bottomsheet/ImageBottomSheetModal";
import RemarksView from "./RemarksView";
import MemoizedFooterView from "./MemoizedFooterView";
import DeviceInfo from "react-native-device-info";
import Share from 'react-native-share';
import RNFS from "react-native-fs";
import AbhaUserItem from "../../../../abha/screens/Profile/AbhaUserItem";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SwipeableRow = ({ children, onDelete, id }: any) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const rowWidth = useRef(0);
  const DISMISS_THRESHOLD = -120;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5,
      onPanResponderMove: (_, g) => {
        if (g.dx < 0) translateX.setValue(g.dx);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < DISMISS_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: -rowWidth.current,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut,
            );
            onDelete && onDelete(id);
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <View
      onLayout={(e) => (rowWidth.current = e.nativeEvent.layout.width)}
      style={{ backgroundColor: ERP_COLOR_CODE.ERP_WHITE }}
    >
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          transform: [{ translateX }],
          backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
        }}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const ReadableView = ({
  configData,
  filteredData,
  loadingListId,
  totalAmount,
  pageParamsName,
  pageName,
  handleActionButtonPressed,
  setIsFilterVisible,
  setSearchQuery,
  totalQty,
  isFromBusinessCard,
  isFromAlertCard,
  handleDeleteNotification,
  loadMore,
  isLoadingMore,
  parsedConfig,
  handleAbhaClicked
}: any) => {
  const { t } = useTranslations();
  const navigation = useNavigation();
  const screenWidth = Dimensions.get("window").width;
  const [listData, setListData] = useState(filteredData || []);
  const theme = useAppSelector((state) => state?.theme?.mode);
  console.log(
    "Rendering+++++++++++++ TableView with data length:",
    parsedConfig,
    filteredData,
  );
  const isIpad =
    (Platform.OS === "ios" && Platform.isPad) || DeviceInfo.isTablet() || Platform.isTV;
  const slideAnim = useRef(new Animated.Value(300)).current; // right se start

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    setListData(filteredData);
  }, [filteredData]);
  const handleDelete = (item) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    handleDeleteNotification(item);
    // setListData((prev) => prev.filter((_, idx) => idx !== id));
  };

  const getButtonMeta = (key: string) => {
    if (!key || !configData?.length)
      return { label: "Action", color: ERP_COLOR_CODE.ERP_COLOR };
    const configItem = configData.find(
      (cfg) => cfg.datafield?.toLowerCase() === key.toLowerCase(),
    );
    return {
      label: configItem?.headertext || "Action",
      color: configItem?.colorcode || ERP_COLOR_CODE.ERP_APP_COLOR,
    };
  };
  const accentColors = [
    "#dbe0f5ff",
    "#c8f3edff",
    "#faf1e0ff",
    "#f0e1e1ff",
    "#f2e3f8ff",
    "#e0f3edff",
    "#eaf1fbff",
    "#e9f7f1ff",
    "#fff4e6ff",
    "#f5edf7ff",
    "#eef6eaff",
  ];

  const RenderCard = ({ item, index }: any) => {
    const bgColor = accentColors[index % accentColors.length];

    const [showModal, setShowModal] = useState(false);
    const [img, setImg] = useState("");

    if (!item) return null;
    const name = item?.name?.toString() || `-`;
    const subName = item?.number || `-`;

    const status = item?.status;
    const date = item?.date;
    const remarks = item?.remarks;
    
    const address = item?.address;
    const amount = item?.amount;
    const btnKeys = Object.keys(item).filter((key) => key.startsWith("btn_"));
    const baseUrl = Platform.OS === "android"
                                        ? item.image?.replace("https://", "http://")
                                        : item.image + `?t=${Date.now()}`
    const authUser = item?.authuser;
    const qty = item?.qty;

    const shareTextToWhatsApp = async () => {
      const phone = '918154877969';
      const text = encodeURIComponent('Hello Sandip');

      try {
        await Linking.openURL(
          `whatsapp://send?phone=${phone}&text=${text}`,
        );
      } catch {
        await Linking.openURL(
          `https://wa.me/${phone}?text=${text}`,
        );
      }
    };

    const sharePdf = async () => {
      try {
        const pdfUrl = 'https://pdfobject.com/pdf/sample.pdf';

        const localFile =
          `${RNFS.DocumentDirectoryPath}/sample.pdf`;

        await RNFS.downloadFile({
          fromUrl: pdfUrl,
          toFile: localFile,
        }).promise;

        await Share.open({
          url: `file://${localFile}`,
          type: 'application/pdf',
          failOnCancel: false,
        });
      } catch (e) {
        console.log(e);
      }
    };

    const openShareDialog = async () => {
      try {
        await Share.open({
          message: 'Hello from React Native',
          failOnCancel: false,
        });
      } catch (e) {
        console.log(e);
      }
    };
    const { user } = useAppSelector((state) => state.auth);
    const avatarLetter =
      typeof name === "string" && name.trim() !== ""
        ? name
          .trim()
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((w) => w.charAt(0).toUpperCase())
          .join("")
        : (name || "").toString().substring(0, 2).toUpperCase();

    const card = (
      <>
        <View
          style={[{
            backgroundColor:
              theme === "dark"
                ? "black"
                : isFromAlertCard
                  ? "#f8fff8ff"
                  : ERP_COLOR_CODE.ERP_WHITE,
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingBottom: 6,
            marginVertical: 2.5,
            marginHorizontal: 8,
            paddingTop: 6,
            borderWidth: 0.4,
            borderColor:
              theme === "dark"
                ? ERP_COLOR_CODE.ERP_BORDER
                : ERP_COLOR_CODE.ERP_999,
            width: isIpad ? isLandscape ? '32%' : '48%' : isLandscape ? "48%" : "96%",
            overflow: "hidden",
          },
          item?.color && 
          {
            backgroundColor : item?.color
          }
        ]}
        >
          {/* main touchable */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              {
                flexDirection: "row",
              },
              status && {
                alignItems: "center",
              },
            ]}
            onPress={async () => {
              if (!parsedConfig) {
                return;
              }
              if (authUser) return;
              if (
                parsedConfig?.editentry === 1 ||
                parsedConfig?.editentry === "1"
              ) {
                // setIsFilterVisible(false);
                setSearchQuery("");
                navigation.navigate("Page", {
                  item,
                  title: pageParamsName,
                  id: item?.id,
                  url: pageName,
                  isFromBusinessCard,
                });
              }
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 6,
                backgroundColor: bgColor,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
                borderWidth: 0.4,
                borderColor: ERP_COLOR_CODE.ERP_999,
              }}
            >
              {isFromAlertCard ? (
                <>
                  <MaterialIcons
                    name="notifications"
                    size={24}
                    color={ERP_COLOR_CODE.ERP_WHITE}
                  />
                </>
              ) : (
                <>
                  {item?.image && item?.image !== "" ? (
                    <TouchableOpacity
                      onPress={() => {
                        setImg(baseUrl);
                        setShowModal(true);
                      }}
                    >
                      <Image
                        source={{ uri: baseUrl }}
                        style={styles.profileImage}
                      />
                    </TouchableOpacity>
                  ) : (
                    <>
                      {user?.company_code?.toLowerCase()?.includes("deverp") ? (
                        <>
                          <MaterialIcons
                            color={"gray"}
                            size={26}
                            name="person"
                          />
                        </>
                      ) : (
                        <Text
                          style={{
                            color: "black",
                            fontWeight: "400",
                            fontSize: 16,
                          }}
                        >
                          {avatarLetter}
                        </Text>
                      )}
                    </>
                  )}
                </>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontWeight: "700",
                  color: theme === "dark" ? "white" : "black",
                }}
                numberOfLines={1}
              >
                {name}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: theme === "dark" ? "white" : "black",
                }}
                numberOfLines={1}
              >
                {subName}
              </Text>
            </View>

            <View
              style={[
                status && {
                  alignSelf: "flex-end",
                  alignItems: "flex-end",
                  justifyContent: "flex-end",
                },
              ]}
            >
              {isFromAlertCard && (
                <View
                  style={{
                    height: 12,
                    width: 12,
                    backgroundColor: "green",
                    borderRadius: 12,
                    marginBottom: 4,
                  }}
                >
                  {" "}
                </View>
              )}
              {status && (
                <Text
                  style={{
                    fontWeight: "600",
                    fontSize: 12,
                    width: "100%",
                    textAlign: "right",
                    color:
                      theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_ERROR,
                  }}
                >
                  {status}
                </Text>
              )}

              {!!date && (
                <Text
                  style={{
                    fontWeight: "800",
                    fontSize: 12,
                    color:
                      theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_APP_COLOR,
                    alignSelf: "flex-end",
                    alignItems: "flex-end",
                    textAlign: "right",
                  }}
                >
                  {formatDateList(date)}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              if (!parsedConfig) {
                return;
              }
              if (authUser) return;
              if (
                parsedConfig?.editentry === 1 ||
                parsedConfig?.editentry === "1"
              ) {
                navigation.navigate("Page", {
                  item,
                  title: pageParamsName,
                  id: item?.id,
                  url: pageName,
                  isFromBusinessCard,
                });
              }
            }}
          >
            {(remarks || address || amount) && (
              <View style={{ marginTop: 2 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ width: amount ? "70%" : "100%" }}>
                    {!!remarks && <RemarksView color={item?.color} remarks={remarks} />}
                  </View>
                  <View style={{ width: "30%", alignItems: "flex-end" }}>
                    {!qty && !!amount && (
                      <Text
                        numberOfLines={1}
                        style={{
                          textAlign: "right",
                          fontSize: 14,
                          fontWeight: "700",
                          color: "#28a745",
                        }}
                      >
                        ₹ {amount}
                      </Text>
                    )}
                  </View>
                </View>
                {!!address && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      marginBottom: 8,
                      width: "98%",
                    }}
                  >
                    <MaterialIcons
                      name="info-outline"
                      size={16}
                      color={
                        theme === "dark"
                          ? "white"
                          : ERP_COLOR_CODE.ERP_APP_COLOR
                      }
                    />
                    <Text
                      numberOfLines={2}
                      style={{
                        width: "96%",
                        color: theme === "dark" ? "white" : "black",
                      }}
                    >
                      {address.replace(/\\n/g, "\n")}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
          {
            <View>
              {amount && qty && <View
                style={{
                  marginBottom: 4,
                  borderWidth: 1,
                  borderStyle: "dashed",
                  borderColor: ERP_COLOR_CODE.ERP_BORDER_LINE,
                  opacity: 0.4,
                }}
              />}

              <View
                style={{
                  justifyContent:
                    qty && amount ? "space-between" : "flex-start",
                  width: "100%",
                  flexDirection: "row",
                }}
              >
                {!!qty && (
                  <View style={{ flexDirection: "row", width: "50%" }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        textAlign: "right",
                        fontSize: 14,
                        fontWeight: "700",
                        color: theme === "dark" ? "white" : "black",
                      }}
                    >
                      {t("text.text28")}:
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{
                        textAlign: "right",
                        fontSize: 14,
                        fontWeight: "700",
                        color: "#07581dff",
                      }}
                    >
                      {" "}
                      {qty}
                    </Text>
                  </View>
                )}
                {!!amount && !!qty && (
                  <View
                    style={{
                      flexDirection: "row",
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{
                        textAlign: "right",
                        fontSize: 14,
                        fontWeight: "700",
                        color: theme === "dark" ? "white" : "black",
                      }}
                    >
                      {t("text.text29")}:
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{
                        textAlign: "right",
                        fontSize: 14,
                        fontWeight: "700",
                        color: "green",
                      }}
                    >
                      {" "}
                      {amount}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          }

          <View>
            {item?.html && <MemoizedFooterView item={item} index={index} />}
          </View>

          {("btn_edit" in item ? item?.btn_edit !== "" : true) &&
            btnKeys?.length > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginTop: 8,
                  gap: 1,
                }}
              >
                {btnKeys?.map((key, idx) => {
                  const actionValue = item[key];
                  const { label, color } = getButtonMeta(key);

                  return (
                    <TouchableOpacity
                      key={`${key}-${idx}`}
                      style={{
                        backgroundColor: authUser ? "#C6C6C6" : color,
                        paddingHorizontal: 6,
                        paddingVertical: 4,
                        borderRadius: 4,
                        flexGrow: 1,
                        maxWidth: screenWidth / 4,
                        alignItems: "center",
                      }}
                      onPress={() => {
                        if (authUser) return;
                        handleActionButtonPressed(
                          actionValue,
                          label,
                          color,
                          item?.id,
                          item,
                        );
                      }}
                    >
                      <Text
                        style={{
                          color: ERP_COLOR_CODE.ERP_WHITE,
                          fontWeight: "600",
                          fontSize: 12,
                        }}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
        </View>
      </>
    );



    return (
      <>
        {isFromAlertCard ? (
          <SwipeableRow id={index} onDelete={() => handleDelete(item)}>
            {card}
          </SwipeableRow>
        ) : (
          <>{card}</>
        )}

        <ImageBottomSheetModal
          visible={showModal}
          onClose={() => {
            setShowModal(false);
          }}
          imageUrl={img}
        />
      </>
    );
  };

  if (!loadingListId && listData?.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor:
            theme === "dark" ? "black" : ERP_COLOR_CODE.ERP_WHITE,
        }}
      >
        <NoData isShowTop={false} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, marginTop: 0 }}>
      <FlatList
        bounces={false}

        keyExtractor={(_, index) => index.toString()}
        data={listData}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item, index }) => (<>

          {
            parsedConfig?.title.includes('ABHA') ? <AbhaUserItem
              item={item}
              onPress={(item) => {
                handleAbhaClicked(item)
                
              }}
            /> : <RenderCard item={item} index={index} />
          }
        </>

          // 
        )}
        key={isIpad ? isLandscape ? "ipad-list" : "ipad-landscape" : isLandscape ? "landscape" : "portrait"}
        numColumns={isIpad ? isLandscape ? 3 : 2 : isLandscape ? 2 : 1}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.2}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={{ padding: 20 }}>
              <Text style={{ textAlign: "center", color: "gray" }}>
                {t("text.text30")}
              </Text>
            </View>
          ) : null
        }
      />

      {listData?.length > 0 && (
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          }}
        >
          <View
            style={{
              marginTop: 6,
              padding: 8,
              borderRadius: 8,
              backgroundColor: theme === "dark" ? "#000" : "#f1f1f1",
              borderWidth: 1,
              borderColor: ERP_COLOR_CODE.ERP_ddd,
              marginBottom: 12,
              marginHorizontal: 8,
            }}
          >
            <View
              style={{
                justifyContent: "space-between",
                flexDirection: "row",
                width: "100%",
              }}
            >
              {totalQty && (
                <View style={{ flexDirection: "row", width: "50%" }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",

                      color:
                        theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_333,
                    }}
                  >
                    {t("text.text28")} :-
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: theme === "dark" ? "white" : "#28a745",
                      marginLeft: 8,
                    }}
                  >
                    {totalQty?.toFixed(2)}
                  </Text>
                </View>
              )}

              {totalAmount && (
                <View
                  style={{
                    flexDirection: "row",
                    width: "50%",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      flexShrink: 1,
                      color:
                        theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_333,
                    }}
                  >
                    {t("text.text29")} :-
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: theme === "dark" ? "white" : "#28a745",
                      marginLeft: 8,
                    }}
                  >
                    ₹ {totalAmount?.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>

            <View
              style={{ justifyContent: "space-between", flexDirection: "row" }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_333,
                }}
              >
                {listData?.length} {t("text.text31")}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

export default ReadableView;

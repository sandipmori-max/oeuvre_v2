import {
  Dimensions,
  FlatList,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Text,
  useWindowDimensions,
  SectionList,
  Platform,
} from "react-native";
import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import NoData from "../../../../components/no_data/NoData";
import FullViewLoader from "../../../../components/loader/FullViewLoader";
import ERPIcon from "../../../../components/icon/ERPIcon";
import {
  getERPConfigDataThunk,
  getERPMenuThunk,
} from "../../../../store/slices/auth/thunk";
import {
  createBookmarksTable,
  getBookmarks,
  getDBConnection,
  insertOrUpdateBookmark,
  increaseTapCount,
  createTapCountTable,
  getTopTappedMenus,
} from "../../../../utils/sqlite";
import ErrorMessage from "../../../../components/error/Error";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { ERP_COLOR_CODE } from "../../../../utils/constants";
import Toast from "../../../../components/Toast/Toast";
import { FontAwesome } from "@react-native-vector-icons/fontawesome";

import { useTranslation } from "react-i18next";
import {
  setMenuLoading,
  updateSelectedBranchIdsState,
  updateSelectedFromDateState,
  updateSelectedToDateState,
} from "../../../../store/slices/auth/authSlice";
import TranslatedText from "../home/TranslatedText";
import { styles } from "./style";
import { formatDateForAPI } from "../../../../utils/helpers";
import DeviceInfo from "react-native-device-info";
const accentColors = [
  "#dbe0f5ff",
  "#c8f3edff",
  "#faf1e0ff",
  "#f0e1e1ff",
  "#f2e3f8ff",
  "#e0f3edff",
  "#e3ecfaff",
  "#dff7f2ff",
  "#fff4e6ff",
  "#fce8e8ff",
  "#f3e8fdff",
  "#e6f7f1ff",
  "#edf2fbff",
  "#f9f5ecff",
  "#eaf4f4ff",
];
const MenuTab = ({
  type,
  headerText,
  searchPlaceholder,
  setHideTab,
  hideTab,
}: any) => {
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { menu, error, isMenuLoading, isAuthenticated, activeToken, user } =
    useAppSelector((state) => state.auth);
  const theme = useAppSelector((state) => state.theme.mode);
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const allList = menu?.filter((item) => item?.isReport === type) ?? [];
  const [isRefresh, setIsRefresh] = useState(false);
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [bookmarks, setBookmarks] = useState({});
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [showStarsOnly, setShowStarsOnly] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const isIpad =
    (Platform.OS === "ios" && Platform.isPad) || DeviceInfo.isTablet() || Platform.isTV;
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredList, setFilteredList] = useState(allList);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
    textColor: "black",
  });
  const [taps, setTaps] = useState({});

  const sortedList = [...filteredList].sort((a, b) => {
    const countA = taps[a.id] || 0;
    const countB = taps[b.id] || 0;
    return countB - countA;
  });
  const searchTimeout = useRef(null);
  const list = showStarsOnly
    ? sortedList
    : showBookmarksOnly
      ? filteredList.filter((i) => bookmarks[i.id])
      : filteredList;
  const showToast = (msg, backgroundColor, color) =>
    setToast({
      visible: true,
      message: msg,
      backgroundColor: backgroundColor,
      textColor: color,
    });
  const hideToast = () => setToast((t) => ({ ...t, visible: false }));
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: showFull ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showFull]);
  function getInitials(name) {
    if (!name) return "";

    const words = name.trim().split(/\s+/);

    const result =
      words.length === 1
        ? words[0].slice(0, 2)
        : words
          .slice(0, 2)
          .map((w) => w[0])
          .join("");

    return result.toUpperCase();
  }

  useEffect(() => {
    (async () => {
      const db = await getDBConnection();
      await createTapCountTable(db);

      const saved = await getTopTappedMenus(db, user?.id);
      setTaps(saved);
    })();
  }, [showStarsOnly]);

  // Load bookmarks
  useEffect(() => {
    (async () => {
      const db = await getDBConnection();
      await createBookmarksTable(db);
      const saved = await getBookmarks(db, user?.id);
      setBookmarks(saved);
    })();
  }, []);

  // Toggle bookmark
  const toggleBookmark = async (name, id) => {
    const updated = !bookmarks[id];
    setBookmarks((prev) => ({ ...prev, [id]: updated }));

    const db = await getDBConnection();
    await insertOrUpdateBookmark(db, id, user?.id, updated);

    showToast(
      updated ? `${name} - Bookmark added` : `${name} - Bookmark removed`,
      updated ? ERP_COLOR_CODE.ERP_green : ERP_COLOR_CODE.ERP_ERROR,
      "white",
    );
  };

  // Search effect
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      const text = (searchText ?? "").toLowerCase();

      const filtered = allList.filter((item) => {
        const name = String(item?.name ?? "").toLowerCase();
        const title = String(item?.title ?? "").toLowerCase();

        return name.includes(text) || title.includes(text);
      });

      setFilteredList(filtered);
    }, 300);
  }, [searchText, allList]);

  // Header setup
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor:
          theme === "dark" ? "black" : ERP_COLOR_CODE.ERP_APP_COLOR,

      },
      headerBackTitle: "",
      headerTintColor: "white",

      headerTitle: () =>
        showSearch ? (
          <View
            style={{
              width: isLandscape
                ? Dimensions.get("screen").width - 160
                : Dimensions.get("screen").width - 60,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder={searchPlaceholder}
              autoFocus={true}
              style={{
                flex: 1,
                backgroundColor: "#f0f0f0",
                borderRadius: 8,
                paddingHorizontal: 12,
                height: 36,
              }}
            />
            <TouchableOpacity
              style={{ marginLeft: 12 }}
              onPress={() => {
                setShowSearch(false);
                setSearchText("");
              }}
            >
              <MaterialIcons name="clear" size={24} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <TranslatedText
            text={headerText}
            numberOfLines={1}
            style={{ color: "white", fontSize: 18, fontWeight: "600" }}
          />
        ),

      headerRight: () =>
        !showSearch && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* ANIMATED ICONS */}
            <Animated.View
              style={{
                flexDirection: "row",
                alignItems: "center",
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-10, 0],
                    }),
                  },
                  {
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              }}
            >
              {!isMenuLoading && showFull && (
                <>
                  <ERPIcon
                    name={isHorizontal ? "dashboard" : "list"}
                    onPress={() => setIsHorizontal((p) => !p)}
                  />

                  <ERPIcon
                    name={!showBookmarksOnly ? "bookmark-outline" : "bookmark"}
                    onPress={() => {
                      setShowStarsOnly(false);
                      setShowBookmarksOnly((p) => !p);
                    }}
                  />

                  <ERPIcon
                    name={!showStarsOnly ? "trending-down" : "trending-up"}
                    onPress={() => {
                      setShowBookmarksOnly(false);
                      setShowStarsOnly((p) => !p);
                    }}
                  />

                  <ERPIcon
                    name={!hideTab ? "fullscreen" : "fullscreen-exit"}
                    onPress={() => setHideTab(!hideTab)}
                  />
                </>
              )}
            </Animated.View>
            <ERPIcon
              isLoading={isMenuLoading}
              name="refresh"
              onPress={() => setIsRefresh(!isRefresh)}
            />
            {/* ALWAYS VISIBLE BUTTON (FIX) */}
            {!isMenuLoading && allList.length > 5 && (
              <ERPIcon name="search" onPress={() => setShowSearch(true)} />
            )}

            <>
              <ERPIcon
                name={isHorizontal ? "dashboard" : "list"}
                onPress={() => setIsHorizontal((p) => !p)}
              />

              <ERPIcon
                name={!showBookmarksOnly ? "bookmark-outline" : "bookmark"}
                onPress={() => {
                  setShowStarsOnly(false);
                  setShowBookmarksOnly((p) => !p);
                }}
              />

              <ERPIcon
                name={!showStarsOnly ? "trending-down" : "trending-up"}
                onPress={() => {
                  setShowBookmarksOnly(false);
                  setShowStarsOnly((p) => !p);
                }}
              />

              <ERPIcon
                name={!hideTab ? "fullscreen" : "fullscreen-exit"}
                onPress={() => setHideTab(!hideTab)}
              />
            </>


          </View>
        ),

      headerLeft: () => (
        <ERPIcon
          extSize={24}
          isMenu
          name="menu"
          onPress={() => navigation.openDrawer()}
        />
      ),
    });
  }, [
    showFull,
    showSearch,
    showBookmarksOnly,
    isHorizontal,
    searchText,
    allList,
    isMenuLoading,
    showStarsOnly,
    theme,
    navigation,
    hideTab,
    isLandscape,
    menu,
  ]);

  useFocusEffect(
    useCallback(() => {
      setSearchText("");
      setShowSearch(false);
      setIsHorizontal(false);
      setShowFull(false);
      setShowSearch(false);
      setIsRefresh(false);
      setShowBookmarksOnly(false);
      setShowStarsOnly(false);

      if (isAuthenticated) {
        dispatch(getERPMenuThunk())
          .unwrap()
          .finally(() => {
            const timer = setTimeout(() => {
              dispatch(setMenuLoading(false));
            }, 850);
            return () => clearTimeout(timer);
          });
      }
      return () => { };
    }, [isAuthenticated, activeToken, isRefresh]),
  );

  // Menu loading
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getERPMenuThunk())
        .unwrap()
        .finally(() => {
          const timer = setTimeout(() => {
            dispatch(setMenuLoading(false));
          }, 850);
          return () => clearTimeout(timer);
        });
    }
  }, [isAuthenticated, activeToken, isRefresh]);

  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  const sectionListData = Object.values(
    list.reduce((acc, item) => {
      const moduleName = (item.Module || item.module || "Others")
        .replace(/\s+/g, " ")
        .trim();

      if (!acc[moduleName]) {
        acc[moduleName] = {
          title: moduleName,
          moduleMaterialIcon: item.moduleMaterialIcon || "",
          data: [],
        };
      }

      acc[moduleName].data.push(item);

      return acc;
    }, {}),
  );

  const extractConfig = (raw: any) => {
    try {
      const parsedRaw = typeof raw === "string" ? JSON.parse(raw) : raw;

      let msg = parsedRaw?.data?.message;
      if (!msg) return null;

      // remove outer quotes + last }
      msg = msg.replace(/^"+|"+$/g, "").replace(/}$/, "");

      const obj: any = {};

      msg.split(",").forEach((pair) => {
        let [key, value] = pair.split(":");

        if (!key || !value) return;

        // clean key
        key = key.replace(/"/g, "").trim();

        // clean value
        value = value.trim();

        // number detect
        if (!isNaN(Number(value))) {
          obj[key] = Number(value);
        } else {
          obj[key] = value.replace(/"/g, "").trim();
        }
      });

      return obj;
    } catch (e) {
      console.log("Parse Failed:", e);
      return null;
    }
  };

  const renderItem = ({ item, index }: any) => {
    const backgroundColor = accentColors[index % accentColors.length];
    return (
      <>

        <TouchableOpacity
          style={[
            list.length > 8 ? styles.cardV2 : styles.card,
            theme === "dark" && { borderColor: backgroundColor, borderWidth: 2 },
            {
              backgroundColor: theme === "dark" ? "black" : backgroundColor,
              flexDirection: isHorizontal ? "row" : "column",
            },
            isHorizontal && {
              paddingVertical: 8,
              paddingHorizontal: 8,
              marginBottom: 8,
            },
            item.url.includes(".") ? {
              marginBottom: 4
            } : {
              marginBottom: 4
            }
          ]}
          onPress={async () => {
            if (!item.url.includes(".")) {
              dispatch(updateSelectedBranchIdsState(""));
              dispatch(updateSelectedFromDateState(""));
              dispatch(updateSelectedToDateState(""));

              let raw = null;
              try {
                raw = await dispatch(
                  getERPConfigDataThunk({
                    page: item?.url,
                  }),
                ).unwrap();

                console.log("++++++++++++++++++++++++++++++++++++++raw", raw);
              } catch (error) {
                console.log("++++++++++++++++++++++++++++++++++++++error", error);
              }

              const parsedConfig = extractConfig(raw);

              let dateType = parsedConfig?.dateType || "Month"

              const now = new Date();

              let firstDay: Date;
              const lastDay = new Date();

              switch (dateType) {
                case "Today":
                  firstDay = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate()
                  );
                  break;

                case "Month":
                  firstDay = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    1
                  );
                  break;

                case "Year":
                  firstDay = new Date(
                    now.getFullYear(),
                    0,
                    1
                  );
                  break;

                default:
                  firstDay = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    1
                  );
                  break;
              }
              const fromDateStr = formatDateForAPI(firstDay);
              const toDateStr = formatDateForAPI(lastDay);
              dispatch(updateSelectedFromDateState(fromDateStr));
              dispatch(updateSelectedToDateState(toDateStr));

              const db = await getDBConnection();


              console.log("FINAL CONFIG:", parsedConfig);
              console.log("parsedConfig:", parsedConfig);
              console.log(
                "+++++++++++++++++parsedConfig+++++++++++++++++++++parsedConfig",
                parsedConfig,
              );

              await increaseTapCount(db, item.id, user?.id);
              navigation.navigate("List", { item, parsedConfig });
            } else {
              const db = await getDBConnection();
              await increaseTapCount(db, item.id, user?.id);
              navigation.navigate("Privacy Policy", { item });
            }
          }}
        >
          <TouchableOpacity
            onPress={() => toggleBookmark(item?.name, item.id)}
            style={{ position: "absolute", top: 0, right: 0 }}
          >
            <MaterialIcons
              color={theme === "dark" ? "white" : "gray"}
              name={bookmarks[item.id] ? "bookmark" : "bookmark-outline"}
              size={20}
            />
          </TouchableOpacity>




          <View
            style={[
              list.length > 8 ? styles.iconContainerV2 : styles.iconContainer,
              theme === "dark" && { borderColor: "white" },
              {
                backgroundColor:
                  theme === "dark" ? backgroundColor : ERP_COLOR_CODE.ERP_WHITE,
              },
              item?.app_menu_icon && {
                backgroundColor: "transparent",
              },
            ]}
          >
            {item?.icon != "" && item?.icon?.includes("fa fa-") ? (
              <FontAwesome
                name={item.icon.replace("fa fa-", "")}
                color={theme === "dark" ? "black" : ERP_COLOR_CODE.ERP_6C757D}
                size={18}
              />
            ) : (
              <>
                {item?.materialIcon && item?.materialIcon != "" ? (
                  <>
                    {item?.materialIcon != "" && item?.materialIcon?.includes("fa fa-") ? (
                      <FontAwesome
                        name={item?.materialIcon.replace("fa fa-", "")}
                        color={theme === "dark" ? "black" : ERP_COLOR_CODE.ERP_6C757D}
                        size={18}
                      />
                    ) : (
                      <MaterialIcons
                        name={item?.materialIcon || "widgets"}
                        color={theme === "dark" ? "black" : ERP_COLOR_CODE.ERP_6C757D}
                        size={18}
                      />
                    )}
                  </>
                ) : (
                  <TranslatedText
                    numberOfLines={1}
                    text={getInitials(item?.name)}
                    style={[
                      styles.iconTextV2,
                      theme === "dark" && { color: "black" },
                    ]}
                  ></TranslatedText>
                )}
              </>
            )}
          </View>

          <View
            style={{
              marginLeft: isHorizontal ? 16 : 0,
              marginTop: isHorizontal ? 0 : 4,
            }}
          >
            <TranslatedText
              numberOfLines={2}
              text={item.name}
              style={[


                theme === "dark" && { color: "white" },
              ]}
            ></TranslatedText>
            {item?.title && (
              <TranslatedText
                text={item?.title}
                numberOfLines={2}
                style={[
                  list.length > 8 ? styles.subtitleV2 : styles.subtitle,
                  theme === "dark" && { color: "white" },
                ]}
              ></TranslatedText>
            )}
          </View>
        </TouchableOpacity>
        {
          !item.url.includes(".") &&


          <TouchableOpacity
            onPress={async () => {

              console.log("item", item)
              let raw = null;
              try {
                raw = await dispatch(
                  getERPConfigDataThunk({
                    page: item?.url,
                  }),
                ).unwrap();
                console.log("++++++++++++++++++++++++++++++++++++++raw", raw);
              } catch (error) {
                console.log("++++++++++++++++++++++++++++++++++++++error", error);
                return;
              }
              const parsedConfig = extractConfig(raw);
              if (!parsedConfig) {
                return;
              }
              if (parsedConfig?.newentry === 1 || parsedConfig?.newentry === "1") {
                navigation.navigate("Page", {
                  item,
                  title: item?.name,
                  isFromNew: true,
                  url: item?.url,
                  pageTitle: item?.name,
                  isFromBusinessCard: false,
                  isFromProfile: false,
                });
              }
            }}
            style={{
              marginHorizontal: 6,
              height: 24,
              justifyContent: 'center',
              borderColor: backgroundColor,
              alignContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              borderRadius: 4,
              marginBottom: 8,
              borderWidth: 2
            }}
          >
            <MaterialIcons
              color={theme === "dark" ? "white" : "gray"}
              name={'add'}
              size={20}
            />
            <Text style={
              {
                color: theme === "dark" ? "white" : "gray"
              }
            }> New</Text>
          </TouchableOpacity>
        }
      </>
    );
  };

  if (isMenuLoading)
    return <FullViewLoader isShowTop={theme === "dark" ? false : true} />;
  if (error) return <ErrorMessage message={error} isShowTop={false} />;
  if (list.length === 0) return <NoData />;
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme === "dark" ? "black" : "white",
      }}
    >
      <View
        style={{
          height: 6,
          width: "100%",
          backgroundColor:
            theme === "dark" ? "black" : ERP_COLOR_CODE.ERP_APP_COLOR,
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          marginBottom: 6,
        }}
      ></View>

      {!isHorizontal ? (
        <>
          <SectionList
            sections={sectionListData}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderSectionHeader={({ section }) => (
              <View
                style={{
                  flexDirection: "row",
                  alignContent: "center",
                  alignItems: "center",
                  marginBottom: 6,
                  backgroundColor: theme === "dark" ? "black" : "#fffcfc",
                  width: "98%",
                  justifyContent: "space-between",
                  padding: 4,
                  borderWidth: 0.2,
                  borderColor: ERP_COLOR_CODE.ERP_BORDER_LINE,
                  marginLeft: 4,
                }}
              >
                {" "}
                <View style={{ flexDirection: "row", marginLeft: 2 }}>
                  {" "}
                  <MaterialIcons
                    name={section?.moduleMaterialIcon || "widgets"}
                    color={ERP_COLOR_CODE.ERP_APP_COLOR}
                    size={18}
                  />{" "}
                  <Text
                    style={{
                      marginLeft: 6,
                      fontWeight: "600",
                      color: theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_161515,
                    }}
                  >
                    {" "}
                    {section?.title}{" "}
                  </Text>{" "}
                </View>{" "}
                <View
                  style={{
                    height: 24,
                    width: 24,
                    borderRadius: 4,
                    backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
                    justifyContent: "center",
                    alignContent: "center",
                    alignItems: "center",
                    opacity: 0.5,
                  }}
                >
                  {" "}
                  <Text style={{ color: "white" }}>
                    {" "}
                    {section.data.length}{" "}
                  </Text>{" "}
                </View>{" "}
              </View>
            )}
            renderItem={({ item, index, section }) => {
              const items = section.data;
              const chunkSize = isIpad ? isLandscape ? 6 : 4 : isLandscape ? 4 : 3;


              // sirf first index pe pura section render karo
              if (index !== 0) return null;

              // rows create karo
              const rows = [];
              for (let i = 0; i < items.length; i += chunkSize) {
                rows.push(items.slice(i, i + chunkSize));
              }



              return (
                <View style={styles.sectionContainer}>
                  {rows.map((row, rowIndex) => (
                    <View key={rowIndex} style={{ flexDirection: "row" }}>
                      {row.map((child, childIndex) => {
                        const colorIndex = rowIndex * chunkSize + childIndex;

                        return (
                          <View
                            key={childIndex}
                            style={{
                              width: isIpad
                                ? isLandscape
                                  ? "16.6%"
                                  : "25%"
                                : isLandscape
                                  ? "25%"
                                  : "33%",
                            }}
                          >
                            {renderItem({ item: child, index: colorIndex })}
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>
              );
            }}
          />
        </>
      ) : (
        <>
          <FlatList
            bounces={false}

            key={
              isLandscape
                ? `${isHorizontal}-${showBookmarksOnly}-${searchText}-landscape`
                : `${isHorizontal}-${showBookmarksOnly}-${searchText}-portrait`
            }
            data={list}
            keyboardShouldPersistTaps="handled"
            renderItem={renderItem}
            numColumns={
              isIpad ? isLandscape ? 4 : 3 :
                isLandscape
                  ? isHorizontal
                    ? 2
                    : 4
                  : isHorizontal
                    ? 1
                    : list.length > 8
                      ? 4
                      : 2
            }
            columnWrapperStyle={
              !isHorizontal ? styles.columnWrapper : undefined
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      <Toast
        visible={toast.visible}
        message={toast.message}
        textColor={toast.textColor}
        onHide={hideToast}
        tbackgroundColor={toast.backgroundColor}
      />
    </View>
  );
};

export default MenuTab;

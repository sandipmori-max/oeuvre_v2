import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { styles } from "../page_style";
import { ERP_COLOR_CODE } from "../../../../utils/constants";
import { getAjaxThunk } from "../../../../store/slices/ajax/thunk";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import FullViewLoader from "../../../../components/loader/FullViewLoader";
import useTranslations from "../../../../hooks/useTranslations";
import InputError from "../../../../components/error/InputError";
import NoData from "../../../../components/no_data/NoData";
import TranslatedText from "../../tabs/home/TranslatedText";
import LableInfo from "./LableInfo";
import DeviceInfo from "react-native-device-info";

const AjaxPicker = ({
  isValidate,
  label,
  onValueChange,
  item,
  errors,
  dtext,
  formValues,
  isFromChild = false,
}: any) => {
  const dispatch = useAppDispatch();
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const [selectedOption, setSelectedOption] = useState(
    dtext || item?.text || item?.value,
  );
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [loader, setLoader] = useState(false);
  const [search, setSearch] = useState("");
  const theme = useAppSelector((state) => state?.theme.mode);
  const { t } = useTranslations();
  const { user } = useAppSelector((state) => state?.auth);
  const isIpad =
    (Platform.OS === "ios" && Platform.isPad) || DeviceInfo.isTablet() || Platform.isTV;
  useEffect(() => {
    const timer = setTimeout(() => {
      if (open) {
        fetchOptions();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const [isSearchInputAllowed, setIsSearchInputAllowed] = useState(false)
  const optionsRef = useRef([]);

  useEffect(() => {
    setSelectedOption(item?.dtext || item?.text || item?.value);
  }, [dtext, item]);

  const fetchOptions = useCallback(async () => {
    let resolvedWhere = item?.ddlwhere;

    // 1️⃣ Replace {key} format
    resolvedWhere = resolvedWhere?.replace(/\{(\w+)\}/g, (_, key) => {
      const lowerKey = key.toLowerCase();
      return formValues.hasOwnProperty(lowerKey)
        ? formValues[lowerKey]
        : `{${key}}`;
    });

    // 2️⃣ Replace $UID with item.id
    resolvedWhere = resolvedWhere
      ?.replace(/\$UID/g, user?.id)
      .replace(/\@UID/g, user?.id);

    try {
      setLoader(true);
      const res = await dispatch(
        getAjaxThunk({
          dtlid: item?.dtlid,
          where: resolvedWhere,
          search: search,
        }),
      ).unwrap();
      setOptions(res?.data ?? []);
      if (optionsRef.current.length === 0 && res?.data.length > 0) {
        optionsRef.current = res?.data;
      }
      setLoader(false);
    } catch (e) {
      setOptions([]);
      setLoader(false);
    }
  }, [dispatch, item?.dtlid, item?.ddlwhere, search, formValues]);

  const handleOpen = async () => {
    setOpen(true);
    await fetchOptions();
  };

  const handleSelect = (opt: any) => {
    const afterDash = item?.ddl?.split("-")[1];
    const arr = afterDash?.split(",");

    const result = arr?.reduce((acc, key) => {
      const lowerKey = key?.toLowerCase();
      acc[lowerKey] = String(opt[lowerKey] ?? "");
      return acc;
    }, {});

    onValueChange({
      [item?.dfield.replace("[", "").replace("]", "")]:
        opt[`${item?.ddlfield.toLowerCase()}id`] ??
        opt[`${item?.field}id`] ??
        opt[item?.field.replace("[", "").replace("]", "")],

      [item?.dfield.replace("[", "").replace("]", "") || item?.ddlfield.toLowerCase().replace("[", "").replace("]", "")]:
        opt[item?.ddlfield.toLowerCase().replace("[", "").replace("]", "")] ?? opt[item?.dfield.replace("[", "").replace("]", "")],

      ...result,
    });
    setSelectedOption(opt[item?.ddlfield.toLowerCase().replace("[", "").replace("]", "")] ?? opt[item?.dfield.replace("[", "").replace("]", "")]);
    setOpen(false);
  };

  const hasSingleKeyValue = (arr) => {
    return (
      Array.isArray(arr) &&
      arr.length > 0 &&
      arr.every(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          !Array.isArray(item) &&
          Object.keys(item).length === 1
      )
    );
  };

  useEffect(() => {
    setIsSearchInputAllowed(hasSingleKeyValue(optionsRef.current));
  }, [search]);

  return (
    <View style={{ marginBottom: Platform.OS === 'android' ? 6 : 8 }}>
      <LableInfo isFromChild={isFromChild}
        item={item}
        theme={theme}
      />

      <TouchableOpacity
        style={[
          styles.pickerBox,
          item?.disabled === "1" && styles.disabledBox,
          errors[item?.field] && {
            borderColor: ERP_COLOR_CODE.ERP_ERROR,
          },
          isValidate &&
          item?.mandatory === "1" &&
          selectedOption && {
            borderColor: "green",
            borderWidth: 0.8,
          },
          theme === "dark" && {
            backgroundColor: "black",
            borderWidth: 1,
          },
          item?.background && {
            backgroundColor: item?.background,
          },
          item?.disabled == "1" &&
          theme === "dark" && {
            backgroundColor: "gray",
          },
          isFromChild && {
            padding: 6,
            borderRadius: 4,
          },
          item?.disabled == "1" && {
            paddingVertical: 4,
          },
        ]}
        onPress={() => {
          if (item?.disabled !== "1") {
            handleOpen();
          }
        }}
        activeOpacity={0.7}
      >
        <TranslatedText
          numberOfLines={1}
          text={selectedOption || `${t("text.text34")} ${label}`}
          style={{
            color:
              theme === "dark"
                ? "white"
                : selectedOption
                  ? ERP_COLOR_CODE.ERP_BLACK
                  : ERP_COLOR_CODE.ERP_888,
            flex: 1,
          }}
        ></TranslatedText>
        <MaterialIcons
          name={"arrow-drop-down"}
          size={24}
          color={ERP_COLOR_CODE.ERP_555}
        />
      </TouchableOpacity>

      <Modal
        visible={open}
        supportedOrientations={["portrait", "landscape"]}
        animationType="slide"
        transparent
      >
        <KeyboardAvoidingView style={{ flex: 1 }}>
          <View
            style={[
              styles.overlay,
              (isLandscape || isIpad) && {
                alignContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <View
              style={[
                {
                  maxHeight: height * 0.75,
                  flex: 1,
                  backgroundColor:
                    theme === "dark" ? "black" : ERP_COLOR_CODE.ERP_WHITE,
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                  padding: 16,
                },
                theme === "dark" && {
                  borderWidth: 1,
                  borderColor: "white",
                },
                {
                  width: isIpad ? '60%' : isLandscape ? "50%" : "100%",
                },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <TranslatedText
                  numberOfLines={1}
                  text={label}
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: theme === "dark" ? "white" : "#000",
                  }}
                ></TranslatedText>
                <TouchableOpacity onPress={() => setOpen(false)}>
                  <MaterialIcons
                    name="close"
                    size={24}
                    color={theme === "dark" ? "white" : "#000"}
                  />
                </TouchableOpacity>
              </View>

              <View style={{ position: "relative", marginVertical: 12 }}>
                <TextInput
                  style={[
                    styles.textInput,
                    theme === "dark" && {
                      color: "white",
                      backgroundColor: "black",
                      borderWidth: 0.4,
                      borderColor: "white",
                    },
                    { paddingRight: 40 },
                  ]}
                  placeholder={t("title.title5")}
                  placeholderTextColor={ERP_COLOR_CODE.ERP_888}
                  value={search}
                  onChangeText={setSearch}
                  autoFocus={isLandscape ? false : true}
                />

                {search?.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearch("")}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: [{ translateY: -12 }],
                    }}
                  >
                    <MaterialIcons
                      name="close"
                      size={20}
                      color={ERP_COLOR_CODE.ERP_888}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {loader ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FullViewLoader isShowTop={false} />
                </View>
              ) : (
                <ScrollView
                  bounces={false}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  {options?.length > 0 ? (
                    options?.map((opt: any, i: number) => {
                      const entries = Object.entries(opt).filter(
                        ([key, value]) =>
                          value !== null &&
                          value !== undefined &&
                          String(value).trim() !== "" &&
                          !key.startsWith("[") &&
                          !key.endsWith("]") &&
                          !key.toLowerCase().includes("id")
                      );

                      const getItemWidth = () => {
                        if (entries.length === 1) return "100%";
                        if (entries.length === 2) return "50%";
                        return "33.33%";
                      };

                      const isGrid = entries.length >= 2;

                      return (
                        <TouchableOpacity
                          key={i}
                          style={[
                            styles.option,
                            {
                              paddingVertical: 12,
                              backgroundColor:
                                i % 2 === 0
                                  ? theme === "dark"
                                    ? "#1E1E1E"
                                    : "#FFFFFF"
                                  : theme === "dark"
                                    ? "#2A2A2A"
                                    : "#F5F5F5",
                            },
                            theme === "dark" && {
                              borderBottomColor: ERP_COLOR_CODE.ERP_F8F9FA,
                            },
                          ]}
                          onPress={() => handleSelect(opt)}
                        >
                          <View
                            style={{
                              flexDirection: isGrid ? "row" : "column",
                              flexWrap: isGrid ? "wrap" : "nowrap",
                            }}
                          >
                            {entries.map(([key, value], idx) => (
                              <View
                                key={idx}
                                style={{
                                  width: getItemWidth(),
                                  paddingVertical: 4,
                                  paddingHorizontal: 6,
                                }}
                              >
                                <TranslatedText
                                  style={[
                                    {
                                      color:
                                        key === label?.toLowerCase()
                                          ? ERP_COLOR_CODE.ERP_APP_COLOR
                                          : ERP_COLOR_CODE.ERP_BLACK,
                                      fontSize:
                                        key === label?.toLowerCase() ? 16 : 14,
                                      fontWeight:
                                        key === label?.toLowerCase() ? "700" : "400",
                                    },
                                    {
                                      color: theme === "dark" ? "white" : "#000",
                                    },
                                  ]}
                                  numberOfLines={1}
                                  text={String(value)}
                                />
                              </View>
                            ))}
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <>

                      {
                        isSearchInputAllowed ? <>

                          <TouchableOpacity
                            onPress={() => {
                              console.log(optionsRef)
                              const key = Object.keys(optionsRef.current[0])[0];
                              console.log(key);
                              let opt = {
                                [key]: search
                              }
                              handleSelect(opt)
                            }}
                          >
                            <Text style={{
                              color: 'blue',
                              padding: 10
                            }}>
                              {search}
                            </Text>
                          </TouchableOpacity>
                        </> : <View
                          style={{
                            marginVertical: 12,
                            justifyContent: "center",
                            alignItems: "center",
                            height: 100,
                            alignContent: "center",
                            marginTop: 200,
                          }}
                        >
                          <NoData isShowTop={false} />
                        </View>
                      }
                    </>

                  )}
                </ScrollView>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {errors[item.field] && <InputError error={errors[item?.field]} />}
      
    </View>
  );
};

export default React.memo(AjaxPicker);
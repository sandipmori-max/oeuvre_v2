import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  ScrollView,
  useWindowDimensions,
  TextInput,
  Platform,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { styles } from "../page_style";
import { ERP_COLOR_CODE } from "../../../../utils/constants";
import { getDDLThunk } from "../../../../store/slices/dropdown/thunk";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import FullViewLoader from "../../../../components/loader/FullViewLoader";
import useTranslations from "../../../../hooks/useTranslations";
import InputError from "../../../../components/error/InputError";
import NoData from "../../../../components/no_data/NoData";
import TranslatedText from "../../tabs/home/TranslatedText";
import {
  updateSelectedBranchesState,
  updateSelectedBranchIdsState,
} from "../../../../store/slices/auth/authSlice";
import DeviceInfo from "react-native-device-info";

const CustomMultiplePicker = ({
  isValidate,
  label,
  selectedValue,
  onValueChange,
  item,
  errors,
  dtext,
  isForceOpen,
  isForMultipleSelection = false,
}: any) => {
  const { t } = useTranslations();
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const SCREEN_HEIGHT = height;

  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const dispatch = useAppDispatch();
  const [loader, setLoader] = useState(false);

  const [selectedOption, setSelectedOption] = useState("");

  const theme = useAppSelector((state) => state?.theme.mode);
  const { user, selectedBranches } = useAppSelector((state) => state?.auth);

  const optionsCache = useRef<{ [key: string]: any[] }>({});
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (!isForMultipleSelection) setSelectedOption(dtext);
  }, [dtext]);

  useEffect(() => {
    const minusOneItem = options.find((item) => item.value === -1);
    const otherOptions = options.filter((item) => item.value !== -1);

    let result = otherOptions;

    if (search) {
      const lower = search.toLowerCase();
      result = otherOptions.filter((o) =>
        o.name?.toLowerCase().includes(lower),
      );
    }

    // last me -1 add karo
    if (minusOneItem) {
      result = [...result, minusOneItem];
    }

    setFilteredOptions(result);
  }, [search, options]);

  const openBottomSheet = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT * 0.25,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const closeBottomSheet = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setOpen(false);
      setSearch("");
    });
  };

  const handleOpen = useCallback(async () => {
    if (open) return closeBottomSheet();

    setOpen(true);
    openBottomSheet();

    if (item?.dtlid && optionsCache.current[item.dtlid]) {
      setOptions(optionsCache.current[item.dtlid]);
      return;
    }

    setLoader(true);
    try {
      const res = await dispatch(
        getDDLThunk({
          dtlid: item?.dtlid,
          where: !isForceOpen ? `UserID in (${user?.id}, -1)` : item?.ddlwhere,
        }),
      ).unwrap();

      const data = res?.data ?? [];
      setOptions(data);
      if (item?.dtlid) optionsCache.current[item.dtlid] = data;
    } finally {
      setLoader(false);
    }
  }, [open, item]);

  // ================= MULTI =================
  const toggleSelection = (opt: any) => {
    const exists = selectedBranches.find((o) => o.value === opt.value);

    let updatedOptions;

    if (exists) {
      updatedOptions = selectedBranches.filter((o) => o.value !== opt.value);
    } else {
      updatedOptions = [...selectedBranches, opt];
    }

    // Redux update
    dispatch(updateSelectedBranchesState(updatedOptions));
  };

  const isSelected = (opt: any) =>
    selectedBranches.some((o) => o.value === opt.value);

  const handleSelectAll = () => {
    let updatedOptions = [];

    if (selectedBranches.length === options.length) {
      updatedOptions = [];
    } else {
      updatedOptions = options;
    }

    dispatch(updateSelectedBranchesState(updatedOptions));
  };

  const handleDone = () => {
    onValueChange(selectedBranches);
    closeBottomSheet();
  };
    const isIpad =
   ( Platform.OS === "ios" && Platform.isPad) || DeviceInfo.isTablet() || Platform.isTV;
  return (
    <View style={{ marginVertical: 0 }}>
      {/* LABEL */}

      {/* PICKER */}
      <TouchableOpacity
        style={[styles.pickerBox1]}
        onPress={() => {
          if (item?.disabled !== "1") handleOpen();
        }}
      >
        <TranslatedText
          text={
            isForMultipleSelection
              ? selectedBranches.length > 0
                ? `${selectedBranches.map((opt, i) => opt.name).join(", ")}`
                : `Select ${label}`
              : selectedOption || `Select ${label}`
          }
          numberOfLines={1}
          style={{ flex: 1 ,
             color : ERP_COLOR_CODE.ERP_APP_COLOR,
             fontWeight : '600'
          }}
        />

        <MaterialIcons
          name={open ? "arrow-drop-up" : "arrow-drop-down"}
          size={24}
        />
      </TouchableOpacity>

      {/* MODAL */}
      <Modal
        transparent
        visible={open}
        supportedOrientations={["portrait", "landscape"]}
        animationType="none"
      >
        <TouchableWithoutFeedback onPress={closeBottomSheet}>
          <View style={{ flex: 1, backgroundColor: "#00000099" }} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            {
              position: "absolute",
              top: slideAnim,
              height: SCREEN_HEIGHT * 0.75,
              backgroundColor: theme === "dark" ? "black" : "white",
              width: isIpad ? '60%' : isLandscape ? "50%" : "100%",
              padding: 16,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              borderWidth: 1,
              borderColor:
                theme === "dark" ? "#fff" : ERP_COLOR_CODE.ERP_APP_COLOR,
            },
            (isLandscape || isIpad) ? { left: "20%" } : null,
          ]}
        >
          {/* HEADER */}
          <View
            style={{
              alignContent: "center",
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontWeight: "800",
                color: theme === "dark" ? "#fff" : "#000",
              }}
            >
              {t("text.text34")} {label}
            </Text>

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              {isForMultipleSelection && (
                <TouchableOpacity
                  onPress={handleDone}
                  style={{
                    backgroundColor:
                      theme === "dark" ? "#fff" : ERP_COLOR_CODE.ERP_APP_COLOR,
                    justifyContent: "center",
                    alignContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 8,
                    borderRadius: 4,
                    marginRight: 22,
                  }}
                >
                  <Text style={{ color: theme === "dark" ? "#000" : "white" }}>
                    Done
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={closeBottomSheet}>
                <MaterialIcons
                  style={{ color: theme === "dark" ? "#fff" : "#000" }}
                  name="close"
                  size={24}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* SEARCH */}
          <TextInput
            placeholder="Search..."
            value={search}
            onChangeText={setSearch}
            style={{
              borderWidth: 1,
              borderColor:
                theme === "dark" ? "#fff" : ERP_COLOR_CODE.ERP_BORDER,
              borderRadius: 8,
              padding: 8,
              marginVertical: 8,
              
            }}
          />

          {/* SELECT ALL */}
          {/* {isForMultipleSelection && (
            <TouchableOpacity
              onPress={handleSelectAll}
              style={{ margin: 8, marginBottom: 10, }}
            >
              <Text style={{ color: ERP_COLOR_CODE.ERP_APP_COLOR }}>
                {selectedBranches.length === options.length
                  ? "Unselect All"
                  : "Select All"}
              </Text>
            </TouchableOpacity>
          )} */}

          {/* LIST */}
          {loader ? (
            <FullViewLoader isShowTop={false} />
          ) : (
            <ScrollView   bounces={false}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt: any, i: number) => {
                  const selected = isForMultipleSelection
                    ? isSelected(opt)
                    : selectedOption === opt.name;

                  return (
                    <TouchableOpacity
                      key={i}
                      style={[
                        {
                          padding: 12,
                          flexDirection: "row",
                          justifyContent: "space-between",
                        },

                        {
                          backgroundColor: selected
                            ? ERP_COLOR_CODE.ERP_F8F9FA
                            : ERP_COLOR_CODE.ERP_WHITE,
                          marginBottom: 4,
                          borderRadius: 8,
                          padding: 12,
                        },
                        theme === "dark" &&
                          selected === opt?.name && {
                            backgroundColor: "white",
                          },
                        theme === "dark" && {
                          backgroundColor: "black",
                          borderBottomColor: ERP_COLOR_CODE.ERP_F8F9FA,
                        },
                      ]}
                      onPress={() => {
                        if (isForMultipleSelection) {
                          toggleSelection(opt);
                        } else {
                          onValueChange(isForceOpen ? opt.value : opt);
                          setSelectedOption(opt.name);
                          closeBottomSheet();
                        }
                      }}
                    >
                      <Text style={[theme === "dark" && { color: "#fff" }]}>
                        {opt.name}
                      </Text>

                      {selected && (
                        <MaterialIcons
                          name="done-all"
                          size={20}
                          color={ERP_COLOR_CODE.ERP_APP_COLOR}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <NoData isShowTop={false} />
              )}
            </ScrollView>
          )}
        </Animated.View>
      </Modal>

      {isForceOpen && errors[item?.field] && (
        <InputError error={errors[item?.field]} />
      )}
    </View>
  );
};

export default React.memo(CustomMultiplePicker);

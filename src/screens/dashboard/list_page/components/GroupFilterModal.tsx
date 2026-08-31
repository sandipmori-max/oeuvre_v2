import MaterialIcons from "@react-native-vector-icons/material-icons";
import React, { useMemo } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";

const GroupFilterModal = ({
  visible,
  onClose,
  configData,
  data = [],
  selectedKey,
  onSelectKey,
}: any) => {
  /* ================= ALL AVAILABLE KEYS ================= */

  const availableKeys = useMemo(() => {
    if (!data?.length) {
      return [];
    }

    return Object.keys(data[0]).filter(
      (key) =>
        key !== "id" &&
        key !== "html" &&
        !key.startsWith("btn_"),
    );
  }, [data]);

  /* ================= HEADER TITLE FROM CONFIG ================= */

  const getHeaderTitle = (key: string) => {
    const config = configData?.find(
      (item: any) =>
        item?.datafield?.toLowerCase() ===
        key?.toLowerCase(),
    );

    return (
      config?.headertext ||
      config?.fieldtitle ||
      config?.title ||
      key
    );
  };

  /* ================= RENDER ================= */

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      supportedOrientations={[
        "portrait",
        "landscape",
      ]}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          alignContent: "center",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 14,
            maxHeight: "80%",
            overflow: "hidden",
            width: "100%",
            padding: 12,
          }}
        >
          {/* HEADER */}

          <View
            style={{
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              Select Group By
            </Text>

            <TouchableOpacity
              onPress={onClose}
              style={{
                height: 22,
                width: 22,
                borderRadius: 4,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
              }}
            >
              <MaterialIcons
                name="close"
                size={16}
              />
            </TouchableOpacity>
          </View>

          {/* KEY LIST */}

          <FlatList
            data={availableKeys}
            bounces={false}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const isSelected =
                selectedKey === item;

              const headerTitle =
                getHeaderTitle(item);

              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    // IMPORTANT:
                    // actual field key pass hoga
                    onSelectKey(item);
                    onClose();
                  }}
                  style={{
                    padding: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: "#f1f1f1",
                    backgroundColor:
                      isSelected
                        ? "#eef2ff"
                        : "#fff",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight:
                        isSelected
                          ? "700"
                          : "500",
                      color: "#111827",
                    }}
                  >
                    {headerTitle}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default GroupFilterModal;
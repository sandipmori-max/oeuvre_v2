import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  useWindowDimensions,
} from "react-native";
import { pick, types } from "@react-native-documents/picker";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { ERP_COLOR_CODE } from "../../../../utils/constants";
import RNFS from "react-native-fs";
import { Linking } from "react-native";
import useTranslations from "../../../../hooks/useTranslations";
import { useAppSelector } from "../../../../store/hooks";
import InputError from "../../../../components/error/InputError";
import LableInfo from "./LableInfo";
import DeviceInfo, { isLandscape } from "react-native-device-info";

interface FileType {
  name: string;
  uri: string;
  size?: number;
  type?: string;
}

const FilePickerRow = ({
  item,
  handleAttachment,
  baseLink,
  infoData,
  isFromFileManager = false,
  onFilePicked,
  errors
}: any) => {
  const { t } = useTranslations();
  const MAX_FILE_SIZE = 25 * 1024 * 1024;
  const ALLOWED_EXTENSIONS = [
    "jpg",
    "jpeg",
    "png",
    "mov",
    "avi",
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
  ];
  const theme = useAppSelector((state) => state?.theme.mode);
  const isIpad =
    (Platform.OS === "ios" && Platform.isPad) || DeviceInfo.isTablet() || Platform.isTV;
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const base = `${baseLink}fileupload/1/${infoData?.tableName}/${infoData?.id}/${item?.text}`;
  const [selectedFiles, setSelectedFiles] = useState<FileType[]>([]);

  const openFilePicker = async () => {
    try {
      const files = await pick({
        type: [types.allFiles],
        allowMultiSelection: false,
      });

      const file = files[0];
      if (!file) return;

      const extension = file.name?.split(".").pop()?.toLowerCase();

      if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
        Alert.alert(
          t("title.title1"),
          `${file.name} - ${t("Selected file type is not supported")}`,
        );
        return;
      }

      if (file.size && file.size > MAX_FILE_SIZE) {
        Alert.alert(
          t("title.title1"),
          `${file.name} - ${t("File size must be less than or equal to 25MB")}`,
        );
        return;
      }

      let filePath = file.uri;

      if (Platform.OS === "android" && file.uri.startsWith("content://")) {
        const destPath = `${RNFS.TemporaryDirectoryPath}/${file.name}`;
        await RNFS.copyFile(file.uri, destPath);
        filePath = destPath;
      }

      if (isFromFileManager && onFilePicked) {
        onFilePicked(file);
        return;
      }

      const fileBase64 = await RNFS.readFile(filePath, "base64");
      const attachment = `${item.field}; data:${file.type};base64,${fileBase64}`;
      handleAttachment(attachment, item.field);
      setSelectedFiles((prev) => [...prev, file]);

    } catch (err: any) {
      if (err.code === "USER_CANCELED") return;

      Alert.alert(t("title.title1"), t("msg.msg12"));
    }
  };
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFile = async (index: number) => {
    try {
      const [file] = await pick({ type: [types.allFiles] });
      setSelectedFiles((prev) => prev.map((f, i) => (i === index ? file : f)));
    } catch (err: any) {
      if (err.code === "USER_CANCELED") return;
      Alert.alert(t("title.title1"), t("msg.msg13"));
    }
  };

  const getFileIcon = (fileName?: string) => {
    if (!fileName) return "insert-drive-file";
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "image";
      case "mp4":
      case "mov":
      case "avi":
        return "movie";
      case "pdf":
        return "picture-as-pdf";
      case "doc":
      case "docx":
        return "description";
      case "xls":
      case "xlsx":
        return "grid-on";
      default:
        return "insert-drive-file";
    }
  };

  return (
    <View style={[styles.container, theme === "dark" && { backgroundColor: "#000" }]}>
      <LableInfo
        item={item}
        theme={theme} />

      {/* Upload Area */}
      {selectedFiles.length === 0 && (
        <TouchableOpacity style={[styles.uploadBox, {
          borderColor: theme === "dark" ? '#fff' : ERP_COLOR_CODE.ERP_APP_COLOR,
          backgroundColor: theme === "dark" ? "#000" : "#f8f9ff",
        },
        selectedFiles.length === 0 && errors[item?.field] && {
          borderColor: ERP_COLOR_CODE.ERP_ERROR
        },
        !isLandscape && isIpad && {
          width: "50%",
        }

        ]} onPress={openFilePicker}>
          <MaterialIcons name="cloud-upload" size={36} color={theme === "dark" ? "#fff" : "gray"} />
          <Text style={styles.uploadSub}>Tap to browse files</Text>
        </TouchableOpacity>
      )}

      {/* File List */}
      {selectedFiles.map((file, index) => (
        <View key={index} style={styles.fileItem}>
          <View style={styles.fileLeft}>
            <View style={styles.iconBox}>
              <MaterialIcons
                name={getFileIcon(file.name)}
                size={22}
                color="#4c6ef5"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={styles.fileName}>
                {file.name}
              </Text>
              <Text style={styles.fileMeta}>
                {(file.size / 1024).toFixed(1)} KB
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => removeFile(index)}
          >
            <MaterialIcons name="close" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      ))}

      {selectedFiles.length === 0 && errors[item?.field] && (
        <>
          <InputError error={errors[item?.field]} />
          <View style={{ height: 8 }} />
        </>
      )}
      {/* Add More */}

    </View>
  );
};

export default FilePickerRow;
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 4
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#222",
  },

  /* Upload Box */
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#4c6ef5",
    borderRadius: 6,
    paddingVertical: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9ff",
    marginBottom: 6
  },

  uploadTitle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  uploadSub: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },

  /* File Item */
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },

  fileLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#edf2ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  fileName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#222",
  },

  fileMeta: {
    fontSize: 11,
    color: "#777",
    marginTop: 2,
  },

  deleteBtn: {
    backgroundColor: "#ff4d4f",
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },

  /* Add More */
  addMore: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    paddingVertical: 8,
  },

  addMoreText: {
    marginLeft: 4,
    color: "#4c6ef5",
    fontWeight: "600",
  },
});

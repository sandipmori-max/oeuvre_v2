import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Alert,
  StyleSheet,
  NativeModules,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { ERP_COLOR_CODE } from "../../../../utils/constants";
import { useAppSelector } from "../../../../store/hooks";
import InputError from "../../../../components/error/InputError";
import RNFS from "react-native-fs";
import LableInfo from "./LableInfo";
import ImageResizer from "@bam.tech/react-native-image-resizer";

const { DocumentScanner } = NativeModules;

const launchScannerAsync = (options: any) => {
  return new Promise<any>((resolve, reject) => {
    if (!DocumentScanner) {
      reject(new Error("DocumentScanner module not linked"));
      return;
    }

    try {
      DocumentScanner.launchScanner(options, (result: any) => {
        resolve(result);
      });
    } catch (e) {
      reject(e);
    }
  });
};

export interface ScannedImage {
  uri: string;
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
  base64?: string;
}

interface DocScanProps {
  label?: string;
  onScanResult?: (data: any, val: any) => void;
  item?: any;
  errors: any;
}

const DocScan: React.FC<DocScanProps> = ({
  label = "Scan Document",
  onScanResult,
  item,
  errors
}) => {
  const [images, setImages] = useState<ScannedImage[]>([]);
  const [status, setStatus] = useState("");
  const theme = useAppSelector((state) => state?.theme.mode);

  // 📸 Scan
  const handleScan = async () => {
    try {
      setStatus("Opening scanner...");

      const result = await launchScannerAsync({
        quality: 0.5,
        includeExif: true,
        includeBase64:  Platform.OS === 'android' ? false : true,
        includeLocationExif: false,
      });
 
      if (result?.didCancel) {
        setStatus("Scan cancelled");
        return;
      }

      if (result?.error) {
        setStatus(result?.errorMessage || "Scan failed");
        Alert.alert("Error", result?.errorMessage || "Scan failed");
        return;
      }

      if (result?.images?.length > 0) {
        const processed = result.images.map((img: any) => ({
          ...img,
          base64: img.base64 || null,
        }));

        const updated = [...images, ...processed];

        setImages(updated); 
        setStatus("Scan successful ✅");
        let base64Data = '';
        if (Platform.OS === 'android') {
          const compressedImage = await ImageResizer.createResizedImage(
              updated[0].uri,
              800,     // width
              800,     // height
              'JPEG',
              60        // quality (0-100)
            );
          const base644 = await RNFS.readFile(
            compressedImage.uri,
            "base64",
          );
          base64Data = `${item?.field}.jpeg;data:image/jpeg;base64,${base644}`
        } else {
          base64Data = `${item?.field}.jpeg;data:image/jpeg;base64,${updated[0]?.base64}`
        }

        onScanResult?.(base64Data, item?.field);
      } else {
        setStatus("No image found");
      }
    } catch (error: any) {
      setStatus(error.message);
      Alert.alert("Error", error.message || "Something went wrong");
    }
  };

  // 🗑 Delete
  const handleDelete = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onScanResult?.("", item?.field);
  };

  // 🔁 Replace
  const handleReplace = async (index: number) => {
    try {
      const result = await launchScannerAsync({
        quality: 0.8,
        includeBase64: true,
      });

      if (result?.images?.length > 0) {
        const newImage = result.images[0];

        const updated = [...images];
        updated[index] = newImage;

        setImages(updated);
        let base64Data = '';
        if (Platform.OS === 'android') {
          const base644 = await RNFS.readFile(
            updated[0].uri,
            "base64",
          );
          base64Data = `${item?.field}.jpeg;data:image/jpeg;base64,${base644}`
        } else {
          base64Data = `${item?.field}.jpeg;data:image/jpeg;base64,${updated[0]?.base64}`
        }

        onScanResult?.(base64Data, item?.field);
      }
    } catch (e) {
      Alert.alert("Error", "Failed to replace image");
    }
  };

  return (
    <>
      <LableInfo
        item={item}
        theme={theme} />
      <TouchableOpacity
        onPress={() => {
          if (images.length === 0) {
            handleScan();
          }
        }}
        style={[
          styles.container,
          {
            borderColor: ERP_COLOR_CODE.ERP_APP_COLOR,
          },
        ]}
      >
        {/* Empty state */}
        {images.length === 0 && (
          <View style={styles.emptyBox}>
            <MaterialIcons
              name="document-scanner"
              size={42}
              color={"gray"}
            />
            <Text style={styles.emptyText}>Tap to Doc scan</Text>
          </View>
        )}

        {/* Images */}
        {images.length > 0 && (
          <View style={styles.singleCard}>
            <Image
              source={{ uri: images[images.length - 1].uri }}
              style={styles.singleImage}
            />

            {/* overlay actions */}
            <View style={styles.overlay}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => handleReplace(images.length - 1)}
              >
                <MaterialIcons name="edit" size={18} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: "#ef4444" }]}
                onPress={() => handleDelete(images.length - 1)}
              >
                <MaterialIcons name="delete" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.fileName} numberOfLines={1}>
                {images[images.length - 1].fileName || "Document"}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {errors[item?.field] && (
        <>
          <InputError error={errors[item?.field]} />
          <View style={{ height: 8 }} />
        </>
      )}
    </>
  );
};

export default DocScan;

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    marginVertical: 2,
    borderWidth: 2,
    borderStyle: "dashed",
    width: "100%",
    backgroundColor: "#f8f9ff",
    marginBottom: 8,
  },
  singleCard: {
    width: Dimensions.get("window").width - 29,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
  },

  singleImage: {
    width: Dimensions.get("window").width - 30,
    height: 220,
    resizeMode: "contain",
  },

  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    gap: 8,
    flexDirection: "column",
  },

  iconBtn: {
    backgroundColor: "#4f46e5",
    padding: 7,
    borderRadius: 10,
  },

  infoBox: {
    padding: 10,
  },
  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4f46e5",
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  scanText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 14,
  },

  status: {
    marginTop: 10,
    fontSize: 12,
    color: "#374151",
    backgroundColor: "#eef2ff",
    padding: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },

  emptyBox: {
    alignItems: "center",
    paddingVertical: 20,
  },

  emptyText: {
    marginTop: 8,
    color: "gray", 
  },

  card: {
    width: 140,
    marginRight: 12,
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },

  image: {
    width: "100%",
    height: 150,
    backgroundColor: "#e5e7eb",
  },

  overlay: {
    position: "absolute",
    top: 8,
    right: 8,
    gap: 6,
  },

  iconBtn: {
    backgroundColor: "#4f46e5",
    padding: 6,
    borderRadius: 8,
    marginBottom: 6,
  },

  infoBox: {
    padding: 8,
  },

  fileName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#111827",
  },

  fileSize: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 2,
  },
  label: {
    fontSize: 14,
    color: ERP_COLOR_CODE.ERP_333,
    marginBottom: 6,
    fontWeight: "600",
  },
});

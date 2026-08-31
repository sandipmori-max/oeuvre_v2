import MaterialIcons from "@react-native-vector-icons/material-icons";
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Dimensions,
  Image,
  TouchableWithoutFeedback,
  useWindowDimensions,
  Platform,
} from "react-native";
import SignatureScreen, {
  SignatureViewRef,
} from "react-native-signature-canvas";
import { ERP_COLOR_CODE } from "../../../../utils/constants";
import { useBaseLink } from "../../../../hooks/useBaseLink";
import { useAppSelector } from "../../../../store/hooks";
import useTranslations from "../../../../hooks/useTranslations";

const SignaturePad: React.FC = ({
  isValidate,
  item,
  handleSignatureAttachment,
  infoData,
}: any) => {
  const signatureRef = useRef<SignatureViewRef>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showPad, setShowPad] = useState(false);

  const [signatureKey, setSignatureKey] = useState(0);

  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const baseLink = useBaseLink();
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const theme = useAppSelector((state) => state?.theme.mode);
  const { t } = useTranslations();
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const handleSignature = (signature: string) => {
    setSavedSignature(signature);
    handleSignatureAttachment(`${item?.field}.png; ${signature}`, item?.field);
    setCacheBuster(Date.now());
    setModalVisible(false);
    closePad();
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
    setSavedSignature(null);
  };

  
  const handleSave = () => {
    signatureRef.current?.readSignature();
  };

  const getImageUri = () => {
    if (savedSignature) return savedSignature;
    const base = `${baseLink}fileupload/1/${infoData?.tableName}/${infoData?.id}/${item?.text}`;
    return `${base}?cb=${cacheBuster}`;
  };

const openPad = () => {
  setShowPad(false);

  setTimeout(() => {
    setSignatureKey(prev => prev + 1); // <-- important
    setShowPad(true);
    setModalVisible(true);
  }, 50);
};

  const closePad = () => {
    signatureRef.current?.clearSignature();
    setShowPad(false);
    setModalVisible(false);
  };

  return (
    <View
      style={[
        styles.container,
        theme === "dark" && { backgroundColor: "black" },
      ]}
    >
      <Text
        style={[
          theme === "dark" && {
            color: "white",
          },
          { marginBottom: 8, fontWeight: "600" },
        ]}
      >
        {item?.fieldtitle}
      </Text>

      <View
        style={{
          justifyContent: "space-between",
          flexDirection: "row",
          width: "100%",
          padding: 4,
          borderWidth: 1.5,
          borderStyle: "dashed",
          borderRadius: 8,
          borderColor: ERP_COLOR_CODE.ERP_APP_COLOR,
          backgroundColor: "#fff",
        }}
      >
        <View></View>
        <View style={{ height: 100, width: 100,  }}>
          <Image
            source={{ uri: getImageUri() }}
            style={styles.imageThumb}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity style={{
          padding: 8,
          height: 30,
          width: 30,
          borderRadius: 8,
          backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
          justifyContent: "center",
          alignItems: "center",
        }} onPress={() => {
          openPad()
        }}>
          <MaterialIcons name="edit" size={14} color="#fff" />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent
        supportedOrientations={["portrait", "landscape"]}
        visible={modalVisible}
        onRequestClose={() => {
          closePad()
        }}
      >
        <TouchableWithoutFeedback onPress={() => {
          closePad()
        }}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <View style={styles.container2}>
          <View
            style={[
              styles.bottomSheet,

              theme === "dark" && {
                borderWidth: 1,
                borderColor: "white",
                backgroundColor: "black",
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  theme === "dark" && {
                    color: "white",
                  },
                ]}
              >
                {t("text.text39")}
              </Text>
              <View style={styles.buttonOverlay}>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                >
                  <MaterialIcons
                    name="save"
                    size={18}
                    color={theme === "dark" ? "white" : "green"}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.clearButton]}
                  onPress={handleClear}
                >
                  <MaterialIcons
                    name="auto-fix-high"
                    size={18}
                    color={theme === "dark" ? "white" : "orange"}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.closeButton]}
                  onPress={() => {closePad()}}
                >
                  <MaterialIcons
                    name="close"
                    size={18}
                    color={theme === "dark" ? "white" : "red"}
                  />
                </TouchableOpacity>
              </View>
            </View>
            {
              showPad ? <View
                style={[
                  styles.signatureBox,
                  {
                    backgroundColor: "white",
                  },
                ]}
              >
                <SignatureScreen
                  ref={signatureRef}
                  key={signatureKey}
                  onOK={handleSignature}
                  onEmpty={() => Alert.alert(t("msg.msg14"))}
                  descriptionText={t("text.text40")}
                  clearText={t("text.text41")}
                  confirmText={t("text.text42")}
                  backgroundColor="#FFFFFF"
                  penColor="#000000" 
                />
              </View> : <>
                <Text>Loading....</Text>
              </>
            }

          </View>
        </View>

      </Modal>
    </View>
  );
};

export default SignaturePad;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 0,
  },
  container2: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  imageThumb: {
    borderColor: ERP_COLOR_CODE.ERP_BORDER_LINE,
    height: 100,
    marginBottom: 12,
  },
  openButton: {
    flexDirection: "row",
    width: "100%",
    height: 38,
    alignItems: "center",
    paddingHorizontal: 16,
    borderWidth: 0.5,
    borderRadius: 8,
    justifyContent: "center",
  },
  openButtonText: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: "600",
  },
  savedSignatureContainer: {
    width: "100%",
    padding: 8,
    borderWidth: 1,
    borderColor: ERP_COLOR_CODE.ERP_BORDER_LINE,
    borderRadius: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "#00000099",
  },
  bottomSheet: {
    height: Dimensions.get("window").height / 2.5,
    backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    marginBottom: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  signatureBox: {
    flex: 1,
    borderWidth: 0.4,
    borderColor: ERP_COLOR_CODE.ERP_APP_COLOR,
    backgroundColor: "#fff",
  },
  buttonOverlay: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-around",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  saveButton: { borderColor: ERP_COLOR_CODE.ERP_BORDER_LINE, borderWidth: 1 },
  clearButton: { borderColor: ERP_COLOR_CODE.ERP_BORDER_LINE, borderWidth: 1 },
  closeButton: { borderColor: ERP_COLOR_CODE.ERP_BORDER_LINE, borderWidth: 1 },
});

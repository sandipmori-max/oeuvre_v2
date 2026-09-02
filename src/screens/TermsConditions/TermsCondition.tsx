import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  useWindowDimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ERP_COLOR_CODE } from "../../utils/constants";
import DeviceInfo from "react-native-device-info";

const TermsAndConsent = ({ onAccept }: any) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationAccepted, setLocationAccepted] = useState(false);
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  
  const handleTermsContinue = () => {
    if (!termsAccepted) {
      return;
    }
    setShowLocationModal(true);
  };
  
  const isIpad =
   ( Platform.OS === "ios" && Platform.isPad) || DeviceInfo.isTablet() || Platform.isTV;

  const handleLocationAgree = async () => {
    setLocationAccepted(true);
    setShowLocationModal(false);

    await AsyncStorage.setItem("TERMS_ACCEPTED", "true");
    await AsyncStorage.setItem("LOCATION_DISCLOSURE_ACCEPTED", "true");

    // Permission request must happen AFTER this
    onAccept();
  };

  return (
    <>
      <View
        style={{
          height: 12,
          marginTop: isLandscape ? 10 : Platform.OS === "ios" ? 40 : 10,
        }}
      />
      <Text
        style={[
          styles.title,
          
        ]}
      >
        Terms & Conditions & Permissions Consent
      </Text>
        <Text style={styles.updated}>
                Last updated: December 10, 2025
        </Text>
      {/*  ==== OLD TERMS & CONDITIONS (UNCHANGED FLOW)  ==== */}
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        style={styles.container}
        contentContainerStyle={{
          paddingHorizontal: isLandscape ? 24 : 0,
          paddingBottom: 60,
        }}
      >
        {isLandscape ? (
          <View style={{ flexDirection: "row" }}>
            <View style={{ width: "48%" }}>
            

              <Text style={[styles.sectionTitle,{
                marginTop: 4
              }]}>1. Introduction</Text>
              <Text style={styles.text}>
                Welcome to DevERP. These Terms & Conditions govern your use of
                our mobile application (“Service”). By using the Service, you
                agree to comply with these terms.
              </Text>

              <Text style={styles.sectionTitle}>2. Account</Text>
              <Text style={styles.text}>
                You may need to create an account to use certain features. You
                are responsible for your account credentials and all activity
                under your account.
              </Text>

              <Text style={styles.sectionTitle}>
                3. Permissions & Data Collection
              </Text>
              <Text style={styles.text}>
                DevERP requests permissions to provide app functionality. Each
                permission is used only with your explicit consent:
              </Text>

              <Text style={styles.subText}>
                • Location (Foreground & Background)
              </Text>
              <Text style={styles.text}>
                Background location is required to provide continuous tracking,
                geofencing, and navigation features. You will see a prominent
                disclosure explaining why this data is needed before permission
                is requested.
              </Text>

              <Text style={styles.subText}>• Foreground Service</Text>
              <Text style={styles.text}>
                Required to keep location tracking active when the app is in the
                background. A persistent notification will appear to indicate
                the service is running.
              </Text>

              <Text style={styles.subText}>• Storage / Media Access</Text>
              <Text style={styles.text}>
                Accessed only when you upload or attach files, photos, videos,
                or documents for app features. One-time or temporary access is
                used whenever possible.
              </Text>
              <Text style={styles.subText}>• Camera & Microphone</Text>
              <Text style={styles.text}>
                Used solely for capturing photos, scanning documents, or audio
                features. Access occurs only after your consent.
              </Text>

              <Text style={styles.subText}>• Notifications & Auto-Start</Text>
              <Text style={styles.text}>
                Used to provide alerts, reminders, updates, and to restart
                background services after device reboot, only if enabled by you.
              </Text>
            </View>

            <View style={{ width: "48%" }}>
              <Text style={styles.sectionTitle}>4. User Responsibilities</Text>
              <Text style={styles.text}>
                You agree to use the Service only for lawful purposes and not
                interfere with the app or servers.
              </Text>

              <Text style={styles.sectionTitle}>5. Third-Party Services</Text>
              <Text style={styles.text}>
                Some features use third-party services (e.g., Google Places)
                that may collect data according to their privacy policies.
              </Text>

              <Text style={styles.sectionTitle}>6. Data Privacy</Text>
              <Text style={styles.text}>
                Personal data is collected, used, and shared as described in our
                Privacy Policy. Users can access, correct, or delete their data.
                Security measures are used, but complete protection cannot be
                guaranteed.
              </Text>

              

              <Text style={styles.sectionTitle}>7. Changes to Terms</Text>
              <Text style={styles.text}>
                We may update these Terms periodically. Users will be notified
                via the app or email.
              </Text>

              <Text style={styles.sectionTitle}>8. Governing Law</Text>
              <Text style={styles.text}>
                These Terms are governed by the laws of India. Disputes fall
                under Ahmedabad, Gujarat jurisdiction.
              </Text>

              {/* TERMS CHECKBOX */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setTermsAccepted(!termsAccepted)}
              >
                <View
                  style={[styles.checkbox, termsAccepted && styles.checkedBox]}
                >
                  {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxText}>
                  I have read and agree to the Terms & Conditions.
                </Text>
              </TouchableOpacity>

              {/* CONTINUE */}
              <TouchableOpacity
                style={[
                  styles.button,
                  !termsAccepted && { backgroundColor: "gray" },
                ]}
                onPress={handleTermsContinue}
              >
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>

            <Text style={[styles.sectionTitle, {
              marginTop: 4
            }]}>1. Introduction</Text>
            <Text style={styles.text}>
              Welcome to DevERP. These Terms & Conditions govern your use of our
              mobile application (“Service”). By using the Service, you agree to
              comply with these terms.
            </Text>

            <Text style={styles.sectionTitle}>2. Account</Text>
            <Text style={styles.text}>
              You may need to create an account to use certain features. You are
              responsible for your account credentials and all activity under
              your account.
            </Text>

            <Text style={styles.sectionTitle}>
              3. Permissions & Data Collection
            </Text>
            <Text style={styles.text}>
              DevERP requests permissions to provide app functionality. Each
              permission is used only with your explicit consent:
            </Text>

            <Text style={styles.subText}>
              • Location (Foreground & Background)
            </Text>
            <Text style={styles.text}>
              Background location is required to provide continuous tracking,
              geofencing, and navigation features. You will see a prominent
              disclosure explaining why this data is needed before permission is
              requested.
            </Text>

            <Text style={styles.subText}>• Foreground Service</Text>
            <Text style={styles.text}>
              Required to keep location tracking active when the app is in the
              background. A persistent notification will appear to indicate the
              service is running.
            </Text>

            <Text style={styles.subText}>• Storage / Media Access</Text>
            <Text style={styles.text}>
              Accessed only when you upload or attach files, photos, videos, or
              documents for app features. One-time or temporary access is used
              whenever possible.
            </Text>

            <Text style={styles.subText}>• Camera & Microphone</Text>
            <Text style={styles.text}>
              Used solely for capturing photos, scanning documents, or audio
              features. Access occurs only after your consent.
            </Text>

            <Text style={styles.subText}>• Notifications & Auto-Start</Text>
            <Text style={styles.text}>
              Used to provide alerts, reminders, updates, and to restart
              background services after device reboot, only if enabled by you.
            </Text>

            <Text style={styles.sectionTitle}>4. User Responsibilities</Text>
            <Text style={styles.text}>
              You agree to use the Service only for lawful purposes and not
              interfere with the app or servers.
            </Text>

            <Text style={styles.sectionTitle}>5. Third-Party Services</Text>
            <Text style={styles.text}>
              Some features use third-party services (e.g., Google Places) that
              may collect data according to their privacy policies.
            </Text>

            <Text style={styles.sectionTitle}>6. Data Privacy</Text>
            <Text style={styles.text}>
              Personal data is collected, used, and shared as described in our
              Privacy Policy. Users can access, correct, or delete their data.
              Security measures are used, but complete protection cannot be
              guaranteed.
            </Text>

            

            <Text style={styles.sectionTitle}>7. Changes to Terms</Text>
            <Text style={styles.text}>
              We may update these Terms periodically. Users will be notified via
              the app or email.
            </Text>

            <Text style={styles.sectionTitle}>8. Governing Law</Text>
            <Text style={styles.text}>
              These Terms are governed by the laws of India. Disputes fall under
              Ahmedabad, Gujarat jurisdiction.
            </Text>
 

            {/* TERMS CHECKBOX */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setTermsAccepted(!termsAccepted)}
            >
              <View
                style={[styles.checkbox, termsAccepted && styles.checkedBox]}
              >
                {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxText}>
                I have read and agree to the Terms & Conditions.
              </Text>
            </TouchableOpacity>

            {/* CONTINUE */}
            <TouchableOpacity
              style={[
                styles.button,
                !termsAccepted && { backgroundColor: "gray" },
              ]}
              onPress={handleTermsContinue}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/*  ==== LOCATION DISCLOSURE MODAL (NEW)  ==== */}
      <Modal
        supportedOrientations={["portrait", "landscape"]}
        visible={showLocationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View
          style={[
            styles.modalOverlay,
            (isLandscape || isIpad)  && {
              alignContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <View
            style={[
              styles.modalBox,
              {
                width: isIpad ? '50%' : isLandscape ? "50%" : "100%",
              },
              
            ]}
          >
            <Text style={styles.modalTitle}>
              Location Data Usage Disclosure
            </Text>

            <Text style={styles.modalText}>
            * DevERP collects and uses location data to enable real-time
              tracking, operational monitoring, and geofencing features.
            </Text>

            <Text style={styles.modalText}>
             * Location data may be collected even when the app is closed or not
              in use (background) to ensure uninterrupted services.
            </Text>

            <Text style={styles.modalText}>
             * Location data is used only for app functionality and is not sold
              or shared for advertising.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowLocationModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.allowBtn]}
                onPress={handleLocationAgree}
              >
                <Text style={styles.allowText}>Agree & Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  subText: { fontSize: 14, fontWeight: "600", marginBottom: 5, marginLeft: 10 },
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 15 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center" },
  updated: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 15 },
  text: { fontSize: 14, color: "#333", marginTop: 6 },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#555",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkedBox: { backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR },
  checkmark: { color: "#fff", fontWeight: "bold" },
  checkboxText: {
    marginLeft: 10,
    fontSize: 14,
    flex: 1,
  },

  button: {
    marginTop: 25,
    backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    alignContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "100%",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalText: { fontSize: 14, marginBottom: 8, color: "#333" },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 10,
  },
  cancelBtn: { backgroundColor: "#e0e0e0" },
  allowBtn: { backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR },
  cancelText: { color: "#333", fontWeight: "600" },
  allowText: { color: "#fff", fontWeight: "600" },
});

export default TermsAndConsent;

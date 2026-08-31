import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { ERP_COLOR_CODE } from "../../../../utils/constants";
import { useAppSelector } from "../../../../store/hooks";
import useTranslations from "../../../../hooks/useTranslations";
import TranslatedText from "../../tabs/home/TranslatedText";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const RemarksView = ({ color, remarks }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const theme = useAppSelector((state) => state?.theme.mode);
  const { t } = useTranslations();

  if (!remarks) return null;

  const isLongText = remarks.length > 60;

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((prev) => !prev);
  };

  const isDark = theme === "dark";

  return (
    <View
      style={[{
        width: "100%", 
        backgroundColor: isDark ? "#000" : "#FFFFFF",
        marginVertical: 4
      }, color && {
        backgroundColor : color
      }]}
    >
       

      {/* Remarks Text */}
      <TranslatedText
        numberOfLines={isExpanded ? undefined : 2}
        style={{
          color: isDark ? "#E5E7EB" : ERP_COLOR_CODE.ERP_777,
          fontSize: 13,
          lineHeight: 18,
        }}
        text={typeof remarks === 'string' ?  remarks?.replace(" ", "").replace("\n", "") : remarks}
      />

      {/* Expand Button */}
      {isLongText && (
        <TouchableOpacity
          onPress={toggleExpand}
          activeOpacity={0.7}
          style={{ 
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-start",
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "500",
              color: ERP_COLOR_CODE.ERP_APP_COLOR,
              marginRight: 4,
            }}
          >
            {isExpanded ? t("text.text32") : t("text.text33")}
          </Text>

          <MaterialIcons
            name={isExpanded ? "expand-less" : "expand-more"}
            size={16}
            color={ERP_COLOR_CODE.ERP_APP_COLOR}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default RemarksView;
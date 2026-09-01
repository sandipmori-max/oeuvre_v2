import React, { useState } from "react";
import { View } from "react-native";
import { TabIconProps } from "./type";
import { styles } from "./tab_style";
import { useAppSelector } from "../../store/hooks";
import { ERP_COLOR_CODE } from "../../utils/constants";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import FontAwesome from "@react-native-vector-icons/fontawesome";
import { useBaseLink } from "../../hooks/useBaseLink";
import FastImage from "react-native-fast-image";
import ERPIcon from "../icon/ERPIcon";
import { ERP_ICON } from "../../assets";

const TabIcon: React.FC<TabIconProps & { focused: boolean }> = ({
  name,
  color,
  size,
  focused,
}) => {

  const theme = useAppSelector((state) => state.theme.mode);

  const { user } = useAppSelector((state) => state?.auth);

  const baseLink = useBaseLink();

  const [imageExists, setImageExists] = useState(true);
 
  return (
    <View style={styles.container}>
      {focused && (
        <View
          style={[
            styles.activeLine,
            {
              backgroundColor:
                theme === "dark"
                  ? "white"
                  : ERP_COLOR_CODE.ERP_APP_COLOR,
            },
          ]}
        />
      )}

      {name?.includes("person") ? (
        <FastImage
          source={{
            uri: `${baseLink}/FileUpload/1/UserMaster/${user?.id}/profileimage.jpeg`,
            priority: FastImage.priority.normal,
            cache: FastImage.cacheControl.web,
          }}
          defaultSource={ERP_ICON.PROFILE1}
          style={{
            height: 24,
            width: 24,
            borderRadius: 11,
            
          }} 
          
          onLoad={() => {
            setImageExists(true);
          }}
          onError={() => {
            setImageExists(false);
          }}
        />
      ) : (
        <>
          {name?.includes("fa fa-") ? (
            <FontAwesome
              name={typeof name === 'string' ? name.replace("fa fa-", "") :  name}
              size={size}
              color={color}
            />
          ) : (
            <MaterialIcons
              name={name || "widgets"}
              size={size}
              color={color}
            />
          )}
        </>
      )}
    </View>
  );
};

export default TabIcon;
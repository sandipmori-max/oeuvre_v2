import React, { memo, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { ERP_COLOR_CODE } from '../../utils/constants';
import TranslatedText from '../../screens/dashboard/tabs/home/TranslatedText';

const ProfileImage = memo(({ userId, baseLink, userName }: any) => {

  const [loading, setLoading] = useState(true);

  if (!userId) return null;

  let initials;

  const parts = userName.trim().split(" ");

  initials = parts[0][0];

  if (parts.length > 1) {
    initials += parts[1][0];
  }

const [profileImageTimestamp, setProfileImageTimestamp] = useState(
  Date.now()
);
  const profileImageUrl = useMemo(
  () =>
    `${baseLink}/FileUpload/1/UserMaster/${userId}/profileimage.jpeg?ts=${profileImageTimestamp}`,
  [baseLink, userId, profileImageTimestamp]
);

  return (
    <View style={{
      width: 130, height: 120,
      backgroundColor: 'lightgray',
      alignContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginBottom: 18, borderWidth: 1, borderColor: 'black', borderRadius: 12
    }}>
      <TranslatedText
        numberOfLines={1}
        text={initials.toUpperCase()}
        style={styles.smLabel}></TranslatedText>

      <FastImage
        source={{
          uri: `${profileImageUrl}`,
          priority: FastImage.priority.normal,
          cache: FastImage.cacheControl.web,
        }}
        style={{ width: '100%', height: '100%', borderRadius: 12 }}
        onLoadEnd={() => setLoading(false)}
      />

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color={ERP_COLOR_CODE.ERP_APP_COLOR} />
        </View>
      )}

      {/* This will now appear ABOVE the image */}
    </View>
  );
});

const styles = StyleSheet.create({
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smLabel: {
    position: "absolute",
    bottom: 26,
    color: "black",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 58,
    textAlign: 'center',
    fontWeight: '400'
  },
});

export default ProfileImage;

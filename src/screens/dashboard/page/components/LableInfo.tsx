import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { styles } from '../page_style'
import InfoTooltip from './Tooltip'
import { ERP_COLOR_CODE } from '../../../../utils/constants'

const LableInfo = ({
  isFromChild,
  isFromDashboard,
  item,
  theme,
  value
}: any) => {
  return (
    <>
      {
        !isFromDashboard && !isFromChild && <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              flexDirection: "row",
            }}
          >
            {
              item?.fieldtitle !== item?.tooltip ?
                <View style={{
                  flexDirection: "row",
                  justifyContent: 'space-between',
                  width: '100%',
                  overflow: 'hidden',
                }}>
                  <View style={{
                    gap: 4,
                  }}>
                    <Text
                      style={[
                        styles.label,
                        theme === "dark" && {
                          color: "white",
                        },
                      ]}
                    >
                      {item?.fieldtitle}  {item?.mandatory === "1" && (
                        <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR }}>*</Text>
                      )}
                    </Text>
                  </View>
                  <>
                    <View style={{
                      justifyContent: 'center',
                      alignContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row',
                      gap: 2
                    }}>
                      {item?.fieldtitle !== item?.tooltip && (
                        <InfoTooltip text={item.tooltip} />
                      )}
                    </View>
                  </>
                </View> : 
                <View
                  style={{ flexDirection: 'row', gap: 4, justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text
                      style={[
                        styles.label,
                        theme === "dark" && {
                          color: "white",
                        },
                      ]}
                    >
                      {item?.fieldtitle} {item?.mandatory === "1" && (
                        <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR }}>*</Text>
                      )}
                    </Text>
                  </View>
                </View>
            }
          </View>
        </View>
      }
    </>
  )
}

export default LableInfo

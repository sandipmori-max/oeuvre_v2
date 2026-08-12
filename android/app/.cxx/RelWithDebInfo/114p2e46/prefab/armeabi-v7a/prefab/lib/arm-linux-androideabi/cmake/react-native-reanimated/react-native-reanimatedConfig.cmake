if(NOT TARGET react-native-reanimated::reanimated)
add_library(react-native-reanimated::reanimated SHARED IMPORTED)
set_target_properties(react-native-reanimated::reanimated PROPERTIES
    IMPORTED_LOCATION "/Users/deverp/Desktop/Sandip_Mori/DevERP_Mobile_app_01/node_modules/react-native-reanimated/android/build/intermediates/cxx/RelWithDebInfo/1f6g2u2h/obj/armeabi-v7a/libreanimated.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/deverp/Desktop/Sandip_Mori/DevERP_Mobile_app_01/node_modules/react-native-reanimated/android/build/prefab-headers/reanimated"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

if(NOT TARGET react-native-reanimated::worklets)
add_library(react-native-reanimated::worklets SHARED IMPORTED)
set_target_properties(react-native-reanimated::worklets PROPERTIES
    IMPORTED_LOCATION "/Users/deverp/Desktop/Sandip_Mori/DevERP_Mobile_app_01/node_modules/react-native-reanimated/android/build/intermediates/cxx/RelWithDebInfo/1f6g2u2h/obj/armeabi-v7a/libworklets.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/deverp/Desktop/Sandip_Mori/DevERP_Mobile_app_01/node_modules/react-native-reanimated/android/build/prefab-headers/worklets"
    INTERFACE_LINK_LIBRARIES ""
)
endif()


if(NOT TARGET react-native-worklets-core::rnworklets)
add_library(react-native-worklets-core::rnworklets SHARED IMPORTED)
set_target_properties(react-native-worklets-core::rnworklets PROPERTIES
    IMPORTED_LOCATION "/Users/deverp/Desktop/Sandip_Mori/oeuvre_v2/node_modules/react-native-worklets-core/android/build/intermediates/cxx/RelWithDebInfo/1z41236q/obj/x86/librnworklets.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/deverp/Desktop/Sandip_Mori/oeuvre_v2/node_modules/react-native-worklets-core/android/build/headers/rnworklets"
    INTERFACE_LINK_LIBRARIES ""
)
endif()


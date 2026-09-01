package com.oeuvre.orientation

import android.app.Activity
import android.content.pm.ActivityInfo
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class OrientationModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return "OrientationModule"
  }

  @ReactMethod
  fun enableLandscape() {
    val activity: Activity? = currentActivity
    activity?.run {
      requestedOrientation =
        ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE
    }
  }

  @ReactMethod
  fun disableLandscape() {
    val activity: Activity? = currentActivity
    activity?.run {
      requestedOrientation =
        ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
    }
  }
}

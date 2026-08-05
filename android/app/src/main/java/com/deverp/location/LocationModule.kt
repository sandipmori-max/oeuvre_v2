package com.deverp.location

import android.content.Intent
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import android.util.Log
import com.deverp.location.LocationService
import com.facebook.react.bridge.ReadableArray
import com.deverp.location.UserData
import java.lang.Exception
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import android.location.Location

class LocationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "LocationModule"
    }



    @ReactMethod
    fun startService() {
        val serviceIntent = Intent(reactContext, LocationService::class.java)
        Log.d(
            "LocationModule",
            "✅ startService called with intent = $serviceIntent"
        )
        ContextCompat.startForegroundService(reactContext, serviceIntent)
    }

    @ReactMethod
    fun setUserTokens(data: ReadableArray) {
        for (i in 0 until data.size()) {
            val item = data.getMap(i)  // Each element is a ReadableMap
            val token = item?.getString("token")
            val link = item?.getString("link")

            if (token != null && link != null) {
                val entry = UserData(token, link)

                // Avoid duplicates
                if (!LocationService.userDataList.contains(entry)) {
                    LocationService.userDataList.add(entry)
                }
            }
        }
        Log.d("LocationModule", "✅ Received token-link pairs: ${LocationService.userDataList}")
    }

    @ReactMethod
    fun stopService() {
        Log.d(
            "LocationModule",
            "❌ stopService called"
        )
        val serviceIntent = Intent(reactContext, LocationService::class.java)
        reactContext.stopService(serviceIntent)
    }
    @ReactMethod
fun clearUserTokens() {
    LocationService.userDataList.clear()
    Log.d("LocationModule", "🧹 User tokens cleared")
}
  @ReactMethod
fun getCurrentLocation(
    promise: Promise
) {

    try {

        val fusedLocationClient =
            LocationServices
                .getFusedLocationProviderClient(
                    reactApplicationContext
                )

        // FAST CACHE CHECK
        fusedLocationClient
            .lastLocation
            .addOnSuccessListener { location ->

                if (location != null) {

                    val age =
                        System.currentTimeMillis() -
                        location.time

                    val accuracy =
                        location.accuracy

                    Log.d(
                        "GPS",
                        "CACHE accuracy=$accuracy age=$age"
                    )

                    // GOOD RECENT LOCATION
                    if (
                        age <= 10000 &&
                        accuracy <= 80
                    ) {

                        val map =
                            Arguments.createMap()

                        map.putDouble(
                            "latitude",
                            location.latitude
                        )

                        map.putDouble(
                            "longitude",
                            location.longitude
                        )

                        map.putDouble(
                            "accuracy",
                            accuracy.toDouble()
                        )

                        map.putDouble(
                            "timestamp",
                            location.time.toDouble()
                        )

                        promise.resolve(map)

                        return@addOnSuccessListener
                    }
                }

                // FAST LIVE GPS
                fusedLocationClient
                    .getCurrentLocation(
                        Priority.PRIORITY_HIGH_ACCURACY,
                        null
                    )
                    .addOnSuccessListener { freshLocation ->

                        if (freshLocation != null) {

                            val map =
                                Arguments.createMap()

                            map.putDouble(
                                "latitude",
                                freshLocation.latitude
                            )

                            map.putDouble(
                                "longitude",
                                freshLocation.longitude
                            )

                            map.putDouble(
                                "accuracy",
                                freshLocation.accuracy.toDouble()
                            )

                            map.putDouble(
                                "timestamp",
                                freshLocation.time.toDouble()
                            )

                            promise.resolve(map)

                        } else {

                            promise.reject(
                                "NO_LOCATION",
                                "Unable to fetch location"
                            )
                        }
                    }
                    .addOnFailureListener { e ->

                        promise.reject(
                            "ERROR",
                            e.message
                        )
                    }
            }

    } catch (e: Exception) {

        promise.reject(
            "ERROR",
            e.message
        )
    }
}
}
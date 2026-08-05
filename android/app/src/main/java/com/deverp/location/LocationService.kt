package com.deverp.location


import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.location.Location
import android.location.LocationManager
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.*
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

class LocationService : Service() {

    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback

    private var lastLocation: Location? = null
    private var lastSyncedLocation: Location? = null
    private var lastSyncTime = 0L

    private val handler = Handler(Looper.getMainLooper())
    private val apiExecutor = Executors.newSingleThreadExecutor()

    companion object {
        var userDataList: MutableList<UserData> = mutableListOf()
    }

    private val MIN_DISTANCE_METERS = 25f
    private val MIN_TIME_MS = 60_000L

    @Volatile
    private var disabledSentOnce = false

    // ---------------- SERVICE LIFECYCLE ----------------

    override fun onCreate() {
        super.onCreate()

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        startForeground(1, createNotification())

        startLocationUpdates()
        startRepeatingSync()

        registerReceiver(
            locationReceiver,
            IntentFilter(LocationManager.PROVIDERS_CHANGED_ACTION)
        )
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("LocationService", "Service started/restarted")
        return START_STICKY
    }

    override fun onDestroy() {
    super.onDestroy()

    Log.d("LocationService", "🛑 onDestroy called")

    // Stop receiving location updates
    try {
        fusedLocationClient.removeLocationUpdates(locationCallback)
    } catch (e: Exception) {
        Log.e("LocationService", "Error removing location updates", e)
    }

    // Remove all pending callbacks
    handler.removeCallbacksAndMessages(null)

    // Unregister receiver safely
    try {
        unregisterReceiver(locationReceiver)
    } catch (e: Exception) {
        Log.e("LocationService", "Receiver already unregistered", e)
    }

    // Shutdown executor
    try {
        apiExecutor.shutdownNow()
    } catch (e: Exception) {
        Log.e("LocationService", "Executor shutdown failed", e)
    }

    // Remove foreground notification immediately
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
        stopForeground(STOP_FOREGROUND_REMOVE)
    } else {
        @Suppress("DEPRECATION")
        stopForeground(true)
    }

    Log.d("LocationService", "✅ Foreground notification removed")
}

    override fun onBind(intent: Intent?): IBinder? = null

    // ---------------- LOCATION ENABLE / DISABLE ----------------

    private val locationReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent?) {
            if (isLocationEnabled(context)) {
                Log.d("LocationService", "Location enabled by user")
                disabledSentOnce = false
                startLocationUpdates()
            } else {
                Log.w("LocationService", "Location disabled by user")
                fusedLocationClient.removeLocationUpdates(locationCallback)
                sendDisabledToApi()
                notifyLocationDisabled()
            }
        }
    }

    private fun isLocationEnabled(context: Context): Boolean {
        val lm = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
        return lm.isProviderEnabled(LocationManager.GPS_PROVIDER) ||
                lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER)
    }

    // ---------------- FOREGROUND NOTIFICATION ----------------

    private fun createNotification(): Notification {
        val channelId = "location_service_channel"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Location Service",
                NotificationManager.IMPORTANCE_LOW
            )
            getSystemService(NotificationManager::class.java)
                .createNotificationChannel(channel)
        }

        return NotificationCompat.Builder(this, channelId)
            .setContentTitle("ERP Location Tracking")
            .setContentText("Your location is being tracked in background")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setOngoing(true)
            .build()
    }

    private fun notifyLocationDisabled() {
        val notification = NotificationCompat.Builder(this, "location_service_channel")
            .setContentTitle("Enable Location")
            .setContentText("Please enable location services to continue.")
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .build()

        getSystemService(NotificationManager::class.java).notify(2, notification)
    }

    // ---------------- LOCATION UPDATES ----------------

    private fun startLocationUpdates() {
        if (!isLocationEnabled(this)) return

        val request = LocationRequest.Builder(
            Priority.PRIORITY_BALANCED_POWER_ACCURACY,
            15_000
        )
            .setMinUpdateDistanceMeters(20f)
            .build()

        locationCallback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                if (result.locations.isNotEmpty()) {
                    lastLocation = result.locations.last()
                }
            }
        }

        fusedLocationClient.requestLocationUpdates(
            request,
            locationCallback,
            Looper.getMainLooper()
        )
    }

    // ---------------- PERIODIC SYNC ----------------

    private fun startRepeatingSync() {
        val runnable = object : Runnable {
            override fun run() {
                if (!isLocationEnabled(this@LocationService)) {
                    sendDisabledToApi()
                    notifyLocationDisabled()
                } else {
                    disabledSentOnce = false
                    lastLocation?.let { handleNewLocation(it) }
                }
                handler.postDelayed(this, 3 * 60 * 1000)
            }
        }
        handler.post(runnable)
    }

    // ---------------- API CALLS ----------------

    private fun sendDisabledToApi() {
        if (disabledSentOnce || userDataList.isEmpty()) return

        disabledSentOnce = true

        for (user in userDataList) {
            apiExecutor.execute {
                try {
                    val conn = URL("${user.link}/msp_api.aspx/syncLocation")
                        .openConnection() as HttpURLConnection

                    conn.requestMethod = "POST"
                    conn.connectTimeout = 10_000
                    conn.readTimeout = 10_000
                    conn.doOutput = true
                    conn.setRequestProperty("Content-Type", "application/json")

                    val body = """
                        {
                          "token": "${user.token}",
                          "location": "disabled"
                        }
                    """.trimIndent()

                    conn.outputStream.use { it.write(body.toByteArray()) }
                    conn.inputStream.close()
                    conn.disconnect()

                    Log.d("LocationService", "Disabled sent for ${user.token}")
                } catch (e: Exception) {
                    disabledSentOnce = false
                    Log.e("LocationService", "Failed disabled API", e)
                }
            }
        }
    }

    private fun handleNewLocation(location: Location) {
        if (userDataList.isEmpty()) return

        val now = System.currentTimeMillis()

        if (lastSyncedLocation != null) {
            val distance = location.distanceTo(lastSyncedLocation!!)
            val timeDiff = now - lastSyncTime
            if (distance < MIN_DISTANCE_METERS && timeDiff < MIN_TIME_MS) return
        }

        lastSyncedLocation = location
        lastSyncTime = now

        for (user in userDataList) {
            apiExecutor.execute {
                try {
                    val conn = URL("${user.link}/msp_api.aspx/syncLocation")
                        .openConnection() as HttpURLConnection

                    conn.requestMethod = "POST"
                    conn.connectTimeout = 10_000
                    conn.readTimeout = 10_000
                    conn.doOutput = true
                    conn.setRequestProperty("Content-Type", "application/json")

                    val body = """
                        {
                          "token": "${user.token}",
                          "location": "${location.latitude},${location.longitude}"
                        }
                    """.trimIndent()

                    conn.outputStream.use { it.write(body.toByteArray()) }
                    conn.inputStream.close()
                    conn.disconnect()

                    Log.d("LocationService", "Location synced for ${user.token}")
                } catch (e: Exception) {
                    Log.e("LocationService", "Location sync failed", e)
                }
            }
        }
    }
}

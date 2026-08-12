package com.deverp.location

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent?) {

        if (intent?.action == Intent.ACTION_BOOT_COMPLETED) {

            Log.d(
                "BootReceiver",
                "Device rebooted, restarting LocationService"
            )

            try {
                val serviceIntent = Intent(
                    context,
                    LocationService::class.java
                )

                context.startForegroundService(serviceIntent)

            } catch (e: Exception) {
                Log.e(
                    "BootReceiver",
                    "Failed to start LocationService",
                    e
                )
            }
        }
    }
}
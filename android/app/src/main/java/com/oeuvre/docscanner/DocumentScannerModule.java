package com.oeuvre.docscanner;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.*;
import com.google.mlkit.vision.documentscanner.*;

import java.util.UUID;

public class DocumentScannerModule extends ReactContextBaseJavaModule {

    public static final String NAME = "DocumentScanner";
    private Callback callback;
    private static final int REQUEST_CODE = 101;

    public DocumentScannerModule(ReactApplicationContext context) {
        super(context);

        context.addActivityEventListener(new BaseActivityEventListener() {
            @Override
            public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
                if (requestCode == REQUEST_CODE) {
                    handleResult(resultCode, data);
                }
            }
        });
    }

    @NonNull
    @Override
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void launchScanner(ReadableMap options, Callback cb) {
        Activity activity = getCurrentActivity();

        if (activity == null) {
            sendError("Activity is null");
            return;
        }

        if (this.callback != null) {
            sendError("Scanner already in progress");
            return;
        }

        this.callback = cb;

        GmsDocumentScannerOptions options1 =
                new GmsDocumentScannerOptions.Builder()
                        .setPageLimit(1)
                        .build();

        GmsDocumentScanner scanner = GmsDocumentScanning.getClient(options1);

        scanner.getStartScanIntent(activity)
                .addOnSuccessListener(intent -> {
                    try {
                        activity.startIntentSenderForResult(
                                intent, REQUEST_CODE, null, 0, 0, 0
                        );
                    } catch (Exception e) {
                        sendError(e.getMessage());
                    }
                })
                .addOnFailureListener(e -> sendError(e.getMessage()));
    }

    private void handleResult(int resultCode, Intent data) {
        if (callback == null) return;

        if (resultCode == Activity.RESULT_CANCELED) {
            WritableMap res = new WritableNativeMap();
            res.putBoolean("didCancel", true);
            callback.invoke(res);
            callback = null;
            return;
        }

        if (data == null) {
            sendError("No data received");
            return;
        }

        GmsDocumentScanningResult result =
                GmsDocumentScanningResult.fromActivityResultIntent(data);

        WritableArray arr = new WritableNativeArray();

        if (result != null && result.getPages().size() > 0) {
            Uri uri = result.getPages().get(0).getImageUri();

            WritableMap img = new WritableNativeMap();
            img.putString("uri", uri.toString());
            img.putString("fileName", UUID.randomUUID() + ".jpg");

            arr.pushMap(img);
        }

        WritableMap res = new WritableNativeMap();
        res.putArray("images", arr);

        callback.invoke(res);
        callback = null;
    }

    private void sendError(String msg) {
        if (callback == null) return;

        WritableMap err = new WritableNativeMap();
        err.putBoolean("error", true);
        err.putString("errorMessage", msg);
        callback.invoke(err);
        callback = null;
    }
}
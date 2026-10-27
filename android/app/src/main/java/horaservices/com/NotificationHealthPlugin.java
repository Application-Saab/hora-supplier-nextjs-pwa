package horaservices.com;

import android.app.ActivityManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;
import androidx.core.app.NotificationManagerCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Small native helper used by the app's "Notification setup" screen.
 *
 * The stock Capacitor push plugin reports "granted" on Android 12 and older even
 * when the user has switched notifications OFF in system settings, and it cannot
 * open settings screens. This plugin fills those gaps:
 *   getStatus()                       -> real on/off state, channel state, battery state
 *   openNotificationSettings()        -> app (or channel) notification settings
 *   requestIgnoreBatteryOptimization() -> "Allow app to run in background" dialog
 *   openAutoStartSettings()           -> Xiaomi / Oppo / Vivo / Huawei... autostart screens
 *   openAppSettings()                 -> App info screen
 *
 * Installed by scripts/android-setup.js (copied into android/ with your package name).
 */
@CapacitorPlugin(name = "NotificationHealth")
public class NotificationHealthPlugin extends Plugin {

    @PluginMethod
    public void getStatus(PluginCall call) {
        Context ctx = getContext();
        String channelId = call.getString("channelId", "");
        JSObject res = new JSObject();

        res.put("notificationsEnabled", NotificationManagerCompat.from(ctx).areNotificationsEnabled());

        boolean channelExists = false;
        boolean channelEnabled = true;
        boolean channelHasSound = true;
        boolean dndActive = false;

        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && nm != null && channelId != null && !channelId.isEmpty()) {
            NotificationChannel ch = nm.getNotificationChannel(channelId);
            if (ch != null) {
                channelExists = true;
                channelEnabled = ch.getImportance() != NotificationManager.IMPORTANCE_NONE;
                channelHasSound = ch.getSound() != null && ch.getImportance() >= NotificationManager.IMPORTANCE_DEFAULT;
            }
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && nm != null) {
            dndActive = nm.getCurrentInterruptionFilter() > NotificationManager.INTERRUPTION_FILTER_ALL;
        }
        res.put("channelExists", channelExists);
        res.put("channelEnabled", channelEnabled);
        res.put("channelHasSound", channelHasSound);
        res.put("dndActive", dndActive);

        boolean batteryOptimizationIgnored = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PowerManager pm = (PowerManager) ctx.getSystemService(Context.POWER_SERVICE);
            if (pm != null) batteryOptimizationIgnored = pm.isIgnoringBatteryOptimizations(ctx.getPackageName());
        }
        res.put("batteryOptimizationIgnored", batteryOptimizationIgnored);

        boolean backgroundRestricted = false;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            ActivityManager am = (ActivityManager) ctx.getSystemService(Context.ACTIVITY_SERVICE);
            if (am != null) backgroundRestricted = am.isBackgroundRestricted();
        }
        res.put("backgroundRestricted", backgroundRestricted);

        res.put("sdkInt", Build.VERSION.SDK_INT);
        res.put("manufacturer", Build.MANUFACTURER == null ? "" : Build.MANUFACTURER.toLowerCase());
        res.put("brand", Build.BRAND == null ? "" : Build.BRAND.toLowerCase());
        call.resolve(res);
    }

    @PluginMethod
    public void openNotificationSettings(PluginCall call) {
        Context ctx = getContext();
        String pkg = ctx.getPackageName();
        String channelId = call.getString("channelId", null);
        boolean opened = false;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            boolean appEnabled = NotificationManagerCompat.from(ctx).areNotificationsEnabled();
            // If the whole app is allowed but only our channel is muted, jump straight to the channel.
            if (appEnabled && channelId != null && nm != null && nm.getNotificationChannel(channelId) != null) {
                Intent i = new Intent(Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS);
                i.putExtra(Settings.EXTRA_APP_PACKAGE, pkg);
                i.putExtra(Settings.EXTRA_CHANNEL_ID, channelId);
                opened = tryStart(i);
            }
            if (!opened) {
                Intent i = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
                i.putExtra(Settings.EXTRA_APP_PACKAGE, pkg);
                opened = tryStart(i);
            }
        } else {
            // Android 5 - 7
            Intent i = new Intent("android.settings.APP_NOTIFICATION_SETTINGS");
            i.putExtra("app_package", pkg);
            i.putExtra("app_uid", ctx.getApplicationInfo().uid);
            opened = tryStart(i);
        }
        if (!opened) opened = tryStart(appDetailsIntent());
        resolveOpened(call, opened, "notification_settings");
    }

    @PluginMethod
    public void requestIgnoreBatteryOptimization(PluginCall call) {
        boolean opened = false;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Intent direct = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
            direct.setData(Uri.parse("package:" + getContext().getPackageName()));
            opened = tryStart(direct);
            if (!opened) opened = tryStart(new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS));
        }
        if (!opened) opened = tryStart(appDetailsIntent());
        resolveOpened(call, opened, "battery");
    }

    @PluginMethod
    public void openAutoStartSettings(PluginCall call) {
        String[][] candidates = {
            // Xiaomi / Redmi / POCO (MIUI, HyperOS)
            { "com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity" },
            // Oppo / Realme / newer OnePlus (ColorOS)
            { "com.coloros.safecenter", "com.coloros.safecenter.permission.startup.StartupAppListActivity" },
            { "com.coloros.safecenter", "com.coloros.safecenter.startupapp.StartupAppListActivity" },
            { "com.oppo.safe", "com.oppo.safe.permission.startup.StartupAppListActivity" },
            // Vivo / iQOO (FuntouchOS, OriginOS)
            { "com.vivo.permissionmanager", "com.vivo.permissionmanager.activity.BgStartUpManagerActivity" },
            { "com.iqoo.secure", "com.iqoo.secure.ui.phoneoptimize.AddWhiteListActivity" },
            { "com.iqoo.secure", "com.iqoo.secure.ui.phoneoptimize.BgStartUpManager" },
            // Huawei / Honor (EMUI, MagicOS)
            { "com.huawei.systemmanager", "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity" },
            { "com.huawei.systemmanager", "com.huawei.systemmanager.optimize.process.ProtectActivity" },
            { "com.hihonor.systemmanager", "com.hihonor.systemmanager.startupmgr.ui.StartupNormalAppListActivity" },
            // Older OnePlus (OxygenOS)
            { "com.oneplus.security", "com.oneplus.security.chainlaunch.view.ChainLaunchAppListActivity" },
            // Asus
            { "com.asus.mobilemanager", "com.asus.mobilemanager.autostart.AutoStartActivity" },
            { "com.asus.mobilemanager", "com.asus.mobilemanager.MainActivity" },
            // Letv / LeEco
            { "com.letv.android.letvsafe", "com.letv.android.letvsafe.AutobootManageActivity" },
            // Samsung (battery / "Never sleeping apps")
            { "com.samsung.android.lool", "com.samsung.android.sm.ui.battery.BatteryActivity" },
        };
        for (String[] c : candidates) {
            Intent i = new Intent();
            i.setComponent(new ComponentName(c[0], c[1]));
            if (tryStart(i)) {
                resolveOpened(call, true, "oem_autostart");
                return;
            }
        }
        resolveOpened(call, tryStart(appDetailsIntent()), "app_details");
    }

    @PluginMethod
    public void openAppSettings(PluginCall call) {
        resolveOpened(call, tryStart(appDetailsIntent()), "app_details");
    }

    private Intent appDetailsIntent() {
        Intent i = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        i.setData(Uri.parse("package:" + getContext().getPackageName()));
        return i;
    }

    private boolean tryStart(Intent intent) {
        try {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            if (getActivity() != null) getActivity().startActivity(intent);
            else getContext().startActivity(intent);
            return true;
        } catch (Exception e) {
            // ActivityNotFoundException / SecurityException: screen not present on this phone
            return false;
        }
    }

    private void resolveOpened(PluginCall call, boolean opened, String screen) {
        JSObject r = new JSObject();
        r.put("opened", opened);
        r.put("screen", screen);
        call.resolve(r);
    }
}


package horaservices.com;

import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.util.Base64;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.OutputStream;

@CapacitorPlugin(name = "MediaSave")
public class MediaSavePlugin extends Plugin {

    @PluginMethod
    public void saveFile(PluginCall call) {

        String fileName = call.getString("fileName");
        String mimeType = call.getString("mimeType");
        String data = call.getString("data");

        if (fileName == null || mimeType == null || data == null) {
            call.reject("Missing file information");
            return;
        }

        Uri uri = null;

        try {
            byte[] bytes = Base64.decode(data, Base64.DEFAULT);

            boolean isImage = mimeType.startsWith("image/");

            Uri collection = isImage
                    ? MediaStore.Images.Media.EXTERNAL_CONTENT_URI
                    : MediaStore.Downloads.EXTERNAL_CONTENT_URI;

            ContentValues values = new ContentValues();
            values.put(MediaStore.MediaColumns.DISPLAY_NAME, fileName);
            values.put(MediaStore.MediaColumns.MIME_TYPE, mimeType);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                values.put(
                        MediaStore.MediaColumns.RELATIVE_PATH,
                        isImage ? "Pictures/HORA" : "Download/HORA"
                );

                values.put(MediaStore.MediaColumns.IS_PENDING, 1);
            }

            uri = getContext().getContentResolver()
                    .insert(collection, values);

            if (uri == null) {
                call.reject("Unable to create file");
                return;
            }

            try (OutputStream output = getContext()
                    .getContentResolver().openOutputStream(uri)) {

                if (output == null) {
                    throw new Exception("Unable to open file");
                }

                output.write(bytes);
                output.flush();
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ContentValues completed = new ContentValues();
                completed.put(MediaStore.MediaColumns.IS_PENDING, 0);

                getContext().getContentResolver()
                        .update(uri, completed, null, null);
            }

            call.resolve();

        } catch (Exception e) {

            if (uri != null) {
                getContext().getContentResolver().delete(
                        uri, null, null
                );
            }

            call.reject("File save failed: " + e.getMessage(), e);
        }
    }
}

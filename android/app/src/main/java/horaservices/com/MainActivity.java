package horaservices.com;

import android.os.Bundle;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback; // Ensure this import is present
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Bridge;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Override the back button behavior
        this.getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                Bridge bridge = getBridge();
                if (bridge == null) {
                    finish();
                    return;
                }
                
                // Handle back navigation
                boolean canGoBack = bridge.getWebView().canGoBack();
                if (canGoBack) {
                    bridge.getWebView().goBack();
                } else {
                    // Optionally, show a toast or exit the app
                    Toast.makeText(getApplicationContext(), "No pages to go back", Toast.LENGTH_SHORT).show();
                    // finish(); // Uncomment to exit the app
                }
            }
        });
    }
}

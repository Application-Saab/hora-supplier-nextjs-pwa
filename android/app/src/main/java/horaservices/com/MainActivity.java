package horaservices.com;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    @Override
    public void onBackPressed() {
        moveTaskToBack(true); // Move the app to the background instead of closing it
    }

}

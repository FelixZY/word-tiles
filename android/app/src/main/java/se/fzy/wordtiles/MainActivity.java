package se.fzy.wordtiles;

import android.annotation.SuppressLint;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebSettings;

import androidx.annotation.RequiresApi;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @SuppressLint("SourceLockedOrientationActivity")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Configuration configuration = getResources().getConfiguration();
        if (configuration.smallestScreenWidthDp < 720) {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        }
    }

//    @Override
//    public void onConfigurationChanged(Configuration newConfig) {
//        super.onConfigurationChanged(newConfig);
//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
//            setTheme(R.style.AppTheme);
//            configureDarkMode();
//        }
//    }
//
//    @Override
//    public void onResume() {
//        super.onResume();
//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
//            setTheme(R.style.AppTheme);
//            configureDarkMode();
//        }
//    }
//
//    @RequiresApi(api = Build.VERSION_CODES.Q)
//    private void configureDarkMode() {
//        Configuration configuration = getResources().getConfiguration();
//        WebSettings webSettings = bridge.getWebView().getSettings();
//        if ((configuration.uiMode & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES) {
//            webSettings.setForceDark(WebSettings.FORCE_DARK_ON);
//        } else {
//            webSettings.setForceDark(WebSettings.FORCE_DARK_OFF);
//        }
//    }
}

package ee.torg.stuudium.enhancement

import android.app.Activity
import android.app.AlertDialog
import android.content.pm.ApplicationInfo
import android.graphics.Color
import android.view.View
import android.webkit.CookieManager
import android.webkit.WebSettings
import android.webkit.WebView
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.enableEdgeToEdge
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.webkit.WebViewFeature
import org.json.JSONObject

data class MobileAssetBundle(
    val bootstrap: String,
    val criticalCss: String,
    val themeCss: String,
    val settingsMenuCss: String,
) {
    companion object {
        fun load(activity: Activity): MobileAssetBundle =
            MobileAssetBundle(
                bootstrap = activity.readAsset("mobile/injection/bootstrap.js"),
                criticalCss = activity.readAsset("mobile/injection/critical.css"),
                themeCss = activity.readAsset("mobile/injection/theme.css"),
                settingsMenuCss = activity.readAsset("mobile/injection/settings-menu.css"),
            )
    }
}

fun Activity.readAsset(path: String): String =
    assets.open(path).bufferedReader(Charsets.UTF_8).use { it.readText() }

fun supportsRequiredWebViewFeatures(): Boolean =
    WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT) &&
        WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)

fun Activity.showUnsupportedWebViewDialog() {
    AlertDialog.Builder(this)
        .setTitle(R.string.webview_update_title)
        .setMessage(R.string.webview_update_body)
        .setCancelable(false)
        .setPositiveButton(R.string.close) { _, _ -> finish() }
        .show()
}

fun configureSecureWebView(
    webView: WebView,
    allowDomStorage: Boolean,
    allowUserSelectedContent: Boolean,
) {
    val isDebuggable =
        webView.context.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE != 0
    WebView.setWebContentsDebuggingEnabled(isDebuggable)
    webView.setBackgroundColor(Color.TRANSPARENT)
    webView.settings.apply {
        javaScriptEnabled = true
        domStorageEnabled = allowDomStorage
        allowFileAccess = false
        allowContentAccess = allowUserSelectedContent
        mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
        javaScriptCanOpenWindowsAutomatically = false
        setSupportMultipleWindows(false)
        mediaPlaybackRequiresUserGesture = true
        safeBrowsingEnabled = true
    }
    CookieManager.getInstance().apply {
        setAcceptCookie(true)
        setAcceptThirdPartyCookies(webView, false)
    }
}

fun ComponentActivity.applySystemBarTheme(canvas: Int, dark: Boolean = true) {
    val style =
        if (dark) {
            SystemBarStyle.dark(canvas)
        } else {
            SystemBarStyle.light(canvas, canvas)
        }
    enableEdgeToEdge(
        statusBarStyle = style,
        navigationBarStyle = style,
    )
}

fun applySystemBarInsets(root: View) {
    val initialLeft = root.paddingLeft
    val initialTop = root.paddingTop
    val initialRight = root.paddingRight
    val initialBottom = root.paddingBottom

    ViewCompat.setOnApplyWindowInsetsListener(root) { view, insets ->
        val systemBars =
            insets.getInsets(
                WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout(),
            )
        view.setPadding(
            initialLeft + systemBars.left,
            initialTop + systemBars.top,
            initialRight + systemBars.right,
            initialBottom + systemBars.bottom,
        )
        insets
    }
}

fun buildDocumentStartScript(
    assets: MobileAssetBundle,
    settings: AppSettings,
): String {
    val settingsJson = JSONObject.quote(settings.toJson().toString())
    val criticalCss = JSONObject.quote(assets.criticalCss)
    val themeCss = JSONObject.quote(assets.themeCss)
    val settingsMenuCss = JSONObject.quote(assets.settingsMenuCss)

    return """
        (() => {
          const start = () => {
            const root = document.documentElement;
            const settings = JSON.parse($settingsJson);
            window.__sidMobileInitialSettings = settings;
            root.setAttribute("data-sid-theme", settings.theme.themeId);
            if (settings.enhancementEnabled) {
              root.setAttribute("data-sid-enhancement", "enabled");
            } else {
              root.removeAttribute("data-sid-enhancement");
            }

            const installStyle = (id, css) => {
              let style = document.getElementById(id);
              if (!(style instanceof HTMLStyleElement)) {
                style = document.createElement("style");
                style.id = id;
                root.append(style);
              }
              style.textContent = css;
            };

            installStyle("sid-mobile-critical", $criticalCss);
            installStyle("sid-mobile-theme", $themeCss);
            installStyle("sid-mobile-settings-menu", $settingsMenuCss);
            ${assets.bootstrap}
          };

          if (document.documentElement) {
            start();
          } else {
            const observer = new MutationObserver(() => {
              if (!document.documentElement) return;
              observer.disconnect();
              start();
            });
            observer.observe(document, { childList: true });
          }
        })();
    """.trimIndent()
}

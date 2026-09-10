package ee.torg.stuudium.enhancement

import android.content.ActivityNotFoundException
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.webkit.RenderProcessGoneDetail
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.widget.FrameLayout
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.webkit.WebMessageCompat
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewClientCompat
import androidx.webkit.WebViewCompat
import java.io.ByteArrayInputStream
import org.json.JSONObject

class SettingsActivity : ComponentActivity() {
    private lateinit var config: MobileConfig
    private lateinit var preferences: AppPreferences
    private lateinit var root: FrameLayout
    private lateinit var webView: WebView
    private var rendererGone = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        config = MobileConfig.load(this)
        preferences = AppPreferences(this, config)
        val settings = preferences.get()
        val canvas = Color.parseColor(config.canvasFor(settings.themeId))
        applySystemBarTheme(canvas)

        setContentView(R.layout.activity_settings)
        root = findViewById(R.id.settings_root)
        webView = findViewById(R.id.settings_webview)
        applySystemBarInsets(root)

        root.setBackgroundColor(canvas)
        webView.setBackgroundColor(canvas)
        applySystemBarTheme(canvas)

        if (!supportsRequiredWebViewFeatures()) {
            showUnsupportedWebViewDialog()
            return
        }

        configureSettingsWebView(settings)
        webView.loadUrl(SETTINGS_URL)
    }

    private fun configureSettingsWebView(settings: AppSettings) {
        configureSecureWebView(
            webView,
            allowDomStorage = false,
            allowUserSelectedContent = false,
        )
        val assetLoader =
            WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
                .build()
        val settingsOriginPolicy = SupportedOriginPolicy(setOf(SETTINGS_ORIGIN))

        webView.webViewClient =
            object : WebViewClientCompat() {
                override fun shouldInterceptRequest(
                    view: WebView,
                    request: WebResourceRequest,
                ): WebResourceResponse? {
                    if (settingsOriginPolicy.isAllowed(request.url.toString())) {
                        return assetLoader.shouldInterceptRequest(request.url)
                    }

                    return WebResourceResponse(
                        "text/plain",
                        "utf-8",
                        403,
                        "Blocked",
                        mapOf("Cache-Control" to "no-store"),
                        ByteArrayInputStream(ByteArray(0)),
                    )
                }

                override fun shouldOverrideUrlLoading(
                    view: WebView,
                    request: WebResourceRequest,
                ): Boolean {
                    if (!request.isForMainFrame) return false
                    if (settingsOriginPolicy.isAllowed(request.url.toString())) return false
                    openExternal(request.url)
                    return true
                }

                override fun onRenderProcessGone(
                    view: WebView,
                    detail: RenderProcessGoneDetail,
                ): Boolean {
                    rendererGone = true
                    view.destroy()
                    Toast.makeText(
                        this@SettingsActivity,
                        R.string.load_error_title,
                        Toast.LENGTH_SHORT,
                    ).show()
                    finish()
                    return true
                }
            }

        val startupScript =
            """
                (() => {
                  const root = document.documentElement;
                  root.setAttribute("data-sid-theme", ${JSONObject.quote(settings.themeId)});
                  root.style.background = ${JSONObject.quote(config.canvasFor(settings.themeId))};
                })();
            """.trimIndent()
        WebViewCompat.addDocumentStartJavaScript(
            webView,
            startupScript,
            setOf(SETTINGS_ORIGIN),
        )

        WebViewCompat.addWebMessageListener(
            webView,
            SETTINGS_BRIDGE,
            setOf(SETTINGS_ORIGIN),
        ) { _, message, sourceOrigin, isMainFrame, replyProxy ->
            if (
                !isMainFrame ||
                message.type != WebMessageCompat.TYPE_STRING ||
                !settingsOriginPolicy.isAllowedOrigin(sourceOrigin.toString())
            ) {
                return@addWebMessageListener
            }

            if (message.data == "close-settings") {
                finish()
                return@addWebMessageListener
            }

            val response = handleSettingsRequest(message.data)
            replyProxy.postMessage(response.toString())
        }
    }

    private fun handleSettingsRequest(rawRequest: String?): JSONObject {
        var requestId = "unknown"
        return try {
            val request = JSONObject(rawRequest ?: "")
            requestId = request.optString("id", requestId)

            val settings =
                when (request.optString("type")) {
                    "get-settings" -> preferences.get()
                    "set-settings" -> {
                        val normalized = AppSettings.fromJson(request.optJSONObject("settings"), config)
                        preferences.set(normalized)
                        normalized
                    }
                    else -> throw IllegalArgumentException("Unsupported settings request")
                }

            JSONObject()
                .put("id", requestId)
                .put("ok", true)
                .put("settings", settings.toJson())
        } catch (_: Exception) {
            JSONObject()
                .put("id", requestId)
                .put("ok", false)
                .put("error", "The settings request was invalid.")
        }
    }

    private fun openExternal(uri: Uri) {
        try {
            startActivity(Intent(Intent.ACTION_VIEW, uri).addCategory(Intent.CATEGORY_BROWSABLE))
        } catch (_: ActivityNotFoundException) {
            Toast.makeText(this, R.string.load_error_title, Toast.LENGTH_SHORT).show()
        }
    }

    override fun onResume() {
        super.onResume()
        if (::webView.isInitialized) webView.onResume()
    }

    override fun onPause() {
        if (::webView.isInitialized) webView.onPause()
        super.onPause()
    }

    override fun onDestroy() {
        if (::webView.isInitialized && !rendererGone) {
            webView.stopLoading()
            root.removeView(webView)
            webView.destroy()
        }
        super.onDestroy()
    }

    companion object {
        private const val SETTINGS_ORIGIN = "https://appassets.androidplatform.net"
        private const val SETTINGS_URL = "$SETTINGS_ORIGIN/assets/mobile/settings/index.html"
        private const val SETTINGS_BRIDGE = "sidMobileSettings"
    }
}

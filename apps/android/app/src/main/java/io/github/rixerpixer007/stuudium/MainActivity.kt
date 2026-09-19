package io.github.rixerpixer007.stuudium

import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.SharedPreferences
import android.content.res.ColorStateList
import android.graphics.Bitmap
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.View
import android.webkit.RenderProcessGoneDetail
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import androidx.webkit.ScriptHandler
import androidx.webkit.WebMessageCompat
import androidx.webkit.WebViewCompat
import java.util.concurrent.Executors

class MainActivity : ComponentActivity() {
    private lateinit var config: MobileConfig
    private lateinit var preferences: AppPreferences
    private lateinit var updatePreferences: AppUpdatePreferences
    private lateinit var originPolicy: SupportedOriginPolicy
    private lateinit var assets: MobileAssetBundle
    private lateinit var root: FrameLayout
    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var webView: WebView
    private lateinit var loadingSurface: View
    private lateinit var loadingIndicator: ProgressBar
    private lateinit var errorPanel: LinearLayout
    private val navigationPresentation = NavigationPresentationPolicy()
    private var documentStartScript: ScriptHandler? = null
    private var fileChooserCallback: ValueCallback<Array<Uri>>? = null
    private var rendererGone = false
    private var updateCheckStarted = false
    private val updateCheckExecutor = Executors.newSingleThreadExecutor()

    private val fileChooserLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            val callback = fileChooserCallback ?: return@registerForActivityResult
            fileChooserCallback = null
            callback.onReceiveValue(
                WebChromeClient.FileChooserParams.parseResult(result.resultCode, result.data),
            )
        }

    private val preferenceListener =
        SharedPreferences.OnSharedPreferenceChangeListener { _, key ->
            if (key != AppPreferences.SETTINGS_KEY) return@OnSharedPreferenceChangeListener
            runOnUiThread { applyPreferenceChange(preferences.get()) }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        config = MobileConfig.load(this)
        preferences = AppPreferences(this, config)
        updatePreferences = AppUpdatePreferences(this)
        originPolicy = SupportedOriginPolicy(config.supportedOrigins)
        assets = MobileAssetBundle.load(this)
        val initialSettings = preferences.get()
        applySystemBarTheme(
            nativeCanvasFor(initialSettings),
            dark = initialSettings.enhancementEnabled,
        )

        setContentView(R.layout.activity_main)
        root = findViewById(R.id.root)
        swipeRefresh = findViewById(R.id.swipe_refresh)
        webView = findViewById(R.id.stuudium_webview)
        loadingSurface = findViewById(R.id.loading_surface)
        loadingIndicator = findViewById(R.id.loading_indicator)
        errorPanel = findViewById(R.id.error_panel)
        applySystemBarInsets(root)

        applyNativePalette(initialSettings)
        if (!supportsRequiredWebViewFeatures()) {
            showUnsupportedWebViewDialog()
            return
        }

        configureWebView()
        configurePullToRefresh()
        registerSettingsCommand()
        registerDocumentStartScript(initialSettings)
        preferences.registerListener(preferenceListener)

        findViewById<Button>(R.id.retry_button).setOnClickListener {
            if (rendererGone) {
                recreate()
            } else {
                showLoading()
                webView.reload()
            }
        }

        onBackPressedDispatcher.addCallback(
            this,
            object : OnBackPressedCallback(true) {
                override fun handleOnBackPressed() {
                    if (::webView.isInitialized && webView.canGoBack()) {
                        webView.goBack()
                    } else {
                        finish()
                    }
                }
            },
        )

        val restored = savedInstanceState != null && webView.restoreState(savedInstanceState) != null
        if (!restored) webView.loadUrl(START_URL)
    }

    private fun configureWebView() {
        configureSecureWebView(
            webView,
            allowDomStorage = true,
            allowUserSelectedContent = true,
        )
        val webAuthenticationStatus = enableWebAuthenticationForApp(webView)
        if (webAuthenticationStatus != WebAuthenticationStatus.ENABLED) {
            Log.w(TAG, "Web authentication support: $webAuthenticationStatus")
        }
        webView.webViewClient =
            object : WebViewClient() {
                override fun shouldOverrideUrlLoading(
                    view: WebView,
                    request: WebResourceRequest,
                ): Boolean {
                    if (!request.isForMainFrame) return false
                    val url = request.url.toString()
                    if (url == "about:blank" || originPolicy.isAllowed(url)) return false
                    openExternal(request.url)
                    return true
                }

                override fun onPageStarted(view: WebView, url: String, favicon: Bitmap?) {
                    if (
                        originPolicy.isAllowed(url) &&
                        navigationPresentation.shouldShowLaunchCover()
                    ) {
                        showLoading()
                    }
                }

                override fun onPageCommitVisible(view: WebView, url: String) {
                    if (originPolicy.isAllowed(url)) revealWebView()
                }

                override fun onPageFinished(view: WebView, url: String) {
                    stopRefreshing()
                }

                override fun onReceivedError(
                    view: WebView,
                    request: WebResourceRequest,
                    error: WebResourceError,
                ) {
                    if (request.isForMainFrame) showLoadError()
                }

                override fun onRenderProcessGone(
                    view: WebView,
                    detail: RenderProcessGoneDetail,
                ): Boolean {
                    rendererGone = true
                    view.destroy()
                    showLoadError()
                    return true
                }
            }

        webView.webChromeClient =
            object : WebChromeClient() {
                override fun onShowFileChooser(
                    webView: WebView,
                    filePathCallback: ValueCallback<Array<Uri>>,
                    fileChooserParams: FileChooserParams,
                ): Boolean {
                    fileChooserCallback?.onReceiveValue(null)
                    fileChooserCallback = filePathCallback

                    return try {
                        fileChooserLauncher.launch(fileChooserParams.createIntent())
                        true
                    } catch (_: ActivityNotFoundException) {
                        fileChooserCallback = null
                        filePathCallback.onReceiveValue(null)
                        false
                    }
                }
            }

        webView.setDownloadListener { url, _, _, _, _ ->
            openExternal(Uri.parse(url))
        }
    }

    private fun configurePullToRefresh() {
        swipeRefresh.setOnChildScrollUpCallback { _, _ ->
            webView.canScrollVertically(-1)
        }
        swipeRefresh.setOnRefreshListener {
            val currentUrl = webView.url
            if (rendererGone || currentUrl == null || !originPolicy.isAllowed(currentUrl)) {
                stopRefreshing()
                return@setOnRefreshListener
            }
            webView.reload()
        }
    }

    private fun registerSettingsCommand() {
        WebViewCompat.addWebMessageListener(
            webView,
            MOBILE_SHELL_BRIDGE,
            originPolicy.allowedOriginRules,
        ) { _, message, sourceOrigin, isMainFrame, _ ->
            if (
                isMainFrame &&
                message.type == WebMessageCompat.TYPE_STRING &&
                message.data == OPEN_SETTINGS_COMMAND &&
                originPolicy.isAllowedOrigin(sourceOrigin.toString())
            ) {
                startActivity(Intent(this, SettingsActivity::class.java))
            }
        }
    }

    private fun registerDocumentStartScript(settings: AppSettings) {
        documentStartScript?.remove()
        documentStartScript =
            WebViewCompat.addDocumentStartJavaScript(
                webView,
                buildDocumentStartScript(assets, settings),
                originPolicy.allowedOriginRules,
            )
    }

    private fun applyPreferenceChange(settings: AppSettings) {
        applyNativePalette(settings)
        if (!::webView.isInitialized || rendererGone) return
        registerDocumentStartScript(settings)
        val settingsJson = org.json.JSONObject.quote(settings.toJson().toString())
        webView.evaluateJavascript("window.__sidMobileApplySettings?.($settingsJson);", null)
    }

    private fun applyNativePalette(settings: AppSettings) {
        val canvas = nativeCanvasFor(settings)
        root.setBackgroundColor(canvas)
        loadingSurface.setBackgroundColor(canvas)
        loadingIndicator.indeterminateTintList =
            ColorStateList.valueOf(Color.parseColor(config.accentFor(settings.themeId)))
        swipeRefresh.setColorSchemeColors(Color.parseColor(config.accentFor(settings.themeId)))
        swipeRefresh.setProgressBackgroundColorSchemeColor(canvas)
        swipeRefresh.setBackgroundColor(canvas)
        webView.setBackgroundColor(canvas)
        errorPanel.setBackgroundColor(Color.parseColor(config.canvasFor(settings.themeId)))
        applySystemBarTheme(canvas, dark = settings.enhancementEnabled)
    }

    private fun nativeCanvasFor(settings: AppSettings): Int =
        if (settings.enhancementEnabled) {
            Color.parseColor(config.canvasFor(settings.themeId))
        } else {
            Color.WHITE
        }

    private fun showLoading() {
        rendererGone = false
        stopRefreshing()
        errorPanel.visibility = View.GONE
        webView.visibility = View.INVISIBLE
        loadingSurface.visibility = View.VISIBLE
    }

    private fun revealWebView() {
        if (rendererGone) return
        navigationPresentation.recordVisibleCommit()
        errorPanel.visibility = View.GONE
        webView.visibility = View.VISIBLE
        loadingSurface.visibility = View.GONE
        maybeCheckForAppUpdate()
    }

    private fun maybeCheckForAppUpdate() {
        if (updateCheckStarted) return
        val nowMillis = System.currentTimeMillis()
        if (!updatePreferences.shouldCheck(nowMillis)) return

        updateCheckStarted = true
        updatePreferences.recordAttempt(nowMillis)
        val installedVersionCode = installedAppVersion().code
        updateCheckExecutor.execute {
            val result = AppUpdateClient.check(installedVersionCode)
            val update = result.update ?: return@execute
            runOnUiThread {
                if (!isFinishing && !isDestroyed) {
                    showAppUpdateDialog(update) {
                        openExternal(Uri.parse(update.releaseUrl))
                    }
                }
            }
        }
    }

    private fun showLoadError() {
        stopRefreshing()
        loadingSurface.visibility = View.GONE
        webView.visibility = View.INVISIBLE
        errorPanel.visibility = View.VISIBLE
    }

    private fun stopRefreshing() {
        if (::swipeRefresh.isInitialized) swipeRefresh.isRefreshing = false
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

    override fun onSaveInstanceState(outState: Bundle) {
        if (::webView.isInitialized && !rendererGone) webView.saveState(outState)
        super.onSaveInstanceState(outState)
    }

    override fun onDestroy() {
        if (::preferences.isInitialized) preferences.unregisterListener(preferenceListener)
        fileChooserCallback?.onReceiveValue(null)
        fileChooserCallback = null
        documentStartScript?.remove()
        updateCheckExecutor.shutdownNow()
        if (::webView.isInitialized && !rendererGone) {
            stopRefreshing()
            webView.stopLoading()
            webView.webChromeClient = null
            swipeRefresh.removeView(webView)
            webView.destroy()
        }
        super.onDestroy()
    }

    companion object {
        private const val TAG = "SinuStuudium"
        private const val START_URL = "https://torg.ope.ee/"
        private const val MOBILE_SHELL_BRIDGE = "sidMobileShell"
        private const val OPEN_SETTINGS_COMMAND = "open-settings"
    }
}

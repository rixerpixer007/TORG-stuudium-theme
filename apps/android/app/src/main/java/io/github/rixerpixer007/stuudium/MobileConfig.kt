package io.github.rixerpixer007.stuudium

import android.content.Context
import org.json.JSONObject

data class AppSettings(
    val enhancementEnabled: Boolean,
    val themeId: String,
) {
    fun toJson(): JSONObject =
        JSONObject()
            .put("enhancementEnabled", enhancementEnabled)
            .put(
                "theme",
                JSONObject()
                    .put("mode", "manual")
                    .put("themeId", themeId),
            )

    companion object {
        fun fromJson(value: JSONObject?, config: MobileConfig): AppSettings {
            if (value == null) return config.defaultSettings

            val enabledValue = value.opt("enhancementEnabled")
            val enhancementEnabled =
                if (enabledValue is Boolean) enabledValue else config.defaultSettings.enhancementEnabled
            val theme = value.optJSONObject("theme")
            val themeId = theme?.optString("themeId")
            val normalizedThemeId =
                if (
                    theme?.optString("mode") == "manual" &&
                    themeId != null &&
                    config.themeIds.contains(themeId)
                ) {
                    themeId
                } else {
                    config.defaultSettings.themeId
                }

            return AppSettings(
                enhancementEnabled = enhancementEnabled,
                themeId = normalizedThemeId,
            )
        }
    }
}

data class MobileTheme(
    val id: String,
    val canvas: String,
    val accent: String,
)

class MobileConfig private constructor(
    val supportedOrigins: Set<String>,
    val defaultSettings: AppSettings,
    private val themes: Map<String, MobileTheme>,
) {
    val themeIds: Set<String> = themes.keys

    fun canvasFor(themeId: String): String =
        themes[themeId]?.canvas ?: themes[defaultSettings.themeId]?.canvas ?: "#0f1311"

    fun accentFor(themeId: String): String =
        themes[themeId]?.accent ?: themes[defaultSettings.themeId]?.accent ?: "#65d6b1"

    companion object {
        fun load(context: Context): MobileConfig {
            val source =
                context.assets.open("mobile/config.json").bufferedReader(Charsets.UTF_8).use {
                    it.readText()
                }
            val root = JSONObject(source)
            require(root.optInt("schemaVersion") == 1) { "Unsupported mobile configuration" }

            val originArray = root.getJSONArray("supportedOrigins")
            val origins = buildSet {
                for (index in 0 until originArray.length()) {
                    val origin = originArray.getString(index)
                    require(origin.startsWith("https://") && !origin.contains("*")) {
                        "Mobile origins must be exact HTTPS origins"
                    }
                    add(origin)
                }
            }
            require(origins.isNotEmpty()) { "At least one Stuudium origin is required" }
            require(SupportedOriginPolicy(origins).allowedOriginRules == origins) {
                "Mobile origins must be normalized HTTPS origins without paths or ports"
            }

            val themeArray = root.getJSONArray("themes")
            val themes = buildMap {
                for (index in 0 until themeArray.length()) {
                    val theme = themeArray.getJSONObject(index)
                    val id = theme.getString("id")
                    val preview = theme.getJSONObject("preview")
                    val canvas = preview.getString("canvas")
                    val accent = preview.getString("accent")
                    put(id, MobileTheme(id, canvas, accent))
                }
            }
            require(themes.isNotEmpty()) { "At least one theme is required" }

            val defaultSettingsJson = root.getJSONObject("defaultSettings")
            val defaultThemeId = defaultSettingsJson.getJSONObject("theme").getString("themeId")
            require(themes.containsKey(defaultThemeId)) { "The default theme is missing" }
            val defaultSettings =
                AppSettings(
                    enhancementEnabled = defaultSettingsJson.getBoolean("enhancementEnabled"),
                    themeId = defaultThemeId,
                )

            return MobileConfig(origins, defaultSettings, themes)
        }
    }
}

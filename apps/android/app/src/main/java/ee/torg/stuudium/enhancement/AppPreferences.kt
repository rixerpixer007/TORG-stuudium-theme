package ee.torg.stuudium.enhancement

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONObject

class AppPreferences(
    context: Context,
    private val config: MobileConfig,
) {
    private val preferences = context.getSharedPreferences(FILE_NAME, Context.MODE_PRIVATE)

    fun get(): AppSettings {
        val stored = preferences.getString(SETTINGS_KEY, null) ?: return config.defaultSettings
        return try {
            AppSettings.fromJson(JSONObject(stored), config)
        } catch (_: Exception) {
            config.defaultSettings
        }
    }

    fun set(settings: AppSettings) {
        val normalized = AppSettings.fromJson(settings.toJson(), config)
        preferences.edit().putString(SETTINGS_KEY, normalized.toJson().toString()).apply()
    }

    fun registerListener(listener: SharedPreferences.OnSharedPreferenceChangeListener) {
        preferences.registerOnSharedPreferenceChangeListener(listener)
    }

    fun unregisterListener(listener: SharedPreferences.OnSharedPreferenceChangeListener) {
        preferences.unregisterOnSharedPreferenceChangeListener(listener)
    }

    companion object {
        private const val FILE_NAME = "enhancement_preferences"
        const val SETTINGS_KEY = "preferences"
    }
}

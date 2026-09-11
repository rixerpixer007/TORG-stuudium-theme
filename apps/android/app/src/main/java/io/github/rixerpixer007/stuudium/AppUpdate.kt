package io.github.rixerpixer007.stuudium

import android.content.Context
import java.net.HttpURLConnection
import java.net.URI
import javax.net.ssl.HttpsURLConnection
import org.json.JSONObject

data class AppUpdate(
    val versionCode: Long,
    val versionName: String,
    val releaseUrl: String,
    val sha256: String,
)

class AppUpdatePreferences(context: Context) {
    private val preferences = context.getSharedPreferences(FILE_NAME, Context.MODE_PRIVATE)

    fun shouldCheck(nowMillis: Long): Boolean {
        val lastAttemptMillis = preferences.getLong(LAST_ATTEMPT_KEY, 0L)
        return lastAttemptMillis <= 0L ||
            nowMillis < lastAttemptMillis ||
            nowMillis - lastAttemptMillis >= CHECK_INTERVAL_MILLIS
    }

    fun recordAttempt(nowMillis: Long) {
        preferences.edit().putLong(LAST_ATTEMPT_KEY, nowMillis).apply()
    }

    companion object {
        private const val FILE_NAME = "app_update_preferences"
        private const val LAST_ATTEMPT_KEY = "last_attempt_millis"
        private const val CHECK_INTERVAL_MILLIS = 24L * 60L * 60L * 1000L
    }
}

object AppUpdateClient {
    private val manifestUri =
        URI(
            "https://raw.githubusercontent.com/rixerpixer007/TORG-stuudium-theme/main/release/android.json",
        )

    fun fetch(): AppUpdate? {
        val connection = manifestUri.toURL().openConnection() as HttpsURLConnection
        connection.connectTimeout = CONNECT_TIMEOUT_MILLIS
        connection.readTimeout = READ_TIMEOUT_MILLIS
        connection.instanceFollowRedirects = false
        connection.requestMethod = "GET"
        connection.setRequestProperty("Accept", "application/json")

        return try {
            if (connection.responseCode != HttpURLConnection.HTTP_OK) return null
            val contentLength = connection.contentLengthLong
            if (contentLength > MAX_MANIFEST_CHARS) return null

            val manifest =
                connection.inputStream.bufferedReader(Charsets.UTF_8).use { reader ->
                    val body = StringBuilder()
                    val buffer = CharArray(2048)
                    while (true) {
                        val count = reader.read(buffer)
                        if (count < 0) break
                        body.append(buffer, 0, count)
                        if (body.length > MAX_MANIFEST_CHARS) return null
                    }
                    body.toString()
                }

            parseManifest(manifest)
        } catch (_: Exception) {
            null
        } finally {
            connection.disconnect()
        }
    }

    internal fun parseManifest(rawManifest: String): AppUpdate? {
        return try {
            val manifest = JSONObject(rawManifest)
            if (!manifest.optBoolean("published", false)) return null
            createCandidate(
                schemaVersion = manifest.getInt("schemaVersion"),
                versionCode = manifest.getLong("versionCode"),
                versionName = manifest.getString("versionName"),
                releaseUrl = manifest.getString("releaseUrl"),
                sha256 = manifest.getString("sha256"),
            )
        } catch (_: Exception) {
            null
        }
    }

    internal fun createCandidate(
        schemaVersion: Int,
        versionCode: Long,
        versionName: String,
        releaseUrl: String,
        sha256: String,
    ): AppUpdate? {
        if (schemaVersion != SUPPORTED_SCHEMA_VERSION || versionCode <= 0L) return null
        if (versionName.isBlank() || versionName.length > MAX_VERSION_NAME_CHARS) return null
        if (versionName.any(Char::isISOControl)) return null
        if (!isTrustedReleaseUrl(releaseUrl)) return null
        if (!SHA_256_PATTERN.matches(sha256)) return null

        return AppUpdate(
            versionCode = versionCode,
            versionName = versionName,
            releaseUrl = releaseUrl,
            sha256 = sha256.lowercase(),
        )
    }

    internal fun isNewer(candidate: AppUpdate, installedVersionCode: Long): Boolean =
        candidate.versionCode > installedVersionCode

    internal fun isTrustedReleaseUrl(rawUrl: String): Boolean =
        try {
            val uri = URI(rawUrl)
            val expectedPrefix = "/rixerpixer007/TORG-stuudium-theme/releases"
            val path = uri.path
            uri.scheme.equals("https", ignoreCase = true) &&
                uri.host.equals("github.com", ignoreCase = true) &&
                uri.userInfo == null &&
                uri.port == -1 &&
                uri.query == null &&
                uri.fragment == null &&
                uri.normalize() == uri &&
                path.split('/').none { it == "." || it == ".." } &&
                (path == expectedPrefix || path.startsWith("$expectedPrefix/"))
        } catch (_: Exception) {
            false
        }

    private const val SUPPORTED_SCHEMA_VERSION = 1
    private const val CONNECT_TIMEOUT_MILLIS = 5_000
    private const val READ_TIMEOUT_MILLIS = 5_000
    private const val MAX_MANIFEST_CHARS = 16_384
    private const val MAX_VERSION_NAME_CHARS = 64
    private val SHA_256_PATTERN = Regex("^[0-9a-fA-F]{64}$")
}

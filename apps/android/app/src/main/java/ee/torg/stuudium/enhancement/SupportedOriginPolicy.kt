package ee.torg.stuudium.enhancement

import java.net.URI
import java.util.Locale

class SupportedOriginPolicy(origins: Set<String>) {
    val allowedOriginRules: Set<String> = origins.mapNotNull(::originOf).toSet()

    init {
        require(allowedOriginRules.isNotEmpty()) { "At least one valid HTTPS origin is required" }
    }

    fun isAllowed(url: String): Boolean = originOf(url) in allowedOriginRules

    fun isAllowedOrigin(origin: String): Boolean = originOf(origin) in allowedOriginRules

    companion object {
        private fun originOf(value: String): String? {
            return try {
                val uri = URI(value)
                if (!uri.scheme.equals("https", ignoreCase = true)) return null
                if (uri.userInfo != null || uri.host == null) return null
                if (uri.port != -1 && uri.port != 443) return null
                "https://${uri.host.lowercase(Locale.ROOT)}"
            } catch (_: Exception) {
                null
            }
        }
    }
}

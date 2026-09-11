package io.github.rixerpixer007.stuudium

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class AppUpdateClientTest {
    @Test
    fun acceptsAValidUpdateCandidate() {
        val candidate = validCandidate(versionCode = 2L)

        assertEquals(2L, candidate?.versionCode)
        assertEquals("0.1.1-beta", candidate?.versionName)
        assertTrue(AppUpdateClient.isNewer(requireNotNull(candidate), installedVersionCode = 1L))
    }

    @Test
    fun doesNotOfferTheInstalledOrAnOlderVersion() {
        val installed = requireNotNull(validCandidate(versionCode = 2L))

        assertFalse(AppUpdateClient.isNewer(installed, installedVersionCode = 2L))
        assertFalse(AppUpdateClient.isNewer(installed, installedVersionCode = 3L))
    }

    @Test
    fun rejectsUntrustedReleaseUrls() {
        val urls =
            listOf(
                "http://github.com/rixerpixer007/TORG-stuudium-theme/releases/tag/android-v1",
                "https://example.com/rixerpixer007/TORG-stuudium-theme/releases/tag/android-v1",
                "https://github.com/other/TORG-stuudium-theme/releases/tag/android-v1",
                "https://github.com/rixerpixer007/TORG-stuudium-theme/issues",
                "https://github.com/rixerpixer007/TORG-stuudium-theme/releases/../issues",
                "https://github.com/rixerpixer007/TORG-stuudium-theme/releases/%2e%2e/issues",
                "https://github.com@evil.example/rixerpixer007/TORG-stuudium-theme/releases",
            )

        urls.forEach { url -> assertFalse(url, AppUpdateClient.isTrustedReleaseUrl(url)) }
    }

    @Test
    fun rejectsInvalidManifestValues() {
        assertNull(validCandidate(schemaVersion = 2))
        assertNull(validCandidate(versionCode = 0L))
        assertNull(validCandidate(versionName = ""))
        assertNull(validCandidate(versionName = "bad\nname"))
        assertNull(validCandidate(sha256 = "not-a-checksum"))
    }

    private fun validCandidate(
        schemaVersion: Int = 1,
        versionCode: Long = 2L,
        versionName: String = "0.1.1-beta",
        releaseUrl: String =
            "https://github.com/rixerpixer007/TORG-stuudium-theme/releases/tag/android-v0.1.1-beta",
        sha256: String = "a".repeat(64),
    ): AppUpdate? =
        AppUpdateClient.createCandidate(
            schemaVersion = schemaVersion,
            versionCode = versionCode,
            versionName = versionName,
            releaseUrl = releaseUrl,
            sha256 = sha256,
        )
}

package io.github.rixerpixer007.stuudium

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SupportedOriginPolicyTest {
    private val policy = SupportedOriginPolicy(setOf("https://torg.ope.ee"))

    @Test
    fun acceptsOnlyTheConfiguredHttpsOrigin() {
        assertTrue(policy.isAllowed("https://torg.ope.ee/"))
        assertTrue(policy.isAllowed("https://torg.ope.ee/s/520?tab=1"))
        assertFalse(policy.isAllowed("http://torg.ope.ee/"))
        assertFalse(policy.isAllowed("https://other.ope.ee/"))
        assertFalse(policy.isAllowed("https://torg.ope.ee.example.com/"))
        assertFalse(policy.isAllowed("https://user@torg.ope.ee/"))
        assertFalse(policy.isAllowed("https://torg.ope.ee:444/"))
    }
}

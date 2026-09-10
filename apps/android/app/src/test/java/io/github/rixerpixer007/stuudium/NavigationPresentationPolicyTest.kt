package io.github.rixerpixer007.stuudium

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class NavigationPresentationPolicyTest {
    @Test
    fun coversOnlyNavigationsBeforeTheFirstVisibleCommit() {
        val policy = NavigationPresentationPolicy()

        assertTrue(policy.shouldShowLaunchCover())

        policy.recordVisibleCommit()

        assertFalse(policy.shouldShowLaunchCover())
        assertFalse(policy.shouldShowLaunchCover())
    }
}

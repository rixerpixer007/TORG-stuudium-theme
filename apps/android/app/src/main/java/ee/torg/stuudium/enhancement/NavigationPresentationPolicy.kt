package ee.torg.stuudium.enhancement

/** Keeps the native launch cover limited to the period before first visible web content. */
internal class NavigationPresentationPolicy {
    private var hasPresentedWebContent = false

    fun shouldShowLaunchCover(): Boolean = !hasPresentedWebContent

    fun recordVisibleCommit() {
        hasPresentedWebContent = true
    }
}

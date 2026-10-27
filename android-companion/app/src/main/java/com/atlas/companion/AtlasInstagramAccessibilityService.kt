package com.atlas.companion

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent

/** Initial limited scaffold: no message reading, UI clicks, or sending. */
class AtlasInstagramAccessibilityService : AccessibilityService() {
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // No content collection or automatic actions in this initial version.
    }

    override fun onInterrupt() {
        // Nothing to interrupt in the initial version.
    }
}

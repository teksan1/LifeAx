package com.lifeax.ai

import android.content.Context
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking

class AIHelper(private val context: Context) {

    private val store = ObservationStore(context)

    // Example: simple function to evaluate behavior
    fun shouldSendAlert(): Boolean = runBlocking {
        val obsJson = store.observationsFlow.first()
        // Placeholder: parse JSON and determine if risky behavior detected
        // TODO: Replace with real ML / rule-based logic
        obsJson.contains("risky")
    }

    // Placeholder: decide personalized advice
    fun suggestNextAction(): String = runBlocking {
        val obsJson = store.observationsFlow.first()
        if (obsJson.contains("mood\":\"low")) {
            "Take a short walk and hydrate."
        } else {
            "Keep up the good routine!"
        }
    }
}

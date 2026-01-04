package com.lifeax.ai

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

val Context.observationStore by preferencesDataStore(name = "observation_store")

data class Observation(
    val timestamp: Long,
    val type: String,
    val value: String
)

class ObservationStore(private val context: Context) {

    private val OBSERVATIONS_KEY = stringPreferencesKey("observations_json")

    val observationsFlow: Flow<String> = context.observationStore.data.map { it[OBSERVATIONS_KEY] ?: "[]" }

    suspend fun addObservation(obs: Observation) {
        withContext(Dispatchers.IO) {
            val current = context.observationStore.data.map { it[OBSERVATIONS_KEY] ?: "[]" }.collectAsState(initial = "[]").value
            val updated = current.dropLast(1) + ",{\"timestamp\":${obs.timestamp},\"type\":\"${obs.type}\",\"value\":\"${obs.value}\"}]"
            context.observationStore.edit { it[OBSERVATIONS_KEY] = updated }
        }
    }
}

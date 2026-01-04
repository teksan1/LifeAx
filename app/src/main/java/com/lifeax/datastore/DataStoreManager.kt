package com.lifeax.datastore

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore by preferencesDataStore(name = "lifeax_prefs")

class DataStoreManager(private val context: Context) {

    private val MOOD_KEY = stringPreferencesKey("mood")
    private val FOCUS_KEY = stringPreferencesKey("focus")
    private val GENDER_KEY = stringPreferencesKey("gender")
    private val VOICE_KEY = stringPreferencesKey("voice")

    val moodFlow: Flow<String> = context.dataStore.data.map { it[MOOD_KEY] ?: "" }
    val focusFlow: Flow<String> = context.dataStore.data.map { it[FOCUS_KEY] ?: "" }
    val genderFlow: Flow<String> = context.dataStore.data.map { it[GENDER_KEY] ?: "Male" }
    val voiceFlow: Flow<String> = context.dataStore.data.map { it[VOICE_KEY] ?: "Default" }

    suspend fun saveMood(mood: String) {
        context.dataStore.edit { it[MOOD_KEY] = mood }
    }

    suspend fun saveFocus(focus: String) {
        context.dataStore.edit { it[FOCUS_KEY] = focus }
    }

    suspend fun saveGender(gender: String) {
        context.dataStore.edit { it[GENDER_KEY] = gender }
    }

    suspend fun saveVoice(voice: String) {
        context.dataStore.edit { it[VOICE_KEY] = voice }
    }
}

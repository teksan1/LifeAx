package com.lifeax

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.compose.*
import com.lifeax.datastore.DataStoreManager
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val dataStoreManager = DataStoreManager(applicationContext)
        setContent {
val aiHelper = AIHelper(applicationContext)
            LifeAxApp(dataStoreManager)
        }
    }
}

@Composable
fun LifeAxApp(dataStoreManager: DataStoreManager) {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = "main") {
        composable("main") { MainScreen(navController) }
        composable("voice") { VoicePersonalityScreen(navController, dataStoreManager) }
        composable("checkin") { DailyCheckInScreen(navController, dataStoreManager) }
        composable("journal") { JournalSummaryScreen(navController, dataStoreManager) }
    }
}

@Composable
fun VoicePersonalityScreen(navController: NavHostController, dataStoreManager: DataStoreManager) {
    val scope = rememberCoroutineScope()
    var selectedGender by remember { mutableStateOf("Male") }
    var selectedVoice by remember { mutableStateOf("Default") }

    LaunchedEffect(Unit) {
        dataStoreManager.genderFlow.collect { selectedGender = it }
        dataStoreManager.voiceFlow.collect { selectedVoice = it }
    }

    MaterialTheme {
        Surface(modifier = Modifier.fillMaxSize().padding(16.dp)) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Select AI Voice & Personality", fontSize = 24.sp, modifier = Modifier.padding(16.dp))
                Spacer(modifier = Modifier.height(10.dp))
                Row { 
                    Button(onClick = { selectedGender="Male"; scope.launch { dataStoreManager.saveGender("Male") } }) { Text("Male") }
                    Spacer(modifier = Modifier.width(10.dp))
                    Button(onClick = { selectedGender="Female"; scope.launch { dataStoreManager.saveGender("Female") } }) { Text("Female") }
                }
                Spacer(modifier = Modifier.height(10.dp))
                Text("Selected Gender: $selectedGender", fontSize = 18.sp)
                Spacer(modifier = Modifier.height(20.dp))
                Button(onClick = { navController.navigate("main") }) { Text("Back to Home") }
            }
        }
    }
}

@Composable
fun DailyCheckInScreen(navController: NavHostController, dataStoreManager: DataStoreManager) {
    val scope = rememberCoroutineScope()
    var mood by remember { mutableStateOf("") }
    var focus by remember { mutableStateOf("") }

    LaunchedEffect(Unit) {
        dataStoreManager.moodFlow.collect { mood = it }
        dataStoreManager.focusFlow.collect { focus = it }
    }

    MaterialTheme {
        Surface(modifier = Modifier.fillMaxSize().padding(16.dp)) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Daily Check-in", fontSize = 24.sp, modifier = Modifier.padding(16.dp))
                OutlinedTextField(value = mood, onValueChange = { mood=it }, label={ Text("How are you feeling?") })
                Spacer(modifier = Modifier.height(10.dp))
                OutlinedTextField(value = focus, onValueChange = { focus=it }, label={ Text("Focus today") })
                Spacer(modifier = Modifier.height(20.dp))
                Button(onClick = { 
                    scope.launch { 
                        dataStoreManager.saveMood(mood)
                        dataStoreManager.saveFocus(focus)
                    }
                    navController.navigate("main") 
                }) { Text("Submit & Back") }
            }
        }
    }
}

@Composable
fun JournalSummaryScreen(navController: NavHostController, dataStoreManager: DataStoreManager) {
    var mood by remember { mutableStateOf("") }
    var focus by remember { mutableStateOf("") }

    LaunchedEffect(Unit) {
        dataStoreManager.moodFlow.collect { mood = it }
        dataStoreManager.focusFlow.collect { focus = it }
    }

    MaterialTheme {
        Surface(modifier = Modifier.fillMaxSize().padding(16.dp)) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Weekly Journal Summary", fontSize = 24.sp, modifier = Modifier.padding(16.dp))
                Text("Mood: $mood", fontSize=18.sp)
                Text("Focus: $focus", fontSize=18.sp)
                Spacer(modifier = Modifier.height(20.dp))
                Button(onClick = { navController.navigate("main") }) { Text("Back to Home") }
            }
        }
    }
}

@Composable
fun MainScreen(navController: NavHostController) {
    MaterialTheme {
        Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
            Column(
                modifier = Modifier.fillMaxSize().padding(16.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("Welcome to LifeAx!", fontSize = 28.sp, modifier = Modifier.padding(16.dp))
                Spacer(modifier = Modifier.height(20.dp))
                Button(onClick = { navController.navigate("voice") }) { Text("Voice & Personality") }
                Spacer(modifier = Modifier.height(10.dp))
                Button(onClick = { navController.navigate("checkin") }) { Text("Daily Check-in") }
                Spacer(modifier = Modifier.height(10.dp))
                Button(onClick = { navController.navigate("journal") }) { Text("Journal Summary") }
            }
        }
    }
}

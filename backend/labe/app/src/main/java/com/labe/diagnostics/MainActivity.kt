package com.labe.diagnostics

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.labe.diagnostics.navigation.AuraLabNavHost
import com.labe.diagnostics.ui.theme.AuraLabTheme
import com.labe.diagnostics.ui.theme.Canvas

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AuraLabTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Canvas
                ) {
                    AuraLabNavHost()
                }
            }
        }
    }
}

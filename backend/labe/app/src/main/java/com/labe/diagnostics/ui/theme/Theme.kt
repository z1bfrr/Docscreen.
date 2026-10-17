package com.labe.diagnostics.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val AuraLabLightColorScheme = lightColorScheme(
    primary            = Sapphire,
    onPrimary          = White,
    primaryContainer   = SapphireLight,
    onPrimaryContainer = Sapphire,

    secondary          = CyanTeal,
    onSecondary        = White,
    secondaryContainer = CyanLight,
    onSecondaryContainer = Color(0xFF0E7490),

    tertiary           = Emerald,
    onTertiary         = White,
    tertiaryContainer  = EmeraldLight,
    onTertiaryContainer = EmeraldDark,

    error              = AlertRed,
    onError            = White,
    errorContainer     = AlertRedLight,
    onErrorContainer   = AlertRedDark,

    background         = Canvas,
    onBackground       = DeepSlate,

    surface            = White,
    onSurface          = DeepSlate,
    surfaceVariant     = SurfaceVariant,
    onSurfaceVariant   = Slate700,

    outline            = Slate300,
    outlineVariant     = OutlineVariant,

    inverseSurface     = DeepSlate,
    inverseOnSurface   = White,
    inversePrimary     = SapphireMid,
)

@Composable
fun AuraLabTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = AuraLabLightColorScheme  // Always light — premium clinical aesthetic

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = Canvas.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = true
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography  = AuraLabTypography,
        content     = content
    )
}

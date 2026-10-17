package com.labe.diagnostics.navigation

import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Science
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Science
import androidx.compose.material.icons.outlined.Receipt
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.labe.diagnostics.ui.booking.BookingScreen
import com.labe.diagnostics.ui.compare.CompareLabsScreen
import com.labe.diagnostics.ui.home.HomeScreen
import com.labe.diagnostics.ui.profile.ProfileScreen
import com.labe.diagnostics.ui.search.SearchScreen
import com.labe.diagnostics.ui.tracking.TrackingScreen

sealed class Screen(val route: String) {
    object Home    : Screen("home")
    object Search  : Screen("search?query={query}&category={category}") {
        fun withArgs(query: String = "", category: String = "") =
            "search?query=$query&category=$category"
    }
    object Compare : Screen("compare/{testId}") {
        fun withTest(testId: String) = "compare/$testId"
    }
    object Booking : Screen("booking/{testId}/{labId}") {
        fun withArgs(testId: String, labId: String) = "booking/$testId/$labId"
    }
    object Tracking : Screen("tracking/{orderId}") {
        fun withOrder(orderId: String) = "tracking/$orderId"
    }
    object Profile : Screen("profile")
}

data class BottomNavItem(
    val label: String,
    val route: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
)

val bottomNavItems = listOf(
    BottomNavItem("Home",    Screen.Home.route,    Icons.Filled.Home,    Icons.Outlined.Home),
    BottomNavItem("Tests",   Screen.Search.withArgs(), Icons.Filled.Science,  Icons.Outlined.Science),
    BottomNavItem("Orders",  Screen.Tracking.withOrder("ORD-2024-001"), Icons.Filled.Receipt,  Icons.Outlined.Receipt),
    BottomNavItem("Profile", Screen.Profile.route, Icons.Filled.Person,  Icons.Outlined.Person),
)

@Composable
fun AuraLabNavHost() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    // Routes that show bottom nav
    val bottomNavRoutes = setOf(
        Screen.Home.route,
        "search?query={query}&category={category}",
        Screen.Profile.route
    )
    val showBottomBar = currentRoute in bottomNavRoutes

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    containerColor = MaterialTheme.colorScheme.surface,
                    tonalElevation = androidx.compose.ui.unit.Dp(0f)
                ) {
                    bottomNavItems.forEach { item ->
                        val isSelected = when (item.route) {
                            Screen.Home.route -> currentRoute == Screen.Home.route
                            Screen.Search.withArgs() -> currentRoute == "search?query={query}&category={category}"
                            Screen.Profile.route -> currentRoute == Screen.Profile.route
                            else -> false
                        }
                        NavigationBarItem(
                            selected = isSelected,
                            onClick = {
                                val targetRoute = when (item.label) {
                                    "Home"    -> Screen.Home.route
                                    "Tests"   -> Screen.Search.withArgs()
                                    "Profile" -> Screen.Profile.route
                                    else      -> Screen.Home.route
                                }
                                if (item.label == "Orders") {
                                    navController.navigate(Screen.Tracking.withOrder("ORD-2024-001"))
                                } else {
                                    navController.navigate(targetRoute) {
                                        popUpTo(navController.graph.findStartDestination().id) {
                                            saveState = true
                                        }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            },
                            icon = {
                                Icon(
                                    imageVector = if (isSelected) item.selectedIcon else item.unselectedIcon,
                                    contentDescription = item.label
                                )
                            },
                            label = { Text(item.label, style = MaterialTheme.typography.labelSmall) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = MaterialTheme.colorScheme.primary,
                                selectedTextColor = MaterialTheme.colorScheme.primary,
                                indicatorColor = MaterialTheme.colorScheme.primaryContainer
                            )
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(innerPadding),
            enterTransition = {
                fadeIn(animationSpec = tween(220)) +
                slideIntoContainer(AnimatedContentTransitionScope.SlideDirection.Start, tween(220))
            },
            exitTransition = {
                fadeOut(animationSpec = tween(180)) +
                slideOutOfContainer(AnimatedContentTransitionScope.SlideDirection.Start, tween(180))
            },
            popEnterTransition = {
                fadeIn(animationSpec = tween(220)) +
                slideIntoContainer(AnimatedContentTransitionScope.SlideDirection.End, tween(220))
            },
            popExitTransition = {
                fadeOut(animationSpec = tween(180)) +
                slideOutOfContainer(AnimatedContentTransitionScope.SlideDirection.End, tween(180))
            }
        ) {
            composable(Screen.Home.route) {
                HomeScreen(
                    onSearchClick = { navController.navigate(Screen.Search.withArgs()) },
                    onCategoryClick = { categoryId ->
                        navController.navigate(Screen.Search.withArgs(category = categoryId))
                    },
                    onTestClick = { testId ->
                        navController.navigate(Screen.Compare.withTest(testId))
                    },
                    onViewOrderClick = {
                        navController.navigate(Screen.Tracking.withOrder("ORD-2024-001"))
                    }
                )
            }

            composable(
                route = "search?query={query}&category={category}",
                arguments = listOf(
                    navArgument("query") { defaultValue = ""; type = NavType.StringType },
                    navArgument("category") { defaultValue = ""; type = NavType.StringType }
                )
            ) { backStackEntry ->
                SearchScreen(
                    initialQuery = backStackEntry.arguments?.getString("query") ?: "",
                    initialCategory = backStackEntry.arguments?.getString("category") ?: "",
                    onTestClick = { testId ->
                        navController.navigate(Screen.Compare.withTest(testId))
                    },
                    onBack = { navController.popBackStack() }
                )
            }

            composable(
                route = Screen.Compare.route,
                arguments = listOf(navArgument("testId") { type = NavType.StringType })
            ) { backStackEntry ->
                CompareLabsScreen(
                    testId = backStackEntry.arguments?.getString("testId") ?: "",
                    onBookClick = { testId, labId ->
                        navController.navigate(Screen.Booking.withArgs(testId, labId))
                    },
                    onBack = { navController.popBackStack() }
                )
            }

            composable(
                route = Screen.Booking.route,
                arguments = listOf(
                    navArgument("testId") { type = NavType.StringType },
                    navArgument("labId") { type = NavType.StringType }
                )
            ) { backStackEntry ->
                BookingScreen(
                    testId = backStackEntry.arguments?.getString("testId") ?: "",
                    labId  = backStackEntry.arguments?.getString("labId") ?: "",
                    onBookingConfirmed = { orderId ->
                        navController.navigate(Screen.Tracking.withOrder(orderId)) {
                            popUpTo(Screen.Home.route)
                        }
                    },
                    onBack = { navController.popBackStack() }
                )
            }

            composable(
                route = Screen.Tracking.route,
                arguments = listOf(navArgument("orderId") { type = NavType.StringType })
            ) { backStackEntry ->
                TrackingScreen(
                    orderId = backStackEntry.arguments?.getString("orderId") ?: "",
                    onBack  = { navController.popBackStack() }
                )
            }

            composable(Screen.Profile.route) {
                ProfileScreen(
                    onOrderClick = { orderId ->
                        navController.navigate(Screen.Tracking.withOrder(orderId))
                    }
                )
            }
        }
    }
}

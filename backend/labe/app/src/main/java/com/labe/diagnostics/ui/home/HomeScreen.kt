package com.labe.diagnostics.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.labe.diagnostics.data.MockRepository
import com.labe.diagnostics.data.models.DiagnosticTest
import com.labe.diagnostics.data.models.HealthPackage
import com.labe.diagnostics.data.models.TestCategory
import com.labe.diagnostics.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onSearchClick: () -> Unit,
    onCategoryClick: (String) -> Unit,
    onTestClick: (String) -> Unit,
    onViewOrderClick: () -> Unit
) {
    val activeOrder = MockRepository.mockOrders.firstOrNull()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Canvas),
        contentPadding = PaddingValues(bottom = 24.dp)
    ) {
        // ── Header / Hero ──────────────────────────────────────────────────────
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.verticalGradient(
                            listOf(Color(0xFF1E3A8A), Sapphire, Color(0xFF2563EB))
                        )
                    )
                    .padding(horizontal = 20.dp)
                    .padding(top = 52.dp, bottom = 28.dp)
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                "Good Morning 👋",
                                color = Color.White.copy(alpha = 0.8f),
                                style = MaterialTheme.typography.bodyMedium
                            )
                            Text(
                                "Mukesh",
                                color = Color.White,
                                style = MaterialTheme.typography.headlineMedium
                            )
                        }
                        // Location chip
                        Surface(
                            shape = CircleShape,
                            color = Color.White.copy(alpha = 0.2f)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Icon(
                                    Icons.Filled.LocationOn,
                                    contentDescription = null,
                                    tint = Color.White,
                                    modifier = Modifier.size(14.dp)
                                )
                                Text("Madurai", color = Color.White, style = MaterialTheme.typography.labelMedium)
                            }
                        }
                    }
                    Spacer(Modifier.height(20.dp))
                    // Search Bar
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSearchClick() },
                        shape = RoundedCornerShape(16.dp),
                        color = Color.White,
                        shadowElevation = 4.dp
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 14.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Icon(Icons.Filled.Search, contentDescription = null, tint = Sapphire)
                            Text(
                                "Search tests, packages, labs...",
                                color = Slate500,
                                style = MaterialTheme.typography.bodyMedium
                            )
                            Spacer(Modifier.weight(1f))
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = SapphireLight
                            ) {
                                Text(
                                    "Search",
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                                    color = Sapphire,
                                    style = MaterialTheme.typography.labelMedium
                                )
                            }
                        }
                    }
                }
            }
        }

        // ── Active Order Banner ────────────────────────────────────────────────
        if (activeOrder != null) {
            item {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .padding(top = 16.dp)
                        .clickable { onViewOrderClick() },
                    shape = RoundedCornerShape(16.dp),
                    color = Color(0xFFECFDF5),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Emerald.copy(alpha = 0.3f))
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(Emerald.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Filled.Science, contentDescription = null, tint = Emerald, modifier = Modifier.size(20.dp))
                        }
                        Column(Modifier.weight(1f)) {
                            Text("Sample Collected ✓", style = MaterialTheme.typography.titleSmall, color = EmeraldDark)
                            Text("Order #${activeOrder.id} • Processing at lab", style = MaterialTheme.typography.bodySmall, color = Slate700)
                        }
                        Icon(Icons.Filled.ChevronRight, contentDescription = null, tint = EmeraldDark)
                    }
                }
            }
        }

        // ── Test Categories ────────────────────────────────────────────────────
        item {
            SectionHeader("Browse by Category", onSeeAll = { onCategoryClick("all") })
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(MockRepository.categories) { cat ->
                    CategoryChip(category = cat, onClick = { onCategoryClick(cat.id) })
                }
            }
        }

        // ── Health Packages ────────────────────────────────────────────────────
        item {
            SectionHeader("Health Packages", subtitle = "Up to 65% off")
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(MockRepository.healthPackages) { pkg ->
                    PackageCard(pkg = pkg, onClick = { onTestClick(pkg.testsIncluded.first()) })
                }
            }
        }

        // ── Popular Tests ──────────────────────────────────────────────────────
        item {
            SectionHeader("Popular Tests", subtitle = "Most booked in Madurai")
        }
        items(MockRepository.getPopularTests()) { test ->
            PopularTestRow(test = test, onClick = { onTestClick(test.id) })
        }

        // ── Why AuraLab ───────────────────────────────────────────────────────
        item {
            WhyAuraLabSection()
        }
    }
}

@Composable
private fun SectionHeader(title: String, subtitle: String? = null, onSeeAll: (() -> Unit)? = null) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .padding(top = 24.dp, bottom = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.Bottom
    ) {
        Column {
            Text(title, style = MaterialTheme.typography.titleLarge, color = DeepSlate)
            if (subtitle != null) {
                Text(subtitle, style = MaterialTheme.typography.bodySmall, color = Slate500)
            }
        }
        if (onSeeAll != null) {
            TextButton(onClick = onSeeAll, contentPadding = PaddingValues(0.dp)) {
                Text("See all", style = MaterialTheme.typography.labelMedium, color = Sapphire)
            }
        }
    }
}

@Composable
private fun CategoryChip(category: TestCategory, onClick: () -> Unit) {
    val bgColor = Color(category.color).copy(alpha = 0.12f)
    val iconColor = Color(category.color)

    Surface(
        onClick = onClick,
        shape = RoundedCornerShape(16.dp),
        color = bgColor,
        modifier = Modifier.width(80.dp)
    ) {
        Column(
            modifier = Modifier.padding(vertical = 12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(iconColor.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = getCategoryIcon(category.id),
                    contentDescription = category.name,
                    tint = iconColor,
                    modifier = Modifier.size(18.dp)
                )
            }
            Text(
                category.name,
                style = MaterialTheme.typography.labelSmall,
                color = DeepSlate,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                fontSize = 10.sp
            )
        }
    }
}

@Composable
private fun PackageCard(pkg: HealthPackage, onClick: () -> Unit) {
    Surface(
        onClick = onClick,
        modifier = Modifier.width(220.dp),
        shape = RoundedCornerShape(20.dp),
        color = White,
        shadowElevation = 2.dp,
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate300.copy(alpha = 0.5f))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            if (pkg.isBestseller) {
                Surface(
                    shape = CircleShape,
                    color = AmberWarning.copy(alpha = 0.15f)
                ) {
                    Text(
                        "⭐ Bestseller",
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = Color(0xFF92400E)
                    )
                }
                Spacer(Modifier.height(8.dp))
            }
            Text(pkg.name, style = MaterialTheme.typography.titleSmall, color = DeepSlate, maxLines = 2)
            Spacer(Modifier.height(4.dp))
            Text(pkg.description, style = MaterialTheme.typography.bodySmall, color = Slate500, maxLines = 2)
            Spacer(Modifier.height(10.dp))
            Text(
                "${pkg.testsIncluded.size} tests included",
                style = MaterialTheme.typography.labelSmall,
                color = CyanTeal
            )
            Spacer(Modifier.height(10.dp))
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    "₹${pkg.discountedPrice}",
                    style = MaterialTheme.typography.titleMedium,
                    color = Sapphire,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    "₹${pkg.originalPrice}",
                    style = MaterialTheme.typography.bodySmall,
                    color = Slate500,
                    textDecoration = androidx.compose.ui.text.style.TextDecoration.LineThrough
                )
                Spacer(Modifier.weight(1f))
                Surface(shape = CircleShape, color = Emerald.copy(alpha = 0.1f)) {
                    Text(
                        "${pkg.discountPercent}% off",
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = EmeraldDark
                    )
                }
            }
        }
    }
}

@Composable
private fun PopularTestRow(test: DiagnosticTest, onClick: () -> Unit) {
    Surface(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp),
        shape = RoundedCornerShape(16.dp),
        color = White,
        shadowElevation = 1.dp,
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate300.copy(alpha = 0.4f))
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color(test.category.color).copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    getCategoryIcon(test.category.id),
                    contentDescription = null,
                    tint = Color(test.category.color),
                    modifier = Modifier.size(22.dp)
                )
            }
            Column(Modifier.weight(1f)) {
                Text(test.name, style = MaterialTheme.typography.titleSmall, color = DeepSlate, maxLines = 1)
                Text(
                    "${test.sampleType} • ${test.turnaroundTime} • ${test.parameters.size} parameters",
                    style = MaterialTheme.typography.bodySmall,
                    color = Slate500
                )
            }
            Column(horizontalAlignment = Alignment.End) {
                val minPrice = MockRepository.labPartners
                    .mapNotNull { lab -> MockRepository.getPriceForTestInLab(test.id, lab.id) }
                    .minOrNull()
                Text(
                    if (minPrice != null) "from ₹$minPrice" else "View price",
                    style = MaterialTheme.typography.labelMedium,
                    color = Sapphire
                )
                Icon(Icons.Filled.ChevronRight, contentDescription = null, tint = Slate300, modifier = Modifier.size(16.dp))
            }
        }
    }
}

@Composable
private fun WhyAuraLabSection() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
            .padding(top = 8.dp)
    ) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = SapphireLight,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Text("Why AuraLab?", style = MaterialTheme.typography.headlineSmall, color = Sapphire)
                listOf(
                    Triple(Icons.Filled.Verified, "NABL Certified Labs", "All partner labs verified & accredited"),
                    Triple(Icons.Filled.Home, "Free Home Collection", "Phlebotomist at your doorstep in 60 min"),
                    Triple(Icons.Filled.Timer, "Reports in 6–24 Hours", "Digital reports on WhatsApp & app"),
                    Triple(Icons.Filled.LocalOffer, "Lowest Price Guarantee", "Up to 65% off market rates")
                ).forEach { (icon, title, subtitle) ->
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(Sapphire.copy(alpha = 0.1f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(icon, contentDescription = null, tint = Sapphire, modifier = Modifier.size(18.dp))
                        }
                        Column {
                            Text(title, style = MaterialTheme.typography.labelLarge, color = DeepSlate)
                            Text(subtitle, style = MaterialTheme.typography.bodySmall, color = Slate700)
                        }
                    }
                }
            }
        }
    }
}

private fun getCategoryIcon(categoryId: String): ImageVector = when (categoryId) {
    "blood"     -> Icons.Filled.Bloodtype
    "urine"     -> Icons.Filled.Science
    "xray"      -> Icons.Filled.MedicalServices
    "mri"       -> Icons.Filled.MonitorHeart
    "ct"        -> Icons.Filled.Computer
    "ecg"       -> Icons.Filled.FavoriteBorder
    "ultrasound"-> Icons.Filled.WaterDrop
    "thyroid"   -> Icons.Filled.Biotech
    "diabetes"  -> Icons.Filled.LocalHospital
    "vitamin"   -> Icons.Filled.NaturePeople
    "hormone"   -> Icons.Filled.Psychology
    "covid"     -> Icons.Filled.HealthAndSafety
    else        -> Icons.Filled.Science
}

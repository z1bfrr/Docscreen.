package com.labe.diagnostics.ui.compare

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.labe.diagnostics.data.MockRepository
import com.labe.diagnostics.data.models.LabPartner
import com.labe.diagnostics.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CompareLabsScreen(
    testId: String,
    onBookClick: (testId: String, labId: String) -> Unit,
    onBack: () -> Unit
) {
    val test = MockRepository.getTestById(testId)
    val labs = MockRepository.getLabsForTest(testId)
        .sortedBy { MockRepository.getPriceForTestInLab(testId, it.id) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Canvas)
    ) {
        // ── Top App Bar ────────────────────────────────────────────────────────
        TopAppBar(
            title = {
                Column {
                    Text(
                        test?.shortName ?: "Compare Labs",
                        style = MaterialTheme.typography.titleLarge,
                        color = DeepSlate
                    )
                    Text(
                        "${labs.size} labs available in Madurai",
                        style = MaterialTheme.typography.bodySmall,
                        color = Slate500
                    )
                }
            },
            navigationIcon = {
                IconButton(onClick = onBack) {
                    Icon(Icons.Filled.ArrowBack, contentDescription = "Back", tint = DeepSlate)
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(containerColor = White)
        )

        if (test == null) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("Test not found", color = Slate500)
            }
            return
        }

        LazyColumn(contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {

            // ── Test Info Card ─────────────────────────────────────────────────
            item {
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = SapphireLight,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(modifier = Modifier.padding(16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Box(
                            modifier = Modifier.size(52.dp).clip(RoundedCornerShape(14.dp)).background(Sapphire.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Filled.Science, null, tint = Sapphire, modifier = Modifier.size(26.dp))
                        }
                        Column(Modifier.weight(1f)) {
                            Text(test.name, style = MaterialTheme.typography.titleMedium, color = DeepSlate)
                            Spacer(Modifier.height(4.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                TestInfoChip(Icons.Filled.AccessTime, test.turnaroundTime)
                                TestInfoChip(Icons.Filled.Bloodtype, test.sampleType)
                            }
                            Spacer(Modifier.height(6.dp))
                            Text(
                                "Preparation: ${test.preparationInstructions}",
                                style = MaterialTheme.typography.bodySmall,
                                color = Slate700
                            )
                        }
                    }
                }
            }

            // ── Sorted label ─────────────────────────────────────────────────
            item {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Icon(Icons.Filled.Sort, null, tint = Slate500, modifier = Modifier.size(16.dp))
                    Text("Sorted by lowest price", style = MaterialTheme.typography.bodySmall, color = Slate500)
                }
            }

            // ── Lab Cards ─────────────────────────────────────────────────────
            items(labs) { lab ->
                val price = MockRepository.getPriceForTestInLab(testId, lab.id)
                val testEntry = lab.tests.find { it.testId == testId }
                val originalPrice = testEntry?.price
                LabCompareCard(
                    lab = lab,
                    finalPrice = price,
                    originalPrice = originalPrice,
                    onBook = { onBookClick(testId, lab.id) }
                )
            }

            item { Spacer(Modifier.height(16.dp)) }
        }
    }
}

@Composable
private fun LabCompareCard(
    lab: LabPartner,
    finalPrice: Int?,
    originalPrice: Int?,
    onBook: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(20.dp),
        color = White,
        shadowElevation = 2.dp,
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate300.copy(alpha = 0.4f)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header row
            Row(
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(Modifier.weight(1f)) {
                    Text(lab.name, style = MaterialTheme.typography.titleSmall, color = DeepSlate, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(2.dp))
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        Icon(Icons.Filled.LocationOn, null, tint = Slate500, modifier = Modifier.size(13.dp))
                        Text(lab.distance, style = MaterialTheme.typography.bodySmall, color = Slate500)
                        Text("•", color = Slate500, style = MaterialTheme.typography.bodySmall)
                        Text(lab.address.take(30) + "…", style = MaterialTheme.typography.bodySmall, color = Slate500)
                    }
                }
                // Rating
                Surface(shape = RoundedCornerShape(8.dp), color = Emerald.copy(alpha = 0.12f)) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(3.dp)
                    ) {
                        Icon(Icons.Filled.Star, null, tint = Color(0xFFF59E0B), modifier = Modifier.size(13.dp))
                        Text(lab.rating.toString(), style = MaterialTheme.typography.labelSmall, color = EmeraldDark, fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(Modifier.height(10.dp))

            // Badges row
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                if (lab.isNablCertified) CertBadge("NABL", Emerald)
                if (lab.isCapCertified) CertBadge("CAP", Sapphire)
                Surface(shape = CircleShape, color = Slate100) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(3.dp)
                    ) {
                        Icon(Icons.Filled.AccessTime, null, tint = Slate700, modifier = Modifier.size(11.dp))
                        Text(lab.operatingHours, style = MaterialTheme.typography.labelSmall, color = Slate700)
                    }
                }
                if (lab.homeCollectionCharge == 0) {
                    Surface(shape = CircleShape, color = CyanTeal.copy(alpha = 0.1f)) {
                        Text(
                            "Free Home Collection",
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                            style = MaterialTheme.typography.labelSmall,
                            color = Color(0xFF0E7490)
                        )
                    }
                } else {
                    Surface(shape = CircleShape, color = AmberLight) {
                        Text(
                            "Home: ₹${lab.homeCollectionCharge}",
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                            style = MaterialTheme.typography.labelSmall,
                            color = Color(0xFF92400E)
                        )
                    }
                }
            }

            Spacer(Modifier.height(12.dp))
            HorizontalDivider(color = Slate300.copy(alpha = 0.3f))
            Spacer(Modifier.height(12.dp))

            // Price + Book button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    if (finalPrice != null) {
                        Text(
                            "₹$finalPrice",
                            style = MaterialTheme.typography.headlineMedium,
                            color = Sapphire,
                            fontWeight = FontWeight.ExtraBold
                        )
                        if (originalPrice != null && originalPrice > finalPrice) {
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    "₹$originalPrice",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = Slate500,
                                    textDecoration = androidx.compose.ui.text.style.TextDecoration.LineThrough
                                )
                                val savings = originalPrice - finalPrice
                                Text("Save ₹$savings", style = MaterialTheme.typography.labelSmall, color = EmeraldDark)
                            }
                        }
                    }
                    Text("${lab.reviewCount.toLocaleString()} reviews", style = MaterialTheme.typography.bodySmall, color = Slate500)
                }
                Button(
                    onClick = onBook,
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Sapphire)
                ) {
                    Text("Book Now", style = MaterialTheme.typography.labelLarge)
                }
            }
        }
    }
}

@Composable
private fun CertBadge(label: String, color: Color) {
    Surface(shape = CircleShape, color = color.copy(alpha = 0.12f)) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(3.dp)
        ) {
            Icon(Icons.Filled.Verified, null, tint = color, modifier = Modifier.size(11.dp))
            Text(label, style = MaterialTheme.typography.labelSmall, color = color, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun TestInfoChip(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
        Icon(icon, null, tint = Sapphire, modifier = Modifier.size(13.dp))
        Text(label, style = MaterialTheme.typography.labelSmall, color = Sapphire)
    }
}

private fun Int.toLocaleString(): String {
    return when {
        this >= 1000 -> "${this / 1000}.${(this % 1000) / 100}K"
        else -> this.toString()
    }
}

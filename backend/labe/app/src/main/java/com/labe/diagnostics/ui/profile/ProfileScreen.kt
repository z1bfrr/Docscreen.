package com.labe.diagnostics.ui.profile

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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.labe.diagnostics.data.MockRepository
import com.labe.diagnostics.data.models.BookingOrder
import com.labe.diagnostics.data.models.OrderStatus
import com.labe.diagnostics.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    onOrderClick: (String) -> Unit
) {
    val profile = MockRepository.patientProfile
    val orders = MockRepository.mockOrders

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(Canvas),
        contentPadding = PaddingValues(bottom = 32.dp)
    ) {
        // ── Profile Header ─────────────────────────────────────────────────────
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.verticalGradient(listOf(Color(0xFF1E3A8A), Sapphire))
                    )
                    .padding(horizontal = 20.dp)
                    .padding(top = 52.dp, bottom = 32.dp)
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                    // Avatar circle
                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(0.2f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            profile.name.take(1).uppercase(),
                            style = MaterialTheme.typography.displaySmall,
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Spacer(Modifier.height(12.dp))
                    Text(profile.name, style = MaterialTheme.typography.headlineSmall, color = Color.White, fontWeight = FontWeight.Bold)
                    Text(profile.phone, style = MaterialTheme.typography.bodyMedium, color = Color.White.copy(0.7f))
                    Spacer(Modifier.height(16.dp))
                    // Health stats row
                    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                        StatChip("Age", "${profile.age}y")
                        StatChip("Blood", profile.bloodGroup)
                        StatChip("Gender", profile.gender)
                    }
                }
            }
        }

        // ── Quick Actions ──────────────────────────────────────────────────────
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .padding(top = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                listOf(
                    Triple(Icons.Filled.Description, "My Reports", Sapphire),
                    Triple(Icons.Filled.Receipt, "My Orders", CyanTeal),
                    Triple(Icons.Filled.FamilyRestroom, "Add Member", Emerald)
                ).forEach { (icon, label, color) ->
                    Surface(
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(14.dp),
                        color = color.copy(0.08f),
                        border = androidx.compose.foundation.BorderStroke(1.dp, color.copy(0.2f))
                    ) {
                        Column(
                            modifier = Modifier.padding(12.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(icon, null, tint = color, modifier = Modifier.size(22.dp))
                            Text(label, style = MaterialTheme.typography.labelSmall, color = DeepSlate)
                        }
                    }
                }
            }
        }

        // ── Profile Details Card ───────────────────────────────────────────────
        item {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Color.White,
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate300.copy(0.4f)),
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp).padding(top = 16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Personal Information", style = MaterialTheme.typography.titleSmall, color = DeepSlate)
                        TextButton(onClick = {}, contentPadding = PaddingValues(0.dp)) {
                            Icon(Icons.Filled.Edit, null, modifier = Modifier.size(16.dp))
                            Spacer(Modifier.width(4.dp))
                            Text("Edit", style = MaterialTheme.typography.labelMedium)
                        }
                    }
                    HorizontalDivider(color = Slate300.copy(0.3f))
                    ProfileInfoRow(Icons.Filled.Email, "Email", profile.email)
                    ProfileInfoRow(Icons.Filled.Home, "Address", profile.address)
                    ProfileInfoRow(Icons.Filled.Bloodtype, "Blood Group", profile.bloodGroup)
                }
            }
        }

        // ── Order History ──────────────────────────────────────────────────────
        item {
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp).padding(top = 20.dp, bottom = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Order History", style = MaterialTheme.typography.titleSmall, color = DeepSlate)
                Surface(shape = CircleShape, color = Sapphire.copy(0.1f)) {
                    Text(
                        "${orders.size}",
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 3.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = Sapphire,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
        items(orders) { order ->
            OrderHistoryCard(order = order, onClick = { onOrderClick(order.id) })
        }

        // ── Settings Section ───────────────────────────────────────────────────
        item {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Color.White,
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate300.copy(0.4f)),
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp).padding(top = 16.dp)
            ) {
                Column(modifier = Modifier.padding(vertical = 4.dp)) {
                    listOf(
                        Triple(Icons.Filled.Notifications, "Notifications", false),
                        Triple(Icons.Filled.Security, "Privacy & Security", false),
                        Triple(Icons.Filled.Help, "Help & Support", false),
                        Triple(Icons.Filled.Info, "About AuraLab", false),
                        Triple(Icons.Filled.Logout, "Sign Out", true)
                    ).forEach { (icon, label, isDanger) ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .padding(horizontal = 16.dp, vertical = 14.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Icon(icon, null, tint = if (isDanger) AlertRed else Slate700, modifier = Modifier.size(20.dp))
                            Text(
                                label,
                                style = MaterialTheme.typography.bodyMedium,
                                color = if (isDanger) AlertRed else DeepSlate,
                                modifier = Modifier.weight(1f)
                            )
                            if (!isDanger) Icon(Icons.Filled.ChevronRight, null, tint = Slate300, modifier = Modifier.size(16.dp))
                        }
                        if (label != "Sign Out") HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp), color = Slate300.copy(0.2f))
                    }
                }
            }
        }

        // ── App Version ───────────────────────────────────────────────────────
        item {
            Text(
                "AuraLab v1.0.0 • Made with ❤️ in Madurai",
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                style = MaterialTheme.typography.bodySmall,
                color = Slate500,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun OrderHistoryCard(order: BookingOrder, onClick: () -> Unit) {
    val (statusColor, statusText) = when (order.status) {
        OrderStatus.BOOKED -> Pair(CyanTeal, "Booked")
        OrderStatus.SAMPLE_COLLECTED -> Pair(Sapphire, "Collected")
        OrderStatus.PROCESSING -> Pair(AmberWarning, "Processing")
        OrderStatus.REPORT_READY -> Pair(Emerald, "Report Ready")
        OrderStatus.DELIVERED -> Pair(Slate500, "Delivered")
    }

    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate300.copy(0.4f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Box(
                modifier = Modifier.size(42.dp).clip(RoundedCornerShape(12.dp)).background(statusColor.copy(0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Filled.Receipt, null, tint = statusColor, modifier = Modifier.size(20.dp))
            }
            Column(Modifier.weight(1f)) {
                Text(order.tests.joinToString(", ") { it.shortName }, style = MaterialTheme.typography.labelLarge, color = DeepSlate)
                Text("${order.lab.name} • ${order.scheduledDate}", style = MaterialTheme.typography.bodySmall, color = Slate500)
                Spacer(Modifier.height(4.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Surface(shape = CircleShape, color = statusColor.copy(0.1f)) {
                        Text(statusText, modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp), style = MaterialTheme.typography.labelSmall, color = statusColor)
                    }
                    Text("₹${order.totalAmount}", style = MaterialTheme.typography.labelMedium, color = DeepSlate, fontWeight = FontWeight.SemiBold)
                }
            }
            Icon(Icons.Filled.ChevronRight, null, tint = Slate300)
        }
    }
}

@Composable
private fun StatChip(label: String, value: String) {
    Surface(shape = RoundedCornerShape(10.dp), color = Color.White.copy(0.2f)) {
        Column(
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(value, style = MaterialTheme.typography.titleSmall, color = Color.White, fontWeight = FontWeight.Bold)
            Text(label, style = MaterialTheme.typography.labelSmall, color = Color.White.copy(0.7f))
        }
    }
}

@Composable
private fun ProfileInfoRow(icon: ImageVector, label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        verticalAlignment = Alignment.Top
    ) {
        Icon(icon, null, tint = Sapphire, modifier = Modifier.size(17.dp).padding(top = 2.dp))
        Column {
            Text(label, style = MaterialTheme.typography.bodySmall, color = Slate500)
            Text(value, style = MaterialTheme.typography.bodyMedium, color = DeepSlate)
        }
    }
}

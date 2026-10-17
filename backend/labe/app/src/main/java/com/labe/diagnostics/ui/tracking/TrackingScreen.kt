package com.labe.diagnostics.ui.tracking

import androidx.compose.animation.core.*
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
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.labe.diagnostics.data.MockRepository
import com.labe.diagnostics.data.models.CollectionType
import com.labe.diagnostics.data.models.OrderStatus
import com.labe.diagnostics.data.models.TrackingStep
import com.labe.diagnostics.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TrackingScreen(
    orderId: String,
    onBack: () -> Unit
) {
    val order = MockRepository.mockOrders.find { it.id == orderId }
        ?: MockRepository.mockOrders.first()

    // Pulse animation for current step
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val scale by infiniteTransition.animateFloat(
        initialValue = 0.9f, targetValue = 1.1f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = EaseInOut),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse_scale"
    )

    Column(
        modifier = Modifier.fillMaxSize().background(Canvas)
    ) {
        // ── Top Bar ───────────────────────────────────────────────────────────
        TopAppBar(
            title = {
                Column {
                    Text("Track Order", style = MaterialTheme.typography.titleLarge, color = DeepSlate)
                    Text(order.id, style = MaterialTheme.typography.bodySmall, color = Sapphire)
                }
            },
            navigationIcon = {
                IconButton(onClick = onBack) {
                    Icon(Icons.Filled.ArrowBack, "Back", tint = DeepSlate)
                }
            },
            actions = {
                IconButton(onClick = {}) {
                    Icon(Icons.Filled.Share, "Share", tint = Slate700)
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(containerColor = White)
        )

        LazyColumn(
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // ── Status Banner ──────────────────────────────────────────────────
            item {
                val (statusColor, statusText, statusIcon) = when (order.status) {
                    OrderStatus.BOOKED -> Triple(CyanTeal, "Booking Confirmed", Icons.Filled.CheckCircle)
                    OrderStatus.SAMPLE_COLLECTED -> Triple(Sapphire, "Sample Collected", Icons.Filled.Science)
                    OrderStatus.PROCESSING -> Triple(AmberWarning, "Processing at Lab", Icons.Filled.Biotech)
                    OrderStatus.REPORT_READY -> Triple(Emerald, "Report Ready! 🎉", Icons.Filled.Description)
                    OrderStatus.DELIVERED -> Triple(Emerald, "Report Delivered", Icons.Filled.DoneAll)
                }

                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = statusColor.copy(alpha = 0.08f),
                    border = androidx.compose.foundation.BorderStroke(1.dp, statusColor.copy(0.25f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .scale(if (order.status == OrderStatus.SAMPLE_COLLECTED) scale else 1f)
                                .clip(CircleShape)
                                .background(statusColor.copy(0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(statusIcon, null, tint = statusColor, modifier = Modifier.size(24.dp))
                        }
                        Column(Modifier.weight(1f)) {
                            Text(statusText, style = MaterialTheme.typography.titleSmall, color = DeepSlate, fontWeight = FontWeight.Bold)
                            Text(
                                "${order.scheduledDate} • ${order.scheduledTimeSlot}",
                                style = MaterialTheme.typography.bodySmall, color = Slate700
                            )
                        }
                        if (order.status == OrderStatus.REPORT_READY) {
                            Button(
                                onClick = {},
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Emerald),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp)
                            ) {
                                Icon(Icons.Filled.Download, null, modifier = Modifier.size(16.dp))
                                Spacer(Modifier.width(4.dp))
                                Text("Download", style = MaterialTheme.typography.labelMedium)
                            }
                        }
                    }
                }
            }

            // ── Order Details ──────────────────────────────────────────────────
            item {
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = White,
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate300.copy(0.4f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("Order Details", style = MaterialTheme.typography.titleSmall, color = DeepSlate)
                        HorizontalDivider(color = Slate300.copy(0.3f))

                        OrderDetailRow(Icons.Filled.Science, "Tests", order.tests.joinToString(", ") { it.shortName })
                        OrderDetailRow(Icons.Filled.LocalHospital, "Lab", order.lab.name)
                        OrderDetailRow(Icons.Filled.Person, "Patient", "${order.patientName}, ${order.patientAge}y, ${order.patientGender}")
                        OrderDetailRow(
                            if (order.collectionType == CollectionType.HOME_COLLECTION) Icons.Filled.Home else Icons.Filled.DirectionsWalk,
                            "Collection",
                            if (order.collectionType == CollectionType.HOME_COLLECTION) "Home: ${order.address ?: ""}" else "Walk-in at lab"
                        )
                        OrderDetailRow(Icons.Filled.Payments, "Amount Paid", "₹${order.totalAmount}")
                    }
                }
            }

            // ── Tracking Timeline ──────────────────────────────────────────────
            item {
                Text("Live Tracking", style = MaterialTheme.typography.titleSmall, color = DeepSlate)
            }

            item {
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = White,
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate300.copy(0.4f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        order.trackingSteps.forEachIndexed { index, step ->
                            TrackingStepItem(
                                step = step,
                                isLast = index == order.trackingSteps.lastIndex,
                                pulseScale = scale
                            )
                        }
                    }
                }
            }

            // ── Support Button ─────────────────────────────────────────────────
            item {
                OutlinedButton(
                    onClick = {},
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    shape = RoundedCornerShape(14.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate300)
                ) {
                    Icon(Icons.Filled.SupportAgent, null, tint = Sapphire)
                    Spacer(Modifier.width(8.dp))
                    Text("Contact AuraConcierge Support", color = Sapphire, style = MaterialTheme.typography.labelLarge)
                }
            }

            item { Spacer(Modifier.height(16.dp)) }
        }
    }
}

@Composable
private fun TrackingStepItem(step: TrackingStep, isLast: Boolean, pulseScale: Float) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Timeline indicator column
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            // Step circle
            Box(
                modifier = Modifier
                    .size(if (step.isCurrent) 32.dp else 28.dp)
                    .scale(if (step.isCurrent) pulseScale else 1f)
                    .clip(CircleShape)
                    .background(
                        when {
                            step.isCurrent -> CyanTeal
                            step.isCompleted -> Emerald
                            else -> Slate300
                        }
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = when {
                        step.isCurrent -> Icons.Filled.RadioButtonChecked
                        step.isCompleted -> Icons.Filled.Check
                        else -> Icons.Filled.RadioButtonUnchecked
                    },
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(16.dp)
                )
            }
            // Connector line
            if (!isLast) {
                Box(
                    modifier = Modifier
                        .width(2.dp)
                        .height(40.dp)
                        .background(if (step.isCompleted) Emerald.copy(0.4f) else Slate300.copy(0.5f))
                )
            }
        }

        // Step content
        Column(
            modifier = Modifier
                .weight(1f)
                .padding(bottom = if (isLast) 0.dp else 8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    step.title,
                    style = MaterialTheme.typography.labelLarge,
                    color = when {
                        step.isCurrent -> CyanTeal
                        step.isCompleted -> DeepSlate
                        else -> Slate500
                    },
                    fontWeight = if (step.isCurrent) FontWeight.Bold else FontWeight.SemiBold
                )
                if (step.time != null) {
                    Text(step.time, style = MaterialTheme.typography.bodySmall, color = Slate500)
                }
            }
            if (step.subtitle.isNotBlank()) {
                Spacer(Modifier.height(2.dp))
                Text(step.subtitle, style = MaterialTheme.typography.bodySmall, color = Slate700)
            }
        }
    }
}

@Composable
private fun OrderDetailRow(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        verticalAlignment = Alignment.Top
    ) {
        Icon(icon, null, tint = Slate500, modifier = Modifier.size(16.dp).padding(top = 2.dp))
        Text(label, style = MaterialTheme.typography.bodySmall, color = Slate500, modifier = Modifier.width(80.dp))
        Text(value, style = MaterialTheme.typography.bodySmall, color = DeepSlate, modifier = Modifier.weight(1f))
    }
}

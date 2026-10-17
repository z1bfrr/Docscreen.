package com.labe.diagnostics.ui.booking

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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
import com.labe.diagnostics.data.models.CollectionType
import com.labe.diagnostics.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookingScreen(
    testId: String,
    labId: String,
    onBookingConfirmed: (String) -> Unit,
    onBack: () -> Unit
) {
    val test = MockRepository.getTestById(testId)
    val lab  = MockRepository.getLabById(labId)
    val price = MockRepository.getPriceForTestInLab(testId, labId)

    var collectionType by remember { mutableStateOf(CollectionType.HOME_COLLECTION) }
    var selectedDate by remember { mutableStateOf("Today") }
    var selectedSlotId by remember { mutableStateOf<String?>(null) }
    var address by remember { mutableStateOf("12, Gandhi Nagar, 4th Cross, Madurai - 625020") }
    var patientName by remember { mutableStateOf("Mukesh Z") }
    var patientAge by remember { mutableStateOf("28") }
    var patientGender by remember { mutableStateOf("Male") }
    var showConfirmDialog by remember { mutableStateOf(false) }

    val dates = listOf("Today", "Tomorrow", "Tue 22 Sep", "Wed 23 Sep", "Thu 24 Sep")

    if (test == null || lab == null) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("Information not found", color = Slate500)
        }
        return
    }

    // Confirmation Dialog
    if (showConfirmDialog) {
        AlertDialog(
            onDismissRequest = { showConfirmDialog = false },
            icon = { Icon(Icons.Filled.CheckCircle, null, tint = Emerald, modifier = Modifier.size(40.dp)) },
            title = {
                Text("Booking Confirmed! 🎉", style = MaterialTheme.typography.headlineSmall, color = DeepSlate)
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("Order #ORD-2024-003", style = MaterialTheme.typography.labelLarge, color = Sapphire)
                    Text("${test.name} at ${lab.name}", style = MaterialTheme.typography.bodyMedium, color = DeepSlate)
                    Text("$selectedDate • ${MockRepository.timeSlots.find { it.id == selectedSlotId }?.time ?: ""}", style = MaterialTheme.typography.bodySmall, color = Slate700)
                    if (collectionType == CollectionType.HOME_COLLECTION) {
                        Text("Home collection at: $address", style = MaterialTheme.typography.bodySmall, color = Slate700)
                    }
                    Spacer(Modifier.height(4.dp))
                    Text("Total Paid: ₹${price ?: 0}", style = MaterialTheme.typography.titleMedium, color = Sapphire, fontWeight = FontWeight.Bold)
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        showConfirmDialog = false
                        onBookingConfirmed("ORD-2024-003")
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald)
                ) {
                    Text("Track Order")
                }
            },
            dismissButton = {
                TextButton(onClick = { showConfirmDialog = false }) { Text("Close") }
            }
        )
    }

    Column(modifier = Modifier.fillMaxSize().background(Canvas)) {
        // ── Top Bar ───────────────────────────────────────────────────────────
        TopAppBar(
            title = { Text("Book Test", style = MaterialTheme.typography.titleLarge, color = DeepSlate) },
            navigationIcon = {
                IconButton(onClick = onBack) {
                    Icon(Icons.Filled.ArrowBack, "Back", tint = DeepSlate)
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(containerColor = White)
        )

        LazyColumn(
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // ── Order Summary Card ─────────────────────────────────────────────
            item {
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = SapphireLight,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(modifier = Modifier.padding(16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Box(
                            modifier = Modifier.size(48.dp).clip(RoundedCornerShape(14.dp)).background(Sapphire.copy(0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Filled.Science, null, tint = Sapphire, modifier = Modifier.size(24.dp))
                        }
                        Column(Modifier.weight(1f)) {
                            Text(test.name, style = MaterialTheme.typography.titleSmall, color = DeepSlate)
                            Text(lab.name, style = MaterialTheme.typography.bodySmall, color = Slate700)
                            Spacer(Modifier.height(4.dp))
                            if (price != null) {
                                Text("₹$price", style = MaterialTheme.typography.titleMedium, color = Sapphire, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }

            // ── Collection Type ────────────────────────────────────────────────
            item {
                SectionCard(title = "Collection Type") {
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        CollectionTypeOption(
                            modifier = Modifier.weight(1f),
                            icon = Icons.Filled.Home,
                            title = "Home Collection",
                            subtitle = if (lab.homeCollectionCharge == 0) "Free" else "₹${lab.homeCollectionCharge}",
                            isSelected = collectionType == CollectionType.HOME_COLLECTION,
                            onClick = { collectionType = CollectionType.HOME_COLLECTION }
                        )
                        CollectionTypeOption(
                            modifier = Modifier.weight(1f),
                            icon = Icons.Filled.LocalHospital,
                            title = "Walk-in",
                            subtitle = "Visit lab",
                            isSelected = collectionType == CollectionType.WALK_IN,
                            onClick = { collectionType = CollectionType.WALK_IN }
                        )
                    }
                }
            }

            // ── Date Selection ─────────────────────────────────────────────────
            item {
                SectionCard(title = "Select Date") {
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        items(dates) { date ->
                            val isSelected = selectedDate == date
                            Surface(
                                onClick = { selectedDate = date },
                                shape = RoundedCornerShape(12.dp),
                                color = if (isSelected) Sapphire else Slate100,
                                modifier = Modifier.defaultMinSize(minWidth = 88.dp)
                            ) {
                                Column(
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Text(
                                        date.split(" ").first(),
                                        style = MaterialTheme.typography.labelLarge,
                                        color = if (isSelected) Color.White else DeepSlate
                                    )
                                    if (date.contains(" ")) {
                                        Text(
                                            date.substringAfter(" "),
                                            style = MaterialTheme.typography.bodySmall,
                                            color = if (isSelected) Color.White.copy(0.8f) else Slate500
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // ── Time Slot ─────────────────────────────────────────────────────
            item {
                SectionCard(title = "Select Time Slot") {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        MockRepository.timeSlots.chunked(2).forEach { row ->
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                row.forEach { slot ->
                                    val isSelected = selectedSlotId == slot.id
                                    Surface(
                                        onClick = { if (slot.isAvailable) selectedSlotId = slot.id },
                                        shape = RoundedCornerShape(10.dp),
                                        color = when {
                                            !slot.isAvailable -> Slate100
                                            isSelected -> Sapphire
                                            else -> White
                                        },
                                        border = if (isSelected) null else
                                            androidx.compose.foundation.BorderStroke(1.dp, Slate300.copy(0.5f)),
                                        modifier = Modifier.weight(1f)
                                    ) {
                                        Text(
                                            slot.time,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 10.dp),
                                            style = MaterialTheme.typography.bodySmall,
                                            color = when {
                                                !slot.isAvailable -> Slate300
                                                isSelected -> Color.White
                                                else -> DeepSlate
                                            }
                                        )
                                    }
                                }
                                if (row.size == 1) Spacer(Modifier.weight(1f))
                            }
                        }
                    }
                }
            }

            // ── Patient Details ────────────────────────────────────────────────
            item {
                SectionCard(title = "Patient Details") {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedTextField(
                            value = patientName,
                            onValueChange = { patientName = it },
                            label = { Text("Patient Name") },
                            leadingIcon = { Icon(Icons.Filled.Person, null) },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp)
                        )
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            OutlinedTextField(
                                value = patientAge,
                                onValueChange = { patientAge = it },
                                label = { Text("Age") },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(12.dp)
                            )
                            // Gender selector
                            Column(Modifier.weight(1f)) {
                                Text("Gender", style = MaterialTheme.typography.bodySmall, color = Slate700)
                                Spacer(Modifier.height(4.dp))
                                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    listOf("Male", "Female").forEach { g ->
                                        FilterChip(
                                            selected = patientGender == g,
                                            onClick = { patientGender = g },
                                            label = { Text(g, style = MaterialTheme.typography.labelMedium) },
                                            colors = FilterChipDefaults.filterChipColors(
                                                selectedContainerColor = Sapphire,
                                                selectedLabelColor = Color.White
                                            )
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // ── Address (Home Collection only) ────────────────────────────────
            if (collectionType == CollectionType.HOME_COLLECTION) {
                item {
                    SectionCard(title = "Collection Address") {
                        OutlinedTextField(
                            value = address,
                            onValueChange = { address = it },
                            label = { Text("Full Address") },
                            leadingIcon = { Icon(Icons.Filled.Home, null) },
                            modifier = Modifier.fillMaxWidth(),
                            minLines = 2,
                            shape = RoundedCornerShape(12.dp)
                        )
                    }
                }
            }

            // ── Price Summary ──────────────────────────────────────────────────
            item {
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = White,
                    border = androidx.compose.foundation.BorderStroke(1.dp, Slate300.copy(0.4f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Price Summary", style = MaterialTheme.typography.titleSmall, color = DeepSlate)
                        HorizontalDivider(color = Slate300.copy(0.3f))
                        PriceLine("Test Fee", "₹${price ?: 0}")
                        PriceLine(
                            "Home Collection",
                            if (lab.homeCollectionCharge == 0 || collectionType == CollectionType.WALK_IN)
                                "FREE" else "₹${lab.homeCollectionCharge}"
                        )
                        HorizontalDivider(color = Slate300.copy(0.3f))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Total Amount", style = MaterialTheme.typography.titleSmall, color = DeepSlate, fontWeight = FontWeight.Bold)
                            Text("₹${price ?: 0}", style = MaterialTheme.typography.titleSmall, color = Sapphire, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // ── Book Button ────────────────────────────────────────────────────
            item {
                val canBook = selectedSlotId != null && patientName.isNotBlank()
                Button(
                    onClick = { showConfirmDialog = true },
                    enabled = canBook,
                    modifier = Modifier.fillMaxWidth().height(54.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Sapphire)
                ) {
                    Icon(Icons.Filled.CheckCircle, null)
                    Spacer(Modifier.width(8.dp))
                    Text("Confirm Booking • ₹${price ?: 0}", style = MaterialTheme.typography.labelLarge)
                }
                if (selectedSlotId == null) {
                    Spacer(Modifier.height(4.dp))
                    Text(
                        "Please select a time slot to continue",
                        style = MaterialTheme.typography.bodySmall,
                        color = AlertRed,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }

            item { Spacer(Modifier.height(16.dp)) }
        }
    }
}

@Composable
private fun SectionCard(title: String, content: @Composable ColumnScope.() -> Unit) {
    Surface(
        shape = RoundedCornerShape(20.dp),
        color = White,
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate300.copy(0.4f)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(title, style = MaterialTheme.typography.titleSmall, color = DeepSlate)
            content()
        }
    }
}

@Composable
private fun CollectionTypeOption(
    modifier: Modifier = Modifier,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        color = if (isSelected) SapphireLight else Slate100,
        border = androidx.compose.foundation.BorderStroke(
            if (isSelected) 2.dp else 1.dp,
            if (isSelected) Sapphire else Slate300.copy(0.5f)
        )
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Icon(icon, null, tint = if (isSelected) Sapphire else Slate500, modifier = Modifier.size(26.dp))
            Text(title, style = MaterialTheme.typography.labelMedium, color = if (isSelected) Sapphire else DeepSlate)
            Text(subtitle, style = MaterialTheme.typography.bodySmall, color = if (isSelected) SapphireBright else Slate500)
        }
    }
}

@Composable
private fun PriceLine(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, style = MaterialTheme.typography.bodyMedium, color = Slate700)
        Text(value, style = MaterialTheme.typography.bodyMedium, color = if (value == "FREE") EmeraldDark else DeepSlate)
    }
}

package com.labe.diagnostics.ui.search

import androidx.compose.foundation.background
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
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.labe.diagnostics.data.MockRepository
import com.labe.diagnostics.data.models.DiagnosticTest
import com.labe.diagnostics.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(
    initialQuery: String = "",
    initialCategory: String = "",
    onTestClick: (String) -> Unit,
    onBack: () -> Unit
) {
    var searchQuery by remember { mutableStateOf(initialQuery) }
    var selectedCategory by remember { mutableStateOf(if (initialCategory.isBlank()) "all" else initialCategory) }
    val focusRequester = remember { FocusRequester() }

    val filteredTests = remember(searchQuery, selectedCategory) {
        val byQuery = MockRepository.searchTests(searchQuery)
        if (selectedCategory == "all") byQuery
        else byQuery.filter { it.category.id == selectedCategory }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Canvas)
    ) {
        // ── Top Search Bar ─────────────────────────────────────────────────────
        Surface(
            color = White,
            shadowElevation = 2.dp
        ) {
            Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Back", tint = DeepSlate)
                    }
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        modifier = Modifier
                            .weight(1f)
                            .focusRequester(focusRequester),
                        placeholder = {
                            Text("Search CBC, X-Ray, Thyroid...", color = Slate500, style = MaterialTheme.typography.bodyMedium)
                        },
                        leadingIcon = {
                            Icon(Icons.Filled.Search, contentDescription = null, tint = Sapphire)
                        },
                        trailingIcon = {
                            if (searchQuery.isNotEmpty()) {
                                IconButton(onClick = { searchQuery = "" }) {
                                    Icon(Icons.Filled.Close, contentDescription = "Clear", tint = Slate500)
                                }
                            }
                        },
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Sapphire,
                            unfocusedBorderColor = Slate300,
                            focusedContainerColor = White,
                            unfocusedContainerColor = Slate100
                        )
                    )
                }

                Spacer(Modifier.height(8.dp))

                // Category filter chips
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    item {
                        FilterChip(
                            selected = selectedCategory == "all",
                            onClick = { selectedCategory = "all" },
                            label = { Text("All") },
                            leadingIcon = if (selectedCategory == "all") {
                                { Icon(Icons.Filled.Check, null, modifier = Modifier.size(16.dp)) }
                            } else null
                        )
                    }
                    items(MockRepository.categories) { cat ->
                        FilterChip(
                            selected = selectedCategory == cat.id,
                            onClick = { selectedCategory = cat.id },
                            label = { Text(cat.name) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Sapphire,
                                selectedLabelColor = Color.White,
                                selectedLeadingIconColor = Color.White
                            )
                        )
                    }
                }
            }
        }

        // ── Results Count ──────────────────────────────────────────────────────
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                "${filteredTests.size} tests found",
                style = MaterialTheme.typography.bodyMedium,
                color = Slate700
            )
            if (searchQuery.isNotEmpty()) {
                Text(
                    " for \"$searchQuery\"",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Sapphire,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }

        // ── Test List ──────────────────────────────────────────────────────────
        if (filteredTests.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Filled.SearchOff, contentDescription = null, tint = Slate300, modifier = Modifier.size(64.dp))
                    Spacer(Modifier.height(12.dp))
                    Text("No tests found", style = MaterialTheme.typography.titleMedium, color = Slate500)
                    Text("Try searching a different name", style = MaterialTheme.typography.bodySmall, color = Slate500)
                }
            }
        } else {
            LazyColumn(
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(filteredTests) { test ->
                    SearchTestCard(test = test, onClick = { onTestClick(test.id) })
                }
                item { Spacer(Modifier.height(16.dp)) }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchTestCard(test: DiagnosticTest, onClick: () -> Unit) {
    val catColor = Color(test.category.color)
    val minPrice = MockRepository.labPartners
        .mapNotNull { lab -> MockRepository.getPriceForTestInLab(test.id, lab.id) }
        .minOrNull()
    val labCount = MockRepository.getLabsForTest(test.id).size

    Card(
        onClick = onClick,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Slate300.copy(alpha = 0.4f))
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.Top
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(catColor.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Filled.Science, null, tint = catColor, modifier = Modifier.size(24.dp))
            }
            Column(Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(test.name, style = MaterialTheme.typography.titleSmall, color = DeepSlate)
                }
                Spacer(Modifier.height(3.dp))
                Text(test.description, style = MaterialTheme.typography.bodySmall, color = Slate500, maxLines = 2)
                Spacer(Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    InfoBadge(Icons.Filled.AccessTime, test.turnaroundTime)
                    InfoBadge(Icons.Filled.Bloodtype, test.sampleType)
                    if (test.isHomeCollectionAvailable) {
                        InfoBadge(Icons.Filled.Home, "Home")
                    }
                }
                Spacer(Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        if (minPrice != null) {
                            Text(
                                "from ₹$minPrice",
                                style = MaterialTheme.typography.titleSmall,
                                color = Sapphire,
                                fontWeight = FontWeight.Bold
                            )
                            Text("$labCount labs available", style = MaterialTheme.typography.bodySmall, color = Slate500)
                        }
                    }
                    Button(
                        onClick = onClick,
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Sapphire),
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
                    ) {
                        Text("Compare Labs", style = MaterialTheme.typography.labelMedium)
                    }
                }
            }
        }
    }
}

@Composable
private fun InfoBadge(icon: androidx.compose.ui.graphics.vector.ImageVector, text: String) {
    Surface(
        shape = CircleShape,
        color = Slate100
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Icon(icon, null, tint = Slate700, modifier = Modifier.size(11.dp))
            Text(text, style = MaterialTheme.typography.labelSmall, color = Slate700)
        }
    }
}

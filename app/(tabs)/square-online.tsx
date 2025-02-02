// apps/(tabs)/square-online.tsx
import React, { useState, useRef, useEffect } from 'react';
import { router } from 'expo-router'; // Ensure you have this import at the top
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Button,
  Dimensions,
  PanResponder,
  Animated,
  Image,
  ImageBackground,
  TextInput,
  Text,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams } from 'expo-router';
 
// 1. Import Firestore references
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { db } from '../../FirebaseConfig';
 
// --------------------- Plant Options ---------------------
const plantTypes = [
  "Empty",
  "Tomatoes",
  "Carrots",
  "Beets",
  "Corn",
  "Lettuce",
  "Beans",
  "Broccoli",
  "Cucumbers",
  "Potatoes",
  "Peanuts",
  "Blackberries",
  "Blueberries",
  "Strawberries",
  "Basil",
  "Parsley"
];
 

const plantImages: { [key: string]: any } = {
  Tomatoes: require('../../assets/tomatoes.png'),
  Carrots: require('../../assets/carrots.png'),
  Beets: require('../../assets/beets.png'),
  Corn: require('../../assets/corn.png'),
  Lettuce: require('../../assets/lettuce.png'),
  Beans: require('../../assets/beans.png'),
  Broccoli: require('../../assets/broccoli.png'),
  Cucumbers: require('../../assets/cucumbers.png'),
  Potatoes: require('../../assets/potatoes.png'),
  Peanuts: require('../../assets/peanuts.png'),
  Blackberries: require('../../assets/blackberries.png'),
  Blueberries: require('../../assets/blueberries.png'),
  Strawberries: require('../../assets/strawberries.png'),
  Basil: require('../../assets/basil.png'),
  Parsley: require('../../assets/parsley.png'),
};
 
// --------------------- Types & Constants ---------------------
export interface GridCell {
  isBlack: boolean
  plantType?: string | null
  plantName?: string | null
  datePlanted?: Date | null
  wateredDate?: Date | null
  harvestedDate?: Date | null
}
 
const GRID_ROWS = 20;
const GRID_COLS = 20;
const EDITOR_CELL_SIZE = 80;
 
// Helper: Create an initial (empty) 2D grid in local state.
const createInitialGrid = (): GridCell[][] =>
  Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => ({
      isBlack: false,
      plantType: null,
      plantName: null,
      datePlanted: null,
      wateredDate: null,
      harvestedDate: null,
    }))
  );
 
/**
* 2. Flatten the 2D grid into a single array of objects.
*    Firestore doesn't allow nested arrays, so we store each cell with row/col.
*/
function serializeGrid(grid: GridCell[][]): any[] {
  const cells: any[] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const cell = grid[r][c];
      cells.push({
        row: r,
        col: c,
        isBlack: cell.isBlack,
        plantType: cell.plantType ?? null,
        plantName: cell.plantName,
        // Convert Date → Firestore Timestamp
        datePlanted: cell.datePlanted ? Timestamp.fromDate(cell.datePlanted) : null,
        wateredDate: cell.wateredDate ? Timestamp.fromDate(cell.wateredDate) : null,
        harvestedDate: cell.harvestedDate ? Timestamp.fromDate(cell.harvestedDate) : null,
      });
    }
  }
  return cells;
}
 
/**
* 3. Convert the flattened array back into a 2D grid.
*/
function deserializeGrid(cells: any[]): GridCell[][] {
  // Start with an empty 2D grid
  const newGrid = createInitialGrid();
 
  for (let i = 0; i < cells.length; i++) {
    const cellData = cells[i];
    const r = cellData.row;
    const c = cellData.col;
 
    newGrid[r][c] = {
      isBlack: cellData.isBlack,
      plantType: cellData.plantType,
      plantName: cellData.plantName,
      datePlanted: cellData.datePlanted ? cellData.datePlanted.toDate() : null,
      wateredDate: cellData.wateredDate ? cellData.wateredDate.toDate() : null,
      harvestedDate: cellData.harvestedDate ? cellData.harvestedDate.toDate() : null,
    };
  }
  return newGrid;
}
 
const App: React.FC = () => {
  // Grab pinId from route
  const { pinId } = useLocalSearchParams<{ pinId: string }>();
  if (!pinId) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Error: No pin id provided.</Text>
      </View>
    );
  }
 
  // 4. Our local 2D grid state
  const [grid, setGrid] = useState<GridCell[][] | null>(null);
  const [editorMode, setEditorMode] = useState<boolean>(false);
 
  // For the block modal:
  const [selectedBlock, setSelectedBlock] = useState<{ row: number; col: number } | null>(null);
  const [blockName, setBlockName] = useState<string>("");
  const [blockType, setBlockType] = useState<string>("Empty");
  const [datePlanted, setDatePlanted] = useState<Date | null>(null);
  const [wateredDate, setWateredDate] = useState<Date | null>(null);
  const [harvestedDate, setHarvestedDate] = useState<Date | null>(null);
 
  // Pan for editor mode
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.extractOffset();
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;
 
  // --------------------- Firestore Grid Loading & Updating ---------------------
  // Load the grid for this pin from Firestore
  useEffect(() => {
    const loadGrid = async () => {
      try {
        const gridDocRef = doc(db, "squares", pinId);
        const gridSnap = await getDoc(gridDocRef);
 
        if (gridSnap.exists()) {
          console.log("Grid found in Firestore:", gridSnap.data());
 
          // 5. Firestore now has { cells: [...] }
          const loadedCells = gridSnap.data().cells;
          if (loadedCells && Array.isArray(loadedCells)) {
            const loadedGrid = deserializeGrid(loadedCells);
            setGrid(loadedGrid);
          } else {
            // If "cells" missing for some reason, create new
            const initialGrid = createInitialGrid();
            await setDoc(gridDocRef, { cells: serializeGrid(initialGrid) });
            setGrid(initialGrid);
          }
        } else {
          // If no doc exists yet, create one
          const initialGrid = createInitialGrid();
          await setDoc(gridDocRef, { cells: serializeGrid(initialGrid) });
          console.log("Created new grid in Firestore");
          setGrid(initialGrid);
        }
      } catch (error) {
        console.error("Error loading grid:", error);
      }
    };
    loadGrid();
  }, [pinId]);
 
  // Update Firestore whenever we change the grid
  const updateGrid = async (newGrid: GridCell[][]) => {
    setGrid(newGrid);
    try {
      // 6. Store as "cells" (flattened array)
      await setDoc(
        doc(db, "squares", pinId),
        { cells: serializeGrid(newGrid) },
        { merge: true }
      );
      console.log("Grid updated in Firestore");
    } catch (error) {
      console.error("Error updating grid:", error);
    }
  };
 
  // --------------------- Utility Functions ---------------------
  const computeEditorRegion = () => {
    if (!grid) {
      // If grid not loaded yet, just return a default region
      return {
        startRow: 0,
        endRow: 1,
        startCol: 0,
        endCol: 1,
      };
    }
    let minRow = GRID_ROWS,
      maxRow = -1,
      minCol = GRID_COLS,
      maxCol = -1;
    let hasBlack = false;
 
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (grid[r][c].isBlack) {
          hasBlack = true;
          if (r < minRow) minRow = r;
          if (r > maxRow) maxRow = r;
          if (c < minCol) minCol = c;
          if (c > maxCol) maxCol = c;
        }
      }
    }
 
    if (!hasBlack) {
      const centerRow = Math.floor(GRID_ROWS / 2);
      const centerCol = Math.floor(GRID_COLS / 2);
      return {
        startRow: centerRow - 1,
        endRow: centerRow + 1,
        startCol: centerCol - 1,
        endCol: centerCol + 1,
      };
    } else {
      return {
        startRow: minRow - 1,
        endRow: maxRow + 1,
        startCol: minCol - 1,
        endCol: maxCol + 1,
      };
    }
  };
 
  // Toggle black/grass cell
  const toggleCell = (r: number, c: number) => {
    if (!grid || r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) return;
    const newGrid = grid.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        if (rowIndex === r && colIndex === c) {
          return {
            isBlack: !cell.isBlack,
            plantType: !cell.isBlack ? "empty" : null,
            plantName: !cell.isBlack ? "" : null,
            datePlanted: null,
            wateredDate: null,
            harvestedDate: null,
          };
        }
        return cell;
      })
    );
    updateGrid(newGrid);
  };
 
  // Center the editor region in the viewport
  useEffect(() => {
    if (editorMode && grid) {
      const region = computeEditorRegion();
      const numRows = region.endRow - region.startRow + 1;
      const numCols = region.endCol - region.startCol + 1;
      const regionWidth = numCols * EDITOR_CELL_SIZE;
      const regionHeight = numRows * EDITOR_CELL_SIZE;
      const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
      const centerX = (windowWidth - regionWidth) / 2;
      const centerY = (windowHeight - regionHeight) / 2;
      pan.setValue({ x: centerX, y: centerY });
    }
  }, [editorMode, grid]);
 
  // Block details
  const openBlockScreen = (row: number, col: number) => {
    if (!grid) return;
    setSelectedBlock({ row, col });
    const cell = grid[row][col];
    setBlockName(cell.plantName || "");
    setBlockType(cell.plantType || "Empty");
    setDatePlanted(cell.datePlanted || null);
    setWateredDate(cell.wateredDate || null);
    setHarvestedDate(cell.harvestedDate || null);
  };
 
  const closeBlockScreen = () => {
    if (selectedBlock && grid) {
      const { row, col } = selectedBlock;
      const newGrid = grid.map((gridRow, rowIndex) =>
        gridRow.map((cell, colIndex) => {
          if (rowIndex === row && colIndex === col) {
            return {
              ...cell,
              plantName: blockType === "Empty" ? null : blockName,
              plantType: blockType === "Empty" ? null : blockType,
              datePlanted: blockType === "Empty" ? null : datePlanted,
              wateredDate: blockType === "Empty" ? null : wateredDate,
              harvestedDate: blockType === "Empty" ? null : harvestedDate,
            };
          }
          return cell;
        })
      );
      updateGrid(newGrid);
    }
    setSelectedBlock(null);
  };
 
  // --------------------- Render Editor Mode ---------------------
  const renderEditorMode = () => {
    if (!grid) return null;
    const region = computeEditorRegion();
    const numRows = region.endRow - region.startRow + 1;
    const numCols = region.endCol - region.startCol + 1;
 
    return (
      <ImageBackground
        source={require('../../assets/dirt.png')}
        style={styles.editorContainer}
      >
        <Animated.View
          style={[
            {
              width: numCols * EDITOR_CELL_SIZE,
              height: numRows * EDITOR_CELL_SIZE,
              flexDirection: 'row',
              flexWrap: 'wrap',
            },
            { transform: pan.getTranslateTransform() },
          ]}
          {...panResponder.panHandlers}
        >
          {Array.from({ length: numRows }).map((_, rowOffset) => {
            const r = region.startRow + rowOffset;
            return (
              <View key={`row-${r}`} style={{ flexDirection: 'row' }}>
                {Array.from({ length: numCols }).map((_, colOffset) => {
                  const c = region.startCol + colOffset;
                  const isValid = r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS;
                  const isBlack = isValid ? grid[r][c].isBlack : false;
                  return (
                    <TouchableOpacity
                      key={`cell-${r}-${c}`}
                      onPress={() => toggleCell(r, c)}
                    >
                      <Image
                        source={
                          isBlack
                            ? require('../../assets/dirt.png')
                            : require('../../assets/grass.png')
                        }
                        style={{ width: EDITOR_CELL_SIZE, height: EDITOR_CELL_SIZE }}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}
        </Animated.View>
 
        <View style={styles.editorButtonContainer}>
          <Button title="Save Plot" onPress={() => setEditorMode(false)} />
        </View>
      </ImageBackground>
    );
  };
 
  // --------------------- Render Garden (Main) View ---------------------
  const renderGardenView = () => {
    if (!grid) return null;
    const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
    const { startRow, endRow, startCol, endCol } = computeEditorRegion();
    const numRows = endRow - startRow + 1;
    const numCols = endCol - startCol + 1;
    const cellSize = Math.min(windowWidth / numCols, windowHeight / numRows);
    const containerWidth = cellSize * numCols;
    const containerHeight = cellSize * numRows;
 
    return (
      <ImageBackground
        source={require('../../assets/dirt.png')}
        style={[styles.gardenContainer, { width: windowWidth, height: windowHeight }]}
      >
        <View
          style={{
            width: containerWidth,
            height: containerHeight,
            position: 'absolute',
            top: (windowHeight - containerHeight) / 2,
            left: (windowWidth - containerWidth) / 2,
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              if (cell.isBlack) {
                return (
                  <TouchableOpacity
                    key={`cell-${rowIndex}-${colIndex}`}
                    onPress={() => openBlockScreen(rowIndex, colIndex)}
                    style={{
                      position: 'absolute',
                      left: (colIndex - startCol) * cellSize,
                      top: (rowIndex - startRow) * cellSize,
                      width: cellSize,
                      height: cellSize,
                    }}
                  >
                    <View style={{ width: cellSize, height: cellSize }}>
                      <Image
                        source={require('../../assets/dirt.png')}
                        style={{ width: cellSize, height: cellSize, position: 'absolute' }}
                      />
                      {cell.plantType && (
                        <Image
                          source={plantImages[cell.plantType]}
                          style={{
                            width: cellSize * 0.8,
                            height: cellSize * 0.8,
                            position: 'absolute',
                            top: cellSize * 0.1,
                            left: cellSize * 0.1,
                          }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }
              return null;
            })
          )}
        </View>
 
        <View style={styles.gardenButtonContainer}>
          <Button title="Edit Layout" onPress={() => setEditorMode(true)} />
        </View>
        <View style={styles.returnToMap}>
          <Button title="Exit"onPress={() => {
       router.push('../map/index.tsx');
    } } />
        </View>
      </ImageBackground>
    );
  };
 
  // --------------------- Render Block Modal Screen ---------------------
  const renderBlockModal = () => {
    return (
      <Modal visible={true} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalTopRow}>
              <Image
                // If blockType is "Empty", show a question mark image.
                source={
                  blockType === "Empty"
                    ? require('../../assets/question.png')
                    : (plantImages[blockType] || require('../../assets/question.png'))
                }
                style={styles.plantImage}
              />
              <View style={styles.modalInputs}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter name"
                  value={blockName}
                  onChangeText={setBlockName}
                />
                <Picker
                  selectedValue={blockType}
                  onValueChange={(itemValue) => setBlockType(itemValue)}
                  style={styles.picker}
                >
                  {plantTypes.map((type) => (
                    <Picker.Item label={type} value={type} key={type} />
                  ))}
                </Picker>
              </View>
            </View>
            {/* New Date/Time Section */}
            <View style={styles.dateTimeSection}>
              <View style={styles.dateTimeRow}>
                <Text>Date Planted: {datePlanted ? datePlanted.toLocaleDateString() : "Not set"}</Text>
                <Button title="Set Plant Date" onPress={() => setDatePlanted(new Date())} />
              </View>
              <View style={styles.dateTimeRow}>
                <Text>Watered: {wateredDate ? wateredDate.toLocaleDateString() : "Not set"}</Text>
                <Button title="Record Watered Date" onPress={() => setWateredDate(new Date())} />
              </View>
              <View style={styles.dateTimeRow}>
                <Text>Harvested: {harvestedDate ? harvestedDate.toLocaleDateString() : "Not set"}</Text>
                <Button title="Record Harvested Date" onPress={() => setHarvestedDate(new Date())} />
              </View>
            </View>
            <ScrollView style={styles.infoSection}>
              <Text style={styles.infoText}>
                Information about {blockType}:{'\n'}
                {blockType === "Tomatoes" &&
                  "Tomatoes are one of the most versatile and widely cultivated crops in the world. Known for their juicy, flavorful fruits, tomatoes are packed with vitamins, particularly vitamin C and lycopene, an antioxidant linked to health benefits. Tomatoes can be grown in various climates, but they thrive in warm, sunny conditions. Additionally, tomatoes are relatively easy to grow, especially in home gardens, and can yield abundant crops throughout the growing season."}
                {blockType === "Carrots" &&
                  "Carrots are root vegetables known for their crisp texture and vibrant orange color, though they can also come in purple, yellow, and red varieties. Carrots are rich in beta-carotene, which the body converts into vitamin A, promoting healthy vision. They are adaptable to different soil types and grow well in cooler climates. They're also easy to grow in a variety of garden setups, from large farms to small home gardens."}
                {blockType === "Beets" &&
                  "Beets are root vegetables that have gained popularity due to their rich nutritional profile, which includes high levels of fiber, folate, and antioxidants like betalains. They are hardy crops that can thrive in cool temperatures, making them suitable for both spring and fall planting. One advantage of beets is that both the roots and the leaves are edible. They also improve soil health by acting as a natural fertilizer due to their deep roots."}
                {blockType === "Corn" &&
                  "Corn is a staple crop grown worldwide for both human consumption and animal feed. It’s an energy-rich crop, providing carbohydrates, fiber, and several essential vitamins. Corn grows best in warm climates and requires a significant amount of space, but its high yield per plant makes it a reliable crop. It also plays a major role in crop rotation systems by helping to break pest cycles and improving soil health."}
                {blockType === "Lettuce" &&
                  "Lettuce is low in calories but packed with vitamins A and K. Lettuce grows quickly and thrives in cooler temperatures, making it ideal for early spring or late fall harvests. One of its main advantages is its fast-growing nature, allowing for multiple harvests in a season. Lettuce can be grown in a variety of climates and does well in containers, making it suitable for small spaces or urban gardening. However, lettuce can be sensitive to heat, which can cause it to bolt (flower and go to seed), so temperature regulation is important."}
                {blockType === "Beans" &&
                  "Beans are legumes known for being rich in protein, fiber, and essential minerals like iron and magnesium. One of the main advantages of beans is their ability to fix nitrogen in the soil, improving soil fertility for other crops. They grow well in warmer climates and are often planted in rotation with other crops to prevent soil depletion. Beans are also relatively easy to grow and can be cultivated in both large fields and small garden spaces."}
                {blockType === "Broccoli" &&
                  "Broccoli is a nutrient-dense vegetable belonging to the cabbage family. It is rich in vitamin C, fiber, and antioxidants, making it an excellent choice for promoting health and immunity. Broccoli grows best in cool temperatures and is often planted in early spring or fall. One of its key advantages is its ability to thrive in diverse environments, making it a popular crop for home gardens. It is also known for its health benefits, including cancer-fighting properties due to the presence of sulforaphane. Additionally, broccoli can be harvested multiple times from the same plant if cared for properly."}
                {blockType === "Cucumbers" &&
                  "High in water content and low in calories, cucumbers are a great choice for hydration. One of their main advantages is their fast-growing nature, allowing for quick harvests in the warm months. Cucumbers grow best in well-drained, fertile soil and thrive in hot, sunny conditions. They also produce high yields, especially when grown on vines or trellises. Cucumbers can be eaten fresh, used in cooking, or preserved through pickling."}
                {blockType === "Potatoes" &&
                  "Potatoes are a staple crop that is both highly nutritious and versatile. Rich in carbohydrates, fiber, and vitamin C, potatoes are a key part of many diets around the world. They grow best in cool, temperate climates and are often grown in well-drained, loose soil. One major advantage of potatoes is their high yield per plant. Potatoes come in many varieties, each with different culinary uses, from mashed potatoes to baked dishes."}
                {blockType === "Peanuts" &&
                  "Peanuts are legumes that are commonly grown for their oil and protein-rich nuts. They are a valuable source of healthy fats, protein, and various vitamins and minerals. Peanuts grow best in warm climates with sandy, well-drained soil. One of the key advantages of peanuts is their ability to enrich the soil with nitrogen, making them an excellent crop for rotation with other plants. They are also relatively easy to grow, requiring little maintenance after planting, and they yield well in small or large-scale farming."}
                {blockType === "Blackberries" &&
                  "Blackberries are nutrient-rich berries that are high in vitamin C, fiber, and antioxidants. They are typically grown on vines and thrive in temperate climates. One advantage of blackberries is their ability to produce multiple harvests from the same plant over a long season, making them a great crop for both small and large-scale gardens. Blackberries also have numerous health benefits, including improving heart health and reducing the risk of certain cancers. They can be eaten fresh, used in jams, or frozen for later use."}
                {blockType === "Blueberries" &&
                  "Blueberries are highly valued for their sweet flavor and rich nutritional profile, including high levels of antioxidants, particularly anthocyanins, which have been linked to improved brain health. Blueberries grow best in acidic, well-drained soil and in cool to temperate climates."}
                {blockType === "Strawberries" &&
                  "Strawberries are rich in vitamin C and antioxidants, which support immune health and skin health. Strawberries grow well in a variety of climates, with proper care, and can be planted as perennials, producing fruit each year once established. One of the main advantages of strawberries is their relatively quick harvest time—usually within the first few months of planting. They are highly productive, and home gardeners can harvest strawberries multiple times during the season."}
                {blockType === "Basil" &&
                  "Basil is a popular herb used in cooking. It has high levels of antioxidants and essential oils. Basil thrives in warm, sunny climates and can be grown in pots, making it suitable for small spaces. One of its main advantages is its ability to grow quickly, allowing for several harvests in a single growing season. Basil is easy to care for and is often used fresh, though it can also be dried or preserved in oil for later use."}
                {blockType === "Parsley" &&
                  "Parsley is a biennial herb known for its fresh, bright flavor and high content of vitamins A, C, and K. It’s commonly used as a garnish or in cooking. Parsley can be grown in a variety of climates but prefers cooler temperatures and well-drained soil. It also grows well in containers, making it perfect for small spaces or urban gardening. Additionally, parsley is known for its health benefits, including improving digestion and providing antioxidants."}
                {blockType === "Empty" &&
                  "Nothing to see here."}
                {/* Add more conditional info for each plant type as needed */}
              </Text>
            </ScrollView>
            <View style={styles.modalButtonContainer}>
              <Button title="Close" onPress={closeBlockScreen} />
            </View>
          </View>
        </View>
      </Modal>
    );
  };
 
  if (!grid) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
 
 
  // --------------------- Main Render ---------------------
  if (!grid) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading plot...</Text>
      </View>
    );
  }
 
  return (
    <View style={styles.container}>
      {editorMode ? renderEditorMode() : renderGardenView()}
      {selectedBlock && renderBlockModal()}
    </View>
  );
};
 
const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  editorContainer: { flex: 1 },
  gardenContainer: { justifyContent: 'center', alignItems: 'center' },
  editorButtonContainer: {
    position: 'absolute',
    top: 50,
    right: 30,
    padding: 10,
    backgroundColor: 'rgba(62, 36, 209, 0.9)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4CAF50',
    alignItems: 'center',
  },
  gardenButtonContainer: {
    position: 'absolute',
    top: 50,
    right: 30,
    padding: 10,
    backgroundColor: 'rgba(62, 36, 209, 0.9)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4CAF50',
    alignItems: 'center',
  },
  returnToMap: {
    position: 'absolute',
    top: 50,
    left: 30,
    padding: 10,
    backgroundColor: 'rgba(62, 36, 209, 0.9)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4CAF50',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    height: '75%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    padding: 10,
  },
  modalTopRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  plantImage: {
    width: 120,
    height: 120,
    borderRadius: 25,
    marginRight: 10,
    marginTop: 40,
  },
  modalInputs: { flex: 1 },
  textInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 15, marginTop: 5 },
  picker: { fontSize: 14, height: 150 },
  dateTimeSection: { marginVertical: 10, borderTopWidth: 1, borderColor: '#ccc', paddingTop: 10 },
  dateTimeRow: { marginVertical: 5 },
  infoSection: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 5,
    marginVertical: 10,
  },
  infoText: { fontSize: 16 },
  modalButtonContainer: { marginTop: 10 },
});
 
export default App;

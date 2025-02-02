import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../FirebaseConfig";

// plant options
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

// Modify GridCell to include plant data.
interface GridCell {
  isBlack: boolean;
  plantType?: string;
  plantName?: string;
  datePlanted?: Date | null;
  wateredDate?: Date | null;
  harvestedDate?: Date | null;
}

// Constants for grid dimensions and editor cell size
const GRID_ROWS = 20;
const GRID_COLS = 20;
const EDITOR_CELL_SIZE = 80;

const App: React.FC = () => {
  const [editorMode, setEditorMode] = useState<boolean>(false);
  
  // Initialize grid with extra plant data (all cells start as not dirt)
  const [grid, setGrid] = useState<GridCell[][]>(() =>
    Array.from({ length: GRID_ROWS }, () =>
      Array.from({ length: GRID_COLS }, () => ({
        isBlack: false,
        plantType: undefined,
        plantName: undefined,
        datePlanted: null,
        wateredDate: null,
        harvestedDate: null,
      }))
    )
  );
  
  // For the block modal:
  const [selectedBlock, setSelectedBlock] = useState<{ row: number; col: number } | null>(null);
  const [blockName, setBlockName] = useState<string>("");
  const [blockType, setBlockType] = useState<string>("Empty");
  const [datePlanted, setDatePlanted] = useState<Date | null>(null);
  const [wateredDate, setWateredDate] = useState<Date | null>(null);
  const [harvestedDate, setHarvestedDate] = useState<Date | null>(null);
  
  // Pan value and PanResponder for editor mode panning.
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { pan.extractOffset(); },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: () => { pan.flattenOffset(); },
    })
  ).current;
  
  const computeEditorRegion = () => {
    let minRow = GRID_ROWS, maxRow = -1, minCol = GRID_COLS, maxCol = -1;
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
  
  const toggleCell = (r: number, c: number) => {
    if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) return;
    const newGrid = grid.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        if (rowIndex === r && colIndex === c) {
          return {
            isBlack: !cell.isBlack,
            plantType: !cell.isBlack ? "empty" : undefined,
            plantName: !cell.isBlack ? "" : undefined,
            datePlanted: !cell.isBlack ? new Date() : null,
            wateredDate: null,
            harvestedDate: null,
          };
        }
        return cell;
      })
    );
    setGrid(newGrid);
  };
  
  useEffect(() => {
    if (editorMode) {
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
  }, [editorMode]);
  
  const openBlockScreen = (row: number, col: number) => {
    setSelectedBlock({ row, col });
    const cell = grid[row][col];
    setBlockName(cell.plantName || "");
    setBlockType(cell.plantType || "Empty");
    setDatePlanted(cell.datePlanted || null);
    setWateredDate(cell.wateredDate || null);
    setHarvestedDate(cell.harvestedDate || null);
  };
  
  const closeBlockScreen = () => {
    if (selectedBlock) {
      const { row, col } = selectedBlock;
      const newGrid = grid.map((gridRow, rowIndex) =>
        gridRow.map((cell, colIndex) => {
          if (rowIndex === row && colIndex === col) {
            return {
              ...cell,
              plantName: blockType === "Empty" ? undefined : blockName,
              plantType: blockType === "Empty" ? undefined : blockType,
              datePlanted: blockType === "Empty" ? null : datePlanted,
              wateredDate: blockType === "Empty" ? null : wateredDate,
              harvestedDate: blockType === "Empty" ? null : harvestedDate,
            };
          }
          return cell;
        })
      );
      setGrid(newGrid);
    }
    setSelectedBlock(null);
  };
  
  // --------------------- Render Editor Mode ---------------------
  const renderEditorMode = () => {
    const region = computeEditorRegion();
    const numRows = region.endRow - region.startRow + 1;
    const numCols = region.endCol - region.startCol + 1;
    return (
      // Wrap editor mode in an ImageBackground for the editor background
      <ImageBackground source={require('../../assets/editorBackground.png')} style={styles.editorContainer}>
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
                    <TouchableOpacity key={`cell-${r}-${c}`} onPress={() => toggleCell(r, c)}>
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
          <Button title="Exit Editor" onPress={() => setEditorMode(false)} />
        </View>
      </ImageBackground>
    );
  };
  
  // --------------------- Render Garden (Main) View ---------------------
  const renderGardenView = () => {
    const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
    const { startRow, endRow, startCol, endCol } = computeEditorRegion();
    const numRows = endRow - startRow + 1;
    const numCols = endCol - startCol + 1;
    const cellSize = Math.min(windowWidth / numCols, windowHeight / numRows);
    const containerWidth = cellSize * numCols;
    const containerHeight = cellSize * numRows;

    return (
      // Wrap main view in an ImageBackground for the main background.
      <ImageBackground source={require('../../assets/mainBackground.png')} style={[styles.gardenContainer, { width: windowWidth, height: windowHeight }]}>
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
                  itemStyle={styles.picker}
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
                Information about {blockType}:{'\n'}Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ac eros eget urna sollicitudin sagittis. Sed vitae justo vitae turpis imperdiet porta.
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
  
  return (
    <View style={styles.container}>
      {editorMode ? renderEditorMode() : renderGardenView()}
      {selectedBlock && renderBlockModal()}
    </View>
  );
};
  
const styles = StyleSheet.create({
  container: { flex: 1 },
  editorContainer: { flex: 1 },
  gardenContainer: { justifyContent: 'center', alignItems: 'center' },
  editorButtonContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 5,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 4,
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
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 15,
    marginTop: 5,
  },
  picker: { fontSize: 14, height: 150 },
  dateTimeSection: {
    marginVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingTop: 10,
  },
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
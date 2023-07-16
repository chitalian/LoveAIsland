import React, { useRef, useState, useEffect } from "react";
import { Stage, Container, Graphics, Sprite } from "@pixi/react";
import { Container as PixiContainer, Point, Rectangle } from "pixi.js";
import { PayloadToClient } from "../../backend/backendTypes";

export interface Tile {
  x: number;
  y: number;
  isSelected: boolean;
  isHovered: boolean;
}

const emojiList = [
  "assets/angel.png",
  "assets/blink.png",
  "assets/crazy.png",
  "assets/hugging.png",
  "assets/love-eyes.png",
  "assets/lovely.png",
  "assts/glasses.png"
]

const generateBoard = (size: number) => {
  const board: Array<{ x: number; y: number }> = [];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      board.push({ x, y });
    }
  }

  return board;
};



const squareToPixel = (x: number, y: number, tileSize: number, tileOffset: number): Point => {
  return new Point(x * (tileSize + tileOffset), y * (tileSize + tileOffset));
};

const drawSquare = (
  graphics: any,
  tile: Tile,
  tileSize: number,
  tileOffset: number,
  isSelected: boolean
) => {
  graphics.clear();
  const squarePos = squareToPixel(tile.x, tile.y, tileSize, tileOffset);

  const strokeWidth = 1;
  const strokeColor = isSelected ? 0x0000ff : 0x808080;
  const fillColor = 0xf0f0f0;

  const polygon = new Rectangle(squarePos.x, squarePos.y, tileSize, tileSize);
  graphics.lineStyle(strokeWidth, strokeColor);
  graphics.beginFill(fillColor);
  graphics.drawRect(polygon.x, polygon.y, polygon.width, polygon.height);
  graphics.endFill();
  return polygon;
};

interface BoardProps {
  god: boolean;
  gameState: PayloadToClient | undefined;
  tiles: any;
  objectMap: number[][];
}

const IslandMap: React.FC<BoardProps> = ({ god, gameState }) => {
  const [parentDimensions, setParentDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [board, setBoard] = useState<Tile[] | null>(null);
  const [loading, setLoading] = useState(false);
  const maskRef = useRef(null);

  let objectMap = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  if (gameState && gameState.agentStates) {
    const occupancy = Object.values(gameState.agentStates).map((agentState) => {
      const x = agentState.position[0];
      const y = agentState.position[1];
      const data = agentState.profileData;
      objectMap[x][y] = 1;
    });
  }

  useEffect(() => {
    if (!board) {
      setLoading(true);
      // Now generate a 11x11 board
      const board = generateBoard(11);
      // add isSelected and isHover fields to each tile
      const tiles = board.map((tile: any) => {
        return {
          ...tile,
          isSelected: false,
        };
      });

      setBoard(tiles);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const updateParentDimensions = () => {
      const parent = document.getElementById("hexagon-board-parent");
      if (parent) {
        setParentDimensions({
          width: parent.clientWidth,
          height: parent.clientHeight,
        });
      }
    };
    updateParentDimensions();
    window.addEventListener("resize", updateParentDimensions);

    return () => {
      window.removeEventListener("resize", updateParentDimensions);
    };
  }, []);

  const tileSize = parentDimensions.height / 11 * 0.9;
  const tileOffset = parentDimensions.height / 11 * 0.1;

  return board && objectMap ? (
    <Stage
      options={{ antialias: true, backgroundColor: 0xfcfaf8 }}
      width={parentDimensions.width}
      height={parentDimensions.height}
    >
      <Sprite
        image={"assets/love_island.png"}
        width={parentDimensions.height}
        height={parentDimensions.height}
        x={parentDimensions.width / 2 - 5.5 * (tileSize + tileOffset)}
        y={0}
      />
      <Container
        position={[
          parentDimensions.width / 2 - 5.5 * (tileSize + tileOffset),
          0,
        ]}
      >
        {board.map((tile, index) => {
          const hasObject = objectMap[tile.x][tile.y] === 1;
          const isSelected =
            tile.x === selectedTile?.x && tile.y === selectedTile?.y;
          const objectPosition = squareToPixel(tile.x, tile.y, tileSize, tileOffset);
          const objectOffset = { x: tileSize * 0.5, y: tileSize * 0.5 };

          return (
            <React.Fragment key={index}>
              <Graphics
                ref={maskRef}
                key={`square-${tile.x}-${tile.y}`}
                draw={(graphics) => {
                  const rectangle = drawSquare(
                    graphics,
                    tile,
                    tileSize,
                    tileOffset,
                    isSelected
                  );
                  graphics.hitArea = rectangle;
                }}
                //interactive
                pointerdown={() => setSelectedTile(tile)}
                alpha={0.1}
              />
              {/* This will draw the avatars */}
              {hasObject && (
                <Sprite
                  key={`object-${tile.x}-${tile.y}`}
                  image="/assets/loot-box-small.png"
                  x={objectPosition.x + objectOffset.x}
                  y={objectPosition.y + objectOffset.y}
                  anchor={new Point(0.5, 0.5)}
                  scale={new Point(0.25, 0.25)}
                  zIndex={100}
                />
              )}
            </React.Fragment>
          );
        })}
      </Container>
    </Stage>
  ) : null;
};

export default IslandMap;

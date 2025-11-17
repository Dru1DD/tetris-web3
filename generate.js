import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLORS = {
  I: "#00f0f0",
  J: "#0000f0",
  L: "#f0a000",
  O: "#f0f000",
  S: "#00f000",
  T: "#a000f0",
  Z: "#f00000",
};

const BLOCK_SIZE = 32; // px

//
// ------------------------------------------------------------
// 1) Генерация PNG квадратов для каждого блока
// ------------------------------------------------------------
async function generateBlockImages() {
  const blocksDir = path.join(__dirname, "public", "blocks");
  if (!fs.existsSync(blocksDir)) fs.mkdirSync(blocksDir, { recursive: true });

  for (const name in COLORS) {
    const outPath = path.join(blocksDir, `${name}.png`);

    const png = sharp({
      create: {
        width: BLOCK_SIZE,
        height: BLOCK_SIZE,
        channels: 4,
        background: COLORS[name],
      },
    })
      // тонкая рамка
      .composite([
        {
          input: Buffer.from(
            `<svg width="${BLOCK_SIZE}" height="${BLOCK_SIZE}">
               <rect x="0" y="0" width="${BLOCK_SIZE}" height="${BLOCK_SIZE}" 
                 fill="none" stroke="#222" stroke-width="3"/>
             </svg>`
          ),
          top: 0,
          left: 0,
        },
      ])
      .png();

    await png.toFile(outPath);
    console.log(`🧱 Block created: ${outPath}`);
  }
}

//
// ------------------------------------------------------------
// 2) Создание СПРАЙТА из сгенерированных PNG
// ------------------------------------------------------------
async function generateSprite() {
  const blocksDir = path.join(__dirname, "public", "blocks");
  const outImage = path.join(__dirname, "public", "sprite.png");
  const outJSON = path.join(__dirname, "public", "sprite.json");

  const files = fs.readdirSync(blocksDir).filter((f) => f.endsWith(".png"));

  const images = await Promise.all(
    files.map(async (file) => {
      const imgPath = path.join(blocksDir, file);
      const img = sharp(imgPath);
      const meta = await img.metadata();

      return {
        name: path.basename(file, ".png"),
        file,
        width: meta.width,
        height: meta.height,
      };
    })
  );

  const totalWidth = images.length * BLOCK_SIZE;
  const maxHeight = BLOCK_SIZE;

  const spriteMap = {};
  const composite = [];

  let x = 0;
  for (const img of images) {
    spriteMap[img.name] = {
      x,
      y: 0,
      width: img.width,
      height: img.height,
    };

    composite.push({
      input: path.join(__dirname, "public", "blocks", img.file),
      top: 0,
      left: x,
    });

    x += BLOCK_SIZE;
  }

  const canvas = sharp({
    create: {
      width: totalWidth,
      height: maxHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  await canvas.composite(composite).toFile(outImage);
  fs.writeFileSync(outJSON, JSON.stringify(spriteMap, null, 2));

  console.log("🎉 Sprite generated:", outImage);
  console.log("🗺 Map generated:", outJSON);
}

//
// ------------------------------------------------------------
// MAIN
// ------------------------------------------------------------
(async () => {
  console.log("🔧 Generating block PNG files...");
  await generateBlockImages();
  console.log("🔧 Creating sprite...");
  await generateSprite();
})();

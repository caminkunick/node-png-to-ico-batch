const fs = require("fs");
const pngToIco = require("png-to-ico");
const sharp = require("sharp");

const folderName = "./pngfilehere";

const resize = (path, size) =>
  new Promise((resolve) => {
    sharp(path)
      .resize(size, size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer()
      .then((buffer) => resolve(buffer))
      .catch(() => resolve(null));
  });

const imageToBuff = (path) => {
  return new Promise(async (resolve) => {
    const png16 = await resize(path, 16);
    const png32 = await resize(path, 32);
    const png64 = await resize(path, 64);
    const png128 = await resize(path, 128);

    if (png16 !== null) {
      await convert([png16, png32, png64, png128], path);
      resolve(true);
    } else {
      resolve(false);
    }
  });
};

const convert = (buffer, file) =>
  pngToIco(buffer)
    .then((buf) => {
      fs.writeFileSync(`${file.replace(".png", "")}.ico`, buf);
      return "OK";
    })
    .catch((error) => error.message);

exports.convert = () => {
  return new Promise((resolve) => {
    fs.readdir(folderName, async (err, files) => {
      const converting = files
        .filter((file) => file.includes("_sq") === false)
        .map(async (file) => {
          const path = await imageToBuff(`${folderName}/${file}`);
          return path;
        });
      resolve(await Promise.all(converting));
    });
  });
};

import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_TITOK = "nagyon_titkos_jwt_kulcs";

const adatbazisPool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", 
  database: "makett",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const alkalmazas = express();

alkalmazas.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
  })
);

alkalmazas.use(express.json());

function generalToken(felhasznalo) {
  return jwt.sign(
    {
      id: felhasznalo.id,
      felhasznalo_nev: felhasznalo.felhasznalo_nev,
      email: felhasznalo.email,
      szerepkor_id: felhasznalo.szerepkor_id,
    },
    JWT_TITOK,
    { expiresIn: "2h" }
  );
}

async function inicializalAdatbazis() {
  await adatbazisPool.query(`
    CREATE DATABASE IF NOT EXISTS makett
      CHARACTER SET utf8mb4
      COLLATE utf8mb4_hungarian_ci
  `);

  await adatbazisPool.query("USE makett");

  await adatbazisPool.query(`
    CREATE TABLE IF NOT EXISTS szerepkor (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nev VARCHAR(50) NOT NULL UNIQUE
    )
  `);

  await adatbazisPool.query(`
    INSERT INTO szerepkor (nev)
    VALUES ('admin'), ('felhasznalo')
    ON DUPLICATE KEY UPDATE nev = VALUES(nev)
  `);

  await adatbazisPool.query(`
    CREATE TABLE IF NOT EXISTS skala (
      id INT AUTO_INCREMENT PRIMARY KEY,
      jeloles VARCHAR(20) NOT NULL UNIQUE,
      megjegyzes VARCHAR(100) NULL
    )
  `);

  await adatbazisPool.query(`
    INSERT INTO skala (jeloles, megjegyzes)
    VALUES 
      ('1:35', 'Nagyobb pancelosok'),
      ('1:48', 'Kozepes meret'),
      ('1:72', 'Repulok, kisebb makettek'),
      ('1:700', 'Hajok, flotta meret')
    ON DUPLICATE KEY UPDATE megjegyzes = VALUES(megjegyzes)
  `);

  await adatbazisPool.query(`
    CREATE TABLE IF NOT EXISTS kategoria (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nev VARCHAR(50) NOT NULL UNIQUE,
      leiras VARCHAR(255) NULL
    )
  `);

  await adatbazisPool.query(`
    INSERT INTO kategoria (nev, leiras)
    VALUES
      ('tank', 'Lancos pancelosok'),
      ('hajo', 'Hajok, tengeralattjarok'),
      ('repulo', 'Legijarmuvek'),
      ('egyeb', 'Mas katonai tema')
    ON DUPLICATE KEY UPDATE leiras = VALUES(leiras)
  `);

  await adatbazisPool.query(`
    CREATE TABLE IF NOT EXISTS gyarto (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nev VARCHAR(100) NOT NULL UNIQUE,
      orszag VARCHAR(100) NULL,
      weboldal VARCHAR(255) NULL
    )
  `);

  await adatbazisPool.query(`
    INSERT INTO gyarto (nev, orszag)
    VALUES
      ('Tamiya', 'Japan'),
      ('Revell', 'Nemetorszag')
    ON DUPLICATE KEY UPDATE orszag = VALUES(orszag)
  `);

  await adatbazisPool.query(`
    CREATE TABLE IF NOT EXISTS felhasznalo (
      id INT AUTO_INCREMENT PRIMARY KEY,
      felhasznalo_nev VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      jelszo_hash VARCHAR(255) NOT NULL,
      regisztralva DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      aktiv TINYINT(1) NOT NULL DEFAULT 1,
      szerepkor_id INT NOT NULL,
      kedvenc_skala_id INT NULL,
      CONSTRAINT fk_felhasznalo_szerepkor
        FOREIGN KEY (szerepkor_id) REFERENCES szerepkor(id),
      CONSTRAINT fk_felhasznalo_kedvenc_skala
        FOREIGN KEY (kedvenc_skala_id) REFERENCES skala(id)
    )
  `);

  const demoJelszoHash = await bcrypt.hash("jelszo", 10);
  await adatbazisPool.query(`
    INSERT INTO felhasznalo (felhasznalo_nev, email, jelszo_hash, szerepkor_id)
    VALUES (
      'demo',
      'demo@pelda.hu',
      ?,
      (SELECT id FROM szerepkor WHERE nev = 'felhasznalo' LIMIT 1)
    )
    ON DUPLICATE KEY UPDATE email = VALUES(email)
  `, [demoJelszoHash]);

  await adatbazisPool.query(`
    CREATE TABLE IF NOT EXISTS makett (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nev VARCHAR(255) NOT NULL,
      leiras TEXT NULL,
      gyarto_id INT NOT NULL,
      kategoria_id INT NOT NULL,
      skala_id INT NOT NULL,
      nehezseg INT NOT NULL,
      megjelenes_ev INT NULL,
      keszlet_szam VARCHAR(50) NULL,
      ar DECIMAL(10,2) NULL,
      kep_url VARCHAR(500) NULL,
      letrehozta_felhasznalo_id INT NULL,
      letrehozva DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      aktiv TINYINT(1) NOT NULL DEFAULT 1,
      CONSTRAINT fk_makett_gyarto
        FOREIGN KEY (gyarto_id) REFERENCES gyarto(id),
      CONSTRAINT fk_makett_kategoria
        FOREIGN KEY (kategoria_id) REFERENCES kategoria(id),
      CONSTRAINT fk_makett_skala
        FOREIGN KEY (skala_id) REFERENCES skala(id),
      CONSTRAINT fk_makett_felhasznalo
        FOREIGN KEY (letrehozta_felhasznalo_id) REFERENCES felhasznalo(id)
    )
  `);

  await adatbazisPool.query(`
    CREATE TABLE IF NOT EXISTS velemeny (
      id INT AUTO_INCREMENT PRIMARY KEY,
      felhasznalo_id INT NULL,
      makett_id INT NOT NULL,
      cim VARCHAR(255) NULL,
      szoveg TEXT NOT NULL,
      ertekeles INT NOT NULL,
      letrehozva DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      modositva DATETIME NULL,
      CONSTRAINT fk_velemeny_felhasznalo
        FOREIGN KEY (felhasznalo_id) REFERENCES felhasznalo(id)
        ON DELETE SET NULL,
      CONSTRAINT fk_velemeny_makett
        FOREIGN KEY (makett_id) REFERENCES makett(id)
        ON DELETE CASCADE
    )
  `);

  await adatbazisPool.query(`
    CREATE TABLE IF NOT EXISTS kedvenc_makett (
      felhasznalo_id INT NOT NULL,
      makett_id INT NOT NULL,
      letrehozva DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (felhasznalo_id, makett_id),
      CONSTRAINT fk_kedvenc_felhasznalo
        FOREIGN KEY (felhasznalo_id) REFERENCES felhasznalo(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_kedvenc_makett
        FOREIGN KEY (makett_id) REFERENCES makett(id)
        ON DELETE CASCADE
    )
  `);

  await adatbazisPool.query(`
    CREATE TABLE IF NOT EXISTS makett_kep (
      id INT AUTO_INCREMENT PRIMARY KEY,
      makett_id INT NOT NULL,
      url VARCHAR(500) NOT NULL,
      leiras VARCHAR(255) NULL,
      sorrend_szam INT NOT NULL DEFAULT 1,
      CONSTRAINT fk_makett_kep_makett
        FOREIGN KEY (makett_id) REFERENCES makett(id)
        ON DELETE CASCADE
    )
  `);

  await adatbazisPool.query(`
    CREATE TABLE IF NOT EXISTS felhasznalo_makett_allapot (
      id INT AUTO_INCREMENT PRIMARY KEY,
      felhasznalo_id INT NOT NULL,
      makett_id INT NOT NULL,
      allapot VARCHAR(50) NOT NULL,
      megjegyzes VARCHAR(255) NULL,
      letrehozva DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_fma_felhasznalo
        FOREIGN KEY (felhasznalo_id) REFERENCES felhasznalo(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_fma_makett
        FOREIGN KEY (makett_id) REFERENCES makett(id)
        ON DELETE CASCADE
    )
  `);

  const [sorok] = await adatbazisPool.query(
    "SELECT COUNT(*) AS darab FROM makett"
  );
  if (sorok[0].darab === 0) {
    await adatbazisPool.query(`
      INSERT INTO makett (nev, gyarto_id, kategoria_id, skala_id, nehezseg, megjelenes_ev, keszlet_szam)
      VALUES
      (
        'T-34/85',
        (SELECT id FROM gyarto WHERE nev = 'Tamiya'),
        (SELECT id FROM kategoria WHERE nev = 'tank'),
        (SELECT id FROM skala WHERE jeloles = '1:35'),
        3,
        2019,
        '35138'
      ),
      (
        'Bismarck csatahajo',
        (SELECT id FROM gyarto WHERE nev = 'Revell'),
        (SELECT id FROM kategoria WHERE nev = 'hajo'),
        (SELECT id FROM skala WHERE jeloles = '1:700'),
        4,
        2021,
        '05040'
      )
    `);
    console.log("Alap makettek betoltve.");
  }
}

async function biztositsId(tabla, oszlop, ertek) {
  const [talalt] = await adatbazisPool.query(
    `SELECT id FROM ${tabla} WHERE ${oszlop} = ? LIMIT 1`,
    [ertek]
  );
  if (talalt.length > 0) {
    return talalt[0].id;
  }
  const [eredmeny] = await adatbazisPool.query(
    `INSERT INTO ${tabla} (${oszlop}) VALUES (?)`,
    [ertek]
  );
  return eredmeny.insertId;
}

alkalmazas.post("/api/auth/register", async (keres, valasz) => {
  const { felhasznalo_nev, email, jelszo, kedvencSkala } = keres.body || {};

  if (!felhasznalo_nev || !email || !jelszo) {
    return valasz
      .status(400)
      .json({ hiba: "Hianyzo kotelezo mezok (felhasznalo_nev, email, jelszo)." });
  }

  try {
    const [letezo] = await adatbazisPool.query(
      "SELECT id FROM felhasznalo WHERE email = ? OR felhasznalo_nev = ? LIMIT 1",
      [email, felhasznalo_nev]
    );
    if (letezo.length > 0) {
      return valasz
        .status(400)
        .json({ hiba: "Ilyen email vagy felhasznalonev mar letezik." });
    }

    const jelszoHash = await bcrypt.hash(jelszo, 10);
    let kedvencSkalaId = null;
    if (kedvencSkala) {
      kedvencSkalaId = await biztositsId("skala", "jeloles", kedvencSkala);
    }

    const [eredmeny] = await adatbazisPool.query(
      `INSERT INTO felhasznalo (felhasznalo_nev, email, jelszo_hash, szerepkor_id, kedvenc_skala_id)
       VALUES (?, ?, ?, (SELECT id FROM szerepkor WHERE nev = 'felhasznalo' LIMIT 1), ?)`,
      [felhasznalo_nev, email, jelszoHash, kedvencSkalaId]
    );

    valasz.status(201).json({ uzenet: "Sikeres regisztracio.", id: eredmeny.insertId });
  } catch (hiba) {
    console.error("Hiba /api/auth/register:", hiba);
    valasz.status(500).json({ hiba: "Adatbazis hiba." });
  }
});

alkalmazas.post("/api/auth/login", async (keres, valasz) => {
  const { email, jelszo } = keres.body || {};

  if (!email || !jelszo) {
    return valasz
      .status(400)
      .json({ hiba: "Hianyzo email vagy jelszo." });
  }

  try {
    const [talalat] = await adatbazisPool.query(
      "SELECT * FROM felhasznalo WHERE email = ? LIMIT 1",
      [email]
    );
    if (talalat.length === 0) {
      return valasz.status(401).json({ hiba: "Hibas email vagy jelszo." });
    }

    const felhasznalo = talalat[0];
    const jelszoOk = await bcrypt.compare(jelszo, felhasznalo.jelszo_hash);
    if (!jelszoOk) {
      return valasz.status(401).json({ hiba: "Hibas email vagy jelszo." });
    }

    const token = generalToken(felhasznalo);

    valasz.json({
      token,
      felhasznalo: {
        id: felhasznalo.id,
        felhasznalo_nev: felhasznalo.felhasznalo_nev,
        email: felhasznalo.email,
      },
    });
  } catch (hiba) {
    console.error("Hiba /api/auth/login:", hiba);
    valasz.status(500).json({ hiba: "Adatbazis hiba." });
  }
});

alkalmazas.get("/api/makettek", async (keres, valasz) => {
  try {
    const [sorok] = await adatbazisPool.query(
      `SELECT
         m.id,
         m.nev,
         g.nev AS gyarto,
         s.jeloles AS skala,
         k.nev AS kategori,
         m.nehezseg,
         m.megjelenes_ev,
         m.kep_url
       FROM makett m
       JOIN gyarto g ON m.gyarto_id = g.id
       JOIN kategoria k ON m.kategoria_id = k.id
       JOIN skala s ON m.skala_id = s.id
       WHERE m.aktiv = 1`
    );
    valasz.json(sorok);
  } catch (hiba) {
    console.error("Hiba /api/makettek:", hiba);
    valasz.status(500).json({ hiba: "Adatbazis hiba" });
  }
});

alkalmazas.post("/api/makettek", async (keres, valasz) => {
  try {
    const {
      nev,
      gyarto,
      skala,
      kategori,
      nehezseg,
      megjelenes_ev,
      kep_url,
      ar,
      keszlet_szam,
    } = keres.body;

    if (!nev || !gyarto || !skala || !kategori || !nehezseg) {
      return valasz
        .status(400)
        .json({ hiba: "Hianyzo kotelezo mezok." });
    }

    const gyartoId = await biztositsId("gyarto", "nev", gyarto);
    const kategoriaId = await biztositsId("kategoria", "nev", kategori);
    const skalaId = await biztositsId("skala", "jeloles", skala);

    const [eredmeny] = await adatbazisPool.query(
      `INSERT INTO makett
        (nev, gyarto_id, kategoria_id, skala_id, nehezseg, megjelenes_ev, kep_url, ar, keszlet_szam)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nev,
        gyartoId,
        kategoriaId,
        skalaId,
        Number(nehezseg),
        megjelenes_ev || null,
        kep_url || null,
        ar || null,
        keszlet_szam || null,
      ]
    );

    const ujMakett = {
      id: eredmeny.insertId,
      nev,
      gyarto,
      skala,
      kategori,
      nehezseg: Number(nehezseg),
      megjelenes_ev: megjelenes_ev || null,
      kep_url: kep_url || null,
    };

    valasz.status(201).json(ujMakett);
  } catch (hiba) {
    console.error("Hiba /api/makettek POST:", hiba);
    valasz.status(500).json({ hiba: "Adatbazis hiba" });
  }
});

alkalmazas.get("/api/makettek/:id/velemenyek", async (keres, valasz) => {
  const makettId = Number(keres.params.id);
  if (!makettId) {
    return valasz.status(400).json({ hiba: "Ervenytelen makett id." });
  }

  try {
    const [sorok] = await adatbazisPool.query(
      `SELECT
         v.id,
         v.makett_id,
         COALESCE(f.felhasznalo_nev, v.cim, 'Nevenincs') AS szerzo,
         v.ertekeles,
         v.szoveg,
         v.letrehozva
       FROM velemeny v
       LEFT JOIN felhasznalo f ON v.felhasznalo_id = f.id
       WHERE v.makett_id = ?
       ORDER BY v.letrehozva DESC`,
      [makettId]
    );
    valasz.json(sorok);
  } catch (hiba) {
    console.error("Hiba /api/makettek/:id/velemenyek:", hiba);
    valasz.status(500).json({ hiba: "Adatbazis hiba" });
  }
});

alkalmazas.post("/api/makettek/:id/velemenyek", async (keres, valasz) => {
  const makettId = Number(keres.params.id);
  if (!makettId) {
    return valasz.status(400).json({ hiba: "Ervenytelen makett id." });
  }

  const { szerzo, ertekeles, szoveg } = keres.body || {};

  if (!szoveg || !ertekeles) {
    return valasz
      .status(400)
      .json({ hiba: "Hianyzo ertekeles vagy szoveg." });
  }

  let felhasznaloId = null;
  const authHeader = keres.headers.authorization || keres.headers.Authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const payload = jwt.verify(token, JWT_TITOK);
      felhasznaloId = payload.id;
    } catch (e) {
      console.warn("Ervenytelen JWT token, anonim velemeny lesz.");
    }
  }

  const letrehozva = new Date();

  try {
    const [eredmeny] = await adatbazisPool.query(
      `INSERT INTO velemeny
        (felhasznalo_id, makett_id, cim, szoveg, ertekeles, letrehozva)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [felhasznaloId, makettId, szerzo || "Nevenincs", szoveg, Number(ertekeles), letrehozva]
    );

    const ujVelemeny = {
      id: eredmeny.insertId,
      makett_id: makettId,
      szerzo: szerzo || "Nevenincs",
      ertekeles: Number(ertekeles),
      szoveg,
      letrehozva,
    };

    valasz.status(201).json(ujVelemeny);
  } catch (hiba) {
    console.error("Hiba /api/makettek/:id/velemenyek POST:", hiba);
    valasz.status(500).json({ hiba: "Adatbazis hiba" });
  }
});

const PORT = 3001;

async function inditas() {
  try {
    await adatbazisPool.query("SELECT 1");
    console.log("Sikeres kapcsolat a MySQL adatbazissal.");

    await inicializalAdatbazis();

    alkalmazas.listen(PORT, () => {
      console.log(`Backend fut: http://localhost:${PORT}`);
    });
  } catch (hiba) {
    console.error("Nem sikerult csatlakozni a MySQL-hez:", hiba);
    process.exit(1);
  }
}

inditas();

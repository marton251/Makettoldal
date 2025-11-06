-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1:3307
-- Létrehozás ideje: 2025. Nov 06. 10:28
-- Kiszolgáló verziója: 10.4.28-MariaDB
-- PHP verzió: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `makettvelemenyezo`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `felhasznalok`
--

CREATE TABLE `felhasznalok` (
  `flhsznl_id` int(11) NOT NULL,
  `flhsznl_nev` varchar(45) NOT NULL,
  `flhsznl_keresztnev` varchar(45) NOT NULL,
  `flhsznl_vezeteknev` varchar(45) NOT NULL,
  `flhsznl_email` varchar(45) NOT NULL,
  `flhsznl_jelszo` varchar(60) NOT NULL,
  `flhsznl_regisztraciodatuma` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `forum`
--

CREATE TABLE `forum` (
  `frm_id` int(11) NOT NULL,
  `frm_cim` int(11) NOT NULL,
  `frm_leiras` int(11) NOT NULL,
  `frm_felhasznaloid` int(11) NOT NULL,
  `frm_datum` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `forum_hozaszolas`
--

CREATE TABLE `forum_hozaszolas` (
  `frmhzszls_id` int(11) NOT NULL,
  `frmhzszls_forumid` int(11) NOT NULL,
  `frmhzszls_felhasznaloid` int(11) NOT NULL,
  `frmhzszls_szoveg` varchar(3000) NOT NULL,
  `frmhzszls_datum` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `kedvencek`
--

CREATE TABLE `kedvencek` (
  `kdvnc_makettid` int(11) NOT NULL,
  `kdvnc_felhasznaloid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `makettek`
--

CREATE TABLE `makettek` (
  `mktt_id` int(11) NOT NULL,
  `mktt_nev` varchar(50) NOT NULL,
  `mktt_gyarto` varchar(50) NOT NULL,
  `mktt_kategoria` varchar(25) NOT NULL,
  `mktt_leiras` varchar(2000) NOT NULL,
  `mktt_kepurl` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `velemeny`
--

CREATE TABLE `velemeny` (
  `vlmny_id` int(11) NOT NULL,
  `vlmny_flehasznaloid` int(11) NOT NULL,
  `vlmny_makettid` int(11) NOT NULL,
  `vlmny_szoveg` varchar(3000) NOT NULL,
  `vlmny_ertekeles` int(11) NOT NULL,
  `vlmny_datum` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `felhasznalok`
--
ALTER TABLE `felhasznalok`
  ADD PRIMARY KEY (`flhsznl_id`);

--
-- A tábla indexei `forum`
--
ALTER TABLE `forum`
  ADD PRIMARY KEY (`frm_id`);

--
-- A tábla indexei `forum_hozaszolas`
--
ALTER TABLE `forum_hozaszolas`
  ADD PRIMARY KEY (`frmhzszls_id`);

--
-- A tábla indexei `makettek`
--
ALTER TABLE `makettek`
  ADD PRIMARY KEY (`mktt_id`);

--
-- A tábla indexei `velemeny`
--
ALTER TABLE `velemeny`
  ADD PRIMARY KEY (`vlmny_id`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `felhasznalok`
--
ALTER TABLE `felhasznalok`
  MODIFY `flhsznl_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `forum`
--
ALTER TABLE `forum`
  MODIFY `frm_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `forum_hozaszolas`
--
ALTER TABLE `forum_hozaszolas`
  MODIFY `frmhzszls_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `makettek`
--
ALTER TABLE `makettek`
  MODIFY `mktt_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `velemeny`
--
ALTER TABLE `velemeny`
  MODIFY `vlmny_id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

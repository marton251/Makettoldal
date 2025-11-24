-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2025. Nov 24. 22:03
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `makett`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `epitesi_naplo`
--

CREATE TABLE `epitesi_naplo` (
  `id` int(11) NOT NULL,
  `makett_id` int(11) NOT NULL,
  `felhasznalo_id` int(11) NOT NULL,
  `cim` varchar(200) NOT NULL,
  `leiras` text NOT NULL,
  `kep_url` varchar(255) DEFAULT NULL,
  `letrehozva` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `felhasznalo`
--

CREATE TABLE `felhasznalo` (
  `id` int(11) NOT NULL,
  `felhasznalo_nev` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `jelszo_hash` varchar(255) NOT NULL,
  `szerepkor_id` int(11) NOT NULL,
  `profil_kep_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `felhasznalo`
--

INSERT INTO `felhasznalo` (`id`, `felhasznalo_nev`, `email`, `jelszo_hash`, `szerepkor_id`, `profil_kep_url`) VALUES
(1, 'Admin', 'admin@pelda.hu', '$2a$10$2OnElbg0l8LSxiJI/RfhUeabEFSjEyIVWH1qLGF/.V0EEi6PARGwu', 2, NULL),
(2, 'Demó felhasználó', 'demo@pelda.hu', '$2a$10$n7fWUKsCtFng1h7dwJTRg.l4d3B1ql1F/sF4F.xvkPBJvuMAIS9N6', 1, NULL);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `forum_tema`
--

CREATE TABLE `forum_tema` (
  `id` int(11) NOT NULL,
  `cim` varchar(200) NOT NULL,
  `leiras` text DEFAULT NULL,
  `kategoria` varchar(100) DEFAULT NULL,
  `letrehozva` datetime NOT NULL DEFAULT current_timestamp(),
  `felhasznalo_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `forum_tema`
--

INSERT INTO `forum_tema` (`id`, `cim`, `leiras`, `kategoria`, `letrehozva`, `felhasznalo_id`) VALUES
(1, 'Proba', 'vahsvdvhavdvzvqawzuvdvhvPEHFVVHFVHVDHSA', 'építési napló', '2025-11-24 22:00:14', 1);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `forum_uzenet`
--

CREATE TABLE `forum_uzenet` (
  `id` int(11) NOT NULL,
  `tema_id` int(11) NOT NULL,
  `felhasznalo_id` int(11) NOT NULL,
  `szoveg` text NOT NULL,
  `letrehozva` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `kedvenc`
--

CREATE TABLE `kedvenc` (
  `felhasznalo_id` int(11) NOT NULL,
  `makett_id` int(11) NOT NULL,
  `letrehozva` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `makett`
--

CREATE TABLE `makett` (
  `id` int(11) NOT NULL,
  `nev` varchar(200) NOT NULL,
  `gyarto` varchar(200) NOT NULL,
  `kategoria` varchar(100) NOT NULL,
  `skala` varchar(50) NOT NULL,
  `nehezseg` int(11) NOT NULL,
  `megjelenes_eve` int(11) NOT NULL,
  `kep_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `makett`
--

INSERT INTO `makett` (`id`, `nev`, `gyarto`, `kategoria`, `skala`, `nehezseg`, `megjelenes_eve`, `kep_url`) VALUES
(1, 'T-34/85 szovjet közepes harckocsi', 'Zvezda', 'harckocsi', '1:35', 3, 2019, NULL),
(2, 'Bismarck csatahajó', 'Revell', 'hajó', '1:350', 4, 2015, NULL),
(3, 'Messerschmitt Bf 109', 'Airfix', 'repülő', '1:72', 2, 2020, NULL);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `szerepkor`
--

CREATE TABLE `szerepkor` (
  `id` int(11) NOT NULL,
  `nev` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `szerepkor`
--

INSERT INTO `szerepkor` (`id`, `nev`) VALUES
(2, 'admin'),
(1, 'felhasznalo');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `velemeny`
--

CREATE TABLE `velemeny` (
  `id` int(11) NOT NULL,
  `makett_id` int(11) NOT NULL,
  `felhasznalo_id` int(11) NOT NULL,
  `szoveg` text NOT NULL,
  `ertekeles` int(11) NOT NULL,
  `letrehozva` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `velemeny`
--

INSERT INTO `velemeny` (`id`, `makett_id`, `felhasznalo_id`, `szoveg`, `ertekeles`, `letrehozva`) VALUES
(1, 2, 1, 'pROBA', 5, '2025-11-24 22:01:23'),
(2, 2, 1, 'PROBA2', 5, '2025-11-24 22:01:44');

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `epitesi_naplo`
--
ALTER TABLE `epitesi_naplo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_epitesi_makett` (`makett_id`),
  ADD KEY `fk_epitesi_felhasznalo` (`felhasznalo_id`);

--
-- A tábla indexei `felhasznalo`
--
ALTER TABLE `felhasznalo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_felhasznalo_szerepkor` (`szerepkor_id`);

--
-- A tábla indexei `forum_tema`
--
ALTER TABLE `forum_tema`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_forumtema_felhasznalo` (`felhasznalo_id`);

--
-- A tábla indexei `forum_uzenet`
--
ALTER TABLE `forum_uzenet`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_forumuzenet_tema` (`tema_id`),
  ADD KEY `fk_forumuzenet_felhasznalo` (`felhasznalo_id`);

--
-- A tábla indexei `kedvenc`
--
ALTER TABLE `kedvenc`
  ADD PRIMARY KEY (`felhasznalo_id`,`makett_id`),
  ADD KEY `fk_kedvenc_makett` (`makett_id`);

--
-- A tábla indexei `makett`
--
ALTER TABLE `makett`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `szerepkor`
--
ALTER TABLE `szerepkor`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nev` (`nev`);

--
-- A tábla indexei `velemeny`
--
ALTER TABLE `velemeny`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_velemeny_makett` (`makett_id`),
  ADD KEY `fk_velemeny_felhasznalo` (`felhasznalo_id`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `epitesi_naplo`
--
ALTER TABLE `epitesi_naplo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `felhasznalo`
--
ALTER TABLE `felhasznalo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT a táblához `forum_tema`
--
ALTER TABLE `forum_tema`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT a táblához `forum_uzenet`
--
ALTER TABLE `forum_uzenet`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `makett`
--
ALTER TABLE `makett`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT a táblához `szerepkor`
--
ALTER TABLE `szerepkor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT a táblához `velemeny`
--
ALTER TABLE `velemeny`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `epitesi_naplo`
--
ALTER TABLE `epitesi_naplo`
  ADD CONSTRAINT `fk_epitesi_felhasznalo` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalo` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_epitesi_makett` FOREIGN KEY (`makett_id`) REFERENCES `makett` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `felhasznalo`
--
ALTER TABLE `felhasznalo`
  ADD CONSTRAINT `fk_felhasznalo_szerepkor` FOREIGN KEY (`szerepkor_id`) REFERENCES `szerepkor` (`id`);

--
-- Megkötések a táblához `forum_tema`
--
ALTER TABLE `forum_tema`
  ADD CONSTRAINT `fk_forumtema_felhasznalo` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalo` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `forum_uzenet`
--
ALTER TABLE `forum_uzenet`
  ADD CONSTRAINT `fk_forumuzenet_felhasznalo` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalo` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_forumuzenet_tema` FOREIGN KEY (`tema_id`) REFERENCES `forum_tema` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `kedvenc`
--
ALTER TABLE `kedvenc`
  ADD CONSTRAINT `fk_kedvenc_felhasznalo` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalo` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_kedvenc_makett` FOREIGN KEY (`makett_id`) REFERENCES `makett` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `velemeny`
--
ALTER TABLE `velemeny`
  ADD CONSTRAINT `fk_velemeny_felhasznalo` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalo` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_velemeny_makett` FOREIGN KEY (`makett_id`) REFERENCES `makett` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

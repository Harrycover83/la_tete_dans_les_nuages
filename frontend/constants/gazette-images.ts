/**
 * Mapping des images locales de la gazette TDLN.
 * Les noms de fichiers sont stockés dans la DB (coverImage),
 * et résolus ici en require() pour un chargement hors-ligne garanti.
 */
const GAZETTE_IMAGES: Record<string, number> = {
  'laser-game.jpg':        require('../assets/images/gazette/laser-game.jpg'),
  'vr-coaster.jpg':        require('../assets/images/gazette/vr-coaster.jpg'),
  'vr-attraction.jpg':     require('../assets/images/gazette/vr-attraction.jpg'),
  'arcade-pacman.jpg':     require('../assets/images/gazette/arcade-pacman.jpg'),
  'arcade-header.jpg':     require('../assets/images/gazette/arcade-header.jpg'),
  'basketball.jpg':        require('../assets/images/gazette/basketball.jpg'),
  'kids-vr.jpg':           require('../assets/images/gazette/kids-vr.jpg'),
  'families.jpg':          require('../assets/images/gazette/families.jpg'),
  'saint-valentin.jpg':    require('../assets/images/gazette/saint-valentin.jpg'),
  'carte-cadeau.jpg':      require('../assets/images/gazette/carte-cadeau.jpg'),
  'nouvelle-salle.jpg':    require('../assets/images/gazette/nouvelle-salle.jpg'),
  'tournoi-vr.jpg':        require('../assets/images/gazette/tournoi-vr.jpg'),
  'news-welcome.jpg':      require('../assets/images/gazette/news-welcome.jpg'),
  'news-2.jpg':            require('../assets/images/gazette/news-2.jpg'),
  'news-9.jpg':            require('../assets/images/gazette/news-9.jpg'),
  'couv.jpg':              require('../assets/images/gazette/couv.jpg'),
  'interieur.jpg':         require('../assets/images/gazette/interieur.jpg'),
  'slider.jpg':            require('../assets/images/gazette/slider.jpg'),
  'vignette-vr.jpg':       require('../assets/images/gazette/vignette-vr.jpg'),
  'vignette-arcade.jpg':   require('../assets/images/gazette/vignette-arcade.jpg'),
  'vignette-experience.jpg': require('../assets/images/gazette/vignette-experience.jpg'),
};

export default GAZETTE_IMAGES;

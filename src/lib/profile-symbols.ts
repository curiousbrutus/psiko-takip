
export type ProfileSymbol = {
  emoji: string;
  name: string;
  description: string;
};

export const profileSymbols: ProfileSymbol[] = [
  { emoji: '🧠', name: 'Beyin', description: 'Zihinsel gelişim ve farkındalık yolculuğunu simgeler.' },
  { emoji: '🌿', name: 'Yaprak', description: 'Büyüme, yenilenme ve iyileşme sürecini temsil eder.' },
  { emoji: '💡', name: 'Ampul', description: 'Yeni fikirleri, aydınlanma anlarını ve içgörüleri ifade eder.' },
  { emoji: '🌈', name: 'Gökkuşağı', description: 'Umut, zorlukların ardından gelen güzellik ve çeşitliliği simgeler.' },
  { emoji: '🐢', name: 'Kaplumbağa', description: 'Sabır, kararlılık ve yolculuğun kendi hızında değerli olduğunu hatırlatır.' },
  { emoji: '🔒', name: 'Kilit', description: 'Güven, mahremiyet ve kişisel sınırların önemini temsil eder.' },
  { emoji: '🌀', name: 'Spiral', description: 'Duyguların ve düşüncelerin derinlemesine keşfini ve içsel yolculuğu simgeler.' },
  { emoji: '🎯', name: 'Hedef', description: 'Terapi hedeflerine odaklanmayı ve kararlılığı ifade eder.' },
];

export const getRandomSymbol = (): ProfileSymbol => {
  const randomIndex = Math.floor(Math.random() * profileSymbols.length);
  return profileSymbols[randomIndex];
};

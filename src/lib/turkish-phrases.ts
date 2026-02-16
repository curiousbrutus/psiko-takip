// Turkish motivational phrases and cultural elements for mental health app

export interface TurkishPhrase {
  text: string;
  meaning: string;
  context: 'motivation' | 'comfort' | 'progress' | 'wisdom';
}

export const turkishPhrases: TurkishPhrase[] = [
  {
    text: 'Yavaş yavaş, ama emin adımlarla',
    meaning: 'Slowly but surely',
    context: 'progress',
  },
  {
    text: 'Her yeni gün, yeni bir başlangıç',
    meaning: 'Every new day is a new beginning',
    context: 'motivation',
  },
  {
    text: 'Sabır, tüm kapıları açar',
    meaning: 'Patience opens all doors',
    context: 'wisdom',
  },
  {
    text: 'Sen yalnız değilsin',
    meaning: 'You are not alone',
    context: 'comfort',
  },
  {
    text: 'Güçlü olmak, mükemmel olmak demek değil',
    meaning: "Being strong doesn't mean being perfect",
    context: 'wisdom',
  },
  {
    text: 'Her küçük adım, büyük yolculuğun parçası',
    meaning: 'Every small step is part of a great journey',
    context: 'progress',
  },
  {
    text: 'İçindeki gücü keşfetme zamanı',
    meaning: 'Time to discover your inner strength',
    context: 'motivation',
  },
  {
    text: 'Kendi hızında ilerle, karşılaştırma yapma',
    meaning: "Go at your own pace, don't compare",
    context: 'wisdom',
  },
];

export const getRandomPhrase = (
  context?: TurkishPhrase['context']
): TurkishPhrase => {
  const filtered = context
    ? turkishPhrases.filter(p => p.context === context)
    : turkishPhrases;
  return filtered[Math.floor(Math.random() * filtered.length)];
};

export const getTurkishEmoji = (
  emotion: 'happy' | 'calm' | 'progress' | 'support'
): string => {
  const emojiMap = {
    happy: '🌟',
    calm: '🌸',
    progress: '🌱',
    support: '🤗',
  };
  return emojiMap[emotion];
};

// Turkish mental health terminology
export const turkishMentalHealthTerms = {
  mood: 'Ruh Hali',
  progress: 'İlerleme',
  support: 'Destek',
  growth: 'Gelişim',
  healing: 'İyileşme',
  strength: 'Güç',
  peace: 'Huzur',
  balance: 'Denge',
  wellness: 'Esenlik',
  journey: 'Yolculuk',
};

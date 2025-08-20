export type BurnoutQuestion = {
  id: number;
  category: string;
  options: {
    score: number;
    text: string;
  }[];
};

export const burnoutQuestions: BurnoutQuestion[] = [
  {
    id: 1,
    category: 'Duygusal Tükenme',
    options: [
      {
        score: 0,
        text: 'İşimden dolayı duygusal olarak tükendiğimi hissetmiyorum.',
      },
      { score: 1, text: 'İşim nedeniyle kendimi tükenmiş hissediyorum.' },
      { score: 2, text: 'Günün sonunda kendimi bitkin hissediyorum.' },
      {
        score: 3,
        text: 'Sabah kalkıp bir gün daha aynı şeylerle yüzleşmekten yoruldum.',
      },
    ],
  },
  {
    id: 2,
    category: 'Duyarsızlaşma',
    options: [
      { score: 0, text: 'İşime karşı her zamanki gibi ilgiliyim.' },
      { score: 1, text: 'İşime karşı eskisinden daha duyarsız hale geldim.' },
      {
        score: 2,
        text: 'İşimden soğuduğumu ve alaycı davrandığımı hissediyorum.',
      },
      {
        score: 3,
        text: 'Bu işin beni duygusal olarak katılaştırdığından endişe ediyorum.',
      },
    ],
  },
  {
    id: 3,
    category: 'Kişisel Başarı',
    options: [
      { score: 0, text: 'İşimde başardığım şeylerden memnunum.' },
      { score: 1, text: 'İşimde daha fazlasını başarmış olmayı dilerdim.' },
      {
        score: 2,
        text: 'İşimde giderek daha az etkili olduğumu hissediyorum.',
      },
      {
        score: 3,
        text: 'Yaptığım işin bir değerinin kalmadığını hissediyorum.',
      },
    ],
  },
  {
    id: 4,
    category: 'Enerji Seviyesi',
    options: [
      { score: 0, text: 'İşim için yeterli enerjim var.' },
      { score: 1, text: 'İş gününün sonunda enerjim tükenmiş oluyor.' },
      { score: 2, text: 'İşim bende çok az enerji bırakıyor.' },
      { score: 3, text: 'Tüm enerjimi işimde harcadığımı hissediyorum.' },
    ],
  },
  {
    id: 5,
    category: 'Stresle Başa Çıkma',
    options: [
      { score: 0, text: 'İşimin stresiyle etkili bir şekilde başa çıkıyorum.' },
      { score: 1, text: 'Son zamanlarda iş stresi beni daha fazla zorluyor.' },
      { score: 2, text: 'İşimin yarattığı stres beni bunaltıyor.' },
      { score: 3, text: 'Artık işimin stresiyle başa çıkacak gücüm kalmadı.' },
    ],
  },
];

export type BeckQuestion = {
  id: number;
  category: string;
  options: {
    score: number;
    text: string;
  }[];
};

export const beckQuestions: BeckQuestion[] = [
  {
    id: 1,
    category: "Üzüntü",
    options: [
      { score: 0, text: "Kendimi üzgün hissetmiyorum." },
      { score: 1, text: "Çoğu zaman üzgünüm." },
      { score: 2, text: "Her zaman üzgünüm." },
      { score: 3, text: "O kadar üzgün ve mutsuzum ki dayanamıyorum." }
    ]
  },
  {
    id: 2,
    category: "Karamsarlık",
    options: [
      { score: 0, text: "Gelecek hakkında özellikle karamsar veya umutsuz değilim." },
      { score: 1, text: "Gelecek hakkında eskisinden daha karamsarım." },
      { score: 2, text: "İşlerin benim için yoluna gireceğini beklemiyorum." },
      { score: 3, text: "Geleceğin umutsuz olduğunu ve hiçbir şeyin düzelmeyeceğini hissediyorum." }
    ]
  },
  {
    id: 3,
    category: "Geçmişteki Başarısızlık",
    options: [
      { score: 0, text: "Kendimi başarısız hissetmiyorum." },
      { score: 1, text: "Gereğinden fazla başarısız oldum." },
      { score: 2, text: "Hayatıma dönüp baktığımda gördüğüm tek şey bir sürü başarısızlık." },
      { score: 3, text: "Kişi olarak tam bir başarısızlık olduğumu hissediyorum." }
    ]
  },
  {
    id: 4,
    category: "Keyif Alamama",
    options: [
      { score: 0, text: "Zevk aldığım şeylerden eskisi kadar zevk alıyorum." },
      { score: 1, text: "Eskiden olduğu gibi zevk almıyorum." },
      { score: 2, text: "Eskiden zevk aldığım şeylerden çok az zevk alıyorum." },
      { score: 3, text: "Eskiden zevk aldığım şeylerden hiç zevk alamıyorum." }
    ]
  },
  {
    id: 5,
    category: "Suçluluk Duyguları",
    options: [
      { score: 0, text: "Özellikle suçlu hissetmiyorum." },
      { score: 1, text: "Yaptığım ya da yapmam gereken birçok şeyden dolayı suçluluk duyuyorum." },
      { score: 2, text: "Çoğu zaman kendimi oldukça suçlu hissediyorum." },
      { score: 3, text: "Her zaman kendimi suçlu hissediyorum." }
    ]
  },
  {
    id: 6,
    category: "Cezalandırılma Hisleri",
    options: [
      { score: 0, text: "Cezalandırıldığımı hissetmiyorum." },
      { score: 1, text: "Cezalandırılabileceğimi hissediyorum." },
      { score: 2, text: "Cezalandırılmayı bekliyorum." },
      { score: 3, text: "Cezalandırıldığımı hissediyorum." }
    ]
  },
  {
    id: 7,
    category: "Kendinden Hoşlanmama",
    options: [
      { score: 0, text: "Kendimle ilgili her zamanki gibi hissediyorum." },
      { score: 1, text: "Kendime olan güvenimi kaybettim." },
      { score: 2, text: "Kendimde hayal kırıklığına uğradım." },
      { score: 3, text: "Kendimden hoşlanmıyorum." }
    ]
  },
  {
    id: 8,
    category: "Kendini Eleştirme",
    options: [
      { score: 0, text: "Kendimi normalden fazla eleştirmiyor veya suçlamıyorum." },
      { score: 1, text: "Kendime karşı eskisinden daha eleştirelim." },
      { score: 2, text: "Tüm hatalarım için kendimi eleştiriyorum." },
      { score: 3, text: "Olan her kötü şey için kendimi suçluyorum." }
    ]
  },
  {
    id: 9,
    category: "İntihar Düşünceleri veya İstekleri",
    options: [
      { score: 0, text: "Kendimi öldürmek gibi bir düşüncem yok." },
      { score: 1, text: "Kendimi öldürmeyi düşünüyorum ama bunu yapmam." },
      { score: 2, text: "Kendimi öldürmek isterdim." },
      { score: 3, text: "Fırsatım olsa kendimi öldürürdüm." }
    ]
  },
  {
    id: 10,
    category: "Ağlama",
    options: [
      { score: 0, text: "Eskisinden daha fazla ağlamıyorum." },
      { score: 1, text: "Eskisinden daha fazla ağlıyorum." },
      { score: 2, text: "Her küçük şeye ağlıyorum." },
      { score: 3, text: "Ağlamak istiyorum ama ağlayamıyorum." }
    ]
  },
  {
    id: 11,
    category: "Huzursuzluk",
    options: [
      { score: 0, text: "Normalden daha huzursuz veya gergin değilim." },
      { score: 1, text: "Normalden daha huzursuz veya gergin hissediyorum." },
      { score: 2, text: "O kadar huzursuz ve tedirginim ki yerimde durmakta zorlanıyorum." },
      { score: 3, text: "O kadar huzursuz ve tedirginim ki sürekli hareket etmek veya bir şeyler yapmak zorundayım." }
    ]
  },
  {
    id: 12,
    category: "İlgi Kaybı",
    options: [
      { score: 0, text: "Diğer insanlara veya etkinliklere olan ilgimi kaybetmedim." },
      { score: 1, text: "Diğer insanlara veya şeylere eskisinden daha az ilgi duyuyorum." },
      { score: 2, text: "Diğer insanlara olan ilgimin çoğunu kaybettim ve onlara karşı çok az şey hissediyorum." },
      { score: 3, text: "Diğer insanlara olan tüm ilgimi kaybettim ve onları hiç umursamıyorum." }
    ]
  },
  {
    id: 13,
    category: "Kararsızlık",
    options: [
      { score: 0, text: "Kararlarımı her zamanki gibi iyi veriyorum." },
      { score: 1, text: "Karar vermekte normalden daha çok zorlanıyorum." },
      { score: 2, text: "Eskisine göre karar vermekte çok daha fazla zorlanıyorum." },
      { score: 3, text: "Artık hiç karar veremiyorum." }
    ]
  },
  {
    id: 14,
    category: "Değersizlik",
    options: [
      { score: 0, text: "Kendimi değersiz hissetmiyorum." },
      { score: 1, text: "Kendimi eskisi kadar değerli ve yararlı görmüyorum." },
      { score: 2, text: "Diğer insanlara kıyasla kendimi daha değersiz hissediyorum." },
      { score: 3, text: "Kendimi tamamen değersiz hissediyorum." }
    ]
  },
  {
    id: 15,
    category: "Enerji Kaybı",
    options: [
      { score: 0, text: "Her zamanki kadar enerjim var." },
      { score: 1, text: "Eskisinden daha az enerjim var." },
      { score: 2, text: "Çok fazla bir şey yapacak enerjim yok." },
      { score: 3, text: "Hiçbir şey yapacak enerjim yok." }
    ]
  },
  {
    id: 16,
    category: "Uyku Düzenindeki Değişiklikler",
    options: [
      { score: 0, text: "Uyku düzenimde herhangi bir değişiklik yaşamadım." },
      { score: 1, text: "Normalden biraz daha fazla veya daha az uyuyorum." },
      { score: 2, text: "Normalden çok daha fazla veya daha az uyuyorum." },
      { score: 3, text: "Günün çoğunda uyuyorum veya 1-2 saat erken uyanıyorum ve tekrar uyuyamıyorum." }
    ]
  },
  {
    id: 17,
    category: "Sinirlilik",
    options: [
      { score: 0, text: "Normalden daha sinirli değilim." },
      { score: 1, text: "Normalden daha sinirliyim." },
      { score: 2, text: "Normalden çok daha sinirliyim." },
      { score: 3, text: "Her zaman sinirliyim." }
    ]
  },
  {
    id: 18,
    category: "İştah Değişiklikleri",
    options: [
      { score: 0, text: "İştahımda herhangi bir değişiklik yaşamadım." },
      { score: 1, text: "İştahım normalden biraz daha az veya daha fazla." },
      { score: 2, text: "İştahım normalden çok daha az veya daha fazla." },
      { score: 3, text: "Hiç iştahım yok ya da sürekli yemek aşeriyorum." }
    ]
  },
  {
    id: 19,
    category: "Konsantrasyon Güçlüğü",
    options: [
      { score: 0, text: "Her zamanki gibi konsantre olabiliyorum." },
      { score: 1, text: "Normaldeki gibi konsantre olamıyorum." },
      { score: 2, text: "Zihnimi uzun süre bir şeye odaklamak zor." },
      { score: 3, text: "Hiçbir şeye konsantre olamadığımı fark ettim." }
    ]
  },
  {
    id: 20,
    category: "Yorgunluk veya Bitkinlik",
    options: [
      { score: 0, text: "Normalden daha yorgun veya bitkin değilim." },
      { score: 1, text: "Normalden daha kolay yoruluyor veya bitkin düşüyorum." },
      { score: 2, text: "Eskiden yaptığım birçok şeyi yapamayacak kadar yorgun veya bitkinim." },
      { score: 3, text: "Eskiden yaptığım şeylerin çoğunu yapamayacak kadar yorgun veya bitkinim." }
    ]
  },
  {
    id: 21,
    category: "Cinselliğe İlgi Kaybı",
    options: [
      { score: 0, text: "Cinselliğe olan ilgimde son zamanlarda bir değişiklik fark etmedim." },
      { score: 1, text: "Cinselliğe eskisinden daha az ilgi duyuyorum." },
      { score: 2, text: "Şimdi cinselliğe çok daha az ilgi duyuyorum." },
      { score: 3, text: "Cinselliğe olan ilgimi tamamen kaybettim." }
    ]
  }
];

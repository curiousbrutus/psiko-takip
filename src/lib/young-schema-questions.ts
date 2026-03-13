export type YoungSchemaQuestion = {
  id: number;
  schema: string;
  statement: string;
  options: {
    score: number;
    text: string;
  }[];
};

export const youngSchemaOptions = [
  { score: 1, text: 'Beni hiç tanımlamıyor.' },
  { score: 2, text: 'Beni çok az tanımlıyor.' },
  { score: 3, text: 'Beni biraz tanımlıyor.' },
  { score: 4, text: 'Beni orta düzeyde tanımlıyor.' },
  { score: 5, text: 'Beni oldukça iyi tanımlıyor.' },
  { score: 6, text: 'Beni çok güçlü biçimde tanımlıyor.' },
];

const createQuestion = (
  id: number,
  schema: string,
  statement: string
): YoungSchemaQuestion => ({
  id,
  schema,
  statement,
  options: youngSchemaOptions,
});

export const youngSchemaQuestions: YoungSchemaQuestion[] = [
  createQuestion(1, 'Duygusal Yoksunluk', 'İhtiyaç duyduğum duygusal desteği çoğu zaman alamam.'),
  createQuestion(2, 'Duygusal Yoksunluk', 'Yakın ilişkilerimde anlaşılmadığımı hissederim.'),

  createQuestion(3, 'Terk Edilme', 'Yakın olduğum kişilerin bir gün beni bırakacağından korkarım.'),
  createQuestion(4, 'Terk Edilme', 'İnsanlar uzaklaştığında yoğun kaygı yaşarım.'),

  createQuestion(5, 'Güvensizlik / Kötüye Kullanılma', 'İnsanların beni incitebileceğine karşı tetikte olurum.'),
  createQuestion(6, 'Güvensizlik / Kötüye Kullanılma', 'Başkalarının niyetine kolay kolay güvenmem.'),

  createQuestion(7, 'Sosyal İzolasyon', 'Kendimi çoğu grupta dışarıda kalmış hissederim.'),
  createQuestion(8, 'Sosyal İzolasyon', 'Diğer insanlardan farklı ve uzak hissederim.'),

  createQuestion(9, 'Kusurluluk / Utanç', 'Yakından tanınırsam sevilmeyecek biri olduğum ortaya çıkar diye düşünürüm.'),
  createQuestion(10, 'Kusurluluk / Utanç', 'Hatalarım nedeniyle içten içe utanç hissederim.'),

  createQuestion(11, 'Başarısızlık', 'Akranlarıma göre daha yetersiz olduğumu düşünürüm.'),
  createQuestion(12, 'Başarısızlık', 'Önemli hedeflerde başarısız olacağıma dair inancım yüksektir.'),

  createQuestion(13, 'Bağımlılık / Yetersizlik', 'Günlük kararlar için bile sık sık başkalarının onayına ihtiyaç duyarım.'),
  createQuestion(14, 'Bağımlılık / Yetersizlik', 'Tek başıma sorumluluk almak beni zorlar.'),

  createQuestion(15, 'Zarar Görmeye Karşı Dayanıksızlık', 'Beklenmedik bir felaket olacakmış gibi sık sık endişelenirim.'),
  createQuestion(16, 'Zarar Görmeye Karşı Dayanıksızlık', 'Sağlık, güvenlik veya para konularında aşırı tehdit algılarım.'),

  createQuestion(17, 'İç İçe Geçme / Gelişmemiş Benlik', 'Yakın olduğum insanların duygularından ayrışmakta zorlanırım.'),
  createQuestion(18, 'İç İçe Geçme / Gelişmemiş Benlik', 'Kendi kimliğimi net biçimde hissetmekte zorlandığım olur.'),

  createQuestion(19, 'Boyun Eğicilik', 'Çatışma çıkmasın diye kendi isteklerimi geri plana atarım.'),
  createQuestion(20, 'Boyun Eğicilik', 'Hayır demekte zorlandığım için istemediğim şeyleri kabul ederim.'),

  createQuestion(21, 'Kendini Feda', 'Başkalarının ihtiyaçlarını kendi ihtiyaçlarımdan öne koyarım.'),
  createQuestion(22, 'Kendini Feda', 'Kendime zaman ayırınca suçluluk hissedebilirim.'),

  createQuestion(23, 'Duyguları Bastırma', 'Duygularımı gösterirsem zayıf görüneceğimden çekinirim.'),
  createQuestion(24, 'Duyguları Bastırma', 'Öfke, üzüntü veya sevincimi çoğu zaman kontrol altında tutarım.'),

  createQuestion(25, 'Yüksek Standartlar', 'Kendimden sürekli çok yüksek performans beklerim.'),
  createQuestion(26, 'Yüksek Standartlar', 'Mükemmel olmayınca kendime karşı çok sert olurum.'),

  createQuestion(27, 'Haklılık / Büyüklenmecilik', 'Kuralların bazen benim için esnetilebileceğini düşünürüm.'),
  createQuestion(28, 'Haklılık / Büyüklenmecilik', 'Beklentilerimin hızlıca karşılanmaması beni çok zorlar.'),

  createQuestion(29, 'Yetersiz Özdenetim', 'Anlık dürtülerimi ertelemekte zorlanırım.'),
  createQuestion(30, 'Yetersiz Özdenetim', 'Zorlayıcı görevlerde çabuk vazgeçebilirim.'),

  createQuestion(31, 'Onay Arayıcılık', 'Kararlarımda başkalarının takdiri belirleyici olur.'),
  createQuestion(32, 'Onay Arayıcılık', 'Eleştirilmekten kaçınmak için kendimi fazla uyarlayabilirim.'),

  createQuestion(33, 'Karamsarlık', 'Olumlu şeylerden çok olumsuz ihtimallere odaklanırım.'),
  createQuestion(34, 'Karamsarlık', 'İyi giden şeylerin uzun sürmeyeceğine dair beklentim olur.'),

  createQuestion(35, 'Cezalandırıcılık', 'Kendim veya başkaları hata yaptığında sert bedeller olması gerektiğini düşünürüm.'),
  createQuestion(36, 'Cezalandırıcılık', 'Hataları affetmekte zorlandığım olur.'),
];


export type EducationModule = {
  slug: string;
  title: string;
  description: string;
  content: string; // Markdown or plain text
};

export const educationModules: EducationModule[] = [
  {
    slug: 'tukemislik-ve-basa-cikma',
    title: 'Tükenmişlik Nedir ve Nasıl Başa Çıkılır?',
    description: 'Tükenmişlik sendromunun belirtilerini, nedenlerini ve etkili başa çıkma stratejilerini öğrenin.',
    content: `## Tükenmişlik Sendromu

Tükenmişlik, uzun süreli ve aşırı stresin bir sonucu olarak ortaya çıkan fiziksel, duygusal ve zihinsel bir yorgunluk durumudur. Genellikle işle ilgili stresle ilişkilendirilse de, diğer yaşam alanlarında da görülebilir.

### Belirtileri
- **Duygusal Yorgunluk:** Enerjinin tükenmiş hissedilmesi, duygusal kaynakların boşalması.
- **Duyarsızlaşma:** İşe ve çevredeki insanlara karşı olumsuz, sinik veya mesafeli bir tutum sergileme.
- **Kişisel Başarıda Düşüş:** İşe karşı yetkinlik ve başarı hissinde azalma.

### Başa Çıkma Stratejileri
1. **Sınırları Belirleyin:** 'Hayır' demeyi öğrenin ve iş-yaşam dengesini kurun.
2. **Destek Arayın:** Güvendiğiniz meslektaşlarınızla, yöneticinizle veya bir ruh sağlığı uzmanıyla konuşun.
3. **Mola Verin:** Gün içinde kısa molalar vermek ve düzenli tatiller yapmak zihinsel olarak yenilenmenize yardımcı olur.
4. **Farkındalık (Mindfulness) Pratiği:** Meditasyon ve nefes egzersizleri gibi teknikler, stres seviyenizi düşürmenize yardımcı olabilir.`
  },
  {
    slug: 'stres-yonetimi',
    title: 'Zihinsel Dayanıklılık ve Stres Yönetimi',
    description: 'Zorlu durumlar karşısında psikolojik dayanıklılığınızı artıracak pratik teknikler.',
    content: `## Zihinsel Dayanıklılık (Rezilans)

Zihinsel dayanıklılık, zorluklar, travmalar ve stresli durumlar karşısında uyum sağlama ve geri dönme yeteneğidir. Bu geliştirilebilir bir beceridir.

### Dayanıklılığı Artırma Yolları
- **Pozitif İlişkiler Kurun:** Güçlü sosyal destek ağları, zor zamanlarda önemli bir tampondur.
- **Kabul Edin:** Değiştiremeyeceğiniz durumları kabul etmek, enerjinizi kontrol edebileceğiniz alanlara odaklamanıza yardımcı olur.
- **Hedefler Belirleyin:** Gerçekçi ve ulaşılabilir hedefler koymak, size bir amaç ve yön duygusu verir.
- **Kendinize İyi Bakın:** Yeterli uyku, sağlıklı beslenme ve düzenli egzersiz, hem fiziksel hem de zihinsel sağlığınız için temeldir.`
  },
  {
    slug: 'duygu-duzenleme',
    title: 'Duygu Düzenleme Teknikleri',
    description: 'Yoğun duyguları tanıma, anlama ve sağlıklı bir şekilde yönetme becerileri.',
    content: `## Duygu Düzenleme Nedir?

Duygu düzenleme, duygusal tepkilerimizi anlama ve yönetme sürecidir. Hangi duyguları, ne zaman ve nasıl deneyimlediğimizi ve ifade ettiğimizi etkileme yeteneğimizdir.

### Pratik Teknikler
- **Duyguları Etiketleyin:** "Şu an öfke hissediyorum" gibi, hissettiğiniz duyguyu adlandırmak, onun üzerindeki kontrolünüzü artırır.
- **Yeniden Çerçeveleme (Cognitive Reframing):** Olumsuz bir düşünceyi daha nötr veya pozitif bir bakış açısıyla yeniden değerlendirin.
- **Dur ve Düşün (STOPP):** 
    - **S** - Dur.
    - **T** - Bir nefes al.
    - **O** - Gözlemle (Düşüncelerin ne? Bedeninde ne oluyor?).
    - **P** - Perspektif kazan (Başka bir bakış açısı var mı?).
    - **P** - Devam et (En yardımcı olacak şekilde ilerle).`
  },
  {
    slug: 'mobbing-ve-iletisim',
    title: 'İş Yerinde Mobbing ve Sağlıklı İletişim',
    description: 'Psikolojik tacizi tanıma, kendinizi koruma ve yapıcı iletişim kurma yolları.',
    content: `## Mobbing (Psikolojik Taciz) Nedir?

Mobbing, iş yerinde bir veya daha fazla kişi tarafından başka bir kişiye yönelik sistematik olarak yapılan, yıldırıcı, pasifize edici veya işten uzaklaştırıcı kötü niyetli davranışlardır.

### Mobbinge Karşı Ne Yapılabilir?
- **Durumu Tanıyın ve Adlandırın:** Yaşadığınız şeyin mobbing olduğunu kabul etmek ilk adımdır.
- **Kanıt Toplayın:** Olayları, tarihleri, saatleri ve tanıklarıyla birlikte not alın. İlgili e-postaları ve mesajları saklayın.
- **Sınır Koyun:** Sakin ve net bir şekilde size bu şekilde davranılmasını kabul etmediğinizi belirtin.
- **Destek Alın:** Durumu güvendiğiniz bir meslektaşınızla, insan kaynakları departmanıyla veya bir hukukçu/psikolog ile paylaşın.`
  }
];

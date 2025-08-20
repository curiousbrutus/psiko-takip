# Psikotakip - Teknik Mimarisi ve Proje Dökümanı

Bu döküman, Psikotakip uygulamasının teknik mimarisini, temel özelliklerini ve veri akışını detaylandırmak amacıyla hazırlanmıştır.

## 1. Projeye Genel Bakış

Psikotakip, danışanlar, terapistler ve kurumsal (hastane/şirket) çalışanları için geliştirilmiş bütüncül bir zihinsel iyi oluş platformudur. Uygulamanın temel amacı, terapi sürecini daha etkileşimli, takip edilebilir ve motive edici hale getirmektir. Terapist-danışan arasındaki bağı güçlendirmeyi, terapi ödevlerini dijital ve ortak bir çalışma alanına taşımayı, "Ruhsal Yoldaş" konsepti ve oyunlaştırma (gamification) elementleriyle kullanıcı motivasyonunu artırmayı hedefler. Aynı zamanda, KVKK uyumlu bir "Dijital Terapötik Asistan" (chatbot) aracılığıyla kullanıcılara anlık, güvenli ve destekleyici bir konuşma alanı sunar.

## 2. Temel Mimarisi

Uygulamanın çekirdeği, Google Cloud ve Firebase servisleri üzerine kurulmuştur. Mimarinin üç ana bileşeni vardır:

- **Firebase Authentication:** Kullanıcı kimlik doğrulama süreçlerini yönetir. E-posta/şifre ve Google ile girişi destekler. Kullanıcı rolleri (`danisan`, `terapist`, `kurum_yoneticisi`), custom claims kullanılarak yönetilir ve bu roller, Firestore Güvenlik Kuralları ile yetkilendirme katmanını oluşturur.
- **Firestore Database:** Uygulamanın tüm verilerinin saklandığı NoSQL veritabanıdır. Kullanıcı bilgileri, test sonuçları, günlükler, randevular ve oyunlaştırma verileri gibi tüm bilgiler, koleksiyonlar halinde burada tutulur. Veri erişimi, Firebase Güvenlik Kuralları ile rol bazlı olarak sıkı bir şekilde kontrol edilir.
- **Firebase / Genkit (Backend Logic):** Önceden Cloud Functions ile yapılan arka plan otomasyonları ve yapay zeka entegrasyonları, artık Next.js backend'i içinde çalışan Genkit akışları (flows) ile yönetilmektedir. Bu akışlar, test sonuçlarını analiz etme, terapötik sohbet yanıtları üretme ve veritabanı işlemlerini gerçekleştirme gibi sunucu taraflı işlemleri yürütür.

## 3. Anahtar Özellikler (Feature Breakdown)

### Ruhsal Yoldaş (Büyüme Mekaniği)

- **Amaç:** Danışanın terapi sürecine olan bağlılığını ve motivasyonunu artırmak.
- **Mekanik:** Kullanıcılar, "Günlük Yolculuk" görevlerini (ruh hali takibi, günlük yazma vb.) tamamladıkça XP (Deneyim Puanı) kazanır. Bu XP'ler, seçtikleri sanal yoldaşın (Filiz veya Töz) seviye atlamasını ve evrimleşmesini sağlar. Bu, somut bir ilerleme hissi yaratarak kullanıcıyı düzenli katılıma teşvik eder.
- **Veritabanı:** `gamification` koleksiyonu bu özelliği besler; `xp`, `level`, `currentStreak` ve `companion` verilerini tutar.

### Terapist Kontrol Paneli

- **Amaç:** Terapistlere, danışanlarını verimli bir şekilde yönetme ve süreçlerini takip etme imkanı sunmak.
- **Özellikler:**
  - **Danışan Yönetimi:** Terapistler, kendilerine bağlı tüm danışanları listeleyebilir, durumlarını (aktif/pasif) yönetebilir ve yeni danışanlar davet edebilir.
  - **İlerleme Takibi:** Danışanların tamamladığı standart ölçeklerin (GAD-7, PHQ-9) sonuçlarını zaman içindeki değişimini gösteren grafikler üzerinde izleyebilir. Terapötik ittifak geri bildirimlerini de buradan takip eder.
  - **Görev Atama:** Danışanlara interaktif BDT formları (örn: Düşünce Kaydı) veya standart değerlendirme anketleri atayabilir.
  - **Paylaşılan Günlükler:** Danışanların paylaşmayı seçtiği günlük yazılarını ve duygu durumlarını inceleyerek seanslara daha hazırlıklı gelir.

### Danışan Deneyimi

- **Amaç:** Danışana, terapi sürecini destekleyen ve kendi kendine yardım becerilerini geliştiren araçlar sunmak.
- **Özellikler:**
  - **Günlük Yolculuk:** Her gün sabah ve akşam tamamlanacak, ruh hali takibi ve niyet belirleme gibi küçük görevler içerir.
  - **İyi Oluş Aktiviteleri:** "Nefes Molası", "Topraklanma Egzersizi" gibi anlık stresi yönetmeye yönelik interaktif egzersizler.
  - **Psikoeğitim Modülleri:** Tükenmişlik, stres yönetimi gibi konularda bilgilendirici içerikler.
  - **Testler:** Kendi kendine uygulayabileceği ve sonuçlarının yapay zeka tarafından yorumlanıp terapistiyle paylaşıldığı standart testler.

### Dijital Terapötik Asistan (Chatbot)

- **Amaç:** Kullanıcılara seanslar arasında, 7/24 güvenli bir alanda düşüncelerini ve duygularını keşfetmeleri için destek olmak.
- **Teknoloji:** Google'ın Gemini modeli ve Genkit kullanılarak oluşturulmuştur. `therapeutic-chat-flow` akışı, terapötik ilkelere (BDT, Farkındalık vb.) dayalı, empatik ve yansıtıcı yanıtlar üretir.
- **Güvenlik:** Konuşma içeriğinde kriz (kendine zarar verme, intihar vb.) sinyalleri tespit edildiğinde, `isCrisis` bayrağını `true` yaparak kullanıcıyı otomatik olarak Acil Destek sayfasına yönlendirir.

## 4. Veritabanı Şeması (Firestore Collections)

- **users:**
  - **Açıklama:** Uygulamadaki tüm kullanıcıların ana kayıtlarını tutar.
  - **İlişkiler:** Terapistlerin `danisanlarim` alanı, danışanların UID'lerini içeren bir dizidir. Danışanların `connectedTherapist` alanı, terapistin UID'sini tutar.
  - **Önemli Alanlar:** `uid`, `displayName`, `email`, `role` ('danisan', 'terapist'), `connectedTherapist`, `danisanlarim`.

- **journalEntries:**
  - **Açıklama:** Danışanların "Günlük Yolculuk" sırasında yazdığı niyet, minnettarlık ve serbest günlük metinlerini saklar.
  - **İlişkiler:** `userId` ile `users` koleksiyonuna bağlanır.
  - **Önemli Alanlar:** `userId`, `content`, `prompt`, `createdAt`, `isShared` (terapistle paylaşılıp paylaşılmadığını belirten boolean).

- **moodEntries:**
  - **Açıklama:** Danışanların sabah ve akşam seçtikleri ruh hallerini kaydeder.
  - **İlişkiler:** `userId` ile `users` koleksiyonuna bağlanır.
  - **Önemli Alanlar:** `userId`, `mood`, `period` ('morning'/'evening'), `createdAt`.

- **testSubmissions:**
  - **Açıklama:** Danışanların tamamladığı standart testlerin (Beck, Tükenmişlik vb.) ham verilerini ve AI analiz sonuçlarını saklar.
  - **İlişkiler:** `userId` ve `therapistId` ile `users` koleksiyonuna bağlanır.
  - **Önemli Alanlar:** `userId`, `therapistId`, `testName`, `totalScore`, `answers`, `analysis` (AI'dan dönen JSON nesnesi).
- **assessmentTasks & assessmentResults:**
  - **Açıklama:** Terapistlerin danışanlara atadığı (GAD-7, PHQ-9 vb.) ve danışanların tamamladığı periyodik ilerleme değerlendirmelerini yönetir. `assessmentTasks` atamayı, `assessmentResults` ise tamamlanan testin sonucunu tutar.
  - **İlişkiler:** `clientId`/`userId` ve `therapistId` ile `users` koleksiyonuna bağlanır.
  - **Önemli Alanlar:** `testName`, `status`, `assignedAt`, `completedAt`, `score`, `allianceScore`.

- **collaborativeTasks:**
  - **Açıklama:** Terapist ve danışanın birlikte üzerinde çalıştığı interaktif görevleri (örn: Düşünce Kaydı) tutar.
  - **İlişkiler:** `clientId` ve `therapistId` ile `users` koleksiyonuna bağlanır.
  - **Önemli Alanlar:** `title`, `status`, `fields` (görev alanlarını içeren nesne).

- **gamification:**
  - **Açıklama:** Her danışanın oyunlaştırma verilerini ve "Ruhsal Yoldaş" bilgilerini tutar.
  - **İlişkiler:** Doküman ID'si, kullanıcının UID'si ile aynıdır.
  - **Önemli Alanlar:** `xp`, `level`, `currentStreak`, `companion` (tür ve oluşturulma tarihi).
- **appointments:**
  - **Açıklama:** Terapistlerin danışanları için oluşturduğu randevuları saklar.
  - **İlişkiler:** `clientId` ve `therapistId` ile `users` koleksiyonuna bağlanır.
  - **Önemli Alanlar:** `appointmentDate`, `type` ('Online'/'Yüz Yüze'), `description`.

## 5. Otomasyon ve Arka Plan Süreçleri (Genkit Flows)

- **analyzeTestResults (`analyze-test-results.ts`):**
  - **Tetikleyici:** Danışan bir testi tamamladığında (örn: Beck Depresyon Envanteri) client tarafından çağrılır.
  - **Süreç:** Testin adını, kullanıcının cevaplarını ve toplam skorunu alır. Gemini modeline bu verileri göndererek; test sonuçlarına dayalı kişiselleştirilmiş içgörüler, potansiyel sorunların ciddiyeti ve kullanıcıya özel rehberlik içeren yapılandırılmış bir JSON nesnesi üretir.
  - **Sonuç:** Üretilen analiz, ham skorlarla birlikte `testSubmissions` koleksiyonuna kaydedilir.

- **getChatResponse (`therapeutic-chat-flow.ts`):**
  - **Tetikleyici:** Kullanıcı, "Dijital Terapötik Asistan" arayüzünden bir mesaj gönderdiğinde çağrılır.
  - **Süreç:** Kullanıcının mesajını, sohbet geçmişini ve isteğe bağlı olarak diğer bağlamsal bilgileri (ruh hali trendi, son test sonuçları vb.) alır. Gemini modeline, terapötik ilkelere uyması için detaylı bir sistem talimatı ile birlikte bu verileri gönderir.
  - **Sonuç:** Empatik ve destekleyici bir yanıt üretir. Kritik olarak, kendine zarar verme riski tespit ederse `isCrisis` bayrağını `true` olarak ayarlayıp standart bir kriz yönlendirme mesajı döndürür.

- **Not:** Orijinal dökümanda belirtilen `Cloud Functions` (`generateDailyInsightCard`, `generateSessionBriefing` vb.) henüz projede implemente edilmemiştir. Bu tür periyodik ve olaya dayalı otomasyonlar, gelecekte Genkit veya Firebase'in diğer sunucusuz araçları kullanılarak eklenebilir.

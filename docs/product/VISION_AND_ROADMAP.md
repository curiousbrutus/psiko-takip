# Psikotakip — Ürün Vizyonu ve Yol Haritası

> **Bu doküman güncel stratejik pusuladır.** `docs/product/roadmap.md` (eski, Firebase/n8n/3D-avatar dönemi) arşivseldir ve buradaki kararlar onu geçersiz kılar.
> Son güncelleme: 2026-07 · Sahibi: Eyyüb (fikir babası) · Yazan: eş-mimari oturumu

---

## 0. Tek cümlelik tez

> **"Sorunu teknoloji açtı; çözümü de terapistin *yanında* duran, danışanı gerçekten anlayan bir AI yoldaş olacak."**

Kuzey yıldızı duygusaldır: kullanıcı reklamı görünce **"işte bu ya — kargaşanın içinde, telefonumda, kendimle başbaşa kalabileceğim bir sığınak"** demeli. Hedef nokta: **harmoni / iç huzur**. Yol: insan terapist merkezde, AI yanında.

---

## 1. Neden kazanırız — asıl moat

Herkes GPT/Gemini/Ollama çağırabilir. Kimsede olmayan şey bizde olacak:

1. **Bugünkü moat = bağlam.** Bir danışanın boylamsal kaydı (günlük, mood, test trendleri, hedefler) + **terapistin tedavi yaklaşımı** + seans özetleri, modele yapılandırılmış bağlam olarak beslenir (danışanın kendi verisi üzerinde RAG). "Danışanı en iyi anlayan AI" hissinin ~%80'i buradan gelir, modelden değil.
2. **Yarınki moat = veri.** Zamanla biriken (rızalı, kimliksizleştirilmiş) terapi verisiyle, "hangi yaklaşım kimde işe yarıyor"u öğrenen kendi ajanımızı **fine-tune** ederiz. Bu, gelir sonrası fazdır.

Taklidi zor olan, model değil; **terapist-kürasyonlu, boylamsal, özel bağlamdır.**

---

## 2. Temel tasarım ilkeleri (pazarlıksız)

### 2.1 Yoldaş, terapistin bir *uzantısıdır* — ikamesi değil
Yoldaş danışanı terapistten **koparmaz**, ittifakı **güçlendirir**. Bir terapistle ilk çalışmaya başladığında Yoldaş onunla "tanışma sohbeti" yapar; terapistin **yaklaşımını, dilini ve tarzını** öğrenip benimser. Her etkileşimde danışanı terapiste geri yönlendirir ("bunu bir sonraki seansta [terapist] ile konuşmaya ne dersin?"), asla "senin gerçek terapistin benim" konumuna geçmez. Bu hem klinik olarak doğru hem de terapistleri (dağıtım kanalımız) **rakip değil ortak** yapar.

### 2.2 Terapist döngünün içinde (therapist-in-the-loop)
Terapist, Yoldaş'ın davranışını **danışan bazında** ayarlar: yaklaşım (BDT/şema/kabul-kararlılık/bütünleştirici), ton (şefkatli/direkt), yasak konular, güncel hedefler, eskalasyon eşiği. Global tarz (terapist kalibrasyonu) + danışana özel katman.

### 2.3 İfşa sınırı (disclosure boundary)
Yoldaş uygulamadaki **her şeyi bağlam olarak görür**, ama **tanı/hassas içgörüyü danışana açmaz** — terapist paylaşmadıkça. Her kayıt için `therapist-only` ↔ `danışana-açık` bayrağı. Bilmek (context) ile söylemek (disclosure) iki ayrı katman.

### 2.4 Wellness konumu + AI korkulukları
Konum: **wellness** (tıbbi cihaz değil). AI **asla** tanı koymaz, ilaç/doz konuşmaz, terapisti çürütmez. Yalnızca: yansıtma, davranışsal öneri ve hatırlatma yapar — *günlüğünü tamamla, bana anlat, ses kaydet, şiir/resim yap, spora çık, arkadaşını ara, ilacını al, randevuna git, meditasyon yap.*

### 2.5 Gizlilik baştan (privacy-by-design)
Danışan–terapist gizliliği vazgeçilmez. Hassas alanlar şifreli saklanır, sırlar sır-yöneticisinde tutulur, erişim RBAC + denetim kaydı ile sınırlanır. İleride veriyle model eğitmek/araştırma yapmak için **açık rıza + kimliksizleştirme** akışı *baştan* kurulur.

---

## 3. Yoldaş mimarisi

### 3.1 Terapist Kalibrasyonu (onboarding)
Terapist ilk katıldığında Yoldaş onu "röportaja alır": modalite, ton, kullandığı/kaçındığı ifadeler, "X durumunda nasıl karşılık vermeni isterim", eskalasyon tercihleri → **terapist tarz profili** üretir. Bu profil, o terapistin *tüm* danışanlarında Yoldaş'ın sistem-bağlamını şekillendirir (danışan bazında ezme hakkıyla).

### 3.2 Bağlam katmanları (her mesajda montajlanır)
```
[Terapist tarz profili]  ← 3.1
[Danışan bazlı ayar]     ← yaklaşım, hedefler, yasak konular, eşik (2.2)
[Danışan kaydı / RAG]    ← günlük, mood, test trendleri, seans özetleri (ifşa bayrağıyla)
[Korkuluklar]            ← tanı/ilaç yok, terapisti çürütme yok, ittifakı güçlendir (2.1/2.4)
[Kullanıcı mesajı]
```

### 3.3 Eskalasyon
Önemli sinyal → danışan dosyasına işlenir + terapiste bildirim (aciliyete göre). Terapist kararı verir; Yoldaş asla otonom klinik aksiyon almaz.

---

## 4. Klinik emniyet & kriz protokolü

> ⚠️ Bu protokolü çevrendeki ruh sağlığı uzmanları **gözden geçirmeli**. Aşağısı mühendislik iskeletidir, klinik son söz değildir.

Kademeli, **insan-döngüde**, **otomatik 112/arama YOK**:

- **Kademe 1 — hafif sıkıntı:** destekleyici yansıtma + başa çıkma önerisi + logla.
- **Kademe 2 — endişe verici:** kriz kaynaklarını/hatlarını göster + güçlü yönlendirme + terapiste (acil olmayan) bildirim + bayraklı logla.
- **Kademe 3 — yakın risk:** tam ekran kriz kaynakları + yardım hatları; **kullanıcının tek dokunuşla** arayabileceği buton (otomatik arama değil) + terapiste acil bildirim + logla.

Neden otomatik arama yok: yanlış pozitif (boşa 112) ve yanlış negatif (krizi kaçırma) ağır hukuki/insani sorumluluk doğurur; sektörde ciddi hiçbir ürün AI kararıyla acil servis aramaz.

---

## 5. Ölçüm-tabanlı bakım (test kütüphanesi)

**MVP'de yalnızca ücretsiz / kamuya açık, doğrulanmış ölçekler:** PHQ-9 (depresyon), GAD-7 (anksiyete), WHO-5 (iyi-oluş), DASS-21, K10, PSS-10, PCL-5, AUDIT. Bunlar ölçüm-tabanlı bakımın fiili standardıdır ve ticari kullanımı serbesttir.

**Lisanslı testler (Beck/BDI-II, MMPI, Young Şema) yalnızca lisans alındığında.** "Cite etmek" ≠ lisans; izinsiz ticari kullanım telif ihlalidir. Gelir gelince lisanslarız.

Değer: tekrarlı ölçüm → **trend grafiği** → danışan için "ilerlemeyi görmek" (tutunma), terapist için "objektif tablo", gelecekte araştırma için temiz veri.

---

## 6. Veri, gizlilik, regülasyon

- **Konum:** wellness. Hassas veri KVKK'da özel niteliklidir → şifreleme, RBAC, denetim kaydı, saklama/silme politikası, açık rıza.
- **Veri egemenliği:** bugün self-hosted Oracle (gizlilik güçlü). İleride tam-özel sunucu veya güvenilir merkezden hizmet — model eğitimi + veri içeride kalması için. Google API'siyle ilerlemek MVP için uygun (veri işleme şartlarına dikkat).
- **Araştırma/model eğitimi:** yalnızca açık rıza + kimliksizleştirme + (mümkünse) etik kurul onayı ile. Bu kapıyı açık tutmak için rıza/anonimizasyon altyapısı bugünden konur.

---

## 7. Faz planı

Mevcut durum (bu oturumlarda yapıldı/onarıldı): NestJS/Oracle API, JWT + 3 rol, terapist–danışan **davet + otomatik-bağlama** eşleşmesi, mood/günlük/şükran/test/görev/randevu, **etkileşimli Yoldaş** (dashboard + companion sayfası), `/ai/*` (Ollama) modülü.

### Faz 0 — Güven temeli (çoğu görünmez, pazarlıksız)
- Sır yönetimi (`.env` düz sırları → yönetici), hassas alanlar için at-rest şifreleme.
- RBAC + denetim kaydı, veri saklama/silme politikası.
- Açık rıza akışları (kullanım + veri işleme + gelecekteki araştırma onayı ayrı).
- Kriz kaynakları sayfası (otomatik-dispatch değil).

### Faz 1 — Yoldaş (kahraman)
- Terapist kalibrasyon onboarding'i (§3.1) + danışan-bazlı Yoldaş ayarları (§2.2).
- Bağlam montajı / RAG (§3.2) + ifşa bayrağı modeli (§2.3).
- Yoldaş sohbet arayüzü; Ollama (bedava) + Gemini (ücretsiz katman) ile.
- Eskalasyon → terapist bildirimi + danışan dosyasına log (§3.3, §4).

### Faz 2 — Ölçüm-tabanlı bakım
- Ücretsiz doğrulanmış ölçekler (§5), boylamsal trend grafikleri, planlı yeniden-değerlendirme.
- Terapist "objektif tablo" panosu.

### Faz 3 — Dağıtım & ölçek (gelir kapılı)
- Terapist-önce GTM; sonra WhatsApp/Telegram **terapist botu** (panele girmeden iş).
- Kurum paketleme (klinik/üniversite/şirket).
- (Gelir sonrası) fine-tune ajanı, tam-özel sunucu, lisanslı testler, (çift-rızalı) Meet transcript'i.

---

## 8. MVP kapsamı (~8 hafta) — ve maliyeti ≈ 0

**MVP için para gerekmiyor:** Ollama zaten sunucuda (bedava), Gemini ücretsiz katman, testler kamuya açık. Para gerektiren her şey (fine-tune, lisans, özel sunucu) gelir sonrası.

**İçeride:** Faz 0'ın kritik güvenlik/rıza parçaları · Faz 1 çekirdek (kalibrasyon + bağlam-farkında Yoldaş + eskalasyon) · Faz 2'den bir dilim (PHQ-9/GAD-7 başlangıç + trend).
**Dışarıda:** kurum panosu, transcript, fine-tune, 3D/AR, sesli, lisanslı testler, otomatik arama.

### "Reklam sahnesi" (satılan 60 saniye)
> Terapist 2 dakikada Yoldaş'ı ayarlar. Danışan gece 11'de tek başına Yoldaş'a zor gününü anlatır. Yoldaş hem sıcak hem *terapistin BDT yaklaşımına uygun* karşılık verir, bir topraklanma egzersizi önerir, endişe verici bir cümleyi sessizce terapistin panosuna işaretler. Sabah terapist o içgörüyü dashboard'da görür.

Bu sahne = demo videosu = ilk 5 terapisti bağlama argümanı.

---

## 9. Go-to-market — terapist-önce (B2B2C)

Pazarlama zaafının çözümü ürünün içinde: **bir terapist bağlanınca yanında N danışan getirir** — bireysel kullanıcı avlamaktan ~10× ucuz. Çevredeki ruh sağlığı uzmanları ilk dağıtım kanalı. Plan: 5 terapiste bayıltan bir Yoldaş+panel → onların danışanları → testimonial + demo videosu → asıl pazarlama varlığı → sonra ücretlendirme. Türkiye-önce, sonra global.

---

## 10. İş modeli
- **Birey:** self-help freemium → premium.
- **Terapist:** paket abonelik; danışanına terapi-içi ek hizmet olarak sunabilir.
- **Kurum:** koltuk/kurum bazlı (klinik/üniversite/şirket).

---

## 11. Limitler & riskler (dürüst)
1. **Klinik emniyet/kriz** — pazarlıksız; klinik gözden geçirme şart.
2. **Hassas veri güvenliği/regülasyon** — bugünkü paylaşımlı sunucu + düz sırlar en yakın teknik risk (Faz 0).
3. **Kanıt-temelli içerik** — "SOTA ruh sağlığı" = müdahalelerin işe yaradığını *veriyle* göstermek; gamification tek başına yetmez.
4. **Test lisansları** — MVP'de ücretsiz ölçeklerle çözüldü; premium testler gelir kapılı.
5. **AI güvenilirliği** — halüsinasyon/sınır ihlali; korkuluklar + insan-döngüde + terapist kontrolü ile azaltılır.
6. **Ölçek vs. self-hosted** — veri egemenliği ile çok-kiracılı ölçek bir noktada gerilir; bilinçli bir tercih.

---

## 12. Başarı metrikleri
- **Sonuç:** PHQ-9/GAD-7 skorlarında 8 haftada anlamlı düşüş; danışanın *terapistiyle* etkileşiminin sürmesi (anti-bağımlılık sağlığı).
- **Tutunma:** 30 günlük danışan geri-dönüş oranı; Yoldaş haftalık aktif kullanım.
- **Terapist değeri:** seans-hazırlık süresinde düşüş; terapistin gördüğü "objektif tablo" kullanımı.
- **Dağıtım:** terapist başına bağlı danışan sayısı; terapistten terapiste tavsiye.

---

## 13. Açık kararlar (ilerledikçe netleşecek)
- Production LLM: lokal-öncelik mi, Gemini mi, hibrit mi? (gizlilik ↔ yetenek)
- Eskalasyon eşikleri ve kriz metni: **klinisyen tanımlı**.
- Terapist kalibrasyonu: soru-cevap onboarding mi, ilk sohbetlerden otomatik çıkarım mı, ikisi mi?
- Yoldaş hafızası: ham kayıt mı, terapist-kürasyonlu özet mi? (mahremiyet ↔ yakınlık)
- Rıza granülaritesi: kullanım / veri işleme / araştırma ayrı onaylar.

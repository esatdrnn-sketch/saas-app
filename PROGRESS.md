# SaaS App — Proje İlerleme Dokümanı

> Churnkey modelinin birebir kopyası hedefleniyor: başarısız abonelik ödemelerini yakalayıp WhatsApp ile kurtarma linki göndermek, müşterinin kartını güncellemesini sağlamak ve admin panelinden kurtarma oranını takip etmek.

Son güncelleme: 19 Haziran 2026

---

## Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Veritabanı | PostgreSQL (Neon) |
| ORM | Prisma 7 + `@prisma/adapter-neon` |
| Dil | TypeScript |
| UI | React 19, CSS Modules |

---

## Gün 1 — Omurga (Tamamlandı)

### Veritabanı modelleri

**Tenant** — SaaS müşterisi (işletme)
- `id`, `name`, `createdAt`

**Subscription** — Son kullanıcı aboneliği
- `id`, `tenantId`, `customerPhone`, `status`, `iyzicoSubRef`, `updateToken`, `createdAt`, `updatedAt`

**SubscriptionStatus enum**
- `ACTIVE` — aktif abonelik
- `PAST_DUE` — ödeme başarısız (iyzico FAILURE webhook)
- `RECOVERED` — kart güncellendi, abonelik kurtarıldı
- `CANCELLED` — iptal edilmiş

### Migration geçmişi

| Migration | İçerik |
|-----------|--------|
| `20260619174653_init` | Tenant + Subscription tabloları |
| `20260619200000_add_update_token` | `updateToken` alanı (UUID, unique) |
| `20260619210000_add_recovered_status` | `RECOVERED` enum değeri |

### Altyapı dosyaları

- `lib/prisma.ts` — Neon HTTP adapter ile Prisma client
- `prisma.config.ts` — Prisma 7 config (`DATABASE_URL`)
- `prisma/seed.ts` — test verisi (aşağıya bak)

---

## Gün 2 — Kurtarma Akışı (Tamamlandı)

### 1. Sihirli Link — `updateToken`

Her abonelik oluşturulduğunda benzersiz bir `updateToken` otomatik üretilir (`@default(uuid())`).

- **Şema:** `prisma/schema.prisma` → `updateToken String @unique @default(uuid())`
- **Manuel üretim:** `lib/subscription-token.ts` → `generateUpdateToken()` (32 byte hex)

Kurtarma linki formatı:
```
http://localhost:3000/update-card?token=[updateToken]
```

### 2. iyzico Webhook — Başarısız Ödeme

**Dosya:** `app/api/webhook/route.ts`

**Akış:**
1. iyzico'dan `POST` gelir
2. `body.status === "FAILURE"` kontrol edilir
3. `body.subscriptionReferenceCode` ile abonelik bulunur
4. Abonelik durumu `PAST_DUE` yapılır
5. WhatsApp mock bildirimi tetiklenir

**Test payload:**
```json
{
  "status": "FAILURE",
  "subscriptionReferenceCode": "mevcut-iyzico-ref"
}
```

### 3. WhatsApp Mock Bildirimi

**Dosya:** `lib/whatsapp.ts`

- `buildPaymentFailureMessage(updateToken)` — mesaj metnini oluşturur
- `sendWhatsAppMessage(phone, message)` — konsola mock log yazar
- `sendPaymentFailureNotification(phone, updateToken)` — ikisini birleştirir

**Gönderilen mesaj:**
```
Sayın Müşterimiz, abonelik ödemeniz tahsil edilemedi. Hizmetinizin aksamaması için lütfen şu güvenli bağlantıdan kart bilgilerinizi güncelleyin: http://localhost:3000/update-card?token=[TOKEN]
```

> Gerçek WhatsApp API entegrasyonu henüz yapılmadı; şu an sadece console log.

---

## Gün 3 — Admin Paneli (Tamamlandı)

**Dosyalar:**
- `app/admin/page.tsx` — Server Component, Prisma ile veri çeker
- `app/admin/admin.module.css` — Churnkey tarzı sade tasarım

**URL:** `http://localhost:3000/admin`

**İçerik:**
- Üstte büyük **Kurtarma Oranı** metriği
  - Formül: `RECOVERED / (PAST_DUE + RECOVERED) × 100`
- Altta abonelik tablosu:
  - Müşteri Telefonu
  - iyzico Referans Kodu
  - updateToken
  - Durum (renkli rozetler)

**Durum rozetleri:**

| Durum | Renk |
|-------|------|
| PAST_DUE | Kırmızı |
| RECOVERED | Yeşil |
| ACTIVE | Mavi |
| CANCELLED | Gri |

---

## Gün 4 — Kart Güncelleme Sayfası (Tamamlandı)

### Müşteri tarafı (Sihirli Link)

**Dosyalar:**
- `app/update-card/page.tsx` — token ile abonelik doğrulama, tenant adı gösterimi
- `app/update-card/CardForm.tsx` — kart formu (client component)
- `app/update-card/page.module.css` — Churnkey kalitesinde UI

**Akış:**
1. Müşteri WhatsApp'taki linke tıklar
2. `?token=...` ile abonelik bulunur
3. Kart bilgilerini girer ve gönderir
4. Başarı ekranı gösterilir

### API — Kart Güncelleme

**Dosya:** `app/api/update-card/route.ts`

**Akış:**
1. Token + kart bilgileri alınır
2. Validasyon (16 haneli kart, AA/YY expiry, CVC)
3. Abonelik `updateToken` ile bulunur
4. Mock iyzico kart güncellemesi (`lib/iyzico.ts`)
5. Abonelik durumu `RECOVERED` yapılır

**Mock iyzico:** `lib/iyzico.ts` → `updateSubscriptionCard()` — konsola log yazar

> Bu endpoint eksik olduğu için kart formu hata veriyordu; eklendi ve düzeltildi.

---

## Durum Akış Diyagramı

```
ACTIVE
  │
  │  iyzico webhook (FAILURE)
  ▼
PAST_DUE ──→ WhatsApp mock bildirimi (kurtarma linki)
  │
  │  müşteri /update-card formunu doldurur
  ▼
RECOVERED

CANCELLED (manuel / gelecekte)
```

---

## Dosya Haritası

```
saas-app/
├── app/
│   ├── admin/
│   │   ├── page.tsx              # Kurtarma paneli (Server Component)
│   │   └── admin.module.css
│   ├── api/
│   │   ├── webhook/route.ts      # iyzico FAILURE webhook
│   │   └── update-card/route.ts  # Kart güncelleme API
│   ├── update-card/
│   │   ├── page.tsx              # Sihirli link sayfası
│   │   ├── CardForm.tsx          # Kart formu
│   │   └── page.module.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── prisma.ts                 # Prisma + Neon adapter
│   ├── whatsapp.ts               # WhatsApp mock
│   ├── iyzico.ts                 # iyzico mock
│   └── subscription-token.ts     # Token üretici
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                   # Test verisi
│   └── migrations/
├── prisma.config.ts
├── PROGRESS.md                   # ← Bu dosya
└── package.json
```

---

## Test Verisi (Seed)

**Komut:**
```bash
npm run seed
```

**Oluşturulan kayıtlar:**

| Alan | Değer |
|------|-------|
| Tenant ID | `test-tenant-1` |
| Tenant Adı | `Test İşletmesi` |
| Telefon | `+905551234567` |
| iyzico Ref | `mevcut-iyzico-ref` |
| Başlangıç durumu | `ACTIVE` |

---

## Manuel Test Senaryosu

### 1. Seed çalıştır
```bash
npm run seed
```

### 2. Dev sunucu başlat
```bash
npm run dev
```

### 3. Webhook simüle et (PAST_DUE)
```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"status":"FAILURE","subscriptionReferenceCode":"mevcut-iyzico-ref"}'
```
Terminalde `[WhatsApp Mock]` logunu gör.

### 4. Admin paneli kontrol
`http://localhost:3000/admin` → abonelik PAST_DUE olarak listelenmeli.

### 5. Kurtarma linki
WhatsApp mock logundaki linki aç veya admin tablosundaki token ile:
`http://localhost:3000/update-card?token=[updateToken]`

### 6. Kart güncelle
Formu doldur → başarı ekranı → admin panelinde durum **RECOVERED**, kurtarma oranı güncellenir.

---

## Ortam Değişkenleri

`.env` dosyasında gerekli:
```
DATABASE_URL=postgresql://...  # Neon connection string
```

---

## MCP — Filesystem

Agent'ın proje dosyalarına MCP üzerinden erişmesi için Filesystem MCP kuruldu.

**Proje config:** `.cursor/mcp.json`  
**Global config:** `C:\Users\sahra\.cursor\mcp.json`

**Sunucu:** `@modelcontextprotocol/server-filesystem`  
**Erişim kapsamı:** `C:\Users\sahra\Desktop\saas-app`

**Aktifleştirmek için:**
1. Cursor'u tamamen kapat ve yeniden aç (veya `Reload Window`)
2. **Settings → Tools & MCP** bölümünde `filesystem` sunucusunun yeşil olduğunu doğrula

**Sağladığı araçlar:** dosya okuma, yazma, listeleme, dizin arama (sandbox: sadece proje klasörü)

### Chrome DevTools MCP

**Sunucu:** `chrome-devtools-mcp@latest`  
**Config dosyaları:** `.cursor/mcp.json` + `C:\Users\sahra\.cursor\mcp.json`

Windows'ta Cursor'un MCP'yi doğru başlatabilmesi için `cmd /c npx` kullanılıyor.

**Sağladığı araçlar:** Chrome'da sayfa açma, snapshot, tıklama, form doldurma, network/console inceleme (localhost:3000 testleri için)

**Gereksinimler:**
- Node.js 22.12+ (mevcut: v24)
- Chrome 144+ (sunucu otomatik bağlanabilir)

**Sorun olursa:** Cursor'u tamamen kapat/aç → Settings → Tools & MCP → `chrome-devtools` yeşil mi kontrol et

---

## Agent Skills — Antigravity Awesome Skills

**Kaynak:** [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills)  
**Sürüm:** v12.10.0  
**Kurulum komutu:** `npx antigravity-awesome-skills --cursor`  
**Kurulum yolu:** `C:\Users\sahra\.cursor\skills` (~1583 skill)

**Kullanım:** Cursor Agent sohbetinde `@skill-name` ile çağır. Örnek:
```
@brainstorming SaaS MVP planla
@webapp-uat localhost:3000/update-card sayfasını test et
```

**Önerilen başlangıç bundle'ları (Churnkey projesi için):**
- `Essentials` + `Full-Stack Developer` + `QA & Testing` — genel geliştirme
- `Security Developer` + `DevOps & Cloud` — production hardening

**Güncelleme:** `npx antigravity-awesome-skills --cursor` komutunu tekrar çalıştır.

### Aktif bundle'lar (bu proje)

Önerilen 5 bundle proje seviyesinde `.cursor/skills/` altına bağlandı (**30 skill**, junction):

| Bundle | Skill sayısı | Kullanım alanı |
|--------|--------------|----------------|
| Essentials | 5 | Planlama, lint, git, debug |
| Full-Stack Developer | 6 | Next.js, API, DB, Stripe |
| QA & Testing | 6 | E2E, Playwright, test |
| Security Developer | 6 | API/auth/PCI güvenliği |
| DevOps & Cloud | 7 | Deploy, Docker, Neon prod |

**Manifest:** `.cursor/active-bundles.json`

**Örnek kullanım:**
```
@concise-planning webhook hata akışını düzeltme planı çıkar
@browser-automation /update-card formunu test et
@pci-compliance kart güncelleme sayfasını güvenlik açısından incele
@deployment-procedures Neon prod deploy checklist
```

Cursor'u yeniden başlat — proje skill'leri tanınsın.

**Daraltılmış kurulum (context taşması olursa):**
```bash
npx antigravity-awesome-skills --path .cursor/skills --category development,backend --risk safe,none
```

---

## Henüz Yapılmadı (Sonraki Adımlar)

- [ ] Gerçek WhatsApp Business API entegrasyonu (`lib/whatsapp.ts`)
- [ ] Gerçek iyzico kart güncelleme API (`lib/iyzico.ts`)
- [ ] Webhook imza doğrulama (iyzico güvenlik)
- [ ] Admin paneli auth / koruma
- [ ] `updateToken` süresi dolma (token expiry)
- [ ] Production URL (`localhost:3000` → env variable)
- [ ] RECOVERED sonrası durumu tekrar `ACTIVE` yapma (iş kuralına göre)
- [ ] Tenant bazlı filtreleme (multi-tenant admin)
- [ ] E-posta bildirimi alternatifi

---

## Bilinen Notlar

- WhatsApp bildirimi `subscription.customerPhone` alanına gider (Tenant modelinde telefon yok).
- `lib/prisma.ts` Neon adapter ikinci parametresi `{}` ile kullanılıyor (seed ile uyumlu).
- Migration deploy: `npx prisma migrate deploy` — yeni ortamda çalıştırılmalı.
- Prisma client yenileme: `npx prisma generate`

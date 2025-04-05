# DrCan.dev Blog Projesi

Bu proje, Dr. Burak Can'ın kişisel blog sitesi için Next.js, TypeScript, Prisma ve PostgreSQL kullanılarak geliştirilmiş modern bir web uygulamasıdır.

## Özellikler

- 🚀 Next.js 14 App Router ile geliştirilmiş hızlı ve SEO dostu yapı
- 🔐 Next-Auth ile Google hesabı üzerinden yönetici girişi
- 📝 Blog yazıları için tam kapsamlı CRUD işlemleri
- 🖼️ UploadThing ile kapak görselleri ve içerik görselleri yükleme
- 📊 Kategoriler ve etiketler ile içerik organizasyonu
- 📚 Blog yazılarını seriler halinde gruplama
- 🔍 Gelişmiş arama ve filtreleme özellikleri
- 🌓 Koyu/açık tema desteği
- 📱 Responsive tasarım - mobil cihazlarla uyumlu
- ✨ Modern UI/UX (shadcn/ui bileşenleri)
- 📋 Markdown benzeri zengin metin editörü (BlockNote entegrasyonu)

## Kurulum

### Gereksinimler

- Node.js 18.0 veya üzeri
- PostgreSQL veritabanı (veya Neon.tech gibi PostgreSQL hizmeti)
- Google Cloud hesabı (OAuth için)
- UploadThing hesabı (dosya yüklemeleri için)

### Adımlar

1. Projeyi klonlayın:

```bash
git clone https://github.com/yourusername/drcan-dev.git
cd drcan-dev
```

2. Bağımlılıkları yükleyin:

```bash
npm install
```

3. `.env.example` dosyasını `.env` olarak kopyalayın:

```bash
cp .env.example .env
```

4. `.env` dosyasını düzenleyerek gerekli ortam değişkenlerini yapılandırın (aşağıda detaylı açıklama bulunmaktadır).

5. Veritabanını senkronize edin:

```bash
npx prisma db push
```

6. Geliştirme sunucusunu başlatın:

```bash
npm run dev
```

7. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine giderek uygulamayı görüntüleyin.

## Ortam Değişkenleri Yapılandırması

Projeyi çalıştırmak için aşağıdaki ortam değişkenlerini `.env` dosyasında yapılandırmanız gerekmektedir:

### AUTH_SECRET

NextAuth için güvenlik anahtarı. Rastgele ve güvenli bir değer oluşturmak için:

```bash
npx auth secret
```

veya

```bash
openssl rand -base64 32
```

### Google OAuth Yapılandırması

1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin
2. Yeni bir proje oluşturun veya mevcut bir projeyi seçin
3. "API ve Servisler" > "Kimlik Bilgileri" bölümüne gidin
4. "Kimlik Bilgileri Oluştur" > "OAuth istemci kimliği" seçin
5. Uygulama türü olarak "Web uygulaması" seçin
6. İzin verilen yönlendirme URI'larına aşağıdakileri ekleyin:
   - Geliştirme ortamı için: `http://localhost:3000/api/auth/callback/google`
   - Üretim ortamı için: `https://yourdomain.com/api/auth/callback/google`
7. Oluşturulan istemci kimliği ve gizli anahtarı `.env` dosyasına ekleyin:

```
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### Veritabanı Bağlantısı

PostgreSQL veritabanı bağlantı URL'si. [Neon.tech](https://neon.tech) veya [Railway](https://railway.app) gibi bir hizmet kullanabilirsiniz:

```
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

### UploadThing Yapılandırması

1. [UploadThing](https://uploadthing.com/) adresinde bir hesap oluşturun
2. Yeni bir proje oluşturun
3. API anahtarınızı alın ve `.env` dosyasına ekleyin:

```
UPLOADTHING_TOKEN="your-uploadthing-api-key"
```

## Admin Kullanıcısı Oluşturma

Sistem, Google hesabı ile giriş yapan kullanıcılara otomatik olarak admin yetkisi vermez. Admin kullanıcısı oluşturmak için şu adımları izleyin:

### 1. İlk Admin Girişi

1. Önce web sitesini başlatın: `npm run dev`
2. Tarayıcınızda `/admin` sayfasına gitmeye çalışın (örn: http://localhost:3000/admin)
3. Sistem sizi otomatik olarak Google ile giriş sayfasına yönlendirecektir
4. Google hesabınızla giriş yapın
5. Bu aşamada ana sayfaya yönlendirileceksiniz çünkü henüz admin yetkiniz yok

### 2. Kullanıcıyı Admin Olarak Ayarlama

Giriş yaptıktan sonra, veritabanındaki kullanıcı kaydınızı admin olarak ayarlamanız gerekir. Bunu iki şekilde yapabilirsiniz:

#### a. Manuel Yöntem (Veritabanı Arayüzü ile)

Veritabanı yönetim aracınızı (pgAdmin, DBeaver, vb.) kullanarak:

```sql
UPDATE "User" SET "isAdmin" = true WHERE "email" = 'your-email@example.com';
```

#### b. Otomatik Yöntem (Admin Script ile)

Projede bulunan admin yapma komutunu kullanın. Bu komut, verilen e-posta adresindeki kullanıcıyı otomatik olarak admin yapar:

```bash
npm run make-admin your-email@example.com
```

Bu komut, kullanıcının e-posta adresini veritabanında arar, bulursa `isAdmin` değerini `true` olarak günceller ve işlem başarılı olduğunda bir onay mesajı gösterir.

### 3. Admin Paneline Erişim

Kullanıcınız admin olarak ayarlandıktan sonra, `/admin` sayfasını yeniden ziyaret edin. Artık yönetici paneline erişiminiz olacaktır.

## Üretim Ortamı Dağıtımı

Projeyi Vercel'e dağıtmak için:

1. [Vercel](https://vercel.com/) hesabı oluşturun
2. GitHub/GitLab/Bitbucket reponuzu Vercel ile bağlayın
3. Gerekli ortam değişkenlerini Vercel proje ayarlarında tanımlayın
4. Dağıtımı başlatın

## Katkıda Bulunma

Katkılarınızı memnuniyetle karşılıyoruz! Lütfen önce bir konu (issue) açarak değişikliklerinizi tartışın.

## Lisans

Bu proje [MIT lisansı](LICENSE) altında lisanslanmıştır.

## İletişim

Dr. Burak Can - [iletisim@drcan.dev](mailto:iletisim@drcan.dev)

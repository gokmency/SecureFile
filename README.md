# SecureFile

SecureFile, tamamen istemci tarafında çalışan, güvenli dosya şifreleme ve şifre çözme uygulamasıdır. Dosyalarınız hiçbir zaman cihazınızı terk etmez ve tüm işlemler tarayıcınızda gerçekleşir.

![SecureFile Logo](public/favicon.svg)

## Özellikler

- **Güçlü Şifreleme**: AES-256-GCM şifreleme algoritması kullanarak dosyalarınızı güvenle koruyun
- **İstemci Tarafında İşlem**: Tüm şifreleme ve şifre çözme işlemleri tarayıcınızda gerçekleşir, dosyalarınız hiçbir sunucuya yüklenmez
- **Sıfır Veri Saklaması**: Şifreleriniz veya dosyalarınız saklanmaz veya kaydedilmez
- **Çoklu Dosya Desteği**: Birden fazla dosyayı aynı anda işleyebilme
- **Çok Çeşitli Format Desteği**: Belgeler, görseller, arşivler, ses ve video dosyaları dahil olmak üzere çok sayıda dosya formatını destekler
- **Modern, Kullanıcı Dostu Arayüz**: Sürükle-bırak özelliği ve modern tasarımla kolay kullanım

## Teknolojiler

Bu proje aşağıdaki teknolojiler kullanılarak geliştirilmiştir:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Nasıl Çalışır?

1. **Şifreleme**: 
   - "Şifrele" sekmesini seçin
   - Şifrelemek istediğiniz dosyaları sürükleyip bırakın veya seçin
   - Güçlü bir şifre belirleyin ve onaylayın
   - "Dosyaları Şifrele" butonuna tıklayın
   - Şifrelenmiş .enc dosyalarınızı indirin

2. **Şifre Çözme**:
   - "Şifre Çöz" sekmesini seçin
   - .enc dosyalarınızı sürükleyip bırakın veya seçin
   - Şifreleme yaparken kullandığınız şifreyi girin
   - "Dosyaların Şifresini Çöz" butonuna tıklayın
   - Orijinal dosyalarınızı indirin

## Güvenlik Özellikleri

- **AES-256-GCM**: Hükümetler ve finansal kurumlar tarafından kullanılan, son derece güvenli şifreleme algoritması
- **PBKDF2 Anahtar Türetme**: Rastgele salt ile brute-force saldırılarına karşı koruma
- **Uçtan Uca Şifreleme**: Tüm işlemler tarayıcınızda gerçekleşir, hiçbir veri iletilmez
- **Dosya Bütünlüğü**: GCM modu, şifrelenmiş dosyaların değiştirilip değiştirilmediğini doğrulamak için kimlik doğrulama sağlar

## Proje Kurulumu

```sh
# 1. Repository'yi klonlayın
git clone https://github.com/gokmency/SecureFile.git

# 2. Proje dizinine gidin
cd SecureFile

# 3. Gerekli bağımlılıkları yükleyin
npm install

# 4. Geliştirme sunucusunu başlatın
npm run dev
```

## Katkıda Bulunma

Katkılara açığız! Lütfen bir pull request gönderin veya öneriniz için bir issue açın.

## Lisans

MIT

## İletişim

Twitter: [@gokmeneth](https://twitter.com/gokmeneth)

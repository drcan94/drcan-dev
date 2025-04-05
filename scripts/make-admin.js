const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error('Lütfen bir e-posta adresi belirtin!');
        console.error('Kullanım: node scripts/make-admin.js your-email@example.com');
        process.exit(1);
    }

    try {
        // Kullanıcıyı bul
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.error(`"${email}" e-posta adresiyle bir kullanıcı bulunamadı.`);
            console.error('Lütfen önce siteye giriş yapın ve doğru e-posta adresini kullandığınızdan emin olun.');
            process.exit(1);
        }

        // Kullanıcıyı admin yap
        const updatedUser = await prisma.user.update({
            where: { email },
            data: { isAdmin: true },
        });

        console.log(`🎉 Başarılı! "${email}" artık admin yetkilerine sahip.`);
        console.log('Şimdi /admin sayfasına gidebilir ve yönetici paneline erişebilirsiniz.');
    } catch (error) {
        console.error('Bir hata oluştu:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main(); 
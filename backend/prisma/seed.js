const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { encryptSensitiveFields } = require('../src/utils/prismaEncryption.util');

const prisma = new PrismaClient();

function generatePhoneNumber() {
  let phone = '08';
  for (let i = 0; i < 10; i++) {
    phone += Math.floor(Math.random() * 10); // 0-9
  }
  return phone;
}

async function main() {
  console.log('Starting database seeding...\n');
  // Jenis Kelamin Keys: 'L' = Laki-laki, 'P' = Perempuan
  console.log('Seeding Jenis Kelamin...');

  await prisma.jenisKelamin.upsert({
    where: { idJenisKelamin: 'L' },
    update: {},
    create: {
      idJenisKelamin: 'L',
      namaJenisKelamin: 'Laki-laki',
    },
  });

  await prisma.jenisKelamin.upsert({
    where: { idJenisKelamin: 'P' },
    update: {},
    create: {
      idJenisKelamin: 'P',
      namaJenisKelamin: 'Perempuan',
    },
  });

  console.log('Jenis Kelamin seeded (2 records)\n');

  console.log('Seeding Status Pernikahan...');
  // Status Pernikahan
  const statusPernikahanData = [
    { id: 'BELUM_MENIKAH', nama: 'Belum Menikah' },
    { id: 'MENIKAH', nama: 'Menikah' },
    { id: 'CERAI_HIDUP', nama: 'Cerai Hidup' },
    { id: 'CERAI_MATI', nama: 'Cerai Mati' },
  ];

  for (const sp of statusPernikahanData) {
    await prisma.statusPernikahan.upsert({
      where: { idStatusPernikahan: sp.id },
      update: {},
      create: {
        idStatusPernikahan: sp.id,
        namaStatus: sp.nama,
      },
    });
  }

  console.log('Status Pernikahan seeded (4 records)\n');
  // Status Deposito
  console.log('Seeding Status Deposito...');

  const statusDepositoData = [
    { id: 'PROSPEK', nama: 'Prospek', deskripsi: 'Nasabah potensial yang belum dihubungi' },
    { id: 'DIHUBUNGI', nama: 'Sedang Dihubungi', deskripsi: 'Nasabah sedang dalam proses follow-up' },
    { id: 'TERTARIK', nama: 'Tertarik', deskripsi: 'Nasabah menunjukkan ketertarikan' },
    { id: 'TIDAK_TERTARIK', nama: 'Tidak Tertarik', deskripsi: 'Nasabah menolak penawaran' },
    { id: 'AKTIF', nama: 'Deposito Aktif', deskripsi: 'Deposito sudah dibuka dan aktif' },
    { id: 'JATUH_TEMPO', nama: 'Jatuh Tempo', deskripsi: 'Deposito sudah jatuh tempo' },
    { id: 'DICAIRKAN', nama: 'Dicairkan', deskripsi: 'Deposito sudah dicairkan' },
  ];

  for (const sd of statusDepositoData) {
    await prisma.statusDeposito.upsert({
      where: { idStatusDeposito: sd.id },
      update: {},
      create: {
        idStatusDeposito: sd.id,
        namaStatus: sd.nama,
        deskripsi: sd.deskripsi,
      },
    });
  }

  console.log('Status Deposito seeded (7 records)\n');

  // User Accounts
  // Default Admin Account
  console.log('Seeding Admin...');

  const adminEmail = 'admin@telesales.com';
  const adminPassword = 'Admin123!';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: hashedPassword,
      isActive: true,
    },
  });

  const existingAdmin = await prisma.admin.findFirst({
    where: { idUser: adminUser.idUser },
  });

  if (!existingAdmin) {
    await prisma.admin.create({
      data: {
        user: { connect: { idUser: adminUser.idUser } },
      },
    });
  }


  console.log(`Admin created: ${adminEmail} / ${adminPassword}\n`);

  // Sales Accounts (10 records)
  console.log('Seeding Sales...');

  const salesData = [
    { nama: 'Budi Santoso', email: 'budi@telesales.com', nomorTelepon: '081234567890', domisili: 'Jakarta' },
    { nama: 'Siti Rahayu', email: 'siti@telesales.com', nomorTelepon: '081234567891', domisili: 'Bandung' },
    { nama: 'Ahmad Wijaya', email: 'ahmad@telesales.com', nomorTelepon: '081234567892', domisili: 'Surabaya' },
    { nama: 'Dewi Lestari', email: 'dewi@telesales.com', nomorTelepon: '081234567893', domisili: 'Jakarta' },
    { nama: 'Eko Prasetyo', email: 'eko@telesales.com', nomorTelepon: '081234567894', domisili: 'Medan' },
    { nama: 'Fitri Handayani', email: 'fitri@telesales.com', nomorTelepon: '081234567895', domisili: 'Semarang' },
    { nama: 'Gilang Ramadhan', email: 'gilang@telesales.com', nomorTelepon: '081234567896', domisili: 'Yogyakarta' },
    { nama: 'Hani Kusuma', email: 'hani@telesales.com', nomorTelepon: '081234567897', domisili: 'Makassar' },
    { nama: 'Indra Gunawan', email: 'indra@telesales.com', nomorTelepon: '081234567898', domisili: 'Bali' },
    { nama: 'Joko Widodo', email: 'joko@telesales.com', nomorTelepon: '081234567899', domisili: 'Solo' },
  ];

  const salesPassword = 'Sales123!';
  const salesHashedPassword = await bcrypt.hash(salesPassword, 12);

  const createdSales = [];
  for (const sales of salesData) {
    const user = await prisma.user.upsert({
      where: { email: sales.email },
      update: {},
      create: {
        email: sales.email,
        passwordHash: salesHashedPassword,
        isActive: true,
      },
    });
    const existingSales = await prisma.sales.findFirst({
      where: { idUser: user.idUser },
    });

    if (!existingSales) {
      const encrypted = encryptSensitiveFields(sales); // if you encrypt any field
      await prisma.sales.create({
        data: {
          user: { connect: { idUser: user.idUser } },
          nama: sales.nama,
          nomorTelepon: encrypted.nomorTelepon,
          domisili: encrypted.domisili,
        },
      });
    }
    createdSales.push(user);
  }

  console.log(`Sales accounts created (${createdSales.length} records)`);
  console.log(`   Password for all: ${salesPassword}\n`);

  // NASABAH
  console.log('Seeding Nasabah...');

  const namaList = [
    'Andi Pratama', 'Ani Susanti', 'Arief Budiman', 'Ayu Wijaya', 'Bambang Sutrisno',
    'Bima Sakti', 'Bunga Citra', 'Candra Wijaya', 'Cici Paramida', 'Dedi Kurniawan',
    'Dina Mariana', 'Dwi Anggara', 'Eka Putri', 'Elsa Pitaloka', 'Fajar Mulyadi',
    'Fani Wulandari', 'Gita Gutawa', 'Hadi Pranoto', 'Hana Montana', 'Hari Setiawan',
    'Hendy Setiono', 'Ika Permata', 'Ilham Habibie', 'Indah Dewi', 'Irfan Hakim',
    'Ita Purnamasari', 'Jaka Sembung', 'Joko Susilo', 'Joni Iskandar', 'Julia Perez',
    'Karina Salim', 'Kartika Sari', 'Krisna Mukti', 'Lani Misalucha', 'Lestari Moerdijat',
    'Lia Waode', 'Linda Kartika', 'Lina Marlina', 'Made Wiryana', 'Mayang Sari',
    'Mila Kusumawati', 'Nadya Hutagalung', 'Nana Mirdad', 'Nia Ramadhani', 'Novi Ayla',
    'Nurul Hasanah', 'Oki Setiana', 'Omar Sharif', 'Pasha Ungu', 'Paula Verhoeven',
    'Putri Anggraini', 'Qory Sandioriva', 'Raffi Ahmad', 'Rani Ramadhani', 'Ratna Sari',
    'Reza Rahadian', 'Rina Nose', 'Rini Mentari', 'Rio Dewanto', 'Risa Saraswati',
    'Rizki Ramadhan', 'Rudi Hermawan', 'Rudy Habibie', 'Salsabila', 'Sandra Dewi',
    'Sari Rahmawati', 'Sheila on 7', 'Siti Badriah', 'Siti Nurhaliza', 'Sri Mulyani',
    'Sri Wahyuni', 'Stevan William', 'Surya Sahetapy', 'Syahrini', 'Tarra Budiman',
    'Tasya Kamila', 'Teguh Santoso', 'Titi Kamal', 'Tono Suprapto', 'Uus Darto',
    'Vicky Prasetyo', 'Vina Panduwinata', 'Wawan Setiadi', 'Widya Ningrum', 'Wulan Guritno',
    'Yandi Setiawan', 'Yoga Aditya', 'Yudi Latif', 'Yuki Kato', 'Yuni Astuti',
    'Zara Adhisty', 'Zaskia Gotik', 'Zian Spectre', 'Zidane Rouf', 'Zulkifli Hasan',
    'Agus Salim', 'Bayu Skak', 'Cinta Laura', 'Dimas Beck', 'Erna Susanti',
  ];

  const pekerjaanList = ['PNS', 'Karyawan Swasta', 'Wiraswasta', 'Pegawai BUMN', 'Profesional', 'Guru', 'Dokter', 'Engineer'];
  const domisiliList = ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Semarang', 'Yogyakarta', 'Makassar', 'Bali', 'Solo', 'Malang'];
  const statusPernikahanList = ['BELUM_MENIKAH', 'MENIKAH', 'CERAI_HIDUP', 'CERAI_MATI'];
  const jenisKelaminList = ['L', 'P'];

  const nasabahCount = await prisma.nasabah.count();

  let createdNasabah = [];
  if (nasabahCount === 0) {
    const nasabahDataBulk = [];

    for (let i = 0; i < 100; i++) {
      nasabahDataBulk.push({
        nama: namaList[i],
        umur: Math.floor(Math.random() * (65 - 25) + 25),
        pekerjaan: pekerjaanList[Math.floor(Math.random() * pekerjaanList.length)],
        domisili: domisiliList[Math.floor(Math.random() * domisiliList.length)],
        gaji: Math.floor(Math.random() * (50000000 - 3000000) + 3000000),
        idStatusPernikahan: statusPernikahanList[Math.floor(Math.random() * statusPernikahanList.length)],
        jenisKelamin: jenisKelaminList[Math.floor(Math.random() * jenisKelaminList.length)],
        nomorTelepon: generatePhoneNumber(),
      });
    }

    await prisma.nasabah.createMany({
      data: nasabahDataBulk,
      skipDuplicates: true,
    });

    createdNasabah = await prisma.nasabah.findMany();
    console.log(` Nasabah created (${createdNasabah.length} records)\n`);
  } else {
    createdNasabah = await prisma.nasabah.findMany();
    console.log(`ℹ️  Nasabah already exists (${nasabahCount} records)\n`);
  }

  // ==========================================
  // 7. DEPOSITO (create for ~60% of nasabah)
  // ==========================================
  console.log('📝 Seeding Deposito...');

  const depositoCount = await prisma.deposito.count();

  if (depositoCount === 0) {
    const jenisDepositoList = ['Deposito Berjangka 3 Bulan', 'Deposito Berjangka 6 Bulan', 'Deposito Berjangka 12 Bulan', 'Deposito Berjangka 24 Bulan'];
    const statusDepositoList = ['PROSPEK', 'DIHUBUNGI', 'TERTARIK', 'TIDAK_TERTARIK', 'AKTIF'];

    const depositoData = [];

    // Create deposito for 60 random nasabah
    const selectedNasabah = createdNasabah.sort(() => 0.5 - Math.random()).slice(0, 60);

    for (const nasabah of selectedNasabah) {
      depositoData.push({
        idNasabah: nasabah.idNasabah,
        jenisDeposito: jenisDepositoList[Math.floor(Math.random() * jenisDepositoList.length)],
        statusDeposito: statusDepositoList[Math.floor(Math.random() * statusDepositoList.length)],
      });
    }

    await prisma.deposito.createMany({
      data: depositoData,
    });

    console.log(`✅ Deposito created (${depositoData.length} records)\n`);
  } else {
    console.log(`ℹ️  Deposito already exists (${depositoCount} records)\n`);
  }
  /*
  // ==========================================
  // 8. ASSIGNMENTS (assign nasabah to sales)
  // ==========================================
  console.log('📝 Seeding Assignments...');

  const assignmentCount = await prisma.salesNasabahAssignment.count();

  if (assignmentCount === 0) {
    const assignmentsData = [];

    // Distribute nasabah evenly to sales
    const nasabahPerSales = Math.floor(createdNasabah.length / createdSales.length);

    for (let i = 0; i < createdSales.length; i++) {
      const salesId = createdSales[i].idSales;
      const startIdx = i * nasabahPerSales;
      const endIdx = i === createdSales.length - 1 ? createdNasabah.length : startIdx + nasabahPerSales;

      for (let j = startIdx; j < endIdx; j++) {
        assignmentsData.push({
          idSales: salesId,
          idNasabah: createdNasabah[j].idNasabah,
          isActive: true,
        });
      }
    }

    await prisma.salesNasabahAssignment.createMany({
      data: assignmentsData,
    });

    console.log(`✅ Assignments created (${assignmentsData.length} records)\n`);
  } else {
    console.log(`ℹ️  Assignments already exist (${assignmentCount} records)\n`);
  }
  */
  // ==========================================
  // 9. HISTORI TELEPON (create some call history)
  // ==========================================
  console.log('📝 Seeding Histori Telepon...');

  const historiCount = await prisma.historiTelepon.count();

  if (historiCount === 0) {
    const hasilTeleponList = [
      'Tertarik',
      'Tidak Tertarik',
      'Voicemail',
      'Tidak Terangkat',
    ];

    const historiData = [];

    // Create 2-3 call history for random 30 nasabah
    const selectedNasabah = createdNasabah.sort(() => 0.5 - Math.random()).slice(0, 30);

    for (const nasabah of selectedNasabah) {
      // Find which sales is assigned to this nasabah
      const assignment = await prisma.salesNasabahAssignment.findFirst({
        where: { idNasabah: nasabah.idNasabah, isActive: true },
      });

      if (assignment) {
        const numCalls = Math.floor(Math.random() * 3) + 1; // 1-3 calls

        for (let i = 0; i < numCalls; i++) {
          const daysAgo = Math.floor(Math.random() * 30); // Last 30 days
          const tanggal = new Date();
          tanggal.setDate(tanggal.getDate() - daysAgo);

          historiData.push({
            idNasabah: nasabah.idNasabah,
            idSales: assignment.idSales,
            tanggalTelepon: tanggal,
            lamaTelepon: Math.floor(Math.random() * 600) + 60, // 1-10 minutes
            hasilTelepon: hasilTeleponList[Math.floor(Math.random() * hasilTeleponList.length)],
            jumlahTelepon: i + 1,
            catatan: i === numCalls - 1 ? 'Latest call' : null,
          });
        }
      }
    }

    await prisma.historiTelepon.createMany({
      data: historiData,
    });

    console.log(`✅ Histori Telepon created (${historiData.length} records)\n`);
  } else {
    console.log(`ℹ️  Histori Telepon already exists (${historiCount} records)\n`);
  }

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('📊 Seeding Summary:');
  const counts = await Promise.all([
    prisma.jenisKelamin.count(),
    prisma.statusPernikahan.count(),
    prisma.statusDeposito.count(),
    prisma.admin.count(),
    prisma.sales.count(),
    prisma.nasabah.count(),
    prisma.deposito.count(),
    prisma.salesNasabahAssignment.count(),
    prisma.historiTelepon.count(),
  ]);

  console.log(`   Jenis Kelamin:        ${counts[0]}`);
  console.log(`   Status Pernikahan:    ${counts[1]}`);
  console.log(`   Status Deposito:      ${counts[2]}`);
  console.log(`   Admin:                ${counts[3]}`);
  console.log(`   Sales:                ${counts[4]}`);
  console.log(`   Nasabah:              ${counts[5]}`);
  console.log(`   Deposito:             ${counts[6]}`);
  console.log(`   Assignments:          ${counts[7]}`);
  console.log(`   Histori Telepon:      ${counts[8]}`);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin: admin@telesales.com / Admin123!');
  console.log('Sales: budi@telesales.com / Sales123! (and 9 others)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    console.error(e.stack);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

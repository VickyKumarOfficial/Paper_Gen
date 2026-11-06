/** Phase 0 Seed: Curriculum & Sample Papers */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed: CBSE Class 11 Physics
  const curriculum = await prisma.curriculum.create({
    data: {
      class: 11,
      board: 'CBSE',
      subject: 'Physics',
      versionHash: '2025-04',
    },
  });

  await prisma.chapter.createMany({
    data: [
      { title: 'Unit I - Physical World and Measuring Hands', curriculumId: curriculum.id },
      { title: 'Unit II - Kinematics', curriculumId: curriculum.id },
      { title: 'Unit III - Laws of Motion', curriculumId: curriculum.id },
      { title: 'Unit IV - Work, Energy and Power', curriculumId: curriculum.id },
      { title: 'Unit V - Motion of System of Particles', curriculumId: curriculum.id },
    ],
  });

  console.log('✅ Seeded CBSE Class 11 Physics curriculum');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
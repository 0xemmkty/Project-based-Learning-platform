import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearData() {
  try {
    // 按照关系顺序清空数据
    await prisma.$transaction([
      prisma.media.deleteMany(),
      prisma.tag.deleteMany(),
      prisma.project.deleteMany(),
    ])
    
    console.log('All data cleared successfully!')
  } catch (error) {
    console.error('Error clearing data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearData() 
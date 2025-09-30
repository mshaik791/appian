import { prisma } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  const pw = await bcrypt.hash('Password123!', 10)

  const faculty = await prisma.user.upsert({
    where: { email: 'faculty@appian.dev' },
    update: {},
    create: { email: 'faculty@appian.dev', hashedPassword: pw, role: 'FACULTY' }
  })

  const student = await prisma.user.upsert({
    where: { email: 'student@appian.dev' },
    update: {},
    create: { email: 'student@appian.dev', hashedPassword: pw, role: 'STUDENT' }
  })

  const rubric = await prisma.rubric.create({
    data: {
      name: 'CSWE EPAS (mini)',
      epasYear: 2022,
      structureJson: {
        competencies: {
          engagement: { 
            desc: 'Engage with individuals, families, groups', 
            indicators: ['open-ended questions', 'reflective listening', 'shared goals'] 
          },
          ethics: { 
            desc: 'Ethical and professional behavior', 
            indicators: ['informed consent', 'boundaries', 'non-judgmental language'] 
          },
          diversity: { 
            desc: 'Diversity and difference', 
            indicators: ['acknowledge identity', 'avoid assumptions', 'invite perspective'] 
          }
        },
        scale: { min: 0, max: 4 }
      }
    }
  })

  const case1 = await prisma.case.create({
    data: {
      title: 'First-Gen Undergraduate Advisee',
      description: 'Student balancing work, remittances, and course load; first in family at college.',
      culturalContextJson: { 
        identity: ['Latinx', 'first-gen', 'bilingual (Eng/Span)'], 
        values: ['family obligation', 'respect'], 
        languageNotes: ['occasionally code-switches'] 
      },
      objectivesJson: ['Build rapport', 'Explore stressors', 'Co-create an action plan'],
      rubricId: rubric.id,
      createdBy: faculty.id
    }
  })

  const case2 = await prisma.case.create({
    data: {
      title: 'Afghan Refugee Parent',
      description: 'Recent arrival with school-aged child; navigating healthcare/benefits; trauma history implied.',
      culturalContextJson: { 
        identity: ['Afghan', 'Muslim'], 
        values: ['modesty', 'family privacy'], 
        languageNotes: ['prefers Dari interpreter; basic English'] 
      },
      objectivesJson: ['Establish safety', 'Assess needs', 'Provide culturally-appropriate referrals'],
      rubricId: rubric.id,
      createdBy: faculty.id
    }
  })

  await prisma.persona.createMany({
    data: [
      {
        caseId: case1.id,
        name: 'María G.',
        backgroundJson: { age: 19, major: 'Sociology', workHours: 24 },
        voiceId: 'voice_en_female_01',
        avatarId: 'heygen_preset_01',
        promptTemplate: 'You are María, a first-gen Latinx undergrad advisee...',
        safetyJson: { blockedTopics: ['diagnosis', 'legal advice'] }
      },
      {
        caseId: case2.id,
        name: 'Parwin A.',
        backgroundJson: { age: 36, origin: 'Kabul', childAge: 8 },
        voiceId: 'voice_en_female_02',
        avatarId: 'heygen_preset_02',
        promptTemplate: 'You are Parwin, an Afghan parent recently resettled...',
        safetyJson: { blockedTopics: ['diagnosis', 'legal advice'] }
      }
    ]
  })

  console.log('Seed complete:', { faculty: faculty.email, student: student.email })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

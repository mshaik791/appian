import { prisma } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  const pw = await bcrypt.hash('Password123!', 10)

  const faculty = await prisma.user.upsert({
    where: { email: 'faculty@oxbridgeducation.dev' },
    update: {},
    create: { email: 'faculty@oxbridgeducation.dev', hashedPassword: pw, role: 'FACULTY' }
  })

  const student = await prisma.user.upsert({
    where: { email: 'student@oxbridgeducation.dev' },
    update: {},
    create: { email: 'student@oxbridgeducation.dev', hashedPassword: pw, role: 'STUDENT' }
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@oxbridgeducation.dev' },
    update: {},
    create: { email: 'admin@oxbridgeducation.dev', hashedPassword: pw, role: 'ADMIN' }
  })

  // Create competencies
  const engagementCompetency = await prisma.competency.upsert({
    where: { name: 'Engagement' },
    update: {},
    create: {
      name: 'Engagement',
      desc: 'Engage with individuals, families, groups, organizations, and communities to advance social and economic justice and human rights'
    }
  })

  const ethicsCompetency = await prisma.competency.upsert({
    where: { name: 'Ethics' },
    update: {},
    create: {
      name: 'Ethics',
      desc: 'Apply social work ethical principles to guide professional practice and uphold professional standards'
    }
  })

  const diversityCompetency = await prisma.competency.upsert({
    where: { name: 'Diversity' },
    update: {},
    create: {
      name: 'Diversity',
      desc: 'Engage diversity and difference in practice, recognizing the importance of cultural humility and intersectionality'
    }
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
      learningObjectivesJson: [
        'Demonstrate active listening skills to build trust with first-generation college students',
        'Apply cultural humility when discussing family obligations and financial pressures',
        'Practice collaborative goal-setting techniques to create realistic academic plans'
      ],
      competencyId: engagementCompetency.id,
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
      learningObjectivesJson: [
        'Demonstrate cultural sensitivity when working with refugee populations',
        'Apply trauma-informed approaches to assessment and intervention',
        'Practice ethical decision-making regarding confidentiality and family privacy'
      ],
      competencyId: diversityCompetency.id,
      rubricId: rubric.id,
      createdBy: faculty.id
    }
  })

  const case3 = await prisma.case.create({
    data: {
      title: 'Elderly Client with Dementia',
      description: 'Family conflict over care decisions; client showing signs of cognitive decline.',
      culturalContextJson: { 
        identity: ['White', 'middle-class', 'rural'], 
        values: ['independence', 'family loyalty'], 
        languageNotes: ['clear English communication'] 
      },
      objectivesJson: ['Assess capacity', 'Facilitate family meeting', 'Explore care options'],
      learningObjectivesJson: [
        'Apply ethical principles when assessing client capacity and autonomy',
        'Demonstrate skills in facilitating difficult family conversations',
        'Practice professional boundaries while maintaining empathy and compassion'
      ],
      competencyId: ethicsCompetency.id,
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
      },
      {
        caseId: case3.id,
        name: 'Robert M.',
        backgroundJson: { age: 78, condition: 'early dementia', familySize: 3 },
        voiceId: 'voice_en_male_01',
        avatarId: 'heygen_preset_03',
        promptTemplate: 'You are Robert, an elderly client with early signs of dementia...',
        safetyJson: { blockedTopics: ['diagnosis', 'legal advice'] }
      }
    ]
  })

  // --- BSW Track and Maria Aguilar Case (Session 1) ---
  // Ensure Track exists
  const bswTrack = await prisma.track.upsert({
    where: { id: 'bsw' },
    update: {},
    create: { id: 'bsw', name: 'BSW' },
  })

  // Ensure competency for the case (use Engagement or create if missing)
  const bswCompetency = engagementCompetency

  // Create the case with additional UX fields
  const mariaCase = await prisma.case.upsert({
    where: { id: 'maria-aguilar-s1' },
    update: {},
    create: {
      id: 'maria-aguilar-s1',
      title: 'Maria Aguilar — Session 1',
      description: 'Video-led session with Maria followed by reflective Q&A.',
      culturalContextJson: {
        identity: ['Black', 'lesbian'],
        cityTransition: true,
        partner: 'Jordan',
      },
      objectivesJson: [
        'Build rapport using reflective listening',
        'Invite client narrative around belonging and identity',
        'Collaborate on next steps in a culturally responsive way',
      ],
      learningObjectivesJson: [
        'Demonstrate empathy and cultural responsiveness during intake',
      ],
      competencyId: bswCompetency.id,
      rubricId: rubric.id,
      createdBy: faculty.id,

      // New optional fields
      trackId: bswTrack.id,
      personaName: 'Maria Aguilar',
      shortBio:
        'Dynamic and thoughtful woman navigating a new city with her wife Jordan; reflective about dual identity as a Black lesbian; building community, coping with discrimination, seeking belonging.',
      demographicsJson: {
        age: 29,
        gender: 'Female',
        ethnicity: 'African American',
        marital: 'Married',
        occupation: 'Office Manager',
        admissionDate: '2025-10-13',
      },
      coverImageUrl: '/images/maria_aguilar.jpg',
      competencyCode: '6',
      learningObjective:
        'Demonstrate empathy, reflective listening, and culturally responsive engagement; invite client narrative and collaborate on next steps.',
    },
  })

  // Ordered questions 1..3
  await prisma.caseQuestion.upsert({
    where: { caseId_order: { caseId: mariaCase.id, order: 1 } },
    update: {},
    create: {
      caseId: mariaCase.id,
      order: 1,
      prompt:
        'What did you notice about Maria’s priorities and concerns during the video? Provide 2-3 observations.',
    },
  })
  await prisma.caseQuestion.upsert({
    where: { caseId_order: { caseId: mariaCase.id, order: 2 } },
    update: {},
    create: {
      caseId: mariaCase.id,
      order: 2,
      prompt:
        'How would you demonstrate culturally responsive engagement in your next response to Maria? Include at least one specific phrase you would use.',
    },
  })
  await prisma.caseQuestion.upsert({
    where: { caseId_order: { caseId: mariaCase.id, order: 3 } },
    update: {},
    create: {
      caseId: mariaCase.id,
      order: 3,
      prompt:
        'Collaborate on one actionable next step with Maria that supports belonging and safety. Explain why it aligns with her goals.',
    },
  })

  // Media asset for the MP4
  await prisma.mediaAsset.upsert({
    where: { id: `media-${mariaCase.id}-video` },
    update: {},
    create: {
      id: `media-${mariaCase.id}-video`,
      caseId: mariaCase.id,
      path: '/videos/maria_aguilar_session1.mp4',
      kind: 'video',
    },
  })

  console.log('Seed complete:', { 
    faculty: faculty.email, 
    student: student.email,
    admin: admin.email,
    competencies: [engagementCompetency.name, ethicsCompetency.name, diversityCompetency.name],
    cases: 3 + 1,
    personas: 3
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

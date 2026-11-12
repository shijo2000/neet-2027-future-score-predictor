import { PredictionInputs, PredictionResult, ScoreBreakdown } from '../types';

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi NCR',
  'Jammu & Kashmir',
  'Ladakh',
  'Chandigarh',
  'Puducherry',
  'Other / NRI'
] as const;

export const MOCK_SCORE_RANGES = [
  { id: 'below-300', label: 'Under 300 (Starting out / Foundational)', baseMidpoint: 260 },
  { id: '300-399', label: '300 – 399 (Building concepts)', baseMidpoint: 350 },
  { id: '400-479', label: '400 – 479 (Intermediate stage)', baseMidpoint: 440 },
  { id: '480-549', label: '480 – 549 (Competitive foundation)', baseMidpoint: 515 },
  { id: '550-619', label: '550 – 619 (High potential state GMC range)', baseMidpoint: 585 },
  { id: '620-720', label: '620 – 720 (Top ranking aspirant range)', baseMidpoint: 650 },
];

export const PREP_LEVELS = [
  { id: 'class11-beginner', label: 'Class 11 Aspirant (Early Stage)', bonus: 25 },
  { id: 'class11-advance', label: 'Class 11 Aspirant (Strong Foundation)', bonus: 35 },
  { id: 'class12-starter', label: 'Class 12 Starter (Balancing Boards + NEET)', bonus: 30 },
  { id: 'class12-in-depth', label: 'Class 12 Advanced (Revision & Test Series)', bonus: 40 },
  { id: 'dropper-repeater', label: 'Repeater / Dedicated 1-Year Dropper', bonus: 45 },
];

/**
 * Deterministic Transparent Score Calculator
 * 
 * Formula rationale:
 * 1. Base Score = Midpoint of current mock score range
 * 2. Study Hour Factor = (dailyHours - 3) * (monthsRemaining * 2.1)
 *    -> Regular, sustainable daily hours over remaining months compound into question solving speed.
 * 3. Syllabus Coverage Factor = (syllabusCompletion % - 50) * 1.2
 *    -> Completing full NCERT syllabus unlocks unseen questions in Section B.
 * 4. Timeline Factor = min(1.25, max(0.8, 1 + (monthsRemaining - 12) * 0.02))
 * 5. Prep Level Bonus = extra points for structured systematic preparation.
 * 
 * Final Score is clamped between max(baseScore - 20, 180) and 720.
 */
export function calculateNeetScore(inputs: PredictionInputs): PredictionResult {
  const selectedRange = MOCK_SCORE_RANGES.find(r => r.id === inputs.mockScoreRange) || MOCK_SCORE_RANGES[1];
  const baseMockMidpoint = selectedRange.baseMidpoint;

  const selectedPrep = PREP_LEVELS.find(p => p.id === inputs.prepLevel) || PREP_LEVELS[0];
  const prepStageBonus = selectedPrep.bonus;

  // Study hours impact (baseline 3 hours, higher study hours yield growth up to 10 hrs)
  const normalizedHours = Math.min(12, Math.max(2, inputs.dailyStudyHours));
  const studyHoursDelta = normalizedHours - 3; // e.g. 7 hrs => +4
  // Compounded with months remaining
  const studyHourBoost = Math.round(studyHoursDelta * (inputs.monthsRemaining * 1.45));

  // Syllabus completion impact (from 0 to 100%)
  const syllabusFactor = Math.round((inputs.syllabusCompletion - 40) * 1.15);

  // Timeline multiplier
  const timelineMultiplier = Math.max(0.85, Math.min(1.2, 1 + (inputs.monthsRemaining - 12) * 0.015));

  // Raw calculated score
  const rawSum = baseMockMidpoint + (studyHourBoost + syllabusFactor + prepStageBonus) * timelineMultiplier;
  
  // Cap at 720 maximum, and minimum realistic floor
  const cappedScore = Math.min(720, Math.max(210, Math.round(rawSum)));

  // Score variance band (+/- 15 to 25 points realistic margin of error on exam day)
  const margin = Math.round(Math.max(12, 28 - (inputs.dailyStudyHours * 1.2)));
  const scoreBandMin = Math.max(180, cappedScore - margin);
  const scoreBandMax = Math.min(720, cappedScore + margin);

  // Percentile estimate based on historical NTA NEET score vs percentile distribution
  let estimatedPercentile = 50.0;
  if (cappedScore >= 700) estimatedPercentile = 99.98;
  else if (cappedScore >= 670) estimatedPercentile = 99.85;
  else if (cappedScore >= 640) estimatedPercentile = 99.20;
  else if (cappedScore >= 600) estimatedPercentile = 98.10;
  else if (cappedScore >= 550) estimatedPercentile = 94.50;
  else if (cappedScore >= 500) estimatedPercentile = 88.00;
  else if (cappedScore >= 450) estimatedPercentile = 80.50;
  else if (cappedScore >= 400) estimatedPercentile = 72.00;
  else if (cappedScore >= 350) estimatedPercentile = 62.00;
  else estimatedPercentile = Math.max(35.0, ((cappedScore / 720) * 80));

  // Subject breakdown logic (Biology constitutes 50% = 360 marks, Physics 180, Chemistry 180)
  const breakdown = calculateSubjectBreakdown(cappedScore, inputs.keyWeakSubject);

  // College tier evaluation
  const collegeTier = evaluateCollegeTier(cappedScore);

  // Tailored study tips
  const studyTips = generateStudyTips(inputs, cappedScore);

  // Motivational quote
  const motivatingQuote = getMotivationalQuote(cappedScore, inputs.name);

  return {
    studentName: inputs.name || 'Future Doctor',
    studentPhone: inputs.phone,
    state: inputs.state || 'India',
    estimatedScore: cappedScore,
    scoreBandMin,
    scoreBandMax,
    estimatedPercentile: Number(estimatedPercentile.toFixed(2)),
    collegeTier,
    breakdown,
    motivatingQuote,
    studyTips,
    formulaBreakdown: {
      baseMockMidpoint,
      studyHourBoost,
      syllabusFactor,
      timelineMultiplier: Number(timelineMultiplier.toFixed(2)),
      prepStageBonus,
      rawTotal: Math.round(rawSum),
      cappedScore
    }
  };
}

function calculateSubjectBreakdown(totalScore: number, weakSubject?: string): ScoreBreakdown {
  // Biology is traditionally the highest scoring subject for NEET aspirants (typically 48%-52% of total score)
  // Physics is often the toughest, Chemistry is moderate
  let bioRatio = 0.50;
  let chemRatio = 0.26;
  let physRatio = 0.24;

  if (weakSubject === 'physics') {
    physRatio = 0.20;
    chemRatio = 0.28;
    bioRatio = 0.52;
  } else if (weakSubject === 'chemistry') {
    chemRatio = 0.22;
    physRatio = 0.26;
    bioRatio = 0.52;
  } else if (weakSubject === 'botany' || weakSubject === 'zoology') {
    bioRatio = 0.46;
    physRatio = 0.27;
    chemRatio = 0.27;
  }

  let biologyTotal = Math.min(360, Math.round(totalScore * bioRatio));
  let physics = Math.min(180, Math.round(totalScore * physRatio));
  let chemistry = Math.min(180, Math.round(totalScore * chemRatio));

  // Balancing adjustment to ensure exact sum equals totalScore
  const currentSum = biologyTotal + physics + chemistry;
  const diff = totalScore - currentSum;
  biologyTotal += diff;

  // Split biology into Botany & Zoology (each max 180)
  const botany = Math.min(180, Math.round(biologyTotal / 2));
  const zoology = biologyTotal - botany;

  return {
    physics: Math.max(0, Math.min(180, physics)),
    chemistry: Math.max(0, Math.min(180, chemistry)),
    botany: Math.max(0, Math.min(180, botany)),
    zoology: Math.max(0, Math.min(180, zoology)),
    biologyTotal: Math.max(0, Math.min(360, biologyTotal)),
  };
}

function evaluateCollegeTier(score: number) {
  if (score >= 680) {
    return {
      tierName: 'Tier 1 Premier National Institute',
      description: 'Exceptional probability for Top 10 Institutes under 15% All India Quota (AIQ).',
      badgeColor: 'bg-emerald-500 text-white',
      exampleColleges: ['AIIMS New Delhi', 'MAMC New Delhi', 'VMMC New Delhi', 'JIPMER Puducherry', 'IMS BHU'],
      isGmcLikely: true
    };
  } else if (score >= 640) {
    return {
      tierName: 'Top State Government Medical College (GMC)',
      description: 'Very strong candidate for top-tier State GMCs and AIIMS institutes across states.',
      badgeColor: 'bg-blue-600 text-white',
      exampleColleges: ['SMS Jaipur', 'KGMU Lucknow', 'Grant Medical Mumbai', 'Madras Medical College', 'GMC Kozhikode'],
      isGmcLikely: true
    };
  } else if (score >= 590) {
    return {
      tierName: 'State Government Medical College (General Quota)',
      description: 'Competitive for State Quota GMC seats & peripheral AIIMS institutes under general category.',
      badgeColor: 'bg-indigo-600 text-white',
      exampleColleges: ['State GMCs across major districts', 'AIIMS Deoghar / Guwahati', 'Semi-Govt Medical Colleges'],
      isGmcLikely: true
    };
  } else if (score >= 520) {
    return {
      tierName: 'Semi-Government / Reserved GMC / High-Yield Private',
      description: 'Viable for reserved categories in GMCs, government-quota seats in private colleges, and state counseling.',
      badgeColor: 'bg-amber-500 text-white',
      exampleColleges: ['Government-quota Private Colleges', 'KMC Manipal', 'Top State Semi-Govt Institutes'],
      isGmcLikely: false
    };
  } else if (score >= 400) {
    return {
      tierName: 'Private Medical Colleges & Recognized Abroad MBBS',
      description: 'Safely qualifying NEET; ideal for Deemed Universities in India or WHO/NMC compliant top universities abroad.',
      badgeColor: 'bg-purple-600 text-white',
      exampleColleges: ['Deemed Universities (DY Patil, Sri Ramachandra)', 'Recognized Govt Universities in Uzbekistan & Georgia'],
      isGmcLikely: false
    };
  } else {
    return {
      tierName: 'NEET Foundation & High-Yield Rebuilding Stage',
      description: 'Great foundation to scale up score with targeted NCERT line-by-line revision & regular test series.',
      badgeColor: 'bg-rose-500 text-white',
      exampleColleges: ['Foundation for repeat attempt', 'Budget-friendly NMC-recognized international medical universities'],
      isGmcLikely: false
    };
  }
}

function generateStudyTips(inputs: PredictionInputs, score: number): string[] {
  const tips: string[] = [];

  if (inputs.syllabusCompletion < 60) {
    tips.push('Prioritize high-yield chapters first: Genetics, Human Physiology, Modern Physics, and Organic Chemistry reaction mechanisms.');
  } else {
    tips.push('Maintain a strict 70-30 rule: 70% of time on solving questions + mock analysis, 30% on reading notes.');
  }

  if (inputs.dailyStudyHours < 6) {
    tips.push('Gradually bump up your deep focus blocks by 45 minutes every week. 3 dedicated 2-hour blocks work wonders for retention.');
  } else {
    tips.push('Guard your mental stamina. Take active 10-minute breaks between 2-hour study sprints to avoid mid-year burnout.');
  }

  if (inputs.keyWeakSubject === 'physics') {
    tips.push('For Physics, memorize the formula sheet daily and solve 40 numerical questions per day from past 10 years NEET/AIPMT papers.');
  } else if (inputs.keyWeakSubject === 'chemistry') {
    tips.push('NCERT Chemistry lines are gospel: make separate reaction charts for Organic name reactions and periodic trends for Inorganic.');
  } else {
    tips.push('Biology NCERT is non-negotiable: read Botany and Zoology NCERT diagrams and summary tables at least 4 times before the exam.');
  }

  if (score >= 600) {
    tips.push('Practice full 3-hour 20-minute OMR mock tests strictly between 2:00 PM and 5:20 PM to train your circadian rhythm for exam day.');
  } else {
    tips.push('Maintain an "Error Notebook" for every mock test. Review every incorrect answer and understand the exact conceptual slip.');
  }

  return tips;
}

function getMotivationalQuote(score: number, name: string): string {
  const cleanName = name?.trim() || 'Aspirant';
  if (score >= 650) {
    return `"${cleanName}, your dedication is paving the way to that white coat and stethoscope. Keep the momentum consistent all the way to 2027!"`;
  } else if (score >= 580) {
    return `"${cleanName}, you have the discipline and potential to crack a Government Medical College seat. Polish your weak links and stay relentless!"`;
  } else {
    return `"${cleanName}, every top ranker once sat with a lower mock score. With disciplined hours and smart revision, 2027 will be your breakthrough year!"`;
  }
}

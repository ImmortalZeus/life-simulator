/**
 * STRIVE & THRIVE — Game Data Constants (data.js)
 * ============================================================
 * All fixed game constants: salaries, side jobs, stocks,
 * expenses, savings rates, income quintiles, event tables,
 * and scoring thresholds.
 *
 * Usage: include before game.js and health.js.
 * All constants live on the global `GAME_DATA` object.
 * ============================================================
 */

const GAME_DATA = (() => {

  /* ──────────────────────────────────────────────────────────
     ROUND META
     ────────────────────────────────────────────────────────── */

  /** Fixed info per round (1-indexed; use ROUNDS[round - 1]) */
  const ROUNDS = [
    { round: 1, age: 22, job: 'Analyst Executive',       monthlySalary: 15_000_000 },
    { round: 2, age: 23, job: 'Analyst Executive',       monthlySalary: 20_000_000 },
    { round: 3, age: 24, job: 'Analyst Executive',       monthlySalary: 25_000_000 },
    { round: 4, age: 25, job: 'Senior Financial Analyst', monthlySalary: 35_000_000 },
    { round: 5, age: 26, job: 'Senior Financial Analyst', monthlySalary: 45_000_000 },
  ];

  /** OT wage formula: monthlySalary / 208 * 1.5 */
  function getOTWage(monthlySalary) {
    return (monthlySalary / 208) * 1.5;
  }

  /** Valid OT / side-job hour choices */
  const HOUR_OPTIONS = [0, 10, 20, 30, 40];

  /* ──────────────────────────────────────────────────────────
     SIDE JOBS
     ────────────────────────────────────────────────────────── */

  const SIDE_JOBS = {
    none:       { id: 'none',       label: 'No side job',              wage: 0 },
    bookkeeper: { id: 'bookkeeper', label: 'Part-time Bookkeeper',     wage: 60_248 },
    adviser:    { id: 'adviser',    label: 'Personal Finance Adviser', wage: 116_476 },
    tutor:      { id: 'tutor',      label: 'Tutor',                    wage: 137_924 },
    blogger:    { id: 'blogger',    label: 'Guest Blogger',            wage: 157_785 },
  };

  const SIDE_JOB_MH_MULTIPLIERS = {
    none:       0.0,
    adviser:    1.00,
    tutor:      1.03,
    bookkeeper: 1.04,
    blogger:    1.14
  };

  const SIDE_JOB_PH_MULTIPLIERS = {
    none:       0.0,
    adviser:    1.00,
    bookkeeper: 1.03,
    blogger:    1.10,
    tutor:      1.11
  };

  /* ──────────────────────────────────────────────────────────
     EXPENSE CATEGORIES
     ────────────────────────────────────────────────────────── */

  /**
   * Base monthly expense values (VND).
   * In round > 1, "base" shown to player is previous round's actual.
   */
  const BASE_EXPENSES = {
    healthcare:    0.0533,    // ratio of salary
    entertainment: 0.3,
    housing:       0.25,
    food:          0.17,
    utility:       0.0467,
    transport:     0.0333,
  };

  const MIN_EXPENSES = {
    housing:       1_500_000,
    food:          1_500_000,
    utility:         400_000,
    transport:       150_000,
    healthcare:      200_000,
    entertainment:         0,
  };

  const BASE_RATIOS = {
    healthcare:    0.0533,
    entertainment: 0.3,
    housing:       0.25,
    food:          0.17,
    utility:       0.0467,
    transport:     0.0333,
  };

  /** Mental health expense formula coefficients */
  const MH_EXPENSE_COEFF = {
    healthcare:   -0.33,
    entertainment: -0.23,
    housing:       1.00,
    food:          0.64,
    utility:       0.27,
    transport:     0.15,
  };

  /* ──────────────────────────────────────────────────────────
     INSURANCE
     ────────────────────────────────────────────────────────── */

  /** Annual insurance fee by round (rounds 1-3 vs 4-5) */
  function getInsuranceFee(round) {
    return round <= 3 ? 24_056_000 : 27_840_000;
  }

  /* ──────────────────────────────────────────────────────────
     SAVINGS / BANK
     ────────────────────────────────────────────────────────── */

  const SAVINGS_TIERS = [
    { label: 'Normal',   minBalance: 1_000_000,       maxBalance: 999_999_999,    rate: 0.065  },
    { label: 'Inspire',  minBalance: 1_000_000_000,   maxBalance: 2_999_999_999,  rate: 0.0675 },
    { label: 'Priority', minBalance: 3_000_000_000,   maxBalance: 4_999_999_999,  rate: 0.068  },
    { label: 'Private',  minBalance: 5_000_000_000,   maxBalance: Infinity,       rate: 0.069  },
  ];

const SAVINGS_RATE_ADJUSTMENTS = [0, 0.005, -0.015, 0.015, -0.005];

  /** Get cumulative savings rate adjustment up to a round */
  function getSavingsRateAdjustment(round) {
    let total = 0;
    for (let r = 1; r <= round; r++) {
      total += SAVINGS_RATE_ADJUSTMENTS[Math.min(r - 1, 4)];
    }
    return total;
  }

  /** Get annual interest rate for a savings balance */
  function getSavingsRate(balance, round = 1, savingsRateAdjustment = 0) {
    const adjustment = (arguments.length >= 3) ? savingsRateAdjustment : getSavingsRateAdjustment(round);
    for (const tier of SAVINGS_TIERS) {
      if (balance >= tier.minBalance && balance <= tier.maxBalance) {
        return Math.max(0, tier.rate + adjustment);
      }
    }
    return 0; // below minimum
  }

  /** Get savings tier label */
  function getSavingsTierLabel(balance) {
    for (const tier of SAVINGS_TIERS) {
      if (balance >= tier.minBalance && balance <= tier.maxBalance) {
        return tier.label;
      }
    }
    return 'No tier';
  }

  /* ──────────────────────────────────────────────────────────
     STOCKS
     ────────────────────────────────────────────────────────── */

  const STOCKS = {
    'BNK-V': { code: 'BNK-V', sector: 'Banking',      basePrice: 60_000 },
    'TEC-F': { code: 'TEC-F', sector: 'Technology',   basePrice: 70_000 },
    'CSM-M': { code: 'CSM-M', sector: 'Consumer',     basePrice: 80_000 },
    'REA-V': { code: 'REA-V', sector: 'Real Estate',  basePrice: 150_000 },
    'ENE-G': { code: 'ENE-G', sector: 'Energy',       basePrice: 80_000 },
  };

  /**
   * Stock price change percentages per round (cumulative applied each round).
   * Indexed as [roundIndex] where roundIndex = round - 1.
   */
  const STOCK_PRICE_CHANGES = [
    // Round 1
    { 'BNK-V': 0.04,  'TEC-F': 0.03,  'CSM-M': 0.02,  'REA-V': 0.00,  'ENE-G': 0.00  },
    // Round 2
    { 'BNK-V': 0.00,  'TEC-F': 0.00,  'CSM-M': -0.02, 'REA-V': 0.00,  'ENE-G': 0.09  },
    // Round 3
    { 'BNK-V': 0.04,  'TEC-F': 0.04,  'CSM-M': 0.02,  'REA-V': 0.02,  'ENE-G': 0.02  },
    // Round 4
    { 'BNK-V': -0.05, 'TEC-F': -0.05, 'CSM-M': -0.07, 'REA-V': -0.05, 'ENE-G': -0.05 },
    // Round 5
    { 'BNK-V': 0.03,  'TEC-F': 0.03,  'CSM-M': 0.05,  'REA-V': 0.03,  'ENE-G': 0.03  },
  ];

  /** Stock trading fee percentage (applied on buy/sell) */
  const STOCK_TRADING_FEE = 0.0015; // 0.15%
  /** Stock sell tax rate (applied on sell only) */
  const STOCK_SELL_TAX = 0.001; // 0.10%

  /* ──────────────────────────────────────────────────────────
     INCOME QUINTILES (per round)
     ────────────────────────────────────────────────────────── */

  /**
   * Income quintile breakpoints per round.
   * Values are MONTHLY total income in VND.
   * Indexed as [roundIndex][0..3] = [Q1 max, Q2 max, Q3 max, Q4 max]
   * (Q5 = anything above Q4 max)
   */
  const QUINTILE_BREAKPOINTS = [
    // Round 1
    [17_770_000, 19_380_000, 20_550_000, 21_840_000],
    // Round 2
    [22_770_000, 24_380_000, 25_550_000, 26_840_000],
    // Round 3
    [27_770_000, 29_380_000, 30_550_000, 31_840_000],
    // Round 4
    [37_770_000, 39_380_000, 40_550_000, 41_840_000],
    // Round 5
    [47_770_000, 49_380_000, 50_550_000, 51_840_000],
  ];

  /**
   * Get income quintile (1–5) for a monthly income value.
   *
   * @param {number} monthlyIncome
   * @param {number} round  (1-indexed)
   * @returns {number} quintile 1–5
   */
  function getIncomeQuintile(monthlyIncome, round) {
    const breaks = QUINTILE_BREAKPOINTS[round - 1];
    if (monthlyIncome <= breaks[0]) return 1;
    if (monthlyIncome <= breaks[1]) return 2;
    if (monthlyIncome <= breaks[2]) return 3;
    if (monthlyIncome <= breaks[3]) return 4;
    return 5;
  }

  /* ──────────────────────────────────────────────────────────
     HEALTH MULTIPLIERS
     ────────────────────────────────────────────────────────── */

  /** Mental health income-based penalty multipliers by quintile */
  const MH_MULTIPLIERS = { 1: 1.74, 2: 1.53, 3: 1.29, 4: 1.14, 5: 1.00 };

  /** Physical health income-based penalty multipliers by quintile */
  const PH_MULTIPLIERS = { 1: 1.46, 2: 1.33, 3: 1.23, 4: 1.13, 5: 1.00 };

  /** Coefficients for extra-work penalty */
  const MH_WORK_COEFF = 0.048;
  const PH_WORK_COEFF = 0.034;

  /** Base health loss applied to all quintiles before multiplier */
  const BASE_HEALTH_LOSS = 5;

  /**
   * Healthcare spending → physical health recovery (annual).
   * Range breakpoints as [minRatio, maxRatio, recovery]
   */
  const HEALTHCARE_RECOVERY = [
    { minRatio: 0,    maxRatio: 0.01,  recovery: 0 },
    { minRatio: 0.01, maxRatio: 0.03,  recovery: 1 },
    { minRatio: 0.03, maxRatio: 0.06,  recovery: 2 },
    { minRatio: 0.06, maxRatio: 0.10,  recovery: 3 },
    { minRatio: 0.10, maxRatio: 0.15,  recovery: 4 },
    { minRatio: 0.15, maxRatio: Infinity, recovery: 5 },
  ];

  /** Get healthcare recovery score from ratio */
  function getHealthcareRecovery(healthcareExpense, totalIncome) {
    if (totalIncome <= 0) return 0;
    const ratio = healthcareExpense / totalIncome;
    for (const tier of HEALTHCARE_RECOVERY) {
      if (ratio >= tier.minRatio && ratio < tier.maxRatio) return tier.recovery;
    }
    return 5;
  }

  /* ──────────────────────────────────────────────────────────
     HEALTH WARNING THRESHOLDS
     ────────────────────────────────────────────────────────── */

  /**
   * Thresholds that trigger in-game health events.
   * Checked after each round calculation.
   */
  const HEALTH_THRESHOLDS = [
    { min: 50, max: 60, type: 'warning',   penalty: 0,   canWork: true,  label: 'Feeling tired' },
    { min: 40, max: 49, type: 'event',     penalty: -2,  canWork: true,  label: 'Moderate issue' },
    { min: 30, max: 39, type: 'event',     penalty: -5,  canWork: true,  label: 'Significant issue' },
    { min: 20, max: 29, type: 'event',     penalty: -7,  canWork: true,  label: 'Serious issue' },
    { min:  1, max: 19, type: 'critical',  penalty: -10, canWork: false, label: 'Critical — cannot work' },
    { min:  0, max:  0, type: 'lose',      penalty: 0,   canWork: false, label: 'Game Over' },
  ];

  const HEALTH_WARNING_EVENTS = {
    mental: [
      { min: 50, max: 60, text: "You’ve been feeling quite stressed lately, and you keep wishing you could leave work just a little earlier. Maybe it’s time to slow down and give yourself some space to heal.", penalty: 0, cashPenalty: 0 },
      { min: 40, max: 49, text: "You visit a mental health professional after weeks of stress and poor sleep. The doctor told that you’re showing signs of anxiety.", penalty: -2, cashPenalty: 1000000, isMedical: true },
      { min: 30, max: 39, text: "You feel exhausted before the day even starts. A check-up suggests early burnout from long-term work stress.", penalty: -5, cashPenalty: 1000000, isMedical: true },
      { min: 20, max: 29, text: "You often have trouble sleeping, lose your appetite, and feels frustrated all the time. The doctor said you're having severe signs of depression.", penalty: -7, cashPenalty: 10000000, isMedical: true },
      { min: 1, max: 19, text: "You're constantly anxious and stressed as hell. Your boss knows this and insists on asking you to quit your job to improve your health.", penalty: -7, cashPenalty: 0 }
    ],
    physical: [
      { min: 50, max: 60, text: "You’ve been getting occasional headaches lately, and you’ve been going to bed later than usual. Please remember to get some rest.", penalty: 0, cashPenalty: 0 },
      { min: 40, max: 49, text: "You've been having trouble sleeping and often feel exhausted by the end of the day. Your neck and shoulders have also started aching.", penalty: -2, cashPenalty: 1500000, isMedical: true },
      { min: 30, max: 39, text: "You faint at work because of acute stomach pain. The doctor says your lifestyle and diet are clearly not okay.", penalty: -5, cashPenalty: 5000000, isMedical: true },
      { min: 20, max: 29, text: "You end up in the hospital again. This time, the doctor says your body is exhausted and your immune system is struggling.", penalty: -7, cashPenalty: 10000000, isMedical: true },
      { min: 1, max: 19, text: "You are hospitalized because of a heart attack. The doctor is furious because you ignored every warning and kept neglecting your health.", penalty: -10, cashPenalty: 50000000, isMedical: true }
    ]
  };

  /** Get health threshold info for a value */
  function getHealthThreshold(value) {
    for (const t of HEALTH_THRESHOLDS) {
      if (value >= t.min && value <= t.max) return t;
    }
    return null;
  }

  /* ──────────────────────────────────────────────────────────
     SCORING
     ────────────────────────────────────────────────────────── */

  /** Total score benchmark for "above average" comparison */
  const SCORE_BENCHMARK = 47.36;

  /**
   * Net Worth Score bands (0–100).
   * Compared against a benchmark net worth calculated from
   * optimal play. For simplicity we score on a linear scale.
   */
  const NW_SCORE_BANDS = [
    { max: 49,  label: 'Weak',     score: (pct) => pct * 50 / 49 },
    { max: 79,  label: 'Moderate', score: (pct) => 50 + (pct - 50) * 30 / 29 },
    { max: 100, label: 'Strong',   score: (pct) => 80 + (pct - 80) * 20 / 20 },
  ];

  /**
   * Game-end archetypes based on financial and well-being scores.
   */
  const ARCHETYPES = [
    {
      id: 'balanced_achiever',
      label: 'Balanced Achiever',
      condition: (fin, wb) => fin >= 80 && wb >= 80,
      badgeFile: 'assets/outcomes/win/Balanced_Achiever.svg',
    },
    {
      id: 'burnout_rich',
      label: 'Burnout Rich',
      condition: (fin, wb) => fin >= 80 && wb < 50,
      badgeFile: 'assets/outcomes/win/Burnout_Rich.svg',
    },
    {
      id: 'no_pain_no_gain',
      label: 'No Gain — No Pain',
      condition: (fin, wb) => fin < 50 && wb >= 80,
      badgeFile: 'assets/outcomes/win/No_pain_-_No_gain.svg',
    },
    {
      id: 'broke_and_choked',
      label: 'Broke & Choked',
      condition: (fin, wb) => fin < 50 && wb < 50,
      badgeFile: 'assets/outcomes/win/Broke_and_Choked.svg',
    },
    {
      id: 'steady_builder',
      label: 'Steady Builder',
      condition: () => true, // fallback
      badgeFile: 'assets/outcomes/win/Steady_Builder.svg',
    },
  ];

  /**
   * Lose conditions and corresponding badge files.
   */
  const LOSE_CONDITIONS = {
    cash:     {
      label: 'Bankruptcy',
      badgeFile: 'assets/outcomes/lose/Cash.svg',
    },
    physical: {
      label: 'Physical Health Collapse',
      badgeFile: 'assets/outcomes/lose/Physical_health.svg',
    },
    mental:   {
      label: 'Mental Health Collapse',
      badgeFile: 'assets/outcomes/lose/Mental_health.svg',
    },
  };

  /* ──────────────────────────────────────────────────────────
     CHARACTER SVG PATHS
     ────────────────────────────────────────────────────────── */

  const CHARACTER_SVGS = [
    'assets/characters/Character_Round_1.svg',
    'assets/characters/Character_Round_2.svg',
    'assets/characters/Character_Round_3.svg',
    'assets/characters/Character_Round_4.svg',
    'assets/characters/Character_Round_5.svg',
  ];

  function getCharacterSVG(round) {
    return CHARACTER_SVGS[Math.min(round - 1, 4)];
  }

  /* ──────────────────────────────────────────────────────────
     INITIAL STATE TEMPLATE
     ────────────────────────────────────────────────────────── */

  /** Factory: returns a fresh player state object */
  function createInitialState(playerName) {
    return {
      playerName,
      currentRound: 1,
      stats: {
        cash:           0,
        investment:     5_000_000,
        physicalHealth: 70,
        mentalHealth:   70,
      },
      // Per-round decisions + results (populated as game progresses)
      rounds: [],
      // Stock portfolio: { code: { quantity, avgCost } }
      portfolio: {
        'BNK-V': { quantity: 0, avgCost: 0 },
        'TEC-F': { quantity: 0, avgCost: 0 },
        'CSM-M': { quantity: 0, avgCost: 0 },
        'REA-V': { quantity: 0, avgCost: 0 },
        'ENE-G': { quantity: 0, avgCost: 0 },
      },
      savingsBalance: 5_000_000,
      savingsOpening: 5_000_000,
      hasInsurance:   false,
      realizedPnL:    0,
      // Current stock prices (updated each round)
      currentPrices: {
        'BNK-V': 60_000,
        'TEC-F': 70_000,
        'CSM-M': 80_000,
        'REA-V': 150_000,
        'ENE-G': 80_000,
      },
      marketBranch: '1.1',
      savingsRateAdjustment: 0.0,
      inflationRate: 0.0,
      loseCondition: null, // 'cash' | 'physical' | 'mental' | null
    };
  }

  /** Expense template for a single round */
  function createRoundDecision(round) {
    const meta = ROUNDS[round - 1];
    const expenses = {};
    for (const [key, ratio] of Object.entries(BASE_EXPENSES)) {
      expenses[key] = Math.round(ratio * meta.monthlySalary);
    }
    return {
      round,
      // Income choices
      otHours: 0,
      sideJob: 'none',
      sideJobHours: 0,
      // Expense choices (monthly, VND)
      expenses,
      // Investment choices handled via portfolio + savingsBalance
    };
  }

  /* ──────────────────────────────────────────────────────────
     4-TYPE EVENT SYSTEM POOLS
     ────────────────────────────────────────────────────────── */

  const RANDOM_EVENTS = [
    {
      id: 'rand_lottery',
      text: "YOU WON THE LOTTERY! The prize reaches 500,000,000 VND.",
      tag: 'positive',
      rarity: 'ultra_rare',
      weight: 1,
      impact: { cash: 500000000, mentalHealth: 15 }
    },
    {
      id: 'rand_retreat',
      text: "Your manager organized a one-week summer retreat for the whole department. The retreat resort also has the greatest massage service!",
      tag: 'positive',
      rarity: 'uncommon',
      weight: 6,
      impact: { mentalHealth: 8, physicalHealth: 4 }
    },
    {
      id: 'rand_massager',
      text: "During a company health workshop, you joined the lucky draw with no hope. To your surprise, you won a high-quality neck and shoulder massager, perfectly saving your aching back.",
      tag: 'positive',
      rarity: 'rare',
      weight: 8,
      impact: { physicalHealth: 5, mentalHealth: 3 }
    },
    {
      id: 'rand_weddings_fomo',
      text: "You are invited to two weddings of your high school friends. You are genuinely happy for them, but you also feel a little FOMO as people around you start to form their family.",
      tag: 'positive',
      rarity: 'common',
      weight: 10,
      impact: { mentalHealth: -1 }
    },
    {
      id: 'rand_volunteer',
      text: "You sign up for a local volunteer activity. It is tiring, but the experience feels meaningful and leaves you surprisingly happy.",
      tag: 'positive',
      rarity: 'common',
      weight: 10,
      impact: { mentalHealth: 5, physicalHealth: 1 }
    },
    {
      id: 'rand_entrepreneur',
      text: "During a casual coffee outing, you unexpectedly meet a famous entrepreneur you have admired for a long time. The two of you have a pleasant conversation, and you leave feeling incredibly motivated.",
      tag: 'positive',
      rarity: 'rare',
      weight: 5,
      impact: { mentalHealth: 8 }
    },
    {
      id: 'rand_dog',
      text: "Your neighbor recently adopted an adorable Golden Retriever. You quickly became fond of the dog, and it seems to like you just as much. Since then, you've been spending time playing with it and occasionally taking it out for walks.",
      tag: 'positive',
      rarity: 'common',
      weight: 9,
      impact: { mentalHealth: 6, physicalHealth: 2 }
    },
    {
      id: 'rand_thailand',
      text: "Thanks to your office's outstanding performance and its success in bringing in new clients, management has decided to reward the entire team with an 8-day, 7-night trip to Thailand.",
      tag: 'positive',
      rarity: 'very_rare',
      weight: 4,
      impact: { mentalHealth: 12, physicalHealth: 4 }
    },
    {
      id: 'rand_lucky_money',
      text: "You accidentally found an old lucky money envelope while tidying up your wardrobe. To your surprise, the amount of money inside the envelope is quite high.",
      tag: 'positive',
      rarity: 'uncommon',
      weight: 7,
      impact: { cash: 5000000, mentalHealth: 2 }
    },
    {
      id: 'rand_dyson',
      text: "You write a heartfelt review praising the durability and practicality of your 5-year-old Dyson vacuum cleaner. To your surprise, the post goes viral that even Dyson notices it and decides to send you their latest vacuum model as a gift.",
      tag: 'positive',
      rarity: 'very_rare',
      weight: 3,
      impact: { cash: 15000000, mentalHealth: 8 }
    },
    {
      id: 'rand_decline_wedding',
      text: "A close friend invites you to be a bridesmaid/groomsman and attend a wedding. However, you are too busy with your work so you decline your friend's invitation.",
      tag: 'negative',
      rarity: 'common',
      weight: 10,
      impact: { mentalHealth: -3 }
    },
    {
      id: 'rand_police',
      text: "In a moment of distraction while driving, you forgot to use your turn signal and got pulled over by the traffic police. That's how your food budget for the weekend gone away.",
      tag: 'negative',
      rarity: 'common',
      weight: 10,
      impact: { cash: -1000000, mentalHealth: -2 }
    },
    {
      id: 'rand_grandfather_hospital',
      text: "You heard that your grandfather was hospitalized with atherosclerosis. You sent some money to help your parents with the medical bills and went to the hospital to visit him.",
      tag: 'negative',
      rarity: 'uncommon',
      weight: 8,
      impact: { cash: -5000000, mentalHealth: -3 }
    },
    {
      id: 'rand_grandfather_death',
      text: "After a year of medical treatment, your grandfather passes away. His departure leaves you deeply saddened.",
      tag: 'negative',
      rarity: 'rare',
      weight: 5,
      impact: { mentalHealth: -10 }
    },
    {
      id: 'rand_netflix',
      text: "You accidentally signed up for a 7-day free trial of Netflix account and completely forgot about it. You only realized after 2 months but your bank account already deducted money.",
      tag: 'negative',
      rarity: 'common',
      weight: 10,
      impact: { cash: -400000, mentalHealth: -1 }
    },
    {
      id: 'rand_cheated',
      text: "You got cheated on because the person in a situationship with you secretly texted 2 more people. You ended your relationship but still felt heartbroken.",
      tag: 'negative',
      rarity: 'rare',
      weight: 6,
      impact: { mentalHealth: -8 }
    },
    {
      id: 'rand_report_lost',
      text: "Your report was lost because you forgot to save it. You had to stay up all night to redo it. Don't make this mistake again!",
      tag: 'negative',
      rarity: 'uncommon',
      weight: 8,
      impact: { mentalHealth: -4, physicalHealth: -2 }
    },
    {
      id: 'rand_scam',
      text: "You get tricked by an online scam and lose a lot of money. The financial loss really hurts, but what makes you angrier is how stupid you feel for believing them. You are left feeling totally embarrassed and deeply frustrated.",
      tag: 'negative',
      rarity: 'ultra_rare',
      weight: 7,
      impact: { cash: -80000000, mentalHealth: -10 }
    },
    {
      id: 'rand_storm',
      text: "A powerful storm hits Hanoi, causing widespread flooding across the city. Unfortunately, your vehicle breaks down in the middle of the flooded streets. You have no choice but to walk home and pay for costly repairs afterward.",
      tag: 'negative',
      rarity: 'rare',
      weight: 5,
      impact: { cash: -5000000, mentalHealth: -4 }
    },
    {
      id: 'rand_mother_accident',
      text: "While on her way to the market, your mother is involved in a traffic accident. Worried, you rush home to check on her. Fortunately, her injuries are not serious, but you decide to take three days off work to stay by her side and help with her recovery.",
      tag: 'negative',
      rarity: 'very_rare',
      weight: 4,
      impact: { cash: -2000000, mentalHealth: -6 }
    },
    {
      id: 'rand_flat_tire',
      text: "While commuting home after a long day, your motorbike suddenly gets a flat tire. You have to push the bike to the nearest repair shop and arriving home much later than expected.",
      tag: 'negative',
      rarity: 'common',
      weight: 9,
      impact: { cash: -200000, mentalHealth: -2 }
    },
    {
      id: 'rand_ac_broken',
      text: "Hanoi's temperature in this summer can surge up to more than 40 degrees. However, your AC suddenly stops working. The repair technician cannot come until next week, leaving you to suffer through several ultra-hot days.",
      tag: 'negative',
      rarity: 'uncommon',
      weight: 7,
      impact: { cash: -2500000, mentalHealth: -4, physicalHealth: -1 }
    },
    {
      id: 'rand_driving_fail',
      text: "After weeks of preparation, you take the driving license test with confidence. Unfortunately, a small mistake during the practical exam makes you fail! Better luck next time.",
      tag: 'negative',
      rarity: 'uncommon',
      weight: 6,
      impact: { cash: -1000000, mentalHealth: -5 }
    },
    {
      id: 'rand_luggage_lost',
      text: "While traveling, you discover that your checked luggage has gone missing. Although the airline eventually compensates part of the loss, replacing your belongings is still frustrating.",
      tag: 'negative',
      rarity: 'very_rare',
      weight: 5,
      impact: { cash: -5000000, mentalHealth: -5 }
    }
  ];

  const JOB_REWARD_EVENTS = {
    1: {
      minor: {
        id: 'job_y1_minor',
        text: "You occasionally stay after work to help your colleagues. Over time, you build stronger relationships with your teammates and gain valuable insights from more experienced coworkers.",
        tag: 'positive',
        impact: { mentalHealth: 3 }
      },
      moderate: {
        id: 'job_y1_moderate',
        text: "You frequently stay late to assist with unexpected tasks. One of the senior staff members is impressed by your attitude and shares a collection of work guides and notes that he has compiled over the years.",
        tag: 'positive',
        impact: { mentalHealth: 4 }
      },
      major: {
        id: 'job_y1_major',
        text: "During a small project, you voluntarily cleared a backlog of paperwork and administrative tasks, helping the team finish ahead of schedule. Your team leader rewards you for your timely support.",
        tag: 'positive',
        impact: { cash: 5000000, mentalHealth: 4 }
      }
    },
    2: {
      minor: {
        id: 'job_y2_minor',
        text: "Because of your willingness to help outside regular working hours, you are selected to join an internal professional training program reserved for high-performing employees.",
        tag: 'positive',
        impact: { mentalHealth: 4 }
      },
      moderate: {
        id: 'job_y2_moderate',
        text: "An internal project falls behind schedule. You volunteer to provide additional support and help the team deliver on time. Your department manager rewards you for your contribution.",
        tag: 'positive',
        impact: { cash: 5000000, mentalHealth: 5 }
      },
      major: {
        id: 'job_y2_major',
        text: "You are chosen to join a short business trip with senior managers to work on a potential acquisition deal involving a technology startup in Singapore.",
        tag: 'positive',
        impact: { cash: 10000000, mentalHealth: 5 }
      },
      exceptional: {
        id: 'job_y2_exceptional',
        text: "Your annual performance review places you among the top 5% most dedicated employees in the company. Senior management grants you a special bonus in recognition of your efforts.",
        tag: 'positive',
        impact: { cash: 15000000, mentalHealth: 8 }
      }
    },
    3: {
      minor: {
        id: 'job_y3_minor',
        text: "A new manager is assigned to your office. You are asked to help him settle into his new role, and your intelligence and work ethic quickly earn his trust and appreciation.",
        tag: 'positive',
        impact: { mentalHealth: 5 }
      },
      moderate: {
        id: 'job_y3_moderate',
        text: "Thanks to your hard work, a project negotiation is completed one week ahead of schedule. The client is highly satisfied, and the team's performance bonus increases significantly.",
        tag: 'positive',
        impact: { cash: 10000000, mentalHealth: 6 }
      },
      major: {
        id: 'job_y3_major',
        text: "You are recognized as one of the five most outstanding employees during the first six months of the year. As a reward, you receive a 3-day, 2-night vacation package at a Vinpearl Resort in Nha Trang.",
        tag: 'positive',
        impact: { cash: 15000000, mentalHealth: 8 }
      },
      exceptional: {
        id: 'job_y3_exceptional',
        text: "A high-value project exceeds expectations. The board decides to distribute an additional bonus to the core team, and you receive one of the largest shares.",
        tag: 'positive',
        impact: { cash: 30000000, mentalHealth: 8 }
      }
    },
    4: {
      minor: {
        id: 'job_y4_minor',
        text: "You are invited to join a task force focused on improving internal workflows. Your recommendations significantly reduce processing time across the department.",
        tag: 'positive',
        impact: { mentalHealth: 5 }
      },
      moderate: {
        id: 'job_y4_moderate',
        text: "A long-term client specifically requests that you continue working on future projects because of the excellent quality of your previous work.",
        tag: 'positive',
        impact: { cash: 10000000, mentalHealth: 7 }
      },
      major: {
        id: 'job_y4_major',
        text: "You represent your department at an international professional conference alongside senior leadership. The trip helps you expand your professional network considerably.",
        tag: 'positive',
        impact: { cash: 15000000, mentalHealth: 8 }
      },
      exceptional: {
        id: 'job_y4_exceptional',
        text: "You play a key role in a fundraising deal with a private LP from the United Kingdom. The transaction successfully raises USD 1 million, and your team receives an immediate performance bonus.",
        tag: 'positive',
        impact: { cash: 40000000, mentalHealth: 10 }
      }
    },
    5: {
      minor: {
        id: 'job_y5_minor',
        text: "Many junior employees seek your career advice. The company formally recognizes your contributions to mentoring and developing younger staff members.",
        tag: 'positive',
        impact: { mentalHealth: 5 }
      },
      moderate: {
        id: 'job_y5_moderate',
        text: "You become a professional mentor for the company's Fresh Graduate Recruitment Program. You share your experiences with candidates and earn admiration from many young applicants.",
        tag: 'positive',
        impact: { cash: 15000000 }
      },
      major: {
        id: 'job_y5_major',
        text: "Thanks to the reputation you have built over the years, you are invited to join an important fundraising project involving a major European pension fund. You spend one month in France working directly with the client.",
        tag: 'positive',
        impact: { cash: 25000000, mentalHealth: 8 }
      },
      exceptional: {
        id: 'job_y5_exceptional',
        text: "At the company's year-end ceremony, you are awarded the title of Employee of the Year. The achievement comes with a substantial bonus and widespread recognition from colleagues, clients, and senior management.",
        tag: 'positive',
        impact: { cash: 60000000, mentalHealth: 12 }
      }
    }
  };

  const EXPENSE_PENALTY_EVENTS = {
    housing: [
      {
        id: 'exp_housing_1',
        prob: 0.50,
        text: "Living in overcrowded accommodation reduces comfort and sleep quality.",
        tag: 'negative',
        impact: { mentalHealth: -3, physicalHealth: -2 }
      },
      {
        id: 'exp_housing_2',
        prob: 0.30,
        text: "Frequent conflicts with roommates create stress and reduce well-being.",
        tag: 'negative',
        impact: { mentalHealth: -4 }
      },
      {
        id: 'exp_housing_3',
        prob: 0.20,
        text: "Housing instability requires an unexpected move.",
        tag: 'negative',
        impact: { mentalHealth: -2, cash: -500000 }
      }
    ],
    food: [
      {
        id: 'exp_food_1',
        prob: 0.50,
        text: "A prolonged period of low-cost meals reduces energy and physical well-being.",
        tag: 'negative',
        impact: { physicalHealth: -4 }
      },
      {
        id: 'exp_food_2',
        prob: 0.30,
        text: "Inadequate nutrition affects concentration and work performance.",
        tag: 'negative',
        impact: { mentalHealth: -2 }
      },
      {
        id: 'exp_food_3',
        prob: 0.20,
        text: "A nutrition-related health issue occurs.",
        tag: 'negative',
        impact: { physicalHealth: -3, cash: -300000 },
        isMedical: true
      }
    ],
    utility: [
      {
        id: 'exp_utility_1',
        prob: 0.40,
        text: "Limited spending results in unstable internet access.",
        tag: 'negative',
        impact: { mentalHealth: -2 }
      },
      {
        id: 'exp_utility_2',
        prob: 0.40,
        text: "Insufficient utility usage reduces living comfort.",
        tag: 'negative',
        impact: { mentalHealth: -2, physicalHealth: -1 }
      },
      {
        id: 'exp_utility_3',
        prob: 0.20,
        text: "Deferred maintenance or unpaid service fees generate additional costs.",
        tag: 'negative',
        impact: { cash: -300000 }
      }
    ],
    transport: [
      {
        id: 'exp_transport_1',
        prob: 0.50,
        text: "Reliance on low-cost transportation significantly increases travel time.",
        tag: 'negative',
        impact: { mentalHealth: -2 }
      },
      {
        id: 'exp_transport_2',
        prob: 0.30,
        text: "Transportation constraints cause you to miss an important opportunity.",
        tag: 'negative',
        impact: { cash: -500000 }
      },
      {
        id: 'exp_transport_3',
        prob: 0.20,
        text: "Long and inconvenient travel routines reduce well-being.",
        tag: 'negative',
        impact: { mentalHealth: -1, physicalHealth: -2 }
      }
    ],
    healthcare: [
      {
        id: 'exp_healthcare_1',
        prob: 0.50,
        text: "A health issue is not addressed early enough.",
        tag: 'negative',
        impact: { physicalHealth: -5 }
      },
      {
        id: 'exp_healthcare_2',
        prob: 0.30,
        text: "A minor health problem becomes more serious.",
        tag: 'negative',
        impact: { physicalHealth: -4, mentalHealth: -2 }
      },
      {
        id: 'exp_healthcare_3',
        prob: 0.20,
        text: "An unexpected medical bill occurs.",
        tag: 'negative',
        impact: { cash: -1000000, physicalHealth: -2 },
        isMedical: true
      }
    ]
  };

  // Flat helper array of all events for back-compatibility and quick checks
  const LIFE_EVENTS = [
    ...RANDOM_EVENTS,
    ...Object.values(JOB_REWARD_EVENTS).flatMap(yearObj => Object.values(yearObj)),
    ...Object.values(EXPENSE_PENALTY_EVENTS).flat()
  ];

  /* ──────────────────────────────────────────────────────────
     MARKET EVENTS
     ────────────────────────────────────────────────────────── */
  const MARKET_EVENT_TREE = {
    '1.1': {
      id: '1.1',
      year: 1,
      title: "Stable start",
      scenarioOverview: "The world market is starting the year in a fairly calm mood. In Vietnam, the economy is also holding steady as attention increasingly shifts toward digitalization across industries. The rapid rise of e-commerce and the wider adoption of online banking are creating significant new opportunities for both businesses and consumers, driving innovation, improving efficiency, and expanding access to markets.",
      events: [
        { title: "Digital Banking Campaign", text: "Major banks launch fee-free transfers and cashback campaigns across popular payment apps. App sign-ups rise quickly, while more small shops begin accepting QR payments.", impact: "Bank Stock +4% · Tech Stock +3%" },
        { title: "Shopping Festival", text: "The emergence of the double-day sale trend has ignited a massive consumer wave across various sectors, driven by fashion, beauty, electronics, and home appliances.", impact: "Consumer Stock +2%" }
      ],
      stockPriceChanges: { 'BNK-V': 0.04, 'TEC-F': 0.03, 'CSM-M': 0.02, 'REA-V': 0.00, 'ENE-G': 0.00 },
      savingsRateAdjustment: 0.0,
      inflationRate: 0.0,
      children: ['2.1', '2.2']
    },
    '2.1': {
      id: '2.1',
      year: 2,
      title: "Middle East tension",
      scenarioOverview: "Tension in the Middle East suddenly increases, making global investors more nervous. Oil and shipping costs rise, so many countries face higher prices and more uncertain trade. Vietnam is affected mainly through imported fuel, transport costs, and slightly higher inflation. The economy is not in crisis, but daily expenses are significantly higher, especially food, electricity, and transportation.",
      events: [
        { title: "Escalating Tensions", text: "Rising oil prices cause hardship for many households and businesses. Meanwhile, many speculators take advantage of this opportunity to invest heavily in the energy sector.", impact: "Energy Stock +9%" },
        { title: "Consumer Caution", text: "Offline shopping was significantly affected, but online shopping maintained its momentum despite the global news, with regular shopping and sales-hunting going on as usual.", impact: "Consumer Stock -2% · Inflation +1.5% · Savings return +0.5%" }
      ],
      stockPriceChanges: { 'BNK-V': 0.00, 'TEC-F': 0.00, 'CSM-M': -0.02, 'REA-V': 0.00, 'ENE-G': 0.09 },
      savingsRateAdjustment: 0.005,
      inflationRate: 0.015,
      children: ['3.1', '3.2']
    },
    '2.2': {
      id: '2.2',
      year: 2,
      title: "Virus-XIX Outbreak",
      scenarioOverview: "At the start of the year, a city in China reports a small cluster of patients with a strange new pneumonia. At first, the news feels far away, but within weeks, Virus-XIX spreads across Asia and then into major economies around the world. This is the first time people have witnessed these phenomena: flights are cut, factories slow down, and shopping streets become quiet. Vietnam - as the neighbor of China - is reached early. Malls, restaurants, tourism, and other activities cool down, forcing people to get familiar with online payments, delivery apps, and digital services.",
      events: [
        { title: "Pause & Online Boom", text: "Economic and social activities seemed to have been put on “pause.” The things that grew the most were the number of infected patients and the quarantine zones set up across many cities. Online services and social networks boomed.", impact: "Tech Stock +6% · Consumer Stock -5%" },
        { title: "Global Market Drop", text: "Just 3 months after Virus-XIX was detected, also immediately after it was declared a global pandemic, stock indices in major markets such as the U.S., the U.K., and Japan fell by 20%–30%. Vietnam’s VN-Index lost about 30% of its value.", impact: "All Stocks -30% · Savings return -0.5%" }
      ],
      stockPriceChanges: { 'BNK-V': -0.30, 'TEC-F': -0.24, 'CSM-M': -0.35, 'REA-V': -0.30, 'ENE-G': -0.30 },
      savingsRateAdjustment: -0.005,
      inflationRate: 0.0,
      children: ['3.3', '3.4']
    },
    '3.1': {
      id: '3.1',
      year: 3,
      title: "Conflict gets worse",
      scenarioOverview: "In the Middle East, attacks continue daily as neither side shows any sign of backing down. This keeps disrupting the energy supply chain, driving up energy and shipping costs. Vietnam, like many other countries, is feeling the direct impact of this tension, especially through rising fuel prices, imported goods, and transport services.",
      events: [
        { title: "Defensive Investing", text: "Crowd psychology makes the investors reduce risky investments and move more money into cash or safer assets. Stock market is facing a cold period.", impact: "All Stocks -5% · Savings return +1.0%" },
        { title: "Gold Rush", text: "This period sees a crazy surge in domestic gold prices. Even though gold prices are skyrocketing, people are still rushing to buy it, making it extremely difficult for the government to stabilize the value of this asset.", impact: "Inflation +2.0%" }
      ],
      stockPriceChanges: { 'BNK-V': -0.05, 'TEC-F': -0.05, 'CSM-M': -0.05, 'REA-V': -0.05, 'ENE-G': 0.10 },
      savingsRateAdjustment: 0.01,
      inflationRate: 0.02,
      children: ['4.1']
    },
    '3.2': {
      id: '3.2',
      year: 3,
      title: "Negotiation progress",
      scenarioOverview: "Global markets receive some good news as peace talks and diplomatic efforts begin to show progress. Investors are still careful, but the fear of a major crisis is lower than before. Vietnam does not see a huge boom, but the calmer global mood helps stabilize trade, prices, and investor confidence. Inflation pressure becomes easier to manage, and businesses feel a little more confident about planning ahead.",
      events: [
        { title: "Stable Budgets", text: "At the urgent call of many countries around the world, numerous negotiations have taken place and are beginning to show positive signs, bringing good news: food, fuel, and transportation prices become more stable.", impact: "Inflation -2%" },
        { title: "Economic Policy Package", text: "A new economic policy package receives strong public support as it focuses on stabilizing prices, improving public services, and keeping businesses active. The announcement gives the market a much-needed confidence boost.", impact: "Other Stocks +2% · Savings return -1.5%" },
        { title: "Brighter Business Outlook", text: "Hiring plans improve, delayed projects restart, and bonus expectations become positive.", impact: "Bank Stock +4% · Tech Stock +4%" }
      ],
      stockPriceChanges: { 'BNK-V': 0.04, 'TEC-F': 0.04, 'CSM-M': 0.02, 'REA-V': 0.02, 'ENE-G': 0.02 },
      savingsRateAdjustment: -0.015,
      inflationRate: -0.02,
      children: ['4.1']
    },
    '3.3': {
      id: '3.3',
      year: 3,
      title: "The pandemic gets worse",
      scenarioOverview: "Virus-XIX does not slow down as expected. Large medical companies race to develop a vaccine, and governments pour money into hospitals, labs, and emergency health systems. However, a new variant appears before the world can fully catch up, making early vaccine plans less effective. Many countries continue lockdowns, ask people to stay home, and limit public activities, creating a huge wave of job losses. For Vietnam, this becomes one of the hardest years since the Reform era.",
      events: [
        { title: "Policy Caution", text: "There are no longer the “free-fall” drops seen last year; nevertheless, the economy remains highly sensitive and fragile this year. Uncertainty from virus variants makes current healthcare hard to control, and policy moves are being made with great caution.", impact: "Consumer Stock -5% · Savings return +1.5%" },
        { title: "Digital Transformation Boom", text: "A bright spot this year is the rapid development of digital transformation. The trends of working from home, online delivery, and conducting activities digitally have forced us to adapt and upgrade our technology infrastructure.", impact: "Tech Stock +8% · Inflation +2%" }
      ],
      stockPriceChanges: { 'BNK-V': -0.03, 'TEC-F': 0.08, 'CSM-M': -0.05, 'REA-V': -0.05, 'ENE-G': -0.02 },
      savingsRateAdjustment: 0.015,
      inflationRate: 0.02,
      children: ['4.2']
    },
    '3.4': {
      id: '3.4',
      year: 3,
      title: "Pandemic under control",
      scenarioOverview: "After a stressful year, many countries begin to respond more seriously. Governments invest more in healthcare services, expand hospitals, build quarantine areas, and support vaccine research. This year, Vietnam and many other countries succeed in rolling out free vaccination programs on a large scale. Thanks to early awareness, public cooperation, and a strong sense of community support, the situation becomes much more controlled. Digital transformation, online payments, delivery apps, and remote services become part of everyday life.",
      events: [
        { title: "Policy Rate Cut", text: "As the epidemic came more under control, governments began timely economic policies to help the economy recover. Central banks repeatedly cut policy rates, and the surge of retail F0 investors pushed the VN-Index back up.", impact: "All Stocks +5% · Savings return -1.5%" },
        { title: "Business Support Packages", text: "Besides cutting interest rates, our government aggressively rolled out business support packages, tax deferrals, and accelerated public investment disbursement. A large volume of payments flowed back into the market.", impact: "Bank Stock +4% · Inflation -1%" }
      ],
      stockPriceChanges: { 'BNK-V': 0.09, 'TEC-F': 0.05, 'CSM-M': 0.05, 'REA-V': 0.05, 'ENE-G': 0.05 },
      savingsRateAdjustment: -0.015,
      inflationRate: -0.01,
      children: ['4.3', '4.4']
    },
    '4.1': {
      id: '4.1',
      year: 4,
      title: "Global storms: Trade tensions rise",
      scenarioOverview: "The Middle East becomes a \"chessboard\" in the tech and geopolitical cold war between the US and China. While the US pressures Middle Eastern countries to limit tech cooperation with Beijing, China tries to use these same nations to access advanced US technology. This sparks a New Cold War between the two superpowers.",
      events: [
        { title: "Trade Barriers", text: "Political conflicts between major powers stoke fears about slower trade and weaker demand. Investors are moving into defense mode.", impact: "Consumer Stock -7% · Other Stocks -5%" },
        { title: "Tech Relocation", text: "Vietnam welcomes a wave of top tech corporations moving factories and R&D centers here. Government approves national strategy for semiconductor development.", impact: "Tech Stock +8% · Inflation +2%" },
        { title: "Risk Aversion", text: "Risk aversion moves money out of stocks and into safe bank savings.", impact: "Savings return +1.5%" }
      ],
      stockPriceChanges: { 'BNK-V': -0.05, 'TEC-F': 0.03, 'CSM-M': -0.07, 'REA-V': -0.05, 'ENE-G': -0.05 },
      savingsRateAdjustment: 0.015,
      inflationRate: 0.02,
      children: ['5.1']
    },
    '4.2': {
      id: '4.2',
      year: 4,
      title: "The biggest financial scandal",
      scenarioOverview: "Nothing too dramatic happens in the global economy this year. However, Vietnam's economy was severely shaken by a major financial scandal, a 'mega-case' involving one of the largest conglomerates and one of the biggest banks in the South. The total damage reached 700 trillion VND, which was later recognized as one of the largest embezzlement, fraud, and money laundering cases in Vietnam's history.",
      events: [
        { title: "Real Estate Freeze", text: "The scandal-ridden conglomerate holds a massive amount of real estate and related projects. As credit funding to this sector is significantly cut off and investor confidence lost, the stock market plummets.", impact: "Real Estate Stock -12% · Bank Stock -8%" },
        { title: "Savings Panic & Drop", text: "The loss of savings deposits has plunged tens of thousands of Bank S's customer families into hardship, indirectly dragging down domestic consumer demand and overall economic growth.", impact: "Consumer Stock -7% · Savings return -1.0%" }
      ],
      stockPriceChanges: { 'BNK-V': -0.08, 'TEC-F': -0.02, 'CSM-M': -0.07, 'REA-V': -0.12, 'ENE-G': -0.02 },
      savingsRateAdjustment: -0.01,
      inflationRate: 0.01,
      children: ['5.2']
    },
    '4.3': {
      id: '4.3',
      year: 4,
      title: "Living with Virus-XIX",
      scenarioOverview: "After two years of struggle, the world becomes more familiar with the pandemic. Vaccines are widely available, and countries start shifting from “fighting the virus” to “living with the virus.” Streets reopen and quarantine rules are mainly applied to infected people instead of the whole community. Domestic and international trade slowly recover, while factories, offices, and service businesses restart their normal activities. In Vietnam, people begin to feel hopeful again. The economy is not fully healed yet, but consumers are less cautious than before.",
      events: [
        { title: "Stimulus Packages", text: "The economy gradually resumed activity. The Vietnamese government took cautious but steady steps such as slowly lowering interest rates and launching stimulus packages to circulate liquidity.", impact: "Bank Stock +3% · Savings return -1.0%" },
        { title: "E-commerce Habits", text: "Online shopping during the pandemic gradually became a habit. E-commerce platforms were motivated to run more campaigns to attract consumers.", impact: "Consumer Stock +5% · Tech Stock +2%" }
      ],
      stockPriceChanges: { 'BNK-V': 0.03, 'TEC-F': 0.02, 'CSM-M': 0.05, 'REA-V': 0.02, 'ENE-G': 0.02 },
      savingsRateAdjustment: -0.01,
      inflationRate: 0.01,
      children: ['5.3']
    },
    '4.4': {
      id: '4.4',
      year: 4,
      title: "Delayed economic pressure",
      scenarioOverview: "Virus-XIX still exists, but it is no longer the only topic people talk about. Most people have learned to live with it. However, the delayed economic effects of the pandemic now begin to appear more clearly. During the outbreak, many countries used large stimulus packages and low interest rates to protect businesses and households. These policies pushes the inflation to its highest level in 30 years, becoming a new challenge for both the world and Vietnam. The pandemic is calmer, but the economic repair work is far from over.",
      events: [
        { title: "Fed Interest Hike", text: "To stamp out inflation, the Fed was forced to reverse policy urgently by hiking interest rates repeatedly. As rates rose, “cheap money” disappeared. Capital pulled strongly out of risky assets.", impact: "All Stocks -5% · Savings return +2.0%" },
        { title: "Commercial Bank Failure", text: "A large U.S. commercial bank failed after customers withdrew deposits en masse, creating a liquidity imbalance. This raised concerns about the stability of the global financial system.", impact: "Bank Stock -5% · Inflation +3.0%" }
      ],
      stockPriceChanges: { 'BNK-V': -0.10, 'TEC-F': -0.05, 'CSM-M': -0.05, 'REA-V': -0.05, 'ENE-G': -0.05 },
      savingsRateAdjustment: 0.02,
      inflationRate: 0.03,
      children: ['5.4']
    },
    '5.1': {
      id: '5.1',
      year: 5,
      title: "Geopolitical tension eases",
      scenarioOverview: "After a year of intense geopolitical conflict and tension, things have taken a more positive turn this year. Many negotiation talks have taken place, most notably the US-China Summit in Beijing. Here, the two nations reached mutual commitments on semiconductor technology. Vietnam is also reaping the rewards, with a double wave of FDI inflows from both superpowers pouring into our country.",
      events: [
        { title: "Semiconductor FDI", text: "Following last year's signings, the semiconductor factories and AI centers that Vietnam co-developed with big technology corporations in the U.S. have officially gone into operation.", impact: "Tech Stock +5%" },
        { title: "FTSE Emerging Market Upgrade", text: "After many efforts to upgrade technical infrastructure and legal frameworks, Vietnam's stock market will finally be upgraded by FTSE Russell from a Frontier Market to a Secondary Emerging Market.", impact: "All Stocks +3% · Savings return -0.5%" }
      ],
      stockPriceChanges: { 'BNK-V': 0.03, 'TEC-F': 0.08, 'CSM-M': 0.03, 'REA-V': 0.03, 'ENE-G': 0.03 },
      savingsRateAdjustment: -0.005,
      inflationRate: -0.01,
      children: []
    },
    '5.2': {
      id: '5.2',
      year: 5,
      title: "Post-scandal aftermath",
      scenarioOverview: "While the rest of the world remains peaceful, the Vietnamese government is struggling to fix the damage from the recent major scandal: a frozen real estate and bond market, coupled with public confidence hitting rock bottom. To prevent an economic crash, the Central Bank is forced to reverse its policy to save dying businesses.",
      events: [
        { title: "Interest Rate Cuts", text: "The Central Bank cuts interest rates four times in a row to pump money into the system, allowing businesses to borrow capital at much lower rates.", impact: "Bank Stock +4% · Savings return -1.5%" },
        { title: "Real Estate Debt Decree", text: "The government issues a decree allowing businesses to delay their debt payments without being flagged as bad debt by banks. This decree has saved real estate businesses that were on the verge of bankruptcy.", impact: "Real Estate Stock +8% · Inflation +1%" }
      ],
      stockPriceChanges: { 'BNK-V': 0.04, 'TEC-F': 0.00, 'CSM-M': 0.00, 'REA-V': 0.08, 'ENE-G': 0.00 },
      savingsRateAdjustment: -0.015,
      inflationRate: 0.01,
      children: []
    },
    '5.3': {
      id: '5.3',
      year: 5,
      title: "Ready for development",
      scenarioOverview: "Another piece of good news is that Vietnam was one of the countries that controlled inflation best last year. Continuing that momentum, this year our country is ready to kickstart a dynamic economy, increasing investment in emerging sectors such as technology and digital transformation. At the same time, the government is also creating favorable conditions for the resumption of production and construction activities.",
      events: [
        { title: "Livestream E-commerce", text: "Livestream shopping exploded. E-commerce platforms launch more campaigns, loyalty programs and promote digital advertising, featuring many celebrities and attractive voucher packages.", impact: "Consumer Stock +8% · Inflation +1%" },
        { title: "AI Integration in Business", text: "The real estate market has yet to recover due to the ongoing economic difficulties following the pandemic. However, the market is being boosted by technological advancements, specifically the emergence of AI.", impact: "Tech Stock +8% · Savings return -0.5%" }
      ],
      stockPriceChanges: { 'BNK-V': 0.02, 'TEC-F': 0.08, 'CSM-M': 0.08, 'REA-V': 0.00, 'ENE-G': 0.02 },
      savingsRateAdjustment: -0.005,
      inflationRate: 0.01,
      children: []
    },
    '5.4': {
      id: '5.4',
      year: 5,
      title: "AI becomes the trend",
      scenarioOverview: "Virus-XIX changed the world faster than expected, especially in technology. After years of remote work, online payments, digital banking, and e-commerce, people are much more open to using digital tools in daily life. As the economy becomes more stable, AI starts to rise as a new growth engine. Businesses begin applying AI in customer service, finance, logistics, education, and marketing.",
      events: [
        { title: "Generative AI Chatbots", text: "A public AI chatbot becomes popular worldwide and turns artificial intelligence from a niche tech topic into a mainstream business trend. Companies begin testing AI tools.", impact: "Tech Stock +10% · Savings return -0.5%" },
        { title: "Economic Recovery", text: "Vietnam’s recovery story becomes stronger as exports improve, manufacturing activity picks up, and FDI inflows rise. Factories receive more orders.", impact: "All Stocks +4% · Inflation +1%" }
      ],
      stockPriceChanges: { 'BNK-V': 0.04, 'TEC-F': 0.14, 'CSM-M': 0.04, 'REA-V': 0.04, 'ENE-G': 0.04 },
      savingsRateAdjustment: -0.005,
      inflationRate: 0.01,
      children: []
    }
  };

  const MARKET_EVENTS = [
    {
      year: 1,
      title: "Markets hold steady as consumers chill",
      description: "The economy is kicking off the year on a pretty solid footing. Aside from a few minor shifts in digital trends and shopping habits keeping things interesting, the market is playing it cool with record-low volatility.",
      events: [
        { title: "Digital Banking Campaign", text: "A major digital banking campaign stokes popularity among young customers. More people are opening online accounts.", impact: "Bank Stock +4% · Tech Stock +3%" },
        { title: "Shopping Festival", text: "A large shopping festival increases both online and offline purchases.", impact: "Consumer Stock +2%" }
      ]
    },
    {
      year: 2,
      title: "Geopolitical tensions stoke market anxiety",
      description: "After a calm starting year, the market reverses. Rising tensions stoke fears over vital shipping lanes, pushing oil prices up and stoking living costs.",
      events: [
        { title: "Escalating Tensions", text: "Escalating tensions stoke fears over vital shipping lanes. Oil prices stoke upward.", impact: "Energy Stock +9%" },
        { title: "Essential Inflation", text: "Spikes in fuel costs filter down to everyday essentials. Inflation rises and confidence fades.", impact: "Inflation +1.5% · Savings return +0.5%" },
        { title: "Consumer Caution", text: "Consumers start reducing spending on non-essential goods. Retail activity slows down.", impact: "Consumer Stock -2%" }
      ]
    },
    {
      year: 3,
      title: "A breath of fresh air",
      description: "After a difficult year, the market finally gets some room to breathe. Inflation pressure eases, policy support becomes clearer, and households start to feel less squeezed.",
      events: [
        { title: "New Economic Policy", text: "A new economic policy package stabilizes prices and stabilizes businesses, boosting confidence.", impact: "Other Stocks +2% · Savings return -1.5%" },
        { title: "Stable Budgets", text: "Food, fuel, and transportation prices become more stable.", impact: "Inflation -2%" },
        { title: "Brighter Business Outlook", text: "Hiring plans improve, delayed projects restart, and bonus expectations become positive.", impact: "Bank Stock +4% · Tech Stock +4%" }
      ]
    },
    {
      year: 4,
      title: "Global storms: Trade tensions rise",
      description: "After a year of recovery, the economy is running into serious trouble. Growing tensions make investors nervous and supply chains unpredictable.",
      events: [
        { title: "Trade Barriers", text: "Political conflicts between major powers stoke fears about slower trade and weaker demand.", impact: "Consumer Stock -7% · Other Stocks -5%" },
        { title: "Logistics Delays", text: "New restrictions and logistics delays make imported goods and raw materials much more expensive.", impact: "Inflation +2%" },
        { title: "Market Volatility", text: "Risk aversion moves money out of stocks and into safe bank savings.", impact: "Savings return +1.5%" }
      ]
    },
    {
      year: 5,
      title: "The calm after the storm: Markets bounce back",
      description: "Negotiations show progress. Trade barriers ease, global markets turn positive, and businesses enjoy a much more stable environment.",
      events: [
        { title: "Global Negotiations", text: "Talks between major blocs reduce uncertainty and stoke stock market buying.", impact: "All Stocks +3% · Savings return -0.5%" },
        { title: "Normalized Supply Chains", text: "Supply chains return to normal, lowering operating costs and production expenses.", impact: "Consumer Stock +2%" }
      ]
    }
  ];

  /* ──────────────────────────────────────────────────────────
     PUBLIC API
     ────────────────────────────────────────────────────────── */
  return {
    ROUNDS,
    HOUR_OPTIONS,
    SIDE_JOBS,
    SIDE_JOB_MH_MULTIPLIERS,
    SIDE_JOB_PH_MULTIPLIERS,
    BASE_EXPENSES,
    MIN_EXPENSES,
    BASE_RATIOS,
    MH_EXPENSE_COEFF,
    SAVINGS_TIERS,
    STOCKS,
    STOCK_PRICE_CHANGES,
    STOCK_TRADING_FEE,
    STOCK_SELL_TAX,
    QUINTILE_BREAKPOINTS,
    MH_MULTIPLIERS,
    PH_MULTIPLIERS,
    MH_WORK_COEFF,
    PH_WORK_COEFF,
    BASE_HEALTH_LOSS,
    HEALTHCARE_RECOVERY,
    HEALTH_THRESHOLDS,
    HEALTH_WARNING_EVENTS,
    SCORE_BENCHMARK,
    ARCHETYPES,
    LOSE_CONDITIONS,
    CHARACTER_SVGS,
    LIFE_EVENTS,
    MARKET_EVENTS,
    MARKET_EVENT_TREE,
    SAVINGS_RATE_ADJUSTMENTS,
    RANDOM_EVENTS,
    JOB_REWARD_EVENTS,
    EXPENSE_PENALTY_EVENTS,

    // Functions
    getOTWage,
    getInsuranceFee,
    getSavingsRate,
    getSavingsTierLabel,
    getIncomeQuintile,
    getHealthcareRecovery,
    getHealthThreshold,
    getCharacterSVG,
    createInitialState,
    createRoundDecision,
  };

})();

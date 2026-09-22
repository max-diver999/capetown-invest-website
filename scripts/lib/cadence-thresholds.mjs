/**
 * Пороги AI-каденции для capetown-invest (английский корпус).
 *
 * Движок `scripts/lib/ai-cadence.mjs` и CLI `scripts/cadence-check.mjs` общие с
 * moregroupestate-ru и more-group-website, байт в байт. Разница между сайтами
 * живёт только здесь: язык шаблонов и потолки по коллекциям. Расхождение копий
 * движка ловит `npm run cadence:parity`.
 *
 * КАК МЕНЯТЬ ПОРОГИ. Числа посчитаны командой `node scripts/cadence-check.mjs
 * --calibrate --json` по живому корпусу и одним детерминированным правилом,
 * одинаковым для всех сайтов:
 *   maxPer1k        = max(2.5, p90 плотности, округлённый до ближайших 0.5);
 *   maxMetronomePct = p90 метронома, округлённый ВВЕРХ до кратного 5, в пределах 20..60;
 *   minCv           = (p10 CV минус 0.05), округлённый ВНИЗ до 0.05, в пределах 0.25..0.35.
 * Профиль раздела заводится только там, где в разделе не меньше 8 файлов длиннее
 * порога слов. Квантили линейные, той же формулой, что в cadence-check.mjs.
 * Порог из головы здесь запрещён: гейт по GEO-баллу, выставленный до замера,
 * кончился тем, что машинные тексты набирали 92, а рукописные 78.
 */

export const LANG = 'en';

/** Замер 22.09.2026, 186 файлов длиннее 250 слов, ветка cc/cadence-port. */
export const CALIBRATION = {
  measuredAt: '2026-09-22',
  files: 186,
  corpus: {
    per1k: { p50: 2.21, p75: 3.00, p90: 3.98, max: 6.78 },
    metronomePct: { p50: 18, p75: 27, p90: 33, max: 44 },
    cv: { p10: 0.45, p25: 0.48, p50: 0.53 },
  },
  /**
   * Сумма по категориям на весь корпус: antithesis 722 (3.88 на файл),
   * superlativeOpener 12, colonHook 6, clerical 1, headingHook 1, literary 0,
   * impersonal 0, calque 0.
   *
   * Картина та же, что на Пхукете: почти всю плотность даёт одна фигура речи,
   * антитеза («X, not Y», «not X but Y»), 722 попадания из 743. Канцелярит и
   * пафос, которые ловит прежний гейт (lib/more-content-gate.mjs), дают на весь
   * корпус 1 и 0 попаданий. Прежняя проверка сторожила то, чего в корпусе нет.
   *
   * Невидимых символов нет ни в одном файле, неразрывного пробела тоже.
   * Все семь разделов на английском (кириллицы в src/content ноль), исключать
   * нечего.
   */
  totals: {
    antithesis: 722,
    superlativeOpener: 12,
    colonHook: 6,
    clerical: 1,
    headingHook: 1,
    literary: 0,
    impersonal: 0,
    calque: 0,
  },
  dominantCategory: 'antithesis',
};

export const CADENCE_THRESHOLDS = {
  // p75 3.00 / p90 3.98 по 186 файлам; 3.98 до ближайших 0.5 даёт 4.0
  maxPer1k: 4.0,
  // p75 27 / p90 33; p90 вверх до кратного 5 даёт 35
  maxMetronomePct: 35,
  // p10 0.45 / p25 0.48; 0.45 - 0.05 = 0.40, в пределе 0.35
  minCv: 0.35,
  maxParallel: 3,
  // Повтор n-граммы шумит на шаблонных карточках проектов: только отчёт.
  maxRepeated: null,
  // Ниже 300 слов плотность на 1000 слов перестаёт быть устойчивой: четыре
  // попадания на 264 слова дают 15/1k и выглядят как провал на ровном месте.
  minWords: 300,
};

/**
 * Профили по коллекциям, каждый по своим квантилям.
 * news (5 файлов) и segments (4 файла) профиля не получают: меньше 8 файлов,
 * квантиль на такой выборке ничего не значит, работает база.
 */
export const COLLECTION_PROFILES = {
  // n=79; p75 3.09 / p90 4.41, метроном p75 21 / p90 30, CV p10 0.45
  guides: { maxPer1k: 4.5, maxMetronomePct: 30, minCv: 0.35 },
  // карточки, n=46 длиннее 400 слов; p75 3.58 / p90 3.88, метроном p75 32 / p90 38, CV p10 0.49
  projects: { maxPer1k: 4.0, maxMetronomePct: 40, minCv: 0.35, minWords: 400, maxParallel: 4 },
  // n=26; p75 2.13 / p90 3.18, метроном p75 21 / p90 29, CV p10 0.42
  areas: { maxPer1k: 3.0, maxMetronomePct: 30, minCv: 0.35 },
  // n=15; p75 2.23 / p90 2.54 (до 0.5 даёт 2.5, это и есть нижний предел),
  // метроном p75 30 / p90 34, CV p10 0.44
  compare: { maxPer1k: 2.5, maxMetronomePct: 35, minCv: 0.35 },
  // карточки, n=11 длиннее 400 слов; p75 3.33 / p90 4.21, метроном p75 36 / p90 37, CV p10 0.46
  developers: { maxPer1k: 4.0, maxMetronomePct: 40, minCv: 0.35, minWords: 400, maxParallel: 4 },
};

export function cadenceProfileFor(collection) {
  return { ...CADENCE_THRESHOLDS, ...(COLLECTION_PROFILES[collection] || {}) };
}

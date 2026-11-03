/*
 * Resolve live HR month tabs from provider workbook order.
 * A tab without a year inherits only from its preceding, consecutive monthly
 * tab. Never infer a year from the system clock or silently merge duplicates.
 * This is metadata mapping only: it does not create or modify HR tabs.
 */
const MONTHS = [
  ['ENERO', 'ENE', 'Enero'], ['FEBRERO', 'FEB', 'Febrero'],
  ['MARZO', 'MAR', 'Marzo'], ['ABRIL', 'ABR', 'Abril'],
  ['MAYO', 'MAY', 'Mayo'], ['JUNIO', 'JUN', 'Junio'],
  ['JULIO', 'JUL', 'Julio'], ['AGOSTO', 'AGO', 'Agosto'],
  ['SEPTIEMBRE', 'SEP', 'Septiembre'], ['OCTUBRE', 'OCT', 'Octubre'],
  ['NOVIEMBRE', 'NOV', 'Noviembre'], ['DICIEMBRE', 'DIC', 'Diciembre']
];

const MONTH_INDEX = new Map(MONTHS.map(([name], index) => [name, index + 1]));
MONTH_INDEX.set('SETIEMBRE', 9);
const MONTH_NAME = '(ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|SETIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE)';
const TAB_PATTERN = new RegExp(`^${MONTH_NAME}(?:\\s+(\\d{2}))?(?:\\s+(HN))?$`);

export function resolveLiveMonthTabs(providerTabs){
  const ordered = (providerTabs || []).map((tab, position) => ({
    title: String(tab.title || ''),
    index: Number.isInteger(tab.index) ? tab.index : position,
    position
  })).sort((a, b) => a.index - b.index || a.position - b.position);
  const resolved = [];
  const observed = new Set();
  let previous = null;

  for(const tab of ordered){
    const clean = tab.title.trim().replace(/\s+/g, ' ').toUpperCase();
    const match = clean.match(TAB_PATTERN);
    if(!match) continue;

    const monthNumber = MONTH_INDEX.get(match[1]);
    const country = match[3] === 'HN' ? 'HN' : 'GT';
    let year;
    if(match[2]){
      year = 2000 + Number(match[2]);
    }else{
      if(!previous) throw new Error(`HR_MONTH_YEAR_UNRESOLVED: ${tab.title}`);
      const expectedMonth = previous.month === 12 ? 1 : previous.month + 1;
      if(monthNumber !== previous.month && monthNumber !== expectedMonth){
        throw new Error(`HR_MONTH_YEAR_AMBIGUOUS: ${tab.title} after ${previous.tabTitle}`);
      }
      year = previous.year + (monthNumber === 1 && previous.month === 12 ? 1 : 0);
    }

    const key = `${year}-${String(monthNumber).padStart(2, '0')}`;
    const identity = `${key}/${country}`;
    if(observed.has(identity)) throw new Error(`HR_MONTH_DUPLICATE: ${identity}`);
    observed.add(identity);
    const [, short, full] = MONTHS[monthNumber - 1];
    const entry = {
      country,
      year,
      month: monthNumber,
      monthName: full,
      label: `${short} ${year}`,
      fullLabel: `${full} ${year}`,
      key,
      tabTitle: tab.title,
      yearResolution: match[2] ? 'explicit_title' : 'adjacent_provider_tab'
    };
    resolved.push(entry);
    previous = entry;
  }
  return resolved;
}

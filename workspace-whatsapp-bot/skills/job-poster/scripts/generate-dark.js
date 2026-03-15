
const fs    = require('fs');
const path  = require('path');
const sharp = require('sharp');

const OUTPUT_DIR = process.env.JOB_POSTER_OUTPUT_DIR || path.join(__dirname, 'output');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ─── Helpers ──────────────────────────────────────────────────────────────────
function esc(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}

function buildReqList(job) {
  const { requirements=[], experience, education, location,
          workMode, shift, workingDays, communication, techStack, salary } = job;
  if (requirements.length > 0) return requirements.slice(0, 7);
  const list = [];
  if (experience)    list.push(`Experience: ${experience}`);
  if (education)     list.push(`Education: ${education}`);
  if (location)      list.push(`LOCATION: ${location}`);
  if (workMode)      list.push(`Work Mode: ${workMode}`);
  if (shift)         list.push(`Shift: ${shift}`);
  if (workingDays)   list.push(`Working Days: ${workingDays}`);
  if (communication) list.push(`${communication}`);
  if (techStack)     list.push(`Tech Stack: ${techStack}`);
  if (salary)        list.push(`Salary: ${salary}`);
  return list.slice(0, 7);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEAL DARK TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════════
function tealDark(job) {
  const W = 900, H = 1200;
  const {
    title            = 'Job Opening',
    company          = 'Company',
    companyShortLogo = null,
    email            = '',
    bgColor          = '#1a6b6b',
    blobColor        = '#f5c800',
  } = job;

  const reqList    = buildReqList(job);
  const logoLetter = companyShortLogo || company.charAt(0).toUpperCase();

  // Split title across 1–2 lines
  const words = title.trim().split(' ');
  const mid   = Math.ceil(words.length / 2);
  const tL1   = words.slice(0, mid).join(' ').toUpperCase();
  const tL2   = words.length > 2 ? words.slice(mid).join(' ').toUpperCase() : '';
  const tSize = tL2
    ? (tL1.length > 15 ? 34 : tL1.length > 11 ? 40 : 46)
    : (tL1.length > 15 ? 36 : tL1.length > 11 ? 42 : 50);
  const pillH = tL2 ? 134 : 84;

  // Y positions
  const logoY      = 40;
  const weAreY     = 248;
  const hiringY    = weAreY + 135;
  const pillY      = hiringY + 110;
  const badgeY     = pillY + pillH + 30;
  const reqY       = badgeY + 66;
  const reqLineH   = 52;
  const divY       = reqY + reqList.length * reqLineH + 10;
  const ctaBtnY    = divY + 20;
  const emailPillY = ctaBtnY + 72;

  const compWords = company.split(' ');
  const compLine1 = compWords[0] || company;
  const compLine2 = compWords.slice(1).join(' ') || 'technologies';

  const dots3 = (cx, cy) =>
    [0,1,2].map(i=>`<circle cx="${cx+i*20}" cy="${cy}" r="4.5" fill="rgba(255,255,255,0.45)"/>`).join('');

  // Line-art megaphone
  const mX = W - 240, mY = logoY + 10;
  const megaphone = `
    <g transform="translate(${mX},${mY}) rotate(-12,90,85)">
      <path d="M28 60 L105 28 L105 118 L28 90 Z"
        fill="none" stroke="white" stroke-width="4" stroke-linejoin="round"/>
      <rect x="6" y="63" width="26" height="28" rx="4"
        fill="none" stroke="white" stroke-width="4"/>
      <path d="M105 28 Q160 8 170 73 Q160 130 105 118"
        fill="none" stroke="white" stroke-width="4"/>
      <path d="M177 52 Q200 73 177 94"
        fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M188 40 Q220 73 188 106"
        fill="none" stroke="white" stroke-width="2.8" stroke-linecap="round"/>
    </g>`;

  const reqSVG = reqList.map((item, i) => `
    <text x="62" y="${reqY + i*reqLineH + 30}"
      font-family="Georgia,'Times New Roman',serif"
      font-size="28" font-style="italic"
      fill="white" opacity="0.95">${esc(item)}</text>`).join('');

  const noise = Array.from({length:55},(_,i)=>{
    const y=i*22, op=(0.025+Math.sin(i*0.9)*0.012).toFixed(3);
    return `<line x1="0" y1="${y}" x2="${W}" y2="${y+10}" stroke="black" stroke-width="0.7" opacity="${op}"/>`;
  }).join('');

  return `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="sh1"><feDropShadow dx="0" dy="7" stdDeviation="16" flood-color="rgba(0,0,0,0.35)"/></filter>
    <filter id="sh2"><feDropShadow dx="0" dy="3" stdDeviation="9"  flood-color="rgba(0,0,0,0.22)"/></filter>
  </defs>

  <!-- BG -->
  <rect width="${W}" height="${H}" fill="${bgColor}"/>
  ${noise}
  <rect width="${W}" height="${H}" fill="rgba(0,0,0,0.08)" opacity="0.5"/>

  <!-- YELLOW BLOBS -->
  <ellipse cx="-15"      cy="-15"        rx="295" ry="270" fill="${blobColor}"/>
  <ellipse cx="${W+22}"  cy="-22"        rx="190" ry="172" fill="${blobColor}"/>
  <ellipse cx="${W+30}"  cy="${H*0.44}"  rx="145" ry="130" fill="${blobColor}" opacity="0.92"/>
  <ellipse cx="-20"      cy="${H-28}"    rx="112" ry="102" fill="${blobColor}" opacity="0.85"/>

  <!-- DOTS -->
  ${dots3(W-192, logoY+42)}
  ${dots3(56, H-46)}
  ${dots3(W-122, H-46)}

  <!-- LOGO BOX -->
  <rect x="50" y="${logoY}" width="68" height="68" rx="12"
    fill="rgba(0,55,55,0.70)" stroke="${blobColor}" stroke-width="2.5"/>
  <text x="84" y="${logoY+47}"
    font-family="'Arial Black',sans-serif" font-size="30" font-weight="900"
    fill="${blobColor}" text-anchor="middle">${esc(logoLetter)}</text>

  <!-- COMPANY NAME -->
  <text x="132" y="${logoY+30}"
    font-family="'Arial Black',Impact,sans-serif"
    font-size="25" font-weight="900" letter-spacing="2"
    fill="rgba(0,45,45,0.88)">${esc(compLine1.toUpperCase())}</text>
  <text x="132" y="${logoY+54}"
    font-family="Arial,sans-serif" font-size="13" letter-spacing="5"
    fill="rgba(0,45,45,0.72)">${esc(compLine2.toLowerCase())}</text>

  <!-- MEGAPHONE -->
  ${megaphone}

  <!-- WE ARE -->
  <text x="56" y="${weAreY}"
    font-family="'Arial Black',Impact,sans-serif"
    font-size="118" font-weight="900" letter-spacing="4"
    fill="white" filter="url(#sh1)">WE ARE</text>

  <!-- HIRING -->
  <text x="56" y="${hiringY}"
    font-family="'Arial Black',Impact,sans-serif"
    font-size="168" font-weight="900" letter-spacing="4"
    fill="white" filter="url(#sh1)">HIRING</text>

  <!-- TITLE PILL -->
  <rect x="52" y="${pillY}" width="${W-104}" height="${pillH}" rx="${pillH/2}"
    fill="white" filter="url(#sh1)"/>
  <rect x="60" y="${pillY+7}" width="${W-120}" height="${pillH-14}" rx="${(pillH-14)/2}"
    fill="none" stroke="rgba(26,107,107,0.18)" stroke-width="1.5"/>
  <text x="${W/2}" y="${pillY+52}"
    font-family="'Arial Black',Impact,sans-serif"
    font-size="${tSize}" font-weight="900" letter-spacing="4"
    fill="${bgColor}" text-anchor="middle">${esc(tL1)}</text>
  ${tL2?`<text x="${W/2}" y="${pillY+108}"
    font-family="'Arial Black',Impact,sans-serif"
    font-size="${tSize}" font-weight="900" letter-spacing="4"
    fill="${bgColor}" text-anchor="middle">${esc(tL2)}</text>`:''}

  <!-- REQUIREMENT BADGE -->
  <rect x="${W/2-130}" y="${badgeY}" width="260" height="46" rx="23"
    fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.50)" stroke-width="2"/>
  <text x="${W/2}" y="${badgeY+30}"
    font-family="Arial,sans-serif" font-size="15" font-weight="800" letter-spacing="5"
    fill="white" text-anchor="middle">REQUIREMENT</text>

  <!-- REQ LIST -->
  ${reqSVG}

  <!-- DIVIDER -->
  <line x1="56" y1="${divY}" x2="${W-56}" y2="${divY}"
    stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>

  <!-- SEND CV TO BTN -->
  <rect x="${W/2-120}" y="${ctaBtnY}" width="240" height="56" rx="28"
    fill="white" filter="url(#sh2)"/>
  <rect x="${W/2-116}" y="${ctaBtnY+4}" width="232" height="48" rx="24"
    fill="none" stroke="rgba(26,107,107,0.22)" stroke-width="1"/>
  <text x="${W/2}" y="${ctaBtnY+37}"
    font-family="Arial,sans-serif" font-size="18" font-weight="800" letter-spacing="4"
    fill="${bgColor}" text-anchor="middle">SEND CV TO</text>

  <!-- EMAIL PILL -->
  ${email?`
  <rect x="52" y="${emailPillY}" width="${W-104}" height="62" rx="31"
    fill="white" filter="url(#sh2)"/>
  <text x="${W/2}" y="${emailPillY+40}"
    font-family="Arial,'Segoe UI',sans-serif"
    font-size="24" font-weight="500"
    fill="${bgColor}" text-anchor="middle">${esc(email)}</text>`:''}
</svg>`.trim();
}

// ─── Generate ─────────────────────────────────────────────────────────────────
async function generatePoster(job, _bg=null, outputPath=null) {
  const { title='job' } = job;
  if (!outputPath) {
    const ts   = Date.now();
    const slug = title.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'').slice(0,30);
    outputPath = path.join(OUTPUT_DIR, `poster-${slug}-${ts}.png`);
  }

  const svg = tealDark(job);

  await sharp(Buffer.from(svg))
    .resize(900, 1200, { fit:'fill' })
    .png({ quality:95 })
    .toFile(outputPath);

  const metaPath = outputPath.replace('.png','.json');
  fs.writeFileSync(metaPath, JSON.stringify(
    { ...job, posterPath:outputPath, createdAt:new Date().toISOString() },
    null, 2
  ));
  console.log(`✅ Poster saved → ${outputPath}`);
  return { posterPath:outputPath, metaPath, job };
}

// ─── CLI ──────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.error([
      'Usage:',
      '  node poster.js --test                   # generate demo poster',
      '  node poster.js <job-json> [output-path] # generate from JSON',
    ].join('\n'));
    process.exit(1);
  }

  const DEMO = {
    title:            'Jr. HR Executive',
    company:          'Excellence Technologies',
    companyShortLogo: 'X',
    email:            'isha@excellencetechnologies.in',
    bgColor:          '#1a6b6b',
    blobColor:        '#f5c800',
    requirements: [
      'Experience: 0–1 year',
      'Education: Any graduate',
      'LOCATION: Delhi/NCR preferred',
      'Excellent communication skills',
      'Open to work from office',
    ],
  };

  if (args[0]==='--test') {
    await generatePoster(DEMO, null, path.join(OUTPUT_DIR,'poster-demo.png'));
    return;
  }

  try {
    const [jobJson, out] = args;
    const result = await generatePoster(JSON.parse(jobJson), null, out||null);
    console.log(JSON.stringify(result, null, 2));
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

module.exports = { generatePoster, buildReqList };
if (require.main === module) main();
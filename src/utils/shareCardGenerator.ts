import { PredictionResult } from '../types';

/**
 * Generates an ultra-crisp, high-resolution (1080x1350) shareable scorecard PNG
 * rendered directly on an HTML5 Canvas without external dependencies.
 * Never includes private phone numbers or personal contact data.
 */
export async function generateShareCardCanvas(result: PredictionResult): Promise<string> {
  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = 1350;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Background gradient (Deep Midnight Indigo to Royal Violet)
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, '#0f172a'); // slate-900
  bgGradient.addColorStop(0.3, '#1e1b4b'); // indigo-950
  bgGradient.addColorStop(0.7, '#312e81'); // indigo-900
  bgGradient.addColorStop(1, '#4c1d95'); // violet-900
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // 2. Decorative glowing cosmic orbs
  const drawGlow = (x: number, y: number, r: number, color: string) => {
    const radial = ctx.createRadialGradient(x, y, 0, x, y, r);
    radial.addColorStop(0, color);
    radial.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };

  drawGlow(200, 250, 350, 'rgba(99, 102, 241, 0.25)'); // Indigo glow
  drawGlow(880, 450, 400, 'rgba(168, 85, 247, 0.22)'); // Purple glow
  drawGlow(400, 1100, 450, 'rgba(59, 130, 246, 0.18)'); // Blue glow

  // 3. Decorative Border & Glass Card Frame
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 4;
  roundRect(ctx, 40, 40, width - 80, height - 80, 40);
  ctx.stroke();

  // 4. Header Badge Pill: "NEET 2027 SCORE CHALLENGE"
  ctx.fillStyle = 'rgba(99, 102, 241, 0.35)';
  roundRect(ctx, width / 2 - 250, 80, 500, 60, 30);
  ctx.fill();
  ctx.strokeStyle = 'rgba(165, 180, 252, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#c7d2fe';
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⚡ OFFICIAL NEET 2027 CHALLENGE ⚡', width / 2, 118);

  // 5. Aspirant Name & State
  const displayName = result.studentName.trim() ? `Dr. ${result.studentName}` : 'Future Doctor';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 54px system-ui, -apple-system, sans-serif';
  ctx.fillText(displayName, width / 2, 220);

  // State Badge
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  const stateText = `📍 ${result.state} Medical Aspirant`;
  ctx.font = '500 28px system-ui, -apple-system, sans-serif';
  const stateWidth = ctx.measureText(stateText).width + 48;
  roundRect(ctx, width / 2 - stateWidth / 2, 250, stateWidth, 50, 25);
  ctx.fill();

  ctx.fillStyle = '#e0e7ff';
  ctx.fillText(stateText, width / 2, 285);

  // 6. Central Score Card
  const cardX = 90;
  const cardY = 330;
  const cardW = width - 180;
  const cardH = 430;

  // Glass card background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  roundRect(ctx, cardX, cardY, cardW, cardH, 36);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // "PROJECTED NEET 2027 SCORE"
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
  ctx.fillText('ESTIMATED TARGET SCORE', width / 2, cardY + 70);

  // BIG SCORE NUMERAL
  ctx.fillStyle = '#38bdf8';
  ctx.font = '900 130px system-ui, -apple-system, sans-serif';
  const scoreText = `${result.estimatedScore}`;
  ctx.fillText(scoreText, width / 2 - 50, cardY + 205);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 50px system-ui, -apple-system, sans-serif';
  ctx.fillText('/ 720', width / 2 + 150, cardY + 195);

  // Range and Percentile Pill
  ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
  const rangeText = `Target Range: ${result.scoreBandMin} – ${result.scoreBandMax}  •  Top ~${(100 - result.estimatedPercentile).toFixed(1)}% in India`;
  ctx.font = '600 28px system-ui, -apple-system, sans-serif';
  const rangePillWidth = ctx.measureText(rangeText).width + 60;
  roundRect(ctx, width / 2 - rangePillWidth / 2, cardY + 250, rangePillWidth, 56, 28);
  ctx.fill();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.stroke();

  ctx.fillStyle = '#7dd3fc';
  ctx.fillText(rangeText, width / 2, cardY + 288);

  // College Tier
  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 30px system-ui, -apple-system, sans-serif';
  ctx.fillText(`🎯 ${result.collegeTier.tierName}`, width / 2, cardY + 360);

  // 7. Subject breakdown grid
  const subY = 800;
  const subW = (width - 240) / 3;
  const subjects = [
    { name: 'Physics', score: result.breakdown.physics, max: 180, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
    { name: 'Chemistry', score: result.breakdown.chemistry, max: 180, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
    { name: 'Biology', score: result.breakdown.biologyTotal, max: 360, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  ];

  subjects.forEach((sub, i) => {
    const sx = 100 + i * (subW + 20);
    ctx.fillStyle = sub.bg;
    roundRect(ctx, sx, subY, subW, 140, 24);
    ctx.fill();
    ctx.strokeStyle = sub.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 24px system-ui, -apple-system, sans-serif';
    ctx.fillText(sub.name, sx + subW / 2, subY + 45);

    ctx.fillStyle = sub.color;
    ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${sub.score}`, sx + subW / 2 - 30, subY + 105);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.fillText(`/${sub.max}`, sx + subW / 2 + 35, subY + 105);
  });

  // 8. Botany & Zoology mini banner
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  roundRect(ctx, 100, 970, width - 200, 70, 20);
  ctx.fill();
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '500 24px system-ui, -apple-system, sans-serif';
  ctx.fillText(`🌿 Botany: ${result.breakdown.botany}/180   |   🔬 Zoology: ${result.breakdown.zoology}/180`, width / 2, 1014);

  // 9. Motivational quote box
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  roundRect(ctx, 100, 1070, width - 200, 110, 24);
  ctx.fill();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'italic 24px system-ui, -apple-system, sans-serif';
  // wrap text if needed
  const words = result.motivatingQuote.split(' ');
  let line1 = '';
  let line2 = '';
  for (const w of words) {
    if ((line1 + w).length < 65 && !line2) {
      line1 += (line1 ? ' ' : '') + w;
    } else {
      line2 += (line2 ? ' ' : '') + w;
    }
  }
  ctx.fillText(line1, width / 2, 1115);
  if (line2) {
    ctx.fillText(line2, width / 2, 1150);
  }

  // 10. Call to action & Challenge link footer
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
  ctx.fillText('🔥 Can you beat my predicted score? Take the Challenge!', width / 2, 1230);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '600 22px system-ui, -apple-system, sans-serif';
  ctx.fillText('Illustrative benchmark estimate • Free & instant for NEET 2027 aspirants', width / 2, 1265);

  return canvas.toDataURL('image/png');
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/**
 * Downloads the generated scorecard PNG directly to device storage.
 */
export async function downloadScoreCardImage(result: PredictionResult): Promise<void> {
  const dataUrl = await generateShareCardCanvas(result);
  if (!dataUrl) return;

  const link = document.createElement('a');
  const safeName = (result.studentName || 'aspirant').replace(/[^a-zA-Z0-9]/g, '_');
  link.download = `NEET_2027_Score_${result.estimatedScore}_${safeName}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Formats WhatsApp share link with encoded message and current page link.
 */
export function getWhatsAppShareUrl(result: PredictionResult, originUrl?: string): string {
  const url = originUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://neet2027score.in');
  const student = result.studentName ? result.studentName : 'I';
  
  const text = 
`🩺 *NEET 2027 Future Score Challenge!* 🎯

Hey! ${student} just calculated estimated target score for NEET 2027:
⭐ *Predicted Score: ${result.estimatedScore} / 720*
📊 *Range:* ${result.scoreBandMin} – ${result.scoreBandMax} marks
🏛️ *Target:* ${result.collegeTier.tierName}

Can you beat my score? Take the free challenge here:
👉 ${url}

_(Note: Illustrative non-scientific estimate based on study hours & mock progress)_`;

  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

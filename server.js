import http from 'http';
import express from 'express';
import cors from 'cors';
import twilio from 'twilio';

const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ],
}));

// ── Twilio credentials (set via environment variables) ─────
const ACCOUNT_SID  = process.env.TWILIO_ACCOUNT_SID  || '';
const AUTH_TOKEN   = process.env.TWILIO_AUTH_TOKEN   || '';
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER || '';

const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

// ── Admin phones bypass Twilio (use fixed OTP) ─────────────
const ADMIN_PHONES  = ['+971543393797', '+971502222691'];
const ADMIN_OTP     = '0000';

// ── OTP store: phone → { otp, expiresAt, attempts } ────────
const otpStore = new Map();

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS  = 5;

function formatPhone(phone) {
  const clean = phone.trim();
  if (clean.startsWith('+')) return clean;
  if (clean.startsWith('00')) return '+' + clean.slice(2);
  if (clean.startsWith('971')) return '+' + clean;
  if (clean.startsWith('0')) return '+971' + clean.slice(1);
  return '+971' + clean;
}

// ── Send OTP ────────────────────────────────────────────────
app.post('/api/send-otp', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, error: 'رقم الهاتف مطلوب' });
  }

  const formatted = formatPhone(phone);
  console.log('[OTP] request for raw="' + phone + '" formatted="' + formatted + '"');

  // Admin bypass
  if (ADMIN_PHONES.includes(formatted)) {
    otpStore.set(formatted, { otp: ADMIN_OTP, expiresAt: Date.now() + OTP_EXPIRY_MS, attempts: 0 });
    console.log('[OTP] Admin bypass set for ' + formatted + ' -> code: ' + ADMIN_OTP);
    return res.json({ success: true });
  }

  const otp = String(Math.floor(1000 + Math.random() * 9000));
  otpStore.set(formatted, { otp, expiresAt: Date.now() + OTP_EXPIRY_MS, attempts: 0 });
  console.log('[OTP] Generated for ' + formatted + ' -> ' + otp);

  try {
    const msg = await client.messages.create({
      body: 'WorkHub OTP code: ' + otp + ' - Valid 5 minutes. Do not share.',
      from: TWILIO_PHONE,
      to: formatted,
    });

    console.log('[OTP] SMS sent to ' + formatted + ' SID=' + msg.sid);
    res.json({ success: true });

  } catch (err) {
    console.error('[OTP] Twilio FAILED for ' + formatted + ': ' + err.message);
    console.log('[OTP] Code for ' + formatted + ' = ' + otp + ' (check console to share manually)');
    // Return error so frontend can show user a meaningful message
    res.status(500).json({
      success: false,
      error: 'فشل إرسال الرسالة. تحقق من الرقم أو تواصل مع الإدارة.',
      twilioError: err.message,
    });
  }
});

// ── Verify OTP ──────────────────────────────────────────────
app.post('/api/verify-otp', (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ valid: false, error: 'بيانات ناقصة' });
  }

  const formatted = formatPhone(phone);
  const record = otpStore.get(formatted);

  if (!record) {
    return res.status(400).json({ valid: false, error: 'لم يتم إرسال رمز لهذا الرقم، اضغط إرسال أولاً' });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(formatted);
    return res.status(400).json({ valid: false, error: 'انتهت صلاحية الرمز، أعد الإرسال' });
  }

  record.attempts++;

  if (record.attempts > MAX_ATTEMPTS) {
    otpStore.delete(formatted);
    return res.status(400).json({ valid: false, error: 'تجاوزت الحد المسموح، أعد الإرسال' });
  }

  if (record.otp !== String(otp)) {
    const left = MAX_ATTEMPTS - record.attempts + 1;
    return res.status(400).json({ valid: false, error: `رمز التحقق غير صحيح (${left} محاولات متبقية)` });
  }

  otpStore.delete(formatted);
  console.log(`✅ OTP verified for ${formatted}`);
  res.json({ valid: true });
});

// ── Health check ────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ── Start using http.createServer to stay alive ─────────────
const PORT = 3001;
const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 وورك هب Server → http://localhost:${PORT}`);
  console.log(`📱 Twilio: ${TWILIO_PHONE}`);
  console.log(`🔑 Admin phones: ${ADMIN_PHONES.join(', ')} → OTP: ${ADMIN_OTP}\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Close the other process and retry.`);
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});

// Keep process alive
process.on('SIGINT', () => { server.close(); process.exit(0); });
process.on('SIGTERM', () => { server.close(); process.exit(0); });

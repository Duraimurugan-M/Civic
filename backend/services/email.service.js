const https = require('https');

const baseTemplate = (content) => `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;background:#EFF6FF;padding:28px 12px}
.wrap{max-width:560px;margin:0 auto}
.header{background:linear-gradient(135deg,#1D4ED8,#3B82F6);border-radius:16px 16px 0 0;padding:32px 36px;text-align:center}
.logo-box{width:56px;height:56px;background:rgba(255,255,255,0.18);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:12px}
.header h1{color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.3px}
.header p{color:rgba(255,255,255,0.72);font-size:12px;margin-top:3px}
.body{background:#fff;padding:32px 36px;border:1px solid #DBEAFE;border-top:none}
.greeting{font-size:20px;font-weight:700;color:#1E293B;margin-bottom:8px}
.sub{font-size:14px;color:#64748B;line-height:1.6;margin-bottom:20px}
.divider{height:1px;background:#F1F5F9;margin:20px 0}
table.info{width:100%;border-collapse:collapse;margin-bottom:20px}
table.info td{padding:9px 4px;font-size:13px;border-bottom:1px solid #F8FAFC}
.lbl{color:#94A3B8;font-weight:500;width:130px}
.val{color:#1E293B;font-weight:600}
.badge{display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;background:#EFF6FF;color:#2563EB;border:1px solid #BFDBFE}
.bp{background:#FEF3C7;color:#D97706;border-color:#FDE68A}
.br{background:#D1FAE5;color:#059669;border-color:#A7F3D0}
.bu{background:#FEE2E2;color:#DC2626;border-color:#FECACA}
.alert{border-radius:10px;padding:12px 16px;margin-bottom:18px;font-size:13px;line-height:1.5}
.ai{background:#EFF6FF;border:1px solid #BFDBFE;color:#1E40AF}
.as{background:#F0FDF4;border:1px solid #BBF7D0;color:#166534}
.aw{background:#FFFBEB;border:1px solid #FDE68A;color:#92400E}
.step{display:flex;gap:12px;margin-bottom:12px;align-items:flex-start}
.dot{width:8px;height:8px;border-radius:50%;background:#2563EB;margin-top:4px;flex-shrink:0}
.sc{font-size:13px;color:#475569}
.btn{display:inline-block;background:linear-gradient(135deg,#2563EB,#1D4ED8);color:#fff !important;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;margin-top:6px}
.btn-g{background:linear-gradient(135deg,#10B981,#059669)}
.footer{background:#F8FAFC;border:1px solid #DBEAFE;border-top:none;border-radius:0 0 16px 16px;padding:20px 36px;text-align:center}
.footer p{font-size:11px;color:#94A3B8;margin-bottom:3px;line-height:1.5}
.footer a{color:#2563EB;text-decoration:none}
</style></head>
<body><div class="wrap">
<div class="header">
  <div class="logo-box">🏛️</div>
  <h1>CivicConnect</h1>
  <p>Smart Civic Issue Management System</p>
</div>
<div class="body">${content}</div>
<div class="footer">
  <p>© ${new Date().getFullYear()} <strong>CivicConnect</strong> — Smart Civic Issue Management</p>
  <p>Automated notification — do not reply &nbsp;·&nbsp;
  <a href="${process.env.FRONTEND_URL}">Visit Portal</a></p>
</div>
</div></body></html>`;

const fmt = (d) => d
  ? new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  : '-';

// ── Core send function using Brevo HTTP API ──
// Uses Node.js built-in https — no nodemailer, no SMTP, no port issues
const send = async ({ to, subject, content }) => {
  if (!to)                        return;
  if (!process.env.BREVO_API_KEY) return;

  const htmlContent = baseTemplate(content);

  const body = JSON.stringify({
    sender:      { name: 'CivicConnect', email: process.env.EMAIL_FROM },
    to:          [{ email: to }],
    subject,
    htmlContent,
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.brevo.com',
      path:     '/v3/smtp/email',
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'api-key':        process.env.BREVO_API_KEY,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (process.env.NODE_ENV !== 'production') {
            console.log(`📧 Email sent → ${to}`);
          }
        } else {
          console.error(`❌ Email failed → ${to} | Status: ${res.statusCode} | ${data}`);
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error(`❌ Email error → ${to}: ${err.message}`);
      resolve();
    });

    req.write(body);
    req.end();
  });
};

// ── Welcome Email ──
exports.sendWelcomeEmail = (user) => send({
  to:      user.email,
  subject: '🎉 Welcome to CivicConnect',
  content: `
<p class="greeting">Welcome, ${user.name}! 🎉</p>
<p class="sub">Your CivicConnect account has been created. You can now report civic issues, track resolutions, and help improve your community.</p>
<table class="info">
  <tr><td class="lbl">Full Name</td><td class="val">${user.name}</td></tr>
  <tr><td class="lbl">Email</td><td class="val">${user.email}</td></tr>
  ${user.citizenId
    ? `<tr><td class="lbl">Citizen ID</td><td class="val"><span class="badge">${user.citizenId}</span></td></tr>`
    : ''}
  <tr><td class="lbl">Account Type</td><td class="val"><span class="badge">${user.role.toUpperCase()}</span></td></tr>
</table>
<div class="divider"></div>
<div class="step"><div class="dot"></div>
  <div class="sc"><strong>Report Issues</strong> — Submit problems with photo and live location</div>
</div>
<div class="step"><div class="dot" style="background:#10B981"></div>
  <div class="sc"><strong>Track Progress</strong> — Follow each complaint from start to resolution</div>
</div>
<div class="step"><div class="dot" style="background:#F59E0B"></div>
  <div class="sc"><strong>View on Map</strong> — See all issues in your area on an interactive map</div>
</div>
<div class="step"><div class="dot" style="background:#8B5CF6"></div>
  <div class="sc"><strong>Rate Resolutions</strong> — Give feedback after your complaint is resolved</div>
</div>
<div style="text-align:center;margin-top:24px">
  <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">Get Started →</a>
</div>`,
});

// ── Complaint Submitted Email ──
exports.sendComplaintSubmittedEmail = (user, complaint) => send({
  to:      user.email,
  subject: `✅ Complaint Received — ${complaint.complaintCode}`,
  content: `
<p class="greeting">Complaint Received ✅</p>
<p class="sub">Your complaint has been submitted successfully and is under review.</p>
<div class="alert ai">📋 Complaint Reference: <strong>${complaint.complaintCode}</strong></div>
<table class="info">
  <tr><td class="lbl">Reference No.</td><td class="val">${complaint.complaintCode}</td></tr>
  <tr><td class="lbl">Title</td><td class="val">${complaint.title}</td></tr>
  <tr><td class="lbl">Category</td><td class="val"><span class="badge">${complaint.category.toUpperCase()}</span></td></tr>
  <tr><td class="lbl">Priority</td>
    <td class="val">
      <span class="badge ${complaint.priority === 'emergency' || complaint.priority === 'high' ? 'bu' : ''}">
        ${complaint.priority.toUpperCase()}
      </span>
    </td>
  </tr>
  <tr><td class="lbl">Status</td><td class="val"><span class="badge bp">🟡 Pending Review</span></td></tr>
  <tr><td class="lbl">Submitted</td><td class="val">${fmt(new Date())}</td></tr>
</table>
<div style="text-align:center;margin-top:20px">
  <a href="${process.env.FRONTEND_URL}/complaints/${complaint._id}" class="btn">Track Complaint →</a>
</div>`,
});

// ── Status Update Email ──
exports.sendStatusUpdateEmail = (user, complaint) => send({
  to:      user.email,
  subject: `🔔 Update on ${complaint.complaintCode}`,
  content: `
<p class="greeting">Complaint Status Updated 🔔</p>
<p class="sub">There is an update on your complaint. Please check the details below.</p>
<table class="info">
  <tr><td class="lbl">Reference</td><td class="val">${complaint.complaintCode}</td></tr>
  <tr><td class="lbl">Title</td><td class="val">${complaint.title}</td></tr>
  <tr><td class="lbl">New Status</td>
    <td class="val">
      <span class="badge ${
        complaint.status === 'resolved' ? 'br' :
        complaint.status === 'rejected' ? 'bu' : 'bp'
      }">
        ${complaint.status.replace('_', ' ').toUpperCase()}
      </span>
    </td>
  </tr>
  <tr><td class="lbl">Updated On</td><td class="val">${fmt(new Date())}</td></tr>
</table>
<div class="alert aw">💡 Log in to view the full timeline and notes added by the team.</div>
<div style="text-align:center;margin-top:16px">
  <a href="${process.env.FRONTEND_URL}/complaints/${complaint._id}" class="btn">View Details →</a>
</div>`,
});

// ── Resolution Email ──
exports.sendResolutionEmail = (user, complaint) => send({
  to:      user.email,
  subject: `🎉 Resolved — ${complaint.complaintCode}`,
  content: `
<p class="greeting">Issue Resolved! 🎉</p>
<p class="sub">Your reported complaint has been resolved. We hope this meets your expectations.</p>
<div class="alert as">✅ <strong>${complaint.complaintCode}</strong> has been marked as resolved.</div>
<table class="info">
  <tr><td class="lbl">Reference</td><td class="val">${complaint.complaintCode}</td></tr>
  <tr><td class="lbl">Title</td><td class="val">${complaint.title}</td></tr>
  <tr><td class="lbl">Status</td><td class="val"><span class="badge br">✅ Resolved</span></td></tr>
  <tr><td class="lbl">Resolved On</td><td class="val">${fmt(new Date())}</td></tr>
</table>
<div class="divider"></div>
<p style="font-size:13px;color:#64748B;text-align:center;margin-bottom:16px">
  ⭐ Please rate the resolution to help us improve our service.
</p>
<div style="text-align:center">
  <a href="${process.env.FRONTEND_URL}/complaints/${complaint._id}" class="btn btn-g">
    Rate the Resolution ⭐
  </a>
</div>`,
});
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mail Inbox Preview — Portal Berita Klojen</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: #0f172a;
            color: #e2e8f0;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* ── Topbar ─────────────────────────────────────────────────────────── */
        .topbar {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 24px;
            background: #1e293b;
            border-bottom: 1px solid #334155;
            flex-shrink: 0;
        }
        .topbar-logo {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #3b82f6, #6366f1);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
        }
        .topbar h1 {
            font-size: 15px;
            font-weight: 700;
            color: #f8fafc;
        }
        .topbar span {
            font-size: 12px;
            color: #64748b;
            margin-left: 4px;
        }
        .badge-dev {
            margin-left: auto;
            padding: 3px 10px;
            background: rgba(234,179,8,0.15);
            border: 1px solid rgba(234,179,8,0.3);
            border-radius: 20px;
            color: #eab308;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.5px;
        }

        /* ── Layout ─────────────────────────────────────────────────────────── */
        .layout {
            display: flex;
            flex: 1;
            overflow: hidden;
        }

        /* ── Sidebar Inbox ──────────────────────────────────────────────────── */
        .sidebar {
            width: 320px;
            background: #1e293b;
            border-right: 1px solid #334155;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
        }
        .sidebar-header {
            padding: 16px 20px;
            border-bottom: 1px solid #334155;
            font-size: 13px;
            font-weight: 600;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .count-badge {
            background: #3b82f6;
            color: white;
            border-radius: 20px;
            padding: 1px 8px;
            font-size: 11px;
            font-weight: 700;
        }
        .email-list {
            overflow-y: auto;
            flex: 1;
        }
        .email-list::-webkit-scrollbar { width: 4px; }
        .email-list::-webkit-scrollbar-track { background: transparent; }
        .email-list::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }

        .email-item {
            padding: 14px 20px;
            border-bottom: 1px solid #1e293b;
            cursor: pointer;
            transition: background 0.15s;
            border-left: 3px solid transparent;
        }
        .email-item:hover {
            background: #263349;
        }
        .email-item.active {
            background: #1d3557;
            border-left-color: #3b82f6;
        }
        .email-item-to {
            font-size: 13px;
            font-weight: 600;
            color: #e2e8f0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 4px;
        }
        .email-item-subject {
            font-size: 12px;
            color: #94a3b8;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 4px;
        }
        .email-item-date {
            font-size: 11px;
            color: #475569;
        }

        .empty-state {
            padding: 40px 20px;
            text-align: center;
            color: #475569;
            font-size: 14px;
        }
        .empty-state .icon { font-size: 40px; margin-bottom: 12px; }

        /* ── Preview Pane ────────────────────────────────────────────────────── */
        .preview-pane {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background: #f8fafc;
        }
        .preview-header {
            padding: 20px 28px;
            border-bottom: 1px solid #e2e8f0;
            background: white;
            flex-shrink: 0;
        }
        .preview-subject {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 12px;
        }
        .preview-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
        }
        .meta-item {
            font-size: 13px;
            color: #64748b;
        }
        .meta-item strong {
            color: #334155;
            font-weight: 600;
        }
        .preview-body {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
        }
        .preview-body::-webkit-scrollbar { width: 6px; }
        .preview-body::-webkit-scrollbar-track { background: #f1f5f9; }
        .preview-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

        .preview-body iframe {
            width: 100%;
            border: none;
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            background: white;
        }

        .no-selection {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #94a3b8;
            gap: 12px;
        }
        .no-selection .icon { font-size: 56px; }
        .no-selection p { font-size: 15px; }
    </style>
</head>
<body>

<!-- Topbar -->
<div class="topbar">
    <div class="topbar-logo">📧</div>
    <h1>Portal Berita Klojen <span>/ Mail Preview</span></h1>
    <div class="badge-dev">🔧 DEV ONLY</div>
</div>

<!-- Layout -->
<div class="layout">

    <!-- Sidebar: Daftar Email -->
    <div class="sidebar">
        <div class="sidebar-header">
            Inbox
            @if(count($emails) > 0)
                <span class="count-badge">{{ count($emails) }}</span>
            @endif
        </div>
        <div class="email-list">
            @forelse($emails as $i => $email)
                <div class="email-item {{ $i === 0 ? 'active' : '' }}"
                     onclick="showEmail({{ $i }}, this)">
                    <div class="email-item-to">✉ {{ $email['to'] }}</div>
                    <div class="email-item-subject">{{ $email['subject'] }}</div>
                    <div class="email-item-date">🕐 {{ $email['date'] }}</div>
                </div>
            @empty
                <div class="empty-state">
                    <div class="icon">📭</div>
                    <p>Belum ada email.<br>Coba buat user baru via<br><code>POST /api/users</code></p>
                </div>
            @endforelse
        </div>
    </div>

    <!-- Preview Pane -->
    <div class="preview-pane" id="previewPane">
        @if(count($emails) > 0)
            {{-- Tampilkan email pertama secara default --}}
            <div class="preview-header" id="previewHeader">
                <div class="preview-subject" id="previewSubject">{{ $emails[0]['subject'] }}</div>
                <div class="preview-meta">
                    <div class="meta-item"><strong>Dari:</strong> {{ $emails[0]['from'] }}</div>
                    <div class="meta-item"><strong>Kepada:</strong> {{ $emails[0]['to'] }}</div>
                    <div class="meta-item"><strong>Waktu:</strong> {{ $emails[0]['date'] }}</div>
                </div>
            </div>
            <div class="preview-body">
                <iframe id="previewFrame"
                        srcdoc="{!! htmlspecialchars($emails[0]['body'], ENT_QUOTES, 'UTF-8') !!}"
                        onload="this.style.height = this.contentDocument.body.scrollHeight + 48 + 'px'">
                </iframe>
            </div>
        @else
            <div class="no-selection">
                <div class="icon">📬</div>
                <p>Tidak ada email untuk ditampilkan.</p>
            </div>
        @endif
    </div>

</div>

{{-- Data email untuk JavaScript --}}
<script>
    const emails = @json($emails);

    function showEmail(index, el) {
        // Update active state di sidebar
        document.querySelectorAll('.email-item').forEach(i => i.classList.remove('active'));
        el.classList.add('active');

        const email = emails[index];

        // Update preview header
        document.getElementById('previewSubject').textContent = email.subject;
        document.getElementById('previewHeader').querySelector('.preview-meta').innerHTML = `
            <div class="meta-item"><strong>Dari:</strong> ${email.from}</div>
            <div class="meta-item"><strong>Kepada:</strong> ${email.to}</div>
            <div class="meta-item"><strong>Waktu:</strong> ${email.date}</div>
        `;

        // Update iframe body
        const frame = document.getElementById('previewFrame');
        frame.srcdoc = email.body;
        frame.onload = () => {
            frame.style.height = frame.contentDocument.body.scrollHeight + 48 + 'px';
        };
    }
</script>

</body>
</html>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kredensial Akun Baru</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f6f9;
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #333333;
        }
        .wrapper {
            max-width: 560px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .header {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            padding: 36px 40px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            color: #ffffff;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        .header p {
            margin: 6px 0 0;
            color: #94a3b8;
            font-size: 13px;
        }
        .badge {
            display: inline-block;
            margin-top: 14px;
            padding: 4px 14px;
            background-color: rgba(99,179,237,0.2);
            border: 1px solid rgba(99,179,237,0.4);
            border-radius: 20px;
            color: #63b3ed;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .body {
            padding: 36px 40px;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 16px;
        }
        .info-text {
            font-size: 14px;
            color: #555;
            line-height: 1.7;
            margin-bottom: 28px;
        }
        .credentials-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-left: 4px solid #0f3460;
            border-radius: 8px;
            padding: 20px 24px;
            margin-bottom: 28px;
        }
        .credentials-box h3 {
            margin: 0 0 16px;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #64748b;
        }
        .credential-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
        }
        .credential-row:last-child {
            border-bottom: none;
        }
        .credential-label {
            color: #64748b;
            font-weight: 500;
        }
        .credential-value {
            color: #1e293b;
            font-weight: 600;
            font-family: 'Courier New', monospace;
        }
        .warning-box {
            background-color: #fff7ed;
            border: 1px solid #fed7aa;
            border-radius: 8px;
            padding: 14px 18px;
            font-size: 13px;
            color: #92400e;
            margin-bottom: 28px;
            line-height: 1.6;
        }
        .warning-box strong {
            display: block;
            margin-bottom: 4px;
            color: #78350f;
        }
        .footer {
            background-color: #f8fafc;
            padding: 20px 40px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #94a3b8;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <!-- Header -->
        <div class="header">
            <h1>Portal Berita Klojen</h1>
            <p>Sistem Manajemen Konten</p>
            <span class="badge">{{ $role }}</span>
        </div>

        <!-- Body -->
        <div class="body">
            <p class="greeting">Halo, <strong>{{ $name }}</strong> 👋</p>

            <p class="info-text">
                Akun CMS Anda telah berhasil dibuat oleh administrator.
                Gunakan kredensial di bawah ini untuk login pertama kali ke sistem.
            </p>

            <!-- Credentials Box -->
            <div class="credentials-box">
                <h3>Kredensial Akun</h3>
                <div class="credential-row">
                    <span class="credential-label">Email</span>
                    <span class="credential-value">{{ $email }}</span>
                </div>
                <div class="credential-row">
                    <span class="credential-label">Password Sementara</span>
                    <span class="credential-value">{{ $plainPassword }}</span>
                </div>
                <div class="credential-row">
                    <span class="credential-label">Role</span>
                    <span class="credential-value">{{ ucfirst($role) }}</span>
                </div>
            </div>

            <!-- Warning -->
            <div class="warning-box">
                <strong>⚠️ Segera Ganti Password Anda</strong>
                Password di atas bersifat sementara. Demi keamanan akun, segera ubah password
                Anda setelah login pertama kali melalui menu <strong>Pengaturan Profil</strong>.
            </div>

            <p class="info-text">
                Jika Anda tidak merasa mendaftar atau mendapatkan email ini secara tidak sengaja,
                abaikan saja pesan ini dan hubungi administrator.
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>© {{ date('Y') }} Portal Berita Klojen. Semua hak dilindungi.</p>
            <p>Email ini dikirim secara otomatis oleh sistem. Mohon tidak membalas email ini.</p>
        </div>
    </div>
</body>
</html>

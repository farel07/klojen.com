<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
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
        .header-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 56px;
            height: 56px;
            background: rgba(99,179,237,0.15);
            border: 1px solid rgba(99,179,237,0.3);
            border-radius: 50%;
            font-size: 24px;
            margin-bottom: 16px;
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
        .btn-wrapper {
            text-align: center;
            margin-bottom: 28px;
        }
        .btn-reset {
            display: inline-block;
            padding: 14px 36px;
            background: linear-gradient(135deg, #0f3460, #1a1a2e);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 700;
            letter-spacing: 0.3px;
        }
        .url-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 14px 18px;
            font-size: 12px;
            color: #475569;
            margin-bottom: 28px;
            line-height: 1.6;
            word-break: break-all;
        }
        .url-box strong {
            display: block;
            margin-bottom: 6px;
            color: #334155;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
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
            <div class="header-icon">🔑</div>
            <h1>Portal Berita Klojen</h1>
            <p>Permintaan Reset Password</p>
        </div>

        <!-- Body -->
        <div class="body">
            <p class="greeting">Halo, <strong>{{ $name }}</strong> 👋</p>

            <p class="info-text">
                Kami menerima permintaan untuk mereset password akun Anda.
                Klik tombol di bawah ini untuk membuat password baru. Link ini hanya berlaku selama <strong>60 menit</strong>.
            </p>

            <!-- Tombol Reset -->
            <div class="btn-wrapper">
                <a href="{{ $resetUrl }}" class="btn-reset" target="_blank" rel="noopener noreferrer">Reset Password Saya</a>
            </div>

            <!-- Fallback URL -->
            <div class="url-box">
                <strong>Atau salin link berikut ke browser:</strong>
                {{ $resetUrl }}
            </div>

            <!-- Peringatan -->
            <div class="warning-box">
                <strong>⚠️ Bukan Anda yang meminta ini?</strong>
                Jika Anda tidak merasa meminta reset password, abaikan email ini.
                Password Anda tidak akan berubah sampai Anda mengklik link di atas.
            </div>

            <p class="info-text">
                Demi keamanan, link ini akan kedaluwarsa otomatis setelah 60 menit
                dan hanya dapat digunakan satu kali.
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

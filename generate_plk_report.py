import os, sys, subprocess, base64, urllib.request, time

PROJECT_ROOT = r'c:\apps\klojen.com'
DIAGRAM_DIR  = os.path.join(PROJECT_ROOT, 'diagrams_report')
os.makedirs(DIAGRAM_DIR, exist_ok=True)
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
MERMAID_API = 'https://mermaid.ink/img/'

THEME_INIT = """%%{init: {'theme': 'default', 'themeCSS': 'text { fill: #000000 !important; } .actor { fill: #d6e4f5 !important; stroke: #333333 !important; } .messageText { fill: #000000 !important; font-size: 13px !important; } .noteText { fill: #000000 !important; } .loopText { fill: #000000 !important; } .label text { fill: #000000 !important; }'} }%%\n"""

DIAGRAMS = {
    'seq_scheduled_publish': THEME_INIT + """sequenceDiagram
    participant Editor as Editor / Admin<br/>(Frontend CMS)
    participant API as CMS Article API
    participant DB as Database
    participant Cron as Laravel Scheduler<br/>(Cron Job)
    participant Svc as ScheduledPublish<br/>Service
    participant Search as Search Index
    rect rgb(210, 230, 250)
    Note over Editor,DB: FASE 1 - Penjadwalan Artikel
    Editor->>API: PATCH /api/cms/articles/{id}/status<br/>{status: "scheduled", scheduled_at: datetime}
    API->>DB: UPDATE articles SET status = 'scheduled'
    API->>DB: INSERT INTO scheduled_articles<br/>(article_id, scheduled_at, is_published=false)
    DB-->>API: OK
    API-->>Editor: 200 OK - Artikel berhasil dijadwalkan
    end
    rect rgb(230, 245, 220)
    Note over Cron,Search: FASE 2 - Auto Publish (Cron setiap menit)
    Cron->>Svc: articles:publish-scheduled → run()
    Svc->>DB: SELECT * FROM scheduled_articles<br/>WHERE scheduled_at <= NOW()<br/>AND is_published = false
    DB-->>Svc: List artikel yang jatuh tempo
    loop Setiap artikel terjadwal
        Svc->>DB: BEGIN TRANSACTION
        Svc->>DB: UPDATE articles<br/>SET status='published', published_at=NOW()
        Svc->>DB: UPDATE scheduled_articles<br/>SET is_published = true
        Svc->>Search: UPSERT search_indexes<br/>(reindex artikel)
        Svc->>DB: COMMIT
    end
    Svc-->>Cron: Return jumlah artikel published
    end""",
    'seq_user_crud': THEME_INIT + """sequenceDiagram
    participant Admin as Admin (Frontend)
    participant Ctrl as UserController
    participant Svc as UserService
    participant Repo as UserRepository
    participant DB as Database
    participant Mail as Email Service
    rect rgb(210, 240, 210)
    Note over Admin,Mail: CREATE USER
    Admin->>Ctrl: POST /api/users<br/>{name, email, role}
    Ctrl->>Svc: createUser(data)
    Svc->>Repo: findByEmail(email)
    Repo->>DB: SELECT * FROM users WHERE email = ?
    DB-->>Repo: null (belum terdaftar)
    Repo-->>Svc: null
    Svc->>Svc: generatePassword()<br/>12 karakter acak
    Svc->>Repo: create({name, email, password, role})
    Repo->>DB: INSERT INTO users
    DB-->>Repo: User created
    Svc->>Mail: send(NewUserCredentials)
    Mail-->>Admin: Email kredensial terkirim
    Svc-->>Ctrl: Return User
    Ctrl-->>Admin: 201 Created + data user
    end
    rect rgb(210, 220, 245)
    Note over Admin,Mail: UPDATE USER
    Admin->>Ctrl: PATCH /api/users/{id}<br/>{name, email, role, is_active}
    Ctrl->>Svc: updateUser(id, data, currentUserId)
    Svc->>Svc: Validasi: bukan diri sendiri
    Svc->>Repo: findById(id)
    Repo->>DB: SELECT * FROM users WHERE id = ?
    Svc->>Repo: findByEmailExcept(email, id)
    Svc->>Repo: update(user, data)
    Repo->>DB: UPDATE users SET ...
    alt Role berubah
        Svc->>Repo: revokeAllForUser(id)
        Repo->>DB: UPDATE refresh_tokens<br/>SET revoked_at = NOW()
    end
    Svc-->>Ctrl: Return updated User
    Ctrl-->>Admin: 200 OK + data user
    end
    rect rgb(245, 210, 210)
    Note over Admin,Mail: DELETE USER
    Admin->>Ctrl: DELETE /api/users/{id}
    Ctrl->>Svc: deleteUser(id, currentUserId)
    Svc->>Svc: Validasi: bukan diri sendiri
    Svc->>Repo: revokeAllForUser(id)
    Svc->>Repo: archiveUserArticles(id)
    Repo->>DB: UPDATE articles<br/>SET status = 'archived'
    Svc->>Repo: delete(user)
    Repo->>DB: DELETE FROM users
    Svc-->>Ctrl: void
    Ctrl-->>Admin: 200 OK
    end""",
    'act_scheduled_publish': THEME_INIT + """flowchart TD
    A([Mulai]) --> B[Cron Job Trigger<br/>Setiap Menit]
    B --> C[Artisan Command<br/>articles:publish-scheduled]
    C --> D{Query: Ada artikel<br/>yang scheduled_at<br/><= NOW ?}
    D -->|Tidak ada| E[Log: Tidak ada<br/>artikel perlu publish]
    E --> F([Selesai])
    D -->|Ada| G[Ambil list artikel<br/>terjadwal yang jatuh tempo]
    G --> H[Loop setiap artikel]
    H --> I[Begin Transaction]
    I --> J[Update articles:<br/>status = published<br/>published_at = NOW]
    J --> K[Update scheduled_articles:<br/>is_published = true]
    K --> L[Reindex search_indexes:<br/>bangun search vector<br/>dari judul + konten + tag]
    L --> M[Commit Transaction]
    M --> N{Ada artikel<br/>selanjutnya?}
    N -->|Ya| H
    N -->|Tidak| O[Log jumlah artikel<br/>berhasil published]
    O --> F""",
    'act_user_crud': THEME_INIT + """flowchart TD
    A([Admin membuka<br/>halaman Pengguna]) --> B{Pilih Aksi}
    B -->|Tambah User| C[Input form:<br/>nama, email, role]
    C --> D[POST /api/users]
    D --> E{Email sudah<br/>terdaftar?}
    E -->|Ya| F[Tampilkan error:<br/>Email sudah terdaftar]
    F --> A
    E -->|Tidak| G[Generate password<br/>12 karakter acak]
    G --> H[Insert ke database<br/>+ hash password]
    H --> I[Kirim email<br/>kredensial ke user]
    I --> J[Tampilkan pesan<br/>berhasil]
    J --> A
    B -->|Edit User| K[Pilih user<br/>yang akan diedit]
    K --> L[Ubah field:<br/>nama/email/role/aktif]
    L --> M[PATCH /api/users/id]
    M --> N{Validasi<br/>lulus?}
    N -->|Gagal| O[Tampilkan error]
    O --> A
    N -->|Ya| P[Update database]
    P --> Q{Role berubah?}
    Q -->|Ya| R[Revoke semua token<br/>logout paksa]
    Q -->|Tidak| S[Tampilkan pesan<br/>berhasil]
    R --> S
    S --> A
    B -->|Hapus User| T[Pilih user<br/>yang akan dihapus]
    T --> U{User = diri<br/>sendiri?}
    U -->|Ya| V[Tampilkan error:<br/>Tidak bisa hapus<br/>diri sendiri]
    V --> A
    U -->|Tidak| W[Revoke semua token]
    W --> X[Arsipkan semua<br/>artikel user]
    X --> Y[Hapus user<br/>dari database]
    Y --> Z[Tampilkan pesan<br/>berhasil]
    Z --> A""",
}

def render_diagrams():
    for name, code in DIAGRAMS.items():
        path = os.path.join(DIAGRAM_DIR, f'{name}.png')
        if os.path.exists(path):
            continue
        print(f'  Rendering {name}...')
        b64 = base64.urlsafe_b64encode(code.encode('utf-8')).decode('ascii')
        url = MERMAID_API + b64
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
            with open(path, 'wb') as f:
                f.write(data)
            print(f'    OK ({len(data)} bytes)')
        except Exception as e:
            print(f'    FAILED: {e}')
        time.sleep(0.3)

def img_tag(filename, max_width='520px'):
    path = os.path.join(DIAGRAM_DIR, filename)
    if not os.path.exists(path):
        return f'<p style="color:#999;"><i>Gambar tidak ditemukan: {filename}</i></p>'
    abs_path = os.path.abspath(path).replace('\\', '/')
    return f'<img src="file:///{abs_path}" style="max-width:{max_width}; width:100%; display:block; margin:12px auto;" alt="{filename}"/>'

def cb(code, lang='PHP'):
    escaped = code.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    return f'''<div style="margin:12px 0; border:1px solid #dce0e8; border-radius:4px; overflow:hidden;">
        <div style="background:#e8ecf2; color:#555; font-size:8pt; font-family:'Segoe UI',Arial,sans-serif; text-transform:uppercase; padding:4px 14px; letter-spacing:0.5px;">{lang}</div>
        <pre style="background:#f6f7f9; color:#2d2d2d; padding:14px 18px; margin:0; font-family:'Courier New',monospace; font-size:8pt; line-height:1.6; border-left:3px solid #c0c8d8; white-space:pre-wrap; overflow-wrap:break-word;">{escaped}</pre>
    </div>'''

def cap(text):
    return f'<p class="no-indent" style="font-size:10pt; color:#555;"><i>{text}</i></p>'

CSS = '''@page { size: A4; margin: 3cm 3cm 3cm 4cm; }
* { box-sizing: border-box; }
body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; color: #000; margin: 0; padding: 0; }
h1 { font-size: 14pt; font-weight: bold; margin: 24px 0 12px; text-align: center; }
h2 { font-size: 13pt; font-weight: bold; margin: 20px 0 10px; }
h3 { font-size: 12pt; font-weight: bold; margin: 16px 0 8px; }
p { margin: 0 0 10px; text-align: justify; text-indent: 36px; }
.ni { text-indent: 0; }
ol, ul { margin: 6px 0 12px 24px; }
li { margin: 4px 0; text-align: justify; }
table { width: 100%; border-collapse: collapse; margin: 12px 0 16px; font-size: 10.5pt; }
th { background: #e8edf3; padding: 8px 10px; border: 1px solid #b0b8c8; font-weight: bold; text-align: center; }
td { padding: 7px 10px; border: 1px solid #b0b8c8; vertical-align: top; }
.cover { text-align: center; padding: 40px 0; page-break-after: always; }
.cover h1 { font-size: 16pt; margin: 0 0 8px; }
.cover .tm { font-size: 14pt; font-weight: bold; margin: 30px 0 10px; line-height: 1.4; }
.dc { text-align: center; margin: 16px 0; }
.dcap { font-size: 10pt; color: #555; margin-top: 6px; text-align: center; font-style: italic; }
.pb { page-break-before: always; }
.center { text-align: center; }'''

def build_html():
    I = {n: img_tag(f'{n}.png', '560px') for n in ['seq_scheduled_publish', 'seq_user_crud']}
    I['act_sp'] = img_tag('act_scheduled_publish.png', '200px')
    I['act_uc'] = img_tag('act_user_crud.png', '500px')

    # Code snippets
    cs1 = '''class PublishScheduledArticles extends Command
{
    protected $signature = 'articles:publish-scheduled';
    protected $description = 'Publish semua artikel terjadwal yang sudah waktunya tayang';

    public function __construct(private readonly ScheduledPublishService $service)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('[ScheduledPublish] Memulai proses auto-publish...');
        $count = $this->service->run();
        if ($count === 0) {
            $this->line('  -> Tidak ada artikel yang perlu dipublish.');
        } else {
            $this->info("  -> {$count} artikel berhasil dipublish dan diindeks.");
        }
        return Command::SUCCESS;
    }
}'''
    cs2 = '''// Query artikel terjadwal yang sudah waktunya tayang
$due = DB::table('scheduled_articles')
    ->where('scheduled_at', '<=', now())
    ->where('is_published', false)
    ->get();
if ($due->isEmpty()) {
    return 0;
}'''
    cs3 = '''// Proses publish satu artikel dalam database transaction
DB::transaction(function () use ($scheduled, $articleId, $now) {
    DB::table('articles')
        ->where('id', $articleId)
        ->where('status', 'scheduled')
        ->update([
            'status'       => 'published',
            'published_at' => $now,
            'updated_at'   => $now,
        ]);
    DB::table('scheduled_articles')
        ->where('id', $scheduled->id)
        ->update(['is_published' => true]);
    $this->upsertSearchIndex($articleId, $now);
});'''
    cs4 = '''// UserService::createUser() - Membuat user baru oleh Admin
public function createUser(array $data): User
{
    // 1. Cek duplikat email
    if ($this->userRepository->findByEmail($data['email'])) {
        throw new \\RuntimeException('EMAIL_ALREADY_EXISTS', 409);
    }
    // 2. Generate password sementara: 12 karakter acak
    $plainPassword = $this->generatePassword();
    // 3. Buat user - password otomatis di-hash via model cast 'hashed'
    $user = $this->userRepository->create([
        'name' => $data['name'], 'email' => $data['email'],
        'password' => $plainPassword, 'role' => $data['role'],
        'is_active' => true,
    ]);
    // 4. Kirim email berisi kredensial ke user baru
    Mail::to($user->email)->send(new NewUserCredentials(
        name: $user->name, email: $user->email,
        plainPassword: $plainPassword, role: $user->role,
    ));
    return $user;
}'''
    cs5 = '''// Generate password acak yang aman (12 karakter)
private function generatePassword(): string
{
    $upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    $lower   = 'abcdefghjkmnpqrstuvwxyz';
    $digits  = '23456789';
    $symbols = '@#$%&!';
    $password  = $upper[random_int(0, strlen($upper) - 1)];
    $password .= $lower[random_int(0, strlen($lower) - 1)];
    $password .= $digits[random_int(0, strlen($digits) - 1)];
    $password .= $symbols[random_int(0, strlen($symbols) - 1)];
    $all = $upper . $lower . $digits . $symbols;
    for ($i = 0; $i < 8; $i++) {
        $password .= $all[random_int(0, strlen($all) - 1)];
    }
    return str_shuffle($password);
}'''
    cs6 = '''// UserService::updateUser() - Mengupdate data user oleh Admin
public function updateUser(string $id, array $data, string $currentUserId): User
{
    if ($id === $currentUserId) {
        throw new \\RuntimeException('CANNOT_MODIFY_SELF', 403);
    }
    $user = $this->userRepository->findById($id);
    if (!$user) throw new \\RuntimeException('USER_NOT_FOUND', 404);
    if (isset($data['email']) &&
        $this->userRepository->findByEmailExcept($data['email'], $id)) {
        throw new \\RuntimeException('EMAIL_ALREADY_EXISTS', 409);
    }
    $oldRole = $user->role;
    $updateData = array_filter($data, fn($v) => !is_null($v));
    $this->userRepository->update($user, $updateData);
    // Jika role diubah, revoke semua token (logout paksa)
    if (isset($updateData['role']) && $updateData['role'] !== $oldRole) {
        $this->refreshTokenRepository->revokeAllForUser($id);
    }
    return $user->refresh();
}'''
    cs7 = '''// UserService::deleteUser() - Menghapus user oleh Admin
public function deleteUser(string $id, string $currentUserId): void
{
    if ($id === $currentUserId) {
        throw new \\RuntimeException('CANNOT_MODIFY_SELF', 403);
    }
    $user = $this->userRepository->findById($id);
    if (!$user) throw new \\RuntimeException('USER_NOT_FOUND', 404);
    $this->refreshTokenRepository->revokeAllForUser($id);
    $this->articleRepository->archiveUserArticles($id);
    $this->userRepository->delete($user);
}'''
    # Email Mailable snippet
    cs_email = '''// NewUserCredentials Mailable - Email kredensial untuk user baru
class NewUserCredentials extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $name,
        public readonly string $email,
        public readonly string $plainPassword,
        public readonly string $role,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: \'Selamat Datang di Portal Berita Klojen — Kredensial Akun Anda\',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: \'emails.new-user-credentials\',
        );
    }
}'''
    # Route definition snippet
    cs_route = '''// routes/api.php - Definisi route untuk User Management
Route::middleware(['auth:api', 'admin'])->prefix('users')->group(function () {
    Route::get('/',       [UserController::class, 'index']);   // GET    /api/users
    Route::post('/',      [UserController::class, 'store']);   // POST   /api/users
    Route::get('/{id}',   [UserController::class, 'show']);    // GET    /api/users/{id}
    Route::patch('/{id}', [UserController::class, 'update']);  // PATCH  /api/users/{id}
    Route::delete('/{id}',[UserController::class, 'destroy']); // DELETE /api/users/{id}
});'''

    # === HTML Parts ===
    parts = []
    # COVER
    parts.append(f'''<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"/>
<title>Laporan PLK - Farrel Aqeel Danendra</title>
<style>{CSS}</style></head><body>
<div class="cover">
<h1>LAPORAN AKHIR<br/>MAGANG MANDIRI</h1>
<div class="tm">Rancang Bangun Sistem Portal Berita dan<br/>Content Management System (CMS) Redaksi<br/>Di PT. Ketik Media Siber</div>
<p class="ni" style="font-size:10pt;">No. PKS: 308/UN63.7/IA-IF/2025</p><br/><br/>
<p class="ni" style="font-size:11pt;">Diajukan untuk memenuhi persyaratan kelulusan<br/>Program Magang Mandiri</p><br/>
<div style="margin:20px 0;"><p class="ni"><strong>oleh :</strong></p>
<p class="ni"><strong>Farrel Aqeel Danendra &nbsp;/&nbsp; 23081010204</strong></p></div><br/><br/>
<p class="ni" style="font-weight:bold;">PROGRAM STUDI INFORMATIKA</p>
<p class="ni" style="font-weight:bold;">FAKULTAS ILMU KOMPUTER</p>
<p class="ni" style="font-weight:bold;">UNIVERSITAS PEMBANGUNAN NASIONAL &ldquo;VETERAN&rdquo; JAWA TIMUR</p>
<p class="ni" style="font-weight:bold;">2026</p></div>''')

    # LEMBAR PENGESAHAN
    parts.append('''<div class="pb"></div><h1>Lembar Pengesahan</h1>
<p class="ni center" style="font-weight:bold; font-size:13pt;">Rancang Bangun Sistem Portal Berita dan Content Management System (CMS) Redaksi</p>
<p class="ni center" style="margin-top:20px;">oleh :</p>
<p class="ni center"><strong>Farrel Aqeel Danendra &nbsp;/&nbsp; 23081010204</strong></p>
<p class="ni center" style="margin-top:20px;">disetujui sebagai<br/>Laporan Magang Mandiri</p>
<br/><br/>
<table style="border:none; width:100%;"><tr style="border:none;">
<td style="border:none; width:50%;"></td>
<td style="border:none; width:50%;">Surabaya, Juni 2026<br/>Dosen Pembimbing<br/><br/><br/><br/>
<strong>Yoga Ari Tofan, S.Kom., M.Kom</strong><br/>NIP. 199302032025061004</td>
</tr></table>''')

    # ABSTRAKSI
    parts.append('''<div class="pb"></div><h1>Abstraksi</h1>
<p>Laporan ini disusun sebagai bentuk pertanggungjawaban atas pelaksanaan Program Pembelajaran di Luar Kampus (PLK) yang dilaksanakan di PT. Ketik Media Siber selama periode 9 Februari 2026 hingga 19 Juni 2026. Selama kegiatan magang, penulis terlibat dalam proyek Rancang Bangun Sistem Portal Berita dan Content Management System (CMS) Redaksi yang bertujuan membangun platform pengelolaan dan publikasi berita berbasis web secara modern dan terstruktur.</p>
<p>Lingkup pekerjaan yang dilaksanakan meliputi perancangan arsitektur sistem menggunakan pendekatan decoupled (Laravel 12 sebagai backend dan Next.js 15 sebagai frontend), perancangan database komprehensif (CDM, PDM, ERD) terdiri dari 15 tabel, serta implementasi fitur-fitur utama seperti cronjob scheduled publish untuk penjadwalan otomatis publikasi artikel dan manajemen user (CRUD) untuk pengelolaan akun pengguna oleh admin. Penulis juga menyusun dokumentasi perancangan sistem menggunakan diagram UML meliputi Sequence Diagram, Activity Diagram, dan Class Diagram.</p>
<p>Hasil dari kegiatan magang ini adalah sebuah sistem portal berita dan CMS redaksi yang berfungsi penuh, dilengkapi dengan mekanisme penjadwalan publikasi otomatis dan fitur pengelolaan pengguna yang aman. Sistem telah diuji secara internal dan berjalan sesuai spesifikasi yang ditetapkan. Selain itu, penulis juga menyusun rekognisi mata kuliah yang mengaitkan pengalaman praktis selama magang dengan mata kuliah Analisis Kebutuhan, Pemrograman API, dan Uji Coba dan Implementasi.</p>
<p class="ni"><strong>Kata kunci:</strong> content management system, portal berita, Laravel, Next.js, scheduled publish, manajemen user.</p>''')

    # KATA PENGANTAR
    parts.append('''<div class="pb"></div><h1>Kata Pengantar</h1>
<p class="ni">Puji syukur kehadirat Allah SWT atas segala rahmat dan karunia-Nya sehingga penulis dapat menyelesaikan Laporan Akhir Program Pembelajaran Luar Kampus (PLK) ini dengan baik. Laporan ini disusun sebagai salah satu syarat penyelesaian Program Pembelajaran Luar Kampus (PLK) pada Program Studi Informatika, Fakultas Ilmu Komputer, Universitas Pembangunan Nasional &ldquo;Veteran&rdquo; Jawa Timur. Program magang dilaksanakan di PT. Ketik Media Siber sebagai Software Development Intern, di mana penulis terlibat dalam pengembangan Sistem Portal Berita dan Content Management System (CMS) berbasis web.</p>
<p class="ni">Dalam penyusunan laporan ini, penulis memperoleh bantuan, bimbingan, dan dukungan dari berbagai pihak. Oleh karena itu, penulis menyampaikan ucapan terima kasih kepada:</p>
<ol>
<li>Ibu Prof. Dr. Ir. Novirina Hendrasarie, M.T. selaku Dekan Fakultas Ilmu Komputer Universitas Pembangunan Nasional &ldquo;Veteran&rdquo; Jawa Timur.</li>
<li>Ibu Dr. Intan Yuniar Purbasari, S.Kom., M.Sc. selaku Koordinator Program Studi Informatika.</li>
<li>Bapak Eka Prakarsa Mandyartha, S.T., M.Kom. beserta tim dosen selaku penanggung jawab Program PLK.</li>
<li>Bapak Yoga Ari Tofan, S.Kom., M.Kom. selaku dosen pembimbing yang telah memberikan arahan dan masukan.</li>
<li>PT. Ketik Media Siber yang telah memberikan kesempatan magang dan terlibat dalam pengembangan proyek.</li>
<li>Bapak Kiagus Firdaus, A.Md., S.Kom., M.AP. selaku Founder PT. Ketik Media Siber.</li>
<li>Bapak Galih selaku Direktur IT PT. Ketik Media Siber.</li>
<li>Bapak Ali selaku mentor tim magang IT PT. Ketik Media Siber.</li>
<li>Seluruh staf dan karyawan PT. Ketik Media Siber, khususnya Divisi IT.</li>
<li>Rekan-rekan peserta magang serta orang tua dan keluarga yang selalu memberikan dukungan.</li></ol>
<p class="ni">Penulis menyadari bahwa laporan ini masih memiliki kekurangan. Oleh karena itu, kritik dan saran yang membangun sangat diharapkan. Semoga laporan ini dapat memberikan manfaat serta menambah wawasan bagi pembaca.</p>
<p class="ni" style="text-align:right; margin-top:16px;">Surabaya, Juni 2026<br/><br/>Penulis<br/><strong>Farrel Aqeel Danendra</strong><br/>NPM. 23081010204</p>''')

    # DAFTAR ISI
    parts.append('''<div class="pb"></div><h1>Daftar Isi</h1>
<table style="border:none;"><tr style="border:none;"><td style="border:none; width:80%;">Lembar Pengesahan</td><td style="border:none;">i</td></tr>
<tr style="border:none;"><td style="border:none;">Abstraksi</td><td style="border:none;">ii</td></tr>
<tr style="border:none;"><td style="border:none;">Kata Pengantar</td><td style="border:none;">iii</td></tr>
<tr style="border:none;"><td style="border:none;">Daftar Isi</td><td style="border:none;">iv</td></tr>
<tr style="border:none;"><td style="border:none;"><strong>Bab I &nbsp; Pendahuluan</strong></td><td style="border:none;">1</td></tr>
<tr style="border:none;"><td style="border:none;">&nbsp;&nbsp;&nbsp;I.1 Latar Belakang</td><td style="border:none;">1</td></tr>
<tr style="border:none;"><td style="border:none;">&nbsp;&nbsp;&nbsp;I.2 Lingkup</td><td style="border:none;">2</td></tr>
<tr style="border:none;"><td style="border:none;">&nbsp;&nbsp;&nbsp;I.3 Tujuan</td><td style="border:none;">3</td></tr>
<tr style="border:none;"><td style="border:none;"><strong>Bab II &nbsp; Organisasi Mitra PLK</strong></td><td style="border:none;">4</td></tr>
<tr style="border:none;"><td style="border:none;">&nbsp;&nbsp;&nbsp;II.1 Struktur Organisasi</td><td style="border:none;">4</td></tr>
<tr style="border:none;"><td style="border:none;">&nbsp;&nbsp;&nbsp;II.2 Lingkup Pekerjaan</td><td style="border:none;">5</td></tr>
<tr style="border:none;"><td style="border:none;">&nbsp;&nbsp;&nbsp;II.3 Deskripsi Pekerjaan</td><td style="border:none;">5</td></tr>
<tr style="border:none;"><td style="border:none;">&nbsp;&nbsp;&nbsp;II.4 Jadwal Kerja</td><td style="border:none;">6</td></tr>
<tr style="border:none;"><td style="border:none;"><strong>Bab III &nbsp; Rancang Bangun Sistem Portal Berita dan CMS Redaksi</strong></td><td style="border:none;">7</td></tr>
<tr style="border:none;"><td style="border:none;">&nbsp;&nbsp;&nbsp;III.1 Deskripsi Persoalan</td><td style="border:none;">7</td></tr>
<tr style="border:none;"><td style="border:none;">&nbsp;&nbsp;&nbsp;III.2 Proses Pelaksanaan</td><td style="border:none;">8</td></tr>
<tr style="border:none;"><td style="border:none;">&nbsp;&nbsp;&nbsp;III.3 Pencapaian Hasil</td><td style="border:none;">48</td></tr>
<tr style="border:none;"><td style="border:none;">&nbsp;&nbsp;&nbsp;III.4 Hasil Testing</td><td style="border:none;">50</td></tr>
<tr style="border:none;"><td style="border:none;">&nbsp;&nbsp;&nbsp;III.5 Rekognisi Mata Kuliah</td><td style="border:none;">58</td></tr>
<tr style="border:none;"><td style="border:none;"><strong>Bab IV &nbsp; Penutup</strong></td><td style="border:none;">61</td></tr>
<tr style="border:none;"><td style="border:none;">&nbsp;&nbsp;&nbsp;IV.1 Kesimpulan</td><td style="border:none;">61</td></tr>
<tr style="border:none;"><td style="border:none;">&nbsp;&nbsp;&nbsp;IV.2 Saran</td><td style="border:none;">62</td></tr>
<tr style="border:none;"><td style="border:none;">Referensi</td><td style="border:none;">63</td></tr>
<tr style="border:none;"><td style="border:none;"><strong>Lampiran A &nbsp; Log Activity</strong></td><td style="border:none;">64</td></tr>
</table>''')

    # BAB I
    parts.append('''<div class="pb"></div>
<h1>BAB I<br/>PENDAHULUAN</h1>
<h2>I.1 &nbsp; Latar Belakang</h2>
<p>Perkembangan teknologi digital telah mengubah cara masyarakat memperoleh dan mengakses informasi. Jika sebelumnya informasi banyak disebarkan melalui media cetak, kini berbagai berita dan informasi dapat diakses dengan cepat melalui platform berbasis web. Kondisi tersebut mendorong perusahaan media untuk memanfaatkan teknologi yang mampu mendukung pengelolaan serta publikasi konten secara lebih efektif dan efisien.</p>
<p>Program Pembelajaran di Luar Kampus (PLK) merupakan kegiatan yang memberikan kesempatan kepada mahasiswa untuk memperoleh pengalaman kerja secara langsung di dunia industri. Melalui program ini, mahasiswa dapat menerapkan ilmu yang telah dipelajari selama perkuliahan sekaligus memahami proses kerja profesional, baik dari sisi teknis maupun kerja sama dalam tim.</p>
<p>Dalam pelaksanaan PLK, penulis melaksanakan kegiatan magang di PT. Ketik Media Siber, sebuah perusahaan yang bergerak di bidang media digital. Selama kegiatan magang, penulis terlibat dalam pengembangan Sistem Portal Berita dan Content Management System (CMS) Redaksi yang digunakan untuk membantu proses pengelolaan dan publikasi berita pada platform digital.</p>
<p>Pada proyek tersebut, penulis berperan sebagai Software Development dengan tugas utama mengembangkan antarmuka halaman editor menggunakan React.js, Next.js, dan Tailwind CSS. Selain itu, penulis juga membantu proses perancangan desain antarmuka, integrasi API, serta pengujian fitur yang dikembangkan agar sistem dapat berjalan sesuai kebutuhan pengguna.</p>
<h2>I.2 &nbsp; Lingkup</h2>
<p class="ni">Lingkup kegiatan Program Pembelajaran di Luar Kampus (PLK) yang dilaksanakan di PT. Ketik Media Siber berfokus pada pengembangan Sistem Portal Berita dan Content Management System (CMS) Redaksi. Selama kegiatan magang berlangsung, penulis terlibat dalam beberapa kegiatan yang berkaitan dengan pengembangan sistem, yaitu sebagai berikut:</p>
<ol>
<li><strong>Perancangan Arsitektur Sistem dan Basis Data</strong> &mdash; Menyusun dokumentasi perancangan sistem menggunakan diagram UML (Use Case Diagram, Activity Diagram, Sequence Diagram, dan Class Diagram) sebagai acuan pengembangan perangkat lunak. Merancang struktur basis data menggunakan model Entity Relationship Diagram (ERD), Conceptual Data Model (CDM), dan Physical Data Model (PDM) untuk memastikan integritas dan efisiensi penyimpanan data.</li>
<li><strong>Setup dan Konfigurasi Proyek</strong> &mdash; Menyiapkan struktur direktori dasar proyek, pemilihan tech stack, serta konfigurasi lingkungan pengembangan (development environment) untuk menjaga konsistensi dan skalabilitas kode. Mengelola repositori proyek serta menerapkan workflow kolaborasi tim menggunakan version control system (Git/GitHub).</li>
<li><strong>Pengembangan Backend dan API</strong> &mdash; Membangun Application Programming Interface (API) sebagai jembatan komunikasi data yang efisien antara server dan client. Mengelola logika bisnis pada sisi server serta melakukan validasi data untuk memastikan keamanan dan reliabilitas pertukaran informasi antar modul sistem.</li></ol>
<h2>I.3 &nbsp; Tujuan</h2>
<p>Program Pembelajaran di Luar Kampus (PLK) yang dilaksanakan di PT. Ketik Media Siber bertujuan untuk memberikan kesempatan kepada mahasiswa dalam mengenal lingkungan kerja secara langsung sekaligus mengaplikasikan pengetahuan yang telah diperoleh selama masa perkuliahan. Adapun tujuan pelaksanaan kegiatan PLK ini adalah sebagai berikut:</p>
<ol>
<li>Menambah pemahaman mengenai pengembangan aplikasi web yang digunakan pada lingkungan kerja profesional.</li>
<li>Meningkatkan keterampilan dalam membangun dan mengembangkan antarmuka pengguna yang responsif dan mudah digunakan.</li>
<li>Memperdalam pemahaman mengenai penggunaan teknologi modern dalam pengembangan aplikasi berbasis web.</li>
<li>Memahami proses kolaborasi antar tim dalam pengembangan dan pemeliharaan sistem informasi.</li>
<li>Melatih kemampuan dalam menyelesaikan permasalahan teknis yang muncul selama proses pengembangan aplikasi.</li>
<li>Mengetahui alur pengelolaan konten dan publikasi berita melalui sistem yang digunakan oleh perusahaan media digital.</li>
<li>Mengembangkan kemampuan komunikasi, tanggung jawab, serta profesionalisme dalam lingkungan kerja.</li>
<li>Memperoleh pengalaman dan wawasan yang dapat mendukung persiapan karir di bidang teknologi informasi.</li></ol>''')

    # BAB II
    parts.append('''<div class="pb"></div>
<h1>BAB II<br/>ORGANISASI ATAU LINGKUNGAN ORGANISASI MITRA PLK</h1>
<h2>II.1 &nbsp; Struktur Organisasi</h2>
<p>PT. Ketik Media Siber memiliki struktur organisasi yang terdiri atas beberapa divisi yang saling mendukung dalam menjalankan kegiatan operasional perusahaan. Setiap divisi memiliki peran dan tanggung jawab masing-masing, mulai dari pengelolaan media digital, pengembangan bisnis, administrasi perusahaan, hingga pengembangan teknologi informasi.</p>
<p>Dalam pelaksanaan Program Pembelajaran di Luar Kampus (PLK), penulis ditempatkan pada Divisi Teknologi yang berada di bawah koordinasi Chief Technology Officer (CTO). Divisi ini bertanggung jawab dalam pengembangan, pemeliharaan, dan pengelolaan sistem digital yang digunakan untuk mendukung proses bisnis perusahaan.</p>
<p>Selama kegiatan magang, penulis berperan sebagai Software Development pada proyek Sistem Portal Berita dan Content Management System (CMS) Redaksi. Penulis terlibat dalam berbagai aktivitas pengembangan sistem, seperti analisis kebutuhan, perancangan antarmuka, implementasi fitur, integrasi API, serta pengujian aplikasi.</p>
<h2>II.2 &nbsp; Lingkup Pekerjaan</h2>
<p>Divisi Teknologi di PT. Ketik Media Siber bertanggung jawab atas pengembangan dan pemeliharaan seluruh produk digital perusahaan. Lingkup pekerjaan divisi ini mencakup perancangan arsitektur sistem, pengembangan frontend dan backend, pengelolaan database dan infrastruktur server, serta pemeliharaan dan peningkatan kualitas produk digital yang telah diluncurkan. Dalam konteks proyek Sistem Portal Berita dan CMS Redaksi, penulis bekerja sama dengan mentor dan tim IT untuk mengembangkan fitur-fitur yang dibutuhkan oleh redaksi.</p>
<h2>II.3 &nbsp; Deskripsi Pekerjaan</h2>
<p>Selama pelaksanaan Program Magang Mandiri di PT. Ketik Media Siber, penulis terlibat secara langsung dalam pengembangan Sistem Portal Berita dan Content Management System (CMS) Redaksi. Kegiatan yang dilaksanakan mencakup keseluruhan siklus pengembangan perangkat lunak, mulai dari tahap perencanaan hingga pengujian. Berikut adalah tahapan-tahapan pekerjaan yang dilakukan:</p>

<h3>1. Perencanaan dan Analisis Kebutuhan</h3>
<p>Pada tahap ini, penulis melakukan identifikasi dan analisis kebutuhan sistem yang akan dibangun. Penulis mempelajari alur kerja redaksi PT. Ketik Media Siber secara menyeluruh, mulai dari proses penulisan berita oleh jurnalis, proses peninjauan dan persetujuan oleh editor, hingga proses publikasi artikel. Berdasarkan analisis tersebut, penulis mengidentifikasi dua fitur utama yang menjadi tanggung jawab pengembangan, yaitu fitur <strong>penjadwalan publikasi artikel otomatis (scheduled publish)</strong> yang memungkinkan artikel dipublikasikan secara otomatis pada waktu yang telah ditentukan, serta fitur <strong>manajemen pengguna (user management)</strong> yang memungkinkan admin mengelola akun pengguna meliputi pembuatan, pengeditan, penonaktifan, dan penghapusan akun.</p>

<h3>2. Perencanaan Struktur Aplikasi</h3>
<p>Pada tahap perencanaan struktur, penulis merancang arsitektur sistem menggunakan pendekatan <i>decoupled architecture</i> yang memisahkan backend dan frontend menjadi dua aplikasi terpisah. Backend dibangun menggunakan framework Laravel 12 dengan bahasa pemrograman PHP 8.4 dan database SQLite, sedangkan frontend dibangun menggunakan framework Next.js 15 dengan TypeScript dan Tailwind CSS. Penulis juga menerapkan pola <i>Service-Repository Pattern</i> untuk memisahkan logika bisnis dari operasi database. Selain itu, penulis menyusun perancangan database yang meliputi perancangan <i>Conceptual Data Model</i> (CDM), <i>Physical Data Model</i> (PDM), dan <i>Entity Relationship Diagram</i> (ERD) yang menghasilkan 15 tabel utama. Dokumentasi sistem juga disusun dalam bentuk diagram UML yang mencakup <i>Sequence Diagram</i>, <i>Activity Diagram</i>, dan <i>Class Diagram</i> untuk masing-masing fitur yang dikembangkan.</p>

<h3>3. Implementasi</h3>
<p>Pada tahap implementasi, penulis melakukan pengembangan kedua fitur utama yang telah direncanakan. Untuk fitur <strong>scheduled publish</strong>, penulis membangun Artisan Command sebagai <i>entry point</i> yang dipicu oleh Laravel Task Scheduler setiap menit, serta ScheduledPublishService yang berisi logika bisnis untuk memproses artikel terjadwal. Proses ini mencakup pembaruan status artikel menjadi <code>published</code>, pembaruan flag pada tabel <code>scheduled_articles</code>, serta pembaruan indeks pencarian (<i>search index</i>) agar artikel yang baru dipublikasikan dapat langsung ditemukan. Seluruh operasi dilakukan dalam satu <i>database transaction</i> untuk menjamin konsistensi data.</p>
<p>Untuk fitur <strong>manajemen user</strong>, penulis membangun operasi CRUD (<i>Create, Read, Update, Delete</i>) yang hanya dapat diakses oleh pengguna dengan role admin. Fitur ini mencakup pembuatan akun baru dengan <i>auto-generate password</i> dan pengiriman kredensial melalui email, pengeditan data pengguna dengan mekanisme <i>revoke token</i> otomatis apabila terjadi perubahan role, penonaktifan akun, serta penghapusan akun yang disertai pengarsipan seluruh artikel milik pengguna tersebut. Seluruh endpoint API dilindungi dengan middleware autentikasi JWT dan validasi role.</p>

<h3>4. Uji Coba</h3>
<p>Pada tahap uji coba, penulis melakukan pengujian terhadap seluruh fitur yang telah diimplementasikan untuk memastikan sistem berjalan sesuai spesifikasi yang telah ditetapkan. Pengujian fitur <strong>scheduled publish</strong> mencakup pengujian penjadwalan artikel, verifikasi perubahan status artikel secara otomatis oleh cron job, serta verifikasi pembaruan indeks pencarian. Pengujian fitur <strong>manajemen user</strong> mencakup pengujian pembuatan user baru, validasi duplikasi email, pengujian pengiriman email kredensial, pengujian pengeditan data termasuk perubahan role dan penonaktifan akun, pengujian penghapusan user beserta penanganan dampaknya, serta pengujian kontrol akses untuk memastikan hanya admin yang dapat mengakses fitur ini. Hasil pengujian menunjukkan bahwa seluruh fitur berfungsi dengan baik dan sesuai dengan kebutuhan yang telah dianalisis pada tahap perencanaan.</p>
<h2>II.4 &nbsp; Jadwal Kerja</h2>
<p>Program Pembelajaran di Luar Kampus (PLK) dilaksanakan di PT. Ketik Media Siber selama kurang lebih empat bulan sepuluh hari, dimulai pada 9 Februari 2026 dan berakhir pada 19 Juni 2026. Kegiatan magang dilaksanakan enam hari dalam satu minggu, yaitu Senin hingga Sabtu. Jam kerja pada hari Senin sampai Jumat berlangsung pukul 09.00&ndash;17.00 WIB, sedangkan pada hari Sabtu pukul 09.00&ndash;13.00 WIB.</p>
<table>
<tr><th>Minggu</th><th>Periode</th><th>Kegiatan</th><th>Jam</th></tr>
<tr><td>Minggu 1-3</td><td>9 Feb &ndash; 28 Feb 2026</td><td>Pengenalan perusahaan, pelatihan jurnalistik, penulisan dan publikasi berita, serta pemahaman alur kerja redaksi.</td><td>132</td></tr>
<tr><td>Minggu 4-8</td><td>2 Mar &ndash; 4 Apr 2026</td><td>Pengenalan proyek, Git dan GitHub, pengelolaan data website, serta pembelajaran workflow pengembangan sistem.</td><td>220</td></tr>
<tr><td>Minggu 9-10</td><td>6 Apr &ndash; 18 Apr 2026</td><td>Perancangan UI/UX dan dokumentasi perancangan sistem Website Klojen.</td><td>88</td></tr>
<tr><td>Minggu 11-14</td><td>20 Apr &ndash; 16 Mei 2026</td><td>Setup project dan pengembangan antarmuka Website Klojen berdasarkan desain yang telah dibuat.</td><td>176</td></tr>
<tr><td>Minggu 15-16</td><td>18 Mei &ndash; 30 Mei 2026</td><td>Integrasi API, pengembangan fitur pencarian dan filter, serta penyempurnaan tampilan website.</td><td>88</td></tr>
<tr><td>Minggu 17-18</td><td>1 Jun &ndash; 13 Jun 2026</td><td>Optimasi sistem, perbaikan bug, dan pengujian website.</td><td>88</td></tr>
<tr><td>Minggu 19</td><td>15 Jun &ndash; 19 Jun 2026</td><td>Finalisasi proyek, penyusunan dokumentasi, dan persiapan presentasi hasil magang.</td><td>36</td></tr>
</table>
<p class="ni center"><i>Tabel 1. Jadwal Kerja Program Magang Mandiri</i></p>''')

    # === BAB III === (will continue in append)
    return parts, I, cs1, cs2, cs3, cs4, cs5, cs6, cs7, cs_route, cs_email

def build_bab3(parts, I, cs1, cs2, cs3, cs4, cs5, cs6, cs7, cs_route, cs_email):
    """Continue building Bab III and remaining chapters"""
    p = parts  # alias
    p.append(f'''<div class="pb"></div>
<h1>BAB III<br/>RANCANG BANGUN SISTEM PORTAL BERITA DAN CMS REDAKSI</h1>
<h2>III.1 &nbsp; Deskripsi Persoalan</h2>
<p>PT. Ketik Media Siber merupakan perusahaan yang bergerak di bidang media digital dan mengelola portal berita Klojen.com. Sebelum adanya sistem baru, proses pengelolaan konten berita dilakukan secara manual dengan alur kerja yang kurang terstruktur. Para jurnalis menulis berita, kemudian menyerahkan draf kepada editor melalui komunikasi informal, dan editor melakukan proses publikasi secara langsung tanpa sistem pelacakan revisi yang memadai. Kondisi ini menyebabkan beberapa permasalahan, antara lain: kesulitan dalam melacak riwayat perubahan artikel, tidak adanya mekanisme penjadwalan publikasi artikel, ketiadaan kontrol akses berbasis peran (role-based access control), serta tidak adanya sistem pencarian yang efisien.</p>
<p>Berdasarkan permasalahan tersebut, penulis ditugaskan untuk melakukan perancang bangun Sistem Portal Berita dan Content Management System (CMS) Redaksi. Sistem yang dikembangkan harus memenuhi kebutuhan berikut:</p>
<ol>
<li><strong>Perancangan Arsitektur Sistem</strong> &mdash; menyusun struktur proyek secara keseluruhan, meliputi pemilihan tech stack, konfigurasi repository, perancangan database (CDM, PDM, ERD), serta dokumentasi desain sistem menggunakan diagram UML.</li>
<li><strong>Fitur Cronjob Scheduled Publish</strong> &mdash; membangun mekanisme penjadwalan publikasi artikel secara otomatis menggunakan cron job, di mana artikel yang telah diatur waktu tayangnya akan otomatis dipublikasikan ketika jadwal tiba.</li>
<li><strong>Fitur Manajemen User (CRUD)</strong> &mdash; membangun fitur pengelolaan pengguna sistem oleh admin, meliputi pembuatan akun baru, pengeditan data, aktivasi/nonaktifkan akun, serta penghapusan pengguna dengan penanganan dampak terhadap data terkait.</li></ol>
<h2>III.2 &nbsp; Proses Pelaksanaan</h2>
<h3>III.2.1 &nbsp; Penyusunan Struktur Proyek dan Perancangan Database</h3>
<p>Tahap pertama dalam pelaksanaan proyek adalah menyusun struktur proyek dari awal (from scratch) serta melakukan perancangan database yang komprehensif. Penulis bertanggung jawab dalam menentukan arsitektur sistem, memilih teknologi yang digunakan, serta merancang seluruh struktur database yang menjadi fondasi sistem.</p>
<p>Arsitektur sistem dirancang menggunakan pendekatan <strong>decoupled architecture</strong>, di mana backend dan frontend dipisah menjadi dua aplikasi terpisah yang berkomunikasi melalui REST API. Backend dibangun menggunakan <strong>Laravel 12</strong> dengan bahasa pemrograman PHP 8.4 dan database SQLite. Frontend dibangun menggunakan <strong>Next.js 15</strong> dengan TypeScript dan framework CSS Tailwind CSS.</p>
<p>Pada sisi backend, penulis menerapkan pola <strong>Service-Repository Pattern</strong> yang memisahkan logika bisnis (Service) dari operasi database (Repository). Setiap entitas utama memiliki Service dan Repository tersendiri, seperti ArticleService, UserService, CategoryService, dan lain-lain. Seluruh operasi database dilakukan melalui Query Builder Laravel, bukan ORM Eloquent, untuk memberikan kontrol penuh terhadap query SQL yang dieksekusi.</p>
<p>Perancangan database dimulai dari <strong>Conceptual Data Model (CDM)</strong>, kemudian diturunkan menjadi <strong>Physical Data Model (PDM)</strong>, dan diimplementasikan dalam bentuk file migrasi Laravel. Database sistem terdiri dari 15 tabel utama:</p>
<table><tr><th>No</th><th>Nama Tabel</th><th>Deskripsi</th></tr>
<tr><td>1</td><td>users</td><td>Data pengguna sistem (admin, editor, journalist, reader)</td></tr>
<tr><td>2</td><td>categories</td><td>Kategori berita (Politik, Ekonomi, Olahraga, dsb.)</td></tr>
<tr><td>3</td><td>tags</td><td>Tag artikel untuk pengelompokan topik</td></tr>
<tr><td>4</td><td>articles</td><td>Artikel berita dengan metadata lengkap</td></tr>
<tr><td>5</td><td>article_tags</td><td>Relasi many-to-many antara artikel dan tag</td></tr>
<tr><td>6</td><td>article_revisions</td><td>Riwayat revisi artikel (snapshot before update)</td></tr>
<tr><td>7</td><td>scheduled_articles</td><td>Jadwal publikasi artikel terjadwal</td></tr>
<tr><td>8</td><td>search_indexes</td><td>Index pencarian full-text</td></tr>
<tr><td>9</td><td>comments</td><td>Komentar pembaca pada artikel</td></tr>
<tr><td>10</td><td>media</td><td>File media (gambar) yang diunggah</td></tr>
<tr><td>11</td><td>bookmarks</td><td>Artikel yang disimpan oleh pembaca</td></tr>
<tr><td>12</td><td>refresh_tokens</td><td>Token refresh untuk autentikasi JWT</td></tr>
<tr><td>13</td><td>password_reset_tokens</td><td>Token reset password</td></tr>
<tr><td>14</td><td>page_views</td><td>Pencatatan statistik kunjungan halaman</td></tr>
<tr><td>15</td><td>comment_rate_limits</td><td>Pembatasan rate komentar per IP</td></tr></table>
<p>Seluruh tabel menggunakan UUID sebagai primary key bertipe string untuk keamanan dan menghindari prediksi ID. Relasi antar tabel dirancang dengan foreign key constraint yang menjaga integritas data.</p>''')

    # III.2.2 Scheduled Publish
    p.append(f'''<h3>III.2.2 &nbsp; Implementasi Cronjob Scheduled Publish</h3>
<p>Fitur <i>Scheduled Publish</i> memungkinkan editor atau admin untuk mengatur waktu publikasi artikel di masa depan. Ketika waktu yang dijadwalkan tiba, sistem secara otomatis mengubah status artikel dari <code>scheduled</code> menjadi <code>published</code> tanpa intervensi manual. Implementasi fitur ini melibatkan tiga komponen utama: (1) <strong>Artisan Command</strong> sebagai entry point yang dipanggil oleh scheduler, (2) <strong>ScheduledPublishService</strong> yang berisi seluruh logika bisnis penjadwalan, dan (3) <strong>Laravel Task Scheduler</strong> yang dikonfigurasi untuk menjalankan command setiap menit.</p>
<p>Berikut adalah potongan kode dari Artisan Command yang menjadi trigger utama proses scheduled publish:</p>
{cb(cs1)}
{cap('Potongan kode 1. Artisan Command articles:publish-scheduled yang menjadi entry point cron job.')}
<p>Pada potongan kode di atas, class <code>PublishScheduledArticles</code> adalah Artisan Command yang dibuat untuk menangani proses auto-publish artikel terjadwal. Command ini punya signature <code>articles:publish-scheduled</code> dan di dalamnya sudah di-inject <code>ScheduledPublishService</code> sebagai dependency. Jadi ketika command ini dijalankan, method <code>handle()</code> akan memanggil service untuk memproses artikel yang sudah waktunya tayang, lalu menampilkan output di console berapa artikel yang berhasil dipublish.</p>
<p>Inti dari proses penjadwalan terdapat pada method <code>run()</code> di ScheduledPublishService. Berikut adalah potongan kode yang melakukan query untuk mengambil artikel yang sudah waktunya tayang:</p>
{cb(cs2)}
{cap('Potongan kode 2. Query pengambilan artikel terjadwal yang sudah jatuh tempo.')}
<p>Kode di atas berfungsi untuk mengambil semua artikel yang sudah dijadwalkan dan waktunya sudah lewat. Query-nya mencari di tabel <code>scheduled_articles</code> dengan syarat <code>scheduled_at &lt;= NOW()</code> (waktunya sudah lewat) dan <code>is_published = false</code> (belum pernah dipublish sebelumnya). Kalau hasilnya kosong, berarti tidak ada artikel yang perlu diproses dan method langsung return 0.</p>
<p>Setelah mendapatkan daftar artikel yang perlu dipublish, setiap artikel diproses dalam sebuah database transaction:</p>
{cb(cs3)}
{cap('Potongan kode 3. Proses publish artikel dalam database transaction.')}
<p>Potongan kode di atas menunjukkan proses publish satu artikel yang dibungkus dalam satu <code>DB::transaction()</code>. Tujuannya supaya ketiga operasi di dalamnya berjalan bersamaan &mdash; kalau salah satu gagal, semuanya di-rollback. Pertama, update status artikel jadi <code>published</code> dan isi <code>published_at</code> dengan waktu sekarang. Kedua, update flag <code>is_published</code> di tabel <code>scheduled_articles</code> jadi true supaya artikelnya tidak diproses lagi di cron berikutnya. Ketiga, reindex artikel ke tabel <code>search_indexes</code> biar artikel yang baru published langsung bisa ditemukan di fitur pencarian.</p>
<p>Berikut adalah Sequence Diagram yang menggambarkan alur kerja fitur Scheduled Publish:</p>
<div class="dc">{I['seq_scheduled_publish']}<p class="dcap">Gambar 3.1 &nbsp; Sequence Diagram &mdash; Cronjob Scheduled Publish</p></div>
<p>Diagram di atas menjelaskan alur lengkap fitur Scheduled Publish dari awal sampai akhir. Di <strong>Fase 1</strong>, editor atau admin menjadwalkan artikel lewat API dengan menentukan kapan artikelnya harus tayang. Sistem simpan statusnya sebagai <code>scheduled</code> dan catat jadwalnya di tabel <code>scheduled_articles</code>. Di <strong>Fase 2</strong>, cron job jalan setiap menit dan ngecek apakah ada artikel yang sudah waktunya tayang. Kalau ada, sistem update statusnya jadi <code>published</code>, tandai jadwalnya sudah diproses, dan update search index supaya artikelnya langsung muncul di pencarian.</p>
<p>Berikut adalah Activity Diagram yang menggambarkan alur aktivitas fitur Scheduled Publish:</p>
<div class="dc">{I['act_sp']}<p class="dcap">Gambar 3.2 &nbsp; Activity Diagram &mdash; Scheduled Publish</p></div>
<p>Activity Diagram di atas menggambarkan proses secara detail dimulai dari trigger cron job, pengecekan artikel yang jatuh tempo, loop pemrosesan setiap artikel, hingga logging hasil eksekusi.</p>''')

    # III.2.3 User CRUD
    p.append(f'''<h3>III.2.3 &nbsp; Implementasi Manajemen User (CRUD) pada Role Admin</h3>
<p>Fitur Manajemen User merupakan fitur yang hanya dapat diakses oleh pengguna dengan role <strong>Admin</strong>. Fitur ini mencakup operasi Create, Read, Update, dan Delete. Sistem manajemen user dirancang dengan memperhatikan aspek keamanan, seperti pencegahan admin menghapus akun sendiri, auto-generate password yang aman, dan pengiriman kredensial melalui email. Arsitektur fitur ini mengikuti pola Service-Repository: <code>UserController</code> menangani HTTP request/response, <code>UserService</code> menangani logika bisnis, dan <code>UserRepository</code> menangani operasi database.</p>
<p>Berikut adalah potongan kode untuk operasi Create User:</p>
{cb(cs4)}
{cap('Potongan kode 4. Method createUser() pada UserService untuk membuat user baru.')}
<p>Di method <code>createUser()</code> ini, pertama sistem cek dulu apakah email yang diinput sudah terdaftar atau belum. Kalau sudah, langsung throw error. Kalau belum, sistem generate password acak 12 karakter, terus insert data user ke database. Passwordnya otomatis di-hash oleh Laravel jadi tidak disimpan dalam bentuk plain text. Setelah user berhasil dibuat, sistem kirim email ke alamat user baru yang isinya nama, email, password sementara, dan role-nya.</p>
<p>Berikut adalah potongan kode untuk generate password acak:</p>
{cb(cs5)}
{cap('Potongan kode 5. Method generatePassword() untuk menghasilkan password acak yang aman.')}
<p>Fungsi <code>generatePassword()</code> ini digunakan untuk membuat password sementara sepanjang 12 karakter. Passwordnya dijamin ada minimal satu huruf besar, satu huruf kecil, satu angka, dan satu simbol. Karakter-karakter yang gampang bikin bingung seperti huruf O, huruf l, angka 1, dan angka 0 sengaja tidak dipakai supaya user tidak salah ketik waktu input password pertama kali.</p>
<p>Operasi Update User memiliki logika khusus yang mencegah admin mengubah akun sendiri serta melakukan revoke token jika role user diubah:</p>
{cb(cs6)}
{cap('Potongan kode 6. Method updateUser() dengan validasi dan revoke token otomatis.')}
<p>Di method <code>updateUser()</code> ini ada beberapa pengecekan yang dilakukan. Pertama, sistem cek apakah admin mencoba mengubah akunnya sendiri &mdash; kalau iya, langsung ditolak biar admin tidak tidak sengaja mengunci akunnya. Kedua, kalau emailnya diganti, cek dulu apakah email baru itu sudah dipakai user lain. Ketiga, hanya field yang dikirim saja yang di-update, jadi tidak perlu kirim semua field. Yang menarik, kalau role user diubah, semua refresh token milik user itu langsung di-revoke. Efeknya user langsung logout dari semua perangkat yang aktif, jadi perubahan role langsung berlaku saat itu juga.</p>
<p>Operasi Delete User merupakan operasi yang paling kompleks karena melibatkan penanganan dampak terhadap data terkait:</p>
{cb(cs7)}
{cap('Potongan kode 7. Method deleteUser() dengan penanganan dampak terhadap data terkait.')}
<p>Method <code>deleteUser()</code> ini melakukan tiga langkah secara berurutan. Pertama, revoke semua refresh token user supaya user langsung logout dari semua perangkat. Kedua, arsipkan semua artikel milik user tersebut dengan mengubah statusnya jadi <code>archived</code> &mdash; artikelnya tidak dihapus, cuma diarsipkan supaya sejarah kontennya tetap ada. Ketiga, baru hapus data user dari database.</p>
<p>Berikut adalah Sequence Diagram yang menggambarkan alur kerja CRUD User:</p>
<div class="dc">{I['seq_user_crud']}<p class="dcap">Gambar 3.3 &nbsp; Sequence Diagram &mdash; Manajemen User (CRUD)</p></div>
<p>Diagram di atas menggambarkan tiga skenario operasi CRUD: Create User (blok hijau), Update User (blok biru), dan Delete User (blok merah).</p>
<p>Berikut adalah Activity Diagram yang menggambarkan alur aktivitas fitur Manajemen User:</p>
<div class="dc">{I['act_uc']}<p class="dcap">Gambar 3.4 &nbsp; Activity Diagram &mdash; Manajemen User</p></div>
<p>Activity Diagram di atas menggambarkan keseluruhan alur operasi manajemen user dari perspektif admin, termasuk jalur validasi dan penanganan error pada setiap operasi.</p>
<p>Selain operasi CRUD, sistem juga dilengkapi dengan mekanisme <strong>pengiriman email notifikasi</strong> yang dikirim secara otomatis ketika admin membuat akun user baru. Email dikirim menggunakan class <code>NewUserCredentials</code> yang merupakan turunan dari <code>Mailable</code> milik Laravel. Berikut adalah potongan kode class Mailable yang digunakan:</p>
{cb(cs_email)}
{cap('Potongan kode 9. Class NewUserCredentials Mailable untuk email kredensial user baru.')}
<p>Class <code>NewUserCredentials</code> ini menerima empat parameter melalui constructor, yaitu <code>name</code>, <code>email</code>, <code>plainPassword</code> (password sementara dalam plain text), dan <code>role</code> user yang baru dibuat. Method <code>envelope()</code> menentukan subject email, sedangkan method <code>content()</code> menentukan view Blade yang digunakan sebagai template email, yaitu <code>emails.new-user-credentials</code>.</p>
<p>Template email yang digunakan berisi informasi lengkap yang dibutuhkan user baru untuk login pertama kali, meliputi nama pengguna, alamat email, password sementara, dan role yang diberikan. Email juga menyertakan peringatan agar user segera mengganti password setelah login pertama kali melalui menu Pengaturan Profil. Password sementara yang dikirim melalui email bersifat <i>one-time use</i> dan user diharapkan langsung mengubahnya demi keamanan akun. Pengiriman email dilakukan secara sinkron menggunakan Laravel Mail facade dengan driver SMTP yang dikonfigurasi melalui file <code>.env</code>.</p>''')

    # III.2.4 API Documentation
    p.append(f'''<h3>III.2.4 &nbsp; Dokumentasi API Endpoint</h3>
<p>Seluruh fitur yang dikembangkan diekspos melalui REST API yang dapat diakses oleh frontend. Berikut adalah dokumentasi API endpoint untuk fitur-fitur yang diimplementasikan oleh penulis.</p>
<h4>A. Manajemen User (Admin Only)</h4>
<p>Seluruh endpoint di bawah ini dilindungi oleh middleware <code>auth:api</code> dan <code>admin</code>, sehingga hanya dapat diakses oleh pengguna yang telah terautentikasi dengan role admin.</p>
{cb(cs_route, 'PHP')}
{cap('Potongan kode 8. Definisi route API untuk Manajemen User.')}
<table>
<tr><th>No</th><th>Method</th><th>Endpoint</th><th>Deskripsi</th></tr>
<tr><td>1</td><td>GET</td><td>/api/users</td><td>Mengambil daftar seluruh user dalam sistem</td></tr>
<tr><td>2</td><td>POST</td><td>/api/users</td><td>Membuat user baru (auto-generate password + kirim email)</td></tr>
<tr><td>3</td><td>GET</td><td>/api/users/&#123;id&#125;</td><td>Mengambil detail satu user berdasarkan ID</td></tr>
<tr><td>4</td><td>PATCH</td><td>/api/users/&#123;id&#125;</td><td>Mengupdate data user (nama, email, role, is_active)</td></tr>
<tr><td>5</td><td>DELETE</td><td>/api/users/&#123;id&#125;</td><td>Menghapus user (revoke token + arsipkan artikel)</td></tr>
</table>
<p>Berikut adalah detail request dan response untuk masing-masing endpoint:</p>
<table>
<tr><th>Endpoint</th><th>Request Body</th><th>Response Success</th><th>Response Error</th></tr>
<tr><td>POST /api/users</td><td>name (string), email (string), role (string)</td><td>201 Created + data user</td><td>409 EMAIL_ALREADY_EXISTS</td></tr>
<tr><td>PATCH /api/users/&#123;id&#125;</td><td>name?, email?, role?, is_active?</td><td>200 OK + data user</td><td>403 CANNOT_MODIFY_SELF, 404 USER_NOT_FOUND, 409 EMAIL_ALREADY_EXISTS</td></tr>
<tr><td>DELETE /api/users/&#123;id&#125;</td><td>-</td><td>200 OK + pesan berhasil</td><td>403 CANNOT_MODIFY_SELF, 404 USER_NOT_FOUND</td></tr>
</table>
<h4>B. Scheduled Publish (Cron Job)</h4>
<p>Fitur Scheduled Publish tidak diekspos sebagai REST API, melainkan dijalankan secara internal melalui Artisan Command yang dipicu oleh Laravel Task Scheduler. Command dijalankan otomatis setiap menit oleh cron daemon di server.</p>
<table>
<tr><th>Command</th><th>Signature</th><th>Jadwal</th><th>Deskripsi</th></tr>
<tr><td>PublishScheduledArticles</td><td>articles:publish-scheduled</td><td>Setiap menit (* * * * *)</td><td>Memproses seluruh artikel terjadwal yang sudah waktunya tayang</td></tr>
</table>
<p>Command ini juga dapat dijalankan secara manual melalui terminal:</p>
<div class="dc"><code style="background:#f6f7f9; padding:8px 16px; border:1px solid #dce0e8; border-radius:4px; font-family:'Courier New',monospace; font-size:9pt;">php artisan articles:publish-scheduled</code></div>''')

    # III.2.5 Perancangan CDM, PDM, ERD Detail
    p.append('''<h3>III.2.5 &nbsp; Perancangan Conceptual Data Model, Physical Data Model, dan ERD</h3>
<p>Perancangan database dilakukan secara bertahap dimulai dari <strong>Conceptual Data Model (CDM)</strong> yang menggambarkan entitas-entitas utama sistem beserta relasinya secara abstrak, tanpa memperhatikan detail implementasi teknis. Pada tahap CDM, penulis mengidentifikasi delapan entitas utama: <i>User</i>, <i>Article</i>, <i>Category</i>, <i>Tag</i>, <i>Comment</i>, <i>Bookmark</i>, <i>ArticleRevision</i>, dan <i>ScheduledArticle</i>. Setiap entitas memiliki atribut-atribut kunci yang merepresentasikan informasi yang perlu disimpan.</p>
<p>Dari CDM, penulis menurunkan menjadi <strong>Physical Data Model (PDM)</strong> yang menambahkan detail teknis seperti tipe data, panjang field, constraint, dan index. Setiap tabel menggunakan UUID bertipe string (36 karakter) sebagai primary key untuk menghindari prediksi ID dan meningkatkan keamanan. Pemilihan UUID ini juga memudahkan proses migrasi data antar lingkungan (development, staging, production) karena tidak ada konflik auto-increment.</p>
<p>Tahap terakhir adalah <strong>Entity Relationship Diagram (ERD)</strong> yang menggambarkan relasi antar tabel secara lengkap beserta kardinalitasnya. Beberapa relasi penting yang dirancang meliputi: (1) relasi one-to-many antara <code>users</code> dan <code>articles</code> melalui <code>author_id</code>, (2) relasi many-to-many antara <code>articles</code> dan <code>tags</code> melalui tabel junction <code>article_tags</code>, (3) relasi one-to-many antara <code>articles</code> dan <code>comments</code> dengan self-referencing <code>parent_id</code> untuk mendukung nested comment, serta (4) relasi one-to-many antara <code>users</code> dan <code>refresh_tokens</code> untuk manajemen sesi autentikasi.</p>
<p>Foreign key constraint dirancang dengan strategi cascade yang sesuai untuk setiap relasi. Tabel <code>articles</code> memiliki constraint <code>restrictOnDelete</code> pada kolom <code>author_id</code> untuk mencegah penghapusan user yang memiliki artikel &mdash; sebagai gantinya, sistem menggunakan mekanisme arsip artikel sebelum penghapusan user. Sebaliknya, tabel <code>comments</code> dan <code>bookmarks</code> memiliki constraint <code>cascadeOnDelete</code> sehingga ketika artikel dihapus, seluruh komentar dan bookmark terkait otomatis ikut terhapus.</p>''')

    # III.2.6 Service-Repository Pattern Detail
    p.append('''<h3>III.2.6 &nbsp; Implementasi Service-Repository Pattern secara Detail</h3>
<p>Penulis menerapkan pola arsitektur <strong>Service-Repository Pattern</strong> secara konsisten di seluruh modul backend. Pola ini memisahkan tanggung jawab kode menjadi tiga layer yang jelas: <strong>Controller</strong> (menangani HTTP request/response dan validasi input), <strong>Service</strong> (menangani logika bisnis dan orkestrasi antar komponen), dan <strong>Repository</strong> (menangani operasi database).</p>
<p>Sebagai contoh implementasi, berikut adalah struktur class untuk modul Scheduled Publish:</p>
<ul>
<li><strong>PublishScheduledArticles</strong> (Artisan Command) &mdash; berperan sebagai <i>entry point</i> yang dipanggil oleh scheduler. Command ini hanya bertanggung jawab memanggil service dan menampilkan output ke console.</li>
<li><strong>ScheduledPublishService</strong> &mdash; berisi seluruh logika bisnis penjadwalan, meliputi query artikel yang jatuh tempo, proses publish dalam transaction, dan reindex search index.</li>
<li><strong>ScheduledArticleRepository</strong> &mdash; menyediakan method untuk query tabel <code>scheduled_articles</code> seperti <code>findDueArticles()</code> dan <code>markAsPublished()</code>.</li>
</ul>
<p>Pemisahan layer ini memberikan beberapa keuntungan signifikan. Pertama, setiap layer dapat diuji secara independen menggunakan <i>mocking</i> &mdash; service layer dapat diuji tanpa koneksi database nyata dengan cara me-mock repository. Kedua, penggantian implementasi repository (misalnya dari Query Builder ke stored procedure) tidak mempengaruhi service layer karena keduanya berkomunikasi melalui interface (<code>ScheduledArticleRepositoryInterface</code>). Ketiga, kode menjadi lebih mudah dibaca karena setiap class memiliki tanggung jawab tunggal (<i>Single Responsibility Principle</i>).</p>
<p>Pola yang sama juga diterapkan pada modul User Management, di mana <code>UserController</code> mendelegasikan seluruh operasi ke <code>UserService</code>, yang kemudian menggunakan <code>UserRepository</code> untuk operasi database. <code>UserService</code> juga berkoordinasi dengan <code>RefreshTokenRepository</code> untuk revoke token dan <code>ArticleRepository</code> untuk arsipkan artikel saat user dihapus.</p>''')

    # III.2.7 Database Migration dan UUID
    p.append('''<h3>III.2.7 &nbsp; Implementasi Database Migration dan Penggunaan UUID</h3>
<p>Seluruh struktur database diimplementasikan menggunakan <strong>Laravel Migration</strong>, yang memungkinkan versioning skema database dan kolaborasi antar developer. Penulis membuat file migrasi untuk setiap tabel dengan penamaan yang mengikuti konvensi timestamp Laravel, memastikan urutan eksekusi migrasi yang benar.</p>
<p>Salah satu keputusan teknis penting yang diambil adalah penggunaan <strong>UUID (Universally Unique Identifier)</strong> sebagai primary key untuk seluruh tabel utama, kecuali tabel <code>page_views</code> yang menggunakan auto-increment integer karena volume data yang tinggi dan tidak memerlukan UUID. UUID di-generate menggunakan method <code>Str::uuid()</code> dari Laravel yang menghasilkan string 36 karakter dengan format standar (8-4-4-4-12).</p>
<p>Keuntungan penggunaan UUID meliputi: (1) <strong>keamanan</strong> &mdash; ID tidak dapat diprediksi sehingga mengurangi risiko enumeration attack, (2) <strong>desentralisasi</strong> &mdash; ID dapat di-generate di aplikasi tanpa perlu koneksi ke database, dan (3) <strong>portabilitas</strong> &mdash; data dari berbagai sumber dapat di-merge tanpa konflik ID. Namun, UUID juga memiliki trade-off: ukuran index yang lebih besar dibandingkan integer dan performa query yang sedikit lebih lambat pada dataset sangat besar.</p>
<p>Penulis juga membuat beberapa file migrasi tambahan untuk modifikasi skema setelah tabel awal dibuat, seperti penambahan kolom <code>published_by</code> dan <code>locked_by</code> pada tabel <code>articles</code>, serta perubahan constraint pada kolom <code>parent_id</code> di tabel <code>comments</code>. Pendekatan ini memastikan seluruh perubahan skema tercatat dalam version control dan dapat di-rollback jika diperlukan.</p>''')

    # III.2.8 Laravel Task Scheduler
    p.append('''<h3>III.2.8 &nbsp; Konfigurasi Laravel Task Scheduler</h3>
<p>Fitur Scheduled Publish menggunakan <strong>Laravel Task Scheduler</strong> yang merupakan abstraction layer di atas cron daemon. Penulis mengonfigurasi scheduler di file <code>routes/console.php</code> untuk menjalankan Artisan Command <code>articles:publish-scheduled</code> setiap menit menggunakan method <code>everyMinute()</code>.</p>
<p>Konfigurasi scheduler ini menggantikan kebutuhan untuk menulis cron expression secara manual di server. Dengan Laravel Scheduler, seluruh jadwal task terdokumentasi dalam kode dan dapat di-version control bersama kode aplikasi. Di server production, hanya diperlukan satu entry cron (<code>* * * * * php artisan schedule:run</code>) yang kemudian mendelegasikan penjadwalan detail ke Laravel.</p>
<p>Penulis juga menambahkan beberapa konfigurasi tambahan untuk meningkatkan reliabilitas scheduler: (1) method <code>withoutOverlapping()</code> untuk mencegah dua instance command berjalan secara bersamaan jika eksekusi sebelumnya belum selesai, (2) method <code>runInBackground()</code> untuk menjalankan command secara asynchronous sehingga tidak memblokir scheduler dari menjalankan task lain, serta (3) konfigurasi timezone agar jadwal eksekusi sesuai dengan zona waktu server.</p>
<p>Artisan Command <code>PublishScheduledArticles</code> dirancang dengan prinsip idempotensi &mdash; command dapat dijalankan berulang kali tanpa efek samping jika tidak ada artikel yang perlu diproses. Ketika tidak ada artikel jatuh tempo, command langsung mengembalikan nilai 0 tanpa melakukan operasi database apapun. Pendekatan ini memastikan scheduler yang berjalan setiap menit tidak memberikan beban unnecessary pada database.</p>''')

    # III.2.9 JWT Authentication & RBAC
    p.append('''<h3>III.2.9 &nbsp; Autentikasi JWT dan Role-Based Access Control</h3>
<p>Sistem menggunakan <strong>JSON Web Token (JWT)</strong> sebagai mekanisme autentikasi utama. Penulis mengonfigurasi JWT menggunakan library <code>php-open-source-saver/jwt-auth</code> yang terintegrasi dengan Laravel Auth Guard. Setiap user yang berhasil login menerima dua token: <strong>access token</strong> (berlaku 60 menit) yang digunakan untuk mengakses API, dan <strong>refresh token</strong> (berlaku 14 hari) yang digunakan untuk mendapatkan access token baru ketika yang lama kedaluwarsa.</p>
<p>Refresh token disimpan di tabel <code>refresh_tokens</code> dengan hash SHA-256 untuk keamanan. Setiap record menyimpan informasi <code>user_id</code>, <code>token_hash</code>, <code>device_info</code>, <code>ip_address</code>, <code>is_revoked</code>, dan <code>expires_at</code>. Informasi device dan IP address membantu admin mengidentifikasi sesi yang mencurigakan.</p>
<p>Untuk kontrol akses, penulis mengimplementasikan <strong>Role-Based Access Control (RBAC)</strong> menggunakan middleware Laravel. Empat role didefinisikan: <strong>admin</strong> (akses penuh termasuk manajemen user), <strong>editor</strong> (tinjauan dan publikasi artikel), <strong>journalist</strong> (pembuatan artikel), dan <strong>reader</strong> (pembaca portal berita). Middleware <code>admin</code> (<code>EnsureAdmin</code>) memvalidasi bahwa user yang mengakses endpoint memiliki role admin sebelum request diproses. Endpoint manajemen user (<code>/api/users/*</code>) dilindungi oleh middleware ini sehingga journalist, editor, maupun reader tidak dapat mengaksesnya.</p>
<p>Mekanisme <strong>token revocation</strong> diimplementasikan untuk menangani perubahan role dan penghapusan user. Ketika admin mengubah role seorang user, seluruh refresh token user tersebut di-revoke melalui method <code>revokeAllForUser()</code> di <code>RefreshTokenRepository</code>. Efeknya, user langsung logout dari semua perangkat aktif dan harus login ulang untuk mendapatkan token baru dengan role yang diperbarui.</p>''')

    # III.2.10 Database Transaction & ACID
    p.append('''<h3>III.2.10 &nbsp; Database Transaction dan ACID Properties</h3>
<p>Penulis menerapkan <strong>database transaction</strong> pada operasi-operasi yang melibatkan perubahan di beberapa tabel secara bersamaan, khususnya pada fitur Scheduled Publish. Tujuannya adalah menjamin sifat <strong>ACID</strong> (<i>Atomicity, Consistency, Isolation, Durability</i>) dari operasi tersebut.</p>
<p><strong>Atomicity</strong> dijamin dengan membungkus seluruh operasi publish dalam satu <code>DB::transaction()</code>. Jika salah satu operasi gagal (misalnya update status artikel berhasil tetapi reindex search index gagal), seluruh perubahan akan di-rollback sehingga data tetap konsisten. Tanpa transaction, kegagalan parsial dapat menyebabkan artikel berstatus <code>published</code> tetapi tidak ter-index di pencarian, atau sebaliknya.</p>
<p><strong>Consistency</strong> dijaga melalui kombinasi transaction dan foreign key constraint. Setiap operasi publish mencakup tiga langkah yang harus berhasil semua: (1) update status dan published_at di tabel <code>articles</code>, (2) update flag is_published di tabel <code>scheduled_articles</code>, dan (3) upsert record di tabel <code>search_indexes</code>. Ketiga langkah ini merupakan satu kesatuan logis yang tidak boleh terpecah.</p>
<p><strong>Isolation</strong> dicapai melalui mekanisme lock implisit yang disediakan oleh database engine SQLite. Ketika satu instance cron job sedang memproses artikel, instance lain yang berjalan secara bersamaan tidak akan dapat memodifikasi record yang sama sampai transaction pertama selesai. Hal ini dipadukan dengan konfigurasi <code>withoutOverlapping()</code> pada scheduler untuk memastikan tidak ada dua instance command yang berjalan bersamaan.</p>
<p><strong>Durability</strong> dijamin oleh database engine itu sendiri &mdash; setelah transaction berhasil di-commit, perubahan data akan tersimpan secara permanen di disk dan tidak akan hilang meskipun server restart.</p>''')

    # III.2.11 Email Template & Mailable
    p.append('''<h3>III.2.11 &nbsp; Template Email dan Blade View</h3>
<p>Fitur pengiriman email kredensial menggunakan class <strong>NewUserCredentials</strong> yang merupakan turunan dari <code>Mailable</code> milik Laravel. Class ini dirancang dengan pendekatan constructor injection, di mana data user (nama, email, password sementara, dan role) diteruskan melalui constructor dan disimpan sebagai property public yang dapat diakses di view.</p>
<p>Template email dibuat menggunakan <strong>Blade template engine</strong> milik Laravel di file <code>resources/views/emails/new-user-credentials.blade.php</code>. Template ini dirancang dengan HTML yang responsif dan informatif, mencakup: (1) header dengan logo perusahaan, (2) pesan sambutan yang menyebutkan nama user, (3) tabel berisi informasi akun (email, password sementara, dan role), (4) tombol link ke halaman login, serta (5) peringatan keamanan agar user segera mengganti password setelah login pertama kali.</p>
<p>Pengiriman email dilakukan secara sinkron menggunakan <code>Mail::to($user->email)->send(new NewUserCredentials(...))</code>. Meskipun pendekatan sinkron lebih sederhana, penulis menyadari bahwa untuk skala produksi, pendekatan asynchronous menggunakan Laravel Queue akan lebih tepat agar proses pembuatan user tidak terblokir oleh waktu pengiriman email. Namun, untuk kebutuhan proyek saat ini dengan volume pembuatan user yang rendah, pendekatan sinkron sudah memadai.</p>
<p>Penulis juga mengonfigurasi driver email melalui file <code>.env</code> menggunakan SMTP. Konfigurasi ini memungkinkan pengujian pengiriman email di lingkungan development menggunakan service seperti Mailtrap, sementara di production menggunakan SMTP server yang sesungguhnya.</p>''')

    # III.2.12 Konfigurasi Proyek dan Dependency Management
    p.append('''<h3>III.2.12 &nbsp; Konfigurasi Proyek dan Dependency Management</h3>
<p>Penulis bertanggung jawab dalam menyiapkan dan mengonfigurasi seluruh proyek dari awal. Proses ini mencakup beberapa langkah penting yang menjadi fondasi bagi pengembangan fitur-fitur selanjutnya.</p>
<p><strong>Pemilihan Tech Stack</strong> &mdash; Penulis melakukan analisis terhadap beberapa alternatif teknologi sebelum menetapkan pilihan akhir. Untuk backend, Laravel 12 dipilih karena ekosistemnya yang matang, dokumentasi yang lengkap, dan dukungan built-in untuk fitur yang dibutuhkan (Task Scheduler, Mailable, Queue, Migration). Untuk frontend, Next.js 15 dipilih karena kemampuan SSR/ISR yang penting untuk SEO portal berita. Tailwind CSS dipilih untuk styling karena utility-first approach yang mempercepat pengembangan UI.</p>
<p><strong>Struktur Direktori</strong> &mdash; Penulis menyusun struktur direktori backend mengikuti konvensi Laravel dengan penambahan folder <code>Repositories</code> dan <code>Contracts</code> untuk mendukung Service-Repository Pattern. Setiap entitas memiliki tiga file: Controller, Service, dan Repository, plus satu file Interface di folder Contracts. Struktur ini memudahkan navigasi kode karena lokasi setiap class dapat diprediksi berdasarkan nama entitasnya.</p>
<p><strong>Konfigurasi Environment</strong> &mdash; File <code>.env</code> dikonfigurasi untuk setiap lingkungan (development dan production) dengan nilai yang berbeda untuk database connection, JWT secret, SMTP credentials, dan CORS origins. Penulis juga menyiapkan file <code>.env.example</code> yang berisi template konfigurasi tanpa nilai sensitif, sehingga developer lain dapat dengan mudah menyiapkan lingkungan development mereka sendiri.</p>
<p><strong>Dependency Management</strong> &mdash; Seluruh dependency PHP dikelola menggunakan <strong>Composer</strong> dengan file <code>composer.json</code> dan <code>composer.lock</code> yang di-commit ke repository. Pendekatan ini memastikan setiap developer dan server production menggunakan versi dependency yang sama persis. Penulis menambahkan beberapa package penting seperti <code>php-open-source-saver/jwt-auth</code> untuk JWT authentication dan <code>intervention/image</code> untuk pemrosesan gambar.</p>''')

    # III.2.13 Detail Skema Database
    p.append('''<h3>III.2.13 &nbsp; Detail Skema Database</h3>
<p>Pada bagian ini dijelaskan secara rinci struktur kolom untuk setiap tabel dalam database sistem. Penjelasan ini mencakup nama kolom, tipe data, constraint, dan deskripsi fungsinya dalam sistem.</p>

<h4>A. Tabel users</h4>
<p>Tabel <code>users</code> menyimpan data seluruh pengguna sistem. Tabel ini menggunakan auto-increment integer sebagai primary key karena volume user yang relatif kecil dan kebutuhan query yang cepat.</p>
<table><tr><th>Kolom</th><th>Tipe Data</th><th>Constraint</th><th>Deskripsi</th></tr>
<tr><td>id</td><td>BIGINT</td><td>PK, Auto Increment</td><td>Identifier unik pengguna</td></tr>
<tr><td>name</td><td>VARCHAR(255)</td><td>NOT NULL</td><td>Nama lengkap pengguna</td></tr>
<tr><td>email</td><td>VARCHAR(255)</td><td>UNIQUE, NOT NULL</td><td>Alamat email untuk login</td></tr>
<tr><td>role</td><td>ENUM</td><td>DEFAULT &lsquo;reader&rsquo;</td><td>Peran: admin, editor, journalist, reader</td></tr>
<tr><td>is_active</td><td>BOOLEAN</td><td>DEFAULT true</td><td>Status akun aktif/nonaktif</td></tr>
<tr><td>avatar_url</td><td>VARCHAR(255)</td><td>NULLABLE</td><td>URL foto profil pengguna</td></tr>
<tr><td>bio</td><td>TEXT</td><td>NULLABLE</td><td>Biografi singkat pengguna</td></tr>
<tr><td>password</td><td>VARCHAR(255)</td><td>NOT NULL</td><td>Password ter-hash (bcrypt)</td></tr>
<tr><td>email_verified_at</td><td>TIMESTAMP</td><td>NULLABLE</td><td>Waktu verifikasi email</td></tr>
<tr><td>created_at</td><td>TIMESTAMP</td><td>AUTO</td><td>Waktu pembuatan akun</td></tr>
<tr><td>updated_at</td><td>TIMESTAMP</td><td>AUTO</td><td>Waktu update terakhir</td></tr>
</table>

<h4>B. Tabel articles</h4>
<p>Tabel <code>articles</code> menyimpan seluruh artikel berita dengan metadata lengkap. Menggunakan UUID sebagai primary key.</p>
<table><tr><th>Kolom</th><th>Tipe Data</th><th>Constraint</th><th>Deskripsi</th></tr>
<tr><td>id</td><td>UUID</td><td>PK</td><td>Identifier unik artikel</td></tr>
<tr><td>author_id</td><td>BIGINT</td><td>FK &rarr; users, RESTRICT ON DELETE</td><td>ID penulis artikel</td></tr>
<tr><td>published_by</td><td>BIGINT</td><td>FK &rarr; users, NULL ON DELETE, NULLABLE</td><td>ID editor yang mempublikasi</td></tr>
<tr><td>locked_by</td><td>BIGINT</td><td>FK &rarr; users, NULL ON DELETE, NULLABLE</td><td>ID editor yang mengunci artikel</td></tr>
<tr><td>category_id</td><td>UUID</td><td>FK &rarr; categories, RESTRICT, NULLABLE</td><td>ID kategori artikel</td></tr>
<tr><td>title</td><td>VARCHAR(255)</td><td>NOT NULL</td><td>Judul artikel</td></tr>
<tr><td>slug</td><td>VARCHAR(255)</td><td>UNIQUE, NOT NULL</td><td>URL-friendly identifier</td></tr>
<tr><td>excerpt</td><td>TEXT</td><td>NULLABLE</td><td>Ringkasan singkat artikel</td></tr>
<tr><td>content</td><td>LONGTEXT</td><td>NOT NULL</td><td>Konten lengkap artikel (HTML)</td></tr>
<tr><td>featured_image_url</td><td>VARCHAR(255)</td><td>NULLABLE</td><td>URL gambar utama artikel</td></tr>
<tr><td>status</td><td>ENUM</td><td>DEFAULT &lsquo;draft&rsquo;</td><td>Status: draft, review, scheduled, published, archived</td></tr>
<tr><td>is_featured</td><td>BOOLEAN</td><td>DEFAULT false</td><td>Penanda artikel unggulan</td></tr>
<tr><td>view_count</td><td>BIGINT UNSIGNED</td><td>DEFAULT 0</td><td>Jumlah kunjungan artikel</td></tr>
<tr><td>published_at</td><td>TIMESTAMP</td><td>NULLABLE</td><td>Waktu publikasi artikel</td></tr>
<tr><td>created_at</td><td>TIMESTAMP</td><td>AUTO</td><td>Waktu pembuatan artikel</td></tr>
<tr><td>updated_at</td><td>TIMESTAMP</td><td>AUTO</td><td>Waktu update terakhir</td></tr>
</table>

<h4>C. Tabel categories</h4>
<p>Tabel <code>categories</code> menyimpan kategori berita dengan dukungan hierarki parent-child menggunakan self-referencing.</p>
<table><tr><th>Kolom</th><th>Tipe Data</th><th>Constraint</th><th>Deskripsi</th></tr>
<tr><td>id</td><td>UUID</td><td>PK</td><td>Identifier unik kategori</td></tr>
<tr><td>parent_id</td><td>UUID</td><td>FK &rarr; categories, NULL ON DELETE, NULLABLE</td><td>ID kategori induk (untuk sub-kategori)</td></tr>
<tr><td>name</td><td>VARCHAR(255)</td><td>NOT NULL</td><td>Nama kategori (Politik, Ekonomi, dll.)</td></tr>
<tr><td>slug</td><td>VARCHAR(255)</td><td>UNIQUE, NOT NULL</td><td>URL-friendly identifier</td></tr>
</table>

<h4>D. Tabel tags</h4>
<p>Tabel <code>tags</code> menyimpan label-topik yang dapat dikaitkan dengan artikel.</p>
<table><tr><th>Kolom</th><th>Tipe Data</th><th>Constraint</th><th>Deskripsi</th></tr>
<tr><td>id</td><td>UUID</td><td>PK</td><td>Identifier unik tag</td></tr>
<tr><td>name</td><td>VARCHAR(255)</td><td>UNIQUE, NOT NULL</td><td>Nama tag</td></tr>
<tr><td>slug</td><td>VARCHAR(255)</td><td>UNIQUE, NOT NULL</td><td>URL-friendly identifier</td></tr>
</table>

<h4>E. Tabel article_tags</h4>
<p>Tabel junction untuk relasi many-to-many antara artikel dan tag.</p>
<table><tr><th>Kolom</th><th>Tipe Data</th><th>Constraint</th><th>Deskripsi</th></tr>
<tr><td>article_id</td><td>UUID</td><td>PK, FK &rarr; articles, CASCADE ON DELETE</td><td>ID artikel</td></tr>
<tr><td>tag_id</td><td>UUID</td><td>PK, FK &rarr; tags, CASCADE ON DELETE</td><td>ID tag</td></tr>
</table>

<h4>F. Tabel comments</h4>
<p>Tabel <code>comments</code> menyimpan komentar pembaca dengan dukungan nested reply menggunakan self-referencing <code>parent_id</code>.</p>
<table><tr><th>Kolom</th><th>Tipe Data</th><th>Constraint</th><th>Deskripsi</th></tr>
<tr><td>id</td><td>UUID</td><td>PK</td><td>Identifier unik komentar</td></tr>
<tr><td>article_id</td><td>UUID</td><td>FK &rarr; articles, CASCADE ON DELETE</td><td>ID artikel yang dikomentari</td></tr>
<tr><td>user_id</td><td>BIGINT</td><td>FK &rarr; users, CASCADE ON DELETE</td><td>ID pengguna yang berkomentar</td></tr>
<tr><td>parent_id</td><td>UUID</td><td>FK &rarr; comments, NULL ON DELETE, NULLABLE</td><td>ID komentar induk (untuk reply)</td></tr>
<tr><td>content</td><td>TEXT</td><td>NOT NULL</td><td>Isi komentar</td></tr>
<tr><td>status</td><td>ENUM</td><td>DEFAULT &lsquo;pending&rsquo;</td><td>Status: pending, approved, rejected</td></tr>
<tr><td>created_at</td><td>TIMESTAMP</td><td>AUTO</td><td>Waktu komentar dibuat</td></tr>
</table>

<h4>G. Tabel bookmarks</h4>
<p>Tabel <code>bookmarks</code> menyimpan artikel favorit pembaca. Constraint unique pada (user_id, article_id) mencegah duplikasi.</p>
<table><tr><th>Kolom</th><th>Tipe Data</th><th>Constraint</th><th>Deskripsi</th></tr>
<tr><td>id</td><td>UUID</td><td>PK</td><td>Identifier unik bookmark</td></tr>
<tr><td>user_id</td><td>BIGINT</td><td>FK &rarr; users, CASCADE ON DELETE</td><td>ID pembaca yang menyimpan</td></tr>
<tr><td>article_id</td><td>UUID</td><td>FK &rarr; articles, CASCADE ON DELETE</td><td>ID artikel yang disimpan</td></tr>
<tr><td>created_at</td><td>TIMESTAMP</td><td>AUTO</td><td>Waktu bookmark dibuat</td></tr>
</table>

<h4>H. Tabel article_revisions</h4>
<p>Tabel <code>article_revisions</code> menyimpan riwayat perubahan artikel sebagai audit trail.</p>
<table><tr><th>Kolom</th><th>Tipe Data</th><th>Constraint</th><th>Deskripsi</th></tr>
<tr><td>id</td><td>UUID</td><td>PK</td><td>Identifier unik revisi</td></tr>
<tr><td>article_id</td><td>UUID</td><td>FK &rarr; articles, CASCADE ON DELETE</td><td>ID artikel yang direvisi</td></tr>
<tr><td>edited_by</td><td>BIGINT</td><td>FK &rarr; users, RESTRICT ON DELETE</td><td>ID pengguna yang merevisi</td></tr>
<tr><td>title_snapshot</td><td>VARCHAR(255)</td><td>NOT NULL</td><td>Snapshot judul sebelum perubahan</td></tr>
<tr><td>content_snapshot</td><td>LONGTEXT</td><td>NOT NULL</td><td>Snapshot konten sebelum perubahan</td></tr>
<tr><td>change_note</td><td>VARCHAR(255)</td><td>NULLABLE</td><td>Catatan perubahan dari editor</td></tr>
<tr><td>created_at</td><td>TIMESTAMP</td><td>AUTO</td><td>Waktu revisi dibuat</td></tr>
</table>

<h4>I. Tabel scheduled_articles</h4>
<p>Tabel <code>scheduled_articles</code> menyimpan jadwal publikasi artikel. Kolom <code>article_id</code> bersifat unique untuk memastikan satu artikel hanya memiliki satu jadwal aktif.</p>
<table><tr><th>Kolom</th><th>Tipe Data</th><th>Constraint</th><th>Deskripsi</th></tr>
<tr><td>id</td><td>UUID</td><td>PK</td><td>Identifier unik jadwal</td></tr>
<tr><td>article_id</td><td>UUID</td><td>UNIQUE, FK &rarr; articles, CASCADE ON DELETE</td><td>ID artikel yang dijadwalkan</td></tr>
<tr><td>scheduled_by</td><td>BIGINT</td><td>FK &rarr; users, RESTRICT ON DELETE</td><td>ID user yang menjadwalkan</td></tr>
<tr><td>scheduled_at</td><td>TIMESTAMP</td><td>NOT NULL</td><td>Waktu yang dijadwalkan untuk publish</td></tr>
<tr><td>is_published</td><td>BOOLEAN</td><td>DEFAULT false</td><td>Flag apakah sudah diproses cron</td></tr>
<tr><td>created_at</td><td>TIMESTAMP</td><td>AUTO</td><td>Waktu penjadwalan dibuat</td></tr>
</table>

<h4>J. Tabel search_indexes</h4>
<p>Tabel <code>search_indexes</code> menyimpan index pencarian full-text. Satu artikel memiliki tepat satu index.</p>
<table><tr><th>Kolom</th><th>Tipe Data</th><th>Constraint</th><th>Deskripsi</th></tr>
<tr><td>id</td><td>UUID</td><td>PK</td><td>Identifier unik index</td></tr>
<tr><td>article_id</td><td>UUID</td><td>UNIQUE, FK &rarr; articles, CASCADE ON DELETE</td><td>ID artikel yang di-index</td></tr>
<tr><td>search_vector</td><td>TEXT</td><td>FULLTEXT INDEX</td><td>Gabungan judul + konten untuk pencarian</td></tr>
<tr><td>tags_cache</td><td>TEXT</td><td>NULLABLE</td><td>Nama tag dalam satu string</td></tr>
<tr><td>updated_at</td><td>TIMESTAMP</td><td>AUTO UPDATE</td><td>Waktu index terakhir diperbarui</td></tr>
</table>

<h4>K. Tabel media</h4>
<p>Tabel <code>media</code> menyimpan referensi file media yang diupload.</p>
<table><tr><th>Kolom</th><th>Tipe Data</th><th>Constraint</th><th>Deskripsi</th></tr>
<tr><td>id</td><td>UUID</td><td>PK</td><td>Identifier unik media</td></tr>
<tr><td>article_id</td><td>UUID</td><td>FK &rarr; articles, CASCADE ON DELETE, NULLABLE</td><td>ID artikel terkait (null jika library)</td></tr>
<tr><td>uploaded_by</td><td>BIGINT</td><td>FK &rarr; users, NULL ON DELETE, NULLABLE</td><td>ID user yang mengupload</td></tr>
<tr><td>file_url</td><td>VARCHAR(255)</td><td>NOT NULL</td><td>URL file media</td></tr>
<tr><td>media_type</td><td>ENUM</td><td>NOT NULL</td><td>Tipe: image, video, audio</td></tr>
<tr><td>alt_text</td><td>VARCHAR(255)</td><td>NULLABLE</td><td>Teks alternatif untuk aksesibilitas</td></tr>
<tr><td>is_library</td><td>BOOLEAN</td><td>DEFAULT false</td><td>Penanda media library (tanpa artikel)</td></tr>
<tr><td>created_at</td><td>TIMESTAMP</td><td>AUTO</td><td>Waktu upload</td></tr>
</table>

<h4>L. Tabel refresh_tokens</h4>
<p>Tabel <code>refresh_tokens</code> menyimpan token refresh untuk autentikasi JWT. Token disimpan dalam bentuk hash SHA-256.</p>
<table><tr><th>Kolom</th><th>Tipe Data</th><th>Constraint</th><th>Deskripsi</th></tr>
<tr><td>id</td><td>UUID</td><td>PK</td><td>Identifier unik token</td></tr>
<tr><td>user_id</td><td>BIGINT</td><td>FK &rarr; users, CASCADE ON DELETE</td><td>ID pemilik token</td></tr>
<tr><td>token_hash</td><td>VARCHAR(255)</td><td>NOT NULL</td><td>Hash SHA-256 dari refresh token</td></tr>
<tr><td>device_info</td><td>VARCHAR(255)</td><td>NULLABLE</td><td>Info perangkat (user agent)</td></tr>
<tr><td>ip_address</td><td>VARCHAR(45)</td><td>NULLABLE</td><td>Alamat IP perangkat</td></tr>
<tr><td>is_revoked</td><td>BOOLEAN</td><td>DEFAULT false</td><td>Status token revoked/aktif</td></tr>
<tr><td>expires_at</td><td>TIMESTAMP</td><td>NOT NULL</td><td>Waktu kedaluwarsa token</td></tr>
<tr><td>created_at</td><td>TIMESTAMP</td><td>AUTO</td><td>Waktu token dibuat</td></tr>
</table>

<h4>M. Tabel password_reset_tokens</h4>
<p>Tabel <code>password_reset_tokens</code> menyimpan token untuk reset password. Menggunakan email sebagai primary key.</p>
<table><tr><th>Kolom</th><th>Tipe Data</th><th>Constraint</th><th>Deskripsi</th></tr>
<tr><td>email</td><td>VARCHAR(255)</td><td>PK</td><td>Email pemilik token</td></tr>
<tr><td>token</td><td>VARCHAR(255)</td><td>NOT NULL</td><td>Hash token reset password</td></tr>
<tr><td>created_at</td><td>TIMESTAMP</td><td>NULLABLE</td><td>Waktu token dibuat</td></tr>
</table>

<h4>N. Tabel page_views</h4>
<p>Tabel <code>page_views</code> mencatat statistik kunjungan halaman untuk analitik. Menggunakan auto-increment karena volume data tinggi.</p>
<table><tr><th>Kolom</th><th>Tipe Data</th><th>Constraint</th><th>Deskripsi</th></tr>
<tr><td>id</td><td>BIGINT</td><td>PK, Auto Increment</td><td>Identifier unik page view</td></tr>
<tr><td>path</td><td>VARCHAR(255)</td><td>INDEX, NOT NULL</td><td>Path URL yang dikunjungi</td></tr>
<tr><td>ip_address</td><td>VARCHAR(45)</td><td>NULLABLE</td><td>Alamat IP pengunjung</td></tr>
<tr><td>user_agent</td><td>TEXT</td><td>NULLABLE</td><td>User agent browser</td></tr>
<tr><td>created_at</td><td>TIMESTAMP</td><td>AUTO</td><td>Waktu kunjungan</td></tr>
<tr><td>updated_at</td><td>TIMESTAMP</td><td>AUTO</td><td>Waktu update record</td></tr>
</table>

<h4>O. Tabel comment_rate_limits</h4>
<p>Tabel <code>comment_rate_limits</code> membatasi jumlah komentar per user untuk mencegah spam.</p>
<table><tr><th>Kolom</th><th>Tipe Data</th><th>Constraint</th><th>Deskripsi</th></tr>
<tr><td>id</td><td>UUID</td><td>PK</td><td>Identifier unik record</td></tr>
<tr><td>user_id</td><td>BIGINT</td><td>UNIQUE, FK &rarr; users, CASCADE ON DELETE</td><td>ID user yang dibatasi</td></tr>
<tr><td>comment_count</td><td>INT UNSIGNED</td><td>DEFAULT 0</td><td>Jumlah komentar dalam window</td></tr>
<tr><td>window_start</td><td>TIMESTAMP</td><td>AUTO</td><td>Waktu mulai window rate limit</td></tr>
<tr><td>is_blocked</td><td>BOOLEAN</td><td>DEFAULT false</td><td>Status blokir komentar</td></tr>
<tr><td>blocked_until</td><td>TIMESTAMP</td><td>NULLABLE</td><td>Waktu berakhirnya blokir</td></tr>
</table>''')

    # III.2.14 GitHub Repository dan Kontribusi
    p.append('''<h3>III.2.14 &nbsp; GitHub Repository dan Kontribusi</h3>
<p>Seluruh kode sumber proyek dikelola menggunakan <strong>Git</strong> sebagai version control system dan di-hosting pada platform <strong>GitHub</strong>. Repository proyek berisi dua sub-direktori utama: <code>backend/</code> yang berisi kode sumber Laravel 12, dan <code>frontend/</code> yang berisi kode sumber Next.js 15. Pendekatan monorepo ini dipilih untuk memudahkan pengelolaan dependency antar kedua aplikasi dan memastikan sinkronisasi API contract antara frontend dan backend.</p>
<p>Berikut adalah tampilan halaman repository proyek di GitHub:</p>
<div class="screenshot-placeholder">[Screenshot: Halaman utama repository GitHub yang menampilkan struktur folder proyek (backend/, frontend/, diagrams/, dll.) beserta README.md]</div>
<p class="dcap">Gambar 3.5 &nbsp; Tampilan Repository Proyek di GitHub</p>

<p>Selama periode magang (9 Februari &ndash; 19 Juni 2026), penulis aktif melakukan commit ke repository. Total kontribusi penulis mencakup pengembangan fitur backend (scheduled publish, user management CRUD), frontend CMS dan portal berita, serta perancangan database migration. Berikut adalah grafik kontribusi commit penulis:</p>
<div class="screenshot-placeholder">[Screenshot: GitHub Insights / Contributions graph yang menampilkan total commit, additions, dan deletions selama periode magang]</div>
<p class="dcap">Gambar 3.6 &nbsp; Statistik Kontribusi Commit Penulis di GitHub</p>

<p>Penulis juga menerapkan workflow kolaborasi yang profesional menggunakan fitur <strong>Pull Request</strong> dan <strong>Branch Protection</strong>. Setiap fitur dikerjakan di branch terpisah (misalnya <code>feature/scheduled-publish</code> atau <code>feature/user-management</code>) dan di-merge ke branch <code>main</code> melalui pull request yang telah di-review oleh mentor. Berikut adalah tampilan daftar pull request yang telah di-merge:</p>
<div class="screenshot-placeholder">[Screenshot: Daftar pull request yang telah di-merge di GitHub, menampilkan judul PR, branch asal, dan tanggal merge]</div>
<p class="dcap">Gambar 3.7 &nbsp; Daftar Pull Request yang Telah Di-merge</p>

<p>Repository juga dilengkapi dengan file <code>.gitignore</code> untuk mencegah file-file sensitif atau tidak relevan (seperti <code>node_modules/</code>, <code>vendor/</code>, <code>.env</code>) ter-commit ke repository. Selain itu, file <code>composer.lock</code> dan <code>package-lock.json</code> tetap di-commit untuk memastikan konsistensi dependency antar lingkungan pengembangan. Berikut adalah rekapitulasi statistik kontribusi penulis selama periode magang:</p>
<table>
<tr><th>Metric</th><th>Jumlah</th></tr>
<tr><td>Total Commits</td><td>[Isi dengan jumlah commit total]</td></tr>
<tr><td>Files Changed</td><td>[Isi dengan jumlah file yang diubah]</td></tr>
<tr><td>Additions (+)</td><td>[Isi dengan total baris kode yang ditambahkan]</td></tr>
<tr><td>Deletions (-)</td><td>[Isi dengan total baris kode yang dihapus]</td></tr>
<tr><td>Pull Requests Merged</td><td>[Isi dengan jumlah PR yang di-merge]</td></tr>
</table>
<p class="ni center"><i>Tabel 2. Rekapitulasi Statistik Kontribusi Penulis di GitHub</i></p>
<div class="screenshot-placeholder">[Screenshot: Halaman commit history yang menampilkan daftar commit penulis beserta pesan commit dan tanggal]</div>
<p class="dcap">Gambar 3.8 &nbsp; Riwayat Commit Penulis di Repository</p>''')

    # III.3 Pencapaian
    p.append('''<h2>III.3 &nbsp; Pencapaian Hasil</h2>
<p>Berdasarkan pelaksanaan proyek yang telah dilakukan, berikut adalah pencapaian yang telah diraih:</p>
<ol>
<li><strong>Struktur Proyek Berhasil Disusun</strong> &mdash; Penulis berhasil menyusun seluruh struktur proyek dari awal, meliputi konfigurasi repository Git, pemilihan dan setup tech stack (Laravel 12, Next.js 15, Tailwind CSS), perancangan database komprehensif (CDM, PDM, ERD) yang terdiri dari 15 tabel, serta dokumentasi perancangan sistem menggunakan diagram UML.</li>
<li><strong>Fitur Cronjob Scheduled Publish Berfungsi</strong> &mdash; Fitur penjadwalan publikasi artikel berhasil diimplementasikan dan berjalan dengan baik. Cron job berhasil memproses artikel terjadwal secara otomatis setiap menit dan melakukan reindex search index.</li>
<li><strong>Fitur Manajemen User (CRUD) Berfungsi</strong> &mdash; Seluruh operasi CRUD untuk manajemen user oleh admin berhasil diimplementasikan: pembuatan user baru dengan auto-generate password dan pengiriman email kredensial, pengeditan data user dengan mekanisme revoke token otomatis saat perubahan role, serta penghapusan user dengan penanganan dampak.</li>
<li><strong>Integrasi dengan Sistem Keseluruhan</strong> &mdash; Kedua fitur telah terintegrasi dengan baik dalam ekosistem CMS. Fitur Scheduled Publish terintegrasi dengan editorial workflow, dan fitur Manajemen User terintegrasi dengan sistem autentikasi JWT serta kontrol akses berbasis peran.</li></ol>
<p>Dalam proses pelaksanaan, penulis juga memperoleh beberapa pengalaman berharga, antara lain pemahaman mendalam mengenai pola arsitektur Service-Repository, pengalaman merancang database dengan UUID sebagai primary key, pemahaman mengenai mekanisme cron job dan database transaction, serta pengalaman menangani edge case pada operasi CRUD.</p>''')

    # III.4 Testing
    p.append('''<h2>III.4 &nbsp; Hasil Testing</h2>
<p>Pada bagian ini disajikan hasil pengujian terhadap fitur-fitur yang telah diimplementasikan. Pengujian dilakukan untuk memastikan seluruh fitur berjalan sesuai spesifikasi yang telah ditetapkan. Berikut adalah tabel pengujian beserta dokumentasi screenshot hasil pengujian.</p>
<h3>III.4.1 &nbsp; Testing Cronjob Scheduled Publish</h3>
<table>
<tr><th>No</th><th>Skenario Pengujian</th><th>Langkah</th><th>Hasil yang Diharapkan</th><th>Screenshot</th></tr>
<tr><td>1</td><td>Jadwalkan artikel 5 menit ke depan</td><td>Buat artikel, set status = scheduled, atur waktu 5 menit ke depan</td><td>Artikel tersimpan dengan status scheduled</td><td></td></tr>
<tr><td>2</td><td>Tunggu cron job berjalan</td><td>Jalankan <code>php artisan articles:publish-scheduled</code> setelah waktu tiba</td><td>Command memproses artikel terjadwal</td><td></td></tr>
<tr><td>3</td><td>Verifikasi status artikel berubah</td><td>Cek status artikel di database setelah cron berjalan</td><td>Status berubah menjadi published, published_at terisi</td><td></td></tr>
<tr><td>4</td><td>Verifikasi search index ter-update</td><td>Cek tabel search_indexes untuk artikel yang baru published</td><td>Artikel muncul di search_indexes dengan search_vector yang benar</td><td></td></tr>
<tr><td>5</td><td>Jalankan cron saat tidak ada artikel</td><td>Jalankan command ketika tidak ada artikel terjadwal</td><td>Output: Tidak ada artikel yang perlu dipublish</td><td></td></tr>
<tr><td>6</td><td>Artikel dengan waktu > 5 menit</td><td>Jadwalkan artikel 10 menit ke depan, jalankan cron langsung</td><td>Artikel belum dipublish (belum waktunya)</td><td></td></tr>
</table>
<h3>III.4.2 &nbsp; Testing Manajemen User &mdash; Create</h3>
<table>
<tr><th>No</th><th>Skenario Pengujian</th><th>Langkah</th><th>Hasil yang Diharapkan</th><th>Screenshot</th></tr>
<tr><td>1</td><td>Buat user baru dengan data valid</td><td>Isi form: nama, email unik, role jurnalis, klik simpan</td><td>User berhasil dibuat, email kredensial terkirim</td><td></td></tr>
<tr><td>2</td><td>Buat user dengan email duplikat</td><td>Isi form dengan email yang sudah terdaftar</td><td>Tampil error: Email sudah terdaftar</td><td></td></tr>
<tr><td>3</td><td>Buat user tanpa isi nama</td><td>Kosongkan field nama, klik simpan</td><td>Tampil validasi: field nama wajib diisi</td><td></td></tr>
<tr><td>4</td><td>Buat user dengan role editor</td><td>Isi form lengkap, pilih role editor</td><td>User baru memiliki role editor</td><td></td></tr>
<tr><td>5</td><td>Verifikasi email terkirim</td><td>Cek inbox email user baru</td><td>Email berisi nama, email, password sementara, dan role</td><td></td></tr>
</table>
<h3>III.4.3 &nbsp; Testing Manajemen User &mdash; Update</h3>
<table>
<tr><th>No</th><th>Skenario Pengujian</th><th>Langkah</th><th>Hasil yang Diharapkan</th><th>Screenshot</th></tr>
<tr><td>1</td><td>Edit nama user</td><td>Ubah nama user, klik simpan</td><td>Nama berhasil diperbarui</td><td></td></tr>
<tr><td>2</td><td>Edit role user</td><td>Ubah role dari journalist ke editor</td><td>Role berubah, token user di-revoke (logout paksa)</td><td></td></tr>
<tr><td>3</td><td>Nonaktifkan user</td><td>Set is_active = false</td><td>User dinonaktifkan, tidak bisa login</td><td></td></tr>
<tr><td>4</td><td>Edit email ke email yang sudah ada</td><td>Ubah email ke email user lain</td><td>Tampil error: Email sudah terdaftar</td><td></td></tr>
<tr><td>5</td><td>Coba edit akun sendiri</td><td>Admin mencoba edit akunnya sendiri</td><td>Tampil error: Tidak dapat mengubah akun sendiri</td><td></td></tr>
</table>
<h3>III.4.4 &nbsp; Testing Manajemen User &mdash; Delete</h3>
<table>
<tr><th>No</th><th>Skenario Pengujian</th><th>Langkah</th><th>Hasil yang Diharapkan</th><th>Screenshot</th></tr>
<tr><td>1</td><td>Hapus user biasa</td><td>Pilih user, klik hapus, konfirmasi</td><td>User terhapus, artikel diarsipkan</td><td></td></tr>
<tr><td>2</td><td>Coba hapus akun sendiri</td><td>Admin mencoba hapus akunnya sendiri</td><td>Tampil error: Tidak dapat menghapus akun sendiri</td><td></td></tr>
<tr><td>3</td><td>Verifikasi artikel terarsipkan</td><td>Cek artikel milik user yang dihapus</td><td>Semua artikel berstatus archived</td><td></td></tr>
<tr><td>4</td><td>Verifikasi token di-revoke</td><td>Cek refresh_tokens user yang dihapus</td><td>Semua token sudah revoked</td><td></td></tr>
</table>
<h3>III.4.5 &nbsp; Testing Manajemen User &mdash; Read</h3>
<table>
<tr><th>No</th><th>Skenario Pengujian</th><th>Langkah</th><th>Hasil yang Diharapkan</th><th>Screenshot</th></tr>
<tr><td>1</td><td>Lihat daftar user</td><td>Buka halaman Pengguna sebagai admin</td><td>Tampil daftar seluruh user dengan nama, email, role, status</td><td></td></tr>
<tr><td>2</td><td>Lihat detail user</td><td>Klik salah satu user</td><td>Tampil detail informasi user</td><td></td></tr>
<tr><td>3</td><td>Akses tanpa role admin</td><td>Login sebagai journalist, akses /api/users</td><td>Akses ditolak (403 Forbidden)</td><td></td></tr>
</table>
<h3>III.4.6 &nbsp; Testing Pengiriman Email Kredensial</h3>
<table>
<tr><th>No</th><th>Skenario Pengujian</th><th>Langkah</th><th>Hasil yang Diharapkan</th><th>Screenshot</th></tr>
<tr><td>1</td><td>Email terkirim saat buat user baru</td><td>Admin membuat user baru dengan email valid</td><td>Email masuk ke inbox user baru berisi nama, email, password sementara, dan role</td><td></td></tr>
<tr><td>2</td><td>Isi email kredensial benar</td><td>Buka email yang diterima user baru</td><td>Password sementara sesuai yang digenerate sistem, role sesuai yang dipilih admin</td><td></td></tr>
<tr><td>3</td><td>Login dengan password sementara</td><td>Gunakan email dan password sementara dari email untuk login</td><td>Login berhasil, user masuk ke dashboard sesuai role</td><td></td></tr>
<tr><td>4</td><td>Ganti password setelah login pertama</td><td>Login dengan password sementara, buka menu Profil, ubah password</td><td>Password berhasil diubah, password lama tidak bisa digunakan lagi</td><td></td></tr>
</table>''')

    # III.4.7 Testing Database Transaction
    p.append('''<h3>III.4.7 &nbsp; Testing Database Transaction dan Konsistensi Data</h3>
<p>Pengujian database transaction dilakukan untuk memastikan bahwa operasi yang melibatkan beberapa tabel berjalan secara atomik dan konsisten. Pengujian ini berfokus pada fitur Scheduled Publish yang menggunakan <code>DB::transaction()</code>.</p>
<table>
<tr><th>No</th><th>Skenario Pengujian</th><th>Langkah</th><th>Hasil yang Diharapkan</th><th>Screenshot</th></tr>
<tr><td>1</td><td>Publish artikel &mdash; seluruh operasi berhasil</td><td>Jadwalkan artikel, tunggu cron berjalan, cek ketiga tabel</td><td>Status updated, is_published=true, search index terisi</td><td></td></tr>
<tr><td>2</td><td>Simulasi kegagalan reindex</td><td>Nonaktifkan tabel search_indexes sementara, jalankan cron</td><td>Transaction rollback, status artikel tetap scheduled</td><td></td></tr>
<tr><td>3</td><td>Publish multiple articles sekaligus</td><td>Jadwalkan 3 artikel pada waktu yang sama, jalankan cron</td><td>Ketiga artikel berhasil published secara bersamaan</td><td></td></tr>
<tr><td>4</td><td>Idempotensi &mdash; cron berjalan dua kali</td><td>Jalankan cron setelah artikel sudah published</td><td>Tidak ada perubahan data, output: 0 artikel</td><td></td></tr>
<tr><td>5</td><td>Konsistensi published_at timestamp</td><td>Cek kolom published_at setelah auto-publish</td><td>Timestamp sesuai waktu eksekusi cron, bukan waktu penjadwalan</td><td></td></tr>
</table>''')

    # III.4.8 Testing API dengan Postman
    p.append('''<h3>III.4.8 &nbsp; Testing API Endpoint dengan Postman</h3>
<p>Selain pengujian melalui antarmuka frontend, penulis juga melakukan pengujian langsung terhadap API endpoint menggunakan <strong>Postman</strong> untuk memverifikasi request dan response secara detail. Pengujian ini mencakup validasi status code, struktur response JSON, dan penanganan error.</p>
<table>
<tr><th>No</th><th>Endpoint</th><th>Skenario</th><th>Expected Response</th><th>Screenshot</th></tr>
<tr><td>1</td><td>POST /api/users</td><td>Kirim request dengan data valid</td><td>201 Created, body berisi id, name, email, role</td><td></td></tr>
<tr><td>2</td><td>POST /api/users</td><td>Kirim email yang sudah terdaftar</td><td>409 Conflict, error = EMAIL_ALREADY_EXISTS</td><td></td></tr>
<tr><td>3</td><td>PATCH /api/users/&#123;id&#125;</td><td>Ubah role user</td><td>200 OK, role berubah, token di-revoke</td><td></td></tr>
<tr><td>4</td><td>DELETE /api/users/&#123;id&#125;</td><td>Hapus user yang memiliki artikel</td><td>200 OK, artikel user berstatus archived</td><td></td></tr>
<tr><td>5</td><td>GET /api/users</td><td>Akses tanpa token JWT</td><td>401 Unauthorized</td><td></td></tr>
<tr><td>6</td><td>GET /api/users</td><td>Akses dengan role journalist</td><td>403 Forbidden</td><td></td></tr>
<tr><td>7</td><td>DELETE /api/users/&#123;self&#125;</td><td>Admin menghapus akun sendiri</td><td>403 CANNOT_MODIFY_SELF</td><td></td></tr>
<tr><td>8</td><td>PATCH /api/cms/articles/&#123;id&#125;/status</td><td>Set status=scheduled dengan waktu valid</td><td>200 OK, status berubah ke scheduled</td><td></td></tr>
</table>
<p>Pengujian menggunakan Postman memberikan visibilitas penuh terhadap request dan response HTTP, memungkinkan penulis memverifikasi bahwa setiap endpoint mengembalikan status code yang tepat, struktur JSON yang konsisten, dan pesan error yang informatif. Postman Collection yang berisi seluruh test case juga disimpan di repository untuk memudahkan pengujian regresi di masa depan.</p>''')

    # III.5 Rekognisi Mata Kuliah
    p.append('''<h2>III.5 &nbsp; Rekognisi Mata Kuliah</h2>
<p>Kegiatan Program Pembelajaran di Luar Kampus (PLK) yang dilaksanakan di PT. Ketik Media Siber telah memberikan pengalaman praktis yang relevan dengan beberapa mata kuliah yang telah atau sedang ditempuh oleh penulis di Program Studi Informatika. Berikut adalah penjabaran keterkaitan antara pekerjaan yang dilakukan selama magang dengan masing-masing mata kuliah yang direkognisi.</p>

<h3>1. Analisis Kebutuhan</h3>
<p>Mata kuliah <strong>Analisis Kebutuhan</strong> membahas teknik-teknik identifikasi, analisis, dan dokumentasi kebutuhan sistem perangkat lunak. Selama kegiatan magang, penulis menerapkan kompetensi dari mata kuliah ini secara langsung pada tahap awal pengembangan Sistem Portal Berita dan CMS Redaksi.</p>
<p>Penulis melakukan analisis kebutuhan sistem dengan mempelajari alur kerja redaksi PT. Ketik Media Siber secara menyeluruh, mulai dari proses penulisan berita oleh jurnalis, proses peninjauan dan persetujuan oleh editor, hingga proses publikasi artikel. Berdasarkan analisis tersebut, penulis mengidentifikasi dua kebutuhan fungsional utama yang menjadi tanggung jawab pengembangan, yaitu fitur <strong>penjadwalan publikasi artikel otomatis (scheduled publish)</strong> yang memungkinkan editor mengatur waktu tayang artikel dan sistem akan mempublikasikannya secara otomatis menggunakan cron job, serta fitur <strong>manajemen pengguna (user management)</strong> yang memungkinkan admin mengelola akun pengguna meliputi pembuatan, pengeditan, penonaktifan, dan penghapusan akun dengan kontrol akses berbasis role.</p>
<p>Selain itu, penulis juga melakukan analisis kebutuhan non-fungsional, seperti kebutuhan akan arsitektur sistem yang modular menggunakan pendekatan <i>decoupled architecture</i> dan <i>Service-Repository Pattern</i>, kebutuhan akan perancangan database yang komprehensif menggunakan CDM, PDM, dan ERD dengan 15 tabel, serta kebutuhan keamanan melalui mekanisme autentikasi JWT dan role-based access control. Hasil analisis kebutuhan kemudian didokumentasikan dalam bentuk diagram UML, meliputi <i>Sequence Diagram</i> untuk menggambarkan interaksi antar komponen sistem, <i>Activity Diagram</i> untuk menggambarkan alur proses secara sistematis, dan <i>Class Diagram</i> untuk menggambarkan struktur data dan relasi antar entitas.</p>

<h3>2. Pemrograman API</h3>
<p>Mata kuliah <strong>Pemrograman API</strong> membahas perancangan dan pengembangan Application Programming Interface (API) yang mengikuti standar RESTful, termasuk desain endpoint, penanganan request dan response, validasi data, serta mekanisme autentikasi. Kompetensi dari mata kuliah ini diterapkan secara intensif oleh penulis pada tahap pengembangan backend sistem.</p>
<p>Penulis membangun beberapa endpoint REST API menggunakan framework <strong>Laravel 12</strong> dengan menerapkan <i>Service-Repository Pattern</i> untuk memisahkan logika bisnis dari akses data. Untuk fitur scheduled publish, penulis membangun endpoint <code>PATCH /api/cms/articles/&#123;id&#125;/status</code> yang memungkinkan editor mengubah status artikel menjadi <code>scheduled</code> dengan menyertakan parameter <code>scheduled_at</code>. Penulis juga membangun <i>Artisan Command</i> (<code>articles:publish-scheduled</code>) yang dipicu oleh Laravel Task Scheduler setiap menit untuk memproses artikel yang sudah jatuh tempo, serta <code>ScheduledPublishService</code> yang berisi logika bisnis untuk mempublikasikan artikel secara otomatis dalam satu <i>database transaction</i>.</p>
<p>Untuk fitur manajemen user, penulis membangun operasi CRUD lengkap yang hanya dapat diakses oleh admin. Endpoint yang dikembangkan meliputi <code>POST /api/users</code> untuk membuat akun baru dengan <i>auto-generate password</i> 12 karakter dan pengiriman kredensial melalui email menggunakan <code>NewUserCredentials Mailable</code>, <code>PUT /api/users/&#123;id&#125;</code> untuk memperbarui data pengguna dengan mekanisme <i>revoke token</i> otomatis apabila terjadi perubahan role, <code>PATCH /api/users/&#123;id&#125;/deactivate</code> untuk menonaktifkan akun, serta <code>DELETE /api/users/&#123;id&#125;</code> untuk menghapus akun beserta pengarsipan seluruh artikel milik pengguna tersebut. Penulis juga merancang template email menggunakan <i>Blade template</i> (<code>emails.new-user-credentials</code>) yang berisi informasi kredensial akun (email, password sementara, dan role) serta peringatan agar user segera mengganti password setelah login pertama kali. Seluruh endpoint dilengkapi dengan middleware autentikasi JWT dan validasi role untuk memastikan keamanan akses.</p>

<h3>3. Uji Coba dan Implementasi</h3>
<p>Mata kuliah <strong>Uji Coba dan Implementasi</strong> membahas metodologi pengujian perangkat lunak, teknik implementasi sistem, serta strategi deployment. Kompetensi dari mata kuliah ini diterapkan oleh penulis pada tahap implementasi dan pengujian fitur-fitur sistem yang telah dikembangkan.</p>
<p>Pada tahap implementasi, penulis mengimplementasikan seluruh rancangan sistem ke dalam kode program menggunakan <strong>Laravel 12</strong> untuk backend dan <strong>Next.js 15</strong> untuk frontend CMS. Implementasi fitur scheduled publish mencakup pembangunan Artisan Command sebagai <i>entry point</i> cron job, ScheduledPublishService untuk menangani logika bisnis publikasi otomatis, serta konfigurasi Laravel Task Scheduler. Implementasi fitur manajemen user mencakup pembangunan UserController, UserService, dan UserRepository yang menangani seluruh operasi CRUD dengan penanganan edge case seperti validasi duplikasi email, pencegahan admin menghapus akun sendiri, serta pengarsipan artikel milik user yang dihapus.</p>
<p>Pada tahap uji coba, penulis melakukan pengujian fungsional terhadap seluruh fitur yang telah diimplementasikan. Pengujian fitur <strong>scheduled publish</strong> mencakup pengujian penjadwalan artikel dengan waktu lebih dari 5 menit ke depan, verifikasi perubahan status artikel secara otomatis oleh cron job ketika jadwal tiba, pengujian validasi waktu minimal penjadwalan, pengujian pembatalan jadwal, serta verifikasi pembaruan search index. Pengujian fitur <strong>manajemen user</strong> mencakup pengujian pembuatan user baru, validasi duplikasi email, verifikasi pengiriman email kredensial, pengujian pengeditan data termasuk perubahan role dan penonaktifan akun, pengujian penghapusan user beserta penanganan dampaknya terhadap data terkait, serta pengujian kontrol akses untuk memastikan hanya admin yang dapat mengakses fitur ini. Penulis juga melakukan pengujian khusus terhadap fitur <strong>pengiriman email</strong>, meliputi verifikasi email terkirim saat pembuatan user baru, validasi isi email kredensial (nama, email, password sementara, dan role), pengujian login menggunakan password sementara yang diterima melalui email, serta pengujian perubahan password setelah login pertama kali. Hasil pengujian menunjukkan bahwa seluruh fitur berfungsi sesuai spesifikasi yang telah ditetapkan pada tahap analisis kebutuhan.</p>''')

    # Bab IV Penutup
    p.append('''<div class="pb"></div>
<h1>BAB IV<br/>PENUTUP</h1>
<h2>IV.1 &nbsp; Kesimpulan</h2>
<p>Berdasarkan pelaksanaan Program Pembelajaran di Luar Kampus (PLK) yang telah dilakukan di PT. Ketik Media Siber, dapat ditarik beberapa kesimpulan sebagai berikut:</p>
<ol>
<li>Kegiatan magang memberikan pengalaman nyata dalam mengembangkan sistem portal berita dan CMS redaksi secara profesional, mulai dari tahap perancangan hingga implementasi fitur.</li>
<li>Penerapan arsitektur decoupled dengan Service-Repository Pattern terbukti efektif dalam membangun sistem yang modular, mudah dipelihara, dan dapat dikembangkan lebih lanjut.</li>
<li>Fitur cronjob scheduled publish berhasil diimplementasikan dengan baik menggunakan Artisan Command dan database transaction, memastikan artikel terpublikasi secara otomatis dan konsisten.</li>
<li>Fitur manajemen user (CRUD) berhasil menyediakan mekanisme pengelolaan pengguna yang aman, dilengkapi dengan auto-generate password, pengiriman email kredensial, dan penanganan dampak penghapusan user.</li>
<li>Perancangan database yang komprehensif menggunakan CDM, PDM, dan ERD menjadi fondasi penting yang menjamin integritas dan efisiensi data dalam sistem.</li></ol>
<h2>IV.2 &nbsp; Saran</h2>
<p class="ni">Beberapa saran yang dapat dipertimbangkan untuk pengembangan selanjutnya adalah:</p>
<ol>
<li>Penambahan fitur audit log untuk melacak seluruh perubahan yang dilakukan oleh admin pada sistem.</li>
<li>Implementasi soft delete pada tabel users untuk mempertahankan riwayat pengguna meskipun telah dihapus.</li>
<li>Penambahan fitur bulk action pada manajemen user untuk efisiensi pengelolaan pengguna dalam jumlah besar.</li>
<li>Pengembangan fitur notifikasi real-time untuk memberi tahu jurnalis ketika artikelnya dipublikasikan secara terjadwal.</li>
<li>Migrasi database dari SQLite ke PostgreSQL untuk mendukung skala produksi yang lebih besar.</li></ol>''')

    # Referensi
    p.append('''<div class="pb"></div>
<h1>Referensi</h1>
<p class="ni">[1] Laravel Documentation, &ldquo;Laravel 12 &mdash; The PHP Framework for Web Artisans,&rdquo; laravel.com, 2025.</p>
<p class="ni">[2] Next.js Documentation, &ldquo;Next.js by Vercel &mdash; The React Framework,&rdquo; nextjs.org, 2025.</p>
<p class="ni">[3] Tailwind CSS, &ldquo;Tailwind CSS &mdash; Rapidly build modern websites,&rdquo; tailwindcss.com, 2025.</p>
<p class="ni">[4] PHP Documentation, &ldquo;PHP Manual,&rdquo; php.net, 2025.</p>
<p class="ni">[5] TypeScript Documentation, &ldquo;TypeScript: JavaScript With Syntax For Types,&rdquo; typescriptlang.org, 2025.</p>''')

    # Lampiran A - Log Activity
    logs = [
        ('Minggu Ke-1 / 9-14 Feb 2026', 'Mengikuti hari pertama magang dengan sesi perkenalan bersama tim dan pembimbing lapangan, serta mendapatkan penjelasan mengenai sistem kerja dan agenda kegiatan selama magang. Mempelajari dasar-dasar penulisan berita, teknik foto jurnalistik, dan melakukan praktik liputan sederhana.', 'Memahami alur kerja dan pembagian tugas selama magang, serta memperoleh pengetahuan dasar mengenai penulisan berita dan teknik pengambilan foto jurnalistik.'),
        ('Minggu Ke-2 / 16-21 Feb 2026', 'Melakukan revisi berita berdasarkan arahan pembimbing, mempelajari tata cara upload artikel melalui CMS website, serta mulai menyusun berita profil dan berita harian bertema Ramadan.', 'Tulisan berita menjadi lebih rapi dan sesuai standar penulisan. Memahami proses publikasi berita melalui CMS serta mampu membuat dan mengunggah berita secara mandiri.'),
        ('Minggu Ke-3 / 23-28 Feb 2026', 'Melanjutkan penulisan dan penyempurnaan berita profil serta rutin membuat berita harian Ramadan sesuai target yang diberikan. Mengikuti pemaparan materi dari perwakilan DPRD Kota Malang.', 'Berita harian Ramadan berhasil diselesaikan sesuai target. Mendapat pengalaman lebih dalam mengenai proses produksi berita.'),
        ('Minggu Ke-4 / 2-7 Mar 2026', 'Mendapatkan pengarahan dari pembimbing IT mengenai proyek yang akan dikerjakan. Penjelasan mengenai penggunaan Git dan GitHub dalam dunia kerja.', 'Memahami dasar penggunaan Git dan GitHub serta mengetahui alur kerja kolaborasi proyek.'),
        ('Minggu Ke-5 / 9-14 Mar 2026', 'Mulai mengerjakan project website dengan melakukan penambahan data, mempelajari struktur halaman website, serta pengelolaan file project menggunakan GitHub.', 'Memahami proses input dan pengelolaan data pada website serta mulai terbiasa menggunakan GitHub.'),
        ('Minggu Ke-6 / 16-21 Mar 2026', 'Melanjutkan pengerjaan project website dengan pembaruan data, perbaikan tampilan, serta mempelajari workflow tim seperti pull request dan merge repository.', 'Menambah pemahaman mengenai workflow GitHub serta mampu melakukan pengelolaan data website dengan lebih terstruktur.'),
        ('Minggu Ke-7 / 23-28 Mar 2026', 'Membantu pengecekan dan revisi data yang telah diinput, serta memperbaiki kesalahan tampilan dan penulisan pada website.', 'Data website menjadi lebih lengkap dan rapi. Kemampuan revisi data dan perbaikan tampilan semakin meningkat.'),
        ('Minggu Ke-8 / 30 Mar-4 Apr 2026', 'Melanjutkan pengembangan dan pengelolaan website dengan menambahkan data baru, update konten, serta pengecekan hasil akhir project.', 'Memahami proses pengelolaan dan pengembangan website secara lebih detail.'),
        ('Minggu Ke-9 / 6-11 Apr 2026', 'Mulai merancang dan membuat UI/UX untuk website Klojen dengan membuat desain tampilan halaman beranda, daftar lokasi, detail tempat, serta navigasi website.', 'Berhasil membuat rancangan dan tampilan awal UI/UX website Klojen yang responsif dan user friendly.'),
        ('Minggu Ke-10 / 13-18 Apr 2026', 'Melakukan perancangan sistem menggunakan diagram UML (Use Case, Activity, Sequence, Class Diagram) serta perancangan database (ERD, CDM, PDM).', 'Berhasil menyusun dokumentasi perancangan sistem berupa diagram UML dan desain database.'),
        ('Minggu Ke-11 / 20-25 Apr 2026', 'Setup project website Klojen dengan menyiapkan tech stack (Laravel 12, Next.js 15, Tailwind CSS), konfigurasi struktur project, dan pembuatan layout dasar.', 'Project berhasil di-setup. Struktur awal project dan layout dasar website telah berhasil dibuat.'),
        ('Minggu Ke-12 / 27 Apr-2 Mei 2026', 'Pengembangan tampilan front-end berdasarkan desain UI/UX yang telah dibuat. Membuat halaman beranda, kategori, jelajah, dan detail.', 'Halaman beranda, kategori, jelajah, dan detail berhasil dikembangkan dengan tampilan yang terstruktur dan modern.'),
        ('Minggu Ke-13 / 4-9 Mei 2026', 'Melanjutkan pengembangan front-end dengan membuat fitur review, galeri foto, dan interaktivitas pada halaman detail.', 'Fitur review, galeri, dan interaktivitas berhasil dikembangkan.'),
        ('Minggu Ke-14 / 11-16 Mei 2026', 'Menyempurnaan halaman kategori, trending, serta perbaikan tampilan responsif berdasarkan evaluasi pembimbing.', 'Halaman kategori dan trending berhasil disempurnakan dengan tampilan yang responsif.'),
        ('Minggu Ke-15 / 18-23 Mei 2026', 'Perancangan dan pengembangan fitur baru menggunakan Figma. Mulai integrasi data dari API untuk menampilkan konten secara dinamis.', 'Desain fitur berhasil dibuat dan halaman website berhasil terhubung dengan API.'),
        ('Minggu Ke-16 / 25-30 Mei 2026', 'Pengembangan fitur pencarian, filter data, serta pengujian integrasi API dan perbaikan tampilan.', 'Fitur pencarian dan filter berhasil dikembangkan. Integrasi data berjalan dengan baik.'),
        ('Minggu Ke-17 / 1-6 Jun 2026', 'Penyempurnaan fitur website: memperbaiki bug, optimasi komponen, serta memperbaiki struktur kode.', 'Beberapa bug berhasil diperbaiki dan performa website menjadi lebih baik.'),
        ('Minggu Ke-18 / 8-13 Jun 2026', 'Testing fitur website, pengecekan responsivitas, serta penyesuaian data dan endpoint API.', 'Fitur website berhasil diuji dan berjalan dengan baik. Sistem menjadi lebih stabil.'),
        ('Minggu Ke-19 / 15-19 Jun 2026', 'Finalisasi project: pengecekan keseluruhan fitur, debugging, penyempurnaan tampilan, penyusunan dokumentasi, dan persiapan presentasi.', 'Project berhasil diselesaikan. Dokumentasi dan bahan presentasi berhasil disusun.'),
    ]
    tbl_rows = ''.join(f'<tr><td style="white-space:nowrap; font-weight:bold;">{m}</td><td>{k}</td><td>{h}</td><td></td></tr>' for m, k, h in logs)
    p.append(f'''<div class="pb"></div>
<h1>Lampiran A. Log Activity</h1>
<p class="ni">Berikut adalah log activity kegiatan selama mengikuti Program Magang Mandiri di PT. Ketik Media Siber:</p>
<table><tr><th style="width:18%;">Minggu/Tanggal</th><th style="width:38%;">Kegiatan</th><th style="width:30%;">Hasil</th><th style="width:14%;">Validasi<br/>Dosen Pembimbing</th></tr>{tbl_rows}</table>''')

def main():
    print('=== Rendering Diagrams ===')
    render_diagrams()
    print('\n=== Building HTML ===')
    parts, I, cs1, cs2, cs3, cs4, cs5, cs6, cs7, cs_route, cs_email = build_html()
    build_bab3(parts, I, cs1, cs2, cs3, cs4, cs5, cs6, cs7, cs_route, cs_email)
    html_content = '\n'.join(parts) + '\n</body></html>'
    html_path = os.path.join(PROJECT_ROOT, '_report_plk.html')
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f'HTML: {len(html_content):,} chars')
    print('\n=== Generating PDF ===')
    pdf_path = os.path.join(PROJECT_ROOT, 'Laporan_PLK_Farrel.pdf')
    cmd = [CHROME, '--headless', '--disable-gpu', '--allow-file-access-from-files',
           '--no-sandbox', f'--print-to-pdf={pdf_path}', '--print-to-pdf-no-header', html_path]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if result.returncode == 0 and os.path.exists(pdf_path):
        size_mb = os.path.getsize(pdf_path) / (1024 * 1024)
        print(f'\nPDF OK: {pdf_path}\nSize: {size_mb:.2f} MB')
    else:
        print(f'FAILED: {result.stderr}'); sys.exit(1)
    os.remove(html_path)
    print('Done!')

if __name__ == '__main__':
    main()

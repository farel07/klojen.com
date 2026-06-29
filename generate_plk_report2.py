import os, sys, subprocess, base64, urllib.request, time

PROJECT_ROOT = r'c:\apps\klojen.com'
DIAGRAM_DIR  = os.path.join(PROJECT_ROOT, 'diagrams_report2')
os.makedirs(DIAGRAM_DIR, exist_ok=True)
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
MERMAID_API = 'https://mermaid.ink/img/'

THEME_INIT = """%%{init: {'theme': 'default', 'themeCSS': 'text { fill: #000000 !important; } .nodeLabel { fill: #000000 !important; font-size: 16px !important; } .edgeLabel { fill: #000000 !important; font-size: 14px !important; } .node rect, .node circle, .node polygon { fill: #d6e4f5 !important; stroke: #333333 !important; stroke-width: 2px !important; }'} }%%\n"""

DIAGRAMS = {
    'act_create_article': THEME_INIT + """flowchart TD
    A([Buka halaman<br/>Tulis Berita]) --> B[Isi form:<br/>judul, konten,<br/>kategori, tag]
    B --> C{Upload<br/>gambar?}
    C -->|Ya| D[Upload + Crop<br/>gambar]
    C -->|Tidak| E{Klik Simpan}
    D --> E
    E -->|Draft| F[POST /cms/articles]
    E -->|Review| F
    F --> G{Slug<br/>terpakai?}
    G -->|Ya| H[Error: Slug<br/>sudah dipakai]
    H --> B
    G -->|Tidak| I[Simpan ke DB<br/>+ tags + revision]
    I --> J[Reindex search]
    J --> K([Berhasil])""",

    'act_edit_profile': THEME_INIT + """flowchart TD
    A([Buka halaman<br/>Edit Profile]) --> B[Load data user]
    B --> C[Tampilkan form:<br/>nama, email, foto]
    C --> D{Ubah<br/>foto?}
    D -->|Ya| E[Upload + Crop<br/>avatar]
    D -->|Tidak| F{Ubah nama<br/>atau email?}
    E --> F
    F -->|Ya| G[Update field]
    F -->|Tidak| H[Klik Simpan]
    G --> H
    H --> I[PUT /auth/profile]
    I --> J{Validasi<br/>OK?}
    J -->|Gagal| K[Error]
    K --> C
    J -->|OK| L[Update store<br/>+ redirect]
    L --> M([Selesai])""",

    'act_portal_berita': THEME_INIT + """flowchart TD
    A([Buka Beranda]) --> B[Fetch GET /beranda]
    B --> C[Tampilkan headline<br/>+ artikel terbaru]
    C --> D{Klik<br/>artikel?}
    D -->|Ya| E[Fetch GET /articles/slug]
    E --> F[Tampilkan detail<br/>artikel + terkait]
    F --> G([Selesai])
    D -->|Tidak| H{Klik<br/>kategori?}
    H -->|Ya| I[Fetch per kategori]
    I --> C
    H -->|Tidak| G""",
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

def img_tag(filename, max_width='500px'):
    path = os.path.join(DIAGRAM_DIR, filename)
    if not os.path.exists(path):
        return f'<p style="color:#999;"><i>Gambar tidak ditemukan: {filename}</i></p>'
    abs_path = os.path.abspath(path).replace('\\', '/')
    return f'<img src="file:///{abs_path}" style="max-width:{max_width}; max-height:650px; width:auto; display:block; margin:12px auto;" alt="{filename}"/>'

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
.dc { text-align: center; margin: 16px 0; page-break-inside: avoid; }
.dcap { font-size: 10pt; color: #555; margin-top: 6px; text-align: center; font-style: italic; }
.pb { page-break-before: always; }
.center { text-align: center; }'''

# === Code snippets ===
CS1 = '''// CmsArticleService::createArticle() - Membuat artikel baru
public function createArticle(int $authorId, array $data): array
{
    // 1. Tentukan slug (manual atau auto-generate dari judul)
    if (!empty($data['slug'])) {
        $slug = Str::slug($data['slug']);
        $this->assertSlugAvailable($slug);
    } else {
        $slug = $this->generateUniqueSlug($data['title']);
    }

    $articleId = (string) Str::uuid();

    // 2. Insert ke tabel articles dengan status draft
    DB::table('articles')->insert([
        'id' => $articleId, 'author_id' => $authorId,
        'category_id' => $data['category_id'] ?? null,
        'title' => $data['title'], 'slug' => $slug,
        'excerpt' => $data['excerpt'] ?? null,
        'content' => $data['content'],
        'featured_image_url' => $data['featured_image_url'] ?? null,
        'status' => 'draft', 'is_featured' => false,
        'view_count' => 0, 'created_at' => now(),
    ]);

    // 3. Simpan relasi tag
    $tagIds = $this->processTags($data['tags'] ?? []);
    if (!empty($tagIds)) {
        DB::table('article_tags')->insert(
            array_map(fn($tagId) => [
                'article_id' => $articleId, 'tag_id' => $tagId,
            ], $tagIds)
        );
    }

    // 4. Simpan revision pertama (audit trail)
    DB::table('article_revisions')->insert([
        'id' => (string) Str::uuid(),
        'article_id' => $articleId, 'edited_by' => $authorId,
        'title_snapshot' => $data['title'],
        'content_snapshot' => $data['content'],
        'change_note' => 'Artikel pertama kali dibuat.',
    ]);

    // 5. Reindex search
    $this->searchService->reindexArticle($articleId);

    return [ 'id' => $articleId, 'title' => $data['title'], ... ];
}'''

CS2 = '''// CmsArticleService::generateUniqueSlug() - Auto-generate slug unik
public function generateUniqueSlug(string $title): string
{
    $base = Str::slug($title);
    if ($base === '') {
        $base = 'artikel-' . now()->format('YmdHis');
    }

    $slug = $base;
    $counter = 2;

    // Loop sampai ketemu slug yang belum dipakai
    while (DB::table('articles')->where('slug', $slug)->exists()) {
        $slug = "{$base}-{$counter}";
        $counter++;
    }

    return $slug;
}'''

CS3 = '''// CmsArticleService::processTags() - Handle tag: buat kalau belum ada
private function processTags(array $tagNames): array
{
    $tagIds = [];
    foreach ($tagNames as $name) {
        $name = trim($name);
        if (empty($name)) continue;

        $slug = Str::slug($name);
        // firstOrCreate: cari berdasarkan slug, kalau belum ada buat baru
        $tag = Tag::firstOrCreate(
            ['slug' => $slug],
            ['name' => $name, 'id' => (string) Str::uuid()]
        );
        $tagIds[] = $tag->id;
    }
    return array_unique($tagIds);
}'''

CS4 = '''// AuthController::updateProfile() - Edit profil user
public function updateProfile(Request $request): JsonResponse
{
    $user = auth('api')->user();

    $validated = $request->validate([
        'name'   => 'required|string|max:255',
        'email'  => 'required|string|email|max:255|unique:users,email,' . $user->id,
        'avatar' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
    ]);

    // Handle upload avatar kalau ada
    if ($request->hasFile('avatar')) {
        // Hapus avatar lama dari storage
        if ($user->avatar_url) {
            $oldPath = str_replace(asset('storage/'), '', $user->avatar_url);
            Storage::disk('public')->delete($oldPath);
        }
        // Simpan avatar baru
        $path = $request->file('avatar')->store('avatars', 'public');
        $validated['avatar_url'] = asset('storage/' . $path);
    }

    unset($validated['avatar']);
    $user->update($validated);

    return response()->json([
        'status' => 'success',
        'message' => 'Profil berhasil diperbarui.',
        'data' => [ 'id' => $user->id, 'name' => $user->name, ... ],
    ]);
}'''

CS5 = '''// AuthController::changePassword() - Ubah password
public function changePassword(Request $request): JsonResponse
{
    $user = auth('api')->user();

    $validated = $request->validate([
        'current_password' => 'required|string',
        'new_password'     => 'required|string|min:8',
    ]);

    // Cek apakah password saat ini benar
    if (!Hash::check($validated['current_password'], $user->password)) {
        return response()->json([
            'status' => 'error',
            'message' => 'Password saat ini salah.',
        ], 422);
    }

    // Update password baru (auto-hash via model mutator)
    $user->update(['password' => $validated['new_password']]);

    return response()->json([
        'status' => 'success',
        'message' => 'Password berhasil diubah.',
    ]);
}'''

CS_ROUTE = '''// routes/api.php - Route untuk CMS Articles & Profile
Route::middleware('auth:api')->prefix('cms')->group(function () {
    Route::get('/articles',       [CmsArticleController::class, 'index']);
    Route::post('/articles',      [CmsArticleController::class, 'store']);
    Route::get('/articles/{id}',  [CmsArticleController::class, 'show']);
    Route::put('/articles/{id}',  [CmsArticleController::class, 'update']);
    Route::delete('/articles/{id}',[CmsArticleController::class, 'destroy']);
    Route::patch('/articles/{id}/status', [CmsArticleController::class, 'updateStatus']);
});

// Profile endpoints
Route::middleware('auth:api')->group(function () {
    Route::get('/auth/me',             [AuthController::class, 'me']);
    Route::put('/auth/profile',        [AuthController::class, 'updateProfile']);
    Route::put('/auth/change-password', [AuthController::class, 'changePassword']);
});'''

CS_FRONTEND = '''// frontend/lib/api/articles.ts - Fungsi untuk create & update artikel
export async function createArticle(data: CreateArticlePayload) {
  const res = await axiosInstance.post('/cms/articles', data);
  return res.data.data;
}

export async function updateArticle(id: string, data: UpdateArticlePayload) {
  const res = await axiosInstance.put(`/cms/articles/${id}`, data);
  return res.data.data;
}

export async function updateArticleStatus(
  id: string, status: string, scheduledAt?: string
) {
  const res = await axiosInstance.patch(`/cms/articles/${id}/status`, {
    status, scheduled_at: scheduledAt,
  });
  return res.data.data;
}'''

CS_AXIOS = '''// frontend/lib/axios.ts - Konfigurasi Axios Instance + Interceptor
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: sisipkan JWT token otomatis
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: tangani 401 dengan refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refresh_token: refreshToken }
        );
        const newToken = res.data.data.access_token;
        useAuthStore.getState().setToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;'''

CS_SEO = '''// frontend/app/(main)/[slug]/page.ts - Dynamic Metadata untuk SEO
export async function generateMetadata({ params }: Props): Promise&lt;Metadata&gt; {
  const { slug } = await params;
  const article = await fetchArticleForSeo(slug);

  if (!article) {
    return { title: "Artikel Tidak Ditemukan", robots: { index: false } };
  }

  const description = buildExcerpt(article.content);
  const canonicalUrl = `${siteUrl}/${slug}`;

  return {
    title: article.title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: article.title,
      description,
      url: canonicalUrl,
      type: "article",
      locale: "id_ID",
      publishedTime: article.published_at,
      images: [{ url: article.featured_image_url, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: article.title, description },
  };
}'''


def build_html():
    I = {}
    I['act_create'] = img_tag('act_create_article.png', '500px')
    I['act_profile'] = img_tag('act_edit_profile.png', '500px')
    I['act_portal'] = img_tag('act_portal_berita.png', '500px')

    parts = []

    # COVER
    parts.append(f'''<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"/>
<title>Laporan PLK</title>
<style>{CSS}</style></head><body>
<div class="cover">
<h1>LAPORAN AKHIR<br/>MAGANG MANDIRI</h1>
<div class="tm">Rancang Bangun Sistem Portal Berita dan<br/>Content Management System (CMS) Redaksi<br/>Di PT. Ketik Media Siber</div>
<p class="ni" style="font-size:10pt;">No. PKS: 308/UN63.7/IA-IF/2025</p><br/><br/>
<p class="ni" style="font-size:11pt;">Diajukan untuk memenuhi persyaratan kelulusan<br/>Program Magang Mandiri</p><br/>
<div style="margin:20px 0;"><p class="ni"><strong>oleh :</strong></p>
<p class="ni"><strong>[NAMA LENGKAP] &nbsp;/&nbsp; [NPM]</strong></p></div><br/><br/>
<p class="ni" style="font-weight:bold;">PROGRAM STUDI INFORMATIKA</p>
<p class="ni" style="font-weight:bold;">FAKULTAS ILMU KOMPUTER</p>
<p class="ni" style="font-weight:bold;">UNIVERSITAS PEMBANGUNAN NASIONAL &ldquo;VETERAN&rdquo; JAWA TIMUR</p>
<p class="ni" style="font-weight:bold;">2026</p></div>''')

    # LEMBAR PENGESAHAN
    parts.append('''<div class="pb"></div><h1>Lembar Pengesahan</h1>
<p class="ni center" style="font-weight:bold; font-size:13pt;">Rancang Bangun Sistem Portal Berita dan Content Management System (CMS) Redaksi</p>
<p class="ni center" style="margin-top:20px;">oleh :</p>
<p class="ni center"><strong>[NAMA LENGKAP] &nbsp;/&nbsp; [NPM]</strong></p>
<p class="ni center" style="margin-top:20px;">disetujui sebagai<br/>Laporan Magang Mandiri</p>
<br/><br/>
<table style="border:none; width:100%;"><tr style="border:none;">
<td style="border:none; width:50%;"></td>
<td style="border:none; width:50%;">Surabaya, Juni 2026<br/>Dosen Pembimbing<br/><br/><br/><br/>
<strong>Yoga Ari Tofan, S.Kom., M.Kom</strong><br/>NIP. 199302032025061004</td>
</tr></table>''')

    # ABSTRAKSI
    parts.append('''<div class="pb"></div><h1>Abstraksi</h1>
<p>Laporan ini disusun sebagai bentuk pertanggungjawaban atas pelaksanaan Program Pembelajaran di Luar Kampus (PLK) yang dilaksanakan di PT. Ketik Media Siber selama periode 9 Februari 2026 hingga 19 Juni 2026. Selama kegiatan magang, penulis terlibat dalam pengembangan Sistem Portal Berita dan Content Management System (CMS) Redaksi yang bertujuan membangun platform pengelolaan dan publikasi berita berbasis web secara modern dan terstruktur.</p>
<p>Lingkup pekerjaan yang dilaksanakan meliputi perancangan desain antarmuka (UI/UX) menggunakan Figma untuk halaman CMS editor, jurnalis, dan portal berita, pengembangan frontend menggunakan Next.js 15 dan Tailwind CSS serta integrasi dengan REST API, serta pengembangan backend untuk fitur pembuatan artikel dan pengelolaan profil pengguna menggunakan Laravel 12. Penulis juga menyusun dokumentasi perancangan sistem menggunakan Activity Diagram untuk masing-masing fitur yang dikembangkan.</p>
<p>Hasil dari kegiatan magang ini adalah sebuah sistem portal berita dan CMS redaksi yang berfungsi penuh, dilengkapi dengan antarmuka yang responsif dan integrasi API yang berjalan sesuai spesifikasi yang ditetapkan. Selain itu, penulis juga menyusun rekognisi mata kuliah yang mengaitkan pengalaman praktis selama magang dengan mata kuliah Analisis Kebutuhan, Pemrograman API, dan Uji Coba dan Implementasi.</p>
<p class="ni"><strong>Kata kunci:</strong> content management system, portal berita, UI/UX design, Next.js, Laravel, integrasi API.</p>''')

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
<p class="ni" style="text-align:right; margin-top:16px;">Surabaya, Juni 2026<br/><br/>Penulis<br/><strong>[NAMA LENGKAP]</strong><br/>NPM. [NPM]</p>''')

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
<tr style="border:none;"><td style="border:none;">&nbsp;&nbsp;&nbsp;III.3 Pencapaian Hasil</td><td style="border:none;">30</td></tr>
<tr style="border:none;"><td style="border:none;">&nbsp;&nbsp;&nbsp;III.4 Hasil Testing</td><td style="border:none;">32</td></tr>
<tr style="border:none;"><td style="border:none;">&nbsp;&nbsp;&nbsp;III.5 Rekognisi Mata Kuliah</td><td style="border:none;">38</td></tr>
<tr style="border:none;"><td style="border:none;"><strong>Bab IV &nbsp; Penutup</strong></td><td style="border:none;">41</td></tr>
<tr style="border:none;"><td style="border:none;">&nbsp;&nbsp;&nbsp;IV.1 Kesimpulan</td><td style="border:none;">41</td></tr>
<tr style="border:none;"><td style="border:none;">&nbsp;&nbsp;&nbsp;IV.2 Saran</td><td style="border:none;">42</td></tr>
<tr style="border:none;"><td style="border:none;">Referensi</td><td style="border:none;">43</td></tr>
<tr style="border:none;"><td style="border:none;"><strong>Lampiran A &nbsp; Log Activity</strong></td><td style="border:none;">44</td></tr>
</table>''')

    # BAB I
    parts.append('''<div class="pb"></div>
<h1>BAB I<br/>PENDAHULUAN</h1>
<h2>I.1 &nbsp; Latar Belakang</h2>
<p>Perkembangan teknologi digital telah mengubah cara masyarakat memperoleh dan mengakses informasi. Jika sebelumnya informasi banyak disebarkan melalui media cetak, kini berbagai berita dan informasi dapat diakses dengan cepat melalui platform berbasis web. Kondisi tersebut mendorong perusahaan media untuk memanfaatkan teknologi yang mampu mendukung pengelolaan serta publikasi konten secara lebih efektif dan efisien.</p>
<p>Program Pembelajaran di Luar Kampus (PLK) merupakan kegiatan yang memberikan kesempatan kepada mahasiswa untuk memperoleh pengalaman kerja secara langsung di dunia industri. Melalui program ini, mahasiswa dapat menerapkan ilmu yang telah dipelajari selama perkuliahan sekaligus memahami proses kerja profesional, baik dari sisi teknis maupun kerja sama dalam tim.</p>
<p>Dalam pelaksanaan PLK, penulis melaksanakan kegiatan magang di PT. Ketik Media Siber, sebuah perusahaan yang bergerak di bidang media digital. Selama kegiatan magang, penulis terlibat dalam pengembangan Sistem Portal Berita dan Content Management System (CMS) Redaksi yang digunakan untuk membantu proses pengelolaan dan publikasi berita pada platform digital.</p>
<p>Pada proyek tersebut, penulis berperan sebagai Software Development dengan tugas utama merancang desain antarmuka (UI/UX) menggunakan Figma, mengembangkan antarmuka frontend menggunakan Next.js dan Tailwind CSS, mengintegrasikan frontend dengan REST API, serta membangun beberapa endpoint backend menggunakan Laravel 12 untuk fitur pembuatan artikel dan pengelolaan profil pengguna.</p>
<h2>I.2 &nbsp; Lingkup</h2>
<p class="ni">Lingkup kegiatan Program Pembelajaran di Luar Kampus (PLK) yang dilaksanakan di PT. Ketik Media Siber berfokus pada pengembangan Sistem Portal Berita dan Content Management System (CMS) Redaksi. Selama kegiatan magang berlangsung, penulis terlibat dalam beberapa kegiatan yang berkaitan dengan pengembangan sistem, yaitu sebagai berikut:</p>
<ol>
<li><strong>Perancangan UI/UX</strong> &mdash; Merancang desain antarmuka pengguna menggunakan Figma untuk halaman CMS editor dan jurnalis (artikel, tulis berita, tinjauan artikel, preview berita, profil) serta halaman portal berita publik (beranda, detail artikel, kategori).</li>
<li><strong>Pengembangan Frontend</strong> &mdash; Mengimplementasikan desain UI/UX ke dalam kode menggunakan framework Next.js 15, TypeScript, dan Tailwind CSS. Melakukan integrasi dengan REST API backend untuk menampilkan dan mengelola data secara dinamis.</li>
<li><strong>Pengembangan Backend</strong> &mdash; Membangun endpoint API untuk fitur pembuatan artikel baru (<i>create article</i>) dan pengelolaan profil pengguna (<i>edit profile</i> dan <i>change password</i>) menggunakan framework Laravel 12.</li></ol>
<h2>I.3 &nbsp; Tujuan</h2>
<p>Program Pembelajaran di Luar Kampus (PLK) yang dilaksanakan di PT. Ketik Media Siber bertujuan untuk memberikan kesempatan kepada mahasiswa dalam mengenal lingkungan kerja secara langsung sekaligus mengaplikasikan pengetahuan yang telah diperoleh selama masa perkuliahan. Adapun tujuan pelaksanaan kegiatan PLK ini adalah sebagai berikut:</p>
<ol>
<li>Menambah pemahaman mengenai pengembangan aplikasi web yang digunakan pada lingkungan kerja profesional.</li>
<li>Meningkatkan keterampilan dalam merancang dan membangun antarmuka pengguna yang responsif dan mudah digunakan.</li>
<li>Memperdalam pemahaman mengenai integrasi antara frontend dan backend melalui REST API.</li>
<li>Memahami proses kolaborasi antar tim dalam pengembangan dan pemeliharaan sistem informasi.</li>
<li>Melatih kemampuan dalam menyelesaikan permasalahan teknis yang muncul selama proses pengembangan aplikasi.</li>
<li>Memahami alur pengelolaan konten dan publikasi berita melalui sistem yang digunakan oleh perusahaan media digital.</li>
<li>Mengembangkan kemampuan komunikasi, tanggung jawab, serta profesionalisme dalam lingkungan kerja.</li>
<li>Memperoleh pengalaman dan wawasan yang dapat mendukung persiapan karir di bidang teknologi informasi.</li></ol>''')

    # BAB II
    parts.append('''<div class="pb"></div>
<h1>BAB II<br/>ORGANISASI ATAU LINGKUNGAN ORGANISASI MITRA PLK</h1>
<h2>II.1 &nbsp; Struktur Organisasi</h2>
<p>PT. Ketik Media Siber memiliki struktur organisasi yang terdiri atas beberapa divisi yang saling mendukung dalam menjalankan kegiatan operasional perusahaan. Setiap divisi memiliki peran dan tanggung jawab masing-masing, mulai dari pengelolaan media digital, pengembangan bisnis, administrasi perusahaan, hingga pengembangan teknologi informasi.</p>
<p>Dalam pelaksanaan Program Pembelajaran di Luar Kampus (PLK), penulis ditempatkan pada Divisi Teknologi yang berada di bawah koordinasi Chief Technology Officer (CTO). Divisi ini bertanggung jawab dalam pengembangan, pemeliharaan, dan pengelolaan sistem digital yang digunakan untuk mendukung proses bisnis perusahaan.</p>
<p>Selama kegiatan magang, penulis berperan sebagai Software Development pada proyek Sistem Portal Berita dan Content Management System (CMS) Redaksi. Penulis terlibat dalam berbagai aktivitas pengembangan sistem, seperti perancangan UI/UX, implementasi frontend, integrasi API, serta pengembangan backend.</p>
<h2>II.2 &nbsp; Lingkup Pekerjaan</h2>
<p>Divisi Teknologi di PT. Ketik Media Siber bertanggung jawab atas pengembangan dan pemeliharaan seluruh produk digital perusahaan. Lingkup pekerjaan divisi ini mencakup perancangan arsitektur sistem, pengembangan frontend dan backend, pengelolaan database dan infrastruktur server, serta pemeliharaan dan peningkatan kualitas produk digital yang telah diluncurkan. Dalam konteks proyek Sistem Portal Berita dan CMS Redaksi, penulis bekerja sama dengan mentor dan tim IT untuk mengembangkan fitur-fitur yang dibutuhkan oleh redaksi.</p>
<h2>II.3 &nbsp; Deskripsi Pekerjaan</h2>
<p>Selama pelaksanaan Program Magang Mandiri di PT. Ketik Media Siber, penulis terlibat secara langsung dalam pengembangan Sistem Portal Berita dan Content Management System (CMS) Redaksi. Kegiatan yang dilaksanakan mencakup keseluruhan siklus pengembangan perangkat lunak, mulai dari tahap perencanaan hingga pengujian. Berikut adalah tahapan-tahapan pekerjaan yang dilakukan:</p>

<h3>1. Perencanaan dan Analisis Kebutuhan</h3>
<p>Pada tahap ini, penulis melakukan identifikasi dan analisis kebutuhan sistem yang akan dibangun. Penulis mempelajari alur kerja redaksi PT. Ketik Media Siber secara menyeluruh, mulai dari proses penulisan berita oleh jurnalis, proses peninjauan dan persetujuan oleh editor, hingga proses publikasi artikel. Penulis juga menganalisis kebutuhan tampilan antarmuka untuk masing-masing role pengguna (jurnalis, editor, admin) serta halaman portal berita yang akan diakses oleh pembaca umum. Berdasarkan analisis tersebut, penulis mengidentifikasi tiga area utama yang menjadi tanggung jawab pengembangan, yaitu perancangan UI/UX, pengembangan frontend, dan pengembangan backend untuk fitur pembuatan artikel dan pengelolaan profil.</p>

<h3>2. Perencanaan Struktur Aplikasi</h3>
<p>Pada tahap perencanaan struktur, penulis merancang desain antarmuka pengguna menggunakan Figma. Desain yang dibuat mencakup halaman-halaman CMS untuk role editor dan jurnalis, seperti halaman daftar artikel, tulis berita, tinjauan artikel, preview berita, dan profil pengguna. Selain itu, penulis juga merancang desain halaman portal berita yang面向 publik, meliputi halaman beranda, detail artikel, dan halaman kategori. Desain UI/UX yang telah dibuat kemudian dijadikan acuan untuk tahap implementasi frontend. Penulis juga mempelajari arsitektur backend yang menggunakan pola Service-Repository Pattern agar proses integrasi API dapat dilakukan dengan lancar.</p>

<h3>3. Implementasi</h3>
<p>Pada tahap implementasi, penulis melakukan pengembangan di tiga area utama. Pertama, <strong>implementasi frontend CMS</strong> menggunakan Next.js 15 dan Tailwind CSS berdasarkan desain Figma yang telah dibuat. Halaman-halaman yang dikembangkan meliputi halaman daftar artikel dengan filter dan pencarian, halaman tulis berita dengan rich text editor dan fitur upload gambar, halaman tinjauan artikel untuk editor, halaman preview berita untuk melihat tampilan artikel sebelum publish, serta halaman profil dan edit profil. Seluruh halaman frontend diintegrasikan dengan REST API backend menggunakan Axios.</p>
<p>Kedua, <strong>implementasi frontend portal berita</strong> yang面向 publik, meliputi halaman beranda dengan headline dan artikel terbaru, halaman detail artikel dengan konten lengkap dan artikel terkait, serta halaman kategori untuk menampilkan artikel berdasarkan topik tertentu. Halaman portal berita menggunakan Server-Side Rendering (SSR) dan Incremental Static Regeneration (ISR) untuk optimasi SEO.</p>
<p>Ketiga, <strong>implementasi backend</strong> untuk fitur pembuatan artikel dan pengelolaan profil. Pada fitur pembuatan artikel, penulis membangun endpoint yang menangani validasi input, auto-generate slug dari judul, penyimpanan relasi tag, serta pencatatan revision history. Pada fitur profil, penulis membangun endpoint untuk update profil (nama, email, avatar) dan ubah password dengan validasi password lama.</p>

<h3>4. Uji Coba</h3>
<p>Pada tahap uji coba, penulis melakukan pengujian terhadap seluruh fitur yang telah diimplementasikan untuk memastikan sistem berjalan sesuai spesifikasi yang telah ditetapkan. Pengujian mencakup pengujian pembuatan artikel baru (termasuk validasi slug, upload gambar, dan penyimpanan tag), pengujian edit profil (termasuk crop avatar dan validasi email), pengujian tampilan frontend pada berbagai ukuran layar (responsivitas), serta pengujian integrasi API untuk memastikan data dari backend tampil dengan benar di frontend. Hasil pengujian menunjukkan bahwa seluruh fitur berfungsi dengan baik dan sesuai dengan kebutuhan yang telah dianalisis pada tahap perencanaan.</p>
<h2>II.4 &nbsp; Jadwal Kerja</h2>
<p>Program Pembelajaran di Luar Kampus (PLK) dilaksanakan di PT. Ketik Media Siber selama kurang lebih empat bulan sepuluh hari, dimulai pada 9 Februari 2026 dan berakhir pada 19 Juni 2026. Kegiatan magang dilaksanakan enam hari dalam satu minggu, yaitu Senin hingga Sabtu. Jam kerja pada hari Senin sampai Jumat berlangsung pukul 09.00&ndash;17.00 WIB, sedangkan pada hari Sabtu pukul 09.00&ndash;13.00 WIB.</p>
<table>
<tr><th>Minggu</th><th>Periode</th><th>Kegiatan</th><th>Jam</th></tr>
<tr><td>Minggu 1-3</td><td>9 Feb &ndash; 28 Feb 2026</td><td>Pengenalan perusahaan, pelatihan jurnalistik, penulisan dan publikasi berita, serta pemahaman alur kerja redaksi.</td><td>132</td></tr>
<tr><td>Minggu 4-8</td><td>2 Mar &ndash; 4 Apr 2026</td><td>Pengenalan proyek, Git dan GitHub, pengelolaan data website, serta pembelajaran workflow pengembangan sistem.</td><td>220</td></tr>
<tr><td>Minggu 9-10</td><td>6 Apr &ndash; 18 Apr 2026</td><td>Perancangan UI/UX menggunakan Figma dan dokumentasi perancangan sistem.</td><td>88</td></tr>
<tr><td>Minggu 11-14</td><td>20 Apr &ndash; 16 Mei 2026</td><td>Setup project dan pengembangan frontend berdasarkan desain UI/UX yang telah dibuat.</td><td>176</td></tr>
<tr><td>Minggu 15-16</td><td>18 Mei &ndash; 30 Mei 2026</td><td>Integrasi API, pengembangan backend fitur artikel dan profil, serta penyempurnaan tampilan.</td><td>88</td></tr>
<tr><td>Minggu 17-18</td><td>1 Jun &ndash; 13 Jun 2026</td><td>Optimasi sistem, perbaikan bug, dan pengujian website.</td><td>88</td></tr>
<tr><td>Minggu 19</td><td>15 Jun &ndash; 19 Jun 2026</td><td>Finalisasi proyek, penyusunan dokumentasi, dan persiapan presentasi hasil magang.</td><td>36</td></tr>
</table>
<p class="ni center"><i>Tabel 1. Jadwal Kerja Program Magang Mandiri</i></p>''')

    # === BAB III ===
    return parts, I

def build_bab3(parts, I):
    p = parts
    p.append(f'''<div class="pb"></div>
<h1>BAB III<br/>RANCANG BANGUN SISTEM PORTAL BERITA DAN CMS REDAKSI</h1>
<h2>III.1 &nbsp; Deskripsi Persoalan</h2>
<p>PT. Ketik Media Siber merupakan perusahaan yang bergerak di bidang media digital dan mengelola portal berita Klojen.com. Sebelum adanya sistem baru, proses pengelolaan konten berita dilakukan secara manual dengan alur kerja yang kurang terstruktur. Para jurnalis menulis berita, kemudian menyerahkan draf kepada editor melalui komunikasi informal, dan editor melakukan proses publikasi secara langsung tanpa sistem pelacakan revisi yang memadai. Kondisi ini menyebabkan beberapa permasalahan, antara lain: kesulitan dalam melacak riwayat perubahan artikel, antarmuka yang kurang intuitif bagi jurnalis dan editor, serta tidak adanya sistem pencarian yang efisien.</p>
<p>Berdasarkan permasalahan tersebut, penulis ditugaskan untuk melakukan pengembangan Sistem Portal Berita dan Content Management System (CMS) Redaksi. Sistem yang dikembangkan harus memenuhi kebutuhan berikut:</p>
<ol>
<li><strong>Perancangan UI/UX</strong> &mdash; merancang desain antarmuka yang intuitif dan responsif untuk halaman CMS editor, jurnalis, dan portal berita menggunakan Figma.</li>
<li><strong>Pengembangan Frontend</strong> &mdash; mengimplementasikan desain UI/UX ke dalam kode menggunakan Next.js 15, TypeScript, dan Tailwind CSS, serta melakukan integrasi dengan REST API backend.</li>
<li><strong>Pengembangan Backend</strong> &mdash; membangun endpoint API untuk fitur pembuatan artikel baru dan pengelolaan profil pengguna menggunakan Laravel 12.</li></ol>
<h2>III.2 &nbsp; Proses Pelaksanaan</h2>''')

    # III.2.1 UI/UX Design
    p.append('''<h3>III.2.1 &nbsp; Perancangan UI/UX dengan Figma</h3>
<p>Tahap pertama dalam pelaksanaan proyek adalah merancang desain antarmuka pengguna menggunakan Figma. Penulis bertanggung jawab dalam merancang tampilan untuk dua bagian utama sistem, yaitu <strong>CMS (Content Management System)</strong> untuk pengguna internal (jurnalis dan editor) dan <strong>portal berita</strong> untuk pembaca umum.</p>
<p>Untuk bagian CMS, halaman-halaman yang dirancang meliputi:</p>
<ul>
<li><strong>Daftar Artikel</strong> &mdash; halaman yang menampilkan seluruh artikel dalam bentuk card dengan fitur pencarian, filter berdasarkan status dan kategori, serta pagination.</li>
<li><strong>Tulis Berita</strong> &mdash; halaman untuk membuat artikel baru, dilengkapi dengan rich text editor, upload gambar dengan fitur crop, penambahan tag, pemilihan kategori, dan opsi simpan sebagai draft, kirim review, atau publish langsung.</li>
<li><strong>Tinjauan Artikel</strong> &mdash; halaman untuk editor yang menampilkan artikel yang menunggu review, dengan opsi approve, reject, atau publish.</li>
<li><strong>Preview Berita</strong> &mdash; halaman untuk melihat tampilan artikel sebelum dipublikasikan, menampilkan konten lengkap beserta gambar, tag, dan metadata artikel dalam format yang menyerupai tampilan portal berita publik.</li>
<li><strong>Profil &amp; Edit Profil</strong> &mdash; halaman untuk melihat dan mengubah data profil pengguna, termasuk nama, email, dan foto profil dengan fitur crop.</li>
</ul>
<p>Untuk bagian portal berita, halaman-halaman yang dirancang meliputi:</p>
<ul>
<li><strong>Beranda</strong> &mdash; halaman utama portal berita yang menampilkan headline, artikel terbaru, dan artikel berdasarkan kategori.</li>
<li><strong>Detail Artikel</strong> &mdash; halaman yang menampilkan konten artikel lengkap dengan gambar, tag, informasi penulis, dan artikel terkait.</li>
<li><strong>Halaman Kategori</strong> &mdash; halaman yang menampilkan daftar artikel berdasarkan kategori tertentu.</li>
</ul>
<p>Seluruh desain dibuat dengan memperhatikan prinsip <i>responsive design</i> agar tampilan tetap optimal pada berbagai ukuran layar, baik desktop maupun mobile. Desain juga mengikuti guideline modern dengan penggunaan warna yang konsisten, tipografi yang mudah dibaca, dan navigasi yang intuitif.</p>''')

    # III.2.2 Frontend CMS
    p.append(f'''<h3>III.2.2 &nbsp; Pengembangan Frontend CMS dan Integrasi API</h3>
<p>Setelah desain UI/UX selesai dibuat, tahap selanjutnya adalah mengimplementasikan desain ke dalam kode menggunakan framework <strong>Next.js 15</strong> dengan bahasa pemrograman TypeScript dan framework CSS <strong>Tailwind CSS</strong>. Penulis mengembangkan seluruh halaman CMS yang telah dirancang sebelumnya dan melakukan integrasi dengan REST API backend menggunakan library <code>Axios</code>.</p>
<p>Salah satu halaman utama yang dikembangkan adalah halaman <strong>Tulis Berita</strong>. Halaman ini memiliki fitur rich text editor untuk menulis konten artikel, upload gambar dengan crop, penambahan tag dinamis, dan pemilihan kategori. Berikut adalah potongan kode fungsi API yang digunakan untuk membuat dan mengupdate artikel:</p>
{cb(CS_FRONTEND, 'TypeScript')}
{cap('Potongan kode 1. Fungsi API frontend untuk create dan update artikel.')}
<p>Pada potongan kode di atas, fungsi <code>createArticle()</code> digunakan untuk mengirim data artikel baru ke backend melalui endpoint <code>POST /api/cms/articles</code>. Fungsi <code>updateArticle()</code> digunakan untuk mengupdate artikel yang sudah ada, dan <code>updateArticleStatus()</code> digunakan untuk mengubah status artikel (misalnya dari draft ke review, atau ke published). Semua fungsi ini menggunakan <code>axiosInstance</code> yang sudah dikonfigurasi dengan base URL dan token JWT otomatis.</p>
<p>Halaman lain yang dikembangkan meliputi halaman daftar artikel dengan fitur filter dan pencarian, halaman tinjauan artikel untuk editor, halaman preview berita untuk melihat tampilan artikel sebelum publish, serta halaman edit profil dengan fitur crop avatar menggunakan library react-easy-crop.</p>
<p>Berikut adalah Activity Diagram yang menggambarkan alur penggunaan fitur Tulis Berita:</p>
<div class="dc">{I['act_create']}<p class="dcap">Gambar 3.1 &nbsp; Activity Diagram &mdash; Fitur Tulis Berita (Create Article)</p></div>
<p>Activity Diagram di atas menggambarkan alur lengkap jurnalis atau editor dalam membuat artikel baru, mulai dari mengisi form, upload dan crop gambar, hingga menyimpan artikel ke database melalui API.</p>''')

    # III.2.3 Frontend Portal Berita
    p.append(f'''<h3>III.2.3 &nbsp; Pengembangan Frontend Portal Berita</h3>
<p>Selain halaman CMS, penulis juga mengembangkan frontend untuk <strong>portal berita</strong> yang面向 pembaca umum. Portal berita ini dibangun menggunakan Next.js 15 dengan memanfaatkan fitur <strong>Server-Side Rendering (SSR)</strong> dan <strong>Incremental Static Regeneration (ISR)</strong> untuk optimasi SEO. Halaman-halaman yang dikembangkan meliputi:</p>
<ul>
<li><strong>Halaman Beranda</strong> (<code>/</code>) &mdash; menampilkan headline, artikel terbaru, dan artikel berdasarkan kategori. Data di-fetch dari endpoint <code>GET /api/beranda</code>.</li>
<li><strong>Halaman Detail Artikel</strong> (<code>/[slug]</code>) &mdash; menampilkan konten artikel lengkap dengan metadata SEO yang di-generate secara dinamis. Data di-fetch dari endpoint <code>GET /api/articles/&#123;slug&#125;</code> dengan ISR (revalidasi setiap 60 detik).</li>
<li><strong>Halaman Kategori</strong> (<code>/kategori/[slug]</code>) &mdash; menampilkan daftar artikel berdasarkan kategori tertentu.</li>
</ul>
<p>Salah satu aspek penting dalam pengembangan portal berita adalah optimasi SEO. Setiap halaman artikel memiliki metadata dinamis yang di-generate dari data artikel, termasuk title, description, Open Graph tags, dan canonical URL. Berikut adalah Activity Diagram yang menggambarkan alur portal berita:</p>
<div class="dc">{I['act_portal']}<p class="dcap">Gambar 3.2 &nbsp; Activity Diagram &mdash; Portal Berita</p></div>
<p>Activity Diagram di atas menggambarkan alur pengunjung portal berita mulai dari halaman beranda, membaca artikel, hingga menjelajahi artikel berdasarkan kategori.</p>''')

    # III.2.4 Backend - Create Article
    p.append(f'''<h3>III.2.4 &nbsp; Implementasi Backend &mdash; Fitur Buat Artikel</h3>
<p>Penulis juga bertanggung jawab dalam pengembangan backend untuk fitur <strong>pembuatan artikel baru</strong>. Backend dibangun menggunakan framework <strong>Laravel 12</strong> dengan pola <i>Service-Repository Pattern</i>. Endpoint utama untuk fitur ini adalah <code>POST /api/cms/articles</code> yang ditangani oleh <code>CmsArticleController::store()</code> dan logika bisnisnya diurus oleh <code>CmsArticleService::createArticle()</code>.</p>
<p>Berikut adalah potongan kode utama untuk membuat artikel baru:</p>
{cb(CS1)}
{cap('Potongan kode 2. Method createArticle() pada CmsArticleService.')}
<p>Di method <code>createArticle()</code> ini, pertama sistem tentukan dulu slug untuk artikel. Kalau user ngirim slug manual, sistem validasi apakah slug itu sudah terpakai atau belum. Kalau tidak ngirim slug, sistem auto-generate slug dari judul artikel. Proses auto-generate ini menggunakan method <code>generateUniqueSlug()</code> yang akan ngecek ke database dan nambahin suffix (-2, -3, dst.) kalau slugnya sudah ada yang pakai.</p>
<p>Setelah slug ditentukan, sistem insert data artikel ke tabel <code>articles</code> dengan status awal <code>draft</code>. Kemudian sistem proses tag-tag yang dikirim &mdash; kalau ada tag yang belum ada di database, tag itu langsung dibuat otomatis menggunakan method <code>firstOrCreate()</code>. Setelah itu, sistem simpan revision pertama sebagai audit trail, dan terakhir reindex artikel ke search index biar langsung bisa dicari.</p>
<p>Berikut adalah potongan kode untuk auto-generate slug:</p>
{cb(CS2)}
{cap('Potongan kode 3. Method generateUniqueSlug() untuk auto-generate slug unik dari judul.')}
<p>Method <code>generateUniqueSlug()</code> ini cara kerjanya sederhana: pertama ubah judul jadi format slug menggunakan <code>Str::slug()</code> (misalnya "Kabinet Baru 2026!" jadi "kabinet-baru-2026"). Terus cek di database apakah slug itu sudah ada yang pakai. Kalau sudah ada, tambahin angka di belakangnya (-2, -3, dst.) sampai ketemu yang masih kosong.</p>
<p>Berikut adalah potongan kode untuk handle tag:</p>
{cb(CS3)}
{cap('Potongan kode 4. Method processTags() untuk menangani tag artikel.')}
<p>Method <code>processTags()</code> ini digunakan untuk memproses array nama tag yang dikirim dari frontend. Untuk setiap tag, sistem cari berdasarkan slug-nya menggunakan <code>firstOrCreate()</code>. Kalau tag sudah ada di database, pakai yang sudah ada. Kalau belum ada, buat baru dengan UUID sebagai ID-nya. Hasilnya adalah array UUID tag yang siap di-insert ke tabel relasi <code>article_tags</code>.</p>''')

    # III.2.5 Backend - Edit Profile
    p.append(f'''<h3>III.2.5 &nbsp; Implementasi Backend &mdash; Fitur Edit Profil</h3>
<p>Selain fitur artikel, penulis juga mengembangkan backend untuk fitur <strong>pengelolaan profil pengguna</strong>. Fitur ini mencakup update profil (nama, email, dan avatar) serta ubah password. Endpoint-nya dilindungi oleh middleware <code>auth:api</code> sehingga hanya bisa diakses oleh user yang sudah login.</p>
<p>Berikut adalah potongan kode untuk update profil:</p>
{cb(CS4)}
{cap('Potongan kode 5. Method updateProfile() pada AuthController.')}
<p>Method <code>updateProfile()</code> ini menangani update data profil user yang sedang login. Pertama, sistem validasi input &mdash; nama dan email wajib diisi, dan email harus unik (tidak boleh sama dengan user lain, kecuali email sendiri). Kalau user upload file avatar baru, sistem hapus avatar lama dari storage dan simpan yang baru. Avatar disimpan di folder <code>avatars</code> pada disk public. Setelah semua validasi lolos, sistem update data user dan return response berisi data terbaru.</p>
<p>Berikut adalah potongan kode untuk ubah password:</p>
{cb(CS5)}
{cap('Potongan kode 6. Method changePassword() pada AuthController.')}
<p>Method <code>changePassword()</code> ini digunakan untuk mengubah password user. Pertama, sistem cek apakah password saat ini yang diinput user benar dengan menggunakan <code>Hash::check()</code>. Kalau salah, langsung return error. Kalau benar, sistem update password baru ke database. Password otomatis di-hash oleh Laravel melalui model mutator, jadi tidak disimpan dalam bentuk plain text.</p>
<p>Berikut adalah Activity Diagram yang menggambarkan alur fitur Edit Profil:</p>
<div class="dc">{I['act_profile']}<p class="dcap">Gambar 3.3 &nbsp; Activity Diagram &mdash; Edit Profil</p></div>
<p>Activity Diagram di atas menggambarkan alur user dalam mengedit profil, mulai dari load data, ubah foto dengan crop, update field, hingga save ke backend.</p>''')

    # III.2.6 API Documentation
    p.append(f'''<h3>III.2.6 &nbsp; Dokumentasi API Endpoint</h3>
<p>Seluruh fitur yang dikembangkan diekspos melalui REST API yang dapat diakses oleh frontend. Berikut adalah dokumentasi API endpoint untuk fitur-fitur yang diimplementasikan oleh penulis.</p>
<h4>A. CMS Articles (Editor, Journalist, Admin)</h4>
<p>Endpoint berikut dilindungi oleh middleware <code>auth:api</code> dan memerlukan role journalist, editor, atau admin.</p>
{cb(CS_ROUTE, 'PHP')}
{cap('Potongan kode 7. Definisi route API untuk CMS Articles dan Profile.')}
<table>
<tr><th>No</th><th>Method</th><th>Endpoint</th><th>Deskripsi</th></tr>
<tr><td>1</td><td>GET</td><td>/api/cms/articles</td><td>Mengambil daftar artikel CMS (journalist: hanya milik sendiri, editor/admin: semua)</td></tr>
<tr><td>2</td><td>POST</td><td>/api/cms/articles</td><td>Membuat artikel baru dengan status draft</td></tr>
<tr><td>3</td><td>GET</td><td>/api/cms/articles/&#123;id&#125;</td><td>Mengambil detail satu artikel</td></tr>
<tr><td>4</td><td>PUT</td><td>/api/cms/articles/&#123;id&#125;</td><td>Mengupdate data artikel (judul, konten, kategori, tag, gambar)</td></tr>
<tr><td>5</td><td>DELETE</td><td>/api/cms/articles/&#123;id&#125;</td><td>Menghapus artikel (hanya status draft)</td></tr>
<tr><td>6</td><td>PATCH</td><td>/api/cms/articles/&#123;id&#125;/status</td><td>Mengubah status artikel (draft, review, published, scheduled)</td></tr>
</table>
<p>Berikut adalah detail request dan response untuk endpoint utama:</p>
<table>
<tr><th>Endpoint</th><th>Request Body</th><th>Response Success</th><th>Response Error</th></tr>
<tr><td>POST /api/cms/articles</td><td>title (required), content (required), category_id, slug, excerpt, featured_image_url, tags (array), change_note</td><td>201 Created + data artikel</td><td>403 FORBIDDEN_ROLE, 409 SLUG_ALREADY_EXISTS, 422 Validation error</td></tr>
<tr><td>PUT /api/cms/articles/&#123;id&#125;</td><td>title?, content?, category_id?, slug?, excerpt?, featured_image_url?, tags?, change_note?</td><td>200 OK + data artikel</td><td>403 FORBIDDEN_OWNERSHIP, 404 NOT_FOUND, 409 SLUG_ALREADY_EXISTS</td></tr>
</table>
<h4>B. Profile Management</h4>
<p>Endpoint berikut dilindungi oleh middleware <code>auth:api</code> dan dapat diakses oleh semua user yang sudah login.</p>
<table>
<tr><th>No</th><th>Method</th><th>Endpoint</th><th>Deskripsi</th></tr>
<tr><td>1</td><td>GET</td><td>/api/auth/me</td><td>Mengambil data profil user yang sedang login</td></tr>
<tr><td>2</td><td>PUT</td><td>/api/auth/profile</td><td>Mengupdate profil (nama, email, avatar)</td></tr>
<tr><td>3</td><td>PUT</td><td>/api/auth/change-password</td><td>Mengubah password user</td></tr>
</table>
<table>
<tr><th>Endpoint</th><th>Request Body</th><th>Response Success</th><th>Response Error</th></tr>
<tr><td>PUT /api/auth/profile</td><td>name (required), email (required, unique), avatar (file, optional, max 2MB)</td><td>200 OK + data user</td><td>422 Validation error (email duplikat)</td></tr>
<tr><td>PUT /api/auth/change-password</td><td>current_password (required), new_password (required, min 8 char)</td><td>200 OK + pesan berhasil</td><td>422 Password saat ini salah</td></tr>
</table>
<h4>C. Portal Berita (Public)</h4>
<table>
<tr><th>No</th><th>Method</th><th>Endpoint</th><th>Deskripsi</th></tr>
<tr><td>1</td><td>GET</td><td>/api/beranda</td><td>Mengambil data halaman beranda (headline, artikel terbaru)</td></tr>
<tr><td>2</td><td>GET</td><td>/api/articles</td><td>Mengambil daftar artikel publik dengan pagination</td></tr>
<tr><td>3</td><td>GET</td><td>/api/articles/&#123;slug&#125;</td><td>Mengambil detail artikel berdasarkan slug</td></tr>
<tr><td>4</td><td>GET</td><td>/api/categories</td><td>Mengambil daftar kategori berita</td></tr>
</table>''')

    # III.2.7 ERD & Arsitektur
    p.append('''<h3>III.2.7 &nbsp; Perancangan Desain Sistem (ERD dan Arsitektur)</h3>
<p>Sebelum tahap implementasi dimulai, penulis melakukan perancangan desain sistem yang meliputi perancangan database dan arsitektur aplikasi. Perancangan database dilakukan dengan membuat Entity Relationship Diagram (ERD) yang menggambarkan relasi antar entitas utama dalam sistem. Entitas-entitas tersebut meliputi: <strong>users</strong> (penyimpan data pengguna dengan role dan is_active), <strong>articles</strong> (penyimpan artikel dengan slug, status, dan view_count), <strong>categories</strong> (penyimpan kategori berita dengan relasi parent-child), <strong>tags</strong> (penyimpan tag artikel), <strong>article_tags</strong> (tabel relasi many-to-many antara artikel dan tag), <strong>comments</strong> (penyimpan komentar dengan parent_id untuk nested comment), <strong>bookmarks</strong> (penyimpan artikel favorit pembaca), dan <strong>article_revisions</strong> (penyimpan riwayat perubahan artikel sebagai audit trail).</p>
<p>Relasi antar entitas dirancang menggunakan foreign key constraint dengan strategi cascade delete yang sesuai. Misalnya, ketika sebuah artikel dihapus, seluruh komentar dan bookmark terkait juga ikut terhapus. Sebaliknya, ketika seorang user dihapus, artikel miliknya tidak dihapus melainkan diarsipkan (status berubah menjadi archived) untuk menjaga integritas konten historis. Tabel article_revisions menyimpan snapshot judul dan konten sebelum setiap perubahan dilakukan, beserta identitas editor yang melakukan perubahan dan timestamp perubahan tersebut.</p>
<p>Perancangan arsitektur sistem menggunakan pendekatan <strong>decoupled architecture</strong> yang memisahkan backend (Laravel 12) dan frontend (Next.js 15) menjadi dua aplikasi independen. Backend mengekspos RESTful API yang dikonsumsi oleh frontend melalui HTTP request. Komunikasi antara frontend dan backend dilindungi menggunakan mekanisme autentikasi JSON Web Token (JWT), di mana setiap request dari frontend menyertakan Bearer token pada header Authorization. Pendekatan ini memberikan beberapa keuntungan: (1) tim backend dan frontend dapat bekerja secara paralel tanpa saling mengganggu, (2) API yang sama dapat dikonsumsi oleh berbagai client termasuk aplikasi mobile di masa depan, dan (3) penggantian teknologi di salah satu sisi tidak mempengaruhi sisi lain selama kontrak API tetap sama.</p>''')

    # III.2.8 Komponen Reusable Frontend
    p.append('''<h3>III.2.8 &nbsp; Implementasi Komponen Reusable Frontend</h3>
<p>Selain mengembangkan halaman-halaman utama, penulis juga membangun beberapa komponen reusable yang digunakan secara konsisten di seluruh aplikasi. Komponen-komponen ini dirancang untuk meningkatkan maintainability kode dan konsistensi tampilan antar halaman. Berikut adalah komponen-komponen utama yang dikembangkan:</p>
<p><strong>Rich Text Editor</strong> &mdash; Komponen editor untuk menulis konten artikel pada halaman Tulis Berita. Editor ini menggunakan library berbasis React yang mendukung format teks bold, italic, heading, list, link, dan penyisipan gambar. Konten yang dihasilkan berupa HTML string yang langsung disimpan ke database. Penulis mengintegrasikan editor dengan toolbar kustom yang sesuai dengan kebutuhan redaksi, termasuk opsi untuk menyisipkan gambar dari media library atau upload baru.</p>
<p><strong>Image Cropper</strong> &mdash; Komponen untuk memotong gambar sebelum diupload, digunakan pada fitur upload gambar artikel dan upload avatar profil. Komponen ini dibangun menggunakan library <code>react-easy-crop</code> yang menyediakan antarmuka crop interaktif dengan aspek rasio yang dapat dikontrol. Setelah pengguna mengatur area crop, komponen menghasilkan Blob gambar yang kemudian dikirim ke backend melalui FormData. Pendekatan ini memastikan gambar yang disimpan di server sudah memiliki dimensi yang sesuai dan mengurangi beban pemrosesan di sisi server.</p>
<p><strong>Skeleton Loading</strong> &mdash; Komponen placeholder yang ditampilkan saat data sedang dimuat dari API. Skeleton ini menggunakan animasi <code>animate-pulse</code> dari Tailwind CSS untuk memberikan indikasi visual bahwa konten sedang loading. Setiap halaman memiliki skeleton yang disesuaikan dengan layout kontennya &mdash; misalnya skeleton untuk card artikel berbeda dengan skeleton untuk list horizontal. Penggunaan skeleton loading meningkatkan perceived performance karena pengguna tidak melihat layar kosong saat menunggu data.</p>
<p><strong>Toast Notification</strong> &mdash; Komponen notifikasi popup yang muncul di pojok kanan atas layar untuk memberikan feedback kepada pengguna setelah melakukan aksi (berhasil membuat artikel, gagal upload, dll.). Toast dibuat tanpa library eksternal menggunakan React state dan <code>setTimeout</code> untuk auto-dismiss setelah 4 detik. Setiap toast memiliki tipe (success, error, warning) yang menentukan warna latar belakangnya.</p>
<p><strong>Modal Konfirmasi</strong> &mdash; Komponen dialog popup yang digunakan untuk meminta konfirmasi pengguna sebelum melakukan aksi destruktif seperti menghapus komentar atau menonaktifkan akun. Modal ini dilengkapi dengan backdrop blur, animasi fade-in, dan dua tombol aksi (konfirmasi dan batal).</p>''')

    # III.2.9 Axios Interceptor & JWT
    p.append(f'''<h3>III.2.9 &nbsp; Integrasi Axios Interceptor dan JWT Management</h3>
<p>Integrasi antara frontend Next.js dan backend Laravel dilakukan menggunakan library <strong>Axios</strong> dengan konfigurasi khusus yang menangani autentikasi JWT secara otomatis. Penulis membangun sebuah Axios instance yang dilengkapi dengan dua interceptor: request interceptor dan response interceptor.</p>
{cb(CS_AXIOS, 'TypeScript')}
{cap('Potongan kode 8. Konfigurasi Axios Instance dengan Interceptor untuk JWT Management.')}
<p><strong>Request Interceptor</strong> bertugas menyisipkan JWT access token secara otomatis ke setiap request API. Token diambil dari Zustand store (<code>useAuthStore</code>) dan disisipkan ke header Authorization dengan format <code>Bearer &lt;token&gt;</code>. Dengan pendekatan ini, developer tidak perlu menyertakan token secara manual di setiap pemanggilan API.</p>
<p><strong>Response Interceptor</strong> bertugas menangani kasus ketika access token sudah kedaluwarsa (response 401). Ketika menerima response 401, interceptor secara otomatis melakukan refresh token menggunakan refresh token yang tersimpan, kemudian mengulangi request awal dengan access token yang baru. Jika refresh token juga gagal (misalnya sudah kedaluwarsa atau di-revoke), pengguna otomatis di-logout dan diarahkan ke halaman login. Mekanisme ini memastikan pengalaman pengguna yang seamless tanpa perlu login ulang setiap kali token kedaluwarsa.</p>
<p>State autentikasi dikelola menggunakan <strong>Zustand</strong> sebagai state management library. Zustand dipilih karena bundle size yang kecil dan API yang sederhana. Store menyimpan access token, refresh token, data user (id, name, role), dan status autentikasi. Fungsi-fungsi seperti <code>setToken()</code>, <code>login()</code>, dan <code>logout()</code> disediakan untuk mengelola siklus hidup autentikasi.</p>''')

    # III.2.10 Optimasi SEO
    p.append(f'''<h3>III.2.10 &nbsp; Implementasi Optimasi SEO pada Portal Berita</h3>
<p>Portal berita Klojen.com menerapkan beberapa strategi optimasi Search Engine Optimization (SEO) untuk memastikan konten berita terindeks oleh mesin pencari dengan baik. Penulis mengimplementasikan strategi ini secara langsung di sisi frontend menggunakan fitur-fitur Next.js 15.</p>
<p><strong>Dynamic Metadata Generation</strong> &mdash; Setiap halaman artikel detail memiliki metadata yang di-generate secara dinamis dari data artikel menggunakan fungsi <code>generateMetadata()</code> dari Next.js App Router. Fungsi ini dijalankan di sisi server sebelum HTML dikirim ke browser, sehingga crawler mesin pencari langsung mendapatkan metadata yang lengkap tanpa perlu mengeksekusi JavaScript.</p>
{cb(CS_SEO, 'TypeScript')}
{cap('Potongan kode 9. Fungsi generateMetadata untuk SEO dinamis pada halaman artikel.')}
<p><strong>Incremental Static Regeneration (ISR)</strong> &mdash; Halaman artikel menggunakan ISR dengan parameter <code>revalidate: 60</code>, yang berarti halaman di-cache selama 60 detik dan diregenerasi secara background ketika ada request baru. Pendekatan ini memberikan keseimbangan antara performa (halaman di-serve dari cache) dan kesegaran data (cache diperbarui setiap 60 detik).</p>
<p><strong>JSON-LD Structured Data</strong> &mdash; Setiap halaman artikel menyisipkan JSON-LD bertipe <code>NewsArticle</code> yang mencakup headline, datePublished, author, publisher, dan articleSection. Structured data ini membantu Google memahami bahwa halaman tersebut adalah artikel berita, sehingga berpotensi ditampilkan sebagai rich snippet di hasil pencarian. Selain itu, halaman beranda juga menyisipkan JSON-LD bertipe <code>WebSite</code> dengan <code>SearchAction</code> untuk mengaktifkan sitelinks search box di Google.</p>
<p><strong>Sitemap Generation</strong> &mdash; File <code>sitemap.xml</code> di-generate secara dinamis menggunakan Next.js Metadata API. Sitemap mengambil data artikel dan kategori dari API backend dengan revalidasi setiap 1 jam, kemudian menghasilkan URL entries untuk halaman statis, halaman kategori, dan seluruh halaman artikel. Selain sitemap reguler, penulis juga mengimplementasikan <strong>News Sitemap</strong> khusus untuk Google News yang hanya mencakup artikel yang dipublikasikan dalam 48 jam terakhir.</p>''')

    # III.2.11 Service-Repository Pattern
    p.append('''<h3>III.2.11 &nbsp; Implementasi Service-Repository Pattern di Backend</h3>
<p>Backend sistem dibangun menggunakan framework Laravel 12 dengan menerapkan pola arsitektur <strong>Service-Repository Pattern</strong>. Pola ini memisahkan logika bisnis (service layer) dari operasi akses data (repository layer), sehingga menghasilkan kode yang lebih modular, testable, dan mudah dipelihara.</p>
<p><strong>Controller Layer</strong> hanya bertanggung jawab menangani HTTP request dan response, termasuk validasi input menggunakan Laravel Validation dan formatting response JSON. Controller tidak mengandung logika bisnis apapun &mdash; seluruh logika didelegasikan ke service layer.</p>
<p><strong>Service Layer</strong> berisi seluruh logika bisnis dan orkestrasi antar komponen. Sebagai contoh, <code>CmsArticleService::createArticle()</code> mengoordinasikan beberapa operasi: penentuan slug (manual atau auto-generate), insert data artikel ke database, pemrosesan relasi tag menggunakan <code>firstOrCreate()</code>, penyimpanan revision history, dan reindex artikel ke search index. Semua operasi ini dibungkus dalam satu method service yang dipanggil oleh controller.</p>
<p><strong>Repository Layer</strong> menangani query database dan pemetaan objek. Repository menyediakan method-method seperti <code>findById()</code>, <code>getFiltered()</code>, dan <code>archiveUserArticles()</code> yang mengabstraksi detail query database. Pemisahan ini memudahkan penggantian implementasi repository (misalnya dari Eloquent ke Query Builder) tanpa mempengaruhi service layer.</p>
<p>Penerapan Service-Repository Pattern ini juga memudahkan pengujian unit karena setiap layer dapat diuji secara independen. Service layer dapat diuji dengan mocking repository, dan repository dapat diuji langsung terhadap database tanpa perlu melibatkan controller.</p>''')

    # III.2.12 UI/UX Design System
    p.append('''<h3>III.2.12 &nbsp; Perancangan UI/UX &mdash; Design System dan Wireframe</h3>
<p>Perancangan UI/UX menggunakan Figma dilakukan dengan pendekatan design system yang memastikan konsistensi visual antar halaman. Penulis menetapkan beberapa design tokens yang menjadi fondasi visual aplikasi:</p>
<ul>
<li><strong>Color Palette</strong> &mdash; Warna primer menggunakan <code>#363259</code> (deep purple) untuk elemen utama CMS, <code>#152A4A</code> (dark navy) untuk teks heading, dan palet warna semantik (<code>#69c77e</code> untuk success, <code>#ef6e6e</code> untuk error, <code>#f59e0b</code> untuk warning). Warna-warna ini dipilih untuk memberikan kontras yang memadai (memenuhi standar WCAG AA) sekaligus menjaga estetika modern.</li>
<li><strong>Typography</strong> &mdash; Menggunakan font family Inter untuk UI dan system font untuk konten artikel. Ukuran font heading berkisar dari <code>text-sm</code> (14px) hingga <code>text-4xl</code> (36px) dengan weight bold untuk heading dan regular untuk body text.</li>
<li><strong>Spacing &amp; Border Radius</strong> &mdash; Menggunakan spacing scale dari Tailwind CSS (4px base unit) dan border radius konsisten <code>rounded-xl</code> (12px) untuk card dan <code>rounded-2xl</code> (16px) untuk container besar.</li>
<li><strong>Component States</strong> &mdash; Setiap komponen interaktif dirancang dengan state default, hover, focus, active, dan disabled untuk memberikan feedback visual yang jelas kepada pengguna.</li>
</ul>
<p>Proses perancangan dimulai dari wireframe low-fidelity yang berfokus pada layout dan alur navigasi, kemudian dilanjutkan dengan high-fidelity mockup yang menerapkan design system. Setiap halaman dirancang dalam dua breakpoint: desktop (1440px) dan mobile (375px) untuk memastikan responsivitas. Penulis juga merancang komponen-komponen Figma yang reusable (button, input field, card, modal) sehingga dapat digunakan secara konsisten di seluruh halaman.</p>''')

    # III.2.13 Optimasi Performa Frontend
    p.append('''<h3>III.2.13 &nbsp; Optimasi Performa Frontend</h3>
<p>Penulis menerapkan beberapa teknik optimasi performa pada frontend untuk memastikan aplikasi berjalan dengan cepat dan responsif. Teknik-teknik yang diterapkan meliputi:</p>
<p><strong>Image Optimization</strong> &mdash; Seluruh gambar pada portal berita menggunakan komponen <code>next/image</code> dari Next.js yang secara otomatis melakukan optimasi gambar termasuk lazy loading, responsive sizing, dan format modern (WebP/AVIF). Untuk gambar yang tidak memerlukan optimasi Next.js (seperti gambar dari URL eksternal), digunakan atribut <code>unoptimized</code> dengan tetap memanfaatkan fitur lazy loading.</p>
<p><strong>Skeleton Loading States</strong> &mdash; Seperti yang telah dijelaskan pada bagian III.2.8, setiap halaman yang melakukan fetching data dilengkapi dengan skeleton loading yang sesuai dengan layout kontennya. Skeleton ini menggunakan animasi <code>animate-pulse</code> dari Tailwind CSS yang sangat ringan dan tidak mempengaruhi performa rendering.</p>
<p><strong>Code Splitting</strong> &mdash; Next.js App Router secara otomatis melakukan code splitting berdasarkan rute, sehingga setiap halaman hanya memuat kode JavaScript yang diperlukan. Komponen-komponen yang hanya digunakan di sisi client ditandai dengan directive <code>&#39;use client&#39;</code> dan di-load secara terpisah dari komponen server-side.</p>
<p><strong>Tailwind CSS Purge</strong> &mdash; Tailwind CSS secara otomatis menghapus class CSS yang tidak digunakan pada proses build production, menghasilkan file CSS yang sangat kecil. Penulis juga memanfaatkan fitur <code>@apply</code> untuk mengelompokkan class yang sering digunakan bersama ke dalam custom utility class.</p>
<p><strong>Axios Request Deduplication</strong> &mdash; Pada halaman detail artikel yang menggunakan ISR, Next.js secara otomatis melakukan deduplikasi request API yang sama dalam satu render cycle. Jika beberapa komponen memanggil endpoint yang sama, hanya satu request yang benar-benar dikirim ke server.</p>''')

    # III.2.14 Git & GitHub
    p.append('''<h3>III.2.14 &nbsp; Kolaborasi Tim menggunakan Git dan GitHub</h3>
<p>Selama kegiatan magang, penulis menggunakan <strong>Git</strong> sebagai version control system dan <strong>GitHub</strong> sebagai platform kolaborasi untuk mengelola kode sumber proyek. Penulis mempelajari dan menerapkan workflow kolaborasi yang umum digunakan di lingkungan profesional:</p>
<p><strong>Branching Strategy</strong> &mdash; Proyek menggunakan strategi branching sederhana di mana branch <code>main</code> menyimpan kode yang stabil dan siap deploy. Setiap fitur atau perbaikan dikerjakan di branch terpisah yang dinamai sesuai konvensi (misalnya <code>feature/create-article</code> atau <code>fix/slug-duplikat</code>). Setelah fitur selesai dikembangkan dan diuji, branch tersebut di-merge ke branch <code>main</code> melalui pull request.</p>
<p><strong>Pull Request dan Code Review</strong> &mdash; Setiap perubahan kode diajukan melalui pull request (PR) yang kemudian direview oleh mentor atau anggota tim lainnya sebelum di-merge. Proses review mencakup pemeriksaan kualitas kode, kesesuaian dengan konvensi penulisan, potensi bug, dan dampak terhadap fitur lain. Penulis memperoleh banyak masukan berharga dari proses review ini, termasuk best practices penulisan kode TypeScript, penggunaan error handling yang tepat, dan optimasi performa komponen React.</p>
<p><strong>Merge Conflict Resolution</strong> &mdash; Selama kolaborasi, penulis beberapa kali menghadapi merge conflict ketika dua developer mengubah file yang sama secara bersamaan. Penulis belajar menyelesaikan conflict ini dengan memahami kedua perubahan, memilih versi yang paling tepat, atau menggabungkan keduanya jika diperlukan. Pengalaman ini meningkatkan kemampuan penulis dalam bekerja secara kolaboratif pada proyek berskala tim.</p>
<p><strong>Commit Convention</strong> &mdash; Penulis mengikuti konvensi commit message yang deskriptif untuk memudahkan pelacakan perubahan. Setiap commit message menjelaskan apa yang diubah dan mengapa, bukan hanya bagaimana. Pendekatan ini memudahkan proses debugging dan pemahaman sejarah perubahan kode di kemudian hari.</p>''')

    # III.3 Pencapaian
    p.append('''<h2>III.3 &nbsp; Pencapaian Hasil</h2>
<p>Berdasarkan pelaksanaan proyek yang telah dilakukan, berikut adalah pencapaian yang telah diraih:</p>
<ol>
<li><strong>Desain UI/UX Berhasil Dirancang</strong> &mdash; Penulis berhasil merancang seluruh desain antarmuka menggunakan Figma untuk halaman CMS editor, jurnalis, dan portal berita. Desain mencakup halaman daftar artikel, tulis berita, tinjauan artikel, preview berita, profil, beranda portal berita, detail artikel, dan halaman kategori.</li>
<li><strong>Frontend CMS Berfungsi Penuh</strong> &mdash; Seluruh halaman CMS berhasil diimplementasikan menggunakan Next.js 15 dan Tailwind CSS sesuai desain yang telah dibuat, dan berhasil diintegrasikan dengan REST API backend. Fitur yang berfungsi meliputi pembuatan artikel dengan rich text editor, upload dan crop gambar, filter dan pencarian artikel, tinjauan artikel, serta pengelolaan profil.</li>
<li><strong>Frontend Portal Berita Berfungsi</strong> &mdash; Halaman portal berita berhasil diimplementasikan dengan SSR dan ISR untuk optimasi SEO. Halaman beranda, detail artikel, dan kategori berjalan dengan baik dan menampilkan data dari API secara dinamis.</li>
<li><strong>Backend Fitur Artikel dan Profil Berfungsi</strong> &mdash; Endpoint API untuk pembuatan artikel baru dan pengelolaan profil berhasil diimplementasikan menggunakan Laravel 12. Fitur auto-generate slug, penyimpanan tag, revision history, upload avatar, dan validasi password berjalan sesuai spesifikasi.</li>
<li><strong>Integrasi Frontend-Backend Berhasil</strong> &mdash; Seluruh halaman frontend berhasil terhubung dengan backend melalui REST API. Data dari backend ditampilkan secara dinamis di frontend, dan operasi CRUD dari frontend berhasil diproses oleh backend dengan benar.</li></ol>
<p>Dalam proses pelaksanaan, penulis juga memperoleh beberapa pengalaman berharga, antara lain pemahaman mendalam mengenai framework Next.js 15 dan fitur SSR/ISR, pengalaman merancang UI/UX yang responsif menggunakan Figma, pemahaman mengenai integrasi REST API menggunakan Axios, serta pengalaman menangani upload file dan image cropping di frontend.</p>''')

    # III.4 Testing
    p.append('''<h2>III.4 &nbsp; Hasil Testing</h2>
<p>Pada bagian ini disajikan hasil pengujian terhadap fitur-fitur yang telah diimplementasikan. Pengujian dilakukan untuk memastikan seluruh fitur berjalan sesuai spesifikasi yang telah ditetapkan. Berikut adalah tabel pengujian beserta dokumentasi screenshot hasil pengujian.</p>
<h3>III.4.1 &nbsp; Testing Buat Artikel (Create Article)</h3>
<table>
<tr><th>No</th><th>Skenario Pengujian</th><th>Langkah</th><th>Hasil yang Diharapkan</th><th>Screenshot</th></tr>
<tr><td>1</td><td>Buat artikel dengan data lengkap</td><td>Isi judul, konten, kategori, gambar, tag, klik Simpan Draft</td><td>Artikel tersimpan dengan status draft, redirect ke halaman Artikel</td><td></td></tr>
<tr><td>2</td><td>Buat artikel tanpa slug</td><td>Isi judul dan konten, kosongkan slug, klik Simpan</td><td>Slug auto-generate dari judul</td><td></td></tr>
<tr><td>3</td><td>Buat artikel dengan slug duplikat</td><td>Isi slug yang sudah dipakai artikel lain</td><td>Tampil error: Slug sudah digunakan</td><td></td></tr>
<tr><td>4</td><td>Upload dan crop gambar</td><td>Klik upload, pilih gambar, atur crop, klik Terapkan</td><td>Gambar berhasil di-crop dan tampil di preview</td><td></td></tr>
<tr><td>5</td><td>Tambah beberapa tag</td><td>Ketik nama tag dan tekan Enter beberapa kali</td><td>Tag-tag muncul dalam bentuk chip/badge</td><td></td></tr>
<tr><td>6</td><td>Kirim artikel ke review</td><td>Isi form lengkap, klik Kirim Review</td><td>Status artikel berubah menjadi review</td><td></td></tr>
</table>
<h3>III.4.2 &nbsp; Testing Edit Profil</h3>
<table>
<tr><th>No</th><th>Skenario Pengujian</th><th>Langkah</th><th>Hasil yang Diharapkan</th><th>Screenshot</th></tr>
<tr><td>1</td><td>Update nama</td><td>Ubah field nama, klik Simpan</td><td>Nama berhasil diperbarui, redirect ke profil</td><td></td></tr>
<tr><td>2</td><td>Update email ke email unik</td><td>Ubah email ke email yang belum terdaftar</td><td>Email berhasil diperbarui</td><td></td></tr>
<tr><td>3</td><td>Update email ke email duplikat</td><td>Ubah email ke email user lain</td><td>Tampil error validasi email</td><td></td></tr>
<tr><td>4</td><td>Upload dan crop avatar</td><td>Klik foto, pilih gambar, atur crop, klik Terapkan, Simpan</td><td>Avatar baru tersimpan dan tampil di profil</td><td></td></tr>
<tr><td>5</td><td>Ubah password</td><td>Isi password lama dan password baru, klik Simpan</td><td>Password berhasil diubah</td><td></td></tr>
<tr><td>6</td><td>Ubah password dengan password lama salah</td><td>Isi password lama yang salah</td><td>Tampil error: Password saat ini salah</td><td></td></tr>
</table>
<h3>III.4.3 &nbsp; Testing Halaman CMS</h3>
<table>
<tr><th>No</th><th>Skenario Pengujian</th><th>Langkah</th><th>Hasil yang Diharapkan</th><th>Screenshot</th></tr>
<tr><td>1</td><td>Buka halaman Artikel</td><td>Login, navigasi ke /cms/artikel</td><td>Tampil daftar artikel dengan filter dan pencarian</td><td></td></tr>
<tr><td>2</td><td>Filter artikel berdasarkan status</td><td>Klik filter status Draft di halaman Artikel</td><td>Hanya artikel draft yang tampil</td><td></td></tr>
<tr><td>3</td><td>Cari artikel</td><td>Ketik kata kunci di kolom pencarian</td><td>Artikel yang sesuai kata kunci tampil</td><td></td></tr>
<tr><td>4</td><td>Buka halaman tinjauan (editor)</td><td>Login sebagai editor, buka Tinjauan Artikel</td><td>Tampil artikel dengan status review</td><td></td></tr>
<tr><td>5</td><td>Buka preview berita</td><td>Klik salah satu artikel, buka halaman Preview Berita</td><td>Tampil preview artikel lengkap (konten, gambar, tag, metadata) menyerupai tampilan portal berita</td><td></td></tr>
<tr><td>6</td><td>Responsivitas CMS</td><td>Buka CMS di layar mobile / resize browser</td><td>Tampilan tetap rapi dan bisa digunakan</td><td></td></tr>
</table>
<h3>III.4.4 &nbsp; Testing Portal Berita</h3>
<table>
<tr><th>No</th><th>Skenario Pengujian</th><th>Langkah</th><th>Hasil yang Diharapkan</th><th>Screenshot</th></tr>
<tr><td>1</td><td>Buka halaman beranda</td><td>Navigasi ke / (root URL)</td><td>Tampil headline, artikel terbaru, kategori</td><td></td></tr>
<tr><td>2</td><td>Buka detail artikel</td><td>Klik salah satu artikel di beranda</td><td>Tampil konten lengkap, gambar, tag, penulis</td><td></td></tr>
<tr><td>3</td><td>Buka halaman kategori</td><td>Klik salah satu kategori</td><td>Tampil artikel-artikel kategori tersebut</td><td></td></tr>
<tr><td>4</td><td>SEO metadata</td><td>View source halaman detail artikel</td><td>Meta tags (title, description, OG) terisi benar</td><td></td></tr>
<tr><td>5</td><td>Responsivitas portal berita</td><td>Buka portal berita di mobile</td><td>Tampilan responsif dan mudah dibaca</td><td></td></tr>
</table>''')

    # III.4.5 Testing Integrasi API
    p.append('''<h3>III.4.5 &nbsp; Testing Integrasi API (Frontend &harr; Backend)</h3>
<p>Pengujian integrasi dilakukan untuk memastikan alur end-to-end antara frontend dan backend berjalan dengan benar. Pengujian ini mencakup pengiriman data dari UI, pemrosesan di backend, dan verifikasi hasil di database.</p>
<table>
<tr><th>No</th><th>Skenario Pengujian</th><th>Langkah</th><th>Hasil yang Diharapkan</th><th>Screenshot</th></tr>
<tr><td>1</td><td>Create artikel dari UI &rarr; verifikasi di DB</td><td>Isi form lengkap di Tulis Berita, klik Simpan Draft, cek database</td><td>Data artikel tersimpan di tabel articles, tags di article_tags, revision di article_revisions</td><td></td></tr>
<tr><td>2</td><td>Edit profil &rarr; verifikasi avatar ter-upload</td><td>Upload avatar baru di halaman profil, klik Simpan, cek storage</td><td>Avatar lama terhapus, avatar baru tersimpan di storage/avatars/</td><td></td></tr>
<tr><td>3</td><td>Update artikel &rarr; verifikasi revision tercatat</td><td>Edit judul dan konten artikel, klik Simpan, cek tabel article_revisions</td><td>Revision baru tercatat dengan snapshot sebelum perubahan</td><td></td></tr>
<tr><td>4</td><td>Change password &rarr; verifikasi login dengan password baru</td><td>Ubah password, logout, login ulang dengan password baru</td><td>Login berhasil dengan password baru, password lama ditolak</td><td></td></tr>
<tr><td>5</td><td>Filter artikel CMS &rarr; verifikasi response API</td><td>Pilih filter status Draft di halaman artikel CMS</td><td>API mengembalikan hanya artikel dengan status draft</td><td></td></tr>
<tr><td>6</td><td>Portal berita beranda &rarr; verifikasi data dari API</td><td>Buka halaman beranda, cek data yang tampil</td><td>Headline, artikel terbaru, dan kategori sesuai data dari GET /api/beranda</td><td></td></tr>
</table>''')

    # III.4.6 Testing Responsivitas
    p.append('''<h3>III.4.6 &nbsp; Testing Responsivitas (Multi-Device)</h3>
<p>Pengujian responsivitas dilakukan untuk memastikan tampilan aplikasi tetap optimal pada berbagai ukuran layar. Pengujian dilakukan pada tiga breakpoint utama: desktop (1440px), tablet (768px), dan mobile (375px).</p>
<table>
<tr><th>No</th><th>Halaman</th><th>Desktop (1440px)</th><th>Tablet (768px)</th><th>Mobile (375px)</th><th>Screenshot</th></tr>
<tr><td>1</td><td>Daftar Artikel CMS</td><td>Grid 3 kolom, sidebar terbuka</td><td>Grid 2 kolom, sidebar collapse</td><td>Grid 1 kolom, hamburger menu</td><td></td></tr>
<tr><td>2</td><td>Tulis Berita</td><td>Editor full width, sidebar kanan</td><td>Editor full width, sidebar bawah</td><td>Editor full width, tombol sticky</td><td></td></tr>
<tr><td>3</td><td>Beranda Portal</td><td>Hero 2/3 + sidebar 1/3</td><td>Hero stacked, sidebar bawah</td><td>Hero full width, vertikal scroll</td><td></td></tr>
<tr><td>4</td><td>Detail Artikel</td><td>Konten 2/3 + sidebar 1/3</td><td>Konten full, sidebar bawah</td><td>Konten full, komentar full width</td><td></td></tr>
<tr><td>5</td><td>Halaman Kategori</td><td>Grid 4 kolom</td><td>Grid 2 kolom</td><td>Grid 1 kolom (list)</td><td></td></tr>
<tr><td>6</td><td>Edit Profil</td><td>Form centered, avatar besar</td><td>Form centered, avatar medium</td><td>Form full width, avatar kecil</td><td></td></tr>
</table>
<p>Hasil pengujian menunjukkan bahwa seluruh halaman berhasil menyesuaikan layout secara responsif pada ketiga breakpoint yang diuji. Tailwind CSS dengan utility class responsive (<code>sm:</code>, <code>md:</code>, <code>lg:</code>) memudahkan pengelolaan layout responsif tanpa memerlukan media query kustom.</p>''')

    # III.5 Rekognisi Mata Kuliah
    p.append('''<h2>III.5 &nbsp; Rekognisi Mata Kuliah</h2>
<p>Kegiatan Program Pembelajaran di Luar Kampus (PLK) yang dilaksanakan di PT. Ketik Media Siber telah memberikan pengalaman praktis yang relevan dengan beberapa mata kuliah yang telah atau sedang ditempuh oleh penulis di Program Studi Informatika. Berikut adalah penjabaran keterkaitan antara pekerjaan yang dilakukan selama magang dengan masing-masing mata kuliah yang direkognisi.</p>

<h3>1. Analisis Kebutuhan</h3>
<p>Mata kuliah <strong>Analisis Kebutuhan</strong> membahas teknik-teknik identifikasi, analisis, dan dokumentasi kebutuhan sistem perangkat lunak. Selama kegiatan magang, penulis menerapkan kompetensi dari mata kuliah ini secara langsung pada tahap awal pengembangan Sistem Portal Berita dan CMS Redaksi.</p>
<p>Penulis melakukan analisis kebutuhan sistem dengan mempelajari alur kerja redaksi PT. Ketik Media Siber secara menyeluruh, mulai dari proses penulisan berita oleh jurnalis, proses peninjauan dan persetujuan oleh editor, hingga proses publikasi artikel. Berdasarkan analisis tersebut, penulis mengidentifikasi kebutuhan fungsional sistem yang meliputi pengelolaan artikel dengan revision history, pengelolaan profil pengguna, serta fitur pencarian artikel. Hasil analisis kebutuhan kemudian didokumentasikan dalam bentuk <strong>Activity Diagram</strong> untuk masing-masing fitur utama, yaitu fitur Tulis Berita (Create Article), Edit Profil, dan Portal Berita. Activity Diagram tersebut menggambarkan alur proses secara sistematis mulai dari input pengguna, percabangan keputusan, hingga output yang dihasilkan.</p>
<p>Selain itu, penulis juga melakukan analisis kebutuhan non-fungsional, seperti kebutuhan akan antarmuka yang responsif untuk berbagai ukuran layar, kebutuhan optimasi SEO pada portal berita, serta kebutuhan keamanan melalui mekanisme autentikasi JWT dan role-based access control. Seluruh hasil analisis kebutuhan ini kemudian dijadikan acuan dalam tahap perancangan UI/UX menggunakan Figma dan tahap implementasi sistem.</p>

<h3>2. Pemrograman API</h3>
<p>Mata kuliah <strong>Pemrograman API</strong> membahas perancangan dan pengembangan Application Programming Interface (API) yang mengikuti standar RESTful, termasuk desain endpoint, penanganan request dan response, validasi data, serta mekanisme autentikasi. Kompetensi dari mata kuliah ini diterapkan secara intensif oleh penulis pada tahap pengembangan backend sistem.</p>
<p>Penulis membangun beberapa endpoint REST API menggunakan framework <strong>Laravel 12</strong> dengan menerapkan <i>Service-Repository Pattern</i> untuk memisahkan logika bisnis dari akses data. Endpoint yang dikembangkan meliputi <code>POST /api/cms/articles</code> untuk membuat artikel baru dengan fitur auto-generate slug, validasi slug unik, penyimpanan relasi tag menggunakan <code>firstOrCreate()</code>, dan pencatatan revision history sebagai audit trail. Penulis juga mengembangkan endpoint <code>PUT /api/auth/profile</code> untuk memperbarui profil pengguna termasuk penanganan upload dan crop avatar, serta endpoint <code>PUT /api/auth/change-password</code> untuk mengubah password dengan validasi password lama menggunakan <code>Hash::check()</code>.</p>
<p>Seluruh endpoint yang dikembangkan dilengkapi dengan mekanisme autentikasi menggunakan <strong>JWT (JSON Web Token)</strong> melalui middleware <code>auth:api</code>, validasi input menggunakan Laravel Validation, serta response dalam format JSON yang konsisten. Penulis juga menerapkan role-based access control untuk membatasi akses endpoint CMS hanya untuk role journalist, editor, dan admin. Pengalaman ini memperkuat pemahaman penulis mengenai prinsip-prinsip perancangan API yang aman, terstruktur, dan sesuai standar industri.</p>

<h3>3. Uji Coba dan Implementasi</h3>
<p>Mata kuliah <strong>Uji Coba dan Implementasi</strong> membahas metodologi pengujian perangkat lunak, teknik implementasi sistem, serta strategi deployment. Kompetensi dari mata kuliah ini diterapkan oleh penulis pada tahap implementasi dan pengujian fitur-fitur sistem yang telah dikembangkan.</p>
<p>Pada tahap implementasi, penulis mengimplementasikan seluruh rancangan sistem ke dalam kode program menggunakan <strong>Next.js 15</strong> untuk frontend dan <strong>Laravel 12</strong> untuk backend. Implementasi frontend mencakup pengembangan halaman-halaman CMS (daftar artikel, tulis berita, tinjauan artikel, preview berita, dan profil) serta halaman portal berita (beranda, detail artikel, dan kategori) dengan menggunakan TypeScript dan Tailwind CSS. Penulis juga mengimplementasikan fitur upload dan crop gambar menggunakan library <code>react-easy-crop</code>, serta mengintegrasikan seluruh halaman frontend dengan REST API backend menggunakan Axios.</p>
<p>Pada tahap uji coba, penulis melakukan pengujian fungsional terhadap seluruh fitur yang telah diimplementasikan. Pengujian mencakup empat area utama: (1) pengujian fitur buat artikel, meliputi skenario pembuatan artikel dengan data lengkap, auto-generate slug, penanganan slug duplikat, upload dan crop gambar, penambahan tag, serta pengiriman artikel ke review; (2) pengujian fitur edit profil, meliputi update nama, update email unik dan duplikat, upload dan crop avatar, serta ubah password; (3) pengujian halaman CMS, meliputi filter artikel, pencarian, tinjauan editor, dan responsivitas; serta (4) pengujian portal berita, meliputi tampilan beranda, detail artikel, halaman kategori, SEO metadata, dan responsivitas pada perangkat mobile. Hasil pengujian menunjukkan bahwa seluruh fitur berfungsi sesuai spesifikasi yang telah ditetapkan pada tahap analisis kebutuhan.</p>''')

    # Bab IV Penutup
    p.append('''<div class="pb"></div>
<h1>BAB IV<br/>PENUTUP</h1>
<h2>IV.1 &nbsp; Kesimpulan</h2>
<p>Berdasarkan pelaksanaan Program Pembelajaran di Luar Kampus (PLK) yang telah dilakukan di PT. Ketik Media Siber, dapat ditarik beberapa kesimpulan sebagai berikut:</p>
<ol>
<li>Kegiatan magang memberikan pengalaman nyata dalam mengembangkan sistem portal berita dan CMS redaksi secara profesional, mulai dari tahap perancangan UI/UX hingga implementasi fitur.</li>
<li>Perancangan UI/UX menggunakan Figma membantu dalam merancang antarmuka yang intuitif dan konsisten sebelum tahap implementasi dimulai.</li>
<li>Pengembangan frontend menggunakan Next.js 15 dengan TypeScript dan Tailwind CSS terbukti efektif dalam menghasilkan antarmuka yang responsif dan modern.</li>
<li>Integrasi antara frontend dan backend melalui REST API berjalan dengan baik, memungkinkan pengelolaan data secara dinamis dan real-time.</li>
<li>Pengembangan backend menggunakan Laravel 12 dengan Service-Repository Pattern menghasilkan kode yang terstruktur dan mudah dipelihara.</li></ol>
<h2>IV.2 &nbsp; Saran</h2>
<p class="ni">Beberapa saran yang dapat dipertimbangkan untuk pengembangan selanjutnya adalah:</p>
<ol>
<li>Penambahan fitur drag-and-drop pada rich text editor untuk mempermudah penyisipan gambar dan media.</li>
<li>Implementasi real-time notification menggunakan WebSocket untuk memberi tahu jurnalis ketika artikelnya di-review atau dipublikasikan.</li>
<li>Penambahan fitur preview artikel sebelum dipublikasikan agar editor dapat melihat tampilan akhir artikel.</li>
<li>Optimasi performa loading halaman portal berita menggunakan teknik lazy loading dan image optimization.</li>
<li>Penambahan unit test dan integration test untuk memastikan kualitas kode secara otomatis.</li></ol>''')

    # Referensi
    p.append('''<div class="pb"></div>
<h1>Referensi</h1>
<p class="ni">[1] Laravel Documentation, &ldquo;Laravel 12 &mdash; The PHP Framework for Web Artisans,&rdquo; laravel.com, 2025.</p>
<p class="ni">[2] Next.js Documentation, &ldquo;Next.js by Vercel &mdash; The React Framework,&rdquo; nextjs.org, 2025.</p>
<p class="ni">[3] Tailwind CSS, &ldquo;Tailwind CSS &mdash; Rapidly build modern websites,&rdquo; tailwindcss.com, 2025.</p>
<p class="ni">[4] Figma, &ldquo;Figma: The Collaborative Interface Design Tool,&rdquo; figma.com, 2025.</p>
<p class="ni">[5] TypeScript Documentation, &ldquo;TypeScript: JavaScript With Syntax For Types,&rdquo; typescriptlang.org, 2025.</p>''')

    # Lampiran A - Log Activity
    logs = [
        ('Minggu Ke-1 / 9-14 Feb 2026', 'Mengikuti hari pertama magang dengan sesi perkenalan bersama tim dan pembimbing lapangan, serta mendapatkan penjelasan mengenai sistem kerja dan agenda kegiatan selama magang.', 'Memahami alur kerja dan pembagian tugas selama magang.'),
        ('Minggu Ke-2 / 16-21 Feb 2026', 'Mempelajari dasar-dasar penulisan berita, teknik foto jurnalistik, dan melakukan praktik liputan sederhana.', 'Memahami proses publikasi berita dan mampu membuat berita secara mandiri.'),
        ('Minggu Ke-3 / 23-28 Feb 2026', 'Melanjutkan penulisan dan penyempurnaan berita serta rutin membuat berita harian.', 'Berita harian berhasil diselesaikan sesuai target.'),
        ('Minggu Ke-4 / 2-7 Mar 2026', 'Mendapatkan pengarahan dari pembimbing IT mengenai proyek yang akan dikerjakan. Penjelasan mengenai penggunaan Git dan GitHub.', 'Memahami dasar penggunaan Git dan GitHub serta alur kerja kolaborasi proyek.'),
        ('Minggu Ke-5 / 9-14 Mar 2026', 'Mulai mengerjakan project website dengan melakukan penambahan data dan mempelajari struktur halaman website.', 'Memahami proses input dan pengelolaan data pada website.'),
        ('Minggu Ke-6 / 16-21 Mar 2026', 'Melanjutkan pengerjaan project website dengan pembaruan data dan perbaikan tampilan.', 'Menambah pemahaman mengenai workflow GitHub dan pengelolaan data website.'),
        ('Minggu Ke-7 / 23-28 Mar 2026', 'Membantu pengecekan dan revisi data, serta memperbaiki kesalahan tampilan pada website.', 'Data website menjadi lebih lengkap dan rapi.'),
        ('Minggu Ke-8 / 30 Mar-4 Apr 2026', 'Melanjutkan pengembangan dan pengelolaan website dengan menambahkan data baru dan update konten.', 'Memahami proses pengelolaan dan pengembangan website secara lebih detail.'),
        ('Minggu Ke-9 / 6-11 Apr 2026', 'Merancang UI/UX menggunakan Figma untuk halaman CMS (artikel, tulis berita, tinjauan, profil) dan portal berita (beranda, detail, kategori).', 'Berhasil membuat desain UI/UX yang responsif dan modern menggunakan Figma.'),
        ('Minggu Ke-10 / 13-18 Apr 2026', 'Melakukan perancangan sistem menggunakan Activity Diagram serta perancangan database.', 'Berhasil menyusun dokumentasi perancangan sistem.'),
        ('Minggu Ke-11 / 20-25 Apr 2026', 'Setup project Next.js 15 dan Tailwind CSS. Mulai implementasi layout dasar dan halaman-halaman CMS.', 'Project frontend berhasil di-setup dengan layout dasar yang berfungsi.'),
        ('Minggu Ke-12 / 27 Apr-2 Mei 2026', 'Pengembangan halaman daftar artikel, tulis berita, dan profil berdasarkan desain Figma.', 'Halaman artikel dan profil berhasil dikembangkan sesuai desain.'),
        ('Minggu Ke-13 / 4-9 Mei 2026', 'Melanjutkan pengembangan halaman tinjauan artikel, preview berita, dan rich text editor untuk tulis berita.', 'Fitur rich text editor, tinjauan artikel, dan preview berita berhasil dikembangkan.'),
        ('Minggu Ke-14 / 11-16 Mei 2026', 'Pengembangan frontend portal berita: beranda, detail artikel, dan halaman kategori.', 'Portal berita berhasil dikembangkan dengan tampilan yang responsif.'),
        ('Minggu Ke-15 / 18-23 Mei 2026', 'Mulai integrasi frontend dengan REST API backend. Implementasi fitur upload gambar dan crop avatar.', 'Frontend berhasil terhubung dengan API dan fitur upload berjalan.'),
        ('Minggu Ke-16 / 25-30 Mei 2026', 'Pengembangan backend: endpoint create article, edit profile, dan change password menggunakan Laravel 12.', 'Backend berhasil dibuat dan terintegrasi dengan frontend.'),
        ('Minggu Ke-17 / 1-6 Jun 2026', 'Penyempurnaan fitur: memperbaiki bug, optimasi komponen, dan memperbaiki struktur kode.', 'Beberapa bug berhasil diperbaiki dan performa menjadi lebih baik.'),
        ('Minggu Ke-18 / 8-13 Jun 2026', 'Testing seluruh fitur website, pengecekan responsivitas, serta penyesuaian data dan endpoint API.', 'Fitur website berhasil diuji dan berjalan dengan baik.'),
        ('Minggu Ke-19 / 15-19 Jun 2026', 'Finalisasi project: pengecekan keseluruhan fitur, debugging, penyusunan dokumentasi, dan persiapan presentasi.', 'Project berhasil diselesaikan. Dokumentasi dan bahan presentasi berhasil disusun.'),
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
    parts, I = build_html()
    build_bab3(parts, I)
    html_content = '\n'.join(parts) + '\n</body></html>'
    html_path = os.path.join(PROJECT_ROOT, '_report_plk2.html')
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f'HTML: {len(html_content):,} chars')
    print('\n=== Generating PDF ===')
    pdf_path = os.path.join(PROJECT_ROOT, 'Laporan_PLK_2.pdf')
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

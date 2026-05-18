async function getUsers() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL is not defined');

    const res = await fetch(`${apiUrl}/users`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

    return res.json();
  } catch (error) {
    console.error('[getUsers] fetch failed:', error);
    return { data: [] };
  }
}

export default async function Home() {
  const result = await getUsers();
  // Handle both { data: [...] } and plain array responses
  const data: any[] = result?.data ?? (Array.isArray(result) ? result : []);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Data dari Laravel</h1>
      {data.length === 0 ? (
        <p className="text-red-500">Gagal memuat data. Cek koneksi ke API.</p>
      ) : (
        <ul className="space-y-2">
          {data.map((user: any) => (
            <li key={user.id} className="border p-3 rounded">
              <span className="font-medium">{user.name}</span> — {user.email}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
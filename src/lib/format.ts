/** "PT90M" -> "1 t. 30 min" */
export function formatDuration(iso: string): string {
	const match = /^PT(?:(\d+)H)?(?:(\d+)M)?$/.exec(iso);
	if (!match) return iso;
	const total = Number(match[1] ?? 0) * 60 + Number(match[2] ?? 0);
	const hours = Math.floor(total / 60);
	const minutes = total % 60;
	return [hours ? `${hours} t.` : '', minutes ? `${minutes} min` : ''].filter(Boolean).join(' ');
}

/** Recipe dates are created from local calendar parts, so format them the same way (no UTC shift). */
export function isoDate(date: Date): string {
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function longDate(date: Date): string {
	return new Intl.DateTimeFormat('da-DK', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

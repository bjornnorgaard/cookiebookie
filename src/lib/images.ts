import manifest from '#lib/data/images.generated.json';

/**
 * Photo lookup. The manifest is produced by `npm run images` from the originals
 * in /photos. Recipes without their own photo fall back to the shared placeholder.
 */
export interface Variant {
	src: string;
	w: number;
	h: number;
}

export type Format = 'avif' | 'webp' | 'jpg';
export const FORMATS: { ext: Format; type: string }[] = [
	{ ext: 'avif', type: 'image/avif' },
	{ ext: 'webp', type: 'image/webp' },
	{ ext: 'jpg', type: 'image/jpeg' },
];

export interface RecipePhoto {
	width: number;
	height: number;
	ratio: number;
	blur: string;
	color: string;
	wide: Record<Format, Variant[]>;
	card: Record<Format, Variant[]>;
	social: Record<'og' | '16x9' | '4x3' | '1x1', Variant>;
	isPlaceholder: boolean;
}

const photos = manifest as unknown as Record<string, Omit<RecipePhoto, 'isPlaceholder'>>;

export function getPhoto(slug: string): RecipePhoto {
	const own = photos[slug];
	if (own) return { ...own, isPlaceholder: false };
	// No photo yet: only the drawn social crops exist; the page renders a wireframe instead.
	return { ...(photos.placeholder as unknown as RecipePhoto), isPlaceholder: true };
}

export const srcset = (variants: Variant[]) => variants.map((v) => `${v.src} ${v.w}w`).join(', ');

/** Mid-size variant used as the plain `<img src>` fallback (the srcset lets browsers pick better). */
export const fallback = (variants: Variant[]) => variants[Math.min(variants.length - 1, 2)];

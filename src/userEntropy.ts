const REQUIRED_KEYS = ["a", "s", "d", "f", " ", "j", "k", "l", ";"] as const;

type Key = (typeof REQUIRED_KEYS)[number];

const REQUIRED_SET = new Set<string>(REQUIRED_KEYS);

function isallowedKey(k: string): k is Key {
    return REQUIRED_SET.has(k);
}

function mix32(seed: number, x: number): number {
    seed ^= x + 0x9e3779b9 + (seed << 6) + (seed >>> 2);
    return seed | 0;
}

export function mulberry32(seed: number) {
    return function rand() {
        seed |= 0;
        seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export type RitualState = {
    heldCount: number;
    requiredCount: number;
    ritualStarted: boolean;
    done: boolean;
    ritualMs: number | null;
}

export class EntropyCollectorRitual {
    private seed = 0;
    private done = false;

    private downAt = new Map<Key, number>();
    private ritualStartAt: number | null = null;
    private ritualMs: number | null = null;
    private lastEventAt = 0;

    getState(): RitualState {
        return {
            heldCount: this.downAt.size,
            requiredCount: REQUIRED_KEYS.length,
            ritualStarted: this.ritualStartAt !== null,
            done: this.done,
            ritualMs: this.ritualMs,
        };
    }

    finalizeSeed(): number {
        if (!this.done) throw new Error("Ritual not complete");
        return this.seed | 0;
    }

    private addCrypographicEntropy() {
        const buf = new Uint32Array(2);
        crypto.getRandomValues(buf);
        this.seed = mix32(this.seed, buf[0]);
        this.seed = mix32(this.seed, buf[1]);
    }

    private checkRitualInitialised(now: number) {
        if (this.ritualStartAt !== null) return;
        if (this.downAt.size !== REQUIRED_KEYS.length) return;

        this.ritualStartAt = now;

        this.seed = mix32(this.seed, (now * 1000) | 0);
    }

    onKeyDown = (e: KeyboardEvent) => {
        if (this.done) return;
        if (e.repeat) return;

        const k = e.key === "Spacebar" ? " " : e.key;
        if (!isallowedKey(k)) return;

        const now = performance.now();
        const dt = this.lastEventAt ? (now - this.lastEventAt) : 0;
        this.lastEventAt = now;

        if (!this.downAt.has(k)) this.downAt.set(k, now);

        this.seed = mix32(this.seed, k.charCodeAt(0));
        this.seed = mix32(this.seed, dt | 0);
        
        this.checkRitualInitialised(now);
    };

    onKeyUp = (e: KeyboardEvent) => {
        if (this.done) return;

        const k = e.key === "Spacebar" ? " ": e.key;
        if (!isallowedKey(k)) return;

        const now = performance.now();


        if (this.ritualStartAt !== null) {
            const ritualMs = now - this.ritualStartAt;
            this.ritualMs = ritualMs;

            this.seed = mix32(this.seed, ritualMs | 0);
            this.seed = mix32(this.seed, (now * 1000) | 0);
            
            this.addCrypographicEntropy();
            this.done = true;
            return;
        };

        this.downAt.delete(k);
    };
}
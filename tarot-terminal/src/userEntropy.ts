const ALLOWED_KEYS = new Set(["a", "s", "d", "f", " ", "j", "k", "l", ";"]);

type Key = "a" | "s" | "d" | "f" | " " | "j" | "k" | "l" | ";";

function isallowedKey(k: string): k is Key {
    return ALLOWED_KEYS.has(k);
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

export type EntropyState = {
    presses: number;
    seed: number;
    done: boolean;
};

export class EntropyCollector {
    private seed = 0;
    private presses = 0;
    private done = false;

    private downAt = new Map<Key, number>();
    private lastEventAt = 0;

    private targetPresses: number;
    constructor(targetPresses: number = 12) {
        this.targetPresses = targetPresses;
    }

    getState(): EntropyState {
        return { presses: this.presses, seed: this.seed, done: this.done };
    }

    finalizeSeed(): number {
        if (!this.done) throw new Error("EntropyCollector not complete");
        return this.seed | 0;
    }

    addCrypographicEntropy() {
        const buf = new Uint32Array(2);
        crypto.getRandomValues(buf);
        this.seed = mix32(this.seed, buf[0]);
        this.seed = mix32(this.seed, buf[1]);
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
    };

    onKeyUp = (e: KeyboardEvent) => {
        if (this.done) return;

        const k = e.key === "Spacebar" ? " ": e.key;
        if (!isallowedKey(k)) return;

        const now = performance.now();
        const start = this.downAt.get(k);
        if (start == null) return;

        const holdMs = now - start;
        this.downAt.delete(k);

        this.seed = mix32(this.seed, holdMs | 0);
        this.seed = mix32(this.seed, (now * 1000) | 0);

        this.presses += 1;

        if (this.presses >= this.targetPresses) {
            this.addCrypographicEntropy();
            this.done = true;
        }
    };
}
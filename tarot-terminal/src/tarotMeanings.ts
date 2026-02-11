import type { CardPath, Suit, MajorRank, MinorRank } from "./deck";

export type Meaning = {
    upright: string;
    reversed?: string;
};

export const MEANINGS_BY_PATH: Record<CardPath, Meaning> = {
    "/Tarot-Ascii/MajorArcana/00.txt": {
        upright: "Fortune favors the bold.",
        reversed: "Fools rush in where angels fear to tread."
    },
    "/Tarot-Ascii/MajorArcana/01.txt": {
        upright: "Where there's a will.",
        reversed: "All that glitters is not gold."
    },
    "/Tarot-Ascii/MajorArcana/02.txt": {
        upright: "Trust your gut.",
        reversed: "Secrets have a cost."
    },
    "/Tarot-Ascii/MajorArcana/03.txt": {
        upright: "You reap what you sow.",
        reversed: "Too much of a good thing."
    },
    "/Tarot-Ascii/MajorArcana/04.txt": {
        upright: "Order brings strength.",
        reversed: "Absolute power corrupts absolutely."
    },
    "/Tarot-Ascii/MajorArcana/05.txt": {
        upright: "Stand on the shoulders of giants.",
        reversed: "Rules are made to be broken."
    },
    "/Tarot-Ascii/MajorArcana/06.txt": {
        upright: "Follow your heart.",
        reversed: "Divided, we fall."
    },
    "/Tarot-Ascii/MajorArcana/07.txt": {
        upright: "Where there's drive, there's victory.",
        reversed: "Ikaris flew too close to the sun."
    },
    "/Tarot-Ascii/MajorArcana/08.txt": {
        upright: "Patience is power.",
        reversed: "Unchecked emotion betrays you."
    },
    "/Tarot-Ascii/MajorArcana/09.txt": {
        upright: "Still waters run deep.",
        reversed: "No man is an island."
    },
    "/Tarot-Ascii/MajorArcana/10.txt": {
        upright: "What goes around comes around.",
        reversed: "Luck runs out."
    },
    "/Tarot-Ascii/MajorArcana/11.txt": {
        upright: "The truth will out.",
        reversed: "Bias blinds judgement."
    },
    "/Tarot-Ascii/MajorArcana/12.txt": {
        upright: "Holding on is believing that there's only a past.",
        reversed: "Stubbornness stalls progress."
    },
    "/Tarot-Ascii/MajorArcana/13.txt": {
        upright: "All things must come to an end.",
        reversed: "Changed resisted is change delayed."
    },
    "/Tarot-Ascii/MajorArcana/14.txt": {
        upright: "Moderation in all things.",
        reversed: "Extremes invite imbalance."
    },
    "/Tarot-Ascii/MajorArcana/15.txt": {
        upright: "You are your own jailer.",
        reversed: "Chains break when you see them."
    },
    "/Tarot-Ascii/MajorArcana/16.txt": {
        upright: "The higher they rise, the harder they fall.",
        reversed: "Disaster postponed is not disaster avoided."
    },
    "/Tarot-Ascii/MajorArcana/17.txt": {
        upright: "Hope springs eternal.",
        reversed: "Doubt dims the light."
    },
    "/Tarot-Ascii/MajorArcana/18.txt": {
        upright: "Not all is as it seems.",
        reversed: "The fog begins to lift."
    },
    "/Tarot-Ascii/MajorArcana/19.txt": {
        upright: "Bask in the light.",
        reversed: "Even the sun casts shadows."
    },
    "/Tarot-Ascii/MajorArcana/20.txt": {
        upright: "Answer the call.",
        reversed: "Denial delays reckoning."
    },
    "/Tarot-Ascii/MajorArcana/21.txt": {
        upright: "All comes full circle.",
        reversed: "Unfinished business lingers."
    },
    "/Tarot-Ascii/Cups/01.txt": {
        upright: "A new feeling rises.",
        reversed: "A guarded heart stays empty."
    },
    "/Tarot-Ascii/Cups/02.txt": {
        upright: "It takes two.",
        reversed: "One-sided bonds break."
    },
    "/Tarot-Ascii/Cups/03.txt": {
        upright: "Shared joy is joy doubled.",
        reversed: "Too many voices spoil the harmony."
    },
    "/Tarot-Ascii/Cups/04.txt": {
        upright: "Apathy blinds opportunity.",
        reversed: "Engagement restores meaning."
    },
    "/Tarot-Ascii/Cups/05.txt": {
        upright: "Don't cry over spilled milk.",
        reversed: "Perspective reveals what endures."
    },
    "/Tarot-Ascii/Cups/06.txt": {
        upright: "The past still lingers.",
        reversed: "Nostalgia hinders growth."
    },
    "/Tarot-Ascii/Cups/07.txt": {
        upright: "Too many choices weaken resolve.",
        reversed: "Discernment cuts through illusion."
    },
    "/Tarot-Ascii/Cups/08.txt": {
        upright: "Fulfillment sometimes requires departure.",
        reversed: "Avoidance masquerades as progress."
    },
    "/Tarot-Ascii/Cups/09.txt": {
        upright: "Contentment is its own reward.",
        reversed: "Indulgence feeds emptiness."
    },
    "/Tarot-Ascii/Cups/10.txt": {
        upright: "Happiness shared is happiness fulfilled.",
        reversed: "Surface peace hides fracture."
    },
    "/Tarot-Ascii/Cups/11.txt": {
        upright: "Sensitivity walks so understanding can run.",
        reversed: "Emotional naivety welcomes confusion."
    },
    "/Tarot-Ascii/Cups/12.txt": {
        upright: "Idealism drives action",
        reversed: "Romance obscures truth."
    },
    "/Tarot-Ascii/Cups/13.txt": {
        upright: "Emotional intelligence nurtures others.",
        reversed: "Boundless empathy overwhelms."
    },
    "/Tarot-Ascii/Cups/14.txt": {
        upright: "Mastery of self brings peace.",
        reversed: "Suppressed emotion destabilises judgement."
    },
    "/Tarot-Ascii/Pentacles/01.txt": {
        upright: "Every fortune begins with a seed.",
        reversed: "A poor seed yields a poor crop."
    },
    "/Tarot-Ascii/Pentacles/02.txt": {
        upright: "Maintaining balance is no small feat.",
        reversed: "Too much motion conceals instability."
    },
    "/Tarot-Ascii/Pentacles/03.txt": {
        upright: "Many hands make light work.",
        reversed: "Too many cooks spoils the broth."
    },
    "/Tarot-Ascii/Pentacles/04.txt": {
        upright: "What you guard defines you.",
        reversed: "Control becomes confinement."
    },
    "/Tarot-Ascii/Pentacles/05.txt": {
        upright: "Hardship exposes what truly exposes you.",
        reversed: "Relief arrives when pride loosens."
    },
    "/Tarot-Ascii/Pentacles/06.txt": {
        upright: "Prosperity carries responsibility.",
        reversed: "Unequal exchange breeds resentment."
    },
    "/Tarot-Ascii/Pentacles/07.txt": {
        upright: "Good things come to those who wait.",
        reversed: "Soon ripe, soon rotten."
    },
    "/Tarot-Ascii/Pentacles/08.txt": {
        upright: "Practice makes perfect.",
        reversed: "Cut corners and pay the price."
    },
    "/Tarot-Ascii/Pentacles/09.txt": {
        upright: "Independence is its own reward.",
        reversed: "Comfort becomes a gilded cage."
    },
    "/Tarot-Ascii/Pentacles/10.txt": {
        upright: "A rising tide lifts all boats.",
        reversed: "Easy come, easy go."
    },
    "/Tarot-Ascii/Pentacles/11.txt": {
        upright: "Commitment begins with curiosity.",
        reversed: "Inherited stability conceals fragility."
    },
    "/Tarot-Ascii/Pentacles/12.txt": {
        upright: "Consistency outpaces brilliance.",
        reversed: "Stagnation disguises itself as discipline."
    },
    "/Tarot-Ascii/Pentacles/13.txt": {
        upright: "Stewardship creates abundance.",
        reversed: "Over-extension drains the foundation."
    },
    "/Tarot-Ascii/Pentacles/14.txt": {
        upright: "Authority is built, not claimed.",
        reversed: "Security without vision decays."
    },
    "/Tarot-Ascii/Swords/01.txt": {
        upright: "Truth cuts both ways.",
        reversed: "None are so blind as those who will not see."
    },
    "/Tarot-Ascii/Swords/02.txt": {
        upright: "Look before you leap.",
        reversed: "He who hesitates is lost."
    },
    "/Tarot-Ascii/Swords/03.txt": {
        upright: "The truth hurts.",
        reversed: "Time heals all wounds."
    },
    "/Tarot-Ascii/Swords/04.txt": {
        upright: "Discretion is the better part of valor.",
        reversed: "All work and no rest dulls the blade."
    },
    "/Tarot-Ascii/Swords/05.txt": {
        upright: "Winning isn't everything.",
        reversed: "Pride comes before the fall."
    },
    "/Tarot-Ascii/Swords/06.txt": {
        upright: "This too, shall pass.",
        reversed: "You can't outrun the past."
    },
    "/Tarot-Ascii/Swords/07.txt": {
        upright: "Loose lips sink ships.",
        reversed: "The truth will out."
    },
    "/Tarot-Ascii/Swords/08.txt": {
        upright: "A man is his own worst enemy.",
        reversed: "The mind is a terrible master."
    },
    "/Tarot-Ascii/Swords/09.txt": {
        upright: "Fear has many eyes.",
        reversed: "Daylight brings clarity."
    },
    "/Tarot-Ascii/Swords/10.txt": {
        upright: "Dead men tell no tales.",
        reversed: "Rock bottom is still ground."
    },
    "/Tarot-Ascii/Swords/11.txt": {
        upright: "Curiosity killed the cat.",
        reversed: "A little knowledge is a dangerous thing."
    },
    "/Tarot-Ascii/Swords/12.txt": {
        upright: "Charge now, reckon later.",
        reversed: "Momentum without aim is ruin."
    },
    "/Tarot-Ascii/Swords/13.txt": {
        upright: "Say what you mean.",
        reversed: "A sharp tongue cuts deep."
    },
    "/Tarot-Ascii/Swords/14.txt": {
        upright: "Reason governs all things.",
        reversed: "Justice delayed is justice denied."
    },
    "/Tarot-Ascii/Wands/01.txt": {
        upright: "Strike while the iron is hot.",
        reversed: "All spark and no flame."
    },
    "/Tarot-Ascii/Wands/02.txt": {
        upright: "The world is your oyster.",
        reversed: "He who chases two rabbits catches neither."
    },
    "/Tarot-Ascii/Wands/03.txt": {
        upright: "Nothing ventured, nothing gained.",
        reversed: "Don't count your chickens before they hatch."
    },
    "/Tarot-Ascii/Wands/04.txt": {
        upright: "Make hay while the sun is still shining.",
        reversed: "Choose a fig before they all rot."
    },
    "/Tarot-Ascii/Wands/05.txt": {
        upright: "When all speak, none are heard.",
        reversed: "Much ado about nothing."
    },
    "/Tarot-Ascii/Wands/06.txt": {
        upright: "Success is found with the work of many.",
        reversed: "Applause fades."
    },
    "/Tarot-Ascii/Wands/07.txt": {
        upright: "Stand your ground.",
        reversed: "Choose your battles."
    },
    "/Tarot-Ascii/Wands/08.txt": {
        upright: "Time waits for no one.",
        reversed: "Haste makes waste."
    },
    "/Tarot-Ascii/Wands/09.txt": {
        upright: "fall seven times, stand up eight.",
        reversed: "You can't pour from an empty cup."
    },
    "/Tarot-Ascii/Wands/10.txt": {
        upright: "The candle that burns twice as bright burns half as long.",
        reversed: "Lay down your burden."
    },
    "/Tarot-Ascii/Wands/11.txt": {
        upright: "Every journey begins with a single step.",
        reversed: "All bark, no bite."
    },
    "/Tarot-Ascii/Wands/12.txt": {
        upright: "He who hesitates misses the moment.",
        reversed: "In order to run, first remember to walk."
    },
    "/Tarot-Ascii/Wands/13.txt": {
        upright: "Well-behaved women seldom make history.",
        reversed: "Power reveals the person."
    },
    "/Tarot-Ascii/Wands/14.txt": {
        upright: "Where there is smoke, there is fire.",
        reversed: "Fire warms, or destroys ."
    },
}
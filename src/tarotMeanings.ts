import type { CardPath } from "./deck";

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
        upright: "Where there's a will, there is a way.",
        reversed: "All that glitters is not gold."
    },
    "/Tarot-Ascii/MajorArcana/02.txt": {
        upright: "Trust your gut.",
        reversed: "What is done in the dark will come to light."
    },
    "/Tarot-Ascii/MajorArcana/03.txt": {
        upright: "You reap what you sow.",
        reversed: "Too much of a good thing."
    },
    "/Tarot-Ascii/MajorArcana/04.txt": {
        upright: "A place for everything, and everything in its place.",
        reversed: "Absolute power corrupts absolutely."
    },
    "/Tarot-Ascii/MajorArcana/05.txt": {
        upright: "Stand on the shoulders of giants.",
        reversed: "Rules are made to be broken."
    },
    "/Tarot-Ascii/MajorArcana/06.txt": {
        upright: "Follow your heart.",
        reversed: "United we stand, divided we fall."
    },
    "/Tarot-Ascii/MajorArcana/07.txt": {
        upright: "Take the reins.",
        reversed: "Don't fly too close to the sun."
    },
    "/Tarot-Ascii/MajorArcana/08.txt": {
        upright: "You catch more flies with honey than with vinegar.",
        reversed: "Anger is a short madness."
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
        upright: "Justice is blind.",
        reversed: "Bias blinds judgement."
    },
    "/Tarot-Ascii/MajorArcana/12.txt": {
        upright: "You can't see the forest for the trees.",
        reversed: "Don't cut off your nose to spite your face."
    },
    "/Tarot-Ascii/MajorArcana/13.txt": {
        upright: "All things must come to an end.",
        reversed: "You cannot step into the same river twice."
    },
    "/Tarot-Ascii/MajorArcana/14.txt": {
        upright: "Moderation in all things.",
        reversed: "The bow too tensely strung is easily broken."
    },
    "/Tarot-Ascii/MajorArcana/15.txt": {
        upright: "Man is born free, and everywhere he is in chains.",
        reversed: "The truth shall set you free."
    },
    "/Tarot-Ascii/MajorArcana/16.txt": {
        upright: "The bigger they are, the harder they fall.",
        reversed: "Don't kick the can down the road."
    },
    "/Tarot-Ascii/MajorArcana/17.txt": {
        upright: "Hope springs eternal.",
        reversed: "Hope deferred makes the heart sick."
    },
    "/Tarot-Ascii/MajorArcana/18.txt": {
        upright: "Things are not always what they seem.",
        reversed: "The penny drops."
    },
    "/Tarot-Ascii/MajorArcana/19.txt": {
        upright: "Every dog has its day.",
        reversed: "Even the sun has spots."
    },
    "/Tarot-Ascii/MajorArcana/20.txt": {
        upright: "Rise from the ashes.",
        reversed: "Don't bury your head in the sand."
    },
    "/Tarot-Ascii/MajorArcana/21.txt": {
        upright: "The wheel has come full circle.",
        reversed: "Tie up loose ends."
    },
    "/Tarot-Ascii/Cups/01.txt": {
        upright: "My cup runneth over.",
        reversed: "Once bitten, twice shy."
    },
    "/Tarot-Ascii/Cups/02.txt": {
        upright: "It takes two to tango.",
        reversed: "One hand cannot clap."
    },
    "/Tarot-Ascii/Cups/03.txt": {
        upright: "Shared joy is double joy.",
        reversed: "Two's company, three's a crowd."
    },
    "/Tarot-Ascii/Cups/04.txt": {
        upright: "You can lead a horse to water, but you can't make it drink.",
        reversed: "Wake up and smell the coffee."
    },
    "/Tarot-Ascii/Cups/05.txt": {
        upright: "Don't cry over spilled milk.",
        reversed: "Every cloud has a silver lining."
    },
    "/Tarot-Ascii/Cups/06.txt": {
        upright: "The child is father of the man.",
        reversed: "You can't go home again."
    },
    "/Tarot-Ascii/Cups/07.txt": {
        upright: "Don't build castles in the air.",
        reversed: "Separate the wheat from the chaff."
    },
    "/Tarot-Ascii/Cups/08.txt": {
        upright: "When one door closes, another opens.",
        reversed: "The grass is always greener on the other side."
    },
    "/Tarot-Ascii/Cups/09.txt": {
        upright: "Count your blessings.",
        reversed: "Enough is as good as a feast."
    },
    "/Tarot-Ascii/Cups/10.txt": {
        upright: "Home is where the heart is.",
        reversed: "Every family has a skeleton in the closet."
    },
    "/Tarot-Ascii/Cups/11.txt": {
        upright: "Wear your heart on your sleeve.",
        reversed: "Still wet behind the ears."
    },
    "/Tarot-Ascii/Cups/12.txt": {
        upright: "Faint heart never won fair lady.",
        reversed: "Love is blind."
    },
    "/Tarot-Ascii/Cups/13.txt": {
        upright: "Kindness costs nothing.",
        reversed: "You can't pour from an empty cup."
    },
    "/Tarot-Ascii/Cups/14.txt": {
        upright: "Keep a cool head.",
        reversed: "Give sorrow words."
    },
    "/Tarot-Ascii/Pentacles/01.txt": {
        upright: "Mighty oaks from little acorns grow.",
        reversed: "Opportunity seldom knocks twice."
    },
    "/Tarot-Ascii/Pentacles/02.txt": {
        upright: "Roll with the punches.",
        reversed: "Don't rob Peter to pay Paul."
    },
    "/Tarot-Ascii/Pentacles/03.txt": {
        upright: "Many hands make light work.",
        reversed: "Too many cooks spoil the broth."
    },
    "/Tarot-Ascii/Pentacles/04.txt": {
        upright: "A penny saved is a penny earned.",
        reversed: "Penny wise, pound foolish."
    },
    "/Tarot-Ascii/Pentacles/05.txt": {
        upright: "A friend in need is a friend indeed.",
        reversed: "Swallow your pride."
    },
    "/Tarot-Ascii/Pentacles/06.txt": {
        upright: "It is more blessed to give than to receive.",
        reversed: "There's no such thing as a free lunch."
    },
    "/Tarot-Ascii/Pentacles/07.txt": {
        upright: "Good things come to those who wait.",
        reversed: "Soon ripe, soon rotten."
    },
    "/Tarot-Ascii/Pentacles/08.txt": {
        upright: "Practice makes perfect.",
        reversed: "If a job's worth doing, it's worth doing well."
    },
    "/Tarot-Ascii/Pentacles/09.txt": {
        upright: "Stand on your own two feet.",
        reversed: "Beware the golden handcuffs."
    },
    "/Tarot-Ascii/Pentacles/10.txt": {
        upright: "A rising tide lifts all boats.",
        reversed: "Easy come, easy go."
    },
    "/Tarot-Ascii/Pentacles/11.txt": {
        upright: "Little by little, the bird builds its nest.",
        reversed: "Never put off till tomorrow what you can do today."
    },
    "/Tarot-Ascii/Pentacles/12.txt": {
        upright: "Slow and steady wins the race.",
        reversed: "Don't get stuck in a rut."
    },
    "/Tarot-Ascii/Pentacles/13.txt": {
        upright: "Charity begins at home.",
        reversed: "Don't bite off more than you can chew."
    },
    "/Tarot-Ascii/Pentacles/14.txt": {
        upright: "Rome wasn't built in a day.",
        reversed: "The love of money is the root of all evil."
    },
    "/Tarot-Ascii/Swords/01.txt": {
        upright: "The pen is mightier than the sword.",
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
        reversed: "All work and no play makes Jack a dull boy."
    },
    "/Tarot-Ascii/Swords/05.txt": {
        upright: "Winning isn't everything.",
        reversed: "Pride comes before the fall."
    },
    "/Tarot-Ascii/Swords/06.txt": {
        upright: "This too shall pass.",
        reversed: "Wherever you go, there you are."
    },
    "/Tarot-Ascii/Swords/07.txt": {
        upright: "Loose lips sink ships.",
        reversed: "The truth will out."
    },
    "/Tarot-Ascii/Swords/08.txt": {
        upright: "The mind is a terrible master.",
        reversed: "Think outside the box."
    },
    "/Tarot-Ascii/Swords/09.txt": {
        upright: "Fear has many eyes.",
        reversed: "Things will look better in the morning."
    },
    "/Tarot-Ascii/Swords/10.txt": {
        upright: "It's always darkest before the dawn.",
        reversed: "The only way is up."
    },
    "/Tarot-Ascii/Swords/11.txt": {
        upright: "Knowledge is power.",
        reversed: "A little knowledge is a dangerous thing."
    },
    "/Tarot-Ascii/Swords/12.txt": {
        upright: "Full steam ahead.",
        reversed: "Like a bull in a china shop."
    },
    "/Tarot-Ascii/Swords/13.txt": {
        upright: "Call a spade a spade.",
        reversed: "The tongue has no bones, yet it breaks bones."
    },
    "/Tarot-Ascii/Swords/14.txt": {
        upright: "Measure twice, cut once.",
        reversed: "Justice delayed is justice denied."
    },
    "/Tarot-Ascii/Wands/01.txt": {
        upright: "Strike while the iron is hot.",
        reversed: "A flash in the pan."
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
        upright: "Eat, drink, and be merry.",
        reversed: "The sweetest wine makes the sharpest vinegar."
    },
    "/Tarot-Ascii/Wands/05.txt": {
        upright: "Iron sharpens iron.",
        reversed: "Much ado about nothing."
    },
    "/Tarot-Ascii/Wands/06.txt": {
        upright: "To the victor go the spoils.",
        reversed: "Thus passes the glory of the world."
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
        upright: "Fall seven times, stand up eight.",
        reversed: "Don't run yourself into the ground."
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
        upright: "Seize the day.",
        reversed: "One must walk before they can run."
    },
    "/Tarot-Ascii/Wands/13.txt": {
        upright: "Well-behaved women seldom make history.",
        reversed: "Jealousy is the green-eyed monster."
    },
    "/Tarot-Ascii/Wands/14.txt": {
        upright: "Actions speak louder than words.",
        reversed: "Fire is a good servant but a bad master."
    },
}
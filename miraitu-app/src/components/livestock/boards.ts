import type { LivestockType } from '@/app/actions/livestock';

/**
 * What each of the five livestock pages calls itself, filters on, and shows
 * under a card's title.
 *
 * Extracted from LivestockBoard so /home/livestock can use it too: its Buy tab
 * mixes all five types in one grid, and a card there has to pick the right
 * detail line (breed/age/yield for cattle, bird count and eggs/day for
 * poultry) from the ad's own `type`.
 */

export interface BoardConfig {
    title: string;
    subtitle: string;
    /** Stands in for a photo the seller did not upload. */
    emoji: string;
    buyTab: string;
    sellTab: string;
    /** What the first dropdown filters on — a key in the ad's `specs`. */
    filterKey: string;
    /** Its "no filter" label: breeds, varieties or species, as the page reads. */
    filterAll: string;
    /** What "Showing 6 …" counts. */
    noun: string;
    /** The details under a card's title, most telling first. */
    chips: (specs: Record<string, string>) => (string | undefined)[];
    /** The sell form's own category id — /home/livestock?tab=sell&category=… */
    sellCategory: string;
    /** One line under the Sell tab's heading. */
    sellCaption: string;
}

/** "50 birds", and nothing at all when the seller left the count blank. */
const count = (n: string | undefined, word: string) => (n ? `${n} ${word}` : undefined);

/**
 * `milkYield` → "Milk Yield". The spec keys come from the sell form's
 * CATEGORY_FIELDS, which lives in a page module and so cannot be imported
 * here; every key there is camelCase, which is all this needs to know.
 */
export const specLabel = (key: string) =>
    key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase());

export const BOARDS: Record<LivestockType, BoardConfig> = {
    cattle: {
        title: 'Cattle Marketplace',
        subtitle: 'Buy or sell cows, bulls & buffaloes',
        emoji: '🐄',
        buyTab: 'Buy Cattle',
        sellTab: 'Sell Cattle',
        filterKey: 'breed',
        filterAll: 'All Breeds',
        noun: 'cattle',
        chips: s => [s.breed, s.age, s.gender, s.milkYield ? `${s.milkYield} L/day` : undefined],
        sellCategory: 'cattle',
        sellCaption: 'List a cow, bull or buffalo for sale',
    },
    goats: {
        title: 'Goats & Sheep',
        subtitle: 'For meat, milk and wool production',
        emoji: '🐐',
        buyTab: 'Buy Goats & Sheep',
        sellTab: 'Sell',
        filterKey: 'breed',
        filterAll: 'All Breeds',
        noun: 'listings',
        chips: s => [s.breed, s.age, s.gender, count(s.quantity, 'heads')],
        sellCategory: 'goats',
        sellCaption: 'List goats or sheep for sale',
    },
    poultry: {
        title: 'Poultry Marketplace',
        subtitle: 'Chickens, ducks, turkeys & more',
        emoji: '🐔',
        buyTab: 'Buy Poultry',
        sellTab: 'Sell Poultry',
        filterKey: 'breed',
        filterAll: 'All Varieties',
        noun: 'listings',
        chips: s => [
            s.breed,
            s.birdType,
            count(s.quantity, 'birds'),
            s.eggsPerDay ? `${s.eggsPerDay} eggs/day` : undefined,
        ],
        sellCategory: 'poultry',
        sellCaption: 'List birds, chicks or eggs for sale',
    },
    fish: {
        title: 'Fish & Aquaculture',
        subtitle: 'Fish farming and aquaculture',
        emoji: '🐟',
        buyTab: 'Buy Fish',
        sellTab: 'Sell Fish',
        filterKey: 'species',
        filterAll: 'All Species',
        noun: 'listings',
        chips: s => [s.species, s.stage, count(s.quantity, 'pcs'), s.avgWeight ? `${s.avgWeight} g avg` : undefined],
        sellCategory: 'fish',
        sellCaption: 'List seed, fingerlings or table fish for sale',
    },
    others: {
        title: 'Other Livestock',
        subtitle: 'Rabbits, pigeons, bees, quails & more',
        emoji: '🐾',
        buyTab: 'Buy',
        sellTab: 'Sell',
        filterKey: 'animalType',
        filterAll: 'All Types',
        noun: 'listings',
        chips: s => [s.animalType, s.breed, s.age, count(s.quantity, 'nos')],
        sellCategory: 'others',
        sellCaption: 'List rabbits, pigeons, bees and anything else',
    },
};

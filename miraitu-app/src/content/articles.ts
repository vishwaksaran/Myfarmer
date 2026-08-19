/**
 * Original long-form guides for Indian farmers.
 *
 * This is deliberately NOT the agri-news pipeline (src/lib/agri-news.ts), which
 * aggregates headlines from external sources. Aggregated and syndicated content
 * does not establish originality — for AdSense it is a rejection reason rather
 * than a help, and for search it competes with the outlet that published first.
 * Everything here is written for Miraitu and exists nowhere else.
 *
 * Adding an article: append one entry to `articles`. The index page, the
 * per-article route, `generateStaticParams` and the sitemap all derive from
 * this array, so no other file needs editing.
 *
 * Content standards, because thin filler is worse than no articles at all —
 * it confirms the "low value content" judgement rather than answering it:
 *   - Specific numbers, with the year they apply to, not vague ranges.
 *   - Say where a figure varies by state, because most of them do.
 *   - No advice that could cost money without naming the risk alongside it.
 */

export interface ArticleTable {
    readonly headers: readonly string[];
    readonly rows: readonly (readonly string[])[];
}

export type ArticleBlock =
    | { readonly type: 'paragraph'; readonly text: string }
    | { readonly type: 'heading'; readonly text: string }
    | { readonly type: 'list'; readonly items: readonly string[]; readonly ordered?: boolean }
    | { readonly type: 'table'; readonly caption?: string; readonly table: ArticleTable }
    | { readonly type: 'callout'; readonly title: string; readonly text: string };

export interface Article {
    readonly slug: string;
    readonly title: string;
    /** Meta description and index-card summary. Aim for 140-160 characters. */
    readonly description: string;
    readonly category: 'Machinery' | 'Crops' | 'Livestock' | 'Finance' | 'Soil & Water';
    /** Emoji stands in for a hero image — no licensing risk, no layout shift. */
    readonly icon: string;
    /** ISO date. Used for the sitemap and the Article schema. */
    readonly publishedAt: string;
    readonly updatedAt: string;
    readonly readingMinutes: number;
    readonly blocks: readonly ArticleBlock[];
    /** Internal links rendered at the foot of the article. */
    readonly related?: readonly { readonly label: string; readonly href: string }[];
}

export const articles: readonly Article[] = [
    {
        slug: 'tractor-rent-vs-buy-india',
        title: 'Renting vs buying a tractor in India: the break-even acreage',
        description:
            'The honest arithmetic on when a tractor pays for itself, why the break-even is higher than most dealers suggest, and how to check your own numbers.',
        category: 'Machinery',
        icon: '🚜',
        publishedAt: '2026-08-19',
        updatedAt: '2026-08-19',
        readingMinutes: 8,
        blocks: [
            {
                type: 'paragraph',
                text: 'A tractor is the largest single purchase most Indian farmers ever make, and the decision is usually made emotionally — a neighbour bought one, a dealer offered a scheme, the harvest was good this year. The arithmetic is not complicated, but almost nobody does it before signing. This guide walks through it with real numbers so you can decide with a calculator instead of a feeling.',
            },
            {
                type: 'heading',
                text: 'The cost of owning is not the EMI',
            },
            {
                type: 'paragraph',
                text: 'The most common mistake is comparing the monthly EMI against what you currently pay for hired ploughing. That comparison is wrong because ownership carries four costs the EMI does not include: depreciation, insurance, maintenance, and the interest you lose on your own down payment. Add them and the true annual cost of a 45 HP tractor is meaningfully higher than the loan statement suggests.',
            },
            {
                type: 'table',
                caption: 'Indicative annual ownership cost, 45 HP tractor, ₹7,00,000 on-road (2026)',
                table: {
                    headers: ['Cost head', 'Annual amount', 'Notes'],
                    rows: [
                        ['Loan interest', '₹56,000', 'At ~9% on a reducing balance, first-year interest portion'],
                        ['Depreciation', '₹70,000', 'Roughly 10% a year; steepest in years 1–3'],
                        ['Insurance', '₹12,000', 'Comprehensive; varies by state and claim history'],
                        ['Maintenance & servicing', '₹25,000', 'Higher after the warranty period ends'],
                        ['Diesel (500 hours)', '₹1,50,000', 'At ~5 L/hour and ₹60/L; the single largest variable'],
                        ['Total', '≈ ₹3,13,000', 'Before counting your own labour'],
                    ],
                },
            },
            {
                type: 'paragraph',
                text: 'Against this, custom hiring in most states runs ₹700–₹1,200 per hour for a tractor with a basic implement, inclusive of fuel and operator. Take ₹900 as a working figure. The ownership cost above, spread over 500 hours of genuine use, works out to roughly ₹626 per hour — cheaper than hiring, but only if you actually put in those 500 hours.',
            },
            {
                type: 'heading',
                text: 'Where the break-even actually sits',
            },
            {
                type: 'paragraph',
                text: 'This is where the argument usually falls apart. At 200 hours of annual use — which is closer to what a smallholding really needs — the same ₹3,13,000 spreads to about ₹1,565 per hour. That is comfortably more expensive than hiring. The tractor does not become cheaper than renting until you are using it somewhere around 350 to 400 hours a year.',
            },
            {
                type: 'paragraph',
                text: 'Translated into land, and assuming a mixed cropping pattern needing roughly 25–30 tractor-hours per acre per year across ploughing, sowing, spraying and haulage, the break-even lands in the region of 12 to 15 acres of owned or leased land under active cultivation. Below that, hiring is usually the rational choice, and the money saved is better placed in irrigation or storage.',
            },
            {
                type: 'callout',
                title: 'The exception that changes the maths',
                text: 'If you intend to rent the tractor out to neighbours, the calculation changes completely — custom hiring income can cover a large share of the fixed cost. But be realistic about utilisation: peak demand is concentrated into a few weeks around sowing and harvest, when everyone needs a tractor at once and nobody needs one in between.',
            },
            {
                type: 'heading',
                text: 'Check your own numbers in five steps',
            },
            {
                type: 'list',
                ordered: true,
                items: [
                    'Write down the hours you genuinely used a tractor last year. Not what you plan to use — what you actually hired. Most farmers overestimate by half.',
                    'Multiply by the local custom hiring rate to get your current annual spend.',
                    'Build the ownership table above with real quotes for your HP class and your state\'s insurance rate.',
                    'Divide total ownership cost by your honest annual hours to get a per-hour figure.',
                    'If ownership per-hour is not clearly below the hiring rate, hire — and revisit when your acreage grows.',
                ],
            },
            {
                type: 'heading',
                text: 'Subsidies change the picture, but less than expected',
            },
            {
                type: 'paragraph',
                text: 'Most states offer tractor subsidies through SMAM (Sub-Mission on Agricultural Mechanization), typically 25–50% of cost with a ceiling, and higher slabs for SC/ST, women and small/marginal farmers. A subsidy meaningfully lowers the purchase price and therefore both the interest and the depreciation base. What it does not touch is diesel and maintenance, which together are the majority of the running cost. A subsidy can move the break-even down by two or three acres. It rarely moves it below ten.',
            },
            {
                type: 'callout',
                title: 'Before you sign',
                text: 'Ask the dealer for the on-road price in writing, including registration and insurance, and confirm whether the quoted subsidy is already approved or merely applied for. Farmers routinely sign an EMI based on a subsidised price and then discover the application is still pending — leaving them servicing a loan on the full amount.',
            },
            {
                type: 'paragraph',
                text: 'None of this argues against owning a tractor. It argues for owning one at the point where it earns its keep. Below the break-even, the same capital in a borewell, drip system or storage shed usually returns more — and a hired tractor still turns up when you need it.',
            },
        ],
        related: [
            { label: 'Compare tractor models', href: '/home/machinery/tractors' },
            { label: 'Rent machinery near you', href: '/home/services/rent-machinery' },
            { label: 'Crop costing calculator', href: '/home/toolbox/crop-costing' },
        ],
    },
    {
        slug: 'reading-mandi-prices',
        title: 'How to read mandi prices and decide when to sell',
        description:
            'Modal price, arrivals and the spread between them tell you more than the headline rate. A practical guide to reading mandi data before you load the truck.',
        category: 'Crops',
        icon: '📈',
        publishedAt: '2026-08-19',
        updatedAt: '2026-08-19',
        readingMinutes: 7,
        blocks: [
            {
                type: 'paragraph',
                text: 'Mandi price data is public, updated daily, and almost universally misread. Most farmers look at one number — the maximum price — and conclude the market is strong. That number is often a single premium lot and tells you very little about what your produce will fetch. Reading the data properly takes about two minutes and regularly changes the decision.',
            },
            {
                type: 'heading',
                text: 'The three numbers that matter',
            },
            {
                type: 'paragraph',
                text: 'Every mandi report publishes minimum, maximum and modal price, along with arrivals measured in quintals or tonnes. The modal price is the rate at which the largest volume actually changed hands. It is the only one of the three that describes the typical transaction, and it is the number you should anchor on.',
            },
            {
                type: 'table',
                caption: 'What each figure tells you',
                table: {
                    headers: ['Figure', 'What it means', 'How to use it'],
                    rows: [
                        ['Minimum', 'Poorest quality lot sold that day', 'Your floor if grading is weak or moisture is high'],
                        ['Maximum', 'Best lot, often a single premium consignment', 'Aspirational only; ignore for planning'],
                        ['Modal', 'Rate of the largest traded volume', 'Your realistic expectation for average quality'],
                        ['Arrivals', 'Total quantity reaching the mandi', 'The leading indicator — read it before price'],
                    ],
                },
            },
            {
                type: 'heading',
                text: 'Arrivals move before price does',
            },
            {
                type: 'paragraph',
                text: 'Price is the lagging number. Arrivals are the leading one. When arrivals at your mandi climb sharply for three or four consecutive days, price almost always softens within the week, because traders know supply is building and have no reason to bid up. Conversely, a run of thin arrivals firms the rate even when nothing else has changed.',
            },
            {
                type: 'paragraph',
                text: 'This is the single most useful habit to build: check arrivals first, price second. A farmer watching arrivals can often sell two or three days ahead of a slide that everyone else notices only when the rate has already dropped.',
            },
            {
                type: 'callout',
                title: 'Compare against the same week last year',
                text: 'Agricultural prices are strongly seasonal. A rate that looks poor in absolute terms may be well above the same week last year, and a rate that looks strong may simply be the normal post-harvest peak. Always compare like-for-like weeks, not against last month.',
            },
            {
                type: 'heading',
                text: 'The spread between nearby mandis',
            },
            {
                type: 'paragraph',
                text: 'Rates for the same commodity routinely differ by ₹100–₹400 per quintal between mandis 40 or 50 km apart. That gap is worth chasing only if it clears your transport cost, and the arithmetic is straightforward: multiply the price difference by your quintals, then subtract hire charges, loading, unloading and your own day. A ₹200 spread on 30 quintals is ₹6,000 gross — comfortably worth a 50 km trip. The same ₹200 on 4 quintals is ₹800, which a tractor-trolley round trip will consume entirely.',
            },
            {
                type: 'heading',
                text: 'When holding stock makes sense, and when it does not',
            },
            {
                type: 'paragraph',
                text: 'Holding for a better price is a real strategy with real costs. Storage carries three: physical loss to moisture, pests and rodents, typically 2–5% over a few months in ordinary conditions; the interest on money you have not yet received; and the risk that the price falls further. Against that sits the historical tendency for rates to recover from the post-harvest trough as arrivals thin.',
            },
            {
                type: 'list',
                items: [
                    'Holding usually makes sense when arrivals are at a seasonal peak and your storage is genuinely dry and pest-proof.',
                    'It rarely makes sense if you are servicing a loan whose interest exceeds the price recovery you are hoping for.',
                    'It almost never makes sense for high-moisture produce, where quality loss outruns any price gain.',
                ],
            },
            {
                type: 'callout',
                title: 'Check the MSP before anything else',
                text: 'For crops under the Minimum Support Price system, confirm the current MSP and whether procurement is actually open at your nearest centre. Procurement windows are time-bound and close earlier than most farmers expect. If MSP procurement is available and your produce meets the specification, that is usually your floor and often your best realistic outcome.',
            },
            {
                type: 'paragraph',
                text: 'None of this requires special tools. Daily mandi data is published by the government and mirrored in the Miraitu mandi section. Two minutes with arrivals, modal price and last year\'s comparable week will beat a rumour from the mandi gate almost every time.',
            },
        ],
        related: [
            { label: 'Today\'s mandi prices', href: '/home/crops/mandi/prices' },
            { label: 'Price trends', href: '/home/crops/mandi/trends' },
            { label: 'Nearby mandis', href: '/home/crops/mandi/nearby' },
        ],
    },
    {
        slug: 'soil-testing-guide',
        title: 'Soil testing: how to sample properly and read the report',
        description:
            'Most soil tests are wasted because the sample was collected wrong. How to sample correctly, what each figure on the report means, and what to change.',
        category: 'Soil & Water',
        icon: '🌱',
        publishedAt: '2026-08-19',
        updatedAt: '2026-08-19',
        readingMinutes: 9,
        blocks: [
            {
                type: 'paragraph',
                text: 'A soil test costs very little and is the highest-return diagnostic available to a farmer — it routinely reveals that a third or more of fertiliser spending is going onto nutrients the soil already holds in plenty. Yet most reports end up in a drawer, either because the sample was taken carelessly or because the numbers were never explained. Both problems are fixable.',
            },
            {
                type: 'heading',
                text: 'Sampling is where tests go wrong',
            },
            {
                type: 'paragraph',
                text: 'A laboratory analyses exactly what you send it. If you scoop soil from one convenient corner near the field bund, the report describes that corner and nothing else. Fertiliser decisions for the whole field then rest on a sample that was never representative.',
            },
            {
                type: 'list',
                ordered: true,
                items: [
                    'Walk the field in a zig-zag and mark 10 to 15 spots spread across it. Avoid bunds, field edges, old manure heaps, and any patch that visibly differs from the rest — sample those separately if you care about them.',
                    'At each spot, scrape aside surface trash, then dig a V-shaped hole to 15 cm and take a uniform slice from top to bottom of one face. A slice, not a scoop — nutrients vary sharply with depth.',
                    'Collect all slices in a clean plastic bucket. Never galvanised metal, which contaminates the zinc reading.',
                    'Mix thoroughly, spread on a clean sheet, and quarter it: discard two opposite quarters, remix the rest, and repeat until about half a kilogram remains.',
                    'Air-dry in shade. Never in the sun and never over heat, both of which alter the chemistry.',
                    'Label with field name, date, present crop and the crop you intend to sow.',
                ],
            },
            {
                type: 'callout',
                title: 'Sample at the right time',
                text: 'Collect after harvest and before the next fertiliser application. Sampling soon after fertilising returns readings that describe the fertiliser, not the soil, and will lead you to under-apply the following season.',
            },
            {
                type: 'heading',
                text: 'Reading the report',
            },
            {
                type: 'paragraph',
                text: 'Indian soil health cards report a standard set of parameters. The units matter as much as the numbers, and the interpretation bands below are the ones most state laboratories work to.',
            },
            {
                type: 'table',
                caption: 'Common parameters and typical interpretation',
                table: {
                    headers: ['Parameter', 'Typical band', 'What it means'],
                    rows: [
                        ['pH', '6.5 – 7.5 ideal', 'Below 6.0 is acidic; above 8.0 alkaline. Extremes lock up nutrients regardless of how much you apply'],
                        ['EC (dS/m)', 'Below 1.0 normal', 'Above 2.0 indicates salinity that will restrict germination'],
                        ['Organic carbon (%)', 'Above 0.75 good', 'Below 0.5 is the single most common deficiency in Indian soils'],
                        ['Nitrogen (kg/ha)', 'Above 560 high', 'Mobile and seasonal; the least stable reading on the card'],
                        ['Phosphorus (kg/ha)', '10 – 25 medium', 'Builds up over years; frequently over-applied'],
                        ['Potassium (kg/ha)', '120 – 280 medium', 'Often adequate in Indian soils and needlessly supplemented'],
                        ['Zinc (ppm)', 'Above 0.6 sufficient', 'Widespread deficiency, especially in rice systems'],
                    ],
                },
            },
            {
                type: 'heading',
                text: 'Fix pH before you buy anything else',
            },
            {
                type: 'paragraph',
                text: 'If pH is outside roughly 6.0 to 8.0, correcting it should come before any change in fertiliser. Nutrient availability depends on pH: phosphorus in particular becomes chemically unavailable in both strongly acidic and strongly alkaline soils. Applying more DAP to a soil at pH 8.5 largely wastes the money, because the phosphate binds with calcium and the crop cannot reach it.',
            },
            {
                type: 'list',
                items: [
                    'Acidic soils (below 6.0) are corrected with agricultural lime, applied well before sowing so it has time to react.',
                    'Alkaline soils (above 8.0) are usually treated with gypsum, alongside organic matter to improve structure.',
                    'Both corrections work slowly. Expect to re-test after a full season rather than a few weeks.',
                ],
            },
            {
                type: 'heading',
                text: 'Organic carbon is the number to watch over years',
            },
            {
                type: 'paragraph',
                text: 'Organic carbon governs water-holding capacity, microbial activity and structure. Most Indian soils sit below 0.5%, which is low, and continuous chemical fertilisation without organic return pushes it lower. Farmyard manure, compost, green manure crops and simply returning crop residue instead of burning it all raise it — slowly. A rise from 0.4% to 0.6% over three or four seasons is realistic and worth more than any single-season fertiliser adjustment.',
            },
            {
                type: 'callout',
                title: 'One test is a snapshot; three is a trend',
                text: 'Keep every report. The individual numbers matter less than their direction over time. A phosphorus reading climbing year on year tells you to reduce DAP long before the level becomes a problem — and that saved spending is usually far larger than the cost of testing.',
            },
        ],
        related: [
            { label: 'Book a soil test', href: '/home/services/soil-testing' },
            { label: 'Fertilizer guide', href: '/home/toolbox/fertilizer-guide' },
            { label: 'Organic manure', href: '/home/shop/organic-manure' },
        ],
    },
    {
        slug: 'kcc-loan-application-guide',
        title: 'Kisan Credit Card: what it actually costs and how to apply',
        description:
            'KCC is the cheapest formal credit available to Indian farmers, but only if you use it correctly. Eligibility, real interest rate, documents and common rejections.',
        category: 'Finance',
        icon: '🏦',
        publishedAt: '2026-08-19',
        updatedAt: '2026-08-19',
        readingMinutes: 8,
        blocks: [
            {
                type: 'paragraph',
                text: 'The Kisan Credit Card is the cheapest formal credit most farmers can access, and it is routinely misunderstood in two directions: farmers who qualify never apply, and farmers who hold one lose the interest concession without realising it. Both are avoidable.',
            },
            {
                type: 'heading',
                text: 'What the interest rate really is',
            },
            {
                type: 'paragraph',
                text: 'The headline KCC rate is around 9%, which sounds unremarkable. The concessions are what make it worth having. Under the interest subvention scheme, crop loans up to ₹3 lakh carry a 2% subvention, bringing the effective rate to about 7%. A further 3% prompt repayment incentive applies if you repay on time — taking the effective rate to roughly 4%.',
            },
            {
                type: 'table',
                caption: 'Effective interest on a KCC crop loan up to ₹3 lakh',
                table: {
                    headers: ['Scenario', 'Effective rate', 'Interest on ₹1,00,000 for one year'],
                    rows: [
                        ['Repaid on time', '≈ 4%', '≈ ₹4,000'],
                        ['Repaid late (subvention only)', '≈ 7%', '≈ ₹7,000'],
                        ['Defaulted / overdue', '≈ 9% and rising', '₹9,000 and upward, plus penalties'],
                    ],
                },
            },
            {
                type: 'callout',
                title: 'The 3% is where farmers lose money',
                text: 'The prompt repayment incentive is not automatic and it is not partial. Miss the repayment date and you lose the entire 3% for that cycle — more than doubling your effective interest. Many farmers repay a few weeks late, assume it is a small matter, and pay nearly twice the interest they expected.',
            },
            {
                type: 'heading',
                text: 'Who is eligible',
            },
            {
                type: 'list',
                items: [
                    'Owner-cultivators, in their own name, with land records to show.',
                    'Tenant farmers, sharecroppers and oral lessees — though in practice these applications face more friction and often need a certificate from the revenue authority.',
                    'Self-help group or joint liability group members engaged in farming.',
                    'Those in allied activities: dairy, poultry, fisheries, beekeeping. The limits differ from crop loans but the card is the same.',
                ],
            },
            {
                type: 'heading',
                text: 'Documents to carry',
            },
            {
                type: 'list',
                ordered: true,
                items: [
                    'Identity and address proof — Aadhaar is accepted almost everywhere and simplifies the rest.',
                    'Land records: khatauni, khasra, 7/12 extract or pattadar passbook, depending on your state.',
                    'Passport photographs, usually two.',
                    'PAN, increasingly requested above certain limits.',
                    'A copy of your cropping pattern or intended sowing plan — not always demanded, but it speeds up limit setting.',
                ],
            },
            {
                type: 'heading',
                text: 'How the limit is calculated',
            },
            {
                type: 'paragraph',
                text: 'The credit limit is not arbitrary. It is built from the district-level scale of finance for your crop — a per-acre figure set by the district technical committee — multiplied by your cultivated area, plus an allowance for post-harvest expenses and household needs, plus a maintenance component if you hold farm assets. Knowing this is useful: if the limit you are offered looks low, ask which scale of finance was applied and for which crop. Errors here are common, particularly for farmers growing higher-value crops than the default assumed for the district.',
            },
            {
                type: 'heading',
                text: 'Why applications get rejected',
            },
            {
                type: 'list',
                items: [
                    'Land records not mutated after inheritance or purchase — by far the most common cause, and one that takes months to fix at the revenue office. Check this before you apply.',
                    'An existing overdue loan at the same or another bank.',
                    'Mismatch between the name on land records and on Aadhaar or PAN, often a spelling variation.',
                    'Applying at a branch outside your service area; banks generally lend within their operational boundary.',
                ],
            },
            {
                type: 'callout',
                title: 'Use it as working capital, not a term loan',
                text: 'KCC is a revolving credit facility priced for short-cycle crop expenses. Farmers who draw the full limit to buy an asset — a pump, a bike, a wedding — and then cannot repay within the cycle lose the concession and end up on the full rate. For asset purchases, ask about a separate term loan, which is designed for the purpose and repaid over years.',
            },
            {
                type: 'paragraph',
                text: 'Rates, subvention and limits are revised periodically and vary between banks and states. Confirm the current figures at your branch before deciding, and get the sanctioned limit and repayment date in writing.',
            },
        ],
        related: [
            { label: 'Farm loans', href: '/home/finance/loan' },
            { label: 'Crop insurance', href: '/home/finance/insurance' },
            { label: 'Interest calculator', href: '/home/toolbox/interest-calculator' },
        ],
    },
    {
        slug: 'choosing-dairy-cattle',
        title: 'Choosing dairy cattle: what to check before you pay',
        description:
            'Buying a milch animal is a five-year commitment made in twenty minutes. A practical inspection checklist, realistic yield expectations and the traps to avoid.',
        category: 'Livestock',
        icon: '🐄',
        publishedAt: '2026-08-19',
        updatedAt: '2026-08-19',
        readingMinutes: 8,
        blocks: [
            {
                type: 'paragraph',
                text: 'A milch animal is a multi-year investment usually decided in a single visit, often under pressure from a seller who knows the animal far better than you do. The gap in information is the whole problem. This checklist narrows it.',
            },
            {
                type: 'heading',
                text: 'Match the breed to your conditions, not to the highest yield',
            },
            {
                type: 'paragraph',
                text: 'The highest-yielding breed is rarely the right one. Yield figures quoted for exotic and crossbred animals assume good fodder, clean water, shade and veterinary access. Remove any of those and the animal underperforms badly while still eating like a high-yielder.',
            },
            {
                type: 'table',
                caption: 'Common dairy breeds in India — indicative figures',
                table: {
                    headers: ['Breed', 'Typical yield (L/day)', 'Suits'],
                    rows: [
                        ['Gir', '8 – 12', 'Hot dry regions; hardy, low input, good disease resistance'],
                        ['Sahiwal', '8 – 12', 'North India; tolerant of heat and poor fodder'],
                        ['Red Sindhi', '6 – 10', 'Hot humid areas; very hardy'],
                        ['Murrah buffalo', '10 – 15', 'High fat milk; needs wallowing and shade'],
                        ['HF crossbred', '15 – 25', 'Only with assured green fodder, water, shade and vet access'],
                        ['Jersey crossbred', '10 – 15', 'Moderate inputs; more heat-tolerant than HF'],
                    ],
                },
            },
            {
                type: 'callout',
                title: 'Discount the seller\'s yield claim',
                text: 'Ask to milk the animal yourself, at the normal milking time, on the day you visit. Sellers routinely quote peak-lactation figures for an animal now well past peak, or withhold milking beforehand so the udder looks fuller. Milking it yourself settles the question in ten minutes.',
            },
            {
                type: 'heading',
                text: 'The physical inspection',
            },
            {
                type: 'list',
                ordered: true,
                items: [
                    'Udder: should be soft and pliable after milking, not hard or lumpy. Hardness suggests mastitis, current or past. Check all four quarters separately — a blind quarter cuts yield permanently by roughly a quarter.',
                    'Teats: four, evenly placed, undamaged. Injured or blocked teats are a lasting problem.',
                    'Milk vein: the vein running along the belly should be prominent and winding in a good milker.',
                    'Teeth: the most reliable age check. A seller\'s stated age is an opinion; dentition is evidence. Learn to read the incisors, or bring someone who can.',
                    'Legs and hooves: an animal that walks stiffly or favours a leg will struggle to stand for milking and lose condition.',
                    'Eyes, nose, coat: bright eyes, dry muzzle, smooth coat. Discharge, dullness or a staring coat all warrant walking away.',
                    'Body condition: ribs faintly visible but not prominent. Very thin suggests poor health or underfeeding; very fat often means the animal is dry and not in milk.',
                ],
            },
            {
                type: 'heading',
                text: 'Lactation stage decides what you are actually buying',
            },
            {
                type: 'paragraph',
                text: 'An animal in its second or third lactation, one to two months after calving, is generally the best buy — proven productivity, peak yield ahead, years of production remaining. A first-lactation heifer is unproven. An animal in its sixth lactation is near the end of its productive life whatever the current yield suggests.',
            },
            {
                type: 'paragraph',
                text: 'Ask directly how many times the animal has calved and when it last calved. Cross-check against the teeth. If the answers do not agree, that discrepancy tells you more about the seller than about the animal.',
            },
            {
                type: 'heading',
                text: 'Paperwork and health',
            },
            {
                type: 'list',
                items: [
                    'Vaccination record, particularly foot-and-mouth disease and haemorrhagic septicaemia.',
                    'Pregnancy status, confirmed by a veterinarian rather than asserted by the seller. A pregnant animal is worth substantially more, and a false claim is a common fraud.',
                    'Insurance, if the animal is already covered, and whether the policy can transfer.',
                    'Where available, a written sale receipt naming both parties. It is worth little in law without registration but discourages the most casual misrepresentation.',
                ],
            },
            {
                type: 'callout',
                title: 'Budget for the first month',
                text: 'A newly purchased animal in a new shed, new water, new fodder and new handling almost always drops yield for two to four weeks. Plan for it. Farmers who budget only the purchase price frequently panic, conclude they were cheated, and sell at a loss an animal that would have settled fine.',
            },
            {
                type: 'paragraph',
                text: 'If possible, take an experienced dairy farmer or a veterinarian with you and pay for their time. A second opinion costs a few hundred rupees against a purchase of tens of thousands, and it is the cheapest insurance in the transaction.',
            },
        ],
        related: [
            { label: 'Cattle listings', href: '/home/livestock/cattle' },
            { label: 'Veterinary services', href: '/home/veterinary' },
            { label: 'Semen finder', href: '/home/veterinary/semen-finder' },
        ],
    },
    {
        slug: 'drip-irrigation-payback',
        title: 'Drip irrigation: subsidy, real cost and how long it takes to pay back',
        description:
            'Drip saves water and raises yield, but the payback depends heavily on your crop and subsidy slab. The arithmetic, the maintenance nobody mentions, and when it is not worth it.',
        category: 'Soil & Water',
        icon: '💧',
        publishedAt: '2026-08-19',
        updatedAt: '2026-08-19',
        readingMinutes: 9,
        blocks: [
            {
                type: 'paragraph',
                text: 'Drip irrigation is promoted hard, subsidised heavily, and installed on a great many fields where it then silently fails within three seasons. The technology works — the failures are almost entirely about crop choice, water quality and maintenance. Knowing which category your field falls into before you commit is the difference between a good investment and a field of blocked emitters.',
            },
            {
                type: 'heading',
                text: 'What it costs and what the subsidy covers',
            },
            {
                type: 'paragraph',
                text: 'A drip system for one acre typically runs ₹45,000 to ₹90,000 depending on crop spacing — widely spaced orchard crops need far less lateral pipe per acre than closely spaced vegetables. Under the Per Drop More Crop component of PMKSY, small and marginal farmers generally receive around 55% subsidy and other farmers around 45%, with state top-ups in several states taking the effective share higher.',
            },
            {
                type: 'table',
                caption: 'Indicative cost for one acre, closely spaced crop (2026)',
                table: {
                    headers: ['Item', 'Amount'],
                    rows: [
                        ['System cost (mains, laterals, emitters, filter, fittings)', '₹70,000'],
                        ['Subsidy at 55% (small/marginal)', '– ₹38,500'],
                        ['Your share', '≈ ₹31,500'],
                        ['Annual maintenance (filters, flushing, replacements)', '≈ ₹3,000'],
                    ],
                },
            },
            {
                type: 'heading',
                text: 'Where the return actually comes from',
            },
            {
                type: 'paragraph',
                text: 'Drip returns money through four channels, and their relative size surprises most people. Water saving is the one everybody cites and rarely the largest in rupee terms, because water is often unpriced. The bigger gains are usually yield and fertiliser.',
            },
            {
                type: 'list',
                items: [
                    'Yield increase: commonly 15–40% for vegetables and orchard crops, from consistent moisture rather than flood-and-drought cycles.',
                    'Fertiliser efficiency: fertigation delivers nutrients to the root zone, cutting fertiliser use roughly 20–30% for the same result.',
                    'Labour: irrigation stops being a person walking the field redirecting channels.',
                    'Water and power: 40–60% less water, and correspondingly less pumping — which matters most where power is metered or diesel-pumped.',
                ],
            },
            {
                type: 'paragraph',
                text: 'For a vegetable or orchard crop on one acre, the combined effect commonly runs ₹15,000 to ₹35,000 a year. Against a subsidised outlay near ₹31,500, that is a payback of roughly one and a half to two years — genuinely good.',
            },
            {
                type: 'callout',
                title: 'For close-spaced field crops the maths is much weaker',
                text: 'Wheat, paddy and other broadcast or closely drilled crops need far more lateral pipe per acre while returning a smaller percentage yield gain. Payback often stretches past five years, by which point emitters and laterals are due for replacement. Drip pays best on widely spaced, higher-value crops — vegetables, cotton, sugarcane, banana, orchards.',
            },
            {
                type: 'heading',
                text: 'Water quality decides whether the system survives',
            },
            {
                type: 'paragraph',
                text: 'The commonest cause of failure is emitter blockage, and it is a water-quality problem. Borewell water high in carbonates, iron or suspended silt will progressively clog emitters, and by the time flow is visibly uneven the damage is done.',
            },
            {
                type: 'list',
                ordered: true,
                items: [
                    'Test your irrigation water before buying — for iron, carbonate hardness and total dissolved solids, not just potability.',
                    'Specify filtration to match. Sand or gravel filters for surface water carrying organic matter; screen or disc filters for borewell water carrying fine sediment. Skimping here guarantees failure.',
                    'Flush laterals on a schedule — open the end caps and let them run. Monthly during the season is a reasonable default.',
                    'Where carbonate or iron is high, plan periodic acid treatment. Your supplier should specify concentration and frequency; if they cannot, find another supplier.',
                ],
            },
            {
                type: 'heading',
                text: 'Applying for the subsidy',
            },
            {
                type: 'list',
                ordered: true,
                items: [
                    'Apply through your state horticulture or agriculture department, usually online, before purchasing. Buying first and applying afterwards generally forfeits the subsidy.',
                    'Choose a supplier empanelled with the state scheme. Systems from non-empanelled vendors are frequently rejected at inspection.',
                    'Keep the land records, Aadhaar, bank details and a soil or water test ready — most states require them.',
                    'Expect a field inspection after installation. The subsidy is normally released to your bank account afterwards, so budget to fund the full amount up front and wait for reimbursement.',
                ],
            },
            {
                type: 'callout',
                title: 'Budget the maintenance from day one',
                text: 'A drip system is not a one-time purchase. Filters need cleaning, laterals need flushing, emitters need occasional replacement, and rodents damage pipe. Farmers who budget only the installation tend to stop maintaining it by the second season — which is exactly when a well-maintained system starts repaying the investment.',
            },
            {
                type: 'paragraph',
                text: 'Subsidy rates and eligible crops are revised periodically and differ substantially by state. Confirm current rates with your district horticulture office before committing.',
            },
        ],
        related: [
            { label: 'Irrigation calculator', href: '/home/toolbox/irrigation-calc' },
            { label: 'Borewell services', href: '/home/borewell' },
            { label: 'Soil testing', href: '/home/services/soil-testing' },
        ],
    },
];

/** Newest first, for the index page. */
export const articlesByDate = (): readonly Article[] =>
    [...articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export const getArticle = (slug: string): Article | undefined =>
    articles.find((article) => article.slug === slug);

export const articleCategories = (): readonly Article['category'][] =>
    [...new Set(articles.map((a) => a.category))].sort();

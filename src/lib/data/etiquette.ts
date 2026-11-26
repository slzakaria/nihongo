// Short practical tips for travellers, keyed by scenario slug. Every scenario has its own list now;
// GENERAL_ETIQUETTE only remains as a fallback for any future scenario added without one yet.
// Kept to 3-4 points per list so each stays a quick, skimmable read rather than a long article.
export const GENERAL_ETIQUETTE = [
  'Tipping is not expected. Service is included in the price.',
  'A slight bow is the standard greeting and thank-you. A nod is enough in casual settings.',
  "Say すみません to get someone's attention and ありがとうございます to thank them.",
  'Keep your voice down on trains and in quiet places, and carry a small bag for rubbish since public bins are rare.',
];

export const ETIQUETTE: Record<string, string[]> = {
  greetings: [
    'The greeting word changes with the time of day: おはようございます in the morning, こんにちは in the afternoon, こんばんは in the evening.',
    'A bow is standard for greetings and thanks. A deeper, slower bow shows more respect or a sincere apology.',
    'Handshakes are uncommon between strangers — wait for the other person to offer one before extending your hand.',
    "Add さん after someone's family name rather than using their first name, even with people you know a little.",
  ],
  shopping: [
    "Staff greet you with いらっしゃいませ when you enter. You don't need to reply, though こんにちは is fine.",
    'Prices are fixed in almost all shops. Bargaining is not expected.',
    'Tax-free shopping needs your passport at the counter.',
  ],
  restaurant: [
    'Say ごちそうさまでした (gochisōsama deshita) when you finish eating, to thank the cook.',
    'The おしぼり (oshibori) is for cleaning your hands only, not your face.',
    'Many small restaurants use a ticket machine (けんばいき) near the door. Buy your ticket, then hand it to staff.',
    'Slurping noodles is normal and shows you are enjoying them.',
  ],
  'getting-around': [
    'Tap your IC card (Suica, Pasmo, or similar) at the gate. You can top it up at machines.',
    'In Tokyo, stand on the left on escalators. In Osaka, stand on the right.',
    'Priority seats are for elderly, pregnant and disabled passengers. Give them up if someone needs them.',
    'Do not talk on the phone on trains.',
  ],
  hotel: [
    'Check-in is usually from mid-afternoon and check-out is by about 11am.',
    'Remove your shoes at the entrance. Some rooms have slippers, and toilet slippers are separate. Change into them only for the toilet.',
    'Many Japanese hotels provide a yukata (light robe) for your room.',
    'Tipping is not expected.',
  ],
  'bar-cocktails': [
    'Many bars charge a small table fee (おとおし, otōshi) that appears on the bill.',
    'Pour drinks for others rather than for yourself. Wait for the toast (かんぱい, kanpai) before drinking.',
    'Popular bars are small. Arrive early or book ahead.',
    'Keep your voice down and check whether smoking is allowed before you sit.',
  ],
  'konbini-food': [
    'Ask レジぶくろはいりますか? (do you need a bag?). Bags usually cost a small fee.',
    'Ask あたためますか? (shall I heat it?) before you eat something from the shelves.',
    'Eat in the designated area or outside. Do not eat in the aisles.',
  ],
  'supermarket-izakaya': [
    'Sit only where staff direct you. Many izakaya have a small seating charge.',
    'Order a few dishes at a time. They arrive as they are ready, and sharing is normal.',
    'Say かんぱい (kanpai) at the start of the meal and do not start drinking before the toast.',
  ],
  onsen: [
    'Wash thoroughly at the seated washing stations before you enter the bath.',
    'Keep the small towel out of the water. Many people fold it on their head or place it on the edge.',
    'Tattoos are often not allowed. Check the signs or ask before you go in.',
    'Tie up long hair, keep splashing to a minimum, and keep your voice low in these quiet places.',
  ],
  'shrine-temple': [
    'At a shrine, purify your hands at the chōzuya: left hand, right hand, then rinse your mouth without touching the ladle to your lips.',
    'At a shrine, bow twice, clap twice, then bow once more before you leave.',
    'At a temple, bow quietly with your hands together. Clapping is not usual there.',
    'Do not take photos where signs forbid it, and keep your voice low inside the grounds.',
  ],
  shinkansen: [
    'Keep your phone on silent and speak quietly. Take calls between the cars.',
    'Check the car and seat number on your ticket before you sit down.',
    'Avoid strong-smelling food on board.',
    'Queue in the marked spots on the platform. Passengers line up before the doors open.',
  ],
  'money-banking': [
    'Cash is still widely used. Many places take cards, but not all of them.',
    'Many convenience store ATMs accept foreign cards. Check the fee first.',
    'Tipping is not expected.',
  ],
  emergencies: [
    'Dial 110 for the police and 119 for an ambulance or fire.',
    'Emergency staff may have limited English. A translation app helps.',
    'Staff at your hotel or a konbini can help you call for help.',
  ],
  'small-talk': [
    'Weather and food are safe openers.',
    'Avoid asking about salary or age too early.',
    'Short responses such as はい and ふーん show you are listening. Nod along.',
  ],
  'making-friends': [
    'Ask before you add someone on LINE. Exchanging contact details is common, but not automatic.',
    "If you visit someone's home, take a small gift (おみやげ, omiyage) and remove your shoes at the door.",
    'Compliments about Japan, the food, or your trip are an easy, appreciated way to keep a conversation going.',
  ],
  karaoke: [
    'Karaoke rooms are charged by the time, and the drink bar is usually included.',
    'Many groups share the microphone. Sing a few songs, then pass it on.',
    'You can order food and drinks from the phone in the room.',
  ],
  directions: [
    'Point with a whole open hand rather than one finger — it reads as more polite.',
    'People will sometimes walk a little way with you to show the route, rather than just pointing.',
    "Showing a map app on your phone when asking for directions is completely normal — don't feel shy about it.",
    'Addresses are based on area, block and building numbers rather than street names, so locals may point you toward a landmark instead.',
  ],
  'time-dates': [
    'Dates are often written year/month/day, and some calendars also show the Japanese era name (令和, Reiwa) next to the Western year.',
    'Punctuality matters — arriving even a few minutes late is considered impolite, so aim to be early.',
    'Timetables use 24-hour time, so expect to see "18:00" rather than "6pm".',
  ],
  'language-barrier': [
    "A small bow with すみません、日本語が話せません (I can't speak Japanese) goes a long way before switching to gestures or an app.",
    "Speaking slowly and simply helps more than speaking loudly — raising your voice doesn't improve understanding.",
    'Writing a word down or showing it on your phone is often clearer than saying it aloud, especially for place names.',
    'Many staff understand more English than they speak — give them a moment to reply.',
  ],
  'airport-arrival': [
    'Immigration and customs forms are usually completed online in advance (Visit Japan Web) — have the QR code ready.',
    'Queue quietly and keep your passport and boarding pass ready at each checkpoint.',
    'Luggage carts are often free near baggage claim but may need a small deposit elsewhere.',
  ],
  'lost-property-post': [
    'Lost items are very often returned — hand anything you find in to a station office or convenience store rather than keeping it.',
    'Post offices (郵便局, yūbinkyoku) close early and on weekends in smaller towns — check hours before relying on one.',
    'Packages can be sent from many convenience stores, not just post offices, which is often more convenient.',
  ],
  'pharmacy-health': [
    "Many common medicines (like strong painkillers or allergy medication) need a different dosage or aren't sold over the counter — ask the pharmacist rather than assuming.",
    'Clinics and hospitals usually expect payment at the time of the visit, often in cash.',
    'Pharmacists may ask about allergies and other medication — simple yes/no answers or a translation app help here.',
  ],
  'about-me': [
    "Job titles and company names come up naturally in introductions — it's a common, polite question, not prying.",
    'Age is sometimes asked indirectly through school year or birth year rather than directly.',
    'Modesty is valued — downplaying a compliment about your Japanese or skills is more natural than accepting it outright.',
  ],
  'tickets-games': [
    'Ticket machines are common for trains, cinemas and attractions — most have an English button in the corner.',
    'Queue politely and let staff scan or check your ticket without rushing them.',
    "At arcades and claw machines, hovering near someone else's machine while they play isn't usual — wait for a free one.",
  ],
  'bike-rental': [
    'Cycle on the left side of the road, same as traffic, and use bike lanes or the road rather than pavements where marked.',
    'A local registration sticker may be required for rentals — the shop usually sorts this out for you.',
    'Park only in marked bicycle parking areas; bikes left elsewhere can be impounded.',
  ],
  'all-you-can-eat': [
    '食べ放題 (tabehōdai) and 飲み放題 (nomihōdai) usually have a time limit, often 90–120 minutes — check before you start.',
    'Ordering more than you can finish is frowned upon; some places charge a small penalty for leftover food.',
    'Order in smaller rounds rather than everything at once, so food arrives fresh.',
  ],
  'entertainment-complex': [
    'Many arcades and complexes are cash-only or use a prepaid card bought from a machine inside.',
    'Keep bags and coats close in crowded arcades — space is often tight between machines.',
    'Photography is sometimes restricted inside, especially of other guests — check signs first.',
  ],
  'coin-laundry': [
    "Machines often take coins only — keep ¥100 coins on hand, as change machines aren't always available.",
    'Detergent is sometimes included in the cycle price and sometimes sold separately from a machine nearby.',
    "It's considered polite to collect your laundry promptly rather than leaving it in the machine for long.",
  ],
  'shopkeeper-chat': [
    'Small shop owners often enjoy a short chat with regulars or curious travellers — a few words in Japanese are always appreciated.',
    "It's fine to browse without buying, but acknowledge the いらっしゃいませ greeting with a nod or こんにちは.",
    "Haggling isn't expected, even in small, family-run shops.",
  ],
  'weather-events': [
    'Typhoon and earthquake alerts arrive automatically on Japanese phones; apps like Yurekuru Call give the same alerts in English.',
    'If a train stops for weather or a natural event, staff announcements are the most reliable source — stay calm and follow instructions.',
    "Convenience stores and station staff are good places to ask what's happening during a sudden event.",
  ],
  'apology-repair': [
    'A sincere, unhurried すみません or 申し訳ございません goes further than over-explaining what went wrong.',
    "Staff will often apologise to you even when the problem wasn't their fault — it's a politeness norm, not an admission of blame.",
    'Keep your tone calm; raising your voice when complaining is unusual and can make things harder to resolve.',
  ],
  'vending-machines': [
    'Machines sell far more than drinks, and some have hot and cold options side by side (look for the red/blue labels).',
    'Most accept coins and small bills; IC cards (Suica, Pasmo) work in many too.',
    'Take your can or bottle to the recycling bin usually attached to the machine rather than general rubbish.',
  ],
  'hair-salon': [
    "Expect a consultation with pictures or gestures if there's a language gap — staff are used to this with overseas guests.",
    'A head massage or scalp wash is often included, even for a simple haircut.',
    "Tipping is not expected, even for a service you're very happy with.",
  ],
  'gym-fitness': [
    'Many gyms require indoor-only shoes, separate from the ones you wore outside.',
    'A small hand towel is often required for wiping down machines after use.',
    'Tattoos may need to be covered at public gyms and pools — check the policy before you go.',
  ],
  'otaku-culture': [
    'Photography of merchandise or displays is often restricted — look for a camera icon with a line through it before taking a photo.',
    'Browsing for a long time without buying is completely normal in manga and anime shops.',
    'Some shops are organised by floor and genre — check the floor guide near the entrance rather than wandering.',
  ],
  'grammar-connectors': [
    "Counting words change depending on what you're counting (flat objects, cups, people) — don't worry about getting it perfect, context carries you.",
    'Adding ください after a word or quantity is a simple, polite way to request something, even without a full sentence.',
    'Speaking in short, polite phrases is completely normal for visitors — nobody expects full textbook sentences.',
  ],
  'vocabulary-adjectives': [
    'Softening an opinion with ちょっと (a little) or かもしれません (maybe) feels more natural than a flat statement, especially about something negative.',
    'Describing food, places or service as とても良い (very good) is a safe, appreciated compliment.',
    'Direct criticism is rare in conversation; a polite but vague comment is more common than outright disagreement.',
  ],
};

export function getEtiquetteTips(slug: string): string[] {
  return ETIQUETTE[slug] ?? GENERAL_ETIQUETTE;
}

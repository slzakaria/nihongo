// Short practical tips for travellers, keyed by scenario slug. Scenarios without their own list get the general tips.
export const GENERAL_ETIQUETTE = [
  'Tipping is not expected. Service is included in the price.',
  'A slight bow is the standard greeting and thank-you. A nod is enough in casual settings.',
  'Keep your voice down on trains and in quiet places.',
  'Say すみません to get someone\'s attention and ありがとうございます to thank them.',
  'Bins are rare on streets, so carry a small bag for your rubbish.',
]

export const ETIQUETTE: Record<string, string[]> = {
  restaurant: [
    'Tipping is not expected. Service is included.',
    'Say ごちそうさまでした (gochisōsama deshita) when you finish eating, to thank the cook.',
    'The おしぼり (oshibori) is for cleaning your hands only, not your face.',
    'Many small restaurants use a ticket machine (けんばいき) near the door. Buy your ticket, then hand it to staff.',
    'Slurping noodles is normal and shows you are enjoying them.',
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
    'Tie up long hair, keep splashing to a minimum, and stay quiet.',
  ],
  sento: [
    'Wash thoroughly at the seated washing stations before you enter the bath.',
    'Keep the small towel out of the water.',
    'Keep your voice low. A sento is a quiet place for relaxing.',
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
  shopping: [
    'Staff greet you with いらっしゃいませ when you enter. You can reply with こんにちは.',
    'Prices are fixed in almost all shops. Bargaining is not expected.',
    'Tax-free shopping needs your passport at the counter.',
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
    'If you visit someone\'s home, take a small gift (おみやげ, omiyage) and remove your shoes at the door.',
  ],
  karaoke: [
    'Karaoke rooms are charged by the time, and the drink bar is usually included.',
    'Many groups share the microphone. Sing a few songs, then pass it on.',
    'You can order food and drinks from the phone in the room.',
  ],
}

export function getEtiquetteTips(slug: string): string[] {
  return ETIQUETTE[slug] ?? GENERAL_ETIQUETTE
}

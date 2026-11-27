import { Scenario } from '@/types';

const roles: Record<string, string> = {
  'greetings':             'friendly local you just met on the street',
  'shopping':              'shop assistant at a clothing store in Harajuku',
  'restaurant':            'server at a mid-range Japanese restaurant',
  'getting-around':        'station staff member at a busy Tokyo train station',
  'hotel':                 'front desk staff at a business hotel in Tokyo',
  'bar-cocktails':         'craft bartender at a high-end cocktail bar in Tokyo',
  'emergencies':           'helpful bystander who speaks some English',
  'time-dates':            'friendly local helping you understand schedules and plans',
  'language-barrier':      'Japanese local who speaks very little English and is trying to help',
  'money-banking':         'bank teller or currency exchange clerk at a post office bank',
  'airport-arrival':       'immigration or customs officer at Narita or Haneda airport',
  'lost-property-post':    'staff member at a koban (police box) lost-and-found counter',
  'supermarket-izakaya':   'friendly izakaya staff doubling as a supermarket cashier',
  'karaoke':               'karaoke box reception staff in a lively entertainment venue',
  'small-talk':            'friendly local striking up casual conversation',
  'onsen':                 'staff member at a traditional hot spring inn (ryokan)',
  'pharmacy-health':       'pharmacist at a local drugstore (薬局)',
  'about-me':              'curious local chatting with you at a social gathering',
  'tickets-games':         'ticket booth staff at a baseball stadium or amusement park',
  'bike-rental':           'staff member at a bicycle rental shop near a tourist area',
  'all-you-can-eat':       'staff at a yakiniku all-you-can-eat (食べ放題) restaurant',
  'entertainment-complex': 'staff at a large entertainment complex (arcade, bowling, karaoke)',
  'coin-laundry':          'regular at the coin laundry who offers to help you use the machines',
  'shopkeeper-chat':       'small shopkeeper at a traditional shotengai (shopping street)',
  'shinkansen':            'shinkansen conductor or platform staff at a bullet train station',
  'weather-events':        'local checking the forecast before a festival or outdoor event',
  'apology-repair':        'shop manager handling a complaint or a misunderstanding politely',
  'shrine-temple':         'shrine or temple staff member (miko or monk) at a popular site',
  'vending-machines':      'friendly local helping you navigate a Japanese vending machine',
  'hair-salon':            'hair stylist at a Japanese barbershop or beauty salon',
  'gym-fitness':           'staff member at a local gym or sports centre',
  'otaku-culture':         'enthusiastic shop clerk at an Akihabara anime or manga store',
  'konbini-food':          'convenience store clerk at a 7-Eleven, Lawson, or FamilyMart',
  'making-friends':        'friendly person your age you met at a language exchange event',
  'grammar-connectors':    'patient Japanese tutor helping you practise connecting sentences',
  'vocabulary-adjectives': 'patient Japanese tutor helping you practise describing things',
};

export function getRoleForScenario(slug: string): string {
  return roles[slug] ?? 'Japanese local';
}

// Static opening line per scenario so the user never has to start cold —
// one fixed sentence per category (no extra API call, and it's TTS-cacheable).
const starters: Record<string, string> = {
  'greetings':
    'こんにちは！\n[HINT: Hello!]',
  'shopping':
    'いらっしゃいませ、何かお探しですか？\n[HINT: Welcome! Are you looking for something?]',
  'restaurant':
    'いらっしゃいませ、何名様ですか？\n[HINT: Welcome! How many people?]',
  'getting-around':
    'いらっしゃいませ、どちらまでですか？\n[HINT: Hello! Where are you headed?]',
  'hotel':
    'いらっしゃいませ、ご予約のお客様でしょうか？\n[HINT: Welcome! Do you have a reservation?]',
  'bar-cocktails':
    'いらっしゃいませ、何になさいますか？\n[HINT: Welcome! What would you like to have?]',
  'emergencies':
    '大丈夫ですか？\n[HINT: Are you okay?]',
  'time-dates':
    'すみません、今何時ですか？\n[HINT: Excuse me, what time is it?]',
  'language-barrier':
    'あの…日本語、わかりますか？\n[HINT: Um… do you understand Japanese?]',
  'money-banking':
    'いらっしゃいませ、本日はどのようなご用件でしょうか？\n[HINT: Welcome! What can I help you with today?]',
  'airport-arrival':
    'パスポートを見せてください。\n[HINT: Please show me your passport.]',
  'lost-property-post':
    'こんにちは、どうされましたか？\n[HINT: Hello, what happened? / What can I help you with?]',
  'supermarket-izakaya':
    'いらっしゃいませ！何にしますか？\n[HINT: Welcome! What will you have?]',
  'karaoke':
    'いらっしゃいませ！何名様ですか？\n[HINT: Welcome! How many people?]',
  'small-talk':
    'こんにちは、いい天気ですね。\n[HINT: Hello, nice weather, isn\'t it?]',
  'onsen':
    'いらっしゃいませ、タオルはこちらです。\n[HINT: Welcome! The towels are over here.]',
  'pharmacy-health':
    'いらっしゃいませ、どうされましたか？\n[HINT: Welcome, what seems to be the problem?]',
  'about-me':
    'わあ、日本は初めてですか？お名前を聞いてもいいですか？\n[HINT: Wow, is this your first time in Japan? May I ask your name?]',
  'tickets-games':
    'いらっしゃいませ！チケットはいかがですか？\n[HINT: Welcome! Would you like a ticket?]',
  'bike-rental':
    'いらっしゃいませ！自転車をレンタルしたいですか？\n[HINT: Welcome! Would you like to rent a bicycle?]',
  'all-you-can-eat':
    'いらっしゃいませ！食べ放題のご案内をします。\n[HINT: Welcome! I\'ll explain the all-you-can-eat course.]',
  'entertainment-complex':
    'いらっしゃいませ！今日は何をされますか？\n[HINT: Welcome! What would you like to do today?]',
  'coin-laundry':
    'あの、コインランドリーを使いたいですか？教えましょうか？\n[HINT: Um, would you like to use the laundry? Shall I show you how?]',
  'shopkeeper-chat':
    'いらっしゃい！どうぞゆっくり見てください。\n[HINT: Welcome! Please take your time and look around.]',
  'shinkansen':
    'お客様、切符を拝見してもよろしいでしょうか？\n[HINT: Excuse me, may I see your ticket?]',
  'weather-events':
    'こんにちは！今日は天気がいいですね。お祭りに行きますか？\n[HINT: Hello! The weather is nice today. Are you going to the festival?]',
  'apology-repair':
    '大変失礼いたしました。どのようなことがありましたか？\n[HINT: I am very sorry for the inconvenience. What happened?]',
  'shrine-temple':
    'ようこそ。何かご質問はありますか？\n[HINT: Welcome. Do you have any questions?]',
  'vending-machines':
    'あの、自動販売機の使い方がわかりますか？\n[HINT: Um, do you know how to use the vending machine?]',
  'hair-salon':
    'いらっしゃいませ！ご予約はされていますか？\n[HINT: Welcome! Do you have an appointment?]',
  'gym-fitness':
    'いらっしゃいませ！会員証を見せていただけますか？\n[HINT: Welcome! Could I see your membership card?]',
  'otaku-culture':
    'いらっしゃいませ！何かお探しですか？アニメ、マンガ、フィギュア…なんでもありますよ！\n[HINT: Welcome! Looking for something? We have anime, manga, figures… everything!]',
  'konbini-food':
    'いらっしゃいませ！\n[HINT: Welcome!]',
  'making-friends':
    'こんにちは！日本語の勉強をしているんですか？\n[HINT: Hi! Are you studying Japanese?]',
  'grammar-connectors':
    'こんにちは！今日は「〜て形」の練習をしましょう。準備はいいですか？\n[HINT: Hello! Today let\'s practise the て-form. Are you ready?]',
  'vocabulary-adjectives':
    'こんにちは！今日は形容詞の練習をしましょう。まず、周りのものを説明してみてください。\n[HINT: Hello! Today let\'s practise adjectives. First, try describing things around you.]',
};

export function getScenarioStarter(slug: string): string | undefined {
  return starters[slug];
}

// Ordered steps the AI walks through, so each conversation has a shape instead of only reacting
const flows: Record<string, string[]> = {
  'greetings': [
    'Greet them and ask how they are doing',
    'Ask where they are from',
    'Ask how long they are staying in Japan',
    'Ask what they like to do here',
    'Say goodbye and invite them to chat again',
  ],
  'shopping': [
    'Greet them and ask what they are looking for',
    'Ask about size, colour, and style preferences',
    'Show an option and recommend one',
    'Offer a fitting room and ask them to try it on',
    'Ask whether they want a bag and how they will pay',
  ],
  'restaurant': [
    'Greet and ask how many people are in the party',
    'Seat them and offer water or a drink',
    'Take the food order, asking about dishes and drinks',
    'Confirm the order back and ask about allergies or spice level',
    'Ask if anything else is needed, then bring the bill and ask how they want to pay',
  ],
  'getting-around': [
    'Greet them and ask where they are headed',
    'Explain the line and the platform to take',
    'Ask whether they need a ticket or an IC card',
    'Confirm the next train and the approximate travel time',
    'Wish them a good trip',
  ],
  'hotel': [
    'Greet them and ask whether they have a reservation',
    'Confirm the name and check-in dates',
    'Explain check-in and hand over the room key card',
    'Ask about breakfast preference or any special requests',
    'Share the Wi-Fi password and elevator location, then say goodnight',
  ],
  'bar-cocktails': [
    'Welcome them and ask what they would like to drink',
    'Recommend a cocktail and ask about taste preferences (sweet, dry, strong)',
    'Confirm the order',
    'Make small talk while they wait',
    'Ask if they want another round, then mention the bill',
  ],
  'emergencies': [
    'Check whether they are okay and ask what happened',
    'Ask where they are and whether they are hurt',
    'Ask whether they need the police, an ambulance, or the fire brigade',
    'Ask whether someone can be contacted on their behalf',
    'Reassure them and stay with them until help arrives',
  ],
  'time-dates': [
    'Ask if they need help understanding the time or a schedule',
    'Ask what time or date they are trying to find out',
    'Explain the time or date clearly, using Japanese numbers',
    'Ask what they are planning to do at that time',
    'Confirm the plan and wish them luck',
  ],
  'language-barrier': [
    'Try to understand what they need using simple Japanese and gestures (described in text)',
    'Ask a yes/no question to narrow down what they want',
    'Offer a simple solution or direction using very short sentences',
    'Confirm they understood by asking かわかりましたか？',
    'Wish them well and offer further help if needed',
  ],
  'money-banking': [
    'Greet them and ask what they need help with today',
    'Ask whether they want to exchange currency, withdraw cash, or open an account',
    'Ask for their passport or identification',
    'Explain the exchange rate or the fee',
    'Complete the transaction and hand over a receipt',
  ],
  'airport-arrival': [
    'Ask to see their passport and boarding pass',
    'Ask the purpose of their visit (tourism, business, study)',
    'Ask how long they plan to stay',
    'Ask whether they have anything to declare at customs',
    'Welcome them to Japan and direct them to baggage claim',
  ],
  'lost-property-post': [
    'Ask what they lost and when they lost it',
    'Ask where they think they lost it',
    'Ask for a description of the item (colour, size, brand)',
    'Explain the process — check the database, fill in a form',
    'Give them a reference number and explain when to follow up',
  ],
  'supermarket-izakaya': [
    'Greet them and ask what they would like to order or buy',
    'Recommend a popular dish or drink',
    'Ask whether they want it hot or cold, or any customisation',
    'Confirm the order and tell them the price',
    'Ask whether they want a bag or chopsticks, and thank them',
  ],
  'karaoke': [
    'Greet them and ask how many people and how many hours',
    'Explain the room options and pricing',
    'Ask whether they want a drinks plan or food menu',
    'Show them to the room and explain the remote control system',
    'Check in after a while and ask if they need anything else',
  ],
  'small-talk': [
    'Open with a friendly comment about the weather or the place',
    'Ask about their day or what they have been up to',
    'Ask about their hobbies or plans in Japan',
    'Share a short opinion and ask a follow-up question',
    'Close warmly and suggest meeting again',
  ],
  'onsen': [
    'Greet them and hand over a towel and locker key',
    'Explain basic bathing etiquette (wash before entering, no towels in the bath)',
    'Ask whether they want to book a private room or dinner',
    'Ask whether they need a yukata and what size',
    'Wish them a relaxing bath and a good rest',
  ],
  'pharmacy-health': [
    'Ask what the problem is',
    'Ask how long it has lasted and where it hurts',
    'Ask about allergies or medicines they are already taking',
    'Recommend a medicine and explain how to take it',
    'Explain possible side effects and when to see a doctor',
  ],
  'about-me': [
    'Ask their name and where they are from',
    'Ask how they are finding Japan so far',
    'Ask what they do for work or study back home',
    'Ask what they enjoy doing in their free time',
    'Ask if they want to stay in touch and suggest meeting again',
  ],
  'tickets-games': [
    'Greet them and ask what event or attraction they want tickets for',
    'Ask for the number of people and any age or category (adult, child, student)',
    'Tell them the price and available time slots',
    'Process the ticket purchase and hand them over',
    'Explain where the entrance is and wish them a great time',
  ],
  'bike-rental': [
    'Greet them and ask how long they want to rent the bicycle',
    'Explain the available bike types and prices',
    'Ask for their ID or a deposit',
    'Go over the basic rules (helmet, where to park, return time)',
    'Hand over the bike and lock, and wish them a good ride',
  ],
  'all-you-can-eat': [
    'Welcome them and explain the all-you-can-eat time limit and rules',
    'Ask how many people and whether they want the standard or premium course',
    'Explain how to order (table tablet, paper form, or calling staff)',
    'Check on them mid-meal and ask if they want to order more',
    'Warn them when time is running out and bring the bill',
  ],
  'entertainment-complex': [
    'Greet them and ask what they want to do (arcade, bowling, karaoke, billiards)',
    'Explain the pricing or card system for the facility',
    'Ask how many people and how long they plan to stay',
    'Direct them to the right area and explain how it works',
    'Check in later and ask if they need anything or want to add time',
  ],
  'coin-laundry': [
    'Notice they look confused and offer to help',
    'Ask what they want to wash (clothes, bedding) and show them which machine to use',
    'Explain how to add coins and choose the cycle',
    'Tell them roughly how long it will take',
    'Point out where the dryers are and wish them luck',
  ],
  'shopkeeper-chat': [
    'Welcome them into the shop and invite them to browse',
    'Ask if they are looking for anything in particular or just browsing',
    'Tell them about a popular or special item in the shop',
    'Ask where they are from and how they found the shop',
    'Wrap up warmly, offer a small gift or discount, and invite them back',
  ],
  'shinkansen': [
    'Ask to see their ticket or reserved seat number',
    'Confirm the destination and the seat car number',
    'Explain where their seat is and how to stow luggage',
    'Announce the next stop and approximate arrival time',
    'Thank them for riding and wish them a good journey',
  ],
  'weather-events': [
    'Comment on today\'s weather and ask what they are planning',
    'Ask if they have checked the forecast for the event day',
    'Explain what the weather is expected to be like',
    'Give advice on what to bring (umbrella, sunscreen, layers)',
    'Wish them a great time at the event',
  ],
  'apology-repair': [
    'Greet them, notice they seem upset, and ask what happened',
    'Listen carefully and apologise sincerely for the inconvenience',
    'Ask what they would like as a resolution (refund, exchange, explanation)',
    'Offer a concrete solution and confirm it with them',
    'Thank them for their patience and apologise once more before closing',
  ],
  'shrine-temple': [
    'Welcome them to the site and ask if they have any questions',
    'Explain the etiquette (purification fountain, how to pray, bow)',
    'Tell them about a highlight of the shrine or temple',
    'Ask if they would like an omamori (amulet) or an omikuji (fortune)',
    'Wish them a meaningful visit and thank them for coming',
  ],
  'vending-machines': [
    'Notice they are confused and offer to help',
    'Ask what kind of drink they are looking for (hot, cold, juice, coffee)',
    'Point out the button for their choice and explain the price',
    'Help them insert the coins or IC card',
    'Make sure the drink came out correctly and wish them well',
  ],
  'hair-salon': [
    'Greet them and ask whether they have an appointment',
    'Ask what they would like done today (cut, colour, perm, wash)',
    'Ask about length, style, and any reference photos they have',
    'Check in during the service and ask if the pressure or temperature is okay',
    'Show them the result, ask for their feedback, and process payment',
  ],
  'gym-fitness': [
    'Greet them and ask for their membership card or whether they want a day pass',
    'Give them a brief tour — where the changing rooms, weights, and machines are',
    'Ask what kind of workout they are planning today',
    'Give a tip or recommendation for the facilities',
    'Remind them of closing time and wish them a good workout',
  ],
  'otaku-culture': [
    'Welcome them enthusiastically and ask what they are looking for',
    'Ask about their favourite anime, manga, or game to narrow down recommendations',
    'Show them a popular or new arrival item related to their interest',
    'Explain any limited edition or exclusive items in the store',
    'Ring up their purchase, offer a bag and special sticker, and thank them',
  ],
  'konbini-food': [
    'Greet them as they approach the counter',
    'Ask if they would like their bento or food heated up',
    'Ask if they have a point card (Ponta, T-card, etc.)',
    'Tell them the total and ask how they will pay (cash, IC card, QR)',
    'Hand over the bag with chopsticks and a receipt, and thank them',
  ],
  'making-friends': [
    'Introduce yourself and ask their name',
    'Ask how long they have been studying Japanese and why they started',
    'Ask what they like to do for fun — hobbies, music, games, sport',
    'Find common ground and suggest doing something together',
    'Exchange contact details (LINE, Instagram) and say you hope to meet again',
  ],
  'grammar-connectors': [
    'Introduce today\'s topic: connecting sentences with て-form or から/ので',
    'Give a simple example sentence and ask them to repeat it back',
    'Ask them to make their own sentence using the connector',
    'Gently correct any mistakes and ask them to try again',
    'Give positive reinforcement, introduce a slightly harder example, and close the session',
  ],
  'vocabulary-adjectives': [
    'Introduce today\'s topic: i-adjectives and na-adjectives',
    'Point to or describe something (colour, size, texture) and ask them to describe it',
    'Give a correct example and ask them to form their own sentence',
    'Ask them to compare two things using adjectives (bigger, more delicious)',
    'Wrap up with a short quiz — name five adjectives — and close warmly',
  ],
};

export function getScenarioFlow(slug: string): string[] {
  return (
    flows[slug] ?? ['Keep the conversation natural and move it forward with a question']
  );
}

export function getSimulatorPrompt(scenario: Scenario): string {
  const phraseList = scenario.phrases
    .map((p) => `- ${p.japanese} (${p.english})`)
    .join('\n');
  const steps = getScenarioFlow(scenario.slug)
    .map((step, i) => `${i + 1}. ${step}`)
    .join('\n');

  return `You are a native Japanese ${getRoleForScenario(scenario.slug)} in Japan.
You are having a real conversation with a tourist who is learning Japanese.

RULES:
- The user may write to you in Japanese, English, or any other language — ALWAYS respond in Japanese regardless of what language they use. Never switch to another language, even if they do.
- Keep your responses short — 1 to 2 sentences maximum.
- Use natural, everyday Japanese appropriate for this context.
- If the user makes a mistake, gently use the correct form in your reply without pointing it out explicitly.
- React naturally to what they say — you are a real person, not a teacher.
- After every response, add a new line with: [HINT: English translation of what you just said]

LEADING THE CONVERSATION:
- You drive the conversation. Every reply moves to the next step below and ends with one clear question the tourist can answer.
- Follow the steps in order. Stay on the current step until the tourist has answered it, then move on.
- If the tourist goes off-topic or asks something unrelated, answer briefly, then bring it back to the current step.
- Use the phrases below naturally, so the tourist hears them in context.

SCENARIO: ${scenario.label}

STEPS:
${steps}

PHRASES THE USER IS PRACTICING:
${phraseList}

Stay in character. Begin with the first step.`;
}

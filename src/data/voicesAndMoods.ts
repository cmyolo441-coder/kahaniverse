import { NarratorVoice, StoryMood, PresetStory, BackgroundAmbiance } from '../types';

export const NARRATOR_VOICES: NarratorVoice[] = [
  {
    id: 'Charon',
    name: 'Charon',
    hindiName: 'चिरॉन (गंभीर वाचक)',
    gender: 'male',
    character: 'Deep & Dramatic Narrator',
    description: 'गंभीर, गहरा और नाटकीय स्वर — सस्पेंस और हॉरर कहानियों के लिए सर्वोत्तम',
    iconName: 'ShieldAlert',
    sampleText: 'नमस्ते! मैं चिरॉन हूँ। कहानियों के सस्पेंस और रहस्यों को अपनी गंभीर आवाज से जीवंत बनाता हूँ। [dramatic pause] क्या आप तैयार हैं?',
  },
  {
    id: 'Kore',
    name: 'Kore',
    hindiName: 'कोरे (मृदुल अभिनेत्री)',
    gender: 'female',
    character: 'Warm & Expressive Female',
    description: 'मधुर, भावुक और आत्मीय आवाज — पारिवारिक व भावनात्मक कथाओं के लिए उपयुक्त',
    iconName: 'Heart',
    sampleText: 'प्रणाम! मैं कोरे हूँ। हर दिल को छू लेने वाली कहानियों और भावनाओं को आपके करीब लाती हूँ। [whispers] सुनिए एक प्यारी सी कहानी...',
  },
  {
    id: 'Puck',
    name: 'Puck',
    hindiName: 'पक (युवा और ऊर्जावान)',
    gender: 'male',
    character: 'Young & Energetic Voice',
    description: 'जोशीला और चंचल स्वर — एक्शन, हास्य और साहसिक कथाओं के लिए एकदम सही',
    iconName: 'Zap',
    sampleText: 'अरे दोस्तों! मैं पक हूँ! [excited] जब भी एक्शन और रोमांच का टाइम हो, मेरी आवाज में जोश भर जाता है! चलिए शुरू करते हैं!',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    hindiName: 'फेनरिर (ज्ञानी बुजुर्ग)',
    gender: 'male',
    character: 'Wise & Authoritative Elder',
    description: 'अनुभवी, भारी और रौबदार आवाज — ऐतिहासिक और प्राचीन कथाओं के लिए',
    iconName: 'BookOpen',
    sampleText: 'शुभ संध्या! मैं फेनरिर हूँ। सदियों पुरानी ऐतिहासिक गाथाओं और ज्ञान की बातों का साक्षी। [dramatic pause] ध्यान से सुनिए...',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    hindiName: 'ज़ेफ़िर (शांत कहानीकार)',
    gender: 'male',
    character: 'Calm & Gentle Storyteller',
    description: 'धीमा, शांत और सुरीला स्वर — सोने से पहले की कहानियों या चिंतनशील कथाओं हेतु',
    iconName: 'Feather',
    sampleText: 'नमस्कार! मैं ज़ेफ़िर हूँ। शांत रातों और सुकून भरे पलों में, एक धीमी और सुरीली कहानी आपके मन को शांति देगी।',
  },
];

export const BACKGROUND_AMBIANCES: BackgroundAmbiance[] = [
  {
    id: 'none',
    name: 'None',
    hindiName: 'कोई पृष्ठभूमि आवाज नहीं (Voice Only)',
    description: 'केवल स्पष्ट वाचक की आवाज',
    iconName: 'VolumeX',
  },
  {
    id: 'rain',
    name: 'Rain & Thunder',
    hindiName: 'रिमझिम बारिश और बादल (Rain & Storm)',
    description: 'धीमी बारिश की बूँदों और हवा की गूँज — सस्पेंस और इमोशनल ड्रामा हेतु',
    iconName: 'CloudRain',
  },
  {
    id: 'fireside',
    name: 'Fireside Crackle',
    hindiName: 'अलाव की चटचट (Fireside Crackle)',
    description: 'आग की गर्माहट और लकड़ी जलने की शांत आवाज — पुरानी कहानियों के लिए',
    iconName: 'Flame',
  },
  {
    id: 'eerie',
    name: 'Eerie Silence & Drone',
    hindiName: 'डरावना सन्नाटा (Eerie Drone)',
    description: 'रहस्यमयी हल्की गूँज और भयभीत कर देने वाला माहौल',
    iconName: 'Ghost',
  },
  {
    id: 'forest',
    name: 'Enchanted Forest',
    hindiName: 'शांत जंगल व हवा (Forest & Birds)',
    description: 'पक्षियों की चहचहाहट और पत्तों की सरसराहट',
    iconName: 'Trees',
  },
  {
    id: 'market',
    name: 'Busy Market Chatter',
    hindiName: 'चहल-पहल भरा बाज़ार (Market Ambiance)',
    description: 'गाँव या शहर के बाज़ार की दूर से आती हल्की हलचल',
    iconName: 'Users',
  },
];


export const STORY_MOODS: StoryMood[] = [
  {
    id: 'suspenseful',
    name: 'Suspenseful',
    hindiName: 'रहस्यमयी / सस्पेंस',
    description: 'रहस्य, डर और चौंकाने वाले मोड़',
    tagPrompt: 'Focus on tension, whispered dialogue, dramatic pauses, and sudden shouting or scared voices.',
    color: 'amber',
  },
  {
    id: 'emotional',
    name: 'Emotional',
    hindiName: 'भावुक / इमोशनल',
    description: 'प्रेम, विरह, करुणा और आंसुओं से भरी कहानियाँ',
    tagPrompt: 'Focus on sad tones, trembling voice, soft whispers, sighing, and deep emotional pauses.',
    color: 'rose',
  },
  {
    id: 'action',
    name: 'Action-packed',
    hindiName: 'रोमांचक / एक्शन',
    description: 'युद्ध, दौड़-भाग और खतरे से भरा घटनाक्रम',
    tagPrompt: 'Focus on excited delivery, shouting, fast breathing, dramatic pauses, and tense shouting.',
    color: 'orange',
  },
  {
    id: 'calm',
    name: 'Calm Storytelling',
    hindiName: 'शांत / सरस कहानी',
    description: 'सुखद जीवन, प्रकृति और शांतिपूर्ण वृत्तांत',
    tagPrompt: 'Focus on soft gentle narration, slight pauses, warm laughter, and peaceful tone.',
    color: 'emerald',
  },
  {
    id: 'happy',
    name: 'Happy / Light',
    hindiName: 'आनंददायक / हल्का',
    description: 'हास्य, उल्लास और उत्सव भरे पल',
    tagPrompt: 'Focus on energetic cheerful tone, genuine laughs, excited outbursts, and joyful cadence.',
    color: 'yellow',
  },
];

export const PRESET_STORIES: PresetStory[] = [
  {
    id: 'haunted_mansion',
    title: 'The Mystery of Kali Pahadi Mansion',
    hindiTitle: 'काली पहाड़ी की रहस्यमयी हवेली',
    mood: 'suspenseful',
    summary: 'रात के बारह बजे पुरानी हवेली से आई एक अजीब सी पुकार...',
    text: `काली पहाड़ी के शिखर पर बने उस पुराने खंडहर में पिछले पचास वर्षों से कोई नहीं गया था। गाँव के बुजुर्ग कहते थे कि अमावस्या की रात वहाँ अजीब सी आवाजें सुनाई देती हैं। 

विक्रम ने जेब से टॉर्च निकाली और हवेली की भारी लोहे की किवाड़ को धक्का दिया। चरमराती हुई आवाज के साथ दरवाजा खुला। अंदर घना अंधेरा था, और हवा में सीलन की गंध फैली हुई थी। 

अचानक, उसके पीछे दरवाजा अपने आप जोर से बंद हो गया! विक्रम का दिल धक-धक करने लगा। उसने कांपती आवाज में कहा, "कौन है वहाँ? सामने आओ!"

तभी सीढ़ियों के ऊपर से किसी के छमक-छमक चलने की आवाज आई। विक्रम ने टॉर्च की रोशनी ऊपर घुमाई। वहाँ एक साया खड़ा था, जिसकी आँखें अँधेरे में चमक रही थीं। साए ने धीमी आवाज में फुसफुसाया, "विक्रम... तुम यहाँ से कभी वापस नहीं जा सकते!"

विक्रम का सांस रुकने लगा, लेकिन उसने हिम्मत नहीं हारी। उसने अपनी छड़ी उठाई और आगे कदम बढ़ाए।`,
  },
  {
    id: 'mother_love',
    title: 'An Unspoken Sacrificial Love',
    hindiTitle: 'माँ की पुरानी चिट्ठी',
    mood: 'emotional',
    summary: 'घर की सफाई करते समय मिली माँ के हाथों की लिखी अंतिम पाती...',
    text: `सुमित आज सालों बाद अपने पुराने गाँव के मकान में पहुँचा था। माँ को गुज़रे दो साल बीत चुके थे, लेकिन घर के कोने-कोने में उनकी यादें बिखरी थीं।

कमरे की अलमारी खोलते ही सुमित के हाथ में एक पुरानी पीली पड़ चुकी डायरी आई। डायरी के पन्नों के बीच एक चिट्ठी रखी थी, जिस पर लिखा था — 'मेरे सुमित के लिए'।

सुमित ने कांपते हाथों से चिट्ठी खोली। माँ की लिखावट देखकर उसकी आँखों में आँसू छलक आए। चिट्ठी में लिखा था: "बेटा, जब तुम छोटे थे, तब हर रात बुखार में तड़पते थे। मैं पूरी रात भगवान के सामने हाथ जोड़कर बैठती थी कि काश तुम्हारी बीमारी मुझे लग जाए। जब तुम बड़े होकर शहर चले गए, तो रोज शाम को दरवाजे पर तुम्हारा इंतजार करती थी।"

सुमित का गला भर आया। वह रोते हुए चिट्ठी को सीने से लगा बैठा। उसने कहा, "माँ... मुझे माफ कर दो! मैं तुम्हारे प्यार को समझ ही नहीं पाया।"`,
  },
  {
    id: 'final_battle',
    title: 'The Battle for the Citadel',
    hindiTitle: 'किले की अंतिम बाजी',
    mood: 'action',
    summary: 'दुश्मनों की विशाल सेना के सामने केवल पचास वीर योद्धा...',
    text: `शाम का सूरज ढल रहा था और लाल किले की दीवारों पर दुश्मनों के नक्कारे बज रहे थे। सेनापति वीरभान ने अपनी नंगी तलवार हवा में लहराई और अपने पचास वफादार सिपाहियों की ओर देखा।

"वीरों!" वीरभान की आवाज में बिजली की सी कड़क थी। "आज हमारी मातृभूमि हमसे आहुति माँग रही है! क्या हम दुश्मनों को अपने किले पर कब्जा करने देंगे?"

सभी सिपाहियों ने एक स्वर में हुंकार भरी, "कभी नहीं! जय भवानी!"

दुश्मन की विशाल फौज तोपों की गर्जना के साथ किले के मुख्य द्वार को तोड़ने लगी। वीरभान ने चिल्लाकर कहा, "आक्रमण!"

दोनों ओर से तीरों की बारिश होने लगी। घोड़ों की टापों और ढालों के टकराने की आवाज से पूरी घाटी गूँज उठी। वीरभान ने अकेले ही बीस दुश्मन सैनिकों को धूल चटा दी। यह मुकाबला केवल ताकत का नहीं, आत्मसम्मान और वीरता का था।`,
  },
];

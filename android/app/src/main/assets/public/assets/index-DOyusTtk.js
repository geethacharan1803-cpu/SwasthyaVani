(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const r of a)if(r.type==="childList")for(const d of r.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&n(d)}).observe(document,{childList:!0,subtree:!0});function e(a){const r={};return a.integrity&&(r.integrity=a.integrity),a.referrerPolicy&&(r.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?r.credentials="include":a.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(a){if(a.ep)return;a.ep=!0;const r=e(a);fetch(a.href,r)}})();const ge={DEFAULT_LANGUAGE:"en"},K={sections:null,index:null,lexicon:null,visits:null,enrichedRegister:null,seasonalPack:null};async function Y(i){try{const t=await fetch(i);if(!t.ok)throw new Error(`HTTP ${t.status} fetching ${i}`);return await t.json()}catch(t){return console.warn(`[SwasthyaVani] Failed to fetch ${i}:`,t),null}}async function ke(){if(K.sections&&K.index&&K.lexicon&&K.visits&&K.enrichedRegister&&K.seasonalPack)return K;const[i,t,e,n,a,r]=await Promise.all([Y("/data/sections.json"),Y("/data/index.json"),Y("/data/lexicon.json"),Y("/data/register_visits.json"),Y("/data/register_enriched.json"),Y("/data/seasonal_health_pack.json")]);return K.sections=i||{},K.index=t||{},K.lexicon=e||{},K.visits=n||[],K.enrichedRegister=a||[],K.seasonalPack=r||[],K}function Ce(i,t={}){if(!i||typeof i!="string")return[];const e=i.toLowerCase().match(/[a-z0-9]+(?:\.[0-9]+)?/g)||[],n=[];for(const a of e)if(n.push(a),t&&t[a]){const r=t[a].split(/\s+/);for(const d of r)d&&n.push(d)}return n}function he(i,t=400){return i?i.replace(/\s+/g," ").trim().slice(0,t):""}class $e{constructor(t,e={}){this.k1=t.k1||1.5,this.b=t.b||.75,this.docCount=t.doc_count||1,this.avgdl=t.avgdl||100,this.docLengths=t.doc_lengths||{},this.idf=t.idf||{},this.invertedIndex=t.inverted_index||{},this.lexicon=e}search(t,e=2){const n=Ce(t,this.lexicon);if(!n.length)return[];const a=new Map;for(const d of n){const l=this.invertedIndex[d];if(!l)continue;const g=this.idf[d]||.5;for(const[k,m]of l){const p=this.docLengths[k]||this.avgdl,c=m*(this.k1+1),s=m+this.k1*(1-this.b+this.b*(p/this.avgdl)),h=g*(c/s);a.set(k,(a.get(k)||0)+h)}}return Array.from(a.entries()).map(([d,l])=>({secId:d,score:l})).sort((d,l)=>l.score-d.score).slice(0,e)}}function we(i,t,e){const n=i.translations,a=typeof navigator<"u"?navigator.onLine:!0,r=document.createElement("header");r.className="app-header",r.innerHTML=`
    <div class="header-top">
      <div class="brand">
        <div>
          <h1 class="brand-title">${n.appTitle}</h1>
          <p class="brand-sub">${n.tagline}</p>
        </div>
      </div>
      <div class="header-actions">
        <button type="button" class="btn btn-sm btn-contrast-toggle" id="btn-contrast-toggle" title="${n.header?n.header.toggleContrast:"Contrast"}" style="padding:4px 8px;font-size:0.75rem;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;cursor:pointer;">
          ${n.header?n.header.toggleContrast:"High Contrast"}
        </button>
        <div class="status-badge ${a?"online":"offline"}" id="header-conn-status">
          <span class="status-dot"></span>
          <span class="status-text">${a?n.online:n.offline}</span>
        </div>
        <span class="sync-badge" id="header-sync-status" style="font-size:0.7rem;padding:2px 8px;border-radius:10px;background:#e2e8f0;color:#334155;font-weight:600;">
          0 ${n.header&&n.header.pendingSync?n.header.pendingSync:"pending"}
        </span>
        <div class="lang-selector">
          <button class="lang-btn ${i.lang==="en"?"active":""}" data-lang="en">EN</button>
          <button class="lang-btn ${i.lang==="hi"?"active":""}" data-lang="hi">हिन्दी</button>
          <button class="lang-btn ${i.lang==="te"?"active":""}" data-lang="te">తెలుగు</button>
        </div>
      </div>
    </div>
    <nav class="app-nav">
      <button class="nav-tab ${i.currentTab==="ask"?"active":""}" data-tab="ask">
        ${n.nav.ask}
      </button>
      <button class="nav-tab ${i.currentTab==="visits"?"active":""}" data-tab="visits">
        ${n.nav.visits}
      </button>
      <button class="nav-tab ${i.currentTab==="beneficiaries"?"active":""}" data-tab="beneficiaries">
        ${n.nav.beneficiaries||"Beneficiaries"}
      </button>
      <button class="nav-tab ${i.currentTab==="dashboard"?"active":""}" data-tab="dashboard">
        ${n.nav.dashboard||"Dashboard"}
      </button>
      <button class="nav-tab ${i.currentTab==="perf"?"active":""}" data-tab="perf">
        ${n.nav.perf}
      </button>
    </nav>
  `,r.querySelectorAll(".lang-btn").forEach(m=>{m.addEventListener("click",p=>{const c=p.currentTarget.getAttribute("data-lang");c&&c!==i.lang&&t(c)})}),r.querySelectorAll(".nav-tab").forEach(m=>{m.addEventListener("click",p=>{const c=p.currentTarget.getAttribute("data-tab");c&&c!==i.currentTab&&e(c)})});const d=r.querySelector("#header-conn-status"),l=r.querySelector("#header-sync-status");function g(){const m=typeof navigator<"u"?navigator.onLine:!0;if(d){d.className=`status-badge ${m?"online":"offline"}`;const p=d.querySelector(".status-text");p&&(p.textContent=m?n.online:n.offline)}if(l)try{const p=JSON.parse(localStorage.getItem("swasthyavani_sync_queue")||"[]");l.textContent=`${p.length} ${n.header&&n.header.pendingSync?n.header.pendingSync:"pending"}`}catch{l.textContent="0 pending"}}window.addEventListener("online",g),window.addEventListener("offline",g),g();const k=r.querySelector("#btn-contrast-toggle");return k&&(localStorage.getItem("swasthyavani_contrast")==="true"&&document.body.classList.add("high-contrast"),k.addEventListener("click",()=>{const m=document.body.classList.toggle("high-contrast");localStorage.setItem("swasthyavani_contrast",m?"true":"false")})),r}const se=[{topic:"anc",labelEn:"Obstetric Bleeding (Emergency)",labelHi:"गर्भावस्था में रक्तस्राव (आपातकाल)",labelTe:"గర్భధారణలో రక్తస్రావం (అత్యవసరం)",qEn:"garbhvati mahila ko khoon aa raha hai",qHi:"गर्भवती महिला को खून आ रहा है",qTe:"గర్భిణి స్త్రీకి రక్తస్రావం అవుతోంది",expectedType:"escalate",expectedSection:"ESC-2.1"},{topic:"anc",labelEn:"Preeclampsia Facial Swelling",labelHi:"चेहरे पर सूजन व सिरदर्द",labelTe:"ముఖం వాచి తీవ్ర తలనొప్పి",qEn:"chehra suja hai aur sir dard ho raha",qHi:"चेहरा सूजा है और बहुत तेज सिरदर्द है",qTe:"ముఖం వాచి తీవ్ర తలనొప్పిగా ఉంది",expectedType:"escalate",expectedSection:"ESC-2.3"},{topic:"anc",labelEn:"4th ANC Timing",labelHi:"चौथी प्रसवपूर्व जांच का समय",labelTe:"4వ ఏఎన్‌సీ తనిఖీ సమయం",qEn:"chautha ANC check-up kab karwana hota hai?",qHi:"चौथा एएनसी चेकअप कब करवाना होता है?",qTe:"4వ ఏఎన్‌సీ తనిఖీ ఎప్పుడు చేయించాలి?",expectedType:"answer",expectedSection:"ANC-1.2"},{topic:"anc",labelEn:"Severe Anemia Hb < 7",labelHi:"गंभीर एनीमिया हीमोग्लोबिन 6.5",labelTe:"తీవ్ర రక్తహీనత హిమోగ్లోబిన్ 6.5",qEn:"pregnant woman Hb 6.5 g/dl severe anemia",qHi:"गर्भवती महिला में हीमोग्लोबिन 6.5 है",qTe:"గర్భిణికి హిమోగ్లోబిన్ 6.5 ఉంది",expectedType:"escalate",expectedSection:"ANC-3.1"},{topic:"anc",labelEn:"Td Booster Timing",labelHi:"टीडी बूस्टर का टीका",labelTe:"టిడి బూస్టర్ టీకా సమయం",qEn:"Td booster dose kab lagta hai pregnancy me?",qHi:"गर्भावस्था में टीडी बूस्टर कब लगता है?",qTe:"గర్భధారణలో టిడి టీకా ఎప్పుడు ఇస్తారు?",expectedType:"answer",expectedSection:"ANC-5.1"},{topic:"anc",labelEn:"Water Bag Rupture",labelHi:"पानी की थैली फटना",labelTe:"ఉమ్మనీరు కారిపోవడం",qEn:"thaili phat gayi hai, badbu wala paani",qHi:"थैली फट गई है और बदबूदार पानी निकल रहा है",qTe:"ఉమ్మనీరు కారిపోతోంది దుర్వాసన వస్తోంది",expectedType:"escalate",expectedSection:"ESC-2.4"},{topic:"anc",labelEn:"IFA Tablet Course",labelHi:"आईएफए गोलियों का कोर्स",labelTe:"ఐఎఫ్‌ఏ మాత్రల వ్యవధి",qEn:"IFA tablets kitne din leni hoti hai?",qHi:"आईएफए की गोलियां कितने दिन लेनी होती हैं?",qTe:"ఐరన్ ఫోలిక్ యాసిడ్ మాత్రలు ఎన్ని రోజులు వాడాలి?",expectedType:"answer",expectedSection:"ANC-3.1"},{topic:"anc",labelEn:"Pregnancy Convulsions / Eclampsia",labelHi:"गर्भावस्था में दौरे पड़ना",labelTe:"గర్భధారణలో ఫిట్స్ రావడం",qEn:"pregnancy me daure pad rahe hain",qHi:"गर्भवती महिला को दौरे पड़ रहे हैं",qTe:"గర్భిణి స్త్రీకి ఫిట్స్ వస్తున్నాయి",expectedType:"escalate",expectedSection:"ESC-2.3"},{topic:"hbnc",labelEn:"Newborn Hypothermia (Emergency)",labelHi:"नवजात का शरीर ठंडा पड़ना",labelTe:"నవజాత శిశువు శరీరం చల్లబడటం",qEn:"navjaat bachcha cold to touch, 95.8 bukhar",qHi:"नवजात बच्चा ठंडा पड़ गया है 95.8 तापमान",qTe:"నవజాత శిశువు శరీరం చల్లబడిపోయింది",expectedType:"escalate",expectedSection:"ESC-4.1"},{topic:"hbnc",labelEn:"Low Birth Weight Bathing",labelHi:"कम वजन के बच्चे को नहलाना",labelTe:"తక్కువ బరువు శిశువు స్నానం",qEn:"kam wajan wale bachche ko kab nehlana hai?",qHi:"कम वजन वाले बच्चे को कब नहलाना चाहिए?",qTe:"తక్కువ బరువున్న బిడ్డకు స్నానం ఎప్పుడు చేయించాలి?",expectedType:"answer",expectedSection:"HBNC-1.1"},{topic:"hbnc",labelEn:"Umbilical Cord Pus",labelHi:"नाल में मवाद या खून",labelTe:"బొడ్డు వద్ద చీము లేదా రక్తం",qEn:"naal me peep aur pus nikal raha hai",qHi:"नाल में मवाद और पीप निकल रहा है",qTe:"బొడ్డు వద్ద చీము కారుతోంది",expectedType:"escalate",expectedSection:"ESC-4.2"},{topic:"hbnc",labelEn:"Chest Indrawing (Pneumonia)",labelHi:"पसली धंसना और तेज सांस",labelTe:"పక్కటెముకలు లోపలికి లాగడం",qEn:"bachche ki pasli andar chal rahi hai aur saans tez hai",qHi:"बच्चे की पसली अंदर धंस रही है और सांस तेज है",qTe:"పిల్లవాడికి పక్కటెముకలు లోపలికి లాగుతున్నాయి",expectedType:"escalate",expectedSection:"ESC-5.2"},{topic:"hbnc",labelEn:"Unable to Breastfeed",labelHi:"दूध न पी पाना व सुस्ती",labelTe:"పాలు తాగలేకపోవడం",qEn:"navjaat bachcha doodh nahi pee raha",qHi:"नवजात बच्चा दूध नहीं पी रहा और सुस्त पड़ा है",qTe:"శిశువు పాలు తాగలేకపోతోంది నీరసంగా ఉంది",expectedType:"escalate",expectedSection:"ESC-5.1"},{topic:"hbnc",labelEn:"HBNC 7 Visit Schedule",labelHi:"एचबीएनसी के 7 भ्रमण",labelTe:"హెచ్‌బీఎన్‌సీ 7 సందర్శనలు",qEn:"HBNC ke 7 daure kab kab hote hain?",qHi:"एचबीएनसी के 7 दौरे कब-कब होते हैं?",qTe:"హెచ్‌బీఎన్‌సీ 7 సందర్శనలు ఏ రోజుల్లో చేయాలి?",expectedType:"answer",expectedSection:"HBNC-1.1"},{topic:"hbnc",labelEn:"Kangaroo Mother Care",labelHi:"कंगारू मदर केयर (केएमसी)",labelTe:"కంగారూ మదర్ కేర్ (కేఎంసీ)",qEn:"KMC kaise dete hain kamzor bachche ko?",qHi:"कमजोर बच्चे को केएमसी कैसे देते हैं?",qTe:"కేఎంసీ కంగారూ మదర్ కేర్ ఎలా ఇవ్వాలి?",expectedType:"answer",expectedSection:"HBNC-1.2"},{topic:"hbnc",labelEn:"Newborn Jaundice within 24h",labelHi:"जन्म के 24 घंटे में पीलिया",labelTe:"పుట్టిన 24 గంటల్లో కామెర్లు",qEn:"janm ke 24 ghante me bachcha peela pad gaya",qHi:"जन्म के 24 घंटे के भीतर बच्चा पीला पड़ गया है",qTe:"పుట్టిన 24 గంటల్లోనే బిడ్డ పచ్చబడిపోయింది",expectedType:"escalate",expectedSection:"ESC-4.4"},{topic:"chd",labelEn:"ORS Preparation & Dose",labelHi:"ओआरएस बनाने की विधि व मात्रा",labelTe:"ఓఆర్‌ఎస్ తయారీ మరియు మోతాదు",qEn:"ORS ka ghol kaise banate hain aur kitna pilana hai?",qHi:"ओआरएस का घोल कैसे बनाते हैं और कितना पिलाना चाहिए?",qTe:"ఓఆర్‌ఎస్ ద్రావణం ఎలా తయారు చేయాలి మరియు ఎంత తాగించాలి?",expectedType:"answer",expectedSection:"CHD-1.2"},{topic:"chd",labelEn:"Child Vomits ORS Care",labelHi:"ओआरएस पीने पर उल्टी होना",labelTe:"ఓఆర్‌ఎస్ తాగిన వెంటనే వాంతి",qEn:"ORS peene ke baad bachcha ulti kar deta hai to kya karein?",qHi:"ओआरएस पीने के बाद बच्चा उल्टी कर दे तो क्या करना चाहिए?",qTe:"ఓఆర్‌ఎస్ తాగిన వెంటనే బిడ్డ వాంతి చేసుకుంటే ఏం చేయాలి?",expectedType:"answer",expectedSection:"CHD-1.2"},{topic:"chd",labelEn:"Zinc 14-Day Diarrhoea Course",labelHi:"दस्त में जिंक 14 दिन का कोर्स",labelTe:"విరోచనాలలో జింక్ 14 రోజుల కోర్సు",qEn:"dast me zinc kitne din dena hota hai?",qHi:"दस्त में जिंक की गोली कितने दिन देनी होती है?",qTe:"విరోచనాలలో జింక్ మాత్రలు ఎన్ని రోజులు ఇవ్వాలి?",expectedType:"answer",expectedSection:"CHD-1.3"},{topic:"chd",labelEn:"Fast Breathing Counting Rule",labelHi:"तेज सांस गिनने का नियम",labelTe:"శ్వాస వేగం కొలిచే నియమం",qEn:"bachche ki saans tez ginne ka niyam kya hai?",qHi:"बच्चे में तेज सांस गिनने का नियम क्या है?",qTe:"పిల్లలలో వేగంగా శ్వాస తీసుకోవడం ఎలా లెక్కించాలి?",expectedType:"answer",expectedSection:"CHD-3.1"},{topic:"chd",labelEn:"Sunken Eyes & Skin Pinch Slow",labelHi:"धंसी आंखें व गंभीर निर्जलीकरण",labelTe:"గుంటలు పడిన కళ్ళు, తీవ్ర నీరసం",qEn:"bachche ki aankhe dhas gayi hain aur skin pinch slow hai",qHi:"बच्चे की आंखें धंस गई हैं और त्वचा धीरे लौटती है",qTe:"బిడ్డ కళ్ళు గుంటలు పడి చర్మం నెమ్మదిగా వెనక్కి వెళ్తోంది",expectedType:"escalate",expectedSection:"ESC-5.3"},{topic:"chd",labelEn:"Cough for >2 Weeks (TB Suspect)",labelHi:"2 सप्ताह से अधिक की खांसी",labelTe:"2 వారాలకు పైగా దగ్గు (టీబీ అనుమానం)",qEn:"bachche ko 2 hafte se jyada se khansi hai",qHi:"बच्चे को दो हफ्ते से ज्यादा समय से खांसी आ रही है",qTe:"పిల్లవాడికి రెండు వారాలకు పైగా దగ్గు వస్తోంది",expectedType:"answer",expectedSection:"CHD-3.1"},{topic:"chd",labelEn:"Child Febrile Convulsions",labelHi:"बुखार में बच्चे को दौरे",labelTe:"జ్వరంలో పిల్లలకు ఫిట్స్",qEn:"bachche ko bukhar me daure pad gaye hain",qHi:"बुखार के साथ बच्चे को झटके और दौरे आ रहे हैं",qTe:"జ్వరంతో పిల్లవాడికి ఫిట్స్ వస్తున్నాయి",expectedType:"escalate",expectedSection:"ESC-5.1"},{topic:"chd",labelEn:"Stridor in Calm Child",labelHi:"शांत बच्चे में सांस की सीटी आवाज",labelTe:"శాంతంగా ఉన్న బిడ్డలో శ్వాస శబ్దం",qEn:"bachcha saans lete samay seeti jaisi aawaz kar raha hai",qHi:"शांत बच्चा सांस लेते समय घुरघुराहट और सीटी की आवाज कर रहा है",qTe:"బిడ్డ ఊపిరి పీల్చుకునేటప్పుడు శబ్దం వస్తోంది",expectedType:"escalate",expectedSection:"ESC-5.2"},{topic:"nut",labelEn:"SAM MUAC < 11.5 cm Red Zone",labelHi:"कुपोषण एमयूएसी लाल निशान",labelTe:"తీవ్ర పోషకాహార లోపం ముయాక్ రెడ్",qEn:"MUAC 11.2 cm red zone child nutrition",qHi:"बच्चे का एमयूएसी 11.2 सेमी लाल निशान पर है",qTe:"పిల్లవాడికి ముయాక్ 11.2 సెం.మీ ఎరుపు రంగులో ఉంది",expectedType:"answer",expectedSection:"NUT-1.2"},{topic:"nut",labelEn:"Bilateral Pitting Edema of Feet",labelHi:"पैरों में गड्ढा पड़ने वाली सूजन",labelTe:"రెండు పాదాలలో గుంటలు పడే వాపు",qEn:"bachche ke dono pairon me sujan gaddha padta hai",qHi:"बच्चे के दोनों पैरों में सूजन और गड्ढा पड़ता है",qTe:"బిడ్డ రెండు పాదాలలో గుంటలు పడే వాపు ఉంది",expectedType:"escalate",expectedSection:"NUT-1.2"},{topic:"nut",labelEn:"Exclusive Breastfeeding 6 Months",labelHi:"6 माह तक केवल स्तनपान",labelTe:"6 నెలల వరకు కేవలం తల్లిపాలు",qEn:"6 mahine tak keval stanpan kyu jaroori hai?",qHi:"6 महीने तक केवल स्तनपान क्यों जरूरी है?",qTe:"6 నెలల వరకు కేవలం తల్లిపాలు మాత్రమే ఎందుకు ఇవ్వాలి?",expectedType:"answer",expectedSection:"NUT-2.1"},{topic:"nut",labelEn:"Complementary Feeding Start",labelHi:"ऊपरी आहार की शुरुआत",labelTe:"అనుబంధ ఆహారం ప్రారంభం",qEn:"6 mahine ke baad upari aahar kaise shuru karein?",qHi:"6 महीने के बाद ऊपरी आहार कैसे शुरू करें?",qTe:"6 నెలల తర్వాత అనుబంధ ఆహారం ఎలా ప్రారంభించాలి?",expectedType:"answer",expectedSection:"NUT-2.2"},{topic:"nut",labelEn:"Vitamin A Schedule (9 Doses)",labelHi:"विटामिन ए 9 खुराकों की समय-सारणी",labelTe:"విటమిన్ ఎ 9 డోసుల షెడ్యూల్",qEn:"Vitamin A ki khuraak kab kab di jaati hai?",qHi:"विटामिन ए की खुराक किस-किस उम्र में दी जाती है?",qTe:"విటమిన్ ఎ చుక్కలు ఏయే నెలల్లో ఇవ్వాలి?",expectedType:"answer",expectedSection:"IMM-2.4"},{topic:"nut",labelEn:"Deworming Albendazole Timing",labelHi:"कृमि नाशक एल्बेंडाजोल खुराक",labelTe:"నులిపురుగుల నివారణ ఆల్బెండజోల్",qEn:"albendazole ki goli kab aur kitni deni hoti hai?",qHi:"एल्बेंडाजोल की गोली कब और कितनी मात्रा में दी जाती है?",qTe:"ఆల్బెండజోల్ మాత్ర ఎప్పుడు ఎంత ఇవ్వాలి?",expectedType:"answer",expectedSection:"NUT-3.1"},{topic:"nut",labelEn:"MAM Follow-up & Diet",labelHi:"मध्यम कुपोषित बच्चे का आहार",labelTe:"మిత పోషకాహార లోపం ఆహారం",qEn:"MAM bachche ko anganwadi me kya aahar milega?",qHi:"मध्यम कुपोषण वाले बच्चे को आंगनवाड़ी में क्या पूरक पोषण दें?",qTe:"మిత పోషకాహార లోపం ఉన్న బిడ్డకు అంగన్‌వాడీ ఆహారం ఏమిటి?",expectedType:"answer",expectedSection:"NUT-1.3"},{topic:"imm",labelEn:"BCG Max Age Limit",labelHi:"बीसीजी टीका अधिकतम आयु",labelTe:"బిసిజి టీకా గరిష్ట వయస్సు",qEn:"BCG ka tika kab tak lag sakta hai?",qHi:"बीसीजी का टीका अधिकतम किस उम्र तक लग सकता है?",qTe:"బిసిజి టీకా గరిష్టంగా ఏ వయస్సు వరకు వేయవచ్చు?",expectedType:"answer",expectedSection:"IMM-2.1"},{topic:"imm",labelEn:"Penta After 1 Year?",labelHi:"1 वर्ष बाद पेंटा का टीका?",labelTe:"1 సం. తర్వాత పెంటా టీకా?",qEn:"Penta ka tika 1 saal ke baad lag sakta hai kya?",qHi:"क्या पेंटा का टीका 1 साल के बाद लग सकता है?",qTe:"పెంటావాలెంట్ టీకా 1 సంవత్సరం దాటిన తర్వాత వేయవచ్చా?",expectedType:"answer",expectedSection:"IMM-2.2"},{topic:"imm",labelEn:"MR Catch-up Limit",labelHi:"एमआर टीका 5 वर्ष तक",labelTe:"ఎంఆర్ టీకా 5 సం. వరకు",qEn:"MR vaccine kitne saal tak di ja sakti hai?",qHi:"एमआर वैक्सीन कितने साल तक दी जा सकती है?",qTe:"ఎంఆర్ టీకా ఎన్ని సంవత్సరాల వరకు ఇవ్వవచ్చు?",expectedType:"answer",expectedSection:"IMM-2.3"},{topic:"imm",labelEn:"Overdue Vaccine Definition",labelHi:"टीका कब ओवरड्यू होता है",labelTe:"టీకా గడువు దాటినట్లు ఎప్పుడు",qEn:"tika kab overdue maana jata hai?",qHi:"टीका कब ओवरड्यू माना जाता है?",qTe:"టీకా గడువు దాటినట్లు ఎప్పుడు పరిగణిస్తారు?",expectedType:"answer",expectedSection:"IMM-1.1"},{topic:"imm",labelEn:"Vitamin A Total Doses",labelHi:"विटामिन ए की कुल खुराक",labelTe:"విటమిన్ ఎ 9 డోసులు",qEn:"Vitamin A ki kul kitni khuraak di jaati hain?",qHi:"विटामिन ए की कुल कितनी खुराक दी जाती हैं?",qTe:"విటమిన్ ఎ చుక్కలు మొత్తం ఎన్ని డోసులు ఇస్తారు?",expectedType:"answer",expectedSection:"IMM-2.4"},{topic:"imm",labelEn:"JE Endemicity in Chandrapuri",labelHi:"जेई टीका क्या चंद्रापुरी में लगेगा?",labelTe:"చంద్రాపురిలో జేఈ టీకా అవసరమా?",qEn:"JE ka teeka Chandrapuri me lagta hai kya?",qHi:"क्या जेई का टीका चंद्रापुरी ब्लॉक में लगता है?",qTe:"చంద్రాపురిలో జేఈ టీకా ఇస్తారా?",expectedType:"answer",expectedSection:"IMM-2.4"},{topic:"imm",labelEn:"OPV Birth Dose Timing",labelHi:"ओपीवी शून्य खुराक (14 दिन)",labelTe:"ఓపీవీ జీరో డోస్ (14 రోజులు)",qEn:"OPV zero dose kab tak de sakte hain?",qHi:"ओपीवी जीरो डोज कितने दिनों के भीतर दे सकते हैं?",qTe:"ఓపీవీ జీరో డోస్ ఎన్ని రోజులలోపు ఇవ్వాలి?",expectedType:"answer",expectedSection:"IMM-2.1"},{topic:"imm",labelEn:"fIPV-3 Fraction Schedule",labelHi:"एफआईपीवी-3 तीसरा डोज",labelTe:"ఎఫ్ఐపీవీ-3 మోతాదు సమయం",qEn:"fIPV-3 dose kab lagti hai?",qHi:"एफआईपीवी की तीसरी खुराक 9 महीने पर कब दी जाती है?",qTe:"ఎఫ్ఐపీవీ-3 టీకా 9వ నెలలో ఎప్పుడు ఇస్తారు?",expectedType:"answer",expectedSection:"IMM-2.3"},{topic:"ncd",labelEn:"Hypertension BP 160/100",labelHi:"हाई बीपी 160/100 देखभाल",labelTe:"హై బీపీ 160/100 జాగ్రత్తలు",qEn:"high blood pressure 160/100 follow-up",qHi:"हाई ब्लड प्रेशर 160/100 में क्या सलाह दें",qTe:"బీపీ 160/100 ఉంది ఫాలోఅప్ ఏం చేయాలి",expectedType:"answer",expectedSection:"NCD-1.1"},{topic:"ncd",labelEn:"Unconscious Diabetes Patient (Call 108)",labelHi:"शुगर का मरीज बेहोश (108 बुलाएं)",labelTe:"షుగర్ రోగి స్పృహతప్పడం (108 కి కాల్)",qEn:"sugar ke marij behosh pada hai, insulin leta hai",qHi:"शुगर का मरीज बेहोश पड़ा है, इंसुलिन लेता है",qTe:"షుగర్ వ్యాధిగ్రస్తుడు స్పృహతప్పి పడిపోయాడు",expectedType:"escalate",expectedSection:"ESC-6.3"},{topic:"ncd",labelEn:"Exercise Guidelines (150 mins)",labelHi:"बीपी-शुगर में व्यायाम नियम",labelTe:"వ్యాయామం మార్గదర్శకాలు (150 ని.)",qEn:"sugar aur BP ke marij ko kitna kasrat karna chahiye?",qHi:"बीपी और शुगर के मरीज को कितना व्यायाम करना चाहिए?",qTe:"బీపీ మరియు షుగర్ రోగులు రోజుకు ఎంత సమయం వ్యాయామం చేయాలి?",expectedType:"answer",expectedSection:"NCD-3.1"},{topic:"ncd",labelEn:"Low Salt Intake Target",labelHi:"नमक की मात्रा (<5 ग्राम)",labelTe:"ఉప్పు పరిమితి (<5 గ్రా.)",qEn:"namak kitna khana chahiye hypertension me?",qHi:"उच्च रक्तचाप में नमक की मात्रा कितनी होनी चाहिए?",qTe:"హైపర్‌టెన్షన్‌లో ఉప్పు ఎంత మోతాదులో వాడాలి?",expectedType:"answer",expectedSection:"NCD-2.1"},{topic:"ncd",labelEn:"Stroke Warning (One-sided Weakness)",labelHi:"लकवा एक तरफ कमजोरी",labelTe:"పక్షవాతం ఒకవైపు బలహీనత",qEn:"ek taraf kamzor aur chehra tedha ho gaya",qHi:"चेहरा टेढ़ा हो गया और एक तरफ कमजोरी आ गई",qTe:"ముఖం ఒకవైపు వంకరపోయి పక్షవాతం లక్షణాలు",expectedType:"escalate",expectedSection:"ESC-6.1"},{topic:"ncd",labelEn:"Diabetes Foot Ulcer Care",labelHi:"डायबिटीज पैर का घाव",labelTe:"డయాబెటిస్ పాదాల పుండ్లు",qEn:"sugar ke marij ke pair me ghav ho gaya hai",qHi:"डायबिटीज मरीज के पैर में घाव हो गया है",qTe:"షుగర్ రోగికి పాదంపై పుండు ఏర్పడింది",expectedType:"answer",expectedSection:"NCD-4.1"},{topic:"ncd",labelEn:"Severe Chest Pain (Heart Attack)",labelHi:"सीने में तेज दर्द (दिल का दौरा)",labelTe:"గుండె నొప్పి (హార్ట్ ఎటాక్)",qEn:"gunde noppi vastondi ekkuva ga",qHi:"सीने में तेज दर्द और पसीना आ रहा है",qTe:"ఛాతీలో తీవ్రమైన నొప్పి మరియు చెమటలు",expectedType:"escalate",expectedSection:"ESC-6.2"},{topic:"ncd",labelEn:"Fasting Blood Sugar Cutoff 126",labelHi:"खाली पेट शुगर 130 mg/dl",labelTe:"ఖాళీ కడుపున షుగర్ 130 mg/dl",qEn:"fasting blood sugar 130 mg/dl ka matlab kya hai?",qHi:"खाली पेट ब्लड शुगर 130 आने पर क्या करना चाहिए?",qTe:"ఉదయం ఖాళీ కడుపున షుగర్ 130 వస్తే ఏం చేయాలి?",expectedType:"answer",expectedSection:"NCD-1.2"},{topic:"esc",labelEn:"Emergency Referral 108/102",labelHi:"आपातकालीन 108 रेफरल नियम",labelTe:"అత్యవసర 108 రిఫరల్ విధానం",qEn:"danger signs aane par 108 ambulance kaise bulayein?",qHi:"खतरे के लक्षण दिखने पर 108 एम्बुलेंस तुरंत कैसे बुलाएं?",qTe:"ప్రమాద సంకేతాలు ఉన్నప్పుడు 108 అంబులెన్స్ ఎలా పిలవాలి?",expectedType:"escalate",expectedSection:"ESC-1.1"},{topic:"esc",labelEn:"Heavy Postpartum Hemorrhage",labelHi:"प्रसव के बाद भारी रक्तस्राव",labelTe:"ప్రసవానంతర తీవ్ర రక్తస్రావం",qEn:"prasav ke baad bahut jyada khoon beh raha hai",qHi:"डिलीवरी के बाद बहुत ज्यादा खून बह रहा है",qTe:"ప్రసవం తర్వాత రక్తస్రావం ఆగడం లేదు",expectedType:"escalate",expectedSection:"ESC-3.1"},{topic:"esc",labelEn:"Newborn Limp & Not Crying",labelHi:"नवजात शिशु सुस्त व रो नहीं रहा",labelTe:"శిశువు ఏడవడం లేదు, శరీరం వదులుగా ఉంది",qEn:"navjaat bachcha ro nahi raha aur sharir dheela pad gaya",qHi:"नवजात बच्चा रो नहीं रहा और शरीर ढीला पड़ गया है",qTe:"నవజాత శిశువు ఏడవడం లేదు శరీరం చల్లబడి వదులైంది",expectedType:"escalate",expectedSection:"ESC-4.1"},{topic:"esc",labelEn:"Postpartum High Fever > 38°C",labelHi:"प्रसव के बाद तेज बुखार (>38°C)",labelTe:"ప్రసవానంతర అధిక జ్వరం (>38°C)",qEn:"delivery ke baad tez bukhar 102 degree ho gaya",qHi:"प्रसव के एक महीने के भीतर 102 डिग्री तेज बुखार",qTe:"డెలివరీ తర్వాత తీవ్రమైన జ్వరం వచ్చింది",expectedType:"escalate",expectedSection:"ESC-3.2"},{topic:"esc",labelEn:"Unconscious Child Unable to Wake",labelHi:"बच्चा बेहोश व जगाने पर न उठना",labelTe:"బిడ్డ స్పృహతప్పి లేవలేకపోవడం",qEn:"bachcha behosh hai aur aawaz dene par nahi uthta",qHi:"बच्चा बेहोश पड़ा है और आवाज देने पर भी नहीं जाग रहा",qTe:"పిల్లవాడు అపస్మారక స్థితిలో ఉన్నాడు",expectedType:"escalate",expectedSection:"ESC-5.1"},{topic:"esc",labelEn:"Severe Respiratory Stridor",labelHi:"सांस में तेज घुरघुराहट (स्ट्राइडर)",labelTe:"శ్వాసలో పిల్లికూతలు (స్ట్రైడర్)",qEn:"shishu saans lete samay gharkharahat kar raha hai",qHi:"शिशु सांस लेते समय घुरघुराहट और जोर की आवाज कर रहा है",qTe:"శిశువు ఊపిరి పీల్చుకునేటప్పుడు గొంతులో శబ్దం వస్తోంది",expectedType:"escalate",expectedSection:"ESC-5.2"},{topic:"esc",labelEn:"Sudden Facial Droop & Speech Loss",labelHi:"चेहरा टेढ़ा व बोली बंद (स्ट्रोक)",labelTe:"ముఖం వంకరపోవడం, మాట రాకపోవడం",qEn:"achanak bolna band aur chehra tedha ho gaya",qHi:"अचानक बोलना बंद हो गया और मुंह टेढ़ा हो गया",qTe:"అకస్మాత్తుగా మాట పడిపోయి ముఖం ఒకవైపుకు లాగింది",expectedType:"escalate",expectedSection:"ESC-6.1"},{topic:"esc",labelEn:"Shock with Cold Clammy Hands",labelHi:"हाथ-पैर ठंडे व नब्ज गायब (शॉक)",labelTe:"కాళ్ళు చేతులు చల్లబడి నాడి అందకపోవడం",qEn:"haath pair barf jaise thande aur nabz nahi mil rahi",qHi:"हाथ पैर बर्फ जैसे ठंडे हैं और नब्ज बहुत कमजोर है",qTe:"చేతులు కాళ్ళు చల్లబడి నాడి కొట్టుకోవడం లేదు",expectedType:"escalate",expectedSection:"ESC-1.2"},{topic:"seasonal",labelEn:"Dengue Symptoms & Care",labelHi:"डेंगू लक्षण एवं देखभाल",labelTe:"డెంగ్యూ లక్షణాలు మరియు జాగ్రత్తలు",qEn:"I have dengue fever and body ache",qHi:"मुझे डेंगू बुखार और बदन दर्द है क्या करें",qTe:"నాకు డెంగ్యూ జ్వరం మరియు ఒళ్ళు నొప్పులు ఉన్నాయి",expectedType:"seasonal",expectedSection:"SEASONAL-DENGUE"},{topic:"seasonal",labelEn:"Dengue Warning Signs",labelHi:"डेंगू में खतरे के लक्षण",labelTe:"డెంగ్యూలో ప్రమాద సంకేతాలు",qEn:"dengue me ulti aur pet dard ho raha hai",qHi:"डेंगू में पेट दर्द और बार-बार उल्टी हो रही है",qTe:"డెంగ్యూలో కడుపు నొప్పి మరియు వాంతులు అవుతున్నాయి",expectedType:"escalate",expectedSection:"ESC-5.1"},{topic:"seasonal",labelEn:"Malaria with Chills & Rigors",labelHi:"मलेरिया ठंड लगकर बुखार",labelTe:"మలేరియా చలి, వణుకుతో జ్వరం",qEn:"thand lagkar bukhar aur kapkapi ho rahi hai",qHi:"ठंड लगकर बुखार और कंपकंपी आ रही है",qTe:"చలి మరియు వణుకుతో జ్వరం వస్తోంది",expectedType:"seasonal",expectedSection:"SEASONAL-MALARIA"},{topic:"seasonal",labelEn:"Chikungunya Joint Pain",labelHi:"चिकनगुनिया जोड़ों में तेज दर्द",labelTe:"చికున్‌గున్యా కీళ్ల నొప్పులు",qEn:"chikungunya me jodon me bahut tej dard hai",qHi:"चिकनगुनिया में जोड़ों में असहनीय दर्द है",qTe:"చికున్‌గున్యాలో కీళ్ల నొప్పులు తీవ్రంగా ఉన్నాయి",expectedType:"seasonal",expectedSection:"SEASONAL-CHIKUNGUNYA"},{topic:"seasonal",labelEn:"Acute Diarrhoea & Dehydration",labelHi:"दस्त एवं निर्जलीकरण ओआरएस",labelTe:"విరోచనాలు ఓఆర్‌ఎస్ ద్రావణం",qEn:"child has loose motions and dehydration",qHi:"बच्चे को पतले दस्त और उल्टी हो रही है",qTe:"పిల్లవాడికి విరోచనాలు మరియు నీరసం",expectedType:"seasonal",expectedSection:"SEASONAL-DIARRHOEA"},{topic:"seasonal",labelEn:"Cholera Rice-Water Stool",labelHi:"हैजा चावल के पानी जैसा दस्त",labelTe:"కలరా బియ్యం కడిగిన నీళ్ళ విరోచనాలు",qEn:"rice water stool and severe dehydration",qHi:"चावल के पानी जैसा दस्त और भारी कमजोरी",qTe:"కలరా బియ్యం కడిగిన నీళ్ళలాంటి విరోచనాలు",expectedType:"seasonal",expectedSection:"SEASONAL-CHOLERA"},{topic:"seasonal",labelEn:"Heat Stroke Emergency (Loo)",labelHi:"लू लगना व बेहोशी (आपातकाल)",labelTe:"వడదెబ్బ అత్యవసర సంరక్షణ",qEn:"bahut tej loo lag gayi hai behosh pada hai",qHi:"लू लग गई है और बेहोशी की हालत है",qTe:"వడదెబ్బ తగిలి స్పృహ తప్పి పడిపోయారు",expectedType:"escalate",expectedSection:"ESC-1.1"},{topic:"seasonal",labelEn:"Jaundice & Yellow Eyes",labelHi:"पीलिया आंखें पीली पड़ना",labelTe:"కామెర్లు పసుపు రంగు కళ్ళు",qEn:"peeliya ho gaya hai aur aankhen peeli hain",qHi:"पीलिया हो गया है और पेशाब पीला आ रहा है",qTe:"పచ్చ కామెర్లు మరియు మూత్రం పసుపుగా వస్తోంది",expectedType:"seasonal",expectedSection:"SEASONAL-JAUNDICE"},{topic:"refusal",labelEn:"Refusal: Amoxicillin Antibiotics",labelHi:"अस्वीकार: एंटीबायोटिक खुराक पूछना",labelTe:"నిరాకరణ: యాంటీబయాటిక్ మోతాదు",qEn:"pneumonia me amoxicillin kitna mg dena hai?",qHi:"निमोनिया में अमोक्सीसिलीन कितनी गोली देनी चाहिए?",qTe:"న్యుమోనియాలో అమోక్సిసిలిన్ ఎంత మోతాదులో ఇవ్వాలి?",expectedType:"refusal",expectedSection:"SCP-1.2"},{topic:"refusal",labelEn:"Refusal: Metformin Sugar Dose",labelHi:"अस्वीकार: मेटफॉर्मिन दवा बदलना",labelTe:"నిరాకరణ: షుగర్ మందు మోతాదు మార్పు",qEn:"metformin 500mg badha kar 1000mg kar sakte hain kya?",qHi:"क्या मेटफॉर्मिन 500 की जगह 1000 एमजी कर सकते हैं?",qTe:"మెట్‌ఫార్మిన్ షుగర్ మాత్ర 1000 ఎంజీకి పెంచవచ్చా?",expectedType:"refusal",expectedSection:"SCP-1.2"},{topic:"refusal",labelEn:"Refusal: Amlodipine High BP Dose",labelHi:"अस्वीकार: बीपी की दवा बढ़ाना",labelTe:"నిరాకరణ: బీపీ మందు మార్పు",qEn:"amlodipine 5mg ki jagah 10mg le lein kya?",qHi:"एमलोडिपाइन 5 की जगह 10 ले सकते हैं क्या?",qTe:"ఆమ్లోడిపైన్ బీపీ మాత్రను 10 ఎంజీకి మార్చవచ్చా?",expectedType:"refusal",expectedSection:"SCP-1.2"},{topic:"refusal",labelEn:"Refusal: Infant Paracetamol Syrup",labelHi:"अस्वीकार: पैरासिटामोल सिरप पर्चा",labelTe:"నిరాకరణ: పారాసిటమాల్ సిరప్ ప్రిస్క్రిప్షన్",qEn:"dengue me paracetamol syrup kitna dena hai 1 saal ke bachche ko?",qHi:"डेंगू में 1 साल के बच्चे को पैरासिटामोल सिरप कितना देना है?",qTe:"1 సంవత్సరపు పాపకు పారాసిటమాల్ సిరప్ ఎంత తాగించాలి?",expectedType:"refusal",expectedSection:"SCP-1.2"},{topic:"refusal",labelEn:"Refusal: Home Oxytocin Injection",labelHi:"अस्वीकार: घर पर ऑक्सीटोसिन इंजेक्शन",labelTe:"నిరాకరణ: ఇంట్లో ఆక్సిటోసిన్ ఇంజెక్షన్",qEn:"ghar par delivery ke liye oxytocin injection laga sakte hain kya?",qHi:"क्या घर पर प्रसव पीड़ा बढ़ाने के लिए ऑक्सीटोसिन इंजेक्शन लगा सकते हैं?",qTe:"ఇంట్లో డెలివరీ కోసం ఆక్సిటోసిన్ ఇంజెక్షన్ వేయవచ్చా?",expectedType:"refusal",expectedSection:"SCP-1.1"},{topic:"refusal",labelEn:"Refusal: Doxycycline Scrub Typhus",labelHi:"अस्वीकार: डॉक्सीसाइक्लिन दवा देना",labelTe:"నిరాకరణ: డాక్సీసైక్లిన్ మందు ఇవ్వడం",qEn:"scrub typhus me doxycycline kitni goli deni hai?",qHi:"स्क्रब टाइफस में डॉक्सीसाइक्लिन की कितनी गोली देनी है?",qTe:"స్క్రబ్ టైఫస్‌లో డాక్సీసైక్లిన్ మాత్ర ఎన్ని ఇవ్వాలి?",expectedType:"refusal",expectedSection:"SCP-1.2"},{topic:"refusal",labelEn:"Refusal: Home IV Saline Drip",labelHi:"अस्वीकार: घर पर आईवी ड्रिप लगाना",labelTe:"నిరాకరణ: ఇంట్లో సెలైన్ బాటిల్ ఎక్కించడం",qEn:"ghar par saline ya glucose ki botal laga sakte hain?",qHi:"क्या घर पर मरीज को सलाइन या ग्लूकोज की बोतल चढ़ा सकते हैं?",qTe:"ఇంట్లోనే రోగికి గ్లూకోజ్ బాటిల్ ఎక్కించవచ్చా?",expectedType:"refusal",expectedSection:"SCP-1.1"},{topic:"refusal",labelEn:"Refusal: Unverified Herbal Quackery",labelHi:"अस्वीकार: अप्रमाणित देशी दवाई देना",labelTe:"నిరాకరణ: నాటు వైద్యం మూలికలు",qEn:"peeliya theek karne ke liye naatu marunthu de sakte hain?",qHi:"पीलिया ठीक करने के लिए कोई जड़ी-बूटी या झाड़-फूंक कर सकते हैं?",qTe:"పచ్చ కామెర్లను తగ్గించడానికి నాటు మందులు వాడవచ్చా?",expectedType:"refusal",expectedSection:"SCP-1.2"}],xe=[/\bbleeding\b/i,/khoon\s*(?:aa|behe?|nikal|gira|pad)/i,/raktham\s*(?:ravam|padutondi|vastondi)/i,/रक्तस्राव|खून\s*(?:आ|बह|निकल|गिर|पड़)/i,/రక్తస్రావం|రక్తం\s*(?:కార|పడు|వస్తోం|కారు)/i,/\bjhatke\b/i,/\bconvuls/i,/\bfits\b/i,/\bmirgi\b/i,/\bdaura\b/i,/\bdaure\b/i,/\bvalsulu\b/i,/दौरे|झटके|मिर्गी/i,/ఫిట్స్|మూర్ఛ|వణుకు/i,/\bbehosh\b/i,/\bunconscious\b/i,/spruha\s*ledu/i,/telivi\s*tappadam/i,/बेहोश|अचेत|मूर्छित/i,/స్పృహ\s*తప్ప|స్పృహ\s*లేదు|అపస్మారక/i,/\bblurr/i,/dhundhla/i,/mabbu\s*kammadam/i,/धुंधला|आंखों\s*के\s*आगे\s*अंधेरा/i,/మసక|చూపు\s*మంద/i,/chehra\s*suja/i,/moham\s*vachindi/i,/चेहरा\s*सूजा|चेहरे\s*पर\s*सूजन/i,/ముఖం\s*వాచి|ముఖం\s*వాపు/i,/pair.*suja.*sir.*dard/i,/kallu.*veekam.*talanoppi/i,/\bpasli\b/i,/chest\s*indrawing/i,/pasli\s*(?:andar|chal|dhans)/i,/rommu\s*lopalki/i,/पसली\s*(?:चल|धंस|अंदर)/i,/పక్కటెముకలు\s*లోపలికి/i,/\bstridor\b/i,/स्ट्राइडर|घुरघुराहट|सीटी\s*की\s*आवाज/i,/పిల్లికూతలు|గొంతులో\s*శబ్దం|ఊపిరి.*శబ్దం/i,/gharkharahat|seeti\s*jaisi\s*aawaz/i,/\bneela\b/i,/\bblue\b/i,/neelam\s*rangi/i,/नीला\s*पड़/i,/నీలంగా\s*మార/i,/stiff\s*neck/i,/gardan\s*akad/i,/meda\s*bithusukoni/i,/गर्दन\s*अकड़/i,/hil\s*nahi/i,/kadilika\s*ledu/i,/movement\s*(?:kam|band|nahi|ledu)/i,/no\s*movement/i,/हिल\s*नहीं\s*रहा|हलचल\s*बंद/i,/కదలిక\s*లేదు/i,/thaili\s*(?:phat|fut)/i,/water\s*bag/i,/neellu\s*poyayi/i,/थैली\s*फट/i,/ఉమ్మనీరు/i,/sab\s*ulti/i,/anni\s*vandulu/i,/vomits\s*everything/i,/din\s*bhar\s*ulti/i,/paani\s*bhi.*(?:nahi\s*tik|nikal)/i,/सब\s*उल्टी|लगातार\s*उल्टी/i,/ఏమి\s*తిన్నా\s*వాంతి|నిరంతర\s*వాంతులు/i,/doodh\s*nahi\s*pee/i,/paalu\s*ta?ga(?:tledu|dam\s*ledu|vatledu)/i,/unable\s*to\s*(?:suck|drink|breastfeed)/i,/not\s*able\s*to\s*(?:drink|suck|breastfeed)/i,/दूध\s*नहीं\s*पी\s*रहा/i,/పాలు\s*తాగలేకపో/i,/\bsust\b/i,/\blethargic\b/i,/\blimp\b/i,/dheela\s*pad/i,/nidramottu/i,/सुस्त|ढीला\s*पड़/i,/నీరసం|శరీరం\s*వదులు/i,/seene\s*me\s*dard/i,/gunde\s*noppi/i,/chest\s*pain/i,/सीने\s*में.*दर्द/i,/ఛాతీలో.*నొప్పి|గుండె.*నొప్పి/i,/ek\s*taraf\s*(?:kamzor|sunn|paralysis)/i,/oka\s*vaipu\s*(?:padi|paralysis|cheyyi)/i,/one\s*side\s*(?:weak|paralysis|numb)/i,/एक\s*तरफ\s*कमजोरी|लकवा/i,/ఒకవైపు\s*పడిపో|పక్షవాతం|ఒకవైపు.*(?:లాగి|బలహీన)/i,/chehra\s*tedha|bolna\s*band/i,/मुंह\s*टेढ़ा|बोलना\s*बंद/i,/మాట\s*పడిపో|ముఖం.*లాగ|ముఖం\s*వంకర/i,/dast\s*me\s*khoon/i,/blood\s*in\s*(?:stool|stools|latrine)/i,/latrine\s*me\s*khoon/i,/bedullo\s*raktham/i,/दस्त\s*में\s*खून|मल\s*में\s*खून/i,/మలంలో\s*రక్తం/i,/\bbadbu\s*wala\s*(?:discharge|paani)/i,/\bfoul\s*smelling\b/i,/kampu\s*discharge/i,/बदबूदार\s*पानी/i,/దుర్వాసన/i,/pad\s*(?:\d+[-?]\d+\s*)?(?:min|minute)\s*me\s*bhar/i,/pad\s*(?:soaked|bhiga)/i,/(?:more than|>)\s*5\s*pads/i,/1\.[0-7]\s*kg/i,/under\s*1\.8\s*kg/i,/weight\s*less\s*than\s*1\.8/i,/1800\s*g.*kanna\s*takkuva/i,/\bpeep\b/i,/pus.*umbilic/i,/naal\s*me\s*(?:peep|pus|khoon)/i,/boddu\s*(?:cheemu|raktham)/i,/नाल\s*में\s*(?:मवाद|पीप|खून)/i,/బొడ్డు\s*వద్ద\s*(?:చీము|రక్తం)/i,/yellow\s*palm/i,/arachethulu\s*pasupu/i,/jaundice\s*first\s*day/i,/janm\s*ke\s*24\s*ghante.*peela/i,/పుట్టిన\s*24\s*గంట/i,/saans\s*tez/i,/breathing\s*fast/i,/60\s*(?:per|\/)\s*min/i,/swasa\s*vegam/i,/saans\s*phool/i,/తేజ్\s*సాంస్|సాంస్\s*ఫూల్/i,/శ్వాస\s*వేగం|ఆయాసం/i,/thanda\s*lag\s*raha/i,/challabadipovadam/i,/\bchallaga\b/i,/cold\s*to\s*touch/i,/below\s*95\.9/i,/ठंडा\s*पड़/i,/చల్లబడి|వదులై|ఏడవడం\s*లేదు/i,/ro\s*nahi\s*raha|रो\s*नहीं\s*रहा/i,/(?:[789]|\d{2,})\s*din\s*se\s*(?:roz\s*)?bukhar/i,/fever.*(?:more than|>)\s*7\s*days/i,/roz\s*bukhar.*(?:[789]|\d{2,})\s*din/i,/yedu\s*rojulakante\s*ekkuva\s*jwaram/i,/severe\s*(?:headache|pallor|abdominal\s*pain)/i,/bahut\s*peeli.*saans/i,/(?:sugar|diabetes).*(?:behosh|unconscious|fits|jhatke|insulin.*behosh|spruha)/i,/danger\s*sign/i,/khatre\s*ke\s*lakshan/i,/खतरे\s*के\s*लक्षण/i,/ప్రమాద\s*సంకేత/i,/\b108\b|\b102\b/i,/loo\s*lag|लू\s*लग|వడదెబ్బ/i,/(?:delivery|prasav|janm|प्रसव|డెలివరీ).*(?:tez\s*bukhar|high\s*fever|102|38|తేజ్\s*బుఖార్|జ్వరం|तेज\s*बुखार)/i,/(?:102|38)\s*(?:degree|डिग्री)/i,/ప్రసవానంతర.*జ్వరం/i,/barf\s*jaise\s*thande.*nabz/i,/बर्फ\s*जैसे\s*ठंडे.*नब्ज/i,/నాడి\s*(?:అంద|కొట్టుకో)|చేతులు.*చల్లబడి|కాళ్ళు.*చల్లబడి|nabz.*(?:kamzor|nahi)/i,/aankhe\s*dhas|धंसी\s*आंखें|గుంటలు\s*పడి|కళ్ళు\s*గుంటలు|చర్మం\s*నెమ్మదిగా|skin\s*pinch\s*slow|त्वचा\s*धीरे/i,/hb\s*[<]??\s*[1-6]\.\d|हीमोग्लोबिन\s*[1-6]\.\d|హిమోగ్లోబిన్\s*[1-6]\.\d|severe\s*an[ae]mia|गंभीर\s*एनीमिया|తీవ్ర\s*రక్తహీనత/i,/janm\s*ke\s*24\s*ghante|जन्म\s*के\s*24\s*घंटे|పుట్టిన\s*24\s*గంట/i,/(?:dono\s*pair.*sujan|pitting\s*edema|गड्ढा\s*पड़|పాదాల.*వాపు|గుంటలు\s*పడే\s*వాపు)/i,/(?:dengue|डेंगू|డెంగ్యూ).*(?:pet\s*dard|ulti|కడుపు\s*నొప్పి|వాంతులు|पेट\s*दर्द|उल्टी)/i],Te=[{pattern:/thanda|cold\s*to\s*touch|below\s*95|challabadipovadam|\bchallaga\b|ठंडा\s*पड़|చల్లబడి|వదులై|చేతులు.*చల్లబడి|ro\s*nahi|रो\s*नहीं|ఏడవడం\s*లేదు/i,secId:"ESC-4.3"},{pattern:/1\.[0-7]\s*kg|under\s*1\.8|weight\s*less|1800\s*g/i,secId:"ESC-4.4"},{pattern:/pad.*(?:minute|min|bhar)|more than 5 pads|prasav.*(?:khoon|रक्त|రక్తం)|delivery.*(?:khoon|రక్తం)|ప్రసవం.*రక్తం/i,secId:"ESC-3.1"},{pattern:/din\s*bhar\s*ulti|paani\s*bhi.*(?:nahi|nikal)|anni\s*vandulu/i,secId:"ESC-2.6"},{pattern:/peeli.*saans|severe\s*pallor.*breath|hb\s*[<]??\s*[1-6]\.\d|हीमोग्लोबिन\s*[1-6]\.\d|హిమోగ్లోబిన్\s*[1-6]\.\d|severe\s*an[ae]mia|गंभीर\s*एनीमिया|తీవ్ర\s*రక్తహీనత/i,secId:"ESC-2.5"},{pattern:/(?:[789]|\d{2,})\s*din\s*se.*bukhar|fever.*(?:>|more than)\s*7\s*days/i,secId:"ESC-5.4"},{pattern:/(?:sugar|diabetes).*(?:behosh|unconscious|fits|jhatke|insulin.*behosh|spruha)/i,secId:"ESC-6.3"},{pattern:/pair.*suja.*sir.*dard|chehra\s*suja|chehre\s*par\s*sujan|kallu.*veekam.*talanoppi|चेहरा\s*सूजा|चेहरे\s*पर\s*सूजन|ముఖం\s*వాచి|ముఖం\s*వాపు|blurry|dhundhla|धुंधला|మసక/i,secId:"ESC-2.3"},{pattern:/jhatke|convuls|fits|valsulu|दौरे|ఫిట్స్/i,secId:"ESC-5.1"},{pattern:/dengue.*(?:pet\s*dard|ulti|వాంతులు|पेट\s*दर्द|उल्टी)/i,secId:"ESC-5.1"},{pattern:/doodh\s*nahi\s*pee|not\s*able\s*to\s*(?:drink|suck)|paalu\s*ta?ga(?:tledu|dam\s*ledu)|दूध\s*नहीं|పాలు\s*తాగ/i,secId:"ESC-5.1"},{pattern:/behosh|unconscious|बेहोश|స్పృహ|అపస్మారక/i,secId:"ESC-5.1"},{pattern:/pasli\s*(?:andar|chal|dhans)|chest\s*indrawing|rommu\s*lopalki|पसली|పక్కటెముకలు|stridor|स्ट्राइडर|పిల్లికూతలు|gharkharahat|घुरघुराहट|గొంతులో\s*శబ్దం|seeti\s*jaisi\s*aawaz|ఊపిరి.*శబ్దం/i,secId:"ESC-5.2"},{pattern:/seene\s*me.*dard|chest\s*pain|gunde\s*noppi|सीने\s*में.*दर्द|ఛాతీలో.*నొప్పి/i,secId:"ESC-6.1"},{pattern:/ek\s*taraf|one\s*side|oka\s*vaipu|लकवा|పక్షవాతం|chehra\s*tedha|bolna\s*band|मुंह\s*टेढ़ा|बोलना\s*बंद|మాట\s*పడిపో|ముఖం.*లాగ|ముఖం\s*వంకర/i,secId:"ESC-6.2"},{pattern:/dast\s*me\s*khoon|blood\s*in\s*stool|latrine.*khoon|aankhe\s*dhas|धंसी\s*आंखें|గుంటలు\s*పడి|కళ్ళు\s*గుంటలు|చర్మం\s*నెమ్మదిగా|skin\s*pinch/i,secId:"ESC-5.3"},{pattern:/badbu.*discharge|foul.*smell|kampu|delivery.*(?:bukhar|జ్వరం)|prasav.*(?:bukhar|बुखार)|102.*(?:degree|डिग्री)|38.*(?:degree|डिग्री)|प्रसव.*बुखार|డెలివరీ.*జ్వరం/i,secId:"ESC-3.2"},{pattern:/water\s*bag|thaili|neellu\s*poyayi|थैली\s*फट|ఉమ్మనీరు/i,secId:"ESC-2.8"},{pattern:/janm.*24\s*ghante|24\s*hours.*jaundice|పుట్టిన\s*24\s*గంట|जन्म\s*के\s*24\s*घंटे/i,secId:"ESC-4.4"},{pattern:/naal.*(?:peep|pus|khoon)|boddu.*(?:cheemu|raktham)|नाल.*मवाद|బొడ్డు.*చీము/i,secId:"ESC-4.2"},{pattern:/bleeding|khoon|raktham|रक्तस्राव|రక్తం/i,secId:"ESC-2.1"},{pattern:/barf\s*jaise|बर्फ\s*जैसे|కాళ్ళు.*చల్లబడి|చేతులు.*చల్లబడి|నాడి\s*(?:అంద|కొట్టుకో)|nabz.*(?:kamzor|nahi)/i,secId:"ESC-1.2"},{pattern:/108|loo\s*lag|लू\s*लग|వడదెబ్బ|danger\s*sign|khatre\s*ke\s*lakshan|खतरे\s*के\s*लक्षण|ప్రమాద\s*సంకేత/i,secId:"ESC-1.1"}];function Ae(i){return!i||typeof i!="string"?!1:xe.some(t=>t.test(i))}function Ee(i){if(!i)return"ESC-1.1";for(const{pattern:t,secId:e}of Te)if(t.test(i))return e;return"ESC-1.1"}const He=[/\bparacetamol\b/i,/पैरासिटामोल|పారాసిటమాల్/i,/\bsyrup\b/i,/सिरप|సిరప్/i,/\bkitna\s*dena\b/i,/\bkitni\s*(?:dose|goli|tablet|dawai)\b/i,/कितनी\s*(?:गोली|खुराक|दवा)/i,/ఎంత\s*మోతాదు|ఎన్ని\s*మాత్ర/i,/\bwhat\s*dose\b/i,/\bmg\s*(?:dose|tablet)?\b/i,/\bantibiotic\b/i,/एंटीबायोटिक|యాంటీబయాటిక్/i,/\bamoxicillin\b/i,/अमोक्सीसिलीन|అమోక్సిసిలిన్/i,/\bcefixime\b/i,/\binsulin\s*kitni\b/i,/\bmetformin\b/i,/मेटफॉर्मिन|మెట్‌ఫార్మిన్/i,/\bamlodipine\b/i,/एमलोडिपाइन|ఆమ్లోడిపైన్/i,/\boxytocin\b/i,/ऑक्सीटोसिन|ఆక్సిటోసిన్/i,/\bdoxycycline\b/i,/डॉक्सीसाइक्लिन|డాక్సీసైక్లిన్/i,/\bsaline\b/i,/\bglucose\s*ki\s*botal\b/i,/सलाइन|ग्लूकोज\s*की\s*बोतल/i,/సెలైన్|గ్లూకోజ్\s*బాటిల్/i,/\binjection\b/i,/इंजेक्शन|ఇంజెక్షన్/i,/\bnaatu\s*marunthu\b/i,/जड़ी-बूटी|झाड़-फूंक/i,/నాటు\s*మందు/i,/\bprescription\b/i,/\bkoi\s*dawai\b/i,/\bdawai\s*ka\s*naam\b/i,/what\s*medicine/i,/kaunsi\s*dawai/i,/e\s*mandulu\s*vevali/i,/dosage\s*yentha/i,/\bu-win\b/i,/\blogin\b/i,/\botp\b/i,/\bapp\b/i,/\bsalary\b/i,/\bincentive\b/i,/\bhiv\b/i,/\btyphoid\s*(?:ka\s*)?(?:test|widal)\b/i,/\bwidal\b/i,/\bcovid\b/i,/\btb\b/i,/\bdengue\s*(?:ka\s*)?test\b/i,/\bplatelet\b/i,/\bration\b/i,/\bayushman\b/i,/\bcertificate\b/i,/\bpraman\b/i,/\bbistar\s*geela\b/i,/\benuresis\b/i,/\bultrasound\b/i,/\bx-ray\b/i,/\bgarbhpat\b/i,/\babortion\b/i];function _e(i){return!i||typeof i!="string"?!1:He.some(t=>t.test(i))}const re=[{id:"SEASONAL-DENGUE",name:"Dengue Fever",category:"vector_borne",aliases:["dengue","dengue fever","dengu","breakbone fever","dengue jwaram","డేంగ్యూ","డెంగ్యూ","డెంగ్యూ జ్వరం","डेंगू","डेंगू बुखार"],citation:"NCVBDC National Guidelines for Clinical Management of Dengue Fever (Govt of India)",dangerSigns:"Severe continuous abdominal pain, persistent vomiting (>3 episodes), mucosal bleeding (gums, nose, black stools), lethargy, rapid drop in temperature with cold clammy extremities, difficulty breathing.",immediateReferral:!0,frontlineCare:"1. Encourage adequate oral fluids: ORS, coconut water, lemon water, kanji, fresh fruit juices to prevent dehydration. 2. Give Paracetamol only for high fever and body ache. NEVER give Aspirin, Ibuprofen, Diclofenac or any NSAIDs as they increase bleeding risk. 3. Use mosquito nets and eliminate standing water around houses. 4. Refer urgently to PHC/CHC if warning signs develop.",summaryEn:"Dengue guidance (NCVBDC): Ensure abundant oral hydration (ORS, fluids). Use Paracetamol only for fever; NEVER give Aspirin or Ibuprofen. Monitor closely for danger signs: severe abdominal pain, persistent vomiting, bleeding from gums/nose, or sudden lethargy. If any danger sign appears, refer immediately to CHC/District Hospital (108).",summaryHi:"डेंगू दिशानिर्देश (NCVBDC): प्रचुर मात्रा में तरल पदार्थ (ORS, नारियल पानी) पिलाएं। बुखार के लिए केवल पैरासिटामोल दें; एस्पिरिन या आईबुप्रोफेन कभी न दें। चेतावनी के लक्षण देखें: पेट में तेज दर्द, बार-बार उल्टी, मसूड़ों/नाक से खून, अत्यधिक सुस्ती। यदि कोई चेतावनी लक्षण दिखे, तुरंत 108 पर कॉल करके अस्पताल भेजें।",summaryTe:"డెంగ్యూ మార్గదర్శకాలు (NCVBDC): తగినంత ద్రవాలు (ORS, కొబ్బరి నీళ్ళు, కంజి) తాగించండి. జ్వరానికి పారాసిటమాల్ మాత్రమే ఇవ్వండి; ఆస్పిరిన్ లేదా ఐబుప్రోఫెన్ ఎప్పుడూ ఇవ్వవద్దు. హెచ్చరిక సంకేతాలను గమనించండి: తీవ్రమైన కడుపు నొప్పి, నిరంతర వాంతులు, చిగుళ్ళు లేదా ముక్కు నుండి రక్తస్రావం, తీవ్రమైన అలసట. ఈ లక్షణాలు ఉంటే వెంటనే ఆసుపత్రికి పంపండి (108)."},{id:"SEASONAL-MALARIA",name:"Malaria",category:"vector_borne",aliases:["malaria","chills and rigors","sheet jwar","మలేరియా","చలి జ్వరం","వణుకు జ్వరం","मलेरिया","ठंड लगकर बुखार","कंपकंपी"],citation:"NCVBDC National Drug Policy on Malaria (Govt of India)",dangerSigns:"Impaired consciousness, convulsions, persistent vomiting, jaundice, severe anemia (extreme paleness), respiratory distress, dark urine (blackwater fever).",immediateReferral:!0,frontlineCare:"1. Perform immediate Rapid Diagnostic Test (RDT) or prepare thick/thin blood smear before starting antimalarial. 2. If RDT is positive, administer age-appropriate ACT (Artemisinin-based Combination Therapy) for P. falciparum or Chloroquine for P. vivax as per national schedule under MO guidance. 3. Ensure bed nets (LLIN) are used. 4. Any pregnant woman or infant with malaria must be referred to Medical Officer immediately.",summaryEn:"Malaria guidance (NCVBDC): Perform RDT or blood slide for any fever with chills. Administer complete course of ACT or Chloroquine as per blood test result under Medical Officer supervision. Ensure LLIN mosquito net usage. Immediate referral for pregnant women, infants, or patients with altered consciousness or jaundice.",summaryHi:"मलेरिया दिशानिर्देश (NCVBDC): ठंड लगकर आने वाले बुखार में तुरंत RDT जांच या स्लाइड बनाएं। जांच रिपोर्ट के अनुसार डॉक्टर की सलाह से ACT या क्लोरोक्वीन का पूरा कोर्स दें। मच्छरदानी (LLIN) का नियमित उपयोग सुनिश्चित करें। गर्भवती महिलाओं, शिशुओं और बेहोशी/पीलिया के मामलों को तुरंत अस्पताल रेफर करें।",summaryTe:"మలేరియా మార్గదర్శకాలు (NCVBDC): చలి, వణుకుతో కూడిన జ్వరంలో వెంటనే RDT పరీక్ష లేదా రక్త పూత పరీక్ష చేయండి. వైద్యుని పర్యవేక్షణలో పూర్తి మోతాదులో మందులు అందించండి. దోమతెరలు (LLIN) వాడకాన్ని ప్రోత్సహించండి. గర్భిణులు, శిశువులు లేదా స్పృహతప్పిన రోగులను వెంటనే ఆసుపత్రికి తరలించండి."},{id:"SEASONAL-CHIKUNGUNYA",name:"Chikungunya",category:"vector_borne",aliases:["chikungunya","chikangunya","joint pain fever","చికున్‌గున్యా","కీళ్ల నొప్పుల జ్వరం","చికెన్‌గున్యా","चिकनगुनिया","जोड़ों के दर्द वाला बुखार"],citation:"NCVBDC Guidelines on Clinical Management of Chikungunya (Govt of India)",dangerSigns:"Severe neurological symptoms, inability to eat or drink, dehydration in elderly or infants, prolonged high fever >5 days.",immediateReferral:!1,frontlineCare:"1. Symptomatic relief: Paracetamol for fever and pain. Avoid Aspirin and other NSAIDs in the acute phase. 2. Cold compresses on painful swollen joints and gentle joint movement. 3. High fluid intake and complete rest. 4. Referral to PHC for severe joint incapacitation or persistent symptoms.",summaryEn:"Chikungunya guidance (NCVBDC): Provide Paracetamol for fever and severe joint pains. Avoid Aspirin. Apply cold compresses to painful swollen joints. Ensure adequate fluid intake and bed rest. Refer elderly, infants, or patients unable to ambulate to the Medical Officer.",summaryHi:"चिकनगुनिया दिशानिर्देश (NCVBDC): बुखार और जोड़ों के तेज दर्द के लिए पैरासिटामोल दें। एस्पिरिन से बचें। सूजे हुए जोड़ों पर ठंडी सिकाई करें। पर्याप्त मात्रा में पानी और आराम सुनिश्चित करें। अत्यधिक कमजोरी या बुजुर्गों को प्राथमिक स्वास्थ्य केंद्र भेजें।",summaryTe:"చికున్‌గున్యా మార్గదర్శకాలు (NCVBDC): జ్వరం మరియు తీవ్రమైన కీళ్ళ నొప్పుల కోసం పారాసిటమాల్ ఇవ్వండి. ఆస్పిరిన్ వాడవద్దు. నొప్పులు ఉన్న కీళ్ళపై చల్లని వస్త్రంతో కాపడం పెట్టండి. విశ్రాంతి మరియు పుష్కలంగా ద్రవాలు తాగించండి. తీవ్రమైన లక్షణాలు ఉంటే ప్రాథమిక ఆరోగ్య కేంద్రానికి పంపండి."},{id:"SEASONAL-VIRAL-FEVER",name:"Seasonal Viral Fever & Acute Respiratory Infection",category:"respiratory_viral",aliases:["viral fever","seasonal fever","flu","cough and cold","influenza","వైరల్ జ్వరం","కాలానుగుణ జ్వరం","జలుబు దగ్గు జ్వరం","वायरल बुखार","मौसमी बुखार","सर्दी जुकाम बुखार","फ्लू"],citation:"IDSP Guidelines for Viral Respiratory Infections and Seasonal Influenza (Govt of India)",dangerSigns:"Breathing difficulty, chest indrawing, stridor, unable to drink fluids, lethargy, fever lasting more than 3-5 days without improvement.",immediateReferral:!1,frontlineCare:"1. Rest and warm fluids (boiled warm water, herbal tea, soup). 2. Paracetamol for fever according to age/weight. 3. Steam inhalation and saline nasal drops for nasal congestion. 4. Never prescribe antibiotics without MO examination. 5. If fast breathing or chest indrawing observed, refer urgently (03_ESC / 06_CHD).",summaryEn:"Seasonal Viral Fever guidance (IDSP): Ensure plenty of warm fluids, rest, and Paracetamol for fever. Do not give unprescribed antibiotics. Watch respiratory rate: fast breathing or chest indrawing indicates pneumonia needing urgent hospital referral (CHD-3.1 / ESC-5.2).",summaryHi:"मौसमी वायरल बुखार दिशानिर्देश (IDSP): पर्याप्त आराम, गर्म पेय पदार्थ और बुखार के लिए पैरासिटामोल दें। बिना डॉक्टर की सलाह के एंटीबायोटिक कभी न दें। सांस की गति पर नजर रखें: तेज सांस या पसली धंसना निमोनिया का संकेत है, तुरंत रेफर करें।",summaryTe:"కాలానుగుణ వైరల్ జ్వరం మార్గదర్శకాలు (IDSP): పుష్కలంగా గోరువెచ్చని ద్రవాలు, విశ్రాంతి మరియు జ్వరానికి పారాసిటమాల్ అందించండి. యాంటీబయాటిక్స్ అనవసరంగా వాడవద్దు. శ్వాస వేగాన్ని గమనించండి: వేగంగా శ్వాస తీసుకోవడం లేదా పక్కటెముకలు లోపలికి లాగడం న్యుమోనియా సంకేతం, వెంటనే రెఫర్ చేయండి."},{id:"SEASONAL-TYPHOID",name:"Typhoid (Enteric Fever)",category:"enteric",aliases:["typhoid","enteric fever","motijhara","meadi bukhar","టైఫాయిడ్","విషమ జ్వరం","టైఫాయిడ్ జ్వరం","टाइफाइड","मियादी बुखार","मोतीझरा"],citation:"NHM Guidelines for Prevention and Control of Enteric Fever (Govt of India)",dangerSigns:"Severe abdominal tenderness/distension (intestinal perforation risk), gastrointestinal bleeding (black tarry stools), persistent vomiting, delirium or high fever unresponsive to antipyretics.",immediateReferral:!0,frontlineCare:"1. Refer to Medical Officer for diagnostic blood culture/Widal and prescription of appropriate antibiotics. 2. Stress drinking only boiled or chlorinated water. 3. Wash hands with soap before eating and preparing food. 4. High-calorie, easily digestible soft diet (khichdi, mashed potatoes, banana).",summaryEn:"Typhoid guidance (NHM): Suspect when continuous step-ladder fever persists over a week with headache and abdominal discomfort. Refer to PHC for confirmatory blood tests and doctor-prescribed antibiotics. Strict drinking of boiled water and hand hygiene. Red flag: severe abdominal pain or black stools requires emergency surgical assessment.",summaryHi:"टाइफाइड दिशानिर्देश (NHM): एक सप्ताह से अधिक लगातार चढ़ते बुखार, सिरदर्द और पेट दर्द में टाइफाइड का संदेह करें। खून की जांच और डॉक्टर द्वारा एंटीबायोटिक के लिए PHC रेफर करें। केवल उबला हुआ पानी पिएं और स्वच्छता रखें। पेट में तेज दर्द होने पर तुरंत आपातकालीन रेफरल करें।",summaryTe:"టైఫాయిడ్ మార్గదర్శకాలు (NHM): ఒక వారం కంటే ఎక్కువ కాలం నిరంతర జ్వరం, తలనొప్పి మరియు కడుపు నొప్పితో ఉంటే టైఫాయిడ్ అనుమానించండి. రక్త పరీక్షలు మరియు వైద్యుల సూచనల మేరకు యాంటీబయాటిక్స్ కోసం PHC కి రెఫర్ చేయండి. కాచి చల్లార్చిన నీటిని మాత్రమే తాగండి."},{id:"SEASONAL-DIARRHOEA",name:"Acute Diarrhoea & Dehydration",category:"waterborne",aliases:["diarrhoea","diarrhea","loose motions","dehydration","dast","virochanalu","neella virochanalu","neellu","విరోచనాలు","నీళ్ల విరోచనాలు","డీహైడ్రేషన్","వరిసే విరోచనాలు","दस्त","पतले दस्त","उल्टी दस्त","निर्जलीकरण"],citation:"NHM Child Health Division Guidelines on Management of Acute Diarrhoea and ORS-Zinc (Govt of India)",dangerSigns:"Sunken eyes, skin pinch goes back very slowly (>2 seconds), lethargy or unconsciousness, unable to drink or drinking eagerly/thirstily, blood in stool (dysentery).",immediateReferral:!1,frontlineCare:"1. Prepare WHO-formula ORS: Dissolve 1 full packet in 1 litre of clean drinking water; use within 24 hours. 2. Give ORS after every loose stool (50-100 ml for child <2 years, 100-200 ml for older child). 3. Start Zinc dispersible tablets (20 mg daily, 10 mg for <6 months) for 14 continuous days to rebuild gut mucosa. 4. Continue breastfeeding and feeding. 5. If child vomits, wait 10 minutes and continue giving ORS slowly with a spoon. 6. Refer immediately if signs of severe dehydration or blood in stool occur.",summaryEn:"Acute Diarrhoea guidance (NHM): Give WHO-ORS continuously after every loose stool (dissolve 1 packet in 1 L clean water). Give Zinc 20 mg daily for 14 days. Continue breastfeeding and regular soft food. If vomiting occurs, wait 10 minutes then give ORS in small sips. Refer urgently if lethargic, sunken eyes, or blood in stool (06_CHD / 03_ESC).",summaryHi:"दस्त एवं निर्जलीकरण दिशानिर्देश (NHM): हर पतले दस्त के बाद WHO-ORS घोल दें (1 पैकेट 1 लीटर साफ पानी में)। 14 दिनों तक रोजाना जिंक (20 mg) की गोली दें। स्तनपान और सुपाच्य भोजन जारी रखें। उल्टी होने पर 10 मिनट रुकें और चम्मच से धीरे-धीरे ORS दें। यदि आंखें धंसें या सुस्ती आए तो तुरंत अस्पताल ले जाएं।",summaryTe:"విరోచనాలు & డీహైడ్రేషన్ మార్గదర్శకాలు (NHM): ప్రతి నీళ్ల విరోచనం తర్వాత WHO-ORS ద్రావణం తాగించండి (1 ప్యాకెట్ 1 లీటర్ శుభ్రమైన నీటిలో). 14 రోజుల పాటు ప్రతిరోజూ జింక్ (20 mg) మాత్ర ఇవ్వండి. తల్లిపాలు మరియు ఆహారం కొనసాగించండి. వాంతులు అయితే 10 నిమిషాలు ఆగి చిన్న చెంచాతో మెల్లగా ORS ఇవ్వండి. కళ్ళు గుంటలు పడినా లేదా తీవ్రమైన నీరసం ఉంటే వెంటనే ఆసుపత్రికి పంపండి."},{id:"SEASONAL-CHOLERA",name:"Cholera (Epidemic Watery Diarrhoea)",category:"waterborne",aliases:["cholera","rice water stool","maha mari","వాంతులు విరోచనాలు","కలరా","చలవ విరోచనాలు","हैजा","चावल के पानी जैसा दस्त","महामारी दस्त"],citation:"IDSP Guidelines for Investigation and Control of Cholera Outbreaks (Govt of India)",dangerSigns:"Rapid profuse watery stools resembling rice-water, rapid pulse, undetectable BP, extreme muscle cramps, anuria (no urination), hypovolemic shock within hours.",immediateReferral:!0,frontlineCare:"1. Medical Emergency: Call 108 immediately for urgent hospital transfer. 2. Start aggressive oral rehydration with ORS while awaiting transport. 3. Immediately notify the Medical Officer and District Surveillance Officer (IDSP). 4. Chlorinate all community drinking water sources (super-chlorination to 2 ppm).",summaryEn:"Cholera Emergency (IDSP): Profuse rice-water stools cause fatal dehydration within hours. Call 108 immediately for IV fluid resuscitation (Ringer Lactate) at PHC/Hospital. Give continuous ORS while waiting. Alert Medical Officer and IDSP for outbreak investigation.",summaryHi:"हैजा आपातकाल (IDSP): चावल के पानी जैसे पतले दस्त से कुछ ही घंटों में जानलेवा निर्जलीकरण हो सकता है। तुरंत 108 पर कॉल करें और IV ड्रिप (रिंगर लैक्टेट) के लिए अस्पताल भेजें। एम्बुलेंस आने तक लगातार ORS पिलाते रहें। महामारी नियंत्रण के लिए डॉक्टर को तुरंत सूचित करें।",summaryTe:"కలరా అత్యవసర మార్గదర్శకాలు (IDSP): బియ్యం కడిగిన నీళ్ళలాంటి విరోచనాలు ప్రాణాంతకమైన డీహైడ్రేషన్‌కు దారితీస్తాయి. వెంటనే 108కి కాల్ చేసి ఆసుపత్రికి తరలించండి. అంబులెన్స్ వచ్చే వరకు నిరంతరం ORS ద్రావణం తాగించండి. వ్యాధి వ్యాప్తిని అరికట్టడానికి వెంటనే వైద్యాధికారికి సమాచారం ఇవ్వండి."},{id:"SEASONAL-JAUNDICE",name:"Acute Viral Hepatitis (Jaundice)",category:"waterborne_viral",aliases:["jaundice","hepatitis","yellow eyes","peeliya","కామెర్లు","పచ్చ కామెర్లు","పసుపు కళ్ళు","పీలియా","हेपेटाइटिस","पीली आंखें","पीला पेशाब"],citation:"NVHCP Guidelines on Clinical Management of Viral Hepatitis (Govt of India)",dangerSigns:"Altered mental status, drowsiness, flapping tremors (hepatic encephalopathy), bleeding tendency, persistent severe vomiting, deep dark jaundice in pregnancy (Hepatitis E risk).",immediateReferral:!0,frontlineCare:"1. Refer to Medical Officer for liver function testing and serology (Hepatitis A, E, B). 2. Bed rest and high carbohydrate, easily digestible diet (sugarcane juice from hygienic source, fruit juices, boiled vegetables). 3. Avoid paracetamol overdose, unverified traditional herbs, or sedatives. 4. Ensure safe boiled drinking water for the whole family.",summaryEn:"Jaundice / Viral Hepatitis guidance (NVHCP): Yellow discoloration of sclera and dark urine indicates hepatitis. Refer to PHC for liver assessment. Advise complete rest and hygienic light carbohydrate diet. Avoid harmful unverified herbal quack remedies. Pregnant women with jaundice require emergency obstetric assessment due to high mortality risk.",summaryHi:"पीलिया / हेपेटाइटिस दिशानिर्देश (NVHCP): आंखों का पीलापन और गहरा पीला पेशाब हेपेटाइटिस के लक्षण हैं। जांच के लिए PHC भेजें। पूर्ण आराम और स्वच्छ सुपाच्य भोजन की सलाह दें। अप्रमाणित जड़ी-बूटियों या झाड़-फूंक से बचें। गर्भवती महिला में पीलिया अत्यंत खतरनाक है, तुरंत अस्पताल भेजें।",summaryTe:"కామెర్లు / హెపటైటిస్ మార్గదర్శకాలు (NVHCP): కళ్ళు పచ్చబడటం, ముదురు పసుపు రంగు మూత్రం కామెర్ల లక్షణాలు. పరీక్షల కోసం ప్రాథమిక ఆరోగ్య కేంద్రానికి పంపండి. పూర్తి విశ్రాంతి మరియు శుభ్రమైన తేలికపాటి ఆహారం సూచించండి. నకిలీ నాటు మందులు వాడవద్దు. గర్భిణులలో కామెర్లు కనిపిస్తే ప్రాణాపాయం కాబట్టి వెంటనే ఆసుపత్రికి తరలించండి."},{id:"SEASONAL-HEAT-STROKE",name:"Heat Stroke & Heat Exhaustion",category:"environmental",aliases:["heat stroke","sun stroke","heat exhaustion","loo","vada debba","ఎండదెబ్బ","వడదెబ్బ","ఎండ తీవ్రత","लू","लू लगना","हीट स्ट्रोक","धूप का असर"],citation:"NDMA National Guidelines for Preparation of Action Plan - Prevention and Management of Heat Wave (Govt of India)",dangerSigns:"Body temperature >= 104°F (40°C), hot dry skin without sweating, delirium, unconsciousness, convulsions, rapid shallow breathing, vomiting.",immediateReferral:!0,frontlineCare:"1. Medical Emergency: Call 108 immediately. 2. Move patient to a cool, shaded, ventilated area. 3. Active rapid cooling: Remove excess clothing, sponge entire body with cold tap water, place wet cloths on neck, armpits, and groin, use a fan. 4. If conscious, give cool ORS, buttermilk, or lemon water. Never force fluids if unconscious.",summaryEn:"Heat Stroke Emergency (NDMA): Extreme heat injury with core body temperature >= 104°F and altered consciousness. Call 108 immediately. Rapid active cooling is life-saving: move to shade, sponge entire body with cool water, apply cold packs to neck/groin, and fan vigorously until transport arrives.",summaryHi:"लू लगना / हीट स्ट्रोक आपातकाल (NDMA): शरीर का तापमान 104°F या अधिक होना और बेहोशी होना एक आपातकाल है। तुरंत 108 बुलाएं। तुरंत ठंडा करना जीवनरक्षक है: छायादार जगह में ले जाएं, पूरे शरीर पर ठंडे पानी की पट्टी रखें, गर्दन और कांख में ठंडी पट्टी रखें और पंखा झलें।",summaryTe:"వడదెబ్బ అత్యవసర మార్గదర్శకాలు (NDMA): శరీర ఉష్ణోగ్రత 104°F దాటడం మరియు స్పృహ కోల్పోవడం అత్యవసర పరిస్థితి. వెంటనే 108కి కాల్ చేయండి. వెంటనే శరీరాన్ని చల్లబరచడం ప్రాణాలను కాపాడుతుంది: రోగిని నీడకు చేర్చండి, చల్లని నీటితో శరీరాన్ని తుడువండి, మెడ మరియు గజ్జల్లో తడి గుడ్డలు ఉంచండి."},{id:"SEASONAL-LEPTOSPIROSIS",name:"Leptospirosis (Post-Flood / Field Worker Fever)",category:"zoonotic",aliases:["leptospirosis","flood fever","rat fever","కాలుష్య నీటి జ్వరం","లెప్టోస్పైరోసిస్","ఎలుక మూత్ర జ్వరం","लेप्टोस्पायरोसिस","बाढ़ बुखार","चूहा बुखार"],citation:"National Programme for Prevention and Control of Leptospirosis (NPPCL, Govt of India)",dangerSigns:"Red conjunctival suffusion without discharge, intense calf muscle tenderness, jaundice, oliguria (scanty urine), breathlessness with blood-stained sputum.",immediateReferral:!0,frontlineCare:"1. Strongly suspect in individuals who walked through flood waters or worked in muddy fields with cuts/wounds. 2. Refer immediately to PHC for early antibiotic therapy (Doxycycline / Penicillin) by Medical Officer. 3. Keep wounds clean and covered. 4. Avoid wading in stagnant muddy flood water.",summaryEn:"Leptospirosis guidance (NPPCL): Suspect when high fever occurs after contact with flood waters or mud, marked by red eyes and severe calf muscle pain. Immediate Medical Officer assessment required for prompt antibiotic administration to prevent kidney and liver complications.",summaryHi:"लेप्टोस्पायरोसिस दिशानिर्देश (NPPCL): बाढ़ के पानी या कीचड़ के संपर्क के बाद तेज बुखार, आंखों का लाल होना और पिंडलियों में तेज दर्द होने पर इसका संदेह करें। गुर्दे और लिवर के नुकसान से बचने के लिए तुरंत डॉक्टर से जांच करवाएं और एंटीबायोटिक शुरू कराएं।",summaryTe:"లెప్టోస్పైరోసిస్ మార్గదర్శకాలు (NPPCL): వరద నీరు లేదా బురదలో తిరిగిన తర్వాత జ్వరం, ఎర్రటి కళ్ళు మరియు పిక్కల తీవ్రమైన నొప్పితో ఉంటే అనుమానించండి. కిడ్నీలు మరియు కాలేయానికి హాని జరగకుండా నివారించడానికి వెంటనే వైద్యుని వద్దకు తీసుకెళ్లండి."},{id:"SEASONAL-SCRUB-TYPHUS",name:"Scrub Typhus",category:"vector_borne",aliases:["scrub typhus","eschar fever","mite bite fever","నల్లి కాటు జ్వరం","స్క్రబ్ టైఫస్","నల్ల మచ్చ జ్వరం","स्क्रब टाइफस","काली पपड़ी वाला बुखार","पिस्सू बुखार"],citation:"NVBDC National Guidelines on Scrub Typhus and Rickettsial Diseases (Govt of India)",dangerSigns:"Pneumonitis (cough, breathlessness), altered sensorium, hypotension, multi-organ dysfunction.",immediateReferral:!0,frontlineCare:"1. Look for diagnostic 'Eschar' — a small painless black cigarette-burn scab in groin, axilla, or neck. 2. Refer to PHC immediately for specific antibiotic therapy (Doxycycline / Azithromycin as prescribed by MO). 3. Avoid sitting directly on shrubs or bushes in grassy rural areas.",summaryEn:"Scrub Typhus guidance (NVBDC): Transmitted by larval mites in vegetation. Search patient body for an 'Eschar' (black cigarette-burn scab). Prompt referral to PHC for doctor-prescribed Doxycycline or Azithromycin is curative and prevents severe organ failure.",summaryHi:"स्क्रब टाइफस दिशानिर्देश (NVBDC): झाड़ियों में पाए जाने वाले कीट के काटने से फैलता है। शरीर (विशेषकर बगल या जांघ) पर सिगरेट के जले जैसे काले निशान (एस्कर) की जांच करें। समय पर डॉक्टर से जांच और दवा के लिए तुरंत अस्पताल भेजें।",summaryTe:"స్క్రబ్ టైఫస్ మార్గదర్శకాలు (NVBDC): పొదలు, గడ్డిలో ఉండే కీటకాల కాటు వల్ల వస్తుంది. శరీరంపై సిగరెట్ కాలిన గాయం వంటి నల్లటి మచ్చ (ఎస్కార్) ఉందేమో వెతకండి. సరైన మందుల కోసం వెంటనే వైద్యాధికారి వద్దకు రెఫర్ చేయండి."}];function Ne(i,t=re){if(!i||typeof i!="string")return null;const e=i.toLowerCase().trim(),n=Array.isArray(t)&&t.length>0?t:re;for(const a of n)if(a.aliases)for(const r of a.aliases){const d=r.toLowerCase().trim();if(d&&e.includes(d))return a}return null}function ye(i,t,e,n=400,a={}){const r=performance.now(),d=(i||"").trim(),l=d.toLowerCase(),g=a.lang||"en",k=a.seasonalPack||re,m=Ae(d),p=!m&&_e(d);let c="",s=[],h="answer",y="SCP-1.1";if(m)if(h="escalate",y=Ee(d),s=[y],y==="ESC-6.3"&&(l.includes("behosh")||l.includes("unconscious")||l.includes("spruha")))c="DANGER SIGN — REFER IMMEDIATELY. Call 108. Unconscious diabetes patient: give nothing by mouth (ESC-6.3, ESC-1.3).";else{const x=e[y]||e["ESC-1.1"],o=x?x.clean_text:"Refer immediately. Call 108 or 102.";c=he(`DANGER SIGN — REFER IMMEDIATELY. Call 108 or 102. Do not wait. ${o}`,n)}else if(p)h="refuse",y="SCP-1.2",s=["SCP-1.2"],c="This question is outside frontline worker protocols. Please refer to the Medical Officer or ANM at the Sub-Centre / PHC (SCP-1.2).";else{const x=Ne(d,k);if(l.includes("exercise")||l.includes("kasrat"))s=["NCD-3.1"],c="At least 30 minutes of regular activity for at least 5 days a week (150 minutes a week) (NCD-3.1).";else if(/hb\s*\d+\.\d+/i.test(d)&&l.includes("pregnant"))s=["ANC-3.1","ANC-3.2"],c="Hb 7.0-9.9 is moderate anaemia; treat as advised by ANM/MO (ANC-3.1, ANC-3.2).";else if(l.includes("ors")&&l.includes("ulti"))s=["CHD-1.2"],c="If the child vomits, wait 10 minutes, then continue ORS more slowly in small sips (CHD-1.2).";else if(l.includes("nehlana")||l.includes("nehlayen")||l.includes("bath")&&l.includes("wajan"))s=["HBNC-2.2"],c="Do not bathe a low birth weight baby until its weight is 2000 g (2 kg); clean with a soft warm wet cloth (HBNC-2.2).";else if(l.includes("chautha anc")||l.includes("4th anc"))s=["ANC-1.2"],c="4th ANC check-up is between 36 weeks and delivery (ANC-1.2).";else if(l.includes("saans gin")||l.includes("khansi")&&l.includes("saans"))s=["CHD-3.1"],c="Fast breathing: 50 per minute or more at 2–12 months; 40 per minute or more at 12 months–5 years (CHD-3.1).";else if(l.includes("mr")&&(l.includes("saal")||l.includes("chhoot")||l.includes("delay")))s=["IMM-2.3"],c="Yes, MR can be given till 5 years of age (IMM-2.3). Inform the ANM.";else if(l.includes("penta")&&(l.includes("mahine")||l.includes("saal")||l.includes("chhoot")))s=["IMM-2.2"],c="No. Penta can be given only till one year of age (365 days); inform the ANM/MO who decides the catch-up (IMM-2.2).";else if(l.includes("vitamin a"))s=["IMM-2.4"],c="Vitamin A 2nd dose at 16-18 months, then every 6 months up to 5 years of age, 9 doses in all (IMM-2.4).";else if(l.includes("je")&&(l.includes("tika")||l.includes("vaccine")||l.includes("block")))s=["IMM-2.4"],c="No. Chandrapuri is not a JE-endemic district, so JE vaccine is not given here (IMM-2.4).";else if(l.includes("bcg")&&(l.includes("mahine")||l.includes("chhoot")))s=["IMM-2.1"],c="BCG can be given at birth or as early as possible till one year of age (IMM-2.1).";else if(l.includes("tika kab overdue")||l.includes("overdue")&&l.includes("tika"))s=["VIS-1.3"],c="A vaccine becomes overdue when more than 28 days have passed since its due date (grace_days = 28 days) (VIS-1.3).";else if(l.includes("maa se")&&l.includes("visit"))s=["HBNC-3.1"],c="At every HBNC visit check the mother: bleeding, fever, foul discharge, breastfeeding, and BP (HBNC-3.1).";else if(x)h="seasonal",y=x.id,s=[x.id],g==="te"?c=x.summaryTe:g==="hi"?c=x.summaryHi:c=x.summaryEn;else{const o=t&&typeof t.search=="function"?t.search(d,2):[];if(!o||o.length===0||o[0].score<.1){h="fallback",y="SCP-1.2",s=["SCP-1.2","IDSP-SURV"],g==="te"?c="క్లినికల్ మార్గదర్శకత్వం & ట్రయేజ్ చెక్‌లిస్ట్: 1. తక్షణ ప్రమాద సంకేతాలను తనిఖీ చేయండి: 3 రోజుల కంటే ఎక్కువ అధిక జ్వరం, మెడ బిగుతు, మగత/స్పృహ కోల్పోవడం, తీవ్రమైన ఆయాసం, ద్రవాలు తాగలేకపోవడం లేదా రక్తస్రావం. ఏవైనా ఉంటే వెంటనే 108 కి కాల్ చేసి ఆసుపత్రికి పంపండి. 2. ద్రవాలు (ORS, కొబ్బరి నీళ్ళు) పుష్కలంగా ఇవ్వండి. 3. ఖచ్చితమైన నిర్ధారణ మరియు మందుల కోసం PHC లోని వైద్యాధికారి (MO) లేదా ANM ని సంప్రదించండి (SCP-1.2).":g==="hi"?c="नैदानिक दिशानिर्देश एवं खतरे के लक्षण जांच सूची: 1. तुरंत खतरे के लक्षण देखें: 3 दिन से अधिक तेज बुखार, गर्दन में अकड़न, बेहोशी/सुस्ती, तेज सांस, उल्टी के कारण कुछ न पचना, या रक्तस्राव। कोई भी लक्षण होने पर 108 पर कॉल कर तुरंत अस्पताल भेजें। 2. पर्याप्त तरल पदार्थ (ORS, उबला पानी) दें और आराम कराएं। 3. सही जांच और दवा के लिए प्राथमिक स्वास्थ्य केंद्र (PHC) के चिकित्सा अधिकारी (MO) या ANM से परामर्श लें (SCP-1.2)।":c="Frontline Clinical Guidance & Triage Checklist: 1. Assess emergency danger signs: high fever >3 days, stiff neck, altered sensorium, fast/difficult breathing, inability to retain oral fluids, or bleeding. If any danger sign is present, call 108 / refer immediately. 2. Provide supportive oral hydration (ORS/fluids) and rest. 3. Refer to Medical Officer (MO) or ANM at the Sub-Centre / PHC for clinical diagnosis and prescription (SCP-1.2).";try{if(typeof localStorage<"u"){const u=JSON.parse(localStorage.getItem("swasthyavani_unanswered_queries")||"[]");u.push({query:d,timestamp:new Date().toISOString()}),localStorage.setItem("swasthyavani_unanswered_queries",JSON.stringify(u.slice(-100)))}}catch{}}else{s=o.map(T=>T.secId),y=s[0];const u=e&&e[y],f=u?u.clean_text:"Please check the protocol book and consult the ANM.";c=he(`${f.slice(0,340)} (${y}).`,n)}}}const b=Math.round((performance.now()-r)*100)/100;return{answerText:c,citedSectionIds:s.slice(0,2),escalate:!!m,refused:!!p,type:h,secId:y,latencyMs:b}}class Le{constructor(){this.synth=typeof window<"u"?window.speechSynthesis:null,this.voices=[],this.currentChunks=[],this.currentChunkIndex=0,this.activeLang="en-IN",this.activeVoice=null,this.onStatusChange=null,this.isPausedState=!1,this.synth&&(this.loadVoices(),typeof this.synth.onvoiceschanged<"u"&&(this.synth.onvoiceschanged=()=>this.loadVoices()))}loadVoices(){return this.synth?(this.voices=this.synth.getVoices()||[],this.voices):[]}getLangCode(t){return t==="te"?"te-IN":t==="hi"?"hi-IN":"en-IN"}findBestVoice(t){(!this.voices||this.voices.length===0)&&this.loadVoices();const e=t.slice(0,2).toLowerCase();let n=this.voices.find(a=>a.lang&&a.lang.replace("_","-").toLowerCase()===t.toLowerCase());return n||(n=this.voices.find(a=>a.lang&&a.lang.toLowerCase().startsWith(e)),n)?n:null}chunkText(t){if(!t)return[];const e=t.split(/(?<=[.?!।;\n])\s+/).map(r=>r.trim()).filter(r=>r.length>0),n=[];let a="";for(const r of e)(a+" "+r).length>180?(a&&n.push(a),a=r):a=a?a+" "+r:r;return a&&n.push(a),n.length>0?n:[t]}speak(t,e,n=null){return this.synth?(this.stop(),this.onStatusChange=n,this.activeLang=this.getLangCode(e),this.activeVoice=this.findBestVoice(this.activeLang),(e==="te"||e==="hi")&&!this.activeVoice&&console.warn(`[SpeechManager] No specific voice found for ${this.activeLang}. Trying device default.`),this.currentChunks=this.chunkText(t),this.currentChunkIndex=0,this.isPausedState=!1,this.currentChunks.length===0?{success:!1,reason:"empty_text"}:(this.speakNextChunk(),{success:!0})):{success:!1,reason:"speech_not_supported"}}speakNextChunk(){if(this.currentChunkIndex>=this.currentChunks.length){this.stop();return}const t=this.currentChunks[this.currentChunkIndex],e=new SpeechSynthesisUtterance(t);e.lang=this.activeLang,this.activeVoice&&(e.voice=this.activeVoice),e.rate=.92,e.onstart=()=>{this.onStatusChange&&this.onStatusChange("speaking")},e.onend=()=>{this.currentChunkIndex++,this.speakNextChunk()},e.onerror=n=>{console.warn("[SpeechManager] Utterance error:",n),this.currentChunkIndex++,this.currentChunkIndex<this.currentChunks.length?this.speakNextChunk():this.stop()},this.synth.speak(e)}pause(){this.synth&&this.synth.speaking&&!this.synth.paused&&(this.synth.pause(),this.isPausedState=!0,this.onStatusChange&&this.onStatusChange("paused"))}resume(){this.synth&&this.synth.paused&&(this.synth.resume(),this.isPausedState=!1,this.onStatusChange&&this.onStatusChange("speaking"))}stop(){this.synth&&(this.synth.cancel(),this.currentChunks=[],this.currentChunkIndex=0,this.isPausedState=!1,this.onStatusChange&&(this.onStatusChange("stopped"),this.onStatusChange=null))}isSpeaking(){return!!(this.synth&&this.synth.speaking&&!this.synth.paused)}isPaused(){return!!(this.synth&&this.synth.paused)}}const G=new Le;function Me(i,t){const e=i.translations,n=i.lang||"en",a=document.createElement("div");a.className="view-container ask-view";let r="all";function d(o){return n==="te"?o.qTe||o.qEn:n==="hi"&&o.qHi||o.qEn}function l(o){return n==="te"?o.labelTe||o.labelEn:n==="hi"&&o.labelHi||o.labelEn}const g={all:n==="te"?"అన్నీ":n==="hi"?"सभी":"All Topics",anc:n==="te"?"గర్భధారణ (ANC)":n==="hi"?"गर्भावस्था (ANC)":"Maternal & ANC",hbnc:n==="te"?"నవజాత శిశువు (HBNC)":n==="hi"?"नवजात शिशु (HBNC)":"Newborn & HBNC",chd:n==="te"?"పిల్లల అనారోగ్యాలు":n==="hi"?"बाल रोग (CHD)":"Child Health (CHD)",nut:n==="te"?"పోషకాహారం & SAM":n==="hi"?"पोषण एवं कुपोषण":"Nutrition & SAM",imm:n==="te"?"టీకాలు (IMM)":n==="hi"?"टीकाकरण (IMM)":"Immunization",ncd:n==="te"?"బీపీ & షుగర్ (NCD)":n==="hi"?"बीपी एवं शुगर (NCD)":"Chronic & NCD",esc:n==="te"?"అత్యవసర ప్రమాదాలు":n==="hi"?"आपातकालीन खतरे":"Emergency Danger Signs",seasonal:n==="te"?"కాలానుగుణ వ్యాధులు":n==="hi"?"मौसमी रोग":"Seasonal & Vector",refusal:n==="te"?"పరిధి పరిమితులు":n==="hi"?"दवा सीमाएं":"Scope Refusals"};a.innerHTML=`
    <div class="card intro-card">
      <h2 class="section-title">${e.ask.title}</h2>
      <p class="section-sub">${e.ask.subtitle}</p>

      <form id="ask-form" class="query-form">
        <div class="input-wrapper">
          <textarea
            id="query-input"
            class="query-input"
            rows="3"
            placeholder="${e.ask.placeholder}"
            required
          >${i.lastQuery||""}</textarea>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" id="btn-search">
            ${e.ask.btnSubmit}
          </button>
          <button type="button" class="btn btn-secondary" id="btn-voice">
            ${e.ask.btnVoice}
          </button>
        </div>
        <div id="voice-status-msg" style="display:none;margin-top:8px;padding:8px 12px;border-radius:8px;font-size:0.85rem;background:#fef3c7;color:#92400e;border:1px solid #fde68a;"></div>
      </form>

      <!-- Topic Filter Tabs for Suggestion Chips -->
      <div class="samples-wrapper">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
          <span class="samples-label" style="font-weight:700;">${e.ask.recentQueries} (${se.length}):</span>
          <div class="topic-tabs-bar" style="display:flex;gap:4px;flex-wrap:wrap;">
            ${["all","anc","hbnc","chd","nut","imm","ncd","esc","seasonal","refusal"].map(o=>`
              <button type="button" class="btn btn-sm btn-topic ${r===o?"btn-primary":"btn-secondary"}" data-topic="${o}" style="padding:2px 8px;font-size:0.75rem;">
                ${g[o]}
              </button>
            `).join("")}
          </div>
        </div>

        <div id="chips-container" class="samples-chips">
          <!-- Rendered dynamically -->
        </div>
      </div>
    </div>

    <div id="result-area" class="result-area"></div>
  `;const k=a.querySelector("#ask-form"),m=a.querySelector("#query-input"),p=a.querySelector("#result-area"),c=a.querySelector("#btn-voice"),s=a.querySelector("#chips-container");function h(){const o=r==="all"?se:se.filter(u=>u.topic===r);s.innerHTML=o.map(u=>`
        <button
          type="button"
          class="sample-chip"
          data-query="${W(d(u))}"
          title="${W(d(u))}"
        >
          ${W(l(u))}
        </button>
      `).join(""),s.querySelectorAll(".sample-chip").forEach(u=>{u.addEventListener("click",f=>{const T=f.currentTarget.getAttribute("data-query");T&&(m.value=T,y(T))})})}a.querySelectorAll(".btn-topic").forEach(o=>{o.addEventListener("click",u=>{r=u.currentTarget.getAttribute("data-topic"),a.querySelectorAll(".btn-topic").forEach(f=>{f.classList.remove("btn-primary"),f.classList.add("btn-secondary")}),u.currentTarget.classList.remove("btn-secondary"),u.currentTarget.classList.add("btn-primary"),h()})}),h();function y(o){if(!o||!o.trim())return;const u=ye(o,i.bm25,i.sections,400,{lang:i.lang,seasonalPack:i.seasonalPack});i.lastQuery=o,i.lastResult=u,be(u,p,e,i)}k.addEventListener("submit",o=>{o.preventDefault(),y(m.value)});const b=a.querySelector("#voice-status-msg");function x(){navigator.onLine?(c.classList.remove("voice-offline"),c.title=e.ask.btnVoice):(c.classList.add("voice-offline"),c.title=e.ask.voiceOfflineMsg)}if(window.addEventListener("online",x),window.addEventListener("offline",x),x(),typeof window<"u"&&("webkitSpeechRecognition"in window||"SpeechRecognition"in window)){const o=window.SpeechRecognition||window.webkitSpeechRecognition,u=new o;u.continuous=!1,u.interimResults=!1,u.lang=i.lang==="te"?"te-IN":i.lang==="hi"?"hi-IN":"en-IN",c.addEventListener("click",()=>{if(!navigator.onLine){b&&(b.textContent=e.ask.voiceOfflineMsg,b.style.display="block",setTimeout(()=>{b.style.display="none"},6e3));return}c.classList.add("recording"),c.textContent=e.ask.listening,b&&(b.style.display="none");try{u.start()}catch{c.classList.remove("recording"),c.textContent=e.ask.btnVoice}}),u.onresult=f=>{const T=f.results[0][0].transcript;m.value=T,c.classList.remove("recording"),c.textContent=e.ask.btnVoice,b&&(b.style.display="none"),y(T)},u.onerror=f=>{c.classList.remove("recording"),c.textContent=e.ask.btnVoice,b&&(f&&f.error==="network"?b.textContent=e.ask.voiceOfflineMsg:f&&f.error==="not-allowed"?b.textContent=e.ask.voicePermissionDenied:b.textContent=e.ask.voiceNetError,b.style.display="block",setTimeout(()=>{b.style.display="none"},5e3))},u.onend=()=>{c.classList.remove("recording"),c.textContent=e.ask.btnVoice}}else c.addEventListener("click",()=>{b&&(b.textContent=e.card.voiceUnavailable,b.style.display="block")});return i.lastResult&&be(i.lastResult,p,e,i),a}function be(i,t,e,n){t.innerHTML="";const a=document.createElement("div");let r="";i.type==="escalate"?r=`${e.card.escalateTitle}. ${i.answerText}. ${e.card.escalateAction}`:i.type==="refuse"?r=`${e.card.refusalTitle}. ${i.answerText}. ${e.card.refusalAction}`:i.type==="seasonal"?r=`${e.card.seasonalTitle}. ${i.answerText}`:i.type==="fallback"?r=`${e.card.fallbackTitle}. ${i.answerText}`:r=`${e.card.answerTitle}. ${i.answerText}`,i.type==="escalate"?(a.className="result-card card-answer",a.innerHTML=`
      <div class="card-badge answer-badge">
        ${W(e.card.escalateTitle)}
      </div>
      <div class="card-content">
        <p class="answer-main">${W(i.answerText)}</p>
        <p class="escalate-instruction" style="margin-top:10px;font-weight:600;color:var(--color-text);">
          ${W(e.card.escalateAction)}
        </p>
        <div class="tts-player-bar" style="margin: 12px 0;">
          <button type="button" class="btn btn-sm btn-tts btn-speak">
            ${e.card.btnListen}
          </button>
          <button type="button" class="btn btn-sm btn-secondary btn-pause" style="display:none;">
            ${e.card.btnPause}
          </button>
          <button type="button" class="btn btn-sm btn-secondary btn-stop" style="display:none;">
            ${e.card.btnStop}
          </button>
        </div>
      </div>
      <div class="card-footer">
        <div class="citation-chip">
          <span class="citation-label">${e.card.citation}:</span>
          <strong>${i.citedSectionIds.join(", ")}</strong>
        </div>
        <span class="latency-chip">${e.card.latency}: ${i.latencyMs} ms</span>
      </div>
    `):i.type==="refuse"?(a.className="result-card card-refuse",a.innerHTML=`
      <div class="card-badge refuse-badge">
        ${e.card.refusalTitle}
      </div>
      <div class="card-content">
        <p class="answer-main">${W(i.answerText)}</p>
        <div class="tts-player-bar" style="margin: 12px 0;">
          <button type="button" class="btn btn-sm btn-tts btn-speak">
            ${e.card.btnListen}
          </button>
          <button type="button" class="btn btn-sm btn-secondary btn-pause" style="display:none;">
            ${e.card.btnPause}
          </button>
          <button type="button" class="btn btn-sm btn-secondary btn-stop" style="display:none;">
            ${e.card.btnStop}
          </button>
        </div>
        <p class="refuse-notice">${e.card.refusalAction}</p>
      </div>
      <div class="card-footer">
        <div class="citation-chip">
          <span class="citation-label">${e.card.citation}:</span>
          <strong>${i.citedSectionIds.join(", ")}</strong>
        </div>
        <span class="latency-chip">${e.card.latency}: ${i.latencyMs} ms</span>
      </div>
    `):i.type==="seasonal"?(a.className="result-card card-answer",a.innerHTML=`
      <div class="card-badge answer-badge">
        ${e.card.seasonalTitle}
      </div>
      <div class="card-content">
        <p class="answer-main">${W(i.answerText)}</p>
        <div class="tts-player-bar" style="margin: 12px 0;">
          <button type="button" class="btn btn-sm btn-tts btn-speak">
            ${e.card.btnListen}
          </button>
          <button type="button" class="btn btn-sm btn-secondary btn-pause" style="display:none;">
            ${e.card.btnPause}
          </button>
          <button type="button" class="btn btn-sm btn-secondary btn-stop" style="display:none;">
            ${e.card.btnStop}
          </button>
        </div>
      </div>
      <div class="card-footer">
        <div class="citation-chip">
          <span class="citation-label">${e.card.citation}:</span>
          <strong>${i.citedSectionIds.join(", ")}</strong>
        </div>
        <span class="latency-chip">${e.card.latency}: ${i.latencyMs} ms</span>
      </div>
    `):(a.className="result-card card-answer",a.innerHTML=`
      <div class="card-badge answer-badge">
        ${e.card.answerTitle}
      </div>
      <div class="card-content">
        <p class="answer-main">${W(i.answerText)}</p>
        <div class="tts-player-bar" style="margin: 12px 0;">
          <button type="button" class="btn btn-sm btn-tts btn-speak">
            ${e.card.btnListen}
          </button>
          <button type="button" class="btn btn-sm btn-secondary btn-pause" style="display:none;">
            ${e.card.btnPause}
          </button>
          <button type="button" class="btn btn-sm btn-secondary btn-stop" style="display:none;">
            ${e.card.btnStop}
          </button>
        </div>
      </div>
      <div class="card-footer">
        <div class="citation-chip">
          <span class="citation-label">${e.card.citation}:</span>
          <strong>${i.citedSectionIds.join(", ")}</strong>
        </div>
        <span class="latency-chip">${e.card.latency}: ${i.latencyMs} ms</span>
      </div>
    `);const d=a.querySelector(".btn-speak"),l=a.querySelector(".btn-pause"),g=a.querySelector(".btn-stop");function k(m){m==="speaking"?(d.textContent=e.card.playing||"Playing...",l.style.display="inline-block",g.style.display="inline-block"):m==="paused"?(d.textContent=e.card.btnResume||"Resume",l.style.display="none",g.style.display="inline-block"):(d.textContent=e.card.btnListen,l.style.display="none",g.style.display="none")}d.addEventListener("click",()=>{if(G.isPaused())G.resume(),k("speaking");else{const m=n&&n.lang?n.lang:"en";G.speak(r,m,p=>k(p))}}),l.addEventListener("click",()=>{G.pause(),k("paused")}),g.addEventListener("click",()=>{G.stop(),k("stopped")}),t.appendChild(a)}function W(i){return i?String(i).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}function Pe(i,t={}){if(!Array.isArray(i))return[];const{districts:e=[],villages:n=[],category:a="",searchQuery:r=""}=t,d=(Array.isArray(e)?e:[e]).map(m=>String(m||"").toLowerCase().trim()).filter(m=>!!m&&m!=="all"),l=(Array.isArray(n)?n:[n]).map(m=>String(m||"").toLowerCase().trim()).filter(m=>!!m&&m!=="all"),g=String(a||"").toLowerCase().trim(),k=String(r||"").toLowerCase().trim();return i.filter(m=>{if(d.length>0){const p=String(m.district||"").toLowerCase().trim();if(!d.includes(p))return!1}if(l.length>0){const p=String(m.village||"").toLowerCase().trim();if(!l.includes(p))return!1}if(g&&g!=="all"){const p=String(m.clinical_category||"").toLowerCase().trim(),c=!!m.is_high_risk;if(g==="high_risk"){if(!c&&p!=="high_risk")return!1}else if(p!==g)return!1}if(k){const p=String(m.member_id||"").toLowerCase(),c=String(m.household_id||"").toLowerCase(),s=String(m.name||"").toLowerCase(),h=String(m.village||"").toLowerCase(),y=String(m.district||"").toLowerCase(),b=String(m.house_no||"").toLowerCase();if(!(p.includes(k)||c.includes(k)||s.includes(k)||h.includes(k)||y.includes(k)||b.includes(k)))return!1}return!0})}function De(i=[],t=[]){if(!Array.isArray(i))return{districts:[],villages:[],categories:[]};const e=new Set,n=new Set(["anc","hbnc","imm","nut","ncd","high_risk"]);i.forEach(d=>{d.district&&e.add(String(d.district).toLowerCase().trim())});const a=(Array.isArray(t)?t:[t]).map(d=>String(d||"").toLowerCase().trim()).filter(d=>!!d&&d!=="all"),r=new Set;return i.forEach(d=>{const l=String(d.district||"").toLowerCase().trim();(a.length===0||a.includes(l))&&d.village&&r.add(String(d.village).trim())}),{districts:Array.from(e).sort(),villages:Array.from(r).sort(),categories:Array.from(n)}}const qe=[{asha_id:"ASHA-096P",asha_name:"Sunaina Devi",villages:["Amrapur"]},{asha_id:"ASHA-RRR5",asha_name:"Kalavati Kumari",villages:["Belwadi Tola"]},{asha_id:"ASHA-YFK5",asha_name:"Rinku Devi",villages:["Kesarganj"]},{asha_id:"ASHA-L9R8",asha_name:"Shabnam Khatoon",villages:["Dhanpura"]},{asha_id:"ASHA-KQXR",asha_name:"Malti Devi",villages:["Navagaon Khurd","Sitapahari"]}],Re=["Amrapur","Belwadi Tola","Dhanpura","Kesarganj","Navagaon Khurd","Sitapahari"],Ie={Amrapur:{asha_id:"ASHA-096P",asha_name:"Sunaina Devi"},"Belwadi Tola":{asha_id:"ASHA-RRR5",asha_name:"Kalavati Kumari"},Dhanpura:{asha_id:"ASHA-L9R8",asha_name:"Shabnam Khatoon"},Kesarganj:{asha_id:"ASHA-YFK5",asha_name:"Rinku Devi"},"Navagaon Khurd":{asha_id:"ASHA-KQXR",asha_name:"Malti Devi"},Sitapahari:{asha_id:"ASHA-KQXR",asha_name:"Malti Devi"}},ae={ashas:qe,villages:Re,village_to_asha:Ie},oe="swasthyavani_sync_queue_v1";class Ve{constructor(){this.queue=this._load()}_load(){try{if(typeof localStorage>"u")return[];const t=localStorage.getItem(oe);return t?JSON.parse(t):[]}catch{return[]}}_save(){try{if(typeof localStorage>"u")return;localStorage.setItem(oe,JSON.stringify(this.queue))}catch{}}enqueue(t,e=null){let n;return typeof t=="string"&&e?n={id:`SYNC-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,timestamp:new Date().toISOString(),type:t,payload:e,synced:!1}:n={id:`NOTE-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,timestamp:new Date().toISOString(),memberId:t.memberId,dueItem:t.dueItem,notes:t.notes,synced:!1},this.queue.push(n),this._save(),n}getItems(){return this.queue}getPending(){return this.queue.filter(t=>!t.synced)}getPendingCount(){return this.queue.filter(t=>!t.synced).length}flush(){for(const t of this.queue)t.synced=!0;return this._save(),this.queue.length}clear(){this.queue=[];try{typeof localStorage<"u"&&localStorage.removeItem(oe)}catch{}}}const le=new Ve;function Be(i,t){const e=i.translations,n=document.createElement("div");n.className="view-container registration-view";const a=["chandrapuri","kakinada","east_godavari","visakhapatnam","guntur","chittoor","kurnool"],r={chandrapuri:ae.villages,kakinada:["Sarpavaram","Peddapuram Rural","Thimmapuram"],east_godavari:["Rajahmundry Rural","Kadiyam","Dowleswaram"],visakhapatnam:["Bheemunipatnam","Anandapuram","Padmanabham"],guntur:["Mangalagiri Rural","Tadikonda","Tenali West"],chittoor:["Chandragiri","Palamaner","Kuppam Rural"],kurnool:["Nandyal Rural","Alur","Dhone"]},d={chandrapuri:ae.ashas.map(p=>`${p.asha_id} (${p.asha_name})`),kakinada:["ASHA-KKD01 (Sita Devi)","ASHA-KKD02 (Padma V)"],east_godavari:["ASHA-EGD01 (Lakshmi K)","ASHA-EGD02 (Parvati R)"],visakhapatnam:["ASHA-VSP01 (Anuradha B)","ASHA-VSP02 (Sandhya M)"],guntur:["ASHA-GNT01 (Sujatha T)","ASHA-GNT02 (Radha P)"],chittoor:["ASHA-CTR01 (Kavitha M)","ASHA-CTR02 (Lavanya S)"],kurnool:["ASHA-KNL01 (Bharathi N)","ASHA-KNL02 (Renuka D)"]};let l="chandrapuri";function g(p){const c=p.toLowerCase().replace(/ /g,"_");return e.village&&e.village[c]||p}function k(p){return e.district&&e.district[p]||p}function m(){const p=r[l]||[],c=d[l]||[];n.innerHTML=`
      <div class="card registration-card">
        <div class="reg-header-row">
          <div>
            <h2 class="section-title">${e.registration.title}</h2>
            <p class="section-sub">${e.registration.subtitle}</p>
          </div>
          <span class="simulated-badge">${e.registration.badgeSimulated}</span>
        </div>

        <div id="reg-alert" class="reg-alert" style="display:none;"></div>

        <form id="reg-form" class="reg-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="reg-name" class="form-label">${e.registration.nameLabel} *</label>
              <input type="text" id="reg-name" class="form-input" placeholder="${e.registration.namePlaceholder}" required minlength="2" maxlength="60" />
            </div>

            <div class="form-group">
              <label for="reg-age" class="form-label">${e.registration.ageLabel} *</label>
              <input type="number" id="reg-age" class="form-input" placeholder="${e.registration.agePlaceholder}" required min="0" max="115" />
            </div>

            <div class="form-group">
              <label for="reg-gender" class="form-label">${e.registration.genderLabel} *</label>
              <select id="reg-gender" class="form-select">
                <option value="F">${e.registration.female}</option>
                <option value="M">${e.registration.male}</option>
              </select>
            </div>

            <div class="form-group">
              <label for="reg-district" class="form-label">${e.registration.districtLabel} *</label>
              <select id="reg-district" class="form-select">
                ${a.map(f=>`<option value="${f}" ${f===l?"selected":""}>${k(f)}</option>`).join("")}
              </select>
            </div>

            <div class="form-group">
              <label for="reg-village" class="form-label">${e.registration.villageLabel} *</label>
              <select id="reg-village" class="form-select">
                ${p.map(f=>`<option value="${f}">${g(f)}</option>`).join("")}
              </select>
            </div>

            <div class="form-group">
              <label for="reg-asha" class="form-label">${e.registration.ashaLabel} *</label>
              <select id="reg-asha" class="form-select">
                ${c.map(f=>`<option value="${f}">${f}</option>`).join("")}
              </select>
            </div>

            <div class="form-group">
              <label for="reg-category" class="form-label">${e.registration.categoryLabel} *</label>
              <select id="reg-category" class="form-select">
                <option value="anc">${e.categories.anc}</option>
                <option value="hbnc">${e.categories.hbnc}</option>
                <option value="imm">${e.categories.imm}</option>
                <option value="nut">${e.categories.nut}</option>
                <option value="ncd">${e.categories.ncd}</option>
                <option value="high_risk">${e.categories.high_risk}</option>
                <option value="general">${e.categories.general}</option>
              </select>
            </div>

            <div class="form-group" id="group-lmp">
              <label for="reg-lmp" class="form-label">${e.registration.lmpLabel}</label>
              <input type="date" id="reg-lmp" class="form-input" />
            </div>

            <div class="form-group" id="group-dob">
              <label for="reg-dob" class="form-label">${e.registration.dobLabel}</label>
              <input type="date" id="reg-dob" class="form-input" />
            </div>
          </div>

          <div class="form-group" style="margin-top:12px;">
            <label for="reg-notes" class="form-label">${e.registration.notesLabel}</label>
            <textarea id="reg-notes" class="form-input" rows="3" placeholder="${e.registration.notesPlaceholder}"></textarea>
          </div>

          <div class="form-actions" style="margin-top:16px; display:flex; gap:10px;">
            <button type="submit" class="btn btn-primary" id="btn-save-beneficiary">
              ${e.registration.btnSubmit}
            </button>
          </div>
        </form>
      </div>
    `;const s=n.querySelector("#reg-district"),h=n.querySelector("#reg-village"),y=n.querySelector("#reg-asha"),b=n.querySelector("#reg-category"),x=n.querySelector("#reg-form"),o=n.querySelector("#reg-alert");function u(f){if(l==="chandrapuri"&&ae.village_to_asha[f]){const T=ae.village_to_asha[f];Array.from(y.options).forEach(v=>{v.value.includes(T.asha_id)&&(v.selected=!0)})}}p.length>0&&u(p[0]),s.addEventListener("change",f=>{l=f.target.value;const T=r[l]||[];h.innerHTML=T.map(C=>`<option value="${C}">${g(C)}</option>`).join("");const v=d[l]||[];y.innerHTML=v.map(C=>`<option value="${C}">${C}</option>`).join(""),T.length>0&&u(T[0])}),h.addEventListener("change",f=>{u(f.target.value)}),b.addEventListener("change",f=>{const T=f.target.value,v=n.querySelector("#group-lmp"),C=n.querySelector("#group-dob");T==="anc"?(v.style.display="block",C.style.display="none"):T==="hbnc"||T==="imm"||T==="nut"?(v.style.display="none",C.style.display="block"):(v.style.display="none",C.style.display="none")}),x.addEventListener("submit",f=>{f.preventDefault();const T=n.querySelector("#reg-name").value.trim(),v=parseInt(n.querySelector("#reg-age").value,10),C=n.querySelector("#reg-gender").value,_=n.querySelector("#reg-district").value,M=n.querySelector("#reg-village").value,I=n.querySelector("#reg-asha").value,O=n.querySelector("#reg-category").value,j=n.querySelector("#reg-lmp").value||null,w=n.querySelector("#reg-dob").value||null,R=n.querySelector("#reg-notes").value.trim();if(!T||isNaN(v)||v<0||v>115){o.className="reg-alert alert-error",o.textContent=e.registration.errorMsg,o.style.display="block";return}const S=Date.now().toString(36).toUpperCase()+Math.floor(100+Math.random()*900),H=`M-REG-${S}`,$=`HH-REG-${S}`,A=I.split(" ")[0]||(_==="chandrapuri"?"ASHA-096P":"ASHA-01"),N=I.match(/\((.*?)\)/),D=N?N[1]:I,E={member_id:H,household_id:$,name:T,age_years:v,sex:C,district:_,village:M,asha_id:A,asha_name:D,anm_name:_==="chandrapuri"?"ANM Nirmala (Chandrapuri Sub-Centre)":`ANM ${_.toUpperCase()} PHC`,house_no:`HN-REG-${S}`,clinical_category:O,is_high_risk:O==="high_risk",pregnant:O==="anc"?"Y":"N",lmp_date:j,dob:w||`${2026-v}-01-01`,last_recorded_vitals:"Baseline recorded at local registration",past_diseases:null,infection_history:null,fever_cold_history:null,allergies:null,immunisation_history:"up_to_date",due_reason:`Initial ${O.toUpperCase()} health assessment`,next_due_date:"2026-10-27",allowed_medication_dosage:"Consult Medical Officer at PHC. Frontline workers cannot prescribe.",medication_citation:"SEC-08-SCP-01",asha_visit_notes:R||"New registration queued locally.",is_synthetic:!0,is_synthetic_ui_record:!0},V=JSON.parse(localStorage.getItem("swasthyavani_custom_beneficiaries")||"[]");V.unshift(E),localStorage.setItem("swasthyavani_custom_beneficiaries",JSON.stringify(V)),le.enqueue("REGISTER_BENEFICIARY",E),o.className="reg-alert alert-success",o.innerHTML=`
        <strong>${e.registration.successMsg}</strong><br/>
        ID: <code>${H}</code> (${$})
      `,o.style.display="block",x.reset(),t&&setTimeout(()=>t(E),1500)})}return m(),n}function Oe(i,t){const e=i.translations,n=document.createElement("div");n.className="view-container register-view beneficiaries-view";const a={districts:[],villages:[],category:"",searchQuery:"",page:1,pageSize:15};let r="";const l=[...JSON.parse(localStorage.getItem("swasthyavani_custom_beneficiaries")||"[]"),...i.enrichedRegister||[]];function g(s,h){if(!h)return"";const y=String(h).toLowerCase().replace(/[\s-]+/g,"_");return e[s]&&e[s][y]?e[s][y]:h}function k(s,h){const y=g("categories",h?"high_risk":s);return`<span class="cat-chip ${h?"badge-danger":`badge-${s||"general"}`}">${P(y)}</span>`}function m(){const s=document.createElement("div");s.className="modal-overlay",s.setAttribute("role","dialog"),s.setAttribute("aria-modal","true"),s.setAttribute("aria-labelledby","modal-reg-title");const h=document.createElement("div");h.className="modal-dialog",h.style.maxWidth="680px";const y=document.createElement("div");y.className="modal-header",y.innerHTML=`
      <div>
        <h2 id="modal-reg-title" class="modal-title">${e.registration?e.registration.title:"Add new beneficiary"}</h2>
        <span class="patient-id-badge">${e.registration?e.registration.subtitle:"Register beneficiary locally"}</span>
      </div>
      <button type="button" class="modal-close-btn" aria-label="${e.profile?e.profile.close:"Close"}">×</button>
    `;const b=Be(i,x=>{l.unshift(x),a.page=1,r=`${e.registration?e.registration.successMsg:"Beneficiary registered successfully."} ID: ${x.member_id}`,s.remove(),p()});h.appendChild(y),h.appendChild(b),s.appendChild(h),document.body.appendChild(s),y.querySelector(".modal-close-btn").addEventListener("click",()=>s.remove()),s.addEventListener("click",x=>{x.target===s&&s.remove()})}function p(){n.innerHTML="";const s=De(l,a.districts),h=Pe(l,a),y=h.length,b=Math.ceil(y/a.pageSize)||1;a.page>b&&(a.page=1);const x=(a.page-1)*a.pageSize,o=h.slice(x,x+a.pageSize),u=document.createElement("div");u.className="card filter-card",u.innerHTML=`
      <div class="filter-header-row" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:12px;">
        <div>
          <h2 class="section-title" style="margin-bottom:4px;">${e.beneficiaries?e.beneficiaries.title:"Beneficiaries"}</h2>
          <p class="section-sub" style="margin-bottom:6px;">${e.beneficiaries?e.beneficiaries.subtitle:"View and add beneficiaries"}</p>
          <span class="results-badge">${e.filters.resultsCount.replace("{count}",y)}</span>
        </div>
        <button type="button" class="btn btn-primary" id="btn-open-register">
          ${e.registration?e.registration.title:"Add new beneficiary"}
        </button>
      </div>

      ${r?`<div class="alert alert-success" style="background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;padding:10px 14px;border-radius:8px;font-size:0.88rem;margin-bottom:12px;font-weight:600;">
              ${P(r)}
            </div>`:""}

      <div class="filter-controls-grid">
        <div class="filter-group">
          <label class="filter-label" for="filter-district">${e.filters.districtLabel}</label>
          <select id="filter-district" class="form-select">
            <option value="all">${e.filters.allDistricts}</option>
            ${s.districts.map(S=>`<option value="${S}" ${a.districts.includes(S)?"selected":""}>
                    ${P(g("district",S))}
                  </option>`).join("")}
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label" for="filter-village">${e.filters.villageLabel}</label>
          <select id="filter-village" class="form-select">
            <option value="all">${e.filters.allVillages}</option>
            ${s.villages.map(S=>`<option value="${S}" ${a.villages.includes(S)?"selected":""}>
                    ${P(g("village",S))}
                  </option>`).join("")}
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label" for="filter-category">${e.filters.categoryLabel}</label>
          <select id="filter-category" class="form-select">
            <option value="all">${e.filters.allCategories}</option>
            <option value="high_risk" title="${e.categories.high_riskTooltip}" ${a.category==="high_risk"?"selected":""}>${e.categories.high_risk}</option>
            <option value="anc" title="${e.categories.ancTooltip}" ${a.category==="anc"?"selected":""}>${e.categories.anc}</option>
            <option value="hbnc" title="${e.categories.hbncTooltip}" ${a.category==="hbnc"?"selected":""}>${e.categories.hbnc}</option>
            <option value="imm" title="${e.categories.immTooltip}" ${a.category==="imm"?"selected":""}>${e.categories.imm}</option>
            <option value="nut" title="${e.categories.nutTooltip}" ${a.category==="nut"?"selected":""}>${e.categories.nut}</option>
            <option value="ncd" title="${e.categories.ncdTooltip}" ${a.category==="ncd"?"selected":""}>${e.categories.ncd}</option>
          </select>
        </div>
      </div>

      <div class="search-row">
        <div class="search-input-wrapper">
          <input
            type="text"
            id="filter-search"
            class="form-input"
            placeholder="${e.filters.searchPlaceholder}"
            value="${P(a.searchQuery)}"
          />
        </div>
        <button type="button" id="btn-clear-filters" class="btn btn-secondary">
          ${e.filters.clearFilters}
        </button>
      </div>
    `;const f=document.createElement("div");f.className="beneficiary-list",o.length===0?f.innerHTML=`
        <div class="empty-state-card card">
          <p>${e.filters.emptyResults}</p>
        </div>
      `:o.forEach(S=>{const H=document.createElement("div");H.className=`beneficiary-card ${S.is_high_risk?"is-high-risk":""}`,H.setAttribute("tabindex","0"),H.setAttribute("role","button");const $=g("district",S.district),A=g("village",S.village),N=k(S.clinical_category,S.is_high_risk);H.innerHTML=`
          <div class="card-top-row">
            <div class="patient-primary-info">
              <h3 class="patient-name">${P(S.name||S.member_id)}</h3>
              <span class="patient-id-chip">${P(S.member_id)} (${P(S.household_id)})</span>
            </div>
            ${N}
          </div>
          <div class="patient-meta-grid">
            <div class="meta-item">
              <span class="meta-label">${e.profile.village}:</span>
              <strong>${P(A)}, ${P($)}</strong>
            </div>
            <div class="meta-item">
              <span class="meta-label">${e.profile.assignedAsha}:</span>
              <strong>${P(S.asha_name?S.asha_name+" ("+(S.asha_id||"ASHA-01")+")":S.asha_id||"ASHA-01")}</strong>
            </div>
            <div class="meta-item">
              <span class="meta-label">${e.profile.vitals}:</span>
              <span class="vitals-snippet">${P(S.last_recorded_vitals||"Stable")}</span>
            </div>
          </div>
          <div class="card-action-bar">
            <span class="view-details-hint">${e.profile.modalTitle}</span>
          </div>
        `,H.addEventListener("click",()=>c(S)),H.addEventListener("keydown",D=>{(D.key==="Enter"||D.key===" ")&&(D.preventDefault(),c(S))}),f.appendChild(H)});const T=document.createElement("div");T.className="pagination-row",T.innerHTML=`
      <button type="button" class="btn btn-sm btn-secondary" id="btn-prev-page" ${a.page<=1?"disabled":""}>
        ${e.pagination.prev}
      </button>
      <span class="page-indicator">${e.pagination.pageIndicator.replace("{current}",a.page).replace("{total}",b)}</span>
      <button type="button" class="btn btn-sm btn-secondary" id="btn-next-page" ${a.page>=b?"disabled":""}>
        ${e.pagination.next}
      </button>
    `,n.appendChild(u),n.appendChild(f),b>1&&n.appendChild(T);const v=u.querySelector("#filter-district"),C=u.querySelector("#filter-village"),_=u.querySelector("#filter-category"),M=u.querySelector("#filter-search"),I=u.querySelector("#btn-clear-filters"),O=u.querySelector("#btn-open-register");O&&O.addEventListener("click",()=>{m()}),v.addEventListener("change",S=>{const H=S.target.value;a.districts=!H||H==="all"?[]:[H],a.villages=[],a.page=1,p()}),C.addEventListener("change",S=>{const H=S.target.value;a.villages=!H||H==="all"?[]:[H],a.page=1,p()}),_.addEventListener("change",S=>{const H=S.target.value;a.category=!H||H==="all"?"":H,a.page=1,p()});let j;M.addEventListener("input",S=>{clearTimeout(j),j=setTimeout(()=>{a.searchQuery=S.target.value,a.page=1,p()},200)}),I.addEventListener("click",()=>{a.districts=[],a.villages=[],a.category="",a.searchQuery="",a.page=1,p()});const w=T.querySelector("#btn-prev-page"),R=T.querySelector("#btn-next-page");w&&w.addEventListener("click",()=>{a.page>1&&(a.page--,p(),n.scrollIntoView({behavior:"smooth"}))}),R&&R.addEventListener("click",()=>{a.page<b&&(a.page++,p(),n.scrollIntoView({behavior:"smooth"}))})}function c(s){const h=document.createElement("div");h.className="modal-overlay",h.setAttribute("role","dialog"),h.setAttribute("aria-modal","true"),h.setAttribute("aria-labelledby","modal-patient-title");const y=e.profile.notRecorded||"Not recorded",b=g("district",s.district),x=g("village",s.village),o=s.past_diseases?g("condition",s.past_diseases):y,u=s.infection_history?g("infection",s.infection_history):y,f=s.fever_cold_history?g("fever",s.fever_cold_history):y,T=s.allergies?g("allergy",s.allergies):y,v=s.immunisation_history?g("immunization",s.immunisation_history):y,C=s.last_recorded_vitals||y,M=[`${s.name||s.member_id}.`,`${e.profile.village}: ${x}, ${b}.`,s.is_high_risk?`${e.card.escalateTitle}.`:"",`${e.profile.currentVitals}: ${C}.`,s.past_diseases?`${e.profile.pastDiseases}: ${o}.`:"",`${e.profile.medicationSection}: ${s.allowed_medication_dosage||e.card.refusalAction}.`].filter(Boolean).join(" "),I=document.createElement("div");I.className="modal-dialog",I.innerHTML=`
      <div class="modal-header">
        <div>
          <h2 id="modal-patient-title" class="modal-title">${P(s.name||s.member_id)}</h2>
          <span class="patient-id-badge">${P(s.member_id)} | ${P(s.household_id)}</span>
        </div>
        <button type="button" class="modal-close-btn" aria-label="${e.profile.close}">×</button>
      </div>

      <div class="modal-body">
        <div class="tts-player-bar">
          <button type="button" id="btn-modal-speak" class="btn btn-primary btn-tts">
            ${e.profile.btnListen}
          </button>
          <button type="button" id="btn-modal-pause" class="btn btn-secondary" style="display:none;">
            ${e.profile.btnPause}
          </button>
          <button type="button" id="btn-modal-stop" class="btn btn-secondary" style="display:none;">
            ${e.profile.btnStop}
          </button>
        </div>

        <section class="modal-section">
          <h3 class="section-subtitle">${e.profile.demographics}</h3>
          <div class="details-grid">
            <div><span class="lbl">${e.profile.gender}:</span> <strong>${s.sex==="F"?e.profile.female:e.profile.male}</strong></div>
            <div><span class="lbl">${e.profile.houseNo}:</span> <strong>${P(s.house_no||"-")}</strong></div>
            <div><span class="lbl">${e.profile.village}:</span> <strong>${P(x)}</strong></div>
            <div><span class="lbl">${e.profile.district}:</span> <strong>${P(b)}</strong></div>
            <div><span class="lbl">${e.profile.assignedAsha}:</span> <strong>${P(s.asha_name?s.asha_name+" ("+(s.asha_id||"ASHA-01")+")":s.asha_id||"-")}</strong></div>
            <div><span class="lbl">${e.profile.assignedAnm}:</span> <strong>${P(s.anm_name||(s.district==="chandrapuri"?"ANM Nirmala (Chandrapuri Sub-Centre)":"-"))}</strong></div>
          </div>
        </section>

        <section class="modal-section">
          <h3 class="section-subtitle">${e.profile.currentVitals}</h3>
          <div class="vitals-highlight-box">
            <strong>${P(C)}</strong>
          </div>
        </section>

        <section class="modal-section">
          <h3 class="section-subtitle">${e.profile.pastHistory}</h3>
          <div class="history-grid">
            <div class="history-item">
              <span class="lbl">${e.profile.pastDiseases}:</span>
              <strong>${P(o)}</strong>
            </div>
            <div class="history-item">
              <span class="lbl">${e.profile.infectionHistory}:</span>
              <strong>${P(u)}</strong>
            </div>
            <div class="history-item">
              <span class="lbl">${e.profile.feverColdHistory}:</span>
              <strong>${P(f)}</strong>
            </div>
            <div class="history-item">
              <span class="lbl">${e.profile.allergies}:</span>
              <strong>${P(T)}</strong>
            </div>
            <div class="history-item">
              <span class="lbl">${e.profile.immunisationHistory}:</span>
              <strong>${P(v)}</strong>
            </div>
            <div class="history-item">
              <span class="lbl">${e.profile.whyOnList}:</span>
              <strong>${P(s.due_reason||"Routine Follow-up")}</strong>
            </div>
          </div>
        </section>

        <section class="modal-section medication-section">
          <h3 class="section-subtitle">${e.profile.medicationSection}</h3>
          <div class="guideline-card">
            <p class="guideline-text">${P(s.allowed_medication_dosage||e.card.refusalAction)}</p>
            <div class="citation-chip">
              <span class="citation-label">${e.profile.citationLabel}:</span>
              <strong>${P(s.medication_citation||"SEC-01-ANC-03")}</strong>
            </div>
          </div>
        </section>

        <section class="modal-section">
          <h3 class="section-subtitle">${e.profile.pastNotes}</h3>
          <p class="visit-notes-text">${P(s.asha_visit_notes||"Regular health monitoring visit completed.")}</p>
        </section>

        <p class="synthetic-notice">${e.profile.syntheticDisclaimer}</p>
      </div>
    `,h.appendChild(I),document.body.appendChild(h);const O=I.querySelector("#btn-modal-speak"),j=I.querySelector("#btn-modal-pause"),w=I.querySelector("#btn-modal-stop");function R(E){E==="speaking"?(O.textContent=e.card.playing||"Playing...",j.style.display="inline-block",w.style.display="inline-block"):E==="paused"?(O.textContent=e.card.btnResume||"Resume",j.style.display="none",w.style.display="inline-block"):(O.textContent=e.profile.btnListen,j.style.display="none",w.style.display="none")}O.addEventListener("click",()=>{if(G.isPaused())G.resume();else{const E=G.speak(M,i.lang,V=>R(V));!E.success&&E.reason==="voice_unavailable"&&alert(e.card.voiceUnavailable)}}),j.addEventListener("click",()=>G.pause()),w.addEventListener("click",()=>G.stop());function S(){G.stop(),h.remove(),document.removeEventListener("keydown",D)}const H=I.querySelector(".modal-close-btn");H.addEventListener("click",S),h.addEventListener("click",E=>{E.target===h&&S()});const $=I.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),A=$[0],N=$[$.length-1];function D(E){E.key==="Escape"?S():E.key==="Tab"&&$.length>0&&(E.shiftKey?document.activeElement===A&&(E.preventDefault(),N.focus()):document.activeElement===N&&(E.preventDefault(),A.focus()))}document.addEventListener("keydown",D),H&&H.focus()}return p(),n}function P(i){return i?String(i).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}const J={"ANC-1":{title:"First Antenatal Care Visit (ANC 1)",protocol:"01_ANC",citation:"SEC-01-ANC-01",description:"Registration, complete medical history, baseline BP, Hb screening, urine test for albumin, and first dose of Tetanus Toxoid (TT/Td)."},"ANC-2":{title:"Second Antenatal Care Visit (ANC 2)",protocol:"01_ANC",citation:"SEC-01-ANC-02",description:"Gestational age assessment (14-26 weeks), BP check, abdominal palpation, Hb check, and start Iron Folic Acid (IFA) supplementation."},"ANC-3":{title:"Third Antenatal Care Visit (ANC 3)",protocol:"01_ANC",citation:"SEC-01-ANC-03",description:"Third-trimester check (28-34 weeks), fetal growth, fetal heart sounds, check for swelling/edema, maternal BP, second dose TT/Td booster."},"ANC-4":{title:"Fourth Antenatal Care Visit (ANC 4)",protocol:"01_ANC",citation:"SEC-01-ANC-04",description:"Pre-delivery check (36 weeks to term), birth preparedness, institutional delivery plan, identification of high-risk signs."},"HRP-followup":{title:"High-Risk Pregnancy (HRP) Follow-up",protocol:"01_ANC / 03_ESC",citation:"SEC-03-ESC-01",description:"Close monitoring for severe anemia (Hb < 7 g/dL), pre-eclampsia (BP >= 140/90), gestational diabetes, or previous obstetric complications. Facilitate Medical Officer consultation."},"HBNC-1":{title:"HBNC Day 1 Home Visit",protocol:"02_HBNC",citation:"SEC-02-HBNC-01",description:"Within 24 hours of home birth (or first day after institutional discharge): ensure skin-to-skin contact, check temperature, cord hygiene, and exclusive breastfeeding."},"HBNC-2":{title:"HBNC Day 3 Home Visit",protocol:"02_HBNC",citation:"SEC-02-HBNC-02",description:"Check for neonatal jaundice, umbilical infection, adequate sucking, weight loss monitoring, and maternal health."},"HBNC-3":{title:"HBNC Day 7 Home Visit",protocol:"02_HBNC",citation:"SEC-02-HBNC-03",description:"Inspect cord stump, evaluate baby activity and thermal regulation, assess maternal postpartum recovery and lactation support."},"HBNC-4":{title:"HBNC Day 14 Home Visit",protocol:"02_HBNC",citation:"SEC-02-HBNC-04",description:"Confirm cord stump has separated cleanly, monitor infant weight gain (>= 20-30 g/day), reinforce danger sign recognition."},"HBNC-5":{title:"HBNC Day 21 Home Visit",protocol:"02_HBNC",citation:"SEC-02-HBNC-05",description:"Growth monitoring, maternal mental health and postpartum recovery assessment, check for skin rashes, eye infections, or lethargy."},"HBNC-6":{title:"HBNC Day 28 Home Visit",protocol:"02_HBNC",citation:"SEC-02-HBNC-06",description:"Fourth week newborn milestone review, prepare family for 6-week immunization schedule, check nutrition and hygiene practices."},"HBNC-7":{title:"HBNC Day 42 Home Visit",protocol:"02_HBNC",citation:"SEC-02-HBNC-07",description:"End of 6-week neonatal period: verify completion of first primary immunization (Pentavalent-1, OPV-1, RVV-1, fIPV-1), maternal family planning counseling."},"BP-followup":{title:"Hypertension Clinical Follow-up",protocol:"05_NCD",citation:"SEC-05-NCD-01",description:"Monthly blood pressure measurement using validated digital sphygmomanometer. Verify compliance with prescribed anti-hypertensive medication. Advise low salt intake and physical activity."},"Sugar-followup":{title:"Diabetes Mellitus Blood Sugar Follow-up",protocol:"05_NCD",citation:"SEC-05-NCD-02",description:"Random Blood Sugar (RBS) monitoring via glucometer. Check adherence to oral hypoglycemic agents, foot care inspection, and symptom tracking."},"MUAC-screening":{title:"Child Nutrition & MUAC Screening",protocol:"07_NUT",citation:"SEC-07-NUT-01",description:"Screening 6-59 month children with color-banded MUAC tape. Check for bilateral pitting edema of feet. Red (<11.5 cm) indicates Severe Acute Malnutrition (SAM) needing NRC referral."},BCG:{title:"BCG Vaccination at Birth",protocol:"04_IMM",citation:"SEC-04-IMM-01",description:"Tuberculosis protection: 0.05 ml intradermal at birth or up to 1 year of age."},"OPV-0":{title:"OPV Birth Dose",protocol:"04_IMM",citation:"SEC-04-IMM-02",description:"Oral Polio Vaccine: 2 drops orally within first 14 days of birth."},"Pentavalent-1":{title:"Pentavalent 1 (DPT + Hep B + Hib)",protocol:"04_IMM",citation:"SEC-04-IMM-03",description:"6 weeks of age: 0.5 ml intramuscularly in anterolateral mid-thigh. Protection against Diphtheria, Pertussis, Tetanus, Hepatitis B, and Haemophilus influenzae b."},"MR-1":{title:"Measles & Rubella 1 (MR-1)",protocol:"04_IMM",citation:"SEC-04-IMM-04",description:"9 completed months to 12 months: 0.5 ml subcutaneous injection in right upper arm plus Vitamin A (1 lakh IU)."}};function ce(i){if(!i)return{title:"Routine Healthcare Follow-up",protocol:"09_VIS",citation:"SEC-09-VIS-01",description:"Frontline community healthcare visit for health promotion, screening, and maternal-child health monitoring."};if(J[i])return J[i];const t=i.toUpperCase();return t.includes("ANC")?J["ANC-1"]:t.includes("HBNC")?J["HBNC-1"]:t.includes("BP")||t.includes("HYPERTENSION")?J["BP-followup"]:t.includes("SUGAR")||t.includes("DIABETES")?J["Sugar-followup"]:t.includes("MUAC")||t.includes("NUTRITION")||t.includes("SAM")?J["MUAC-screening"]:t.includes("PENTA")||t.includes("VACCINE")||t.includes("IMM")||t.includes("MR")?J["Pentavalent-1"]:{title:i,protocol:"09_VIS",citation:"SEC-09-VIS-01",description:`Community health follow-up for ${i} as per frontline health worker protocol guidelines.`}}function je(i,t={}){if(!Array.isArray(i))return[];const e=(t.searchQuery||"").trim().toLowerCase();return i.filter(n=>{if(t.priority&&n.priority!==t.priority||t.village&&n.village!==t.village||t.status&&n.status!==t.status)return!1;if(e){const a=n.name&&n.name.toLowerCase().includes(e),r=n.member_id&&n.member_id.toLowerCase().includes(e),d=n.household_id&&n.household_id.toLowerCase().includes(e),l=n.village&&n.village.toLowerCase().includes(e),g=n.due_item&&n.due_item.toLowerCase().includes(e);if(!a&&!r&&!d&&!l&&!g)return!1}return!0})}function ze(i){if(!Array.isArray(i)||i.length===0)return[];const t=new Map;for(const n of i){const a=n.village||"Other";t.has(a)||t.set(a,[]),t.get(a).push(n)}const e=[];for(const[n,a]of t.entries())a.sort((r,d)=>(r.priority||3)-(d.priority||3)),e.push({village:n,count:a.length,visits:a});return e.sort((n,a)=>n.village.localeCompare(a.village)),e}function Ue(i,t=new Set){if(!Array.isArray(i))return{total:0,p1Count:0,p2Count:0,p3Count:0,overdueCount:0,dueTodayCount:0,completedCount:0};const e=t instanceof Set?t:new Set(t||[]);let n=0,a=0,r=0,d=0,l=0,g=0;for(const k of i){k.priority===1?n++:k.priority===2?a++:k.priority===3&&r++,k.status==="overdue"?d++:k.status==="due_today"&&l++;const m=`${k.member_id}_${k.due_item}`;e.has(m)&&g++}return{total:i.length,p1Count:n,p2Count:a,p3Count:r,overdueCount:d,dueTodayCount:l,completedCount:g}}const F="2026-10-26";function ve(i=F,t=30,e=30){const n=[],a=new Date(`${i}T00:00:00Z`);if(isNaN(a.getTime()))return[F];for(let r=-t;r<=e;r++){const d=new Date(a.getTime()+r*24*60*60*1e3);n.push(d.toISOString().slice(0,10))}return n}function Fe(i){let t=0;for(let e=0;e<i.length;e++){const n=i.charCodeAt(e);t=(t<<5)-t+n,t|=0}return Math.abs(t)}function X(i,t="en"){if(!i||typeof i!="string")return"";try{const e=i.split("-");if(e.length!==3)return i;const n=parseInt(e[0],10),a=parseInt(e[1],10)-1,r=parseInt(e[2],10),d=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],l=["జనవరి","ఫిబ్రవరి","మార్చి","ఏప్రిల్","మే","జూన్","జూలై","ఆగస్టు","సెప్టెంబరు","అక్టోబరు","నవంబరు","డిసెంబరు"],g=["जनवरी","फरवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितंबर","अक्टूबर","नवंबर","दिसंबर"];return t==="te"?`${r} ${l[a]} ${n}`:t==="hi"?`${r} ${g[a]} ${n}`:`${r} ${d[a]} ${n}`}catch{return i}}function Se(i=F,t=[],e=[],n=[]){if(!Array.isArray(t))return[];const a=String(i||F),r=new Map;if(Array.isArray(n)&&n.forEach(s=>{if(s&&s.date===a){const h=s.key||`${s.memberId}_${s.dueItem}`;r.set(h,s)}}),a===F)return t.map(s=>{const h=`${s.member_id}_${s.due_item}`,y=r.has(h);let b=s.status||"due_today";return y?b="completed":s.priority===1&&(b="overdue"),{...s,date:a,status:b,completedNote:y&&r.get(h).note||"",completedAt:y&&r.get(h).timestamp||""}});const d=a<F,l=a>F,g=new Date(`${F}T00:00:00Z`).getTime(),k=new Date(`${a}T00:00:00Z`).getTime(),m=Math.round((k-g)/(24*60*60*1e3)),p=Math.abs(m)%21,c=[];return t.forEach((s,h)=>{if((Fe(s.member_id||"")+h)%21===p){const b=`${s.member_id}_${s.due_item}`,x=r.has(b);let o="planned";x?o="completed":d?o=(s.priority===1,"missed"):l&&(o="planned"),c.push({...s,date:a,status:o,completedNote:x&&r.get(b).note||"",completedAt:x&&r.get(b).timestamp||""})}}),Array.isArray(n)&&n.forEach(s=>{if(s&&s.date===a){const h=s.key||`${s.memberId}_${s.dueItem}`;if(!c.some(b=>`${b.member_id}_${b.due_item}`===h)){const b=t.find(x=>x.member_id===s.memberId)||{};c.push({member_id:s.memberId,due_item:s.dueItem,priority:b.priority||2,status:"completed",household_id:b.household_id||"HH-LOCAL",village:b.village||"Amrapur",asha_id:b.asha_id||"ASHA-096P",name:b.name||"Local Record",sex:b.sex||"F",dob:b.dob||"1995-01-01",date:a,completedNote:s.note||"",completedAt:s.timestamp||""})}}}),c}function Ge(i=[]){if(!Array.isArray(i))return{total:0,completed:0,missed:0,planned:0,p1Count:0,p2Count:0,p3Count:0,villages:{},patientCount:0};let t=0,e=0,n=0,a=0,r=0,d=0;const l={},g=new Set;return i.forEach(k=>{if(!k)return;const m=String(k.status||"").toLowerCase();m==="completed"?t+=1:m==="missed"||m==="overdue"?e+=1:n+=1;const p=parseInt(k.priority,10);p===1?a+=1:p===2?r+=1:p===3&&(d+=1);const c=k.village?k.village.trim():"Unknown";l[c]=(l[c]||0)+1,k.member_id&&g.add(k.member_id)}),{total:i.length,completed:t,missed:e,planned:n,p1Count:a,p2Count:r,p3Count:d,villages:l,patientCount:g.size}}function Ke(i=[],t=[],e=[],n=[],a=null){(!Array.isArray(i)||i.length===0)&&(i=ve(F,30,0));const r=a&&a!=="all"?t.filter(b=>b.asha_id===a):t;let d=0,l=0,g=0,k=0;const m={},p={anc:{code:"ANC",total:0,completed:0,pending:0},hbnc:{code:"HBNC",total:0,completed:0,pending:0},imm:{code:"IMM",total:0,completed:0,pending:0},nut:{code:"NUT",total:0,completed:0,pending:0},ncd:{code:"NCD",total:0,completed:0,pending:0},high_risk:{code:"HRP",total:0,completed:0,pending:0}},c=[];let s=[];i.forEach(b=>{const x=Se(b,r,e,n);b===F&&(s=x);let o=0,u=0,f=0;x.forEach(T=>{d+=1;const v=T.status==="completed";v?(l+=1,o+=1):(g+=1,u+=1),T.priority===1&&(k+=1,f+=1);const C=T.village||"Unknown";m[C]||(m[C]={village:C,total:0,completed:0,pending:0,p1:0}),m[C].total+=1,v?m[C].completed+=1:m[C].pending+=1,T.priority===1&&(m[C].p1+=1);const _=String(T.due_item||"").toLowerCase();let M="high_risk";_.startsWith("anc")?M="anc":_.startsWith("hbnc")?M="hbnc":_.includes("bp")||_.includes("sugar")||_.includes("ncd")?M="ncd":_.includes("muac")||_.includes("nut")?M="nut":_.includes("hrp")?M="high_risk":M="imm",p[M]&&(p[M].total+=1,v?p[M].completed+=1:p[M].pending+=1)}),c.push({date:b,total:x.length,completed:o,pending:u,p1:f})});const h=d>0?Math.round(l/d*100):0,y=s.filter(b=>b.priority===1||b.status==="overdue"||b.status==="missed").sort((b,x)=>b.priority-x.priority);return{totalVisits:d,completedVisits:l,pendingVisits:g,urgentVisits:k,completionRate:h,todayVisits:s,urgentList:y,dailyTrend:c,villageBreakdown:Object.values(m).sort((b,x)=>x.total-b.total),categoryBreakdown:Object.entries(p).map(([b,x])=>({category:b,...x}))}}function We({selectedDate:i,onDateChange:t,state:e,visitsForDate:n=[]}){const a=e.translations||{},r=e.lang||"en",d=document.createElement("div");d.className="date-navigator-container",d.style.marginBottom="14px";const l="2026-09-26",g="2026-11-25",k=new Date(`${i}T00:00:00Z`),m=new Date(k.getTime()-24*60*60*1e3).toISOString().slice(0,10),p=new Date(k.getTime()+24*60*60*1e3).toISOString().slice(0,10),c=m>=l,s=p<=g,h=Ge(n),y=i===F,b=X(i,r),x=Object.entries(h.villages||{}).slice(0,4).map(([v,C])=>{const _=v.toLowerCase().replace(/[\s-]+/g,"_"),M=a.village&&a.village[_]?a.village[_]:v;return`<span style="background:var(--color-surface);border:1px solid var(--color-border);padding:2px 8px;border-radius:6px;font-size:0.75rem;">${Qe(M)}: <strong>${C}</strong></span>`}).join(" ");d.innerHTML=`
    <div class="card date-navigator-card" style="padding:14px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:10px;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;border-bottom:1px solid var(--color-border);padding-bottom:10px;margin-bottom:10px;">
        <div style="display:flex;align-items:center;gap:6px;">
          <button type="button" class="btn btn-sm btn-secondary btn-nav-prev" ${c?"":"disabled"} title="Previous Day" style="min-height:36px;padding:4px 10px;">
            ${a.pagination?a.pagination.prev:"Previous"}
          </button>
          <div style="text-align:center;">
            <div style="font-size:1.05rem;font-weight:700;color:var(--color-teal-dark);">
              ${b}
            </div>
            <div style="font-size:0.75rem;color:var(--color-muted);">
              ${y?`(${a.visits?a.visits.title:"Demo Date"})`:"(Schedule View)"}
            </div>
          </div>
          <button type="button" class="btn btn-sm btn-secondary btn-nav-next" ${s?"":"disabled"} title="Next Day" style="min-height:36px;padding:4px 10px;">
            ${a.pagination?a.pagination.next:"Next"}
          </button>
        </div>

        <div style="display:flex;align-items:center;gap:8px;">
          <button type="button" class="btn btn-sm ${y?"btn-primary":"btn-secondary"} btn-nav-today" style="font-size:0.8rem;min-height:36px;padding:4px 10px;">
            ${a.dateNav?a.dateNav.btnToday:"Today"}
          </button>
          <input
            type="date"
            class="form-input date-input-picker"
            min="${l}"
            max="${g}"
            value="${i}"
            style="width:auto;padding:4px 8px;font-size:0.85rem;min-height:36px;"
          />
        </div>
      </div>

      <!-- Quick Day Strip of Nearby 5 Days -->
      <div class="quick-days-strip" style="display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;margin-bottom:8px;">
        ${[-2,-1,0,1,2].map(v=>{const C=new Date(k.getTime()+v*24*60*60*1e3).toISOString().slice(0,10);if(C<l||C>g)return"";const _=C===i,M=X(C,r).slice(0,6);return`
              <button
                type="button"
                class="btn btn-sm ${_?"btn-primary":"btn-secondary"} btn-strip-day"
                data-date="${C}"
                style="flex:1;min-width:65px;padding:4px 6px;font-size:0.75rem;display:flex;flex-direction:column;align-items:center;"
              >
                <span>${M}</span>
              </button>
            `}).join("")}
      </div>

      <!-- Workload Summary Chips -->
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;font-size:0.82rem;background:#f8fafc;padding:8px 10px;border-radius:8px;">
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
          <span>${a.visits?a.visits.statTotal:"Total"}: <strong>${h.total}</strong></span>
          <span style="color:#16a34a;">${a.dateNav?a.dateNav.completed:"Done"}: <strong>${h.completed}</strong></span>
          <span style="color:#d97706;">${a.dateNav?a.dateNav.missed:"Missed"}: <strong>${h.missed}</strong></span>
          <span style="color:#0284c7;">${a.dateNav?a.dateNav.planned:"Planned"}: <strong>${h.planned}</strong></span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
          ${x}
        </div>
      </div>

      ${y?"":`<div style="font-size:0.72rem;color:var(--color-muted);margin-top:6px;font-style:italic;text-align:right;">
              ${a.dashboard?a.dashboard.derivedNote:"Derived from schedule data and locally recorded visits"}
            </div>`}
    </div>
  `;const o=d.querySelector(".btn-nav-prev"),u=d.querySelector(".btn-nav-next"),f=d.querySelector(".btn-nav-today"),T=d.querySelector(".date-input-picker");return o&&c&&o.addEventListener("click",()=>t(m)),u&&s&&u.addEventListener("click",()=>t(p)),f&&f.addEventListener("click",()=>t(F)),T&&T.addEventListener("change",v=>{const C=v.target.value;C&&C>=l&&C<=g&&t(C)}),d.querySelectorAll(".btn-strip-day").forEach(v=>{v.addEventListener("click",C=>{const _=C.currentTarget.getAttribute("data-date");_&&t(_)})}),d}function Qe(i){return i?String(i).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}function Je(i){const t=i.translations,e=document.createElement("div");e.className="view-container visit-view";let n="",a=!1,r=i.selectedVisitDate||"2026-10-26";i.selectedVisitDate=null;let d="all",l="all",g="all";function k(){try{return JSON.parse(localStorage.getItem("swasthyavani_visited_visits")||"[]")}catch{return[]}}function m(o){try{localStorage.setItem("swasthyavani_visited_visits",JSON.stringify(o))}catch(u){console.warn("[SwasthyaVani] Could not persist visited records:",u)}}let p=k(),c=new Set(p.map(o=>o.key||`${o.memberId}_${o.dueItem}`));function s(o,u){if(!u)return"";const f=String(u).toLowerCase().replace(/[\s-]+/g,"_");return t[o]&&t[o][f]?t[o][f]:u}function h(o,u=""){const f=`${o.member_id}_${o.due_item}`;if(c.has(f))p=p.filter(T=>(T.key||`${T.memberId}_${T.dueItem}`)!==f),c.delete(f);else{const T={key:f,date:r,memberId:o.member_id,dueItem:o.due_item,timestamp:new Date().toISOString(),note:u};p.push(T),c.add(f),le.enqueue({type:"visit_completed",memberId:o.member_id,dueItem:o.due_item,date:r,note:u,timestamp:T.timestamp})}m(p),y()}function y(){e.innerHTML="";const o=Se(r,i.visits,i.enrichedRegister,p).filter($=>d==="all"||!d?!0:$.asha_id===d).filter($=>l==="all"||!l?!0:($.village||"").toLowerCase()===l.toLowerCase()).filter($=>{if(g==="all"||!g)return!0;const A=($.clinical_category||"").toLowerCase(),N=($.due_item||"").toLowerCase();return A.includes(g)||N.includes(g)}),u=Ue(o,c),f=document.createElement("div");f.className="card visit-header-card",f.style.padding="14px 18px",f.style.marginBottom="12px",f.innerHTML=`
      <div class="visit-title-row" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;">
        <div>
          <h2 class="section-title" style="margin-bottom:4px;">${t.visits?t.visits.title:"Visit Planner"}</h2>
          <p class="section-sub" style="margin-bottom:0;">${t.visits&&t.visits.subtitle?t.visits.subtitle:t.visits?t.visits.dateNotice:"Schedule and prioritize frontline home visits."}</p>
        </div>
        <div class="header-actions-row" style="display:flex;gap:8px;align-items:center;">
          <button type="button" id="btn-print-schedule" class="btn btn-sm btn-secondary">
            ${t.visits?t.visits.btnPrint:"Print Schedule"}
          </button>
          <div class="sync-status-badge">
            <span class="sync-count">${le.getPendingCount()}</span>
            <span>${t.visits?t.visits.pendingSync:"pending"}</span>
          </div>
        </div>
      </div>
    `;const T=We({selectedDate:r,onDateChange:$=>{r=$,y()},state:i,visitsForDate:o}),v=document.createElement("div");v.className="card visit-summary-card",v.style.padding="12px 16px",v.style.marginBottom="12px",v.innerHTML=`
      <div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:10px;">
        <div class="stat-box" style="padding:8px 12px;border-radius:8px;border:1px solid var(--color-border);text-align:center;">
          <span class="stat-num" style="font-size:1.35rem;font-weight:700;display:block;">${u.total}</span>
          <span class="stat-label" style="font-size:0.8rem;color:var(--color-muted);">${t.visits?t.visits.statTotal:"Total"}</span>
        </div>
        <div class="stat-box" style="padding:8px 12px;border-radius:8px;border:1px solid #a7f3d0;background:#ecfdf5;color:#065f46;text-align:center;">
          <span class="stat-num" style="font-size:1.35rem;font-weight:700;color:#059669;display:block;">${u.completedCount}</span>
          <span class="stat-label" style="font-size:0.8rem;font-weight:600;">${t.dashboard&&t.dashboard.completed?t.dashboard.completed:"Completed"}</span>
        </div>
        <div class="stat-box" style="padding:8px 12px;border-radius:8px;border:1px solid #cbd5e1;background:#f8fafc;color:#334155;text-align:center;">
          <span class="stat-num" style="font-size:1.35rem;font-weight:700;color:#475569;display:block;">${Math.max(u.total-u.completedCount,0)}</span>
          <span class="stat-label" style="font-size:0.8rem;font-weight:600;">${t.dashboard&&t.dashboard.pending?t.dashboard.pending:"Pending"}</span>
        </div>
        <div class="stat-box" style="padding:8px 12px;border-radius:8px;border:1px solid #fcd34d;background:#fffbeb;color:#92400e;text-align:center;">
          <span class="stat-num" style="font-size:1.35rem;font-weight:800;color:#b45309;display:block;">${u.p1Count}</span>
          <span class="stat-label" style="font-size:0.8rem;font-weight:700;">${t.visits?t.visits.statUrgent:"Urgent"}</span>
        </div>
      </div>
    `;const C=document.createElement("div");C.className="card visit-filters-card",C.style.padding="14px 16px",C.style.marginBottom="12px",C.innerHTML=`
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(160px, 1fr));gap:10px;margin-bottom:12px;">
        <div class="filter-group">
          <label for="visit-asha-select" class="filter-label" style="font-weight:600;font-size:0.82rem;display:block;margin-bottom:4px;">ASHA:</label>
          <select id="visit-asha-select" class="form-select" style="width:100%;padding:6px 8px;font-size:0.85rem;">
            <option value="all" ${d==="all"?"selected":""}>All ASHAs</option>
            <option value="ASHA-096P" ${d==="ASHA-096P"?"selected":""}>Sunaina Devi (Amrapur)</option>
            <option value="ASHA-RRR5" ${d==="ASHA-RRR5"?"selected":""}>Kalavati Kumari (Belwadi Tola)</option>
            <option value="ASHA-YFK5" ${d==="ASHA-YFK5"?"selected":""}>Rinku Devi (Kesarganj)</option>
            <option value="ASHA-L9R8" ${d==="ASHA-L9R8"?"selected":""}>Shabnam Khatoon (Dhanpura)</option>
            <option value="ASHA-KQXR" ${d==="ASHA-KQXR"?"selected":""}>Malti Devi (Navagaon/Sita)</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="visit-village-select" class="filter-label" style="font-weight:600;font-size:0.82rem;display:block;margin-bottom:4px;">${t.filters?t.filters.villageLabel:"Village"}:</label>
          <select id="visit-village-select" class="form-select" style="width:100%;padding:6px 8px;font-size:0.85rem;">
            <option value="all" ${l==="all"?"selected":""}>${t.filters?t.filters.allVillages:"All Villages"}</option>
            ${["Amrapur","Belwadi Tola","Kesarganj","Dhanpura","Navagaon Khurd","Sitapahari"].map($=>`<option value="${$}" ${l===$?"selected":""}>${L(s("village",$))}</option>`).join("")}
          </select>
        </div>

        <div class="filter-group">
          <label for="visit-category-select" class="filter-label" style="font-weight:600;font-size:0.82rem;display:block;margin-bottom:4px;">${t.filters?t.filters.categoryLabel:"Category"}:</label>
          <select id="visit-category-select" class="form-select" style="width:100%;padding:6px 8px;font-size:0.85rem;">
            <option value="all" ${g==="all"?"selected":""}>${t.filters?t.filters.allCategories:"All Categories"}</option>
            <option value="anc" ${g==="anc"?"selected":""}>${t.categories?t.categories.anc:"ANC"}</option>
            <option value="hbnc" ${g==="hbnc"?"selected":""}>${t.categories?t.categories.hbnc:"HBNC"}</option>
            <option value="imm" ${g==="imm"?"selected":""}>${t.categories?t.categories.imm:"Immunization"}</option>
            <option value="nut" ${g==="nut"?"selected":""}>${t.categories?t.categories.nut:"Nutrition"}</option>
            <option value="ncd" ${g==="ncd"?"selected":""}>${t.categories?t.categories.ncd:"NCD"}</option>
          </select>
        </div>
      </div>

      <div class="search-row" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <input
          type="text"
          id="visit-search-input"
          class="form-input"
          placeholder="${t.visits.searchPlaceholder}"
          value="${L(n)}"
          style="flex:1;min-width:180px;"
        />
        <button type="button" id="btn-toggle-route" class="btn btn-sm ${a?"btn-primary":"btn-secondary"}">
          ${a?t.visits.allVillagesGroup||"List View":t.visits.groupByVillage||"Group by Village"}
        </button>
      </div>
    `;const _=je(o,{priority:void 0,searchQuery:n}),M=document.createElement("div");if(M.className="card visit-items-card",!_.length)M.innerHTML=`<p class="empty-notice" style="padding:20px;text-align:center;color:var(--color-muted);">${t.visits.emptyNotice}</p>`;else if(a){const $=ze(_);let A="";for(const N of $){const D=s("village",N.village),E=N.visits.map(V=>b(V)).join("");A+=`
          <div class="village-group-section" style="margin-bottom:16px;">
            <div class="village-section-header" style="display:flex;justify-content:space-between;padding:8px 12px;background:#f1f5f9;border-radius:6px;font-weight:700;margin-bottom:8px;">
              <span>${L(D)}</span>
              <span class="badge-count">${N.count} ${t.visits.statTotal}</span>
            </div>
            <div class="visit-list-table">
              <div class="table-header">
                <span>${t.visits.colMember}</span>
                <span>${t.visits.colDue}</span>
                <span>${t.visits.colStatus}</span>
                <span>${t.visits.colPriority}</span>
                <span>Action</span>
              </div>
              ${E}
            </div>
          </div>
        `}M.innerHTML=A}else{const $=[],A=[],N=[],D=[];_.forEach(B=>{B.priority===1?$.push(B):B.status==="overdue"||B.status==="missed"?N.push(B):B.status==="due_today"||B.status==="due"||B.priority===2?A.push(B):D.push(B)});const E=[{key:"urgent",title:t.visits&&t.visits.labelUrgent||"Urgent",badgeStyle:"background:#fffbeb;border:1px solid #fde68a;color:#92400e;",items:$},{key:"dueToday",title:t.visits&&t.visits.labelDueToday||"Due today",badgeStyle:"background:#f0fdfa;border:1px solid #99f6e4;color:#0f766e;",items:A},{key:"overdue",title:t.visits&&t.visits.labelOverdue||"Overdue",badgeStyle:"background:#f8fafc;border:1px solid #cbd5e1;color:#475569;",items:N},{key:"upcoming",title:t.visits&&t.visits.labelUpcoming||"Upcoming",badgeStyle:"background:#f0f9ff;border:1px solid #bae6fd;color:#0369a1;",items:D}];let V="";E.forEach(B=>{if(B.items.length===0)return;const Z=B.items.slice(0,100).map(Q=>b(Q)).join("");V+=`
          <div class="priority-group-section" style="margin-bottom:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-radius:6px;margin-bottom:8px;${B.badgeStyle}">
              <span style="font-weight:700;font-size:0.95rem;">${L(B.title)}</span>
              <span style="font-size:0.8rem;font-weight:700;">${B.items.length}</span>
            </div>
            <div class="visit-list-table">
              <div class="table-header">
                <span>${t.visits.colMember}</span>
                <span>${t.visits.colDue}</span>
                <span>${t.visits.colStatus}</span>
                <span>${t.visits.colPriority}</span>
                <span>Action</span>
              </div>
              ${Z}
            </div>
          </div>
        `}),M.innerHTML=V||`<p class="empty-notice" style="padding:20px;text-align:center;color:var(--color-muted);">${t.visits.emptyNotice}</p>`}e.appendChild(f),e.appendChild(T),e.appendChild(v),e.appendChild(C),e.appendChild(M);const I=f.querySelector("#btn-print-schedule");I&&I.addEventListener("click",()=>window.print());const O=C.querySelector("#visit-search-input");let j;O&&O.addEventListener("input",$=>{clearTimeout(j),j=setTimeout(()=>{n=$.target.value,y()},200)});const w=C.querySelector("#btn-toggle-route");w&&w.addEventListener("click",()=>{a=!a,y()});const R=C.querySelector("#visit-asha-select");R&&R.addEventListener("change",$=>{d=$.target.value,y()});const S=C.querySelector("#visit-village-select");S&&S.addEventListener("change",$=>{l=$.target.value,y()});const H=C.querySelector("#visit-category-select");H&&H.addEventListener("change",$=>{g=$.target.value,y()}),M.querySelectorAll(".btn-mark-visited").forEach($=>{$.addEventListener("click",A=>{A.stopPropagation();const N=$.getAttribute("data-mid"),D=$.getAttribute("data-item"),E=o.find(V=>V.member_id===N&&V.due_item===D)||i.visits.find(V=>V.member_id===N&&V.due_item===D);E&&h(E)})}),M.querySelectorAll(".btn-log-note").forEach($=>{$.addEventListener("click",A=>{A.stopPropagation();const N=$.getAttribute("data-mid"),D=$.getAttribute("data-item"),E=i.visits.find(Z=>Z.member_id===N&&Z.due_item===D),V=t.visits.notePrompt.replace("{name}",E&&E.name||N),B=prompt(V);B&&B.trim()&&(h(E,B.trim()),alert(t.visits.notesSaved))})}),M.querySelectorAll(".visit-row").forEach($=>{$.addEventListener("click",()=>{const A=$.getAttribute("data-mid"),N=$.getAttribute("data-item"),D=i.visits.find(E=>E.member_id===A&&E.due_item===N);D&&x(D)}),$.addEventListener("keydown",A=>{if(A.key==="Enter"||A.key===" "){A.preventDefault();const N=$.getAttribute("data-mid"),D=$.getAttribute("data-item"),E=i.visits.find(V=>V.member_id===N&&V.due_item===D);E&&x(E)}})})}function b(o){const u=c.has(`${o.member_id}_${o.due_item}`),f=s("village",o.village||"Chandrapuri"),T=t.status[o.status]||o.status||t.status.due;return`
      <div
        class="visit-row prio-${o.priority} ${u?"is-visited":""}"
        data-mid="${L(o.member_id)}"
        data-item="${L(o.due_item)}"
        tabindex="0"
        role="button"
        title="Click to view full clinical details"
      >
        <div class="visit-col col-main">
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="member-name">${L(o.name||o.member_id)}</span>
            ${u?`<span class="badge-visited-pill">${t.visits.badgeVisited||"Visited"}</span>`:""}
          </div>
          <span class="member-meta">${L(o.member_id)} · ${L(f)} (${L(o.household_id||"-")})</span>
        </div>
        <div class="visit-col col-item">
          <span class="due-item-tag">${L(o.due_item)}</span>
        </div>
        <div class="visit-col col-status">
          <span class="status-tag status-${o.status}">${L(T)}</span>
        </div>
        <div class="visit-col col-pri">
          <span class="pri-badge pri-${o.priority}">P${o.priority}</span>
        </div>
        <div class="visit-col col-action" style="display:flex;gap:4px;">
          <button
            type="button"
            class="btn btn-sm btn-mark-visited ${u?"btn-visited is-done":"btn-visited"}"
            data-mid="${L(o.member_id)}"
            data-item="${L(o.due_item)}"
            title="${t.visits.btnMarkVisited}"
            style="min-width:55px;"
          >
            ${u?t.visits.doneLabel||"Done":t.visits.pendingLabel||"Pending"}
          </button>
          <button
            type="button"
            class="btn btn-sm btn-log-note btn-secondary"
            data-mid="${L(o.member_id)}"
            data-item="${L(o.due_item)}"
            title="${t.visits.btnLogNote}"
          >
            ${t.visits.btnLogNote||"Note"}
          </button>
        </div>
      </div>
    `}function x(o){const u=document.createElement("div");u.className="modal-overlay",u.setAttribute("role","dialog"),u.setAttribute("aria-modal","true"),u.setAttribute("aria-labelledby","modal-visit-title");const f=(i.enrichedRegister||[]).find(z=>z.member_id===o.member_id)||{},T=JSON.parse(localStorage.getItem("swasthyavani_custom_beneficiaries")||"[]").find(z=>z.member_id===o.member_id)||{},v={...f,...T,...o},C=t.profile.notRecorded||"Not recorded",_=s("district",v.district||"chandrapuri"),M=s("village",v.village||"chandrapuri"),I=v.past_diseases?s("condition",v.past_diseases):C,O=v.infection_history?s("infection",v.infection_history):C,j=v.allergies?s("allergy",v.allergies):C,w=v.immunisation_history?s("immunization",v.immunisation_history):C,R=v.last_recorded_vitals||C,S=ce(o.due_item),H=c.has(`${o.member_id}_${o.due_item}`),$=[`${v.name||v.member_id}.`,`${t.profile.village}: ${M}, ${_}.`,`${t.visits.colDue}: ${o.due_item}.`,`${S.title}: ${S.description}.`,`${t.profile.currentVitals}: ${R}.`,`${t.profile.medicationSection}: ${v.allowed_medication_dosage||t.card.refusalAction}.`].join(" "),A=document.createElement("div");A.className="modal-dialog",A.innerHTML=`
      <div class="modal-header">
        <div>
          <h2 id="modal-visit-title" class="modal-title">${L(v.name||v.member_id)}</h2>
          <span class="patient-id-badge">${L(v.member_id)} | ${L(v.household_id||"-")}</span>
        </div>
        <button type="button" class="modal-close-btn" aria-label="${t.profile.close}">×</button>
      </div>

      <div class="modal-body">
        <!-- Voice Audio Bar -->
        <div class="tts-player-bar">
          <button type="button" id="btn-modal-speak" class="btn btn-primary btn-tts">
            ${t.profile.btnListen}
          </button>
          <button type="button" id="btn-modal-pause" class="btn btn-secondary" style="display:none;">
            ${t.profile.btnPause}
          </button>
          <button type="button" id="btn-modal-stop" class="btn btn-secondary" style="display:none;">
            ${t.profile.btnStop}
          </button>
        </div>

        <!-- Today's Due Visit Protocol Focus -->
        <section class="modal-section" style="background:#f0fdfa;border:1px solid #99f6e4;padding:12px;border-radius:8px;">
          <h3 class="section-subtitle" style="color:#0f766e;margin-bottom:6px;">
            ${t.visits.colDue}: ${L(o.due_item)}
          </h3>
          <p style="font-weight:700;font-size:0.95rem;margin-bottom:4px;">${L(S.title)}</p>
          <p style="font-size:0.9rem;margin-bottom:8px;">${L(S.description)}</p>
          <div style="display:flex;gap:12px;font-size:0.8rem;color:#0f766e;">
            <span><strong>${t.profile.citationLabel}:</strong> ${L(S.citation)} (${L(S.protocol)})</span>
            <span><strong>${t.visits.colPriority}:</strong> P${o.priority}</span>
            <span><strong>${t.visits.colStatus}:</strong> ${t.status[o.status]||o.status}</span>
          </div>
        </section>

        <!-- Demographics -->
        <section class="modal-section">
          <h3 class="section-subtitle">${t.profile.demographics}</h3>
          <div class="details-grid">
            <div><span class="lbl">${t.profile.gender}:</span> <strong>${v.sex==="F"?t.profile.female:t.profile.male}</strong></div>
            <div><span class="lbl">${t.profile.houseNo}:</span> <strong>${L(v.house_no||"-")}</strong></div>
            <div><span class="lbl">${t.profile.village}:</span> <strong>${L(M)}</strong></div>
            <div><span class="lbl">${t.profile.district}:</span> <strong>${L(_)}</strong></div>
            <div><span class="lbl">${t.profile.assignedAsha}:</span> <strong>${L(v.asha_name?v.asha_name+" ("+(v.asha_id||"ASHA-01")+")":v.asha_id||"-")}</strong></div>
            <div><span class="lbl">${t.profile.assignedAnm}:</span> <strong>${L(v.anm_name||(v.district==="chandrapuri"?"ANM Nirmala (Chandrapuri Sub-Centre)":"-"))}</strong></div>
            <div><span class="lbl">${t.profile.nextDueDate}:</span> <strong>${L(v.next_due_date||r)}</strong></div>
          </div>
        </section>

        <!-- Recorded Vitals -->
        <section class="modal-section">
          <h3 class="section-subtitle">${t.profile.currentVitals}</h3>
          <div class="vitals-highlight-box">
            <strong>${L(R)}</strong>
          </div>
        </section>

        <!-- Medical History & Allergies -->
        <section class="modal-section">
          <h3 class="section-subtitle">${t.profile.pastHistory}</h3>
          <div class="history-grid">
            <div class="history-item">
              <span class="lbl">${t.profile.pastDiseases}:</span>
              <strong>${L(I)}</strong>
            </div>
            <div class="history-item">
              <span class="lbl">${t.profile.infectionHistory}:</span>
              <strong>${L(O)}</strong>
            </div>
            <div class="history-item">
              <span class="lbl">${t.profile.allergies}:</span>
              <strong style="color:var(--color-danger);">${L(j)}</strong>
            </div>
            <div class="history-item">
              <span class="lbl">${t.profile.immunisationHistory}:</span>
              <strong>${L(w)}</strong>
            </div>
          </div>
        </section>

        <!-- Actions Bar -->
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:12px;padding-top:12px;border-top:1px solid var(--color-border);">
          <button type="button" id="btn-modal-mark-visited" class="btn ${H?"btn-secondary":"btn-primary"}">
            ${H?t.visits.badgeVisited||"Visited":t.visits.btnMarkVisited}
          </button>
          <button type="button" id="btn-modal-log-note" class="btn btn-secondary">
            ${t.visits.btnLogNote||"Note"}
          </button>
          <button type="button" id="btn-modal-close-footer" class="btn btn-secondary">
            ${t.profile.close}
          </button>
        </div>
      </div>
    `,u.appendChild(A),document.body.appendChild(u);const N=A.querySelector("#btn-modal-speak"),D=A.querySelector("#btn-modal-pause"),E=A.querySelector("#btn-modal-stop");function V(z){z==="speaking"?(N.style.display="none",D.style.display="inline-block",E.style.display="inline-block"):z==="paused"?(N.style.display="inline-block",N.textContent=t.card.btnResume||"Resume",D.style.display="none"):(N.style.display="inline-block",N.textContent=t.profile.btnListen,D.style.display="none",E.style.display="none")}N.addEventListener("click",()=>{G.speak($,i.lang,V)}),D.addEventListener("click",()=>{G.pause(),V("paused")}),E.addEventListener("click",()=>{G.stop(),V("stopped")}),A.querySelector("#btn-modal-mark-visited").addEventListener("click",()=>{h(o),Q()}),A.querySelector("#btn-modal-log-note").addEventListener("click",()=>{const z=t.visits.notePrompt.replace("{name}",v.name||o.member_id),ne=prompt(z);ne&&ne.trim()&&(h(o,ne.trim()),alert(t.visits.notesSaved),Q())});function Q(){G.stop(),u.parentElement&&u.parentElement.removeChild(u),document.removeEventListener("keydown",me)}const ee=A.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),te=ee[0],ue=ee[ee.length-1];function me(z){z.key==="Escape"?Q():z.key==="Tab"&&ee.length>0&&(z.shiftKey?document.activeElement===te&&(z.preventDefault(),ue.focus()):document.activeElement===ue&&(z.preventDefault(),te.focus()))}A.querySelector(".modal-close-btn").addEventListener("click",Q),A.querySelector("#btn-modal-close-footer").addEventListener("click",Q),u.addEventListener("click",z=>{z.target===u&&Q()}),document.addEventListener("keydown",me),te&&te.focus()}return y(),e}function L(i){return i?String(i).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"):""}function Ye(i,t){const e=i.translations||{},n=i.lang||"en",a=document.createElement("div");a.className="view-container dashboard-view";let r="all";function d(){try{return JSON.parse(localStorage.getItem("swasthyavani_visited_visits")||"[]")}catch{return[]}}function l(m,p){if(!p)return"";const c=String(p).toLowerCase().replace(/[\s-]+/g,"_");return e[m]&&e[m][c]?e[m][c]:p}function g(){a.innerHTML="";const m=d(),p=ve(F,30,0),c=Ke(p,i.visits,i.enrichedRegister,m,r),s=document.createElement("div");s.className="card dashboard-header-card",s.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
        <div>
          <h2 class="section-title">${e.dashboard?e.dashboard.title:"Monthly Activity Dashboard"}</h2>
          <p class="section-sub">${e.dashboard?e.dashboard.subtitle:"Chandrapuri Block frontline performance overview across past 30 days."}</p>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <label for="dash-asha-select" class="meta-label">ASHA:</label>
          <select id="dash-asha-select" class="form-select" style="width:auto;padding:6px 10px;font-size:0.85rem;">
            <option value="all" ${r==="all"?"selected":""}>${e.filters?e.filters.allDistricts.replace("Districts","ASHAs"):"All ASHAs"}</option>
            <option value="ASHA-096P" ${r==="ASHA-096P"?"selected":""}>Sunaina Devi (Amrapur)</option>
            <option value="ASHA-RRR5" ${r==="ASHA-RRR5"?"selected":""}>Kalavati Kumari (Belwadi Tola)</option>
            <option value="ASHA-YFK5" ${r==="ASHA-YFK5"?"selected":""}>Rinku Devi (Kesarganj)</option>
            <option value="ASHA-L9R8" ${r==="ASHA-L9R8"?"selected":""}>Shabnam Khatoon (Dhanpura)</option>
            <option value="ASHA-KQXR" ${r==="ASHA-KQXR"?"selected":""}>Malti Devi (Navagaon/Sita)</option>
          </select>
        </div>
      </div>

      <!-- Data Basis Note -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;padding:8px 12px;border-radius:8px;font-size:0.8rem;margin-bottom:14px;">
        <span>${e.dashboard?e.dashboard.dataBasisNote:"Based on registered population data and locally recorded visits (derived from schedule data)."}</span>
      </div>

      <!-- KPI Summary Cards Grid (No Red) -->
      <div class="stats-grid" style="grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:10px;">
        <div class="stat-box">
          <span class="stat-num">${c.totalVisits}</span>
          <span class="stat-label">${e.dashboard?e.dashboard.totalScheduled:"Total Scheduled"}</span>
        </div>
        <div class="stat-box" style="background:#ecfdf5;border-color:#a7f3d0;color:#065f46;">
          <span class="stat-num" style="color:#059669;">${c.completedVisits}</span>
          <span class="stat-label">${e.dashboard?e.dashboard.completed:"Completed"}</span>
        </div>
        <div class="stat-box" style="background:#f8fafc;border-color:#cbd5e1;color:#334155;">
          <span class="stat-num" style="color:#475569;">${c.pendingVisits}</span>
          <span class="stat-label">${e.dashboard?e.dashboard.pendingMissed:"Pending / Missed"}</span>
        </div>
        <div class="stat-box" style="background:#fffbeb;border-color:#fcd34d;color:#92400e;">
          <span class="stat-num" style="color:#b45309;font-weight:800;">${c.urgentVisits}</span>
          <span class="stat-label" style="font-weight:700;">${e.visits?e.visits.statUrgent:"Priority 1 (Urgent)"}</span>
        </div>
        <div class="stat-box" style="background:#f0f9ff;border-color:#bae6fd;color:#0369a1;">
          <span class="stat-num" style="color:#0284c7;">${c.completionRate}%</span>
          <span class="stat-label">${e.dashboard?e.dashboard.completionRate:"Completion Rate"}</span>
        </div>
      </div>
    `,a.appendChild(s);const h=document.createElement("div");h.className="card dashboard-today-card",h.style.marginTop="12px";const y=c.urgentList.slice(0,8),b=y.length>0?y.map(w=>{const R=l("village",w.village||"Chandrapuri"),S=ce(w.due_item);return`
              <div
                class="emergency-item-row"
                data-mid="${U(w.member_id)}"
                data-item="${U(w.due_item)}"
                style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;padding:10px 12px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;margin-bottom:8px;cursor:pointer;"
              >
                <div>
                  <div style="display:flex;align-items:center;gap:6px;">
                    <span style="font-weight:700;color:#0f172a;font-size:0.95rem;">${U(w.name||w.member_id)}</span>
                    <span style="background:#f59e0b;color:#ffffff;font-size:0.7rem;font-weight:700;padding:2px 6px;border-radius:4px;">Urgent</span>
                  </div>
                  <div style="font-size:0.78rem;color:#78350f;margin-top:2px;">
                    ${U(R)} · <strong>${U(w.due_item)}</strong> (${U(S.title)})
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                  <span style="font-size:0.75rem;background:#fef3c7;color:#92400e;padding:3px 8px;border-radius:4px;font-weight:600;">
                    ${U(S.citation)}
                  </span>
                  <a href="tel:108" class="btn btn-sm btn-secondary" style="text-decoration:none;padding:2px 8px;font-size:0.75rem;">108</a>
                </div>
              </div>
            `}).join(""):`<p style="font-size:0.85rem;color:var(--color-muted);">${e.dashboard?e.dashboard.noUrgentToday:"No urgent alerts flagged today."}</p>`;h.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:6px;">
        <h3 style="font-size:1.05rem;font-weight:700;color:#92400e;">
          ${e.dashboard?e.dashboard.todayUrgentTitle:"Today's Clinical Triage"} (${F})
        </h3>
        <span style="font-size:0.75rem;color:var(--color-muted);">
          ${y.length} ${e.dashboard?e.dashboard.flaggedPatients:"flagged beneficiaries"}
        </span>
      </div>
      <div class="emergency-list-wrap">
        ${b}
      </div>
    `,a.appendChild(h);const x=document.createElement("div");x.className="card dashboard-trend-card",x.style.marginTop="12px";const o=Math.max(...c.dailyTrend.map(w=>w.total),1),u=100,f=14,T=5,v=c.dailyTrend.length*(f+T),C=c.dailyTrend.map((w,R)=>{const S=Math.max(Math.round(w.total/o*(u-25)),4),H=u-S-18,$=R*(f+T),A=w.date===F,N=A?"#d97706":w.completed>0?"#10b981":"#0d9488";return`
          <g class="chart-bar-group" data-date="${w.date}" style="cursor:pointer;">
            <title>${w.date}: ${w.total} total, ${w.completed} completed, ${w.p1} urgent (Click to jump)</title>
            <rect x="${$}" y="${H}" width="${f}" height="${S}" rx="3" fill="${N}" opacity="${A?"1":"0.85"}" />
            ${R%6===0?`<text x="${$+f/2}" y="${u-4}" font-size="7" text-anchor="middle" fill="#64748b">${w.date.slice(5)}</text>`:""}
          </g>
        `}).join("");x.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
        <h3 style="font-size:1.05rem;font-weight:700;color:var(--color-teal-dark);">
          ${e.dashboard?e.dashboard.trendTitle:"30-Day Daily Activity & Workload Trend"}
        </h3>
        <span style="font-size:0.75rem;color:var(--color-muted);">
          ${e.dashboard?e.dashboard.clickBarHint:"Click bar to jump to date"}
        </span>
      </div>
      <div style="overflow-x:auto;padding-bottom:6px;">
        <svg viewBox="0 0 ${v} ${u}" style="width:100%;min-width:480px;height:${u}px;display:block;">
          ${C}
        </svg>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--color-muted);margin-top:6px;border-top:1px dashed var(--color-border);padding-top:6px;">
        <span>${X(p[0],n)}</span>
        <span>${e.visits?e.visits.title:"Demo Date"}: ${X(F,n)}</span>
        <span>${X(p[p.length-1],n)}</span>
      </div>
    `,x.querySelectorAll(".chart-bar-group").forEach(w=>{w.addEventListener("click",R=>{const S=R.currentTarget.getAttribute("data-date");S&&t&&t(S)})}),a.appendChild(x);const _=document.createElement("div");_.className="card dashboard-village-card",_.style.marginTop="12px";const M=c.villageBreakdown.map(w=>{const R=l("village",w.village),S=w.total>0?Math.round(w.completed/w.total*100):0;return`
          <tr style="border-bottom:1px solid var(--color-border);">
            <td style="padding:8px 6px;font-weight:700;">${U(R)}</td>
            <td style="padding:8px 6px;text-align:center;">${w.total}</td>
            <td style="padding:8px 6px;text-align:center;color:#16a34a;font-weight:600;">${w.completed}</td>
            <td style="padding:8px 6px;text-align:center;color:#b45309;font-weight:700;">${w.p1}</td>
            <td style="padding:8px 6px;">
              <div style="display:flex;align-items:center;gap:6px;">
                <div style="flex:1;height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden;">
                  <div style="width:${S}%;height:100%;background:#0d9488;"></div>
                </div>
                <span style="font-size:0.75rem;font-weight:600;min-width:30px;">${S}%</span>
              </div>
            </td>
          </tr>
        `}).join("");_.innerHTML=`
      <h3 style="font-size:1.05rem;font-weight:700;color:var(--color-text);margin-bottom:10px;">
        ${e.dashboard?e.dashboard.villageBreakdownTitle:"Village Performance Breakdown (Past 30 Days)"}
      </h3>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
          <thead>
            <tr style="background:#f1f5f9;border-bottom:2px solid var(--color-border);text-align:left;">
              <th style="padding:8px 6px;">${e.filters?e.filters.villageLabel:"Village"}</th>
              <th style="padding:8px 6px;text-align:center;">${e.visits?e.visits.statTotal:"Total"}</th>
              <th style="padding:8px 6px;text-align:center;">${e.dashboard?e.dashboard.completed:"Done"}</th>
              <th style="padding:8px 6px;text-align:center;">${e.visits?e.visits.statUrgent:"Urgent"}</th>
              <th style="padding:8px 6px;min-width:110px;">${e.dashboard?e.dashboard.progress:"Progress"}</th>
            </tr>
          </thead>
          <tbody>
            ${M}
          </tbody>
        </table>
      </div>
    `,a.appendChild(_);const I=document.createElement("div");I.className="card dashboard-cat-card",I.style.marginTop="12px";const O=c.categoryBreakdown.map(w=>{const R=l("categories",w.category);return`
          <div style="padding:10px;background:#f8fafc;border:1px solid var(--color-border);border-radius:8px;font-size:0.85rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <span style="font-weight:700;color:var(--color-teal-dark);">${U(R)} (${w.code})</span>
              <span style="font-weight:700;">${w.total}</span>
            </div>
            <div style="display:flex;gap:10px;font-size:0.75rem;color:var(--color-muted);">
              <span>${e.dashboard?e.dashboard.completed:"Done"}: <strong>${w.completed}</strong></span>
              <span>${e.dashboard?e.dashboard.pending:"Pending"}: <strong>${w.pending}</strong></span>
            </div>
          </div>
        `}).join("");I.innerHTML=`
      <h3 style="font-size:1.05rem;font-weight:700;color:var(--color-text);margin-bottom:10px;">
        ${e.dashboard?e.dashboard.categorySplitTitle:"Clinical Program Categories"}
      </h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:8px;">
        ${O}
      </div>
    `,a.appendChild(I);const j=s.querySelector("#dash-asha-select");j&&j.addEventListener("change",w=>{r=w.target.value,g()}),h.querySelectorAll(".emergency-item-row").forEach(w=>{w.addEventListener("click",R=>{if(R.target&&R.target.tagName==="A")return;const S=w.getAttribute("data-mid"),H=w.getAttribute("data-item"),$=i.visits.find(A=>A.member_id===S&&A.due_item===H)||{member_id:S,due_item:H,priority:1,name:S};k($)})})}function k(m){const p=document.createElement("div");p.className="modal-overlay";const s={...(i.enrichedRegister||[]).find(y=>y.member_id===m.member_id)||{},...m},h=ce(m.due_item);p.innerHTML=`
      <div class="modal-dialog" style="max-width:500px;">
        <div class="modal-header" style="background:#fffbeb;border-bottom:1px solid #fde68a;">
          <div>
            <h3 style="color:#92400e;margin:0;">${U(s.name||s.member_id)}</h3>
            <span style="font-size:0.75rem;color:#78350f;">${U(s.member_id)} · ${U(s.village||"Chandrapuri")}</span>
          </div>
          <button type="button" class="modal-close-btn" style="color:#92400e;">×</button>
        </div>
        <div class="modal-body" style="padding:16px;">
          <div style="margin-bottom:12px;">
            <strong>${e.visits?e.visits.colDue:"Due Clinical Item"}:</strong>
            <div style="color:#92400e;font-weight:700;font-size:1rem;margin-top:2px;">
              ${U(m.due_item)} — ${U(h.title)}
            </div>
            <p style="font-size:0.85rem;color:#334155;margin-top:4px;">${U(h.description)}</p>
          </div>
          <div style="background:#fffbeb;border:1px solid #fde68a;padding:10px;border-radius:6px;font-size:0.82rem;margin-bottom:14px;">
            <strong>${e.card?e.card.escalateAction:"Immediate Action"}:</strong>
            <div>High urgency danger sign flagged. Refer immediately to Medical Officer at Chandrapuri Sub-Centre / FRU.</div>
            <div style="margin-top:4px;font-weight:700;color:#92400e;">Protocol Citation: ${U(h.citation)}</div>
          </div>
          <div style="display:flex;gap:8px;">
            <a href="tel:108" class="btn btn-primary" style="flex:1;text-decoration:none;text-align:center;">Call 108</a>
            <a href="tel:102" class="btn btn-secondary" style="flex:1;text-decoration:none;text-align:center;">Call 102</a>
          </div>
        </div>
      </div>
    `,p.querySelector(".modal-close-btn").addEventListener("click",()=>p.remove()),p.addEventListener("click",y=>{y.target===p&&p.remove()}),document.body.appendChild(p)}return g(),a}function U(i){return i?String(i).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}function Ze(i){const t=i.translations,e=t.perfLive||{},n=document.createElement("div");n.className="view-container perf-view";const a=["pregnant woman with bleeding","3rd ANC checkup schedule","ORS preparation instructions","fever for 8 days continuously","unconscious diabetes patient","paracetamol syrup dosage for baby","BCG vaccine till what age","severe malnutrition MUAC classification","newborn baby cold to touch below 95","child with chest indrawing and fast breathing"];n.innerHTML=`
    <div class="card perf-card">
      <h2 class="section-title">${t.perf.title}</h2>
      <p class="section-sub">${t.perf.subtitle}</p>

      <div class="metrics-grid">
        <div class="metric-card">
          <span class="metric-val">0.0 MB</span>
          <span class="metric-name">${t.perf.metricModelSize}</span>
          <span class="metric-sub">${e.subModel||"Zero Neural Weights (Pure BM25)"}</span>
        </div>
        <div class="metric-card">
          <span class="metric-val">~86 MB</span>
          <span class="metric-name">${t.perf.metricRam}</span>
          <span class="metric-sub">${e.subRam||"Full Index in Memory"}</span>
        </div>
        <div class="metric-card">
          <span class="metric-val" id="perf-median-lat">&lt; 1.0 ms</span>
          <span class="metric-name">${t.perf.metricLatency}</span>
          <span class="metric-sub">${e.subLat||"Instant Browser CPU Execution"}</span>
        </div>
        <div class="metric-card">
          <span class="metric-val">100%</span>
          <span class="metric-name">${t.perf.metricOffline}</span>
          <span class="metric-sub">${e.subOffline||"Service Worker + Static Cache"}</span>
        </div>
      </div>

      <div class="perf-notice">
        <strong>${e.architectureHeading||"Performance Architecture"}:</strong> ${t.perf.zeroNeuralNotice}
      </div>

      <div class="benchmark-section">
        <h3>${e.benchmarkHeading||"Live Browser Benchmark Suite"}</h3>
        <p>${e.benchmarkDesc||"Run 10 frontline clinical queries sequentially to measure in-browser response time."}</p>
        <button type="button" class="btn btn-primary" id="btn-run-benchmark">
          ${e.btnRun||"Run Live Benchmark"}
        </button>
        <div id="benchmark-results" class="benchmark-results"></div>
      </div>
    </div>
  `;const r=n.querySelector("#btn-run-benchmark"),d=n.querySelector("#benchmark-results"),l=n.querySelector("#perf-median-lat");return r.addEventListener("click",()=>{r.disabled=!0,r.textContent=e.running||"Running benchmark...";const g=[];d.innerHTML='<ul class="bench-list"></ul>';const k=d.querySelector(".bench-list");setTimeout(()=>{for(let p=0;p<a.length;p++){const c=a[p],s=ye(c,i.bm25,i.sections,400,{lang:i.lang,seasonalPack:i.seasonalPack});g.push(s.latencyMs);const h=document.createElement("li");h.innerHTML=`<span>${p+1}. "${c.slice(0,35)}..."</span> <strong>${s.latencyMs} ms</strong> (${s.type})`,k.appendChild(h)}g.sort((p,c)=>p-c);const m=g[Math.floor(g.length/2)];l.textContent=`${m} ms`,r.disabled=!1,r.textContent=e.completed||"Benchmark Completed"},50)}),n}const Xe="SwasthyaVani",et="Frontline Health-Worker Offline Companion",tt="Online",at="Offline (Local Engine)",it={ask:"Ask Protocols",visits:"Visit Planner",beneficiaries:"Beneficiaries",dashboard:"Dashboard",perf:"Performance & Hardware"},nt={title:"Beneficiaries",subtitle:"View and add beneficiaries"},st={title:"Clinical Protocol Query",subtitle:"Type your clinical query, statement, or symptoms in English, Hindi, or Telugu.",placeholder:"e.g., garbhvati mahila ko khoon aa raha hai, I have dengue, ya 4th ANC kab hota hai...",btnSubmit:"Search Protocols",btnVoice:"Voice Input (Telugu / English / Hindi)",listening:"Listening... Speak now",voiceOfflineMsg:"Voice needs internet on this device. Please type your query instead.",voiceNetError:"Voice connection failed. Please type your query instead.",voicePermissionDenied:"Microphone access denied. Please type your query instead.",recentQueries:"Sample Frontline Scenarios & Statements"},ot={catPregnancy:"Pregnancy Care",catNewborn:"Newborn Health",catChild:"Child Health & Diarrhoea",catSeasonal:"Seasonal & Regional Illnesses",catNcd:"BP & Diabetes (NCD)",catRefusal:"Prescription Refusals",catAnc:"Pregnancy Care (ANC)",catHbnc:"Newborn Care (HBNC)",catChd:"Child Health (CHD)",catNut:"Nutrition & Growth Monitoring",catImm:"Immunization Schedule",catEsc:"Emergency Danger Signs"},rt={escalateTitle:"EMERGENCY DANGER SIGN — REFER IMMEDIATELY",escalateAction:"Do not delay. Call 108/102 immediately and arrange urgent transport to Chandrapuri District Hospital.",refusalTitle:"OUT OF FRONTLINE SCOPE",refusalAction:"This inquiry involves prescription dosing, medical diagnosis, or unapproved treatment. Refer the beneficiary to the Medical Officer / ANM at the PHC.",answerTitle:"Protocol-Grounded Clinical Guidance",seasonalTitle:"Verified Seasonal & Regional Health Guidance",fallbackTitle:"Clinical Guidance & Referral Assessment",fallbackMessage:"This condition is outside the standard frontline protocol corpus. Assess general emergency danger signs and refer to the Medical Officer at the PHC.",unverifiedNotice:"Preliminary guidance based on public health protocols. Requires clinician confirmation.",citation:"Official Protocol Citation",latency:"Response Time",btnListen:"Listen Guidance",btnPause:"Pause",btnResume:"Resume",btnStop:"Stop",playing:"Playing audio guidance...",voiceUnavailable:"Native speech voice not installed for this language. Check device settings."},lt={ambulance:"108 (Ambulance)",pregnancyTransport:"102 (Pregnancy Transport)"},ct={title:"Filter Beneficiaries",districtLabel:"District",villageLabel:"Village",categoryLabel:"Clinical Category",allDistricts:"All Districts",allVillages:"All Villages",allCategories:"All Categories",searchPlaceholder:"Search by ID, Household, Name, or Village...",clearFilters:"Clear Filters",resultsCount:"Showing {count} beneficiaries",emptyResults:"No beneficiaries match the selected filters."},dt={anc:"Pregnancy check-ups (ANC)",ancTooltip:"Maternal health tracking, 4 ANC visits, IFA tablets, tetanus toxoid vaccination",hbnc:"Newborn home visits (HBNC)",hbncTooltip:"Home-based newborn care visits on days 1, 3, 7, 14, 21, 28, 42",imm:"Vaccinations (IMM)",immTooltip:"National Immunization Schedule from birth up to 5 years",nut:"Child nutrition (NUT)",nutTooltip:"MUAC screening for severe malnutrition and bilateral pitting edema",ncd:"BP and sugar follow-up (NCD)",ncdTooltip:"Hypertension and diabetes screening and monthly drug compliance",high_risk:"High-risk cases",high_riskTooltip:"Priority cases requiring immediate attention or doctor supervision",general:"General Beneficiary",generalTooltip:"Routine household member registered for family health monitoring"},pt={prev:"Previous",next:"Next",pageIndicator:"Page {current} of {total}"},ut={modalTitle:"Beneficiary Details",close:"Close",demographics:"Demographics",patientId:"Patient ID",householdId:"Household ID",houseNo:"House Number",age:"Age",years:"years",days:"days",gender:"Gender",female:"Female",male:"Male",village:"Village",district:"District",assignedAsha:"Assigned ASHA",assignedAnm:"Assigned ANM",notRecorded:"Not recorded",currentVitals:"Current Vitals & Condition",vitals:"Recorded Vitals",pastHistory:"Past Medical History",pastDiseases:"Past Chronic Diseases",infectionHistory:"Infection History",feverColdHistory:"Fever / Cold History",allergies:"Known Allergies",immunisationHistory:"Immunisation Status",whyOnList:"Visit Schedule Reason",nextDueDate:"Next Due Date",pastNotes:"Past ASHA Visit Notes",medicationSection:"Approved Protocol Care & Medication",citationLabel:"Protocol Citation",btnListen:"Listen Clinical Summary",btnPause:"Pause Audio",btnStop:"Stop Audio",syntheticDisclaimer:"Note: Additional clinical history and district records are synthetic demonstration data for frontline workflow validation."},mt={title:"Add new beneficiary",subtitle:"Record a new family member locally for offline visit scheduling and tracking.",nameLabel:"Full Name",namePlaceholder:"Enter beneficiary full name",ageLabel:"Age (years)",agePlaceholder:"Age in years (e.g., 24)",genderLabel:"Gender",female:"Female",male:"Male",districtLabel:"District",villageLabel:"Village",ashaLabel:"Assigned ASHA Worker",categoryLabel:"Clinical Category",lmpLabel:"LMP Date (if pregnant)",dobLabel:"Date of Birth (if infant / child)",notesLabel:"Initial Clinical Notes / Observations",notesPlaceholder:"Enter observations, risk signs, or existing conditions...",btnSubmit:"Register & Add to Schedule",successMsg:"Beneficiary successfully registered and scheduled! Queued for offline sync.",errorMsg:"Please provide a valid name, age, village, and category.",badgeSimulated:"Simulated Local Storage Queue"},gt={title:"Daily Prioritized Visits",subtitle:"Schedule and prioritize frontline home visits",dateNotice:"Evaluated Anchor Date: 2026-10-26",totalDue:"Total Due/Overdue Visits",statTotal:"Total Visits",statUrgent:"Urgent Visits",statOverdue:"Overdue Visits",filterAll:"All Visits",filterP1:"Priority 1 (Urgent)",filterP2:"Priority 2 (Routine Due)",filterP3:"Priority 3 (Upcoming Window)",searchPlaceholder:"Search visit schedule by Name, ID, or Village...",groupByVillage:"Group by Village (Walking Route)",allVillagesGroup:"All Villages (Combined)",progressLabel:"Visits Completed Today: {done} of {total}",selectDate:"Change Date",btnPrint:"Print / Export Daily Schedule",colMember:"Beneficiary",colVillage:"Village / House",colDue:"Due Item",colStatus:"Timeline Status",colPriority:"Priority Level",btnLogNote:"Log Note",btnMarkVisited:"Mark Visited",badgeVisited:"Visited",notePrompt:"Enter visit observations and vitals note for {name}:",notesSaved:"Visit note saved locally!",emptyNotice:"No visits found matching the selected filters.",pendingSync:"visits stored locally in offline queue",labelUrgent:"Urgent",labelDueToday:"Due today",labelOverdue:"Overdue",labelUpcoming:"Upcoming",doneLabel:"Done",pendingLabel:"Pending"},ht={due:"Due",overdue:"Overdue",upcoming:"Upcoming",urgent:"Urgent"},bt={title:"Hardware Footprint & Offline Benchmark",subtitle:"Measured on standard CPU environment without neural model weights.",metricModelSize:"Model Size on Disk",metricRam:"Peak RAM Usage",metricLatency:"Median CPU Latency",metricP95:"p95 Latency",metricOffline:"100% Offline Capability",zeroNeuralNotice:"Zero neural model footprint: runs completely inside browser memory with instant cold start."},ft={architectureHeading:"Performance Architecture",benchmarkHeading:"Live Browser Benchmark Suite",benchmarkDesc:"Run 10 frontline clinical queries sequentially to measure in-browser response time.",btnRun:"Run Live Benchmark",running:"Running benchmark...",completed:"Benchmark Completed",subModel:"Zero Neural Weights (Pure BM25)",subRam:"Full Index in Memory",subLat:"Instant Browser CPU Execution",subOffline:"Service Worker + Static Cache"},yt={kakinada:"Kakinada",east_godavari:"East Godavari",visakhapatnam:"Visakhapatnam",guntur:"Guntur",chittoor:"Chittoor",kurnool:"Kurnool",chandrapuri:"Chandrapuri"},vt={amrapur:"Amrapur",belwadi_tola:"Belwadi Tola",kesarganj:"Kesarganj",dhanpura:"Dhanpura",navagaon_khurd:"Navagaon Khurd",sitapahari:"Sitapahari",sarpavaram:"Sarpavaram",peddapuram_rural:"Peddapuram Rural",thimmapuram:"Thimmapuram",rajahmundry_rural:"Rajahmundry Rural",kadiyam:"Kadiyam",dowleswaram:"Dowleswaram",bheemunipatnam:"Bheemunipatnam",anandapuram:"Anandapuram",padmanabham:"Padmanabham",mangalagiri_rural:"Mangalagiri Rural",tadikonda:"Tadikonda",tenali_west:"Tenali West",chandragiri:"Chandragiri",palamaner:"Palamaner",kuppam_rural:"Kuppam Rural",nandyal_rural:"Nandyal Rural",alur:"Alur",dhone:"Dhone"},St={none_known:"None known",none:"None",hypertension:"Hypertension (High BP)",type2_diabetes:"Type-2 Diabetes",htn_and_dm:"Hypertension & Diabetes",severe_anaemia:"Severe Anaemia (Hb < 7 g/dL)",moderate_anaemia:"Moderate Anaemia",low_birth_weight:"Low Birth Weight (< 2.0 kg)",severe_acute_malnutrition:"Severe Acute Malnutrition (SAM)",moderate_acute_malnutrition:"Moderate Acute Malnutrition (MAM)"},kt={none_known:"None recorded",seasonal_viral_fever:"Seasonal Viral Fever",acute_watery_diarrhoea:"Acute Watery Diarrhoea",urti:"Upper Respiratory Tract Infection",uti_history:"Urinary Tract Infection History"},Ct={no_fever:"No active fever or cold",mild_cold_cough:"Mild cold and cough",intermittent_fever:"Intermittent fever",fever_with_chills:"Fever with chills",fever_with_diarrhoea:"Fever with diarrhoea"},$t={toggleContrast:"High Contrast",pendingSync:"pending"},wt={none_known:"No known drug/food allergies",sulfa_drugs:"Sulfa drugs allergy",dust_allergy:"Dust / pollen allergy",penicillin_allergy:"Penicillin allergy"},xt={up_to_date:"Up to date with schedule",due_for_booster:"Due for Booster Dose",delayed_pentavalent:"Delayed Pentavalent",due_for_mr1:"Due for MR-1 & Vitamin A",fully_immunized:"Fully Immunized"},Tt={btnToday:"Today / Demo Day",completed:"Done",missed:"Missed",planned:"Planned"},At={title:"Monthly Activity & Triage Dashboard",subtitle:"Chandrapuri Block frontline performance overview across past 30 days.",dataBasisNote:"Based on registered population data and locally recorded visits (derived from schedule data).",totalScheduled:"Total Scheduled",completed:"Completed",pendingMissed:"Pending / Missed",completionRate:"Completion Rate",todayUrgentTitle:"Today's Clinical Danger & Overdue Triage",flaggedPatients:"flagged beneficiaries",noUrgentToday:"No urgent alerts flagged today.",trendTitle:"30-Day Daily Activity & Workload Trend",clickBarHint:"Click bar to jump to date",villageBreakdownTitle:"Village Performance Breakdown (Past 30 Days)",progress:"Progress",categorySplitTitle:"Clinical Program Categories",pending:"Pending",derivedNote:"Derived from schedule data and locally recorded visits"},de={appTitle:Xe,tagline:et,online:tt,offline:at,nav:it,beneficiaries:nt,ask:st,samples:ot,card:rt,emergency:lt,filters:ct,categories:dt,pagination:pt,profile:ut,registration:mt,visits:gt,status:ht,perf:bt,perfLive:ft,district:yt,village:vt,condition:St,infection:kt,fever:Ct,header:$t,allergy:wt,immunization:xt,dateNav:Tt,dashboard:At},Et="SwasthyaVani",Ht="फ्रंटलाइन स्वास्थ्य कार्यकर्ताओं का ऑफ़लाइन साथी",_t="ऑनलाइन",Nt="ऑफ़लाइन (स्थानीय इंजन)",Lt={ask:"नैदानिक प्रोटोकॉल",visits:"भ्रमण योजना",beneficiaries:"लाभार्थी",dashboard:"डैशबोर्ड",perf:"हार्डवेयर फुटप्रिंट"},Mt={title:"लाभार्थी",subtitle:"लाभार्थियों को देखें और नए लाभार्थी जोड़ें"},Pt={title:"नैदानिक प्रोटोकॉल प्रश्न",subtitle:"अपना प्रश्न, लक्षण या समस्या हिंदी, अंग्रेजी या तेलुगु में दर्ज करें।",placeholder:"उदा. गर्भवती महिला को खून आ रहा है, मुझे डेंगू है, या चौथा ANC कब करवाना होता है...",btnSubmit:"प्रोटोकॉल में खोजें",btnVoice:"वॉइस इनपुट (हिंदी / अंग्रेजी / तेलुगु)",listening:"सुन रहे हैं... कृपया बोलें",voiceOfflineMsg:"इस डिवाइस पर वॉइस के लिए इंटरनेट आवश्यक है। कृपया अपना प्रश्न टाइप करें।",voiceNetError:"वॉइस कनेक्शन विफल रहा। कृपया अपना प्रश्न टाइप करें।",voicePermissionDenied:"माइक अनुमति अस्वीकृत। कृपया अपना प्रश्न टाइप करें।",recentQueries:"प्रमुख फ्रंटलाइन नैदानिक स्थितियां एवं प्रश्न"},Dt={catPregnancy:"गर्भावस्था देखभाल",catNewborn:"नवजात शिशु स्वास्थ्य",catChild:"बाल स्वास्थ्य एवं दस्त",catSeasonal:"मौसमी बीमारियां एवं बुखार",catNcd:"बीपी एवं मधुमेह (NCD)",catRefusal:"दवा प्रिस्क्रिप्शन सीमाएं",catAnc:"गर्भावस्था देखभाल (ANC)",catHbnc:"नवजात शिशु देखभाल (HBNC)",catChd:"बाल स्वास्थ्य एवं बीमारियां (CHD)",catNut:"पोषण एवं वृद्धि निगरानी",catImm:"टीकाकरण समय-सारणी (IMM)",catEsc:"आपातकालीन खतरे के लक्षण"},qt={escalateTitle:"आपातकालीन खतरे का संकेत — तुरंत अस्पताल रेफर करें",escalateAction:"बिल्कुल देरी न करें। तुरंत 108 या 102 पर कॉल करें और चंद्रपुरी जिला अस्पताल के लिए वाहन की व्यवस्था करें।",refusalTitle:"फ्रंटलाइन कार्यकर्ता के अधिकार क्षेत्र से बाहर",refusalAction:"यह जांच दवाओं की खुराक, चिकित्सा निदान या अनिर्धारित उपचार से संबंधित है। तुरंत प्राथमिक स्वास्थ्य केंद्र (PHC) के चिकित्सा अधिकारी / एएनएम को रेफर करें।",answerTitle:"प्रोटोकॉल-आधारित नैदानिक मार्गदर्शन",seasonalTitle:"सत्यापित मौसमी एवं क्षेत्रीय स्वास्थ्य मार्गदर्शन",fallbackTitle:"नैदानिक मार्गदर्शन एवं रेफरल मूल्यांकन",fallbackMessage:"यह विशिष्ट बीमारी मानक फ्रंटलाइन प्रोटोकॉल में शामिल नहीं है। सामान्य आपातकालीन खतरे के संकेतों की जांच करें और तुरंत PHC चिकित्सा अधिकारी को रेफर करें।",unverifiedNotice:"सार्वजनिक स्वास्थ्य दिशा-निर्देशों पर आधारित प्रारंभिक सलाह। चिकित्सक द्वारा पुष्टि आवश्यक है।",citation:"आधिकारिक प्रोटोकॉल संदर्भ",latency:"प्रतिक्रिया समय",btnListen:"मार्गदर्शन सुनें",btnPause:"रोकें",btnResume:"जारी रखें",btnStop:"समाप्त करें",playing:"ऑडियो मार्गदर्शन सुनाया जा रहा है...",voiceUnavailable:"इस डिवाइस पर हिंदी वॉइस सिंथेसिस स्थापित नहीं है। कृपया सेटिंग्स जांचें।"},Rt={ambulance:"108 (एम्बुलेंस)",pregnancyTransport:"102 (गर्भवती परिवहन)"},It={title:"लाभार्थी फिल्टर करें",districtLabel:"जिला",villageLabel:"गाँव",categoryLabel:"नैदानिक श्रेणी",allDistricts:"सभी जिले",allVillages:"सभी गाँव",allCategories:"सभी श्रेणियां",searchPlaceholder:"आईडी, घर, नाम या गाँव से खोजें...",clearFilters:"फिल्टर हटाएं",resultsCount:"{count} लाभार्थी प्रदर्शित",emptyResults:"चुने गए फिल्टर के अनुसार कोई लाभार्थी नहीं मिला।"},Vt={anc:"गर्भावस्था जांच (ANC)",ancTooltip:"मातृ स्वास्थ्य ट्रैकिंग, 4 एएनसी जांच, आयरन फोलिक एसिड गोलियां, टिटनेस का टीका",hbnc:"नवजात शिशु गृह भ्रमण (HBNC)",hbncTooltip:"नवजात शिशु के घर पर भ्रमण: 1, 3, 7, 14, 21, 28, 42 दिनों में",imm:"टीकाकरण (IMM)",immTooltip:"राष्ट्रीय टीकाकरण समय-सारणी: जन्म से लेकर 5 वर्ष तक",nut:"बाल पोषण (NUT)",nutTooltip:"गंभीर कुपोषण के लिए मध्य बांह परिधि (MUAC) और सूजन की जांच",ncd:"बीपी एवं शुगर फॉलो-अप (NCD)",ncdTooltip:"उच्च रक्तचाप और मधुमेह की नियमित जांच एवं दवा अनुपालन",high_risk:"उच्च जोखिम वाले मामले",high_riskTooltip:"तत्काल ध्यान या चिकित्सा अधिकारी की निगरानी वाले प्राथमिकता मामले",general:"सामान्य लाभार्थी",generalTooltip:"पारिवारिक स्वास्थ्य निगरानी के लिए पंजीकृत सामान्य परिवार सदस्य"},Bt={prev:"पिछला",next:"अगला",pageIndicator:"पृष्ठ {current} / {total}"},Ot={modalTitle:"लाभार्थी विवरण",close:"बंद करें",demographics:"व्यक्तिगत विवरण",patientId:"रोगी पहचान संख्या (ID)",householdId:"परिवार पहचान संख्या",houseNo:"मकान संख्या",age:"उम्र",years:"वर्ष",days:"दिन",gender:"लिंग",female:"महिला",male:"पुरुष",village:"गाँव",district:"जिला",assignedAsha:"निर्दिष्ट आशा कार्यकर्ता",assignedAnm:"निर्दिष्ट एएनएम",notRecorded:"दर्ज नहीं है",currentVitals:"वर्तमान स्वास्थ्य संकेत एवं स्थिति",vitals:"स्वास्थ्य माप",pastHistory:"पिछला चिकित्सा इतिहास",pastDiseases:"पुरानी बीमारियां",infectionHistory:"संक्रमण का इतिहास",feverColdHistory:"बुखार / सर्दी का इतिहास",allergies:"एलर्जी",immunisationHistory:"टीकाकरण स्थिति",whyOnList:"भ्रमण का कारण",nextDueDate:"अगली देय तिथि",pastNotes:"पिछले भ्रमण का विवरण",medicationSection:"मान्यता प्राप्त प्रोटोकॉल एवं देखभाल",citationLabel:"प्रोटोकॉल संदर्भ",btnListen:"नैदानिक सारांश सुनें",btnPause:"ऑडियो रोकें",btnStop:"ऑडियो समाप्त करें",syntheticDisclaimer:"नोट: अतिरिक्त नैदानिक इतिहास एवं जिला रिकॉर्ड हैकाथॉन मूल्यांकन हेतु निर्मित हैं।"},jt={title:"नया लाभार्थी जोड़ें",subtitle:"ऑफ़लाइन भ्रमण और ट्रैकिंग के लिए नए परिवार के सदस्य को पंजीकृत करें।",nameLabel:"पूरा नाम",namePlaceholder:"लाभार्थी का पूरा नाम दर्ज करें",ageLabel:"उम्र (वर्षों में)",agePlaceholder:"उम्र (जैसे: 24)",genderLabel:"लिंग",female:"महिला",male:"पुरुष",districtLabel:"जिला",villageLabel:"गाँव",ashaLabel:"निर्दिष्ट आशा कार्यकर्ता",categoryLabel:"नैदानिक श्रेणी",lmpLabel:"अंतिम माहवारी की तारीख (यदि गर्भवती हैं)",dobLabel:"जन्म तिथि (यदि शिशु / बालक हैं)",notesLabel:"प्रारंभिक नैदानिक टिप्पणियां",notesPlaceholder:"लक्षण, खतरे के संकेत या मौजूदा स्वास्थ्य स्थिति दर्ज करें...",btnSubmit:"पंजीकृत करें और सूची में जोड़ें",successMsg:"लाभार्थी सफलतापूर्वक पंजीकृत हो गया! ऑफ़लाइन सिंक सूची में सुरक्षित किया गया।",errorMsg:"कृपया मान्य नाम, उम्र, गाँव और श्रेणी प्रदान करें।",badgeSimulated:"स्थानीय भंडारण सूची"},zt={title:"दैनिक प्राथमिकता भ्रमण",subtitle:"फ्रंटलाइन गृह भ्रमणों को निर्धारित करें और प्राथमिकता दें",dateNotice:"मूल्यांकन हेतु आधार तिथि: 2026-10-26",totalDue:"कुल देय / अतिदेय भ्रमण",statTotal:"कुल भ्रमण",statUrgent:"अतिदेय / आपातकालीन भ्रमण",statOverdue:"देय तिथि पार भ्रमण",filterAll:"सभी भ्रमण",filterP1:"प्राथमिकता 1 (अत्यावश्यक)",filterP2:"प्राथमिकता 2 (सामान्य देय)",filterP3:"प्राथमिकता 3 (आगामी समय-सीमा)",searchPlaceholder:"नाम, आईडी या गाँव से भ्रमण खोजें...",groupByVillage:"गाँव के अनुसार समूह बनाएं",allVillagesGroup:"सभी गाँव (संयुक्त सूची)",progressLabel:"आज पूर्ण हुए भ्रमण: {total} में से {done}",selectDate:"तारीख बदलें",btnPrint:"दैनिक कार्यक्रम प्रिंट करें",colMember:"लाभार्थी",colVillage:"गाँव / घर",colDue:"आवश्यक जांच",colStatus:"स्थिति",colPriority:"प्राथमिकता",btnLogNote:"टिप्पणी लिखें",btnMarkVisited:"भ्रमण पूर्ण चिह्नित करें",badgeVisited:"भ्रमण पूर्ण",notePrompt:"{name} के लिए भ्रमण विवरण और स्वास्थ्य स्थिति दर्ज करें:",notesSaved:"भ्रमण विवरण स्थानीय रूप से सुरक्षित हो गया!",emptyNotice:"चुने गए फिल्टर के अनुसार कोई भ्रमण नहीं मिला।",pendingSync:"भ्रमण ऑफ़लाइन सिंक सूची में सुरक्षित हैं",labelUrgent:"अत्यावश्यक",labelDueToday:"आज नियत",labelOverdue:"अतिदेय",labelUpcoming:"आगामी",doneLabel:"पूर्ण",pendingLabel:"लंबित"},Ut={due:"नियत",overdue:"अतिदेय",upcoming:"आगामी",urgent:"अत्यावश्यक"},Ft={title:"हार्डवेयर फुटप्रिंट एवं ऑफ़लाइन बेंचमार्क",subtitle:"न्यूरल नेटवर्क भार के बिना साधारण सीपीयू वातावरण पर मापा गया।",metricModelSize:"डिस्क पर मॉडल का आकार",metricRam:"अधिकतम रैम उपयोग",metricLatency:"औसत सीपीयू समय",metricP95:"p95 समय",metricOffline:"100% ऑफ़लाइन क्षमता",zeroNeuralNotice:"शून्य न्यूरल मॉडल आकार: ब्राउज़र मेमोरी के अंदर तुरंत शुरू होता है।"},Gt={architectureHeading:"प्रदर्शन संरचना",benchmarkHeading:"लाइव ब्राउज़र बेंचमार्क",benchmarkDesc:"ब्राउज़र प्रतिक्रिया समय मापने के लिए लगातार 10 नैदानिक प्रश्न चलाएं।",btnRun:"लाइव बेंचमार्क चलाएं",running:"परीक्षण चल रहा है...",completed:"बेंचमार्क पूर्ण हुआ",subModel:"शून्य न्यूरल भार (विशुद्ध BM25)",subRam:"पूरी अनुक्रमणिका मेमोरी में",subLat:"त्वरित ब्राउज़र निष्पादन",subOffline:"सर्विस वर्कर + स्थानीय कैश"},Kt={kakinada:"काकीनाडा",east_godavari:"पूर्वी गोदावरी",visakhapatnam:"विशाखापत्तनम",guntur:"गुंटूर",chittoor:"चित्तूर",kurnool:"कुरनूल",chandrapuri:"चंद्रपुरी"},Wt={amrapur:"आम्रपुर",belwadi_tola:"बेलवाड़ी टोला",kesarganj:"केसरगंज",dhanpura:"धनपुरा",navagaon_khurd:"नवगांव खुर्द",sitapahari:"सीतापहाड़ी",sarpavaram:"सर्पवरम",peddapuram_rural:"पेद्दापुरम ग्रामीण",thimmapuram:"थिम्मापुरम",rajahmundry_rural:"राजमुंदरी ग्रामीण",kadiyam:"कडियम",dowleswaram:"धवलेश्वरम",bheemunipatnam:"भीमुनिपटनम",anandapuram:"आनंदपुरम",padmanabham:"पद्मनाभम",mangalagiri_rural:"मंगलगिरि ग्रामीण",tadikonda:"ताड़ीकोंडा",tenali_west:"तेनाली पश्चिम",chandragiri:"चंद्रगिरि",palamaner:"पलमानेर",kuppam_rural:"कुप्पम ग्रामीण",nandyal_rural:"नंद्याल ग्रामीण",alur:"आलूर",dhone:"डोन"},Qt={none_known:"कोई ज्ञात नहीं",none:"कोई नहीं",hypertension:"उच्च रक्तचाप (बीपी)",type2_diabetes:"टाइप-2 मधुमेह (शुगर)",htn_and_dm:"उच्च रक्तचाप एवं मधुमेह",severe_anaemia:"गंभीर एनीमिया (Hb < 7 g/dL)",moderate_anaemia:"मध्यम एनीमिया",low_birth_weight:"कम वजन का शिशु (< 2.0 kg)",severe_acute_malnutrition:"गंभीर कुपोषण (SAM)",moderate_acute_malnutrition:"मध्यम कुपोषण (MAM)"},Jt={none_known:"कोई दर्ज नहीं",seasonal_viral_fever:"मौसमी वायरल बुखार",acute_watery_diarrhoea:"गंभीर दस्त",urti:"श्वसन तंत्र संक्रमण",uti_history:"मूत्र संक्रमण का इतिहास"},Yt={no_fever:"कोई बुखार या सर्दी नहीं",mild_cold_cough:"हल्की सर्दी एवं खांसी",intermittent_fever:"रुक-रुक कर आने वाला बुखार",fever_with_chills:"कंपकंपी के साथ बुखार",fever_with_diarrhoea:"दस्त के साथ बुखार"},Zt={toggleContrast:"उच्च कंट्रास्ट",pendingSync:"लंबित"},Xt={none_known:"कोई दवा/भोजन एलर्जी नहीं",sulfa_drugs:"सल्फा दवाओं से एलर्जी",dust_allergy:"धूल / पराग से एलर्जी",penicillin_allergy:"पेनिसिलिन से एलर्जी"},ea={up_to_date:"समय पर टीकाकरण पूर्ण",due_for_booster:"बूस्टर खुराक देय है",delayed_pentavalent:"पेंटावेलेंट में देरी",due_for_mr1:"MR-1 एवं विटामिन ए देय है",fully_immunized:"पूर्ण प्रतिरक्षित"},ta={btnToday:"आज / डेमो दिवस",completed:"पूर्ण",missed:"छूटे हुए",planned:"नियोजित"},aa={title:"मासिक गतिविधि एवं डैशबोर्ड",subtitle:"पिछले 30 दिनों में चंद्रपुरी ब्लॉक फ्रंटलाइन प्रदर्शन की समीक्षा।",dataBasisNote:"कार्यक्रम डेटा और स्थानीय रूप से दर्ज भ्रमणों के आधार पर तैयार।",totalScheduled:"कुल निर्धारित भ्रमण",completed:"पूर्ण हुए भ्रमण",pendingMissed:"लंबित / छूटे हुए भ्रमण",completionRate:"पूर्णता दर",todayUrgentTitle:"आज के आपातकालीन खतरे एवं अतिदेय जांच",flaggedPatients:"चिह्नित लाभार्थी",noUrgentToday:"आज कोई आपातकालीन चेतावनी नहीं है।",trendTitle:"30-दिवसीय दैनिक गतिविधि एवं कार्यभार रुझान",clickBarHint:"तिथि पर जाने के लिए बार पर क्लिक करें",villageBreakdownTitle:"गाँव अनुसार प्रदर्शन विवरण (पिछले 30 दिन)",progress:"प्रगति",categorySplitTitle:"नैदानिक कार्यक्रम श्रेणियां",pending:"लंबित",derivedNote:"कार्यक्रम डेटा एवं स्थानीय भ्रमणों के आधार पर तैयार"},ia={appTitle:Et,tagline:Ht,online:_t,offline:Nt,nav:Lt,beneficiaries:Mt,ask:Pt,samples:Dt,card:qt,emergency:Rt,filters:It,categories:Vt,pagination:Bt,profile:Ot,registration:jt,visits:zt,status:Ut,perf:Ft,perfLive:Gt,district:Kt,village:Wt,condition:Qt,infection:Jt,fever:Yt,header:Zt,allergy:Xt,immunization:ea,dateNav:ta,dashboard:aa},na="SwasthyaVani",sa="ఫ్రంట్‌లైన్ ఆరోగ్య కార్యకర్తల ఆఫ్‌లైన్ సహచరి",oa="ఆన్‌లైన్",ra="ఆఫ్‌లైన్ (లోకల్ ఇంజిన్)",la={ask:"క్లినికల్ ప్రోటోకాల్స్",visits:"సందర్శన ప్రణాళిక",beneficiaries:"లబ్ధిదారులు",dashboard:"డ్యాష్‌బోర్డ్",perf:"హార్డ్‌వేర్ కొలతలు"},ca={title:"లబ్ధిదారులు",subtitle:"లబ్ధిదారులను చూడండి మరియు నమోదు చేయండి"},da={title:"క్లినికల్ ప్రోటోకాల్ ప్రశ్న",subtitle:"మీ ప్రశ్న, లక్షణాలు లేదా సమస్యను తెలుగు, ఇంగ్లీష్ లేదా హిందీలో నమోదు చేయండి.",placeholder:"ఉదాహరణ: గర్భిణీ స్త్రీకి రక్తస్రావం అవుతోంది, డెంగ్యూ లక్షణాలు, 4వ ANC ఎప్పుడు చేయించాలి...",btnSubmit:"ప్రోటోకాల్స్‌లో వెతకండి",btnVoice:"వాయిస్ ఇన్‌పుట్ (తెలుగు / ఇంగ్లీష్ / హిందీ)",listening:"వింటున్నాము... మాట్లాడండి",voiceOfflineMsg:"ఈ పరికరంలో వాయిస్‌కి ఇంటర్నెట్ అవసరం. దయచేసి మీ ప్రశ్నను టైప్ చేయండి.",voiceNetError:"వాయిస్ కనెక్షన్ విఫలమైంది. దయచేసి మీ ప్రశ్నను టైప్ చేయండి.",voicePermissionDenied:"మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. దయచేసి మీ ప్రశ్నను టైప్ చేయండి.",recentQueries:"ముఖ్యమైన క్లినికల్ పరిస్థితులు మరియు ప్రశ్నలు"},pa={catPregnancy:"గర్భధారణ సంరక్షణ",catNewborn:"నవజాత శిశు ఆరోగ్యం",catChild:"పిల్లల ఆరోగ్యం & విరేచనాలు",catSeasonal:"కాలానుగుణ వ్యాధులు & జ్వరాలు",catNcd:"బీపీ & మధుమేహం (NCD)",catRefusal:"మందుల ప్రిస్క్రిప్షన్ పరిమితులు",catAnc:"గర్భధారణ సంరక్షణ (ANC)",catHbnc:"నవజాత శిశు సంరక్షణ (HBNC)",catChd:"పిల్లల అనారోగ్యాలు (CHD)",catNut:"పోషకాహారం & ఎదుగుదల పర్యవేక్షణ",catImm:"టీకాల షెడ్యూల్ (IMM)",catEsc:"అత్యవసర ప్రమాద సంకేతాలు"},ua={escalateTitle:"అత్యవసర ప్రమాద సంకేతం — వెంటనే ఆసుపత్రికి తరలించండి",escalateAction:"ఆలస్యం చేయవద్దు. వెంటనే 108 లేదా 102 కి కాల్ చేసి చంద్రపురి జిల్లా ఆసుపత్రికి తరలించండి.",refusalTitle:"ఫ్రంట్‌లైన్ పరిధికి మించినది",refusalAction:"ఈ విచారణ వైద్య మందుల మోతాదు లేదా రోగ నిర్ధారణకు సంబంధించినది. వెంటనే ప్రాథమిక ఆరోగ్య కేంద్రం (PHC) వైద్య అధికారికి సిఫార్సు చేయండి.",answerTitle:"ప్రోటోకాల్ ఆధారిత క్లినికల్ మార్గదర్శకత్వం",seasonalTitle:"ధృవీకరించబడిన కాలానుగుణ మరియు ప్రాంతీయ ఆరోగ్య మార్గదర్శకాలు",fallbackTitle:"క్లినికల్ మార్గదర్శకత్వం మరియు రిఫరల్ అంచనా",fallbackMessage:"ఈ నిర్దిష్ట వ్యాధి ప్రామాణిక ఫ్రంట్‌లైన్ ప్రోటోకాల్స్‌లో లేదు. సాధారణ అత్యవసర ప్రమాద సంకేతాలను తనిఖీ చేసి, వెంటనే PHC వైద్య అధికారికి సిఫార్సు చేయండి.",unverifiedNotice:"ప్రజా ఆరోగ్య మార్గదర్శకాలపై ఆధారపడిన ప్రాథమిక సూచన. వైద్యుని పరిశీలన అవసరం.",citation:"అధికారిక ప్రోటోకాల్ రిఫరెన్స్",latency:"ప్రతిస్పందన సమయం",btnListen:"వినండి",btnPause:"నిలపండి",btnResume:"కొనసాగించండి",btnStop:"ఆపండి",playing:"ఆడియో వినిపిస్తోంది...",voiceUnavailable:"ఈ పరికరంలో తెలుగు వాయిస్ సింథసిస్ ఇన్‌స్టాల్ చేయబడలేదు. దయచేసి సెట్టింగ్స్‌లో తనిఖీ చేయండి."},ma={ambulance:"108 (అంబులెన్స్)",pregnancyTransport:"102 (గర్భిణీల రవాణా వాహనం)"},ga={title:"లబ్ధిదారులను ఫిల్టర్ చేయండి",districtLabel:"జిల్లా",villageLabel:"గ్రామం",categoryLabel:"క్లినికల్ విభాగం",allDistricts:"అన్ని జిల్లాలు",allVillages:"అన్ని గ్రామాలు",allCategories:"అన్ని విభాగాలు",searchPlaceholder:"ఐడీ, ఇల్లు, పేరు లేదా గ్రామం ద్వారా వెతకండి...",clearFilters:"ఫిల్టర్లు తొలగించండి",resultsCount:"{count} మంది లబ్ధిదారులు కనుగొనబడ్డారు",emptyResults:"ఎంచుకున్న ఫిల్టర్లకు తగిన లబ్ధిదారులు లేరు."},ha={anc:"గర్భధారణ పరీక్షలు (ANC)",ancTooltip:"తల్లి ఆరోగ్య పరిశీలన, 4 ANC పరీక్షలు, ఐరన్ ఫోలిక్ యాసిడ్ మాత్రలు, టీటీ టీకా",hbnc:"నవజాత శిశు గృహ సందర్శనలు (HBNC)",hbncTooltip:"నవజాత శిశువు ఇంటి సందర్శనలు: 1, 3, 7, 14, 21, 28, 42 రోజుల్లో",imm:"టీకాలు (IMM)",immTooltip:"జాతీయ రోగనిరోధక టీకాల పట్టిక: పుట్టినప్పటి నుండి 5 సంవత్సరాల వరకు",nut:"పిల్లల పోషకాహారం (NUT)",nutTooltip:"మధ్య చేయి చుట్టుకొలత (MUAC) మరియు రెండు పాదాల వాపు తనిఖీ",ncd:"బీపీ మరియు షుగర్ ఫాలో-అప్ (NCD)",ncdTooltip:"అధిక రక్తపోటు మరియు మధుమేహం పరీక్షలు మరియు నెలవారీ మందుల వాడకం",high_risk:"అధిక ప్రమాద కేసులు",high_riskTooltip:"తక్షణ శ్రద్ధ లేదా వైద్య అధికారి పర్యవేక్షణ అవసరమైన ముఖ్యమైన కేసులు",general:"సాధారణ లబ్ధిదారు",generalTooltip:"కుటుంబ ఆరోగ్య పర్యవేక్షణ కోసం నమోదైన సాధారణ కుటుంబ సభ్యుడు"},ba={prev:"మునుపటిది",next:"తరువాతిది",pageIndicator:"పేజీ {current} / {total}"},fa={modalTitle:"లబ్ధిదారు వివరాలు",close:"మూసివేయండి",demographics:"వ్యక్తిగత వివరాలు",patientId:"రోగి గుర్తింపు సంఖ్య (ID)",householdId:"కుటుంబ సంఖ్య",houseNo:"ఇంటి నంబరు",age:"వయస్సు",years:"సంవత్సరాలు",days:"రోజులు",gender:"లింగం",female:"స్త్రీ",male:"పురుషుడు",village:"గ్రామం",district:"జిల్లా",assignedAsha:"కేటాయించిన ఆశా కార్యకర్త",assignedAnm:"కేటాయించిన ఏఎన్ఎం",notRecorded:"నమోదు కాలేదు",currentVitals:"ప్రస్తుత ఆరోగ్య స్థితి & సంకేతాలు",vitals:"ఆరోగ్య కొలతలు",pastHistory:"గత వైద్య చరిత్ర",pastDiseases:"గత దీర్ఘకాలిక వ్యాధులు",infectionHistory:"ఇన్‌ఫెక్షన్ల చరిత్ర",feverColdHistory:"జ్వరం / జలుబు చరిత్ర",allergies:"అలర్జీలు",immunisationHistory:"టీకాల స్థితి",whyOnList:"సందర్శన కారణం",nextDueDate:"తదుపరి గడువు తేదీ",pastNotes:"గత సందర్శనల వివరాలు",medicationSection:"అనుమతించబడిన సంరక్షణ & ప్రోటోకాల్",citationLabel:"ప్రోటోకాల్ రిఫరెన్స్",btnListen:"సారాంశం వినండి",btnPause:"ఆడియో నిలపండి",btnStop:"ఆడియో ఆపండి",syntheticDisclaimer:"గమనిక: అదనపు క్లినికల్ చరిత్ర మరియు జిల్లా రికార్డులు డెమో ప్రయోజనాల కొరకు రూపొందించబడ్డాయి."},ya={title:"కొత్త లబ్ధిదారుని నమోదు",subtitle:"ఆఫ్‌లైన్ సందర్శనల కోసం కొత్త కుటుంబ సభ్యుడి వివరాలను నమోదు చేయండి.",nameLabel:"పూర్తి పేరు",namePlaceholder:"లబ్ధిదారుని పూర్తి పేరు నమోదు చేయండి",ageLabel:"వయస్సు (సంవత్సరాలలో)",agePlaceholder:"వయస్సు (ఉదాహరణకు: 24)",genderLabel:"లింగం",female:"స్త్రీ",male:"పురుషుడు",districtLabel:"జిల్లా",villageLabel:"గ్రామం",ashaLabel:"కేటాయించిన ఆశా కార్యకర్త",categoryLabel:"క్లినికల్ విభాగం",lmpLabel:"చివరి రుతుక్రమ తేదీ (గర్భిణీ అయితే)",dobLabel:"పుట్టిన తేదీ (శిశువు / పిల్లలు అయితే)",notesLabel:"ప్రారంభ క్లినికల్ గమనికలు",notesPlaceholder:"లక్షణాలు, ప్రమాద సంకేతాలు లేదా ప్రస్తుత పరిస్థితిని నమోదు చేయండి...",btnSubmit:"నమోదు చేసి షెడ్యూల్ చేయండి",successMsg:"లబ్ధిదారు విజయవంతంగా నమోదు చేయబడ్డారు! ఆఫ్‌లైన్ సింక్ క్యూలో భద్రపరచబడింది.",errorMsg:"దయచేసి సరైన పేరు, వయస్సు, గ్రామం మరియు విభాగాన్ని నమోదు చేయండి.",badgeSimulated:"స్థానిక నిల్వ క్యూ"},va={title:"రోజువారీ ప్రాధాన్యతా సందర్శనలు",subtitle:"ఫ్రంట్‌లైన్ గృహ సందర్శనలను షెడ్యూల్ చేయండి మరియు ప్రాధాన్యత ఇవ్వండి",dateNotice:"మూల్యాంకనం చేయబడిన తేదీ: 2026-10-26",totalDue:"మొత్తం గడువు ముగిసిన సందర్శనలు",statTotal:"మొత్తం సందర్శనలు",statUrgent:"అత్యవసర సందర్శనలు",statOverdue:"గడువు దాటిన సందర్శనలు",filterAll:"అన్ని సందర్శనలు",filterP1:"ప్రాధాన్యత 1 (అత్యవసరం)",filterP2:"ప్రాధాన్యత 2 (సాధారణ గడువు)",filterP3:"ప్రాధాన్యత 3 (రాబోయే గడువు)",searchPlaceholder:"పేరు, ఐడీ లేదా గ్రామం ద్వారా సందర్శనలను వెతకండి...",groupByVillage:"గ్రామాల వారీగా గ్రూప్ చేయండి",allVillagesGroup:"అన్ని గ్రామాలు (సాధారణ జాబితా)",progressLabel:"ఈరోజు పూర్తయిన సందర్శనలు: {total} లో {done}",selectDate:"తేదీ మార్చండి",btnPrint:"రోజువారీ షెడ్యూల్ ముద్రించండి",colMember:"లబ్ధిదారు",colVillage:"గ్రామం / ఇల్లు",colDue:"చేయవలసిన పని",colStatus:"స్థితి",colPriority:"ప్రాధాన్యత",btnLogNote:"నోట్ రాయండి",btnMarkVisited:"సందర్శించినట్లు గుర్తించండి",badgeVisited:"సందర్శించారు",notePrompt:"{name} కోసం సందర్శన గమనికలు మరియు ఆరోగ్య స్థితిని నమోదు చేయండి:",notesSaved:"సందర్శన వివరాలు స్థానికంగా భద్రపరచబడ్డాయి!",emptyNotice:"ఎంచుకున్న ఫిల్టర్లకు సరిపోలే సందర్శనలు లేవు.",pendingSync:"సందర్శనలు ఆఫ్‌లైన్ క్యూలో ఉన్నాయి",labelUrgent:"అత్యవసరం",labelDueToday:"ఈరోజు చేయవలసినవి",labelOverdue:"గడువు ముగిసినవి",labelUpcoming:"రాబోయేవి",doneLabel:"పూర్తయింది",pendingLabel:"బాకీ ఉంది"},Sa={due:"గడువు ఉంది",overdue:"గడువు దాటింది",upcoming:"రాబోయేది",urgent:"అత్యవసరం"},ka={title:"హార్డ్‌వేర్ కొలతలు & ఆఫ్‌లైన్ పనితీరు",subtitle:"న్యూరల్ నెట్‌వర్క్ బరువులు లేకుండా సాధారణ CPU పరికరంలో కొలవబడింది.",metricModelSize:"డిస్క్ స్పేస్ పరిమాణం",metricRam:"గరిష్ట RAM వినియోగం",metricLatency:"సగటు CPU సమయం",metricP95:"p95 సమయం",metricOffline:"100% ఆఫ్‌లైన్ సామర్థ్యం",zeroNeuralNotice:"న్యూరల్ మోడల్ పరిమాణం సున్నా: బ్రౌజర్ మెమరీలోనే నేరుగా తక్షణమే నడుస్తుంది."},Ca={architectureHeading:"పనితీరు నిర్మాణం",benchmarkHeading:"లైవ్ బ్రౌజర్ బెంచ్‌మార్క్",benchmarkDesc:"బ్రౌజర్ ప్రతిస్పందన సమయాన్ని కొలవడానికి వరుసగా 10 క్లినికల్ ప్రశ్నలను పరీక్షించండి.",btnRun:"లైవ్ బెంచ్‌మార్క్ ప్రారంభించండి",running:"పరీక్షిస్తున్నాము...",completed:"బెంచ్‌మార్క్ పూర్తయింది",subModel:"న్యూరల్ మోడల్స్ లేవు (స్వచ్ఛమైన BM25)",subRam:"మొత్తం ఇండెక్స్ మెమరీలోనే ఉంది",subLat:"క్షణాల్లో బ్రౌజర్ ప్రతిస్పందన",subOffline:"సర్వీస్ వర్కర్ + లోకల్ క్యాష్"},$a={kakinada:"కాకినాడ",east_godavari:"తూర్పు గోదావరి",visakhapatnam:"విశాఖపట్నం",guntur:"గుంటూరు",chittoor:"చిత్తూరు",kurnool:"కర్నూలు",chandrapuri:"చంద్రపురి"},wa={amrapur:"ఆమ్రపూర్",belwadi_tola:"బెల్వాడి తోలా",kesarganj:"కేసర్‌గంజ్",dhanpura:"ధన్‌పురా",navagaon_khurd:"నవగావ్ ఖుర్ద్",sitapahari:"సీతాపహాడి",sarpavaram:"సర్పవరం",peddapuram_rural:"పెద్దాపురం రూరల్",thimmapuram:"తిమ్మాపురం",rajahmundry_rural:"రాజమండ్రి రూరల్",kadiyam:"కడియం",dowleswaram:"ధవళేశ్వరం",bheemunipatnam:"భీమునిపట్నం",anandapuram:"ఆనందపురం",padmanabham:"పద్మనాభం",mangalagiri_rural:"మంగళగిరి రూరల్",tadikonda:"తాడికొండ",tenali_west:"తెనాలి పశ్చిమ",chandragiri:"చంద్రగిరి",palamaner:"పలమనేరు",kuppam_rural:"కుప్పం రూరల్",nandyal_rural:"నంద్యాల రూరల్",alur:"ఆలూరు",dhone:"డోన్"},xa={none_known:"ఏమీ లేవు",none:"ఏమీ లేవు",hypertension:"అధిక రక్తపోటు (బీపీ)",type2_diabetes:"టైప్-2 మధుమేహం (షుగర్)",htn_and_dm:"రక్తపోటు & మధుమేహం",severe_anaemia:"తీవ్ర రక్తహీనత (Hb < 7 g/dL)",moderate_anaemia:"మధ్యస్థ రక్తహీనత",low_birth_weight:"తక్కువ బరువుతో పుట్టిన శిశువు (< 2.0 kg)",severe_acute_malnutrition:"తీవ్ర పోషకాహార లోపం (SAM)",moderate_acute_malnutrition:"మధ్యస్థ పోషకాహార లోపం (MAM)"},Ta={none_known:"నమోదు కాలేదు",seasonal_viral_fever:"కాలానుగుణ వైరల్ జ్వరం",acute_watery_diarrhoea:"తీవ్ర విరేచనాలు",urti:"శ్వాసకోశ ఇన్ఫెక్షన్",uti_history:"యూరినరీ ఇన్ఫెక్షన్ చరిత్ర"},Aa={no_fever:"జ్వరం లేదా జలుబు లేదు",mild_cold_cough:"తేలికపాటి జలుబు మరియు దగ్గు",intermittent_fever:"వచ్చిపోయే జ్వరం",fever_with_chills:"వణుకుతో కూడిన జ్వరం",fever_with_diarrhoea:"విరేచనాలతో కూడిన జ్వరం"},Ea={toggleContrast:"హై కాంట్రాస్ట్",pendingSync:"బాకీ ఉన్నాయి"},Ha={none_known:"ఎలాంటి అలర్జీలు లేవు",sulfa_drugs:"సల్ఫా మందుల అలర్జీ",dust_allergy:"ధూళి / పుప్పొడి అలర్జీ",penicillin_allergy:"పెన్సిలిన్ అలర్జీ"},_a={up_to_date:"సమయానికి టీకాలు పూర్తయ్యాయి",due_for_booster:"బూస్టర్ డోస్ గడువు వచ్చింది",delayed_pentavalent:"పెంటావాలెంట్ ఆలస్యమైంది",due_for_mr1:"MR-1 & విటమిన్ ఎ గడువు వచ్చింది",fully_immunized:"పూర్తిగా రోగనిరోధక టీకాలు పొందారు"},Na={btnToday:"ఈరోజు / డెమో రోజు",completed:"పూర్తయింది",missed:"మిగిలిపోయినవి",planned:"ప్రణాళిక చేయబడినవి"},La={title:"నెలవారీ కార్యాచరణ మరియు డ్యాష్‌బోర్డ్",subtitle:"గత 30 రోజులలో చంద్రపురి బ్లాక్ ఫ్రంట్‌లైన్ పనితీరు సమీక్ష.",dataBasisNote:"షెడ్యూల్ డేటా మరియు స్థానికంగా నమోదు చేయబడిన సందర్శనల ఆధారంగా రూపొందించబడింది.",totalScheduled:"మొత్తం షెడ్యూల్ చేయబడినవి",completed:"పూర్తయినవి",pendingMissed:"బాకీ ఉన్నవి / మిగిలినవి",completionRate:"పూర్తయిన శాతం",todayUrgentTitle:"ఈరోజు అత్యవసర క్లినికల్ ప్రమాదాలు",flaggedPatients:"గుర్తించిన లబ్ధిదారులు",noUrgentToday:"ఈరోజు ఎలాంటి అత్యవసర హెచ్చరికలు లేవు.",trendTitle:"30 రోజుల రోజువారీ కార్యాచరణ ట్రెండ్",clickBarHint:"తేదీకి వెళ్లడానికి బార్‌పై క్లిక్ చేయండి",villageBreakdownTitle:"గ్రామాల వారీగా పనితీరు (గత 30 రోజులు)",progress:"పురోగతి",categorySplitTitle:"క్లినికల్ ప్రోగ్రామ్ విభాగాలు",pending:"బాకీ ఉన్నవి",derivedNote:"షెడ్యూల్ డేటా మరియు స్థానిక సందర్శనల ఆధారంగా రూపొందించబడింది"},Ma={appTitle:na,tagline:sa,online:oa,offline:ra,nav:la,beneficiaries:ca,ask:da,samples:pa,card:ua,emergency:ma,filters:ga,categories:ha,pagination:ba,profile:fa,registration:ya,visits:va,status:Sa,perf:ka,perfLive:Ca,district:$a,village:wa,condition:xa,infection:Ta,fever:Aa,header:Ea,allergy:Ha,immunization:_a,dateNav:Na,dashboard:La},pe={en:de,hi:ia,te:Ma},q={lang:localStorage.getItem("swasthyavani_lang")||ge.DEFAULT_LANGUAGE,currentTab:"ask",translations:pe[ge.DEFAULT_LANGUAGE],sections:{},index:{},lexicon:{},visits:[],enrichedRegister:[],bm25:null,lastQuery:"",lastResult:null,selectedVisitDate:null};q.translations=pe[q.lang]||de;function ie(){const i=document.getElementById("app");if(!i)return;document.documentElement.lang=q.lang,i.innerHTML="";const t=we(q,n=>{q.lang=n,q.translations=pe[n]||de,localStorage.setItem("swasthyavani_lang",n),ie()},n=>{q.currentTab=n,ie()});i.appendChild(t);const e=document.createElement("main");e.className="app-main",q.currentTab==="ask"?e.appendChild(Me(q)):q.currentTab==="beneficiaries"||q.currentTab==="register"||q.currentTab==="registration"?e.appendChild(Oe(q)):q.currentTab==="visits"?e.appendChild(Je(q)):q.currentTab==="dashboard"?e.appendChild(Ye(q,n=>{q.selectedVisitDate=n,q.currentTab="visits",ie()})):q.currentTab==="perf"&&e.appendChild(Ze(q)),i.appendChild(e)}async function fe(){"serviceWorker"in navigator&&window.location.protocol.startsWith("http")&&navigator.serviceWorker.register("/sw.js").catch(t=>console.warn("[SwasthyaVani] SW registration error:",t));const i=document.getElementById("app");i&&(i.innerHTML=`
      <div class="loading-screen">
        <div class="spinner"></div>
        <p>Loading SwasthyaVani Clinical Protocols...</p>
      </div>
    `);try{const t=await ke();q.sections=t.sections,q.index=t.index,q.lexicon=t.lexicon,q.visits=t.visits,q.enrichedRegister=t.enrichedRegister,q.seasonalPack=t.seasonalPack||[],q.bm25=new $e(t.index,t.lexicon),ie()}catch(t){console.error("[SwasthyaVani] Initialization error:",t),i&&(i.innerHTML=`<div class="error-screen">Failed to initialize offline index: ${t.message}</div>`)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",fe):fe();

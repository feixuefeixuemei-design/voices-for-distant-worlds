// --- 配置区 ---
const airtableTarget = {
    apiKey: 'patbAEE7KdItiL1Tp.603186b6261949ebfd81f5ca2ebeb8cbfbdccc13307f42799785654dca71d4db', 
    baseId: 'appOIIl0kaZiQju8j',
    table: 'Signals' 
};

const archiveUrl = "#";
const placeholderList = [
    "BREATHE INTO VOID...",
    "MEND THE BREACH...",
    "LEAVE A TRACE...",
    "FEED THE HEARTH...",
    "WHISPER TO DUST...",
    "GATHER THE RAIN...",
    "PLANT A WORD...",
    "SUTURE THE SILENCE...",
    "UNFOLD THE MAP...",
    "INVITE THE ECHO..."
];

// 修改点：支持空输入（默认 VOID 逻辑）
async function isValidWord(word) {
    if (!word || word.trim() === "") return true; // 如果为空，允许裂变（使用 VOID）
    if (word.length < 2) return false;
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
        return response.ok;
    } catch (e) {
        return false;
    }
}

// --- 核心逻辑 ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 15000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

let targetZ = 1200, curZ = 1200, mouseX = 0, mouseY = 0;
let targetCameraX = 0, targetCameraY = 0, activeMeshes = [];
let hasFissioned = false;
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

// --- 核心修复：获取双端 UI 元素（兼容手机/电脑） ---
const getInputs = () => [document.getElementById('keyword'), document.getElementById('keyword-m')].filter(el => el !== null);
const getStartBtns = () => [document.getElementById('startBtn'), document.getElementById('startBtn-m')].filter(el => el !== null);
const getPoemBtns = () => [document.getElementById('poemBtn'), document.getElementById('poemBtn-m')].filter(el => el !== null);

const updatePlaceholder = () => {
    const inputs = getInputs();
    if (inputs.length === 0) return;
    const current = inputs[0].placeholder || "";
    let next = rand(placeholderList);
    while(next === current) next = rand(placeholderList);
    inputs.forEach(el => el.placeholder = next);
};
updatePlaceholder();

// 归档链接逻辑
const archiveLink = document.getElementById('archive-link');
if (archiveLink) {
    archiveLink.addEventListener('click', (e) => {
        if (archiveUrl === "#") {
            const display = document.getElementById('poem-display');
            display.innerHTML = '<div class="poem-line" style="opacity:1; filter:blur(0px); font-size:18px; letter-spacing:2px;">[ SYSTEM: PHYSICAL DATA BEING BOUND AT COORDINATE 0,0 ]</div>';
            gsap.fromTo(display.firstChild, { opacity: 0 }, { opacity: 1, duration: 1, onComplete: () => {
                gsap.to(display.firstChild, { opacity: 0, duration: 1, delay: 2 });
            }});
        } else { window.open(archiveUrl, '_blank'); }
    });
}

const personaEngines = {
    insomniac: {
        name: "The Insomniac",
        weight: "900",
        templates: [
            // 方案 1：环境化 (关键词作为背景)
            (w) => `Amidst the echo of ${w.toUpperCase()}, ${rand(["the moon stays", "the room warms", "we return"])}.`,
            
            // 方案 2：转化化 (关键词作为原材料)
            (w) => `Turning the weight of ${w.toUpperCase()} into ${rand(["a soft light", "a golden breath"])}.`,
            
            // 方案 3：并列化 (关键词与温暖意象共存)
            (w) => `${rand(["A quiet lamp", "The smell of tea"])}, and the fading shadow of ${w.toUpperCase()}.`,
            
            // 方案 4：守望化 (关键词是被接纳的对象)
            (w) => `Watching the pulse of ${w.toUpperCase()} until it ${rand(["softens", "finds rest", "turns to gold"])}.`,
            
            // 方案 5：空间化 (关键词被容纳在小房间里)
            (w) => `In this small room, the resonance of ${w.toUpperCase()} ${rand(["grows gentle", "becomes a song", "finds a home"])}.`
        ],
        fragments: [
            "Make time for civilization.",
            "Reshape the moon.",
            "History settles into bones.",
            "Gold among the grit.",
            "Reorder time.",
            "Fire completed it.",
            "Write, and not leave behind.",
            "A posture of leaning away.",
            "Inheriting the tilt.",
            "Knowing what it was like to not be.",
            "No English word for this weight.",
            "Dictionary of blood.",
            "Math is the last resort.",
            "I am the border.",
            "Noise turned into comfort.",
            "Chasing shadows at mid-age.",
            "Belonging is a method.",
            "Nothing is wasted.",
            "Walking alone, together."
        ]
    },
    chef: { 
        name: "The Chef", 
        weight: "700", 
        templates: [
            // 方案 1：极简组合
            (w) => `${rand(["Warm stove", "Shared table"])}. A hint of ${w.toUpperCase()} in the soup.`,
            
            // 方案 2：直接动作（去掉了 until...）
            (w) => `Stirring the weight of ${w.toUpperCase()} into ${rand(["the pot", "a shared bowl"])}.`,
            
            // 方案 3：状态转化（去掉了 in this boiling broth）
            (w) => `The essence of ${w.toUpperCase()} becomes a silent comfort.`,
            
            // 方案 4：并列意象
            (w) => `${rand(["Moonlight tea", "Quiet kitchen"])}. Seasoning the night with ${w.toUpperCase()}.`,
            
            // 方案 5：意境留白
            (w) => `Feeding the fire with ${w.toUpperCase()}, brewing a healing steam.`
        ],
        fragments: [
            "Recipe: unwritten memory.",
            "Taste remains, ingredients change.",
            "Steam over a quiet life.",
            "A pinch of gold.",
            "Feeding the forgotten.",
            "Brine like a silent rite.",
            "Survival, served warm.",
            "A map of places been.",
            "Fire: the first translator.",
            "Stirring to keep ghosts away.",
            "Bitterness before sweetness.",
            "Evolving the recipe.",
            "Tradition is a boiling pot.",
            "Adding water to the salt.",
            "Heat completes the hand.",
            "The body remembers.",
            "Shared steam.",
            "Soul's kitchen.",
            "Moonlight in a tea cup.",
            "Long-simmered truth."
        ] 
    },
    weaver: { 
        name: "The Weaver", 
        weight: "100", 
        templates: [
            // 方案 1：保留原意，精简结构
            (w) => `${rand(["Threads", "Tracing touch"])}. Mending ${w.toUpperCase()} with ${rand(["silk", "pauses"])}.`,
            
            // 方案 2：强调嵌入感，去掉结尾的冗余
            (w) => `Weaving ${w.toUpperCase()} into ${rand(["our pattern", "a line leading home"])}.`,
            
            // 方案 3：强化“温柔缝合”的动作
            (w) => `A soft stitch for the weight of ${w.toUpperCase()}.`,
            
            // 方案 4：意向并列
            (w) => `${rand(["Unwritten loom", "Warm skin"])}. Softening the edges of ${w.toUpperCase()}.`,
            
            // 方案 5：留白式写法
            (w) => `Tracing the ghost of ${w.toUpperCase()} through the silk.`
        ], 
        fragments: [
            "Strokes leaning from authority.",
            "Not upright, yet never falling.",
            "To write, not to leave behind.",
            "Mother to daughter.",
            "Fire completed the script.",
            "Stitches for the exploding self.",
            "Inheriting a posture.",
            "Writing without archives.",
            "Silk whispers for the crumbling system",
            "Pattern of survival.",
            "Hands across the void.",
            "A thousand days, one breath.",
            "Tangled but together.",
            "Silk burning at the edges.",
            "A line leading home.",
            "Reweaving civilization.",
            "Ink darkened, then vanished.",
            "Warmth of skin, not stone.",
            "Needle in the dark.",
            "Refining the heritage."
        ] 
    },
    exile: { 
        name: "The Exile", 
        weight: "400", 
        templates: [
            // 方案 1：精简原意，保留核心冲突（门 vs 行李）
            (w) => `${rand(["Arrival gate", "New shore"])}. The quiet weight of ${w.toUpperCase()} in my luggage.`,
            
            // 方案 2：直接的动作，去掉冗长的目的地
            (w) => `Carrying ${w.toUpperCase()} to ${rand(["a safe harbor", "a warm hearth"])}.`,
            
            // 方案 3：侧重于“气息”和遗留
            (w) => `${rand(["Transit zone", "Long bridge"])}. The soft echo of ${w.toUpperCase()}.`,
            
            // 方案 4：强调身份与词语的共生
            (w) => `Resting the memory of ${w.toUpperCase()} at our common table.`,
            
            // 方案 5：极简叙事
            (w) => `A guest of the world, holding the trace of ${w.toUpperCase()}.`
        ], 
        fragments: [
            "I am the border.",
            "Guest of the world.",
            "Home is a method.",
            "The world: a broken sentence.",
            "Distance in lost words.",
            "No English word for this silence.",
            "Dictionary of blood.",
            "Language with no room.",
            "Living in the gaps.",
            "Arrival is a gentle betrayal.",
            "Alien plant, foreign soil.",
            "Sanctuary on our backs.",
            "Belonging is a practice.",
            "Gold among the grit.",
            "Feet learning to dance.",
            "Currency of memory.",
            "Echoes of a lost street.",
            "Guide the way home.",
            "Between departure and arrival.",
            "Nostalgia for strangers."
        ] 
    },
    cantor: { 
        name: "The Cantor", 
        weight: "900", 
        templates: [
            // 方案 1：精简原意，强调共鸣
            (w) => `${rand(["Shared breath", "Echo"])}. The warm resonance of ${w.toUpperCase()}.`,
            
            // 方案 2：将关键词转化为频率
            (w) => `Singing the rhythm of ${w.toUpperCase()} into the warm void.`,
            
            // 方案 3：并列感，强调声音的质感
            (w) => `${rand(["Wordless hymn", "Steady hum"])}. A song for ${w.toUpperCase()}.`,
            
            // 方案 4：声音在空间中的消散
            (w) => `Dissolving the sharpness of ${w.toUpperCase()} into deep silence.`,
            
            // 方案 5：极简频率论
            (w) => `A vibration of ${w.toUpperCase()}, shared across the distance.`
        ], 
        fragments: [
            "Noise turned into comfort.",
            "Rain on a makeshift roof.",
            "Ancient lungs, new hope.",
            "Ancestor's unfinished songs.",
            "Belonging requires no translation.",
            "No word, only vibration.",
            "Chorus of whispers.",
            "Singing the unspoken weight.",
            "Melody is the map.",
            "Gaps between worlds.",
            "Air kept the tune.",
            "Moonlight as a steady hum.",
            "Gold from the airborne grit.",
            "Bridge of air.",
            "Survival in decibels.",
            "History: a lingering resonance.",
            "Singing ghosts into family.",
            "Throat remembers the curve.",
            "Prayer to the wind.",
            "Heart knows the rhythm."
        ] 
    },
    ritualist: { 
        name: "The Ritualist", 
        weight: "500", 
       templates: [
            // 方案 1：精简原意，将复杂的“委托”化为简单的动作
            (w) => `${rand(["Daily ritual", "Time's threshold"])}. Entrusting ${w.toUpperCase()} to the light.`,
            
            // 方案 2：将关键词作为一种供奉，放在公共空间
            (w) => `On the common table, I light the warmth of ${w.toUpperCase()}.`,
            
            // 方案 3：侧重于“接纳”
            (w) => `An invitation for the pulse of ${w.toUpperCase()}.`,
            
            // 方案 4：极其简练的供奉感
            (w) => `A small flame for the memory of ${w.toUpperCase()}.`,
            
            // 方案 5：强调空间感
            (w) => `In the space between, we hold the truth of ${w.toUpperCase()}.`
        ], 
        fragments: [
            "Care: the only religion.",
            "Repeated acts become home.",
            "Incense, earth, steam.",
            "Rite in a cold space.",
            "Noise turned into peace.",
            "Tracing the glowing line.",
            "Gold among the grit.",
            "Auspicious hours found in the silent script.",
            "Nothing is wasted.",
            "Repeating is remembering.",
            "Leaning into a path.",
            "Smoke reaching the sky.",
            "Writing what stays.",
            "Rhythm of the hands.",
            "Whispers and shared tea.",
            "Small, persistent acts.",
            "The heart: the last altar.",
            "Keeping the flame alive.",
            "Truth served at the hour.",
            "Map leading back to self."
        ] 
    },
    archivist: { 
        name: "The Archivist", 
        weight: "100", 
        templates: [
            // 方案 1：精简原意，将复杂的来源化为极简意象
            (w) => `${rand(["Cedar chest", "Bottle of rain"])}. A record of ${w.toUpperCase()} from silent years.`,
            
            // 方案 2：直接的归档动作，去掉冗长的分类
            (w) => `Filing the pulse of ${w.toUpperCase()} under ${rand(["Belonging", "Common Ground"])}.`,
            
            // 方案 3：并列感，强调“物”的属性
            (w) => `${rand(["Photo gaps", "Old ink"])}. The fading echo of ${w.toUpperCase()}.`,
            
            // 方案 4：强调“保存”的行为
            (w) => `Preserving the truth of ${w.toUpperCase()} within the dust.`,
            
            // 方案 5：极简存在主义
            (w) => `A precious gift: the memory of ${w.toUpperCase()}.`
        ], 
        fragments: [
            "Dusty but golden.",
            "Gold from the soot.",
            "Home moving with the wind.",
            "Written in skin and bone.",
            "Hidden in plain sight.",
            "Soul refused to be stone.",
            "Movement of the hand.",
            "Vanishing ink.",
            "Soot of burnt letters.",
            "Record of the fire.",
            "No shelf for this silence.",
            "Dictionary of blood.",
            "Rhythm under the noise.",
            "Preserving the tilt.",
            "Archive of white noise.",
            "Carry, don't store.",
            "Borders are bridges.",
            "A thousand unrecorded acts.",
            "Keener innocence.",
            "Fragments begin to breathe."
        ] 
    },
    translator: { 
        name: "The Translator", 
        weight: "300", 
        templates: [
            // 方案 1：精简原意，强调跨越边界后的转化
            (w) => `${rand(["The border", "Heartbeat gap"])}. Translating ${w.toUpperCase()} into resonance.`,
            
            // 方案 2：将“读词”变为一种直觉，去掉主语 I
            (w) => `Reading the soft weight of ${w.toUpperCase()} as ${rand(["a prayer", "a promise"])}.`,
            
            // 方案 3：侧重于“语言的沉默”，把极端词汇放进空白
            (w) => `In the mother silence, the truth of ${w.toUpperCase()} is reborn.`,
            
            // 方案 4：极其简练的同位语结构
            (w) => `${w.toUpperCase()}: a hidden rhythm, a shared dream.`,
            
            // 方案 5：强调“连接”的本质
            (w) => `A bridge built of ${w.toUpperCase()}, leading to a gentle touch.`
        ], 
        fragments: [
            "No English word for this weight.",
            "Lost in mouth, found in hands.",
            "Dictionary of blood.",
            "Language with no room.",
            "Syntax of distance.",
            "Inheriting the tilt.",
            "Skin thinner than thought.",
            "Leaning away for intimacy.",
            "Writing in the air.",
            "Complementing the broken whole.",
            "Gentle betrayal.",
            "A new truth is born.",
            "Reshaping the moonlight.",
            "Gold among the grit.",
            "Translation: the last resort.",
            "Unreadable wall, one kiss.",
            "Universal grammar of heart.",
            "Path between us.",
            "White noise of peace.",
            "Meeting in the gaps."
        ] 
    },
    botanist: { 
        name: "The Botanist", 
        weight: "500", 
        templates: [
            // 方案 1：精简原意，强调在困境中的生长
            (w) => `${rand(["Wildflower", "Hidden garden"])}. The persistence of ${w.toUpperCase()} grows in stone.`,
            
            // 方案 2：将浇灌动作极简化
            (w) => `Watering the roots of ${w.toUpperCase()} with ancestral dew.`,
            
            // 方案 3：并列意象，让词语化作自然的一部分
            (w) => `${rand(["Morning dew", "Greenhouse"])}. The small bloom of ${w.toUpperCase()}.`,
            
            // 方案 4：强调时间与生命的接纳
            (w) => `Patience for ${w.toUpperCase()}, a seed in the long winter.`,
            
            // 方案 5：极简存在感
            (w) => `The fragrance of ${w.toUpperCase()} remains, soft and wild.`
        ], 
        fragments: [
            "Late bloom: gathering strength.",
            "Persistence in grey grit.",
            "Root, rise, lean, bloom.",
            "Feeding the roots.",
            "Turn toward the light.",
            "Alien flora thriving.",
            "Graft taking hold.",
            "Seed in a coat lining.",
            "Belonging is growth.",
            "Veins of a leaf.",
            "Roots kept the secret.",
            "Petals made of light.",
            "Tilt toward the sun.",
            "Script in chlorophyll.",
            "Survival as a repeating act.",
            "Garden in the dark.",
            "Dictionary of colors.",
            "Fragrance remains.",
            "Root and star.",
            "Guests of the world."
        ] 
    },
    watcher: { 
        name: "The Watcher", 
        weight: "900", 
        templates: [
            // 方案 1：极简原意，强调词语的“降落”与“安顿”
            (w) => `${rand(["The sill", "Threshold"])}. The shadow of ${w.toUpperCase()} settles into the glow.`,
            
            // 方案 2：将“守护”动作变得更加无声
            (w) => `Steady gaze: guarding the presence of ${w.toUpperCase()}.`,
            
            // 方案 3：并列意象，关键词作为远方的景观
            (w) => `${rand(["Safe harbor", "Horizon"])}. A quiet pulse of ${w.toUpperCase()}.`,
            
            // 方案 4：强调空间对词语的容纳
            (w) => `In the quiet gap, the soft weight of ${w.toUpperCase()}.`,
            
            // 方案 5：极简结局
            (w) => `A shared warmth: watching ${w.toUpperCase()} become the dawn.`
        ], 
        fragments: [
            "Breathe. Watch the breath rise.",
            "Identity rises to the surface.",
            "Two worlds, one screen door.",
            "Visible love.",
            "Trail of light at midnight.",
            "Watching a single sentence.",
            "The gaze is a bridge.",
            "Finding the soul.",
            "Guarding the silence.",
            "Standing at the border.",
            "Reshaping the darkness.",
            "Gold among the grit.",
            "Moonlight as home.",
            "To see is to remember.",
            "Nothing is lost.",
            "The witness completes the story.",
            "Presence in the architecture of echoes.",
            "Truth settles like dust.",
            "Eyes carry the weight.",
            "Look at one another."
        ] 
    }
};

// --- 输入监听 ---
getInputs().forEach(input => {
    input.addEventListener('input', function() {
        const val = this.value.replace(/[^a-zA-Z]/g, '');
        getInputs().forEach(el => el.value = val); 
        
        if (val === "") updatePlaceholder();
        activeMeshes.forEach(m => { scene.remove(m); m.geometry.dispose(); m.material.dispose(); });
        activeMeshes = []; hasFissioned = false;
        
        getPoemBtns().forEach(btn => { 
            btn.disabled = true;
            btn.innerText = "AWAKEN FRAGMENT";
        });
        document.getElementById('poem-display').innerHTML = '';
    });
});

function logToAirtable(keyword, personaName, lines) {
    const isTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
    const deviceType = isTouch ? "Mobile" : "Desktop";

    fetch(`https://api.airtable.com/v0/${airtableTarget.baseId}/${airtableTarget.table}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${airtableTarget.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            fields: { 
                "Keyword": keyword, 
                "Persona": personaName, 
                "Generated_Poem": lines.join('\n'),
                "Device": deviceType 
            } 
        })
    }).catch(e => {});
}

function generatePoem() {
    if (Math.random() < 0.01) return { isKarma: true, lines: ["CORE RESONANCE", "Divided into ten, united in you.", "-- 0,0 HOME --"], weight: "900" };
    const pKey = rand(Object.keys(personaEngines));
    const p = personaEngines[pKey];
    const inputs = getInputs();
    const keyword = (inputs.length > 0 ? inputs[0].value : "VOID").toUpperCase() || "VOID";
    let frags = [...p.fragments];
    const resultLines = [rand(p.templates)(keyword), frags.splice(Math.floor(Math.random()*frags.length),1)[0], frags.splice(Math.floor(Math.random()*frags.length),1)[0], `-- The ${pKey.toUpperCase()} speaks.`];
    logToAirtable(keyword, p.name, resultLines);
    return { lines: resultLines, weight: p.weight };
}

function getPersonaContent(keyword) {
    const p = personaEngines[rand(Object.keys(personaEngines))];
    return { content: rand(p.templates)(keyword.toUpperCase()), weight: p.weight };
}

function createTextTexture(data) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = `italic ${data.weight} 30px monospace`;
    const tw = ctx.measureText(data.content).width + 60;
    canvas.width = tw; canvas.height = 70;
    ctx.font = `italic ${data.weight} 30px monospace`;
    ctx.fillStyle = `rgb(255, ${Math.random()*100+50}, 0)`;
    ctx.shadowColor = '#ff4400'; ctx.shadowBlur = 10;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(data.content, tw/2, 35);
    return { texture: new THREE.CanvasTexture(canvas), aspect: tw/70 };
}

function createStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'white'); grad.addColorStop(0.2, 'yellow'); grad.addColorStop(0.4, 'orange'); grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(canvas);
}

const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(1500 * 3);
for(let i=0; i<1500*3; i++) pPos[i] = (Math.random()-0.5)*9000;
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const pMat = new THREE.PointsMaterial({ map: createStarTexture(), size: 80, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
const starPoints = new THREE.Points(pGeo, pMat);
scene.add(starPoints);

// --- 爆发按钮绑定 ---
getStartBtns().forEach(btn => {
    btn.addEventListener('click', async () => {
        const inputs = getInputs();
        const rawVal = (inputs.length > 0 ? inputs[0].value : "").trim();
        
        btn.innerText = "VERIFYING...";
        btn.disabled = true;
        const valid = await isValidWord(rawVal);
        
        if (!valid) {
            btn.innerText = "INVALID WORD";
            setTimeout(() => {
                btn.innerText = "IGNITE FISSION";
                btn.disabled = false;
            }, 1200);
            return;
        }

        btn.innerText = "IGNITE FISSION";
        btn.disabled = false;
        // 如果为空，自动转为 VOID
        const val = rawVal === "" ? "VOID" : rawVal.toUpperCase();
        
        activeMeshes.forEach(m => { scene.remove(m); m.geometry.dispose(); m.material.dispose(); });
        activeMeshes = [];
        for (let i = 0; i < 200; i++) {
            const data = getPersonaContent(val);
            const texData = createTextTexture(data);
            const mat = new THREE.MeshBasicMaterial({ map: texData.texture, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(22 * texData.aspect, 22), mat);
            const angle = Math.random() * Math.PI * 2, dist = 300 + Math.random() * 1500;
            mesh.position.set(Math.cos(angle)*dist, Math.sin(angle)*dist, curZ - (Math.random()*1000 - 200));
            scene.add(mesh); activeMeshes.push(mesh);
            gsap.to(mat, { opacity: 1, duration: 1 });
        }
        hasFissioned = true; 
        getPoemBtns().forEach(pBtn => pBtn.disabled = false);
    });
});

// --- 诗歌按钮绑定 ---
getPoemBtns().forEach(btn => {
    btn.addEventListener('click', function() {
        const display = document.getElementById('poem-display');
        gsap.killTweensOf(".poem-line"); display.innerHTML = '';
        const poem = generatePoem();
        const newLabel = rand(["KEEP LIGHT", "SEASON VOID", "STITCH BREACH", "WALK PATH", "ECHO ROOTS", "GATHER HOURS", "UNSEAL DUST", "KISS WALL", "WATCH BLOOM", "TRACE HORIZON"].filter(w => w !== this.innerText));
        getPoemBtns().forEach(pBtn => pBtn.innerText = newLabel);

        poem.lines.forEach((text, i) => {
            const line = document.createElement('div');
            line.className = 'poem-line' + (poem.isKarma ? ' karma-error' : '');
            line.style.fontWeight = poem.weight; line.innerText = text;
            display.appendChild(line);
            gsap.to(line, { opacity: 1, filter: "blur(0px)", y: -20, duration: 1, delay: i * 0.8, onComplete: () => { if(i === poem.lines.length - 1) gsap.to(".poem-line", { opacity: 0, duration: 3, delay: 4 }); } });
        });
    });
});

document.addEventListener('mousemove', (e) => { mouseX = e.clientX - window.innerWidth/2; mouseY = e.clientY - window.innerHeight/2; });
window.addEventListener('wheel', (e) => { e.preventDefault(); targetZ = Math.min(8000, Math.max(100, targetZ + e.deltaY * 1.5)); }, { passive: false });

let lastDist = 0;
document.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) { const t = e.touches[0]; mouseX = t.clientX - window.innerWidth/2; mouseY = t.clientY - window.innerHeight/2; }
    else if (e.touches.length === 2) {
        const dist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
        if (lastDist > 0) targetZ = Math.min(8000, Math.max(100, targetZ + (lastDist - dist) * 10));
        lastDist = dist;
    }
}, { passive: false });
document.addEventListener('touchend', () => { lastDist = 0; });

function animate(time) {
    requestAnimationFrame(animate);
    starPoints.rotation.y += 0.0003;
    pMat.opacity = 0.6 + Math.sin(time * 0.0015) * 0.3;
    targetCameraX += (mouseX - targetCameraX) * 0.05; targetCameraY += (-mouseY - targetCameraY) * 0.05;
    curZ += (targetZ - curZ) * 0.08;
    camera.position.set(targetCameraX, targetCameraY, curZ); camera.lookAt(0,0,0);
    activeMeshes.forEach(m => m.lookAt(camera.position));
    renderer.render(scene, camera);
}
animate(0);
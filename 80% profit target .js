// ==UserScript==
// @name         𝗡𝗫 𝗔𝗨𝗧𝗢 𝗧𝗥𝗔𝗗𝗘𝗫 – NORMAL 1 + RECOVERY (NEON GREEN EDITION)
// @namespace    http://tampermonkey.net/
// @version      280.0.0
// @description  NX AUTO TRADEX | Normal 1 + Recovery | 80% Profit & 600 Bet Limit | Neon Green Ultra HD UI
// @author       𝗡𝗫 𝗔𝗨𝗧𝗢 𝗧𝗥𝗔𝗗𝗘𝗫
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function(){
    if(document.getElementById('sys-core-fin')) return;
    
    // ==========================================
    // 1. FIREBASE CONNECT & ADMIN CONTROL
    // ==========================================
    const firebaseConfig = {
        apiKey: "AIzaSyAqW8zmQPiG3tM-dOMnJCZ4YF75qncF9Uk",
        authDomain: "ff-tournament-c8552.firebaseapp.com",
        databaseURL: "https://ff-tournament-c8552-default-rtdb.firebaseio.com",
        projectId: "ff-tournament-c8552",
        storageBucket: "ff-tournament-c8552.firebasestorage.app",
        messagingSenderId: "579444442534",
        appId: "1:579444442534:web:8272e49d342a6e5ca4bb67",
        measurementId: "G-WPBLWZQ7S1"
    };

    let db;
    let userStatus = "pending";
    let expiresAt = 0;
    let deviceId = localStorage.getItem('drx_device_id');
    if (!deviceId) {
        deviceId = 'DRX-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        localStorage.setItem('drx_device_id', deviceId);
    }
    let userIP = "Fetching...";
    let browserInfo = navigator.userAgent.substring(0, 60);

    function loadFirebase(callback) {
        if (typeof firebase !== 'undefined') { callback(); return; }
        let s1 = document.createElement('script');
        s1.src = "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js";
        document.head.appendChild(s1);
        let s2 = document.createElement('script');
        s2.src = "https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js";
        document.head.appendChild(s2);
        
        let att = 0;
        let chk = setInterval(() => {
            att++;
            if (typeof firebase !== 'undefined' || att > 50) {
                clearInterval(chk);
                if (typeof firebase !== 'undefined') callback();
            }
        }, 200);
    }

    loadFirebase(() => {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();

        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => { 
                userIP = data.ip; 
                db.ref('drx_users/' + deviceId).update({ ip: userIP, browser: browserInfo });
            }).catch(() => { userIP = "Unknown"; });

        db.ref('drx_users/' + deviceId).on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                userStatus = data.status || "pending";
                expiresAt = data.expiresAt || 0;
                
                if (data.command === 'STOP') {
                    if(st.isRun) {
                        st.isRun = false; clearInterval(st.autoInt);
                        let lkOvl = document.getElementById('drx-lck-bg');
                        if(lkOvl) lkOvl.style.display = 'none';
                        document.body.style.overflow = '';
                        let uSts = document.getElementById('ui-sts');
                        if(uSts) { uSts.innerText = 'HALTED (ADMIN)'; uSts.className = 'val-loss'; }
                        alert("ADMIN FORCED STOP YOUR BOT!");
                    }
                    db.ref('drx_users/' + deviceId).update({ command: null });
                }
                _checkAdminStatus();
            } else {
                db.ref('drx_users/' + deviceId).set({
                    deviceId: deviceId, status: 'pending', expiresAt: 0, regTime: Date.now(), ip: userIP, browser: browserInfo
                });
                _checkAdminStatus();
            }
        });

        const showLockScreen = (msg) => {
            let lockDiv = document.getElementById('drx-admin-lock');
            if (!lockDiv) {
                lockDiv = document.createElement('div');
                lockDiv.id = 'drx-admin-lock';
                lockDiv.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000;color:#00FF7F;z-index:99999999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Courier New', monospace;text-align:center;text-shadow:0 0 20px #00FF7F;";
                document.body.appendChild(lockDiv);
                document.body.style.overflow = 'hidden';
            }
            lockDiv.innerHTML = `
                <div style="font-size:26px;margin-bottom:15px;font-weight:bold;color:#f00;">${msg}</div>
                <div style="font-size:16px;color:#fff;text-shadow:none;background:#111;padding:10px 20px;border-radius:5px;border:1px dashed #00FF7F;">
                    DEVICE ID: <span style="color:#00FF7F;font-weight:bold;">${deviceId}</span>
                </div>
                <div style='font-size:12px;color:#666;margin-top:20px;text-shadow:none;'>Contact Admin to Activate or Renew.</div>
            `;
        };
        const removeLockScreen = () => {
            let lockDiv = document.getElementById('drx-admin-lock');
            if (lockDiv) { lockDiv.remove(); document.body.style.overflow = ''; }
        };

        window._checkAdminStatus = () => {
            if (userStatus === 'blocked') { showLockScreen("ACCESS DENIED: BANNED"); st.isRun = false; clearInterval(st.autoInt); return true; }
            if (userStatus === 'pending') { showLockScreen("SYSTEM LOCKED: PENDING"); st.isRun = false; clearInterval(st.autoInt); return true; }
            if (Date.now() > expiresAt) { showLockScreen("SYSTEM EXPIRED: RENEW"); st.isRun = false; clearInterval(st.autoInt); return true; }
            removeLockScreen(); return false;
        };

        // ==========================================
        // 2. CORE SETUP
        // ==========================================
        const SETTINGS = {
            SCAN_SYS: "FAST",
            VISUAL_FX: "GLITCH",
            COLOR_FLT: "GREEN"
        };

        const uF = (s) => String(s).toUpperCase().split('').map(c => {
            let n = c.charCodeAt(0);
            if(n>=65&&n<=90) return String.fromCodePoint(n+119743); 
            if(n>=48&&n<=57) return String.fromCodePoint(n+120764); 
            return c;
        }).join('');

        const PLATFORM_ID = 'dkwin';
        const d = {"B1":{"x":118,"y":63,"w":123,"h":37.5}}; 
        const sel = {
            BIG: "div#app > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(5) > div",
            SMALL: "div#app > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(5) > div:nth-of-type(2)",
            A1: "div#app > div:nth-of-type(2) > div:nth-of-type(5) > div > div:nth-of-type(2) > div:nth-of-type(2) > div > div > input",
            DTA: "div#app > div:nth-of-type(2) > div:nth-of-type(5) > div > div:nth-of-type(3) > button:nth-of-type(2)"
        };
        
        const cfg = { 
            fRt: 300, 
            syncDly: 2500, 
            minSf: 10 
        };
        
        let st = { 
            isRun: false, 
            tgtAmt: 500, 
            curBal: 0, 
            autoInt: null, 
            preScn: null, 
            isTrd: false, 
            stpIdx: 0, 
            dynSeq: [], 
            mode: 'DEF', 
            extVal: 0,
            mlActive: false,
            timeLimit: 'NO',
            tradesDone: 0,
            maxTrades: 0,
            activeAI: 'NX SYSTEM',
            isRecovery: false,
            lossCount: 0,
            currentStep: 0,
            baseAmount: 5,
            totalSignals: 0,
            totalWins: 0,
            totalLosses: 0,
            maxLossStreak: 0,
            maxWinStreak: 0,
            currentLossStreak: 0,
            currentWinStreak: 0,
            lastPred: null,
            lastPeriod: null,
            lastHist: null,
            lastNumber: null,
            initialBalance: 0,
            target80Percent: 0, // ✅ 80% Target
            totalBetAmount: 0,
            scanBlink: null // ✅ Scan Blink Timer
        };

        class DataVault {
            static init() {
                if(!localStorage.getItem('drx_data_vault_v8')) {
                    localStorage.setItem('drx_data_vault_v8', JSON.stringify({ 
                        history: [], wins: 0, losses: 0, balance_peak: 0, system_logs: []
                    }));
                }
            }
            static get() { return JSON.parse(localStorage.getItem('drx_data_vault_v8')); }
            static save(d) { localStorage.setItem('drx_data_vault_v8', JSON.stringify(d)); }
            static addRecord(period, result, pred, isWin) {
                let d = this.get();
                if(!d.history.find(x => x.period === period)) {
                    d.history.unshift({ period: period, result: parseInt(result), pred: pred, isWin: isWin });
                    if(d.history.length > 2000) d.history.pop();
                    if(isWin) d.wins++; else d.losses++;
                    this.save(d);
                }
            }
            static getHistoryArray() { return this.get().history.map(x => parseInt(x.result)); }
        }
        DataVault.init();

        // ==========================================
        // 3. 🔥 CUSTOM LOGIC (Normal 1 → Recovery)
        // ==========================================
        
        function normal1Signal(lastNumber) {
            if (lastNumber >= 5 && lastNumber <= 9) return 'BIG';
            else if (lastNumber >= 0 && lastNumber <= 4) return 'SMALL';
            else return null;
        }

        function pattern1Signal(history) {
            let first = history[0];
            let next = history[1];
            
            if (first === 0) {
                if ([1, 3, 6, 8].includes(next)) return 'BIG';
                else if ([0, 2, 4, 5, 7, 9].includes(next)) return 'SMALL';
                return null;
            } else {
                let count = history.filter(x => x === first).length;
                if (count <= 1) {
                    if ([1, 3, 4, 6].includes(first)) return 'BIG';
                    else if ([2, 5, 7, 8, 9].includes(first)) return 'SMALL';
                } else {
                    if ([1, 3, 4, 6].includes(first)) return 'SMALL';
                    else if ([2, 5, 7, 8, 9].includes(first)) return 'BIG';
                }
                return null;
            }
        }

        function pattern2Signal(history) {
            if (!history || history.length < 10) return null;
            
            const first = history[0];
            const second = history[1];
            const last = history[9];
            
            if (first === 0 || second === 0 || last === 0) return null;
            
            const sum = first + second;
            const diff = Math.abs(sum - last);
            
            if (diff >= 0 && diff <= 4) return 'SMALL';
            else if (diff >= 5 && diff <= 9) return 'BIG';
            return null;
        }

        const UserPatternLogic = (h) => {
            if (!h || h.length < 10) return 'NO TRADE';
            
            const lastNumber = h[0];
            
            if (!st.isRecovery) {
                const sig = normal1Signal(lastNumber);
                if (sig) return sig;
                return 'NO TRADE';
            }
            
            if (st.isRecovery) {
                const p1 = pattern1Signal(h);
                const p2 = pattern2Signal(h);
                
                if (p1 && p2 && p1 === p2) return p1;
                return 'NO TRADE';
            }
            return 'NO TRADE';
        };

        // ==========================================
        // 4. 🔥 DYNAMIC COMPOUNDING CALCULATOR (8 STEP)
        // ==========================================
        const calcSeq = (cBal, tgtAmt) => {
            if (st.currentStep === 0) {
                // ✅ 8 Step এর জন্য base divisor: 1+2+4+8+16+32+64+128 = 255
                let dynamicBase = Math.floor(cBal / 255);
                st.baseAmount = dynamicBase > 0 ? dynamicBase : 1;
            }
            
            let amount = st.baseAmount * Math.pow(2, st.currentStep);
            
            if (amount > cBal) {
                amount = Math.floor(cBal);
                if (amount < 1) amount = 0;
            }
            return [amount];
        };

        // ==========================================
        // 5. 🎨 NEON GREEN ULTRA HD UI & SCANNER
        // ==========================================
        let dTimeLeft = 30;
        if (PLATFORM_ID !== 'dkwin') {
            setInterval(() => {
                let uClk = document.getElementById('ui-clk');
                if (uClk) {
                    let minutes = Math.floor(dTimeLeft / 30);
                    let seconds = dTimeLeft % 30;
                    uClk.textContent = uF(`${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`);
                }
                dTimeLeft--;
                if (dTimeLeft < 0) dTimeLeft = 30;
            }, 1000);
        }

        let lkOvl = document.createElement('div');
        lkOvl.id = 'drx-lck-bg';
        lkOvl.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.01);z-index:9999997;display:none;';
        lkOvl.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); }, true);
        document.body.appendChild(lkOvl);

        function ext(tgt) {
            let tw=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null,false);
            let n, arr=[];
            while(n=tw.nextNode()){
                let v = n.nodeValue.trim();
                if(!v)continue;
                let r=document.createRange();r.selectNodeContents(n);
                let br=r.getBoundingClientRect();
                let absX = br.left+window.scrollX; let absY = br.top+window.scrollY;
                let m1 = !(absX>tgt.x+tgt.w || absX+br.width<tgt.x || absY>tgt.y+tgt.h || absY+br.height<tgt.y);
                let fixX = br.left; let fixY = br.top;
                let m2 = !(fixX>tgt.x+tgt.w || fixX+br.width<tgt.x || fixY>tgt.y+tgt.h || fixY+br.height<tgt.y);
                if(m1 || m2) arr.push(v);
            }
            return arr;
        }

        function chkBal() {
            let bText = document.body.innerText;
            let bMatch = bText.match(/₹[\s]*([\d,]+\.\d{2})/);
            if (bMatch) {
                let p = parseFloat(bMatch[1].replace(/,/g, ''));
                if (!isNaN(p)) { st.curBal = p; return st.curBal; }
            }
            let tb = ext(d.B1);
            if(tb.length > 0) {
                let p = parseFloat(tb[0].replace(/[^0-9.]/g, ''));
                if(!isNaN(p)) st.curBal = p;
            }
            return st.curBal;
        }

        let p = document.createElement('div');
        p.id = 'sys-core-fin';
        
        let sL = localStorage.getItem('drx_ui_x');
        let sT = localStorage.getItem('drx_ui_y');
        if(sL && sT) { p.style.left = sL; p.style.top = sT; } 
        else { p.style.top = '20px'; p.style.right = '20px'; }

        // ✅ NEW NEON GREEN ULTRA HD CSS
        let stl = document.createElement('style');
        stl.innerHTML = `
            @keyframes neonPulse {
                0% { transform: scale(1); text-shadow: 0 0 10px #00FF7F, 0 0 20px #00FF7F; }
                50% { transform: scale(1.05); text-shadow: 0 0 20px #00FF7F, 0 0 40px #00FF7F, 0 0 60px #00FF7F; }
                100% { transform: scale(1); text-shadow: 0 0 10px #00FF7F, 0 0 20px #00FF7F; }
            }
            @keyframes neonBorder {
                0% { border-color: #00FF7F; box-shadow: 0 0 15px #00FF7F, inset 0 0 15px rgba(0,255,127,0.2); }
                50% { border-color: #00FFAA; box-shadow: 0 0 30px #00FF7F, 0 0 50px #00FF7F, inset 0 0 25px rgba(0,255,127,0.4); }
                100% { border-color: #00FF7F; box-shadow: 0 0 15px #00FF7F, inset 0 0 15px rgba(0,255,127,0.2); }
            }
            @keyframes scrollCode {
                0% { transform: translateY(0); }
                100% { transform: translateY(-50%); }
            }
            @keyframes blueScanBlink {
                0% { box-shadow: 0 0 10px #00BFFF, 0 0 20px #00BFFF, inset 0 0 10px rgba(0,191,255,0.3); border-color: #00BFFF; }
                50% { box-shadow: 0 0 25px #00BFFF, 0 0 50px #00BFFF, inset 0 0 20px rgba(0,191,255,0.6); border-color: #00BFFF; }
                100% { box-shadow: 0 0 10px #00BFFF, 0 0 20px #00BFFF, inset 0 0 10px rgba(0,191,255,0.3); border-color: #00BFFF; }
            }
            #sys-core-fin {
                position: fixed;
                width: 280px;
                padding: 0;
                font-family: 'Courier New', Courier, monospace;
                font-size: 11px;
                z-index: 9999999;
                color: #00FF7F;
                user-select: none;
                border-radius: 12px;
                overflow: hidden;
                background: #000a00;
                animation: neonBorder 2s infinite ease-in-out;
                border: 2px solid #00FF7F;
                transition: width 0.3s ease, height 0.3s ease;
            }
            #sys-core-fin.minimized {
                width: 200px !important;
            }
            .drx-header {
                background: linear-gradient(90deg, #003300, #00FF7F, #003300);
                padding: 8px 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: move;
                border-bottom: 1px solid #00FF7F;
                position: relative;
                z-index: 2;
            }
            .drx-title {
                font-weight: bold;
                font-size: 13px;
                color: #000000;
                text-transform: uppercase;
                letter-spacing: 1px;
                animation: neonPulse 2s infinite ease-in-out;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .drx-close {
                cursor: pointer;
                font-weight: bold;
                color: #000;
                background: rgba(0,0,0,0.2);
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: 0.2s;
                font-size: 12px;
                position: relative;
                z-index: 3;
                flex-shrink: 0;
            }
            .drx-close:hover { background: #000; color: #00FF7F; transform: scale(1.1); }
            .drx-body {
                padding: 12px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                background: rgba(0, 10, 0, 0.95);
                position: relative;
                z-index: 1;
            }
            .drx-card {
                background: rgba(0, 255, 127, 0.05);
                border-radius: 8px;
                padding: 8px;
                border: 1px solid rgba(0, 255, 127, 0.4);
                box-shadow: inset 0 0 5px rgba(0, 255, 127, 0.1);
                transition: 0.3s;
            }
            .drx-card.scanning {
                animation: blueScanBlink 0.5s infinite ease-in-out;
                border-color: #00BFFF;
            }
            .drx-input, .drx-select {
                width: 100%;
                padding: 8px;
                background: rgba(0, 0, 0, 0.8);
                border: 1px solid #00FF7F;
                border-radius: 6px;
                color: #00FF7F;
                text-align: center;
                font-size: 12px;
                font-weight: bold;
                outline: none;
                box-sizing: border-box;
                transition: 0.3s;
                margin-bottom: 8px;
                font-family: 'Courier New', monospace;
            }
            .drx-input:focus, .drx-select:focus {
                border-color: #00FFAA;
                box-shadow: 0 0 15px rgba(0, 255, 127, 0.8);
            }
            .drx-input:disabled {
                color: #006633;
                border-color: rgba(0, 255, 127, 0.2);
                background: rgba(0,0,0,0.5);
            }
            .drx-select option { background: #000; color: #00FF7F; }
            .drx-btn-group { display: flex; gap: 8px; margin-bottom: 8px; }
            .drx-btn {
                flex: 1;
                padding: 8px;
                border-radius: 6px;
                background: transparent;
                cursor: pointer;
                font-weight: bold;
                font-size: 11px;
                transition: 0.3s;
                border: 1px solid #00FF7F;
                color: #00FF7F;
                text-transform: uppercase;
                font-family: 'Courier New', monospace;
            }
            .drx-btn:hover { background: #00FF7F; color: #000; box-shadow: 0 0 20px #00FF7F; }
            .drx-btn-start { 
                border: 1px solid #00FF7F;
                background: transparent;
                color: #00FF7F;
                font-size: 13px;
                padding: 10px;
                border-radius: 6px;
                margin-top: 5px;
                font-weight: bold;
                width: 100%;
                cursor: pointer;
                transition: 0.3s;
                text-transform: uppercase;
                font-family: 'Courier New', monospace;
                box-shadow: 0 0 10px rgba(0,255,127,0.3);
            }
            .drx-btn-start:hover { background: #00FF7F; color: #000; box-shadow: 0 0 30px #00FF7F; }
            .drx-btn-stop { 
                border: 1px solid #ff0044;
                color: #ff0044;
                margin-top: 10px;
                background: transparent;
                padding: 8px;
                border-radius: 6px;
                width: 100%;
                font-weight: bold;
                cursor: pointer;
                text-transform: uppercase;
                transition: 0.3s;
                font-family: 'Courier New', monospace;
            }
            .drx-btn-stop:hover { background: #ff0044; color: #fff; box-shadow: 0 0 15px #ff0044; }
            .drx-stats { display: flex; flex-direction: column; gap: 6px; }
            .drx-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed rgba(0, 255, 127, 0.2); padding-bottom: 4px; }
            .drx-label { color: #00FF7F; font-size: 10px; text-transform: uppercase; opacity: 0.8; font-family: 'Courier New', monospace; }
            .drx-val { font-weight: bold; font-size: 11px; font-family: 'Courier New', monospace; }
            
            /* Neon Green Colors */
            .val-win { color: #00FF7F; text-shadow: 0 0 8px #00FF7F, 0 0 15px #00FF7F; }
            .val-loss { color: #FF4500; text-shadow: 0 0 8px #FF4500; }
            .val-sig { color: #00FFAA; text-shadow: 0 0 8px #00FFAA; }
            .val-bet { color: #7FFF00; text-shadow: 0 0 8px #7FFF00; }
            .val-norm { color: #00FF7F; text-shadow: 0 0 8px #00FF7F; }
            .val-rec { color: #FF8C00; text-shadow: 0 0 8px #FF8C00; }
            .val-white { color: #ffffff; text-shadow: 0 0 5px #fff; }
            .val-scan { color: #00BFFF; text-shadow: 0 0 10px #00BFFF, 0 0 20px #00BFFF; }
            
            /* Neon Data Animation Background */
            .drx-code-bg {
                position: absolute;
                top: 0; left: 0; width: 100%; height: 100%;
                opacity: 0.1;
                pointer-events: none;
                overflow: hidden;
                z-index: 0;
                color: #00FF7F;
                font-family: 'Courier New', monospace;
                font-size: 8px;
                line-height: 10px;
                white-space: pre;
                animation: scrollCode 10s linear infinite;
            }
        `;
        document.head.appendChild(stl);

        // Build Header
        let h = document.createElement('div');
        h.className = 'drx-header';
        h.innerHTML = `<span class="drx-title" id="drx-title">𝗡𝗫 𝗔𝗨𝗧𝗢 𝗧𝗥𝗔𝗗𝗘𝗫</span><span class="drx-close" id="sys-cls">X</span>`;

        // Build Body Container
        let b = document.createElement('div');
        b.className = 'drx-body';

        // ✅ Add Neon Green Data Background Animation
        let codeLines = [];
        for(let i=0; i<60; i++) {
            let randHex = Math.random().toString(16).substring(2, 6).toUpperCase();
            codeLines.push("0x" + randHex + " : NEON_TRADE() : PROFIT++ : " + Math.floor(Math.random()*9999));
        }
        const codeBg = document.createElement('div');
        codeBg.className = 'drx-code-bg';
        codeBg.innerText = codeLines.join('\n') + '\n' + codeLines.join('\n');
        p.appendChild(codeBg);

        // ===== PAGE 1 (Settings) =====
        const p1 = document.createElement('div');
        p1.innerHTML = `<div class="drx-card" style="text-align:center;margin-bottom:10px;">
            <div class="drx-label">CURRENT BALANCE</div>
            <div id="pre-bal" class="drx-val val-white" style="font-size:18px;">--</div>
        </div>`;
        
        const tgtInp = document.createElement('input');
        tgtInp.type = 'number'; tgtInp.placeholder = 'AUTO (80% PROFIT)';
        tgtInp.className = 'drx-input';
        tgtInp.disabled = true; 
        
        const mWrap = document.createElement('div');
        mWrap.className = 'drx-btn-group';
        
        const divBtn = document.createElement('button');
        divBtn.innerText = 'DIV';
        divBtn.className = 'drx-btn';
        
        const dblBtn = document.createElement('button');
        dblBtn.innerText = 'DBL';
        dblBtn.className = 'drx-btn';
        
        mWrap.appendChild(divBtn); mWrap.appendChild(dblBtn);

        const mInpWrap = document.createElement('div');
        mInpWrap.style.display = 'none';
        const mInp = document.createElement('input');
        mInp.type = 'number';
        mInp.className = 'drx-input';
        mInp.placeholder = 'BASE AMOUNT';
        mInpWrap.appendChild(mInp);

        divBtn.onclick = () => { 
            st.mode = 'DIV'; 
            mInpWrap.style.display = 'block'; 
            mInp.style.color = '#00FF7F'; 
            dblBtn.style.opacity = '0.4'; 
            divBtn.style.opacity = '1'; 
        };
        
        dblBtn.onclick = () => { 
            st.mode = 'DBL'; 
            mInpWrap.style.display = 'block'; 
            mInp.style.color = '#00FF7F'; 
            divBtn.style.opacity = '0.4'; 
            dblBtn.style.opacity = '1'; 
        };

        const timeWrap = document.createElement('div');
        const timeSel = document.createElement('select');
        timeSel.className = 'drx-select';
        
        let optHtml = "";
        for(let i=1; i<=60; i++) {
            optHtml += `<option value="${i}">${i}</option>`;
        }
        optHtml += `<option value="NO" selected>NO</option>`;
        timeSel.innerHTML = optHtml;
        
        timeSel.onchange = () => { st.timeLimit = timeSel.value; };
        timeWrap.appendChild(timeSel);

        const goBtn = document.createElement('button');
        goBtn.innerText = 'START_ENGINE()';
        goBtn.className = 'drx-btn-start';
        
        p1.appendChild(tgtInp); 
        p1.appendChild(mWrap); 
        p1.appendChild(mInpWrap); 
        p1.appendChild(timeWrap); 
        p1.appendChild(goBtn);

        st.preScn = setInterval(() => { if(!st.isRun) { let bal = chkBal(); document.getElementById('pre-bal').innerText = uF(bal > 0 ? bal.toFixed(2) : '--'); } }, 1000);

        // ===== PAGE 2 (Live Stats) =====
        const p2 = document.createElement('div');
        p2.style.display = 'none';
        const balBx = document.createElement('div');
        balBx.className = 'drx-card';
        balBx.id = 'live-bal-card';
        balBx.style.textAlign = 'center';
        balBx.style.marginBottom = '10px';
        balBx.innerHTML = `<div class="drx-label">LIVE_BALANCE</div><div id="ui-bal" class="drx-val val-white" style="font-size:18px;">--</div>`;
        
        let timerPlaceholder = PLATFORM_ID === 'deshclub' ? '--' : '00:30';

        const infBx = document.createElement('div');
        infBx.className = 'drx-card drx-stats';
        infBx.id = 'live-stat-card';
        infBx.innerHTML = 
            `<div class="drx-row"><span class="drx-label">AI_MODE:</span><span id="ui-ai" class="drx-val val-rec">N+REC</span></div>` +
            `<div class="drx-row"><span class="drx-label">TARGET:</span><span id="ui-tgt" class="drx-val val-white">0</span></div>` +
            `<div class="drx-row"><span class="drx-label">BET_AMT:</span><span id="ui-bet" class="drx-val val-sig">5</span></div>` +
            `<div class="drx-row"><span class="drx-label">CLOCK:</span><span id="ui-clk" class="drx-val val-white">${timerPlaceholder}</span></div>` +
            `<div class="drx-row"><span class="drx-label">STEP:</span><span id="ui-step" class="drx-val val-sig">0</span></div>` +
            `<div class="drx-row"><span class="drx-label">MODE:</span><span id="ui-mode" class="drx-val val-norm">NORMAL</span></div>` +
            `<div class="drx-row"><span class="drx-label">SIGNAL:</span><span id="ui-signal" class="drx-val val-rec">---</span></div>` +
            `<div class="drx-row"><span class="drx-label">TOTAL_SIG:</span><span id="ui-total-sig" class="drx-val val-sig">0</span></div>` +
            `<div class="drx-row"><span class="drx-label">TOTAL_WIN:</span><span id="ui-total-win" class="drx-val val-win">0</span></div>` +
            `<div class="drx-row"><span class="drx-label">TOTAL_LOSS:</span><span id="ui-total-loss" class="drx-val val-loss">0</span></div>` +
            `<div class="drx-row"><span class="drx-label">MAX_LOSS:</span><span id="ui-max-loss" class="drx-val val-loss">0</span></div>` +
            `<div class="drx-row"><span class="drx-label">MAX_WIN:</span><span id="ui-max-win" class="drx-val val-win">0</span></div>` +
            `<div class="drx-row"><span class="drx-label">TOTAL_BET:</span><span id="ui-total-bet" class="drx-val val-bet">0</span></div>` +
            `<div class="drx-row"><span class="drx-label">STATUS:</span><span id="ui-sts" class="drx-val val-white">WAIT</span></div>` +
            `<div class="drx-row" style="border:none;"><span class="drx-label">LOSS_CNT:</span><span id="ui-loss" class="drx-val val-sig">0</span></div>`;
        
        const stpBtn = document.createElement('button');
        stpBtn.innerText = 'STOP_ENGINE()';
        stpBtn.className = 'drx-btn-stop';

        p2.appendChild(balBx); p2.appendChild(infBx); p2.appendChild(stpBtn);
        b.appendChild(p1); b.appendChild(p2); 
        
        p.appendChild(h);
        p.appendChild(b);
        document.body.appendChild(p);

        let mlBgDiv = document.createElement('div');
        mlBgDiv.className = 'drx-ml-bg';
        mlBgDiv.id = 'ml-bg-engine';
        document.body.appendChild(mlBgDiv);

        // ✅ Minimize Toggle Logic (Small + Name Stays)
        let isMinimized = false;
        function toggleMinimize() {
            isMinimized = !isMinimized;
            if(isMinimized) {
                b.style.display = 'none';
                p.classList.add('minimized');
                p.style.width = '200px'; 
            } else {
                b.style.display = 'flex';
                p.classList.remove('minimized');
                p.style.width = '280px';
            }
        }

        let drg=false, dragMoved=false, sx,sy,sl,st_y;
        function dSt(e){
            if(e.target.id === 'sys-cls') return; 
            drg=true; dragMoved = false;
            let ev=e.type.includes('touch')?e.touches[0]:e;
            sx=ev.clientX;sy=ev.clientY;sl=p.offsetLeft;st_y=p.offsetTop;
        }
        function dMv(e){
            if(!drg)return;
            let ev=e.type.includes('touch')?e.touches[0]:e;
            if (Math.abs(ev.clientX - sx) > 5 || Math.abs(ev.clientY - sy) > 5) {
                dragMoved = true;
            }
            e.preventDefault();
            p.style.left=(sl+ev.clientX-sx)+'px';
            p.style.top=(st_y+ev.clientY-sy)+'px';
        }
        function dEn(e){
            if(drg && !dragMoved) {
                if(e.target.id !== 'sys-cls') {
                    toggleMinimize(); 
                }
            }
            drg=false; 
            localStorage.setItem('drx_ui_x', p.style.left); 
            localStorage.setItem('drx_ui_y', p.style.top);
        }
        
        h.addEventListener('mousedown',dSt);h.addEventListener('touchstart',dSt,{passive:false});
        document.addEventListener('mousemove',dMv);document.addEventListener('touchmove',dMv,{passive:false});
        document.addEventListener('mouseup',dEn);document.addEventListener('touchend',dEn);

        h.querySelector('#sys-cls').onclick = () => { 
            clearInterval(st.autoInt); 
            clearInterval(st.preScn); 
            if(st.scanBlink) clearInterval(st.scanBlink);
            p.remove(); lkOvl.remove(); document.body.style.overflow = ''; 
        };

        const exeTrd = (pred, amt, cb) => {
            let pEl = document.querySelector(sel[pred]);
            if(!pEl) { if(cb) cb(false); return; }
            pEl.classList.add('drx-elec-target');
            pEl.click(); 

            setTimeout(() => {
                let inpEl = document.querySelector(sel.A1);
                if(inpEl) {
                    inpEl.focus();
                    let setV = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                    if(setV) setV.call(inpEl, amt); else inpEl.value = amt;
                    inpEl.dispatchEvent(new Event('input', { bubbles: true }));
                    inpEl.dispatchEvent(new Event('change', { bubbles: true }));
                }

                setTimeout(() => {
                    let dEl = document.querySelector(sel.DTA);
                    if(dEl) { dEl.click(); setTimeout(() => dEl.click(), 100); }
                    if(pEl) pEl.classList.remove('drx-elec-target');
                    setTimeout(() => { if(cb) cb(true); }, 3000);
                }, 500);
            }, 500);
        };

        // ✅ NEW BLUE SCAN EFFECT (3 Second)
        const scnUI = (cb) => {
            let ov = document.createElement('div');
            ov.id = 'drx-scan-overlay';
            ov.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:transparent;z-index:9999998;pointer-events:none;overflow:hidden;';
            
            // Blue color
            let cBase = '#00BFFF';
            
            // Horizontal Blue Scan Line
            let rL = document.createElement('div');
            rL.style.cssText = `position:absolute;width:100%;height:3px;background:${cBase};box-shadow:0 0 20px 8px ${cBase}, 0 0 40px 15px rgba(0,191,255,0.5);animation:sR 0.3s linear infinite alternate;`;
            
            // Vertical Blue Scan Line
            let gL = document.createElement('div'); 
            gL.style.cssText = `position:absolute;height:100%;width:4px;background:${cBase};box-shadow:0 0 25px 10px ${cBase}, 0 0 50px 20px rgba(0,191,255,0.5);animation:sG 0.3s cubic-bezier(0.25,0.1,0.25,1) infinite alternate;`;
            
            // Blue Grid Lines
            let gridDiv = document.createElement('div');
            gridDiv.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;background-image:linear-gradient(rgba(0,191,255,0.1) 1px, transparent 1px),linear-gradient(90deg, rgba(0,191,255,0.1) 1px, transparent 1px);background-size:50px 50px;animation:gridFade 3s ease-in-out;`;
            
            let sS = document.createElement('style'); 
            sS.innerHTML = `
                @keyframes sR { 0% { top: -10px; } 100% { top: 100vh; } } 
                @keyframes sG { 0% { left: -10px; } 100% { left: 100vw; } }
                @keyframes gridFade { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
            `;
            document.head.appendChild(sS); 
            ov.appendChild(rL); 
            ov.appendChild(gL);
            ov.appendChild(gridDiv);
            document.body.appendChild(ov);
            
            // ✅ Add scanning blink effect to cards
            const balCard = document.getElementById('live-bal-card');
            const statCard = document.getElementById('live-stat-card');
            if(balCard) balCard.classList.add('scanning');
            if(statCard) statCard.classList.add('scanning');
            
            // Show SCANNING text in status
            const uSts = document.getElementById('ui-sts');
            if(uSts) {
                uSts.innerText = 'SCANNING...';
                uSts.className = 'drx-val val-scan';
            }
            
            // ✅ 3 second scan
            setTimeout(() => { 
                ov.remove(); 
                sS.remove(); 
                if(balCard) balCard.classList.remove('scanning');
                if(statCard) statCard.classList.remove('scanning');
                if(cb) cb(); 
            }, 3000);
        };

        const updateUI = () => {
            const uMode = document.getElementById('ui-mode');
            const uLoss = document.getElementById('ui-loss');
            const uStep = document.getElementById('ui-step');
            const uSignal = document.getElementById('ui-signal');
            const uTotalSig = document.getElementById('ui-total-sig');
            const uTotalWin = document.getElementById('ui-total-win');
            const uTotalLoss = document.getElementById('ui-total-loss');
            const uMaxLoss = document.getElementById('ui-max-loss');
            const uMaxWin = document.getElementById('ui-max-win');
            const uTotalBet = document.getElementById('ui-total-bet'); 
            
            if (uMode) {
                if (st.isRecovery) {
                    uMode.innerText = 'RECOVERY';
                    uMode.className = 'drx-val val-rec';
                } else {
                    uMode.innerText = 'NORMAL';
                    uMode.className = 'drx-val val-norm';
                }
            }
            if (uLoss) {
                uLoss.innerText = st.lossCount;
                uLoss.className = st.lossCount >= 3 ? 'drx-val val-loss' : 'drx-val val-sig';
            }
            if (uStep) {
                uStep.innerText = st.currentStep;
                uStep.className = st.currentStep >= 9 ? 'drx-val val-loss' : 'drx-val val-sig';
            }
            if (uSignal) {
                uSignal.className = st.isRecovery ? 'drx-val val-rec' : 'drx-val val-norm';
            }
            if (uTotalSig) uTotalSig.innerText = st.totalSignals;
            if (uTotalWin) uTotalWin.innerText = st.totalWins;
            if (uTotalLoss) uTotalLoss.innerText = st.totalLosses;
            if (uMaxLoss) uMaxLoss.innerText = st.maxLossStreak;
            if (uMaxWin) uMaxWin.innerText = st.maxWinStreak;
            if (uTotalBet) uTotalBet.innerText = st.totalBetAmount.toFixed(2); 
        };

        const loopTask = () => {
            if (window._checkAdminStatus()) return; 

            const nw = new Date();
            if (PLATFORM_ID === 'deshclub') {
                let uClk = document.getElementById('ui-clk');
                if(uClk) uClk.textContent = uF(`${String(nw.getHours()).padStart(2,'0')}:${String(nw.getMinutes()).padStart(2,'0')}:${String(nw.getSeconds()).padStart(2,'0')}`);
            }

            if(!st.isRun || st.isTrd) return;

            chkBal();
            const uBal = document.getElementById('ui-bal'), uSts = document.getElementById('ui-sts'), uBet = document.getElementById('ui-bet');
            const uSignal = document.getElementById('ui-signal');
            
            // ✅ 80% Profit Target check
            if (st.curBal >= st.target80Percent && st.curBal > 0) {
                uBal.innerText = uF(`${st.curBal.toFixed(2)} (Profit OK)`);
            } else {
                uBal.innerText = uF(st.curBal > 0 ? st.curBal.toFixed(2) : '--');
            }
            uBet.innerText = uF(st.dynSeq[st.stpIdx] || '--');

            updateUI();

            // ===== ✅ NEW STOP CONDITIONS (80% Profit) =====
            let isProfitReached = (st.curBal >= st.target80Percent && st.curBal > 0);
            let isBetLimitReached = (st.totalBetAmount >= 600);

            if(isProfitReached && isBetLimitReached) {
                let stopReason = "✅ 80% PROFIT & 600+ BET REACHED";
                uSts.innerText = 'DONE';
                uSts.className = 'drx-val val-win';
                stpBtn.style.display = 'none';
                st.isRun = false; clearInterval(st.autoInt); lkOvl.style.display = 'none'; document.body.style.overflow = '';
                
                let dWrap = document.createElement('div');
                dWrap.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.95);padding:20px;border:2px solid #00FF7F;border-radius:10px;z-index:99999999;text-align:center;box-shadow:0 0 40px #00FF7F;';
                dWrap.innerHTML = `<h2 style="color:#00FF7F;margin-bottom:10px;font-family:'Courier New', monospace;text-shadow:0 0 15px #00FF7F;">${stopReason}</h2>
                    <p style="color:#fff;font-family:'Courier New', monospace;margin-bottom:5px;">Initial Bal: ${st.initialBalance.toFixed(2)}</p>
                    <p style="color:#fff;font-family:'Courier New', monospace;margin-bottom:5px;">Final Bal: ${st.curBal.toFixed(2)}</p>
                    <p style="color:#fff;font-family:'Courier New', monospace;margin-bottom:5px;">Total Bet: ${st.totalBetAmount.toFixed(2)} / 600</p>
                    <p style="color:#fff;font-family:'Courier New', monospace;margin-bottom:5px;">Total Signals: ${st.totalSignals}</p>
                    <p style="color:#fff;font-family:'Courier New', monospace;margin-bottom:5px;">Total Wins: ${st.totalWins}</p>
                    <p style="color:#fff;font-family:'Courier New', monospace;margin-bottom:5px;">Total Losses: ${st.totalLosses}</p>
                    <p style="color:#fff;font-family:'Courier New', monospace;margin-bottom:15px;">Max Loss Streak: ${st.maxLossStreak}</p>
                    <button id="closeDWrap" style="background:transparent;color:#00FF7F;border:1px solid #00FF7F;padding:5px 15px;cursor:pointer;font-family:'Courier New', monospace;">OK</button>`;
                document.body.appendChild(dWrap);
                document.getElementById('closeDWrap').onclick = () => dWrap.remove();
                return;
            }

            // ==========================================
            // HISTORY SCANNER
            // ==========================================
            let sDigRaw = null;
            let pageText = document.body.innerText;
            let histMatches = [...pageText.matchAll(/(20\d{12,18})[\s\n]+(\d)[\s\n]+(Big|Small)/gi)];
            
            if (histMatches.length >= 10) {
                sDigRaw = histMatches.map(m => parseInt(m[2]));
            }
            
            if (sDigRaw && sDigRaw.length >= 10) { 
                let sDig = sDigRaw;
                let cSig = sDig.slice(0, 5).join("-"), sSig = sessionStorage.getItem('drx_sig');
                
                if (cSig !== sSig) {
                    if(st.lastPred && st.lastPeriod) {
                        let actualRes = parseInt(sDig[0]);
                        let isWin = (st.lastPred === 'BIG' && actualRes >= 5) || (st.lastPred === 'SMALL' && actualRes < 5);
                        DataVault.addRecord(st.lastPeriod, actualRes, st.lastPred, isWin);
                        
                        st.totalSignals++;
                        if (isWin) {
                            st.totalWins++;
                            st.currentWinStreak++;
                            st.currentLossStreak = 0;
                            if (st.currentWinStreak > st.maxWinStreak) {
                                st.maxWinStreak = st.currentWinStreak;
                            }
                            st.currentStep = 0;
                            st.stpIdx = 0;
                            st.lossCount = 0;
                            
                            if (st.isRecovery) {
                                st.isRecovery = false;
                                console.log("🎉 RECOVERY WIN → NORMAL MODE রিসেট");
                            }
                            console.log(`🎉 WIN! Total: ${st.totalWins}, Win Streak: ${st.currentWinStreak}`);
                        } else {
                            st.totalLosses++;
                            st.currentLossStreak++;
                            st.currentWinStreak = 0;
                            if (st.currentLossStreak > st.maxLossStreak) {
                                st.maxLossStreak = st.currentLossStreak;
                            }
                            st.lossCount++;
                            st.currentStep++;
                            
                            if (st.lossCount >= 3 && !st.isRecovery) {
                                st.isRecovery = true;
                                console.log(`⚠️ ৩টি LOSS → RECOVERY MODE চালু`);
                            }
                            console.log(`❌ LOSS! Total: ${st.totalLosses}, Loss Streak: ${st.currentLossStreak}, Step: ${st.currentStep}`);
                        }
                        updateUI();
                    }

                    st.lastPeriod = cSig;

                    if (st.timeLimit !== 'NO' && parseInt(st.timeLimit) > 0) {
                        if (st.tradesDone >= st.maxTrades && (st.curBal < st.target80Percent || st.totalBetAmount < 600)) {
                            st.isRun = false; clearInterval(st.autoInt);
                            uSts.innerText = 'FAIL'; uSts.className = 'drx-val val-loss';
                            lkOvl.style.display = 'none'; document.body.style.overflow = '';
                            let dWrapF = document.createElement('div');
                            dWrapF.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.95);padding:20px;border:2px solid #f00;border-radius:10px;z-index:99999999;text-align:center;box-shadow:0 0 40px #f00;';
                            dWrapF.innerHTML = `<h2 style="color:#f00;margin-bottom:10px;font-family:'Courier New', monospace;">❌ TASK FAILED (TIME LIMIT)</h2>
                                <p style="color:#fff;font-family:'Courier New', monospace;margin-bottom:5px;">Balance: ${st.curBal.toFixed(2)}</p>
                                <p style="color:#fff;font-family:'Courier New', monospace;margin-bottom:5px;">Total Bet: ${st.totalBetAmount.toFixed(2)} / 600</p>
                                <p style="color:#fff;font-family:'Courier New', monospace;margin-bottom:5px;">Total Signals: ${st.totalSignals}</p>
                                <button id="closeDWrapF" style="background:transparent;color:#f00;border:1px solid #f00;padding:5px 15px;cursor:pointer;font-family:'Courier New', monospace;">OK</button>`;
                            document.body.appendChild(dWrapF);
                            document.getElementById('closeDWrapF').onclick = () => dWrapF.remove();
                            return;
                        }
                    }

                    if (st.lastHist && parseInt(st.lastHist[0]) !== parseInt(sDig[0])) {
                        st.activeAI = st.isRecovery ? 'RECOVERY' : 'NORMAL';
                        let uiAi = document.getElementById('ui-ai');
                        if(uiAi) {
                            uiAi.innerText = uF(st.activeAI);
                            uiAi.className = st.isRecovery ? 'drx-val val-rec' : 'drx-val val-norm';
                        }
                    }
                    st.lastHist = sDig;
                    st.lastNumber = sDig[0];

                    let prediction = UserPatternLogic(sDig);

                    if (uSignal) {
                        if (prediction !== 'NO TRADE') {
                            uSignal.innerText = prediction;
                            uSignal.className = st.isRecovery ? 'drx-val val-rec' : 'drx-val val-norm';
                        } else {
                            uSignal.innerText = '---';
                            uSignal.className = 'drx-val val-white';
                        }
                    }

                    if (prediction === 'NO TRADE') {
                        uSts.innerText = 'WAIT'; 
                        uSts.className = 'drx-val val-sig';
                        sessionStorage.setItem('drx_sig', cSig);
                        st.lastPred = null; 
                        st.lastPeriod = null; 
                        return;
                    }

                    st.isTrd = true; uSts.innerText = 'CHK...'; uSts.className = 'drx-val val-sig';

                    setTimeout(() => {
                        let nBal = chkBal(); uBal.innerText = uF(nBal.toFixed(2));
                        
                        st.dynSeq = calcSeq(nBal, st.tgtAmt);
                        st.stpIdx = 0;
                        let tAmt = st.dynSeq[st.stpIdx];
                        uBet.innerText = uF(tAmt);

                        if(nBal < tAmt) { 
                            uSts.innerText = 'LOW'; 
                            uSts.className = 'drx-val val-loss'; 
                            st.isTrd = false; 
                            return; 
                        }

                        uSts.innerText = 'EXC...'; uSts.className = 'drx-val val-white';
                        st.lastPred = prediction;

                        if (st.mlActive) {
                            tAmt = Math.ceil(tAmt * 1.5);
                            uBet.innerText = uF(tAmt + ' (BOOST)');
                        }

                        st.totalBetAmount += tAmt;
                        updateUI();

                        exeTrd(prediction, tAmt, (suc) => {
                            if(suc) {
                                uSts.innerText = 'OK'; uSts.className = 'drx-val val-win';
                                sessionStorage.setItem('drx_sig', cSig); sessionStorage.setItem('drx_p_bal', st.curBal);
                                st.tradesDone++; 
                            } else { uSts.innerText = 'ERR'; uSts.className = 'drx-val val-loss'; }
                            setTimeout(() => { st.isTrd = false; }, 1000); 
                        });
                    }, cfg.syncDly);
                } else if(!st.isTrd) { 
                    uSts.innerText = 'SCAN'; uSts.className = 'drx-val val-scan'; 
                }
            } else {
                if(!st.isTrd) {
                    uSts.innerText = 'NO DATA'; 
                    uSts.className = 'drx-val val-loss';
                }
            }
        };

        goBtn.onclick = () => {
            if (window._checkAdminStatus()) return;

            let a = parseFloat(tgtInp.value); 
            st.extVal = parseFloat(mInp.value) || 0; 
            clearInterval(st.preScn);
            
            st.tradesDone = 0;
            st.isRecovery = false;
            st.lossCount = 0;
            st.currentStep = 0;
            st.totalSignals = 0;
            st.totalWins = 0;
            st.totalLosses = 0;
            st.maxLossStreak = 0;
            st.maxWinStreak = 0;
            st.currentLossStreak = 0;
            st.currentWinStreak = 0;
            st.totalBetAmount = 0; 
            
            if (st.timeLimit !== 'NO' && parseInt(st.timeLimit) > 0) {
                st.maxTrades = parseInt(st.timeLimit) * 2; 
            }

            // ✅ 3 Second Blue Scan Before Start
            scnUI(() => {
                sessionStorage.removeItem('drx_sig'); sessionStorage.removeItem('drx_p_bal');
                chkBal(); 
                
                st.initialBalance = st.curBal;
                // ✅ 80% Profit Target
                st.target80Percent = st.initialBalance * 1.80;
                st.tgtAmt = st.target80Percent; 
                
                st.dynSeq = calcSeq(st.curBal, st.tgtAmt); 
                st.stpIdx = 0; 
                document.getElementById('ui-tgt').innerText = uF(st.tgtAmt.toFixed(2));
                
                let pageText = document.body.innerText;
                let hMatches = [...pageText.matchAll(/(20\d{12,18})[\s\n]+(\d)[\s\n]+(Big|Small)/gi)];
                if (hMatches.length >= 5) {
                    let sDig = hMatches.map(m => parseInt(m[2]));
                    sessionStorage.setItem('drx_sig', sDig.slice(0, 5).join("-"));
                } else {
                    sessionStorage.setItem('drx_sig', '0-0-0-0-0');
                }

                p1.style.display = 'none'; p2.style.display = 'block';
                lkOvl.style.display = 'block'; document.body.style.overflow = 'hidden';

                st.isRun = true; st.isTrd = false; sessionStorage.setItem('drx_p_bal', st.curBal);
                document.getElementById('ui-sts').innerText = 'RDY';
                document.getElementById('ui-sts').className = 'drx-val val-white';
                updateUI();
                st.autoInt = setInterval(loopTask, cfg.fRt); 
            });
        };

        stpBtn.onclick = () => {
            st.isRun = false; clearInterval(st.autoInt);
            sessionStorage.removeItem('drx_sig'); sessionStorage.removeItem('drx_p_bal');
            document.getElementById('ui-sts').innerText = 'HLT'; 
            document.getElementById('ui-sts').className = 'drx-val val-loss';
            lkOvl.style.display = 'none'; document.body.style.overflow = '';
            
            stpBtn.innerText = 'RBT';
            stpBtn.onclick = () => {
                p2.style.display = 'none'; p1.style.display = 'block'; stpBtn.innerText = 'STOP';
                st.preScn = setInterval(() => { let b = chkBal(); document.getElementById('pre-bal').innerText = uF(b > 0 ? b.toFixed(2) : '--'); }, 1000);
            };
        };
    });
})();
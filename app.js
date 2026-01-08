// PWA Install
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'block';
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.style.display = 'none';
});

// Robot Control
let ROBOT_IP = "http://192.168.4.1";
let isRunning = false;
let shouldStop = false;

document.getElementById('robotIP').addEventListener('change', (e) => {
  ROBOT_IP = e.target.value;
  log('🔧 IP updated: ' + ROBOT_IP);
});

// Define Blocks
Blockly.Blocks['move_robot'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🚗 Move")
        .appendField(new Blockly.FieldDropdown([
            ["Forward⬆️", "forward"],
            ["Backward ⬇️", "backward"],
            ["Left ⬅️", "left"],
            ["Right ➡️", "right"]
        ]), "DIRECTION");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
  }
};

Blockly.Blocks['stop_robot'] = {
  init: function() {
    this.appendDummyInput().appendField("🛑 Stop Robot");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(0);
  }
};

Blockly.Blocks['wait_seconds'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("⏱️ Wait")
        .appendField(new Blockly.FieldNumber(1, 0.1, 10, 0.1), "SECONDS")
        .appendField("sec");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  }
};

Blockly.Blocks['set_speed'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("⚡ Speed")
        .appendField(new Blockly.FieldNumber(800, 0, 1023, 50), "SPEED");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
  }
};

Blockly.Blocks['repeat_times'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🔁 Repeat")
        .appendField(new Blockly.FieldNumber(4, 1, 100, 1), "TIMES")
        .appendField("times");
    this.appendStatementInput("DO");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
  }
};

Blockly.Blocks['print_message'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("💬 Print")
        .appendField(new Blockly.FieldTextInput("Hello!"), "MESSAGE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(65);
  }
};

// Toolbox
const toolbox = {
  "kind": "categoryToolbox",
  "contents": [
    {
      "kind": "category",
      "name": "Movement 🚗",
      "colour": 230,
      "contents": [
        { "kind": "block", "type": "move_robot" },
        { "kind": "block", "type": "stop_robot" },
        { "kind": "block", "type": "set_speed" }
      ]
    },
    {
      "kind": "category",
      "name": "Timing ⏱️",
      "colour": 160,
      "contents": [{ "kind": "block", "type": "wait_seconds" }]
    },
    {
      "kind": "category",
      "name": "Loops 🔁",
      "colour": 120,
      "contents": [
        { "kind": "block", "type": "repeat_times" },
        { "kind": "block", "type": "controls_repeat_ext" }
      ]
    },
    {
      "kind": "category",
      "name": "Variables 📊",
      "colour": 330,
      "custom": "VARIABLE"
    },
    {
      "kind": "category",
      "name": "Output 💬",
      "colour": 65,
      "contents": [{ "kind": "block", "type": "print_message" }]
    }
  ]
};

const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolbox,
  scrollbars: true,
  trashcan: true,
  zoom: { controls: true, wheel: true, startScale: 1.0 }
});

function log(msg, type='info') {
  const c = document.getElementById('console');
  const colors = {info:'#0f0',error:'#f44',warning:'#ff9800',success:'#4CAF50'};
  c.innerHTML += `<div style="color:${colors[type]}">[${new Date().toLocaleTimeString()}] ${msg}</div>`;
  c.scrollTop = c.scrollHeight;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function updateConnectionStatus(connected) {
  document.getElementById('statusDot').classList.toggle('connected', connected);
  document.getElementById('statusText').textContent = connected ? 'Connected ✓' : 'Disconnected';
}

async function sendCommand(action, value=null) {
  if (shouldStop && action!=='stop') return;
  try {
    let url = `${ROBOT_IP}/cmd?action=${action}`;
    if (value!==null) url += `&value=${value}`;
    const img = new Image();
    img.src = url + '&t=' + Date.now();
    updateConnectionStatus(true);
    await sleep(50);
    return true;
  } catch {
    updateConnectionStatus(false);
    return false;
  }
}

async function executeBlock(block) {
  if (!block || shouldStop) return;
  try {
    const type = block.type;
    if (type==='move_robot') {
      const dir = block.getFieldValue('DIRECTION');
      log(`🚗 ${dir}`);
      await sendCommand(dir);
    } else if (type==='stop_robot') {
      log('🛑 Stop');
      await sendCommand('stop');
    } else if (type==='wait_seconds') {
      const s = block.getFieldValue('SECONDS');
      log(`⏱️ Wait ${s}s`);
      await sleep(s*1000);
    } else if (type==='set_speed') {
      const sp = block.getFieldValue('SPEED');
      log(`⚡ Speed ${sp}`);
      await sendCommand('speed',sp);
    } else if (type==='repeat_times') {
      const times = block.getFieldValue('TIMES');
      log(`🔁 Repeat ${times}x`);
      for (let i=0; i<times && !shouldStop; i++) {
        let child = block.getInputTargetBlock('DO');
        while (child && !shouldStop) {
          await executeBlock(child);
          child = child.getNextBlock();
        }
      }
    } else if (type==='controls_repeat_ext') {
      const timesBlock = block.getInputTargetBlock('TIMES');
      let times = timesBlock ? timesBlock.getFieldValue('NUM') : 1;
      log(`🔁 Repeat ${times}x`);
      for (let i=0; i<times && !shouldStop; i++) {
        let child = block.getInputTargetBlock('DO');
        while (child && !shouldStop) {
          await executeBlock(child);
          child = child.getNextBlock();
        }
      }
    } else if (type==='print_message') {
      log(`💬 ${block.getFieldValue('MESSAGE')}`);
    }
    await sleep(50);
  } catch (err) {
    log(`❌ ${err.message}`,'error');
  }
}

async function runProgram() {
  if (isRunning) return;
  isRunning = true;
  shouldStop = false;
  const btn = document.getElementById('runBtn');
  btn.textContent = '⏳ Running...';
  btn.style.opacity = '0.6';
  document.getElementById('console').innerHTML = '';
  log('🚀 Starting...','success');
  
  for (const topBlock of workspace.getTopBlocks(true)) {
    if (shouldStop) break;
    let current = topBlock;
    while (current && !shouldStop) {
      await executeBlock(current);
      current = current.getNextBlock();
    }
  }
  
  if (!shouldStop) {
    log('✅ Complete!','success');
    await sendCommand('stop');
  }
  isRunning = false;
  btn.textContent = '▶️ Run Program';
  btn.style.opacity = '1';
}

async function stopProgram() {
  shouldStop = true;
  await sendCommand('stop');
  log('⏹️ Stopped','warning');
}

async function panicStop() {
  shouldStop = true;
  isRunning = false;
  await sendCommand('stop');
  log('🚨 EMERGENCY!','error');
}

async function testConnection() {
  log('📡 Testing...');
  await sendCommand('forward');
  await sleep(400);
  await sendCommand('backward');
  await sleep(400);
  await sendCommand('stop');
  log('✓ If robot moved, it works!','success');
}

function saveProgram() {
  const xml = Blockly.Xml.workspaceToDom(workspace);
  localStorage.setItem('robotProgram', Blockly.Xml.domToText(xml));
  log('💾 Saved!','success');
}

function loadProgram() {
  const xml = localStorage.getItem('robotProgram');
  if (xml) {
    workspace.clear();
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspace);
    log('📂 Loaded!','success');
  } else {
    log('❌ No saved program','error');
  }
}

function clearWorkspace() {
  if (confirm('Clear all blocks?')) {
    workspace.clear();
    log('🗑️ Cleared');
  }
}

function loadExample(type) {
  workspace.clear();
  const examples = {
    square: `<xml><block type="repeat_times" x="20" y="20"><field name="TIMES">4</field><statement name="DO"><block type="move_robot"><field name="DIRECTION">forward</field><next><block type="wait_seconds"><field name="SECONDS">1</field><next><block type="move_robot"><field name="DIRECTION">right</field><next><block type="wait_seconds"><field name="SECONDS">0.5</field></block></next></block></next></block></next></block></statement></block></xml>`,
    zigzag: `<xml><block type="repeat_times" x="20" y="20"><field name="TIMES">3</field><statement name="DO"><block type="move_robot"><field name="DIRECTION">forward</field><next><block type="wait_seconds"><field name="SECONDS">0.8</field><next><block type="move_robot"><field name="DIRECTION">right</field><next><block type="wait_seconds"><field name="SECONDS">0.5</field><next><block type="move_robot"><field name="DIRECTION">forward</field><next><block type="wait_seconds"><field name="SECONDS">0.8</field><next><block type="move_robot"><field name="DIRECTION">left</field><next><block type="wait_seconds"><field name="SECONDS">0.5</field></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></statement></block></xml>`,
    dance: `<xml><block type="set_speed" x="20" y="20"><field name="SPEED">900</field><next><block type="repeat_times"><field name="TIMES">3</field><statement name="DO"><block type="move_robot"><field name="DIRECTION">left</field><next><block type="wait_seconds"><field name="SECONDS">0.3</field><next><block type="move_robot"><field name="DIRECTION">right</field><next><block type="wait_seconds"><field name="SECONDS">0.3</field></block></next></block></next></block></next></block></statement><next><block type="stop_robot"></block></next></block></next></block></xml>`,
    counter: `<xml><variables><variable>count</variable></variables><block type="variables_set" x="20" y="20"><field name="VAR">count</field><value name="VALUE"><block type="math_number"><field name="NUM">0</field></block></value><next><block type="repeat_times"><field name="TIMES">5</field><statement name="DO"><block type="math_change"><field name="VAR">count</field><value name="DELTA"><block type="math_number"><field name="NUM">1</field></block></value><next><block type="print_message"><field name="MESSAGE">Moving...</field><next><block type="move_robot"><field name="DIRECTION">forward</field><next><block type="wait_seconds"><field name="SECONDS">0.5</field></block></next></block></next></block></next></block></statement><next><block type="stop_robot"></block></next></block></next></block></xml>`
  };
  if (examples[type]) {
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(examples[type]), workspace);
    log(`📚 ${type} loaded`,'success');
  }
}

document.getElementById('runBtn').addEventListener('click', runProgram);
document.getElementById('stopBtn').addEventListener('click', stopProgram);
document.getElementById('panicBtn').addEventListener('click', panicStop);
document.getElementById('saveBtn').addEventListener('click', saveProgram);
document.getElementById('loadBtn').addEventListener('click', loadProgram);
document.getElementById('clearBtn').addEventListener('click', clearWorkspace);
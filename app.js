// ========================================
// ⚙️ CONFIGURATION & INITIALIZATION
// ========================================
const SUPABASE_URL = 'https://temivphngaentnibijvu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlbWl2cGhuZ2FlbnRuaWJpanZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MTg4MjYsImV4cCI6MjA4NDM5NDgyNn0.ng7iTSxpxzf-IldB0pZGKhHbWFgX-VII_X1vd_FXIOs';

// Global Variables
window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let ROBOT_IP = "http://192.168.4.1";
let isRunning = false;
let shouldStop = false;
let shouldBreak = false;
const blocklyVariables = {};
let workspace = null;

// Initialize Offline Storage (with error handling)
let storage = null;
try {
  if (typeof OfflineStorage !== 'undefined') {
    storage = new OfflineStorage();
  } else {
    console.warn('⚠️ OfflineStorage not available - save/load will not work');
  }
} catch (error) {
  console.warn('⚠️ OfflineStorage initialization failed:', error);
}

async function initApp() {
  try {
    if (storage) {
      await storage.init();
      console.log('✅ Offline storage ready');
      setupOnlineOfflineDetection();
      if (navigator.onLine) {
        const result = await storage.syncNow();
        if (result.synced > 0) {
          log(`✅ ${result.synced} programs synced!`, 'success');
        }
      }
    } else {
      console.log('⚠️ Running without offline storage');
      updateConnectionStatus(navigator.onLine);
    }
  } catch (error) {
    console.error('❌ Init failed:', error);
    updateConnectionStatus(navigator.onLine);
  }
}

function setupOnlineOfflineDetection() {
  window.addEventListener('online', async () => {
    updateConnectionStatus(true);
    const result = await storage.syncNow();
    if (result.synced > 0) {
      log(`✅ ${result.synced} programs synced!`, 'success');
    }
  });
  
  window.addEventListener('offline', () => {
    updateConnectionStatus(false);
    log('⚠️ Offline mode', 'warning');
  });
  
  updateConnectionStatus(navigator.onLine);
}

// ========================================
// 📦 TOOLBOX DEFINITION
// ========================================
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
      "name": "Animations 🎬",
      "colour": 180,
      "contents": [
        { "kind": "block", "type": "animate_forward" },
        { "kind": "block", "type": "animate_backward" },
        { "kind": "block", "type": "animate_left" },
        { "kind": "block", "type": "animate_right" },
        { "kind": "block", "type": "animate_stop" },
        { "kind": "label", "text": "--- Fun Animations ---" },
        { "kind": "block", "type": "animate_powerup" },
        { "kind": "block", "type": "animate_highscore" },
        { "kind": "block", "type": "animate_turbo" },
        { "kind": "block", "type": "animate_party" },
        { "kind": "block", "type": "animate_coin" },
        { "kind": "block", "type": "animate_excited" },
        { "kind": "label", "text": "Practice safely!" }
      ]
    },
    {
      "kind": "category",
      "name": "Music 🎵",
      "colour": 290,
      "contents": [
        { "kind": "block", "type": "play_happy" },
        { "kind": "block", "type": "play_victory" },
        { "kind": "block", "type": "play_sad" },
        { "kind": "block", "type": "play_beep" },
        { "kind": "block", "type": "play_startup" },
        { "kind": "block", "type": "play_tone" }
      ]
    },
    {
      "kind": "category",
      "name": "Lights 💡",
      "colour": 60,
      "contents": [
        { "kind": "block", "type": "light_on" },
        { "kind": "block", "type": "light_off" },
        { "kind": "block", "type": "left_light_on" },
        { "kind": "block", "type": "right_light_on" },
        { "kind": "block", "type": "left_light_off" },
        { "kind": "block", "type": "right_light_off" },
        { "kind": "block", "type": "blink" },
        { "kind": "block", "type": "alternate" },
        { "kind": "block", "type": "flash" },
        { "kind": "block", "type": "police_light" },
        { "kind": "block", "type": "party_light" },
        { "kind": "block", "type": "chase_light" }
      ]
    },
    {
      "kind": "category",
      "name": "Display 📟",
      "colour": 65,
      "contents": [
        { "kind": "block", "type": "display_text" },
        { "kind": "block", "type": "display_message" },
        { "kind": "block", "type": "display_emoji" },
        { "kind": "block", "type": "progress_bar" },
        { "kind": "block", "type": "clear_display" }
      ]
    },
    {
      "kind": "category",
      "name": "Sensors 📡",
      "colour": 45,
      "contents": [
        { "kind": "block", "type": "get_distance" },
        { "kind": "block", "type": "show_distance_radar" },
        { "kind": "block", "type": "hide_distance_radar" },
        { "kind": "label", "text": "Ultrasonic sensor" }
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
        { "kind": "block", "type": "controls_repeat_ext" },
        { "kind": "block", "type": "controls_forever" },
        { "kind": "block", "type": "controls_break" }
      ]
    },
    {
      "kind": "category",
      "name": "Logic 🧠",
      "colour": 210,
      "contents": [
        { "kind": "block", "type": "controls_if" },
        { "kind": "block", "type": "logic_compare" },
        { "kind": "block", "type": "logic_operation" },
        { "kind": "block", "type": "logic_negate" },
        { "kind": "block", "type": "logic_boolean" }
      ]
    },
    {
      "kind": "category",
      "name": "Math 🔢",
      "colour": 230,
      "contents": [
        { "kind": "block", "type": "math_number" },
        { "kind": "block", "type": "math_arithmetic" },
        { "kind": "block", "type": "math_single" }
      ]
    },
    {
      "kind": "category",
      "name": "Variables 📊",
      "colour": 330,
      "contents": [
        { "kind": "block", "type": "simple_variable_set" },
        { "kind": "block", "type": "simple_variable_get" },
        { "kind": "block", "type": "simple_variable_change" }
      ]
    },
    {
      "kind": "category",
      "name": "Output 💬",
      "colour": 200,
      "contents": [
        { "kind": "block", "type": "print_message" },
        { "kind": "block", "type": "print_value" }
      ]
    }
  ]
};

// ========================================
// 🧱 BLOCK DEFINITIONS
// ========================================

// Movement Blocks
Blockly.Blocks['move_robot'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🚗 Move")
        .appendField(new Blockly.FieldDropdown([
            ["Forward ⬆️", "forward"],
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

// Animation Blocks
Blockly.Blocks['animate_forward'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🎬 Show Forward")
        .appendField(new Blockly.FieldNumber(1.0, 0.1, 10, 0.1), "DURATION")
        .appendField("sec");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(180);
    this.setTooltip("Show forward animation on OLED without moving");
  }
};

Blockly.Blocks['animate_backward'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🎬 Show Backward")
        .appendField(new Blockly.FieldNumber(1.0, 0.1, 10, 0.1), "DURATION")
        .appendField("sec");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(180);
    this.setTooltip("Show backward animation on OLED without moving");
  }
};

Blockly.Blocks['animate_left'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🎬 Show Left")
        .appendField(new Blockly.FieldNumber(0.5, 0.1, 10, 0.1), "DURATION")
        .appendField("sec");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(180);
    this.setTooltip("Show left turn animation on OLED without moving");
  }
};

Blockly.Blocks['animate_right'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🎬 Show Right")
        .appendField(new Blockly.FieldNumber(0.5, 0.1, 10, 0.1), "DURATION")
        .appendField("sec");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(180);
    this.setTooltip("Show right turn animation on OLED without moving");
  }
};

Blockly.Blocks['animate_stop'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🎬 Show Stop")
        .appendField(new Blockly.FieldNumber(0.5, 0.1, 10, 0.1), "DURATION")
        .appendField("sec");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(180);
    this.setTooltip("Show stop animation on OLED without moving");
  }
};

Blockly.Blocks['animate_powerup'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("⭐ Power Up")
        .appendField(new Blockly.FieldNumber(2.0, 0.5, 5, 0.5), "DURATION")
        .appendField("sec");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(180);
    this.setTooltip("Power-up animation");
  }
};

Blockly.Blocks['animate_highscore'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🏆 High Score")
        .appendField(new Blockly.FieldNumber(3.0, 0.5, 5, 0.5), "DURATION")
        .appendField("sec");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(180);
    this.setTooltip("Trophy celebration animation");
  }
};

Blockly.Blocks['animate_turbo'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🚀 Turbo Boost")
        .appendField(new Blockly.FieldNumber(1.0, 0.5, 3, 0.5), "DURATION")
        .appendField("sec");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(180);
    this.setTooltip("Turbo boost animation");
  }
};

Blockly.Blocks['animate_party'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🎉 Party Mode")
        .appendField(new Blockly.FieldNumber(2.0, 0.5, 5, 0.5), "DURATION")
        .appendField("sec");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(180);
    this.setTooltip("Party celebration animation");
  }
};

Blockly.Blocks['animate_coin'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🪙 Coin Collect")
        .appendField(new Blockly.FieldNumber(0.5, 0.3, 2, 0.1), "DURATION")
        .appendField("sec");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(180);
    this.setTooltip("Coin collection animation");
  }
};

Blockly.Blocks['animate_excited'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🤩 Excited")
        .appendField(new Blockly.FieldNumber(1.5, 0.5, 3, 0.5), "DURATION")
        .appendField("sec");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(180);
    this.setTooltip("Excitement animation");
  }
};

// Music Blocks
Blockly.Blocks['play_happy'] = {
  init: function() {
    this.appendDummyInput().appendField("🎵 Play Happy");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("Play happy melody");
  }
};

Blockly.Blocks['play_victory'] = {
  init: function() {
    this.appendDummyInput().appendField("🎺 Play Victory");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("Play victory melody");
  }
};

Blockly.Blocks['play_sad'] = {
  init: function() {
    this.appendDummyInput().appendField("🎻 Play Sad");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("Play sad melody");
  }
};

Blockly.Blocks['play_beep'] = {
  init: function() {
    this.appendDummyInput().appendField("📣 Play Beep");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("Simple beep sound");
  }
};

Blockly.Blocks['play_startup'] = {
  init: function() {
    this.appendDummyInput().appendField("🎶 Play Startup");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("Startup sound");
  }
};

Blockly.Blocks['play_tone'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🎼 Play Tone")
        .appendField(new Blockly.FieldNumber(440, 100, 2000, 50), "FREQ")
        .appendField("Hz")
        .appendField(new Blockly.FieldNumber(500, 100, 3000, 100), "DUR")
        .appendField("ms");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("Play custom tone");
  }
};

// Light Blocks
Blockly.Blocks['light_on'] = {
  init: function() {
    this.appendDummyInput().appendField("💡 Lights ON");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip("Turn both LEDs on");
  }
};

Blockly.Blocks['light_off'] = {
  init: function() {
    this.appendDummyInput().appendField("🔦 Lights OFF");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip("Turn both LEDs off");
  }
};

Blockly.Blocks['left_light_on'] = {
  init: function() {
    this.appendDummyInput().appendField("💡 Left ON");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip("Left LED on");
  }
};

Blockly.Blocks['right_light_on'] = {
  init: function() {
    this.appendDummyInput().appendField("💡 Right ON");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip("Right LED on");
  }
};

Blockly.Blocks['left_light_off'] = {
  init: function() {
    this.appendDummyInput().appendField("🔦 Left OFF");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip("Left LED off");
  }
};

Blockly.Blocks['right_light_off'] = {
  init: function() {
    this.appendDummyInput().appendField("🔦 Right OFF");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip("Right LED off");
  }
};

Blockly.Blocks['blink'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("✨ Blink")
        .appendField(new Blockly.FieldNumber(3, 1, 20, 1), "TIMES")
        .appendField("times");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip("Blink both LEDs");
  }
};

Blockly.Blocks['alternate'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🔄 Alternate")
        .appendField(new Blockly.FieldNumber(3, 1, 20, 1), "TIMES")
        .appendField("times");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip("Alternate L/R");
  }
};

Blockly.Blocks['flash'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("⚡ Flash")
        .appendField(new Blockly.FieldNumber(5, 1, 20, 1), "TIMES")
        .appendField("times");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip("Fast flash");
  }
};

Blockly.Blocks['police_light'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🚨 Police")
        .appendField(new Blockly.FieldNumber(2, 1, 10, 1), "DUR")
        .appendField("sec");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip("Police siren");
  }
};

Blockly.Blocks['party_light'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🎉 Party")
        .appendField(new Blockly.FieldNumber(2, 1, 10, 1), "DUR")
        .appendField("sec");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip("Random party");
  }
};

Blockly.Blocks['chase_light'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🌀 Chase")
        .appendField(new Blockly.FieldNumber(3, 1, 20, 1), "TIMES")
        .appendField("times");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip("Chase pattern");
  }
};

// Display Blocks
Blockly.Blocks['display_text'] = {
  init: function() {
    this.appendValueInput("VALUE")
        .appendField("📟 Display");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(65);
    this.setTooltip("Show text or variable on robot's OLED screen");
  }
};

Blockly.Blocks['display_message'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("💬 Show Text")
        .appendField(new Blockly.FieldTextInput("Hello!"), "TEXT");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(65);
    this.setTooltip("Show simple text message on OLED screen");
  }
};

Blockly.Blocks['display_emoji'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("😊 Emoji")
        .appendField(new Blockly.FieldDropdown([
            ["Happy 😊", "happy"],
            ["Sad 😢", "sad"],
            ["Angry 😠", "angry"],
            ["Cool 😎", "cool"]
        ]), "EMOTION");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(65);
    this.setTooltip("Show emoji face on OLED screen");
  }
};

Blockly.Blocks['clear_display'] = {
  init: function() {
    this.appendDummyInput().appendField("🧹 Clear Display");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(65);
    this.setTooltip("Clear the OLED screen");
  }
};

Blockly.Blocks['progress_bar'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📊 Progress")
        .appendField(new Blockly.FieldNumber(50, 0, 100, 1), "PERCENT")
        .appendField("%");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(65);
    this.setTooltip("Show progress bar on OLED screen");
  }
};

// Sensor Blocks
Blockly.Blocks['get_distance'] = {
  init: function() {
    this.appendDummyInput().appendField("📡 Distance (cm)");
    this.setOutput(true, "Number");
    this.setColour(45);
    this.setTooltip("Get distance from ultrasonic sensor");
  }
};

Blockly.Blocks['show_distance_radar'] = {
  init: function() {
    this.appendDummyInput().appendField("📡 Show Radar");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(45);
    this.setTooltip("Show live distance radar on OLED");
  }
};

Blockly.Blocks['hide_distance_radar'] = {
  init: function() {
    this.appendDummyInput().appendField("📡 Hide Radar");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(45);
    this.setTooltip("Hide distance radar display");
  }
};

// Timing Blocks
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

// Loop Blocks
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

Blockly.Blocks['controls_forever'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🔁 Forever");
    this.appendStatementInput("DO")
        .appendField("do");
    this.setPreviousStatement(true, null);
    this.setColour(120);
    this.setTooltip("Loop forever (until break or stop button)");
  }
};

Blockly.Blocks['controls_break'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🚪 Break");
    this.setPreviousStatement(true, null);
    this.setColour(120);
    this.setTooltip("Exit the current loop");
  }
};

// Output Blocks
Blockly.Blocks['print_message'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("💬 Print")
        .appendField(new Blockly.FieldTextInput("Hello!"), "MESSAGE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(200);
    this.setTooltip("Print a simple text message to console");
  }
};

Blockly.Blocks['print_value'] = {
  init: function() {
    this.appendValueInput("VALUE")
        .appendField("🖨️ Print");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(200);
    this.setTooltip("Print any value (text, number, variable) to console");
  }
};

// ========================================
// 📊 SIMPLE VARIABLE BLOCKS (No Popup!)
// ========================================
Blockly.Blocks['simple_variable_set'] = {
  init: function() {
    this.appendValueInput("VALUE")
        .appendField("📊 set")
        .appendField(new Blockly.FieldTextInput("variable"), "VAR")
        .appendField("to");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip("Set a variable to a value. Just type the variable name!");
  }
};

Blockly.Blocks['simple_variable_get'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📊")
        .appendField(new Blockly.FieldTextInput("variable"), "VAR");
    this.setOutput(true, null);
    this.setColour(330);
    this.setTooltip("Get the value of a variable. Just type the variable name!");
  }
};

Blockly.Blocks['simple_variable_change'] = {
  init: function() {
    this.appendValueInput("DELTA")
        .appendField("📊 change")
        .appendField(new Blockly.FieldTextInput("variable"), "VAR")
        .appendField("by");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip("Change a variable by adding or subtracting a number");
  }
};

// ========================================
// 🛠️ HELPER FUNCTIONS
// ========================================
function log(msg, type='info') {
  const c = document.getElementById('console');
  if (!c) return;
  const colors = {info:'#0f0',error:'#f44',warning:'#ff9800',success:'#4CAF50'};
  c.innerHTML += `<div style="color:${colors[type]}">[${new Date().toLocaleTimeString()}] ${msg}</div>`;
  c.scrollTop = c.scrollHeight;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function updateConnectionStatus(connected) {
  const dot = document.getElementById('statusDot');
  const txt = document.getElementById('statusText');
  if (dot) dot.classList.toggle('connected', connected);
  if (txt) txt.textContent = connected ? 'Connected ✓' : 'Disconnected';
}

async function sendCommand(action, value=null) {
  if (shouldStop && action!=='stop') return;
  try {
    let url = `${ROBOT_IP}/cmd?action=${action}`;
    if (value!==null) {
      if (action === 'display') {
        url += `&text=${value}`;
      } else {
        url += `&value=${value}`;
      }
    }
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

async function getDistanceValue() {
  try {
    const response = await fetch(`${ROBOT_IP}/cmd?action=distance`);
    const text = await response.text();
    return parseInt(text) || 0;
  } catch {
    return 0;
  }
}

// ========================================
// ⚙️ EXECUTION ENGINE
// ========================================
async function executeBlock(block) {
  if (!block || shouldStop) return;
  try {
    const type = block.type;
    
    // Movement blocks
    if (type==='move_robot') {
      const dir = block.getFieldValue('DIRECTION');
      log(`🚗 ${dir}`);
      await sendCommand(dir);
    } 
    else if (type==='stop_robot') {
      log('🛑 Stop');
      await sendCommand('stop');
    } 
    else if (type==='set_speed') {
      const sp = block.getFieldValue('SPEED');
      log(`⚡ Speed ${sp}`);
      await sendCommand('speed', sp);
    }
    
    // Animation blocks
    else if (type==='animate_forward') {
      const dur = block.getFieldValue('DURATION');
      log(`🎬 Forward animation ${dur}s`);
      await sendCommand('anim_forward', dur);
      await sleep(dur * 1000);
    }
    else if (type==='animate_backward') {
      const dur = block.getFieldValue('DURATION');
      log(`🎬 Backward animation ${dur}s`);
      await sendCommand('anim_backward', dur);
      await sleep(dur * 1000);
    }
    else if (type==='animate_left') {
      const dur = block.getFieldValue('DURATION');
      log(`🎬 Left animation ${dur}s`);
      await sendCommand('anim_left', dur);
      await sleep(dur * 1000);
    }
    else if (type==='animate_right') {
      const dur = block.getFieldValue('DURATION');
      log(`🎬 Right animation ${dur}s`);
      await sendCommand('anim_right', dur);
      await sleep(dur * 1000);
    }
    else if (type==='animate_stop') {
      const dur = block.getFieldValue('DURATION');
      log(`🎬 Stop animation ${dur}s`);
      await sendCommand('anim_stop', dur);
      await sleep(dur * 1000);
    }
    else if (type==='animate_powerup') {
      const dur = block.getFieldValue('DURATION');
      log(`⭐ Power Up animation ${dur}s`);
      await sendCommand('show_powerup', dur);
      await sleep(dur * 1000);
    }
    else if (type==='animate_highscore') {
      const dur = block.getFieldValue('DURATION');
      log(`🏆 High Score animation ${dur}s`);
      await sendCommand('show_trophy', dur);
      await sleep(dur * 1000);
    }
    else if (type==='animate_turbo') {
      const dur = block.getFieldValue('DURATION');
      log(`🚀 Turbo Boost animation ${dur}s`);
      await sendCommand('show_rocket', dur);
      await sleep(dur * 1000);
    }
    else if (type==='animate_party') {
      const dur = block.getFieldValue('DURATION');
      log(`🎉 Party animation ${dur}s`);
      await sendCommand('show_party', dur);
      await sleep(dur * 1000);
    }
    else if (type==='animate_coin') {
      const dur = block.getFieldValue('DURATION');
      log(`🪙 Coin Collect animation ${dur}s`);
      await sendCommand('show_coins', dur);
      await sleep(dur * 1000);
    }
    else if (type==='animate_excited') {
      const dur = block.getFieldValue('DURATION');
      log(`🤩 Excited animation ${dur}s`);
      await sendCommand('show_excitement', dur);
      await sleep(dur * 1000);
    }
    
    // Music blocks
    else if (type==='play_happy') {
      log('🎵 Happy melody');
      await sendCommand('play_happy');
      await sleep(500);
    }
    else if (type==='play_victory') {
      log('🎺 Victory melody');
      await sendCommand('play_victory');
      await sleep(800);
    }
    else if (type==='play_sad') {
      log('🎻 Sad melody');
      await sendCommand('play_sad');
      await sleep(600);
    }
    else if (type==='play_beep') {
      log('📣 Beep');
      await sendCommand('play_beep');
      await sleep(300);
    }
    else if (type==='play_startup') {
      log('🎶 Startup');
      await sendCommand('play_startup');
      await sleep(700);
    }
    else if (type==='play_tone') {
      const freq = block.getFieldValue('FREQ');
      const dur = block.getFieldValue('DUR');
      log(`🎼 Tone ${freq}Hz ${dur}ms`);
      const url = ROBOT_IP + '/cmd?action=play_tone&freq=' + freq + '&dur=' + dur;
      try { await fetch(url); } catch(e) {}
      await sleep(parseInt(dur));
    }
    
    // LED Light blocks
    else if (type==='light_on') {
      log('💡 Lights ON');
      await sendCommand('light_on');
    }
    else if (type==='light_off') {
      log('🔦 Lights OFF');
      await sendCommand('light_off');
    }
    else if (type==='left_light_on') {
      log('💡 Left ON');
      await sendCommand('left_light_on');
    }
    else if (type==='right_light_on') {
      log('💡 Right ON');
      await sendCommand('right_light_on');
    }
    else if (type==='left_light_off') {
      log('🔦 Left OFF');
      await sendCommand('left_light_off');
    }
    else if (type==='right_light_off') {
      log('🔦 Right OFF');
      await sendCommand('right_light_off');
    }
    else if (type==='blink') {
      const times = block.getFieldValue('TIMES');
      log(`✨ Blink ${times}x`);
      const url = ROBOT_IP + '/cmd?action=blink&times=' + times;
      try { await fetch(url); } catch(e) {}
      await sleep(times * 400);
    }
    else if (type==='alternate') {
      const times = block.getFieldValue('TIMES');
      log(`🔄 Alternate ${times}x`);
      const url = ROBOT_IP + '/cmd?action=alternate&times=' + times;
      try { await fetch(url); } catch(e) {}
      await sleep(times * 400);
    }
    else if (type==='flash') {
      const times = block.getFieldValue('TIMES');
      log(`⚡ Flash ${times}x`);
      const url = ROBOT_IP + '/cmd?action=flash&times=' + times;
      try { await fetch(url); } catch(e) {}
      await sleep(times * 100);
    }
    else if (type==='police_light') {
      const dur = block.getFieldValue('DUR');
      log(`🚨 Police ${dur}s`);
      const url = ROBOT_IP + '/cmd?action=police_light&dur=' + dur;
      try { await fetch(url); } catch(e) {}
      await sleep(dur * 1000);
    }
    else if (type==='party_light') {
      const dur = block.getFieldValue('DUR');
      log(`🎉 Party ${dur}s`);
      const url = ROBOT_IP + '/cmd?action=party_light&dur=' + dur;
      try { await fetch(url); } catch(e) {}
      await sleep(dur * 1000);
    }
    else if (type==='chase_light') {
      const times = block.getFieldValue('TIMES');
      log(`🌀 Chase ${times}x`);
      const url = ROBOT_IP + '/cmd?action=chase_light&times=' + times;
      try { await fetch(url); } catch(e) {}
      await sleep(times * 400);
    }
    
    // Display blocks
    else if (type==='display_text') {
      const valueBlock = block.getInputTargetBlock('VALUE');
      let text = 'Hello!';
      if (valueBlock) {
        const val = await executeBlock(valueBlock);
        text = (val !== undefined && val !== null) ? String(val) : 'Hello!';
      }
      log(`📟 Display: ${text}`);
      await sendCommand('display', encodeURIComponent(text));
    }
    else if (type==='display_message') {
      const text = block.getFieldValue('TEXT');
      log(`💬 Show: ${text}`);
      await sendCommand('display', encodeURIComponent(text));
    }
    else if (type==='display_emoji') {
      const emotion = block.getFieldValue('EMOTION');
      log(`😊 Emoji: ${emotion}`);
      await sendCommand('emoji', emotion);
    }
    else if (type==='clear_display') {
      log('🧹 Clear display');
      await sendCommand('clear');
    }
    else if (type==='progress_bar') {
      const percent = block.getFieldValue('PERCENT');
      log(`📊 Progress: ${percent}%`);
      await sendCommand('bar', percent);
    }
    
    // Sensor blocks
    else if (type==='get_distance') {
      const dist = await getDistanceValue();
      log(`📡 Distance: ${dist} cm`);
      return dist;
    }
    else if (type==='show_distance_radar') {
      log('📡 Radar ON');
      await sendCommand('show_distance');
    }
    else if (type==='hide_distance_radar') {
      log('📡 Radar OFF');
      await sendCommand('hide_distance');
    }
    
    // Timing blocks
    else if (type==='wait_seconds') {
      const s = block.getFieldValue('SECONDS');
      log(`⏱️ Wait ${s}s`);
      await sleep(s*1000);
    } 
    
    // Loop blocks
    else if (type==='repeat_times') {
      const times = block.getFieldValue('TIMES');
      log(`🔁 Repeat ${times}x`);
      for (let i=0; i<times && !shouldStop; i++) {
        let child = block.getInputTargetBlock('DO');
        while (child && !shouldStop) {
          await executeBlock(child);
          child = child.getNextBlock();
        }
      }
    }
    else if (type==='controls_repeat_ext') {
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
    }
    else if (type==='controls_forever') {
      log('🔁 Forever loop started');
      let iterations = 0;
      const MAX_ITERATIONS = 100000; // Safety limit
      
      while (!shouldStop && !shouldBreak && iterations < MAX_ITERATIONS) {
        let child = block.getInputTargetBlock('DO');
        while (child && !shouldStop && !shouldBreak) {
          await executeBlock(child);
          child = child.getNextBlock();
        }
        iterations++;
        await sleep(10); // Small delay to prevent browser freeze
      }
      
      if (iterations >= MAX_ITERATIONS) {
        log('⚠️ Forever loop safety limit reached (100000 iterations)', 'warning');
      }
      
      if (shouldBreak) {
        log('🚪 Break - exited forever loop');
        shouldBreak = false; // Reset for next loop
      }
    }
    else if (type==='controls_break') {
      log('🚪 Break');
      shouldBreak = true;
    }
    
    // Output blocks
    else if (type==='print_message') {
      log(`💬 ${block.getFieldValue('MESSAGE')}`);
    }
    else if (type==='print_value') {
      const valueBlock = block.getInputTargetBlock('VALUE');
      let value = '';
      
      if (valueBlock) {
        const val = await executeBlock(valueBlock);
        
        // If it's a simple variable, show the name
        if (valueBlock.type === 'simple_variable_get') {
          const varName = valueBlock.getFieldValue('VAR');
          value = `${varName} = ${val}`;
        } 
        // If it's old-style variable, get the name from workspace
        else if (valueBlock.type === 'variables_get') {
          const varId = valueBlock.getFieldValue('VAR');
          const variable = workspace.getVariableById(varId);
          const varName = variable ? variable.name : 'unknown';
          value = `${varName} = ${val}`;
        } else {
          value = (val !== undefined && val !== null) ? String(val) : '';
        }
      }
      
      log(`🖨️ ${value}`);
    }
    
    // Simple Variable blocks (NEW! - No popup needed)
    else if (type==='simple_variable_set') {
      const varName = block.getFieldValue('VAR').trim();
      const valueBlock = block.getInputTargetBlock('VALUE');
      let value = 0;
      
      if (valueBlock) {
        const val = await executeBlock(valueBlock);
        value = (val !== undefined && val !== null) ? val : 0;
      }
      
      blocklyVariables[varName] = value;
      log(`📊 ${varName} = ${value}`);
    }
    else if (type==='simple_variable_get') {
      const varName = block.getFieldValue('VAR').trim();
      const value = blocklyVariables[varName] || 0;
      return value;
    }
    else if (type==='simple_variable_change') {
      const varName = block.getFieldValue('VAR').trim();
      const deltaBlock = block.getInputTargetBlock('DELTA');
      let delta = 1;
      
      if (deltaBlock) {
        const val = await executeBlock(deltaBlock);
        delta = (val !== undefined && val !== null) ? val : 1;
      }
      
      const currentValue = blocklyVariables[varName] || 0;
      blocklyVariables[varName] = currentValue + delta;
      log(`📊 ${varName} changed by ${delta} to ${blocklyVariables[varName]}`);
    }
    
    // Math blocks
    else if (type==='math_number') {
      return parseFloat(block.getFieldValue('NUM'));
    }
    else if (type==='math_arithmetic') {
      const leftBlock = block.getInputTargetBlock('A');
      const rightBlock = block.getInputTargetBlock('B');
      const op = block.getFieldValue('OP');
      
      const left = leftBlock ? await executeBlock(leftBlock) : 0;
      const right = rightBlock ? await executeBlock(rightBlock) : 0;
      
      switch(op) {
        case 'ADD': return left + right;
        case 'MINUS': return left - right;
        case 'MULTIPLY': return left * right;
        case 'DIVIDE': return right !== 0 ? left / right : 0;
        case 'POWER': return Math.pow(left, right);
        default: return 0;
      }
    }
    
    // Logic blocks
    else if (type==='logic_compare') {
      const leftBlock = block.getInputTargetBlock('A');
      const rightBlock = block.getInputTargetBlock('B');
      const op = block.getFieldValue('OP');
      
      const left = leftBlock ? await executeBlock(leftBlock) : 0;
      const right = rightBlock ? await executeBlock(rightBlock) : 0;
      
      switch(op) {
        case 'EQ': return left == right;
        case 'NEQ': return left != right;
        case 'LT': return left < right;
        case 'LTE': return left <= right;
        case 'GT': return left > right;
        case 'GTE': return left >= right;
        default: return false;
      }
    }
    else if (type==='logic_boolean') {
      return block.getFieldValue('BOOL') === 'TRUE';
    }
    
    // If/Else blocks
    else if (type==='controls_if') {
      const conditionBlock = block.getInputTargetBlock('IF0');
      if (conditionBlock) {
        const condition = await executeBlock(conditionBlock);
        if (condition) {
          let child = block.getInputTargetBlock('DO0');
          while (child && !shouldStop) {
            await executeBlock(child);
            child = child.getNextBlock();
          }
        } else {
          const elseChild = block.getInputTargetBlock('ELSE');
          if (elseChild) {
            let child = elseChild;
            while (child && !shouldStop) {
              await executeBlock(child);
              child = child.getNextBlock();
            }
          }
        }
      }
    }
    
    // Text blocks
    else if (type==='text') {
      return block.getFieldValue('TEXT');
    }
    
    await sleep(50);
  } catch (err) {
    log(`❌ ${err.message}`, 'error');
  }
}

// ========================================
// 🎮 CONTROLS
// ========================================
async function runProgram() {
  if (isRunning) return;
  isRunning = true;
  shouldStop = false;
  shouldBreak = false;
  Object.keys(blocklyVariables).forEach(key => delete blocklyVariables[key]);
  
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
  log('🔡 Testing...');
  await sendCommand('forward');
  await sleep(400);
  await sendCommand('backward');
  await sleep(400);
  await sendCommand('stop');
  log('✓ If robot moved, it works!','success');
}

function clearWorkspace() {
  if (confirm('Clear all blocks?')) {
    workspace.clear();
    log('🗑️ Workspace cleared', 'info');
  }
}

// ========================================
// 💾 SAVE/LOAD FUNCTIONS
// ========================================
function saveProgram() {
  if (!storage) {
    alert('⚠️ Storage not available. Please make sure offline-storage.js is loaded.');
    return;
  }
  document.getElementById('saveModal').classList.add('show');
  document.getElementById('programNameInput').value = '';
  document.getElementById('programNameInput').focus();
}

async function confirmSave() {
  if (!storage) {
    alert('⚠️ Storage not available');
    return;
  }
  try {
    const programName = document.getElementById('programNameInput').value.trim();
    if (!programName) {
      log('❌ Please enter a name', 'error');
      return;
    }
    const xml = Blockly.Xml.workspaceToDom(workspace);
    await storage.saveProgram({
      name: programName,
      xml: Blockly.Xml.domToText(xml),
      code: ''
    });
    log(`💾 "${programName}" saved!`, 'success');
    closeSaveModal();
  } catch (error) {
    log('❌ Save failed: ' + error.message, 'error');
  }
}

function closeSaveModal() {
  document.getElementById('saveModal').classList.remove('show');
}

async function loadProgram() {
  if (!storage) {
    alert('⚠️ Storage not available. Please make sure offline-storage.js is loaded.');
    return;
  }
  try {
    const programs = await storage.getAllPrograms();
    if (programs.length === 0) {
      log('❌ No saved programs', 'error');
      return;
    }
    displayProgramsInModal(programs);
    document.getElementById('loadModal').classList.add('show');
  } catch (error) {
    log('❌ Load failed: ' + error.message, 'error');
  }
}

function displayProgramsInModal(programs) {
  const listEl = document.getElementById('programList');
  programs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const html = programs.map(p => `
    <li class="program-item">
      <div class="program-info">
        <div class="program-name">${escapeHtml(p.name)}</div>
        <div class="program-meta">${new Date(p.created_at).toLocaleDateString()} • ${p.synced ? '☁️' : '📱'}</div>
      </div>
      <div class="program-actions">
        <button class="program-action-btn btn-load" onclick="loadProgramById(${p.id})">Load</button>
        <button class="program-action-btn btn-delete" onclick="deleteProgram(${p.id})">🗑️</button>
      </div>
    </li>
  `).join('');
  listEl.innerHTML = html || '<li style="padding:20px;text-align:center;color:#999;">No programs</li>';
}

async function loadProgramById(id) {
  if (!storage) {
    alert('⚠️ Storage not available');
    return;
  }
  try {
    const program = await storage.getProgram(id);
    workspace.clear();
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(program.blockly_xml), workspace);
    log(`📂 Loaded "${program.name}"`, 'success');
    closeLoadModal();
  } catch (error) {
    log('❌ Load failed: ' + error.message, 'error');
  }
}

async function deleteProgram(id) {
  if (!storage) {
    alert('⚠️ Storage not available');
    return;
  }
  if (!confirm('Delete this program?')) return;
  try {
    await storage.deleteProgram(id);
    log('🗑️ Deleted', 'success');
    loadProgram();
  } catch (error) {
    log('❌ Delete failed: ' + error.message, 'error');
  }
}

function closeLoadModal() {
  document.getElementById('loadModal').classList.remove('show');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ========================================
// 📚 EXAMPLE PROGRAMS
// ========================================
function loadExample(type) {
  workspace.clear();
  const examples = {
    square: `<xml><block type="repeat_times" x="20" y="20"><field name="TIMES">4</field><statement name="DO"><block type="move_robot"><field name="DIRECTION">forward</field><next><block type="wait_seconds"><field name="SECONDS">1</field><next><block type="move_robot"><field name="DIRECTION">right</field><next><block type="wait_seconds"><field name="SECONDS">0.5</field></block></next></block></next></block></next></block></statement></block></xml>`,
    
    zigzag: `<xml><block type="repeat_times" x="20" y="20"><field name="TIMES">3</field><statement name="DO"><block type="move_robot"><field name="DIRECTION">forward</field><next><block type="wait_seconds"><field name="SECONDS">0.8</field><next><block type="move_robot"><field name="DIRECTION">right</field><next><block type="wait_seconds"><field name="SECONDS">0.5</field><next><block type="move_robot"><field name="DIRECTION">forward</field><next><block type="wait_seconds"><field name="SECONDS">0.8</field><next><block type="move_robot"><field name="DIRECTION">left</field><next><block type="wait_seconds"><field name="SECONDS">0.5</field></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></statement></block></xml>`,
    
    dance: `<xml><block type="set_speed" x="20" y="20"><field name="SPEED">900</field><next><block type="repeat_times"><field name="TIMES">3</field><statement name="DO"><block type="move_robot"><field name="DIRECTION">left</field><next><block type="wait_seconds"><field name="SECONDS">0.3</field><next><block type="move_robot"><field name="DIRECTION">right</field><next><block type="wait_seconds"><field name="SECONDS">0.3</field></block></next></block></next></block></next></block></statement><next><block type="stop_robot"></block></next></block></next></block></xml>`,
    
    counter: `<xml><block type="simple_variable_set" x="20" y="20"><field name="VAR">count</field><value name="VALUE"><block type="math_number"><field name="NUM">0</field></block></value><next><block type="repeat_times"><field name="TIMES">5</field><statement name="DO"><block type="simple_variable_change"><field name="VAR">count</field><value name="DELTA"><block type="math_number"><field name="NUM">1</field></block></value><next><block type="print_value"><value name="VALUE"><block type="simple_variable_get"><field name="VAR">count</field></block></value><next><block type="display_text"><value name="VALUE"><block type="simple_variable_get"><field name="VAR">count</field></block></value><next><block type="move_robot"><field name="DIRECTION">forward</field><next><block type="wait_seconds"><field name="SECONDS">0.5</field></block></next></block></next></block></next></block></next></block></statement><next><block type="stop_robot"></block></next></block></next></block></xml>`,
    
    animations: `<xml><block type="display_text" x="20" y="20"><value name="VALUE"><block type="text"><field name="TEXT">Watch me!</field></block></value><next><block type="display_emoji"><field name="EMOTION">happy</field><next><block type="wait_seconds"><field name="SECONDS">1</field><next><block type="repeat_times"><field name="TIMES">3</field><statement name="DO"><block type="animate_forward"><field name="DURATION">1</field><next><block type="animate_right"><field name="DURATION">0.5</field></block></next></block></statement><next><block type="animate_stop"><field name="DURATION">0.5</field><next><block type="display_emoji"><field name="EMOTION">cool</field></block></next></block></next></block></next></block></next></block></next></block></xml>`,
    
    radar: `<xml><block type="display_text" x="20" y="20"><value name="VALUE"><block type="text"><field name="TEXT">Radar Demo</field></block></value><next><block type="wait_seconds"><field name="SECONDS">1</field><next><block type="show_distance_radar"><next><block type="wait_seconds"><field name="SECONDS">5</field><next><block type="hide_distance_radar"><next><block type="display_emoji"><field name="EMOTION">cool</field></block></next></block></next></block></next></block></next></block></next></block></xml>`,
    
    progress: `<xml><block type="display_text" x="20" y="20"><value name="VALUE"><block type="text"><field name="TEXT">Loading...</field></block></value><next><block type="wait_seconds"><field name="SECONDS">0.5</field><next><block type="progress_bar"><field name="PERCENT">25</field><next><block type="wait_seconds"><field name="SECONDS">0.5</field><next><block type="progress_bar"><field name="PERCENT">50</field><next><block type="wait_seconds"><field name="SECONDS">0.5</field><next><block type="progress_bar"><field name="PERCENT">75</field><next><block type="wait_seconds"><field name="SECONDS">0.5</field><next><block type="progress_bar"><field name="PERCENT">100</field><next><block type="wait_seconds"><field name="SECONDS">0.5</field><next><block type="display_emoji"><field name="EMOTION">happy</field></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></xml>`,
    
    treasure: `<xml><block type="display_text" x="20" y="20"><field name="TEXT">Treasure!</field><next><block type="animate_excited"><field name="DURATION">1.5</field><next><block type="repeat_times"><field name="TIMES">3</field><statement name="DO"><block type="move_robot"><field name="DIRECTION">forward</field><next><block type="wait_seconds"><field name="SECONDS">1</field><next><block type="animate_coin"><field name="DURATION">0.5</field></block></next></block></next></block></statement><next><block type="stop_robot"><next><block type="animate_highscore"><field name="DURATION">3</field><next><block type="animate_party"><field name="DURATION">2</field></block></next></block></next></block></next></block></next></block></next></block></xml>`,
    
    speedrun: `<xml><block type="display_text" x="20" y="20"><field name="TEXT">Speed!</field><next><block type="animate_powerup"><field name="DURATION">2</field><next><block type="set_speed"><field name="SPEED">900</field><next><block type="animate_turbo"><field name="DURATION">1</field><next><block type="repeat_times"><field name="TIMES">5</field><statement name="DO"><block type="move_robot"><field name="DIRECTION">forward</field><next><block type="wait_seconds"><field name="SECONDS">0.5</field><next><block type="animate_coin"><field name="DURATION">0.3</field></block></next></block></next></block></statement><next><block type="stop_robot"><next><block type="animate_highscore"><field name="DURATION">3</field></block></next></block></next></block></next></block></next></block></next></block></next></block></xml>`
  };
  
  if (examples[type]) {
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(examples[type]), workspace);
    log(`📚 ${type} example loaded`,'success');
    // Switch to blocks tab on mobile after loading example
    if (window.innerWidth <= 768) {
      switchTab('blocks');
    }
  }
}

// ========================================
// 🤖 AI HELPER FUNCTIONS
// ========================================
function toggleAIHelper() {
  const content = document.getElementById('aiChatContent');
  const header = document.querySelector('.ai-helper-header');
  
  content.classList.toggle('collapsed');
  header.classList.toggle('collapsed');
  
  if (!content.classList.contains('collapsed')) {
    setTimeout(() => {
      document.getElementById('aiChatInput').focus();
    }, 300);
  }
}

function autoResizeTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
}

function handleAIInputKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendAIMessage();
  }
}

function addAIMessage(message, type = 'assistant') {
  const messagesDiv = document.getElementById('aiChatMessages');
  
  const msgContainer = document.createElement('div');
  msgContainer.className = `ai-message ${type}`; 
  msgContainer.innerHTML = message.replace(/\n/g, '<br>');
  
  messagesDiv.appendChild(msgContainer);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function scrollAIToBottom() {
  const messagesDiv = document.getElementById('aiChatMessages');
  messagesDiv.scrollTo({
    top: messagesDiv.scrollHeight,
    behavior: 'smooth'
  });
}

function checkAIScrollPosition() {
  const messagesDiv = document.getElementById('aiChatMessages');
  const scrollBtn = document.getElementById('aiScrollToBottom');
  
  if (!messagesDiv || !scrollBtn) return;
  
  const isScrolledUp = messagesDiv.scrollHeight - messagesDiv.scrollTop - messagesDiv.clientHeight > 50;
  
  if (isScrolledUp) {
    scrollBtn.classList.add('show');
  } else {
    scrollBtn.classList.remove('show');
  }
}

function showTypingIndicator() {
  const messagesDiv = document.getElementById('aiChatMessages');
  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator show';
  indicator.id = 'typingIndicator';
  indicator.innerHTML = `
    <div class="ai-message-avatar">🤖</div>
    <div class="typing-dots">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>
  `;
  messagesDiv.appendChild(indicator);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) indicator.remove();
}

async function askAI(question) {
  // Expand AI helper if collapsed
  const content = document.getElementById('aiChatContent');
  const header = document.querySelector('.ai-helper-header');
  if (content.classList.contains('collapsed')) {
    content.classList.remove('collapsed');
    header.classList.remove('collapsed');
  }
  
  const input = document.getElementById('aiChatInput');
  input.value = question;
  autoResizeTextarea(input);
  await sendAIMessage();
}

async function sendAIMessage() {
  const input = document.getElementById('aiChatInput');
  const sendBtn = document.getElementById('aiSendBtn');
  const userMessage = input.value.trim();
  
  if (!userMessage) return;
  
  addAIMessage(userMessage, 'user');
  input.value = '';
  input.style.height = 'auto';
  sendBtn.disabled = true;
  showTypingIndicator();
  
  try {
    // Check if AI tokens are available
    const { data: tokenCheck, error: tokenError } = await window.sb.rpc('check_ai_available');
    
    if (tokenError) throw tokenError;
    
    if (!tokenCheck || !tokenCheck[0] || !tokenCheck[0].can_use) {
      hideTypingIndicator();
      const limitMsg = tokenCheck && tokenCheck[0] ? tokenCheck[0].message : 'AI helper not available';
      addAIMessage(`⚠️ ${limitMsg}\n\nTry again tomorrow or ask a teacher for help! 😊`, 'assistant');
      sendBtn.disabled = false;
      return;
    }
    
    // Get Blockly XML for context
    const xml = Blockly.Xml.workspaceToDom(workspace);
    const xmlText = Blockly.Xml.domToText(xml);
    
    // Get auth session
    const { data: { session } } = await window.sb.auth.getSession();
    if (!session) throw new Error('Not authenticated');
    
    // Call Gemini edge function
    const response = await fetch('https://temivphngaentnibijvu.supabase.co/functions/v1/gemini-ai-helper', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        blockly_xml: xmlText,
        user_question: userMessage
      }),
    });

    const result = await response.json();
    hideTypingIndicator();
    
    if (!response.ok) {
      if (response.status === 429) {
        addAIMessage(`⏰ Daily limit reached!\n\nYou've used all your AI helps for today. The limit resets at midnight.\n\nTry experimenting on your own - that's how you learn best! 💪`, 'assistant');
      } else {
        throw new Error(result.error || 'Failed to get AI help');
      }
      sendBtn.disabled = false;
      return;
    }
    
    if (result.response) {
      addAIMessage(result.response, 'assistant');
    } else {
      throw new Error('No response from AI');
    }
    
  } catch (error) {
    console.error('AI Error:', error);
    hideTypingIndicator();
    
    const fallbackResponses = {
      'square': "To make a square: 🟦\n\n1️⃣ Use 'Repeat 4 times' block\n2️⃣ Inside: Move forward → Wait 1 sec → Turn right → Wait 0.5 sec\n3️⃣ Click Run!\n\nYour robot draws a perfect square! ⬜✨",
      'loop': "A loop repeats actions! 🔁\n\nLike brushing teeth 🪥 - you do it over and over!\n\nUse the 'Repeat' block from the Loops 🔁 category to make your robot do things multiple times without copying blocks. Super useful! 🚀",
      'variable': "Variables store numbers! 📊\n\nThink of it like a box 📦 that holds stuff!\n\nCreate a variable named 'speed' to remember your robot's speed. You can change it anytime:\n• speed = 800 (fast)\n• speed = 300 (slow)\n\nTry it! 🎯",
      'not moving': "Let's fix your robot! 🔧\n\n1️⃣ Check WiFi: Connected to 'robot_32'? 📶\n2️⃣ Click 'Test Robot' button 🧪\n3️⃣ Make sure you have a 'Move' block 🚗\n4️⃣ Click the green Run button ▶️\n\nStill stuck? Ask me more! 💪",
      'if': "If/Else makes decisions! 🤔\n\nLike this:\n☔ IF raining → Take umbrella\n☀️ ELSE → Wear sunglasses\n\nYour robot can choose what to do based on conditions! Find it in Logic 🧠 category. Cool, right? 😎",
      'speed': "Speed controls how fast your robot zooms! ⚡\n\nUse the 'Set Speed' block:\n• 300 = Slow 🐢\n• 800 = Medium 🏃\n• 1023 = SUPER FAST! 🚀\n\nTry different speeds and see what happens!",
      'help': "I'm here to help! 🤖💙\n\nAsk me about:\n🟦 Making shapes (square, zigzag)\n🔁 Loops and repeating\n📊 Variables\n🧠 If/Else blocks\n⚡ Speed control\n🛠️ Fixing problems\n\nWhat do you want to learn? 🎓",
    };
    
    let response = "Hmm, I'm having trouble connecting right now. 😅\n\nBut I can still help! Try asking about:\n• Making shapes 🟦\n• Loops 🔁\n• Variables 📊\n• If/Else 🧠\n• Speed ⚡\n• Troubleshooting 🛠️";
    
    const lowerMessage = userMessage.toLowerCase();
    for (const [key, value] of Object.entries(fallbackResponses)) {
      if (lowerMessage.includes(key)) {
        response = value;
        break;
      }
    }
    
    addAIMessage(response, 'assistant');
  }
  
  sendBtn.disabled = false;
}

// ========================================
// 📱 UI FUNCTIONS
// ========================================
function switchTab(tab) {
  if (window.innerWidth > 768) return;
  
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('blocklyTab').classList.toggle('active', tab==='blocks');
  document.getElementById('controlsTab').classList.toggle('active', tab==='controls');
  document.getElementById('floatingRunBtn').classList.toggle('show', tab==='blocks');
  
  if (workspace) {
    setTimeout(() => Blockly.svgResize(workspace), 100);
  }
}

async function handleLogout() {
  try {
    await window.sb.auth.signOut();
    window.location.href = 'auth.html';
  } catch (e) {
    alert('Logout failed: ' + e.message);
  }
}

// ========================================
// 🎯 EVENT LISTENERS & INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM loaded, initializing Blockly...');
  
  
  // FIRST: Inject Blockly workspace (most critical!)
  try {
    const blocklyDiv = document.getElementById('blocklyDiv');
    if (!blocklyDiv) {
      console.error('❌ blocklyDiv element not found!');
      return;
    }
    
    workspace = Blockly.inject('blocklyDiv', {
      toolbox: toolbox,
      scrollbars: true,
      trashcan: true,
      zoom: { controls: true, wheel: true, startScale: 1.0 }
    });
    console.log('✅ Blockly workspace injected successfully');
    
    // 🆕 AI Helper Initialization (INSIDE the workspace try block)
    try {
      if (typeof initAIHelper !== 'undefined') {
        initAIHelper(window.sb, workspace);
        window.aiHelper.edgeFunctionUrl = 'https://temivphngaentnibijvu.supabase.co/functions/v1/gemini-ai-helper';
        console.log('✅ AI Helper initialized');
      } else {
        console.warn('⚠️ initAIHelper function not found - make sure ai-helper.js is loaded');
      }
    } catch (error) {
      console.error('❌ AI Helper initialization failed:', error);
    }
    // End of AI Helper initialization
    
  } catch (error) {
    console.error('❌ Failed to inject Blockly workspace:', error);
    alert('Error initializing Blockly: ' + error.message);
    return;
  }
  
  // SECOND: Attach control button listeners
  try {
    document.getElementById('runBtn').addEventListener('click', runProgram);
    document.getElementById('stopBtn').addEventListener('click', stopProgram);
    document.getElementById('panicBtn').addEventListener('click', panicStop);
    document.getElementById('saveBtn').addEventListener('click', saveProgram);
    document.getElementById('loadBtn').addEventListener('click', loadProgram);
    document.getElementById('clearBtn').addEventListener('click', clearWorkspace);
        // 🆕 ADD THIS - AI Help Button
    document.getElementById('ai-help-button').addEventListener('click', async () => {
      try {
        await window.aiHelper.getHelp();
      } catch (error) {
        console.error('❌ AI help failed:', error);
        alert('AI helper is not available right now. Please try again!');
      }
    });

    // 🆕 end ADD THIS - AI Help Button
    console.log('✅ Control buttons initialized');
  } catch (error) {
    console.error('❌ Failed to attach button listeners:', error);
  }
  
  // THIRD: Robot IP change listener
  try {
    const robotIPInput = document.getElementById('robotIP');
    if (robotIPInput) {
      robotIPInput.addEventListener('change', (e) => {
        ROBOT_IP = e.target.value;
        log('🔧 IP updated: ' + ROBOT_IP);
      });
    }
  } catch (error) {
    console.error('❌ Failed to attach IP listener:', error);
  }
  
  // FOURTH: AI Chat scroll listener
  try {
    const messagesDiv = document.getElementById('aiChatMessages');
    if (messagesDiv) {
      messagesDiv.addEventListener('scroll', checkAIScrollPosition);
    }
  } catch (error) {
    console.error('❌ Failed to attach AI scroll listener:', error);
  }
  
  // FIFTH: AI input textarea auto-resize
  try {
    const aiInput = document.getElementById('aiChatInput');
    if (aiInput) {
      aiInput.addEventListener('input', () => autoResizeTextarea(aiInput));
      aiInput.addEventListener('keydown', handleAIInputKeydown);
    }
  } catch (error) {
    console.error('❌ Failed to attach AI input listeners:', error);
  }
  
  // SIXTH: Window resize handler
  window.addEventListener('resize', () => {
    if (workspace) {
      setTimeout(() => Blockly.svgResize(workspace), 100);
    }
  });
  
  // SEVENTH: Initialize mobile view
  if (window.innerWidth <= 768) {
    const blocklyTab = document.getElementById('blocklyTab');
    const floatingBtn = document.getElementById('floatingRunBtn');
    if (blocklyTab) blocklyTab.classList.add('active');
    if (floatingBtn) floatingBtn.classList.add('show');
  }
  
  // FINALLY: Initialize app (storage, sync, etc.)
  initApp();
  
  console.log('✅ Initialization complete!');
});

// PWA Install Support
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

if (installBtn) {
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
}

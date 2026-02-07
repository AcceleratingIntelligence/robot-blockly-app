// ========================================
// 📦 MINIMAL OFFLINE STORAGE
// Simple localStorage-based storage for programs
// ========================================

class OfflineStorage {
  constructor() {
    this.db = null;
    this.STORAGE_KEY = 'blockly_robot_programs';
  }

  async init() {
    console.log('📦 Initializing localStorage storage');
    return Promise.resolve();
  }

  async saveProgram(program) {
    try {
      const programs = this.getAllProgramsSync();
      const timestamp = new Date().toISOString();
      
      const newProgram = {
        id: Date.now(),
        name: program.name,
        blockly_xml: program.xml,
        code: program.code || '',
        created_at: timestamp,
        updated_at: timestamp,
        synced: false
      };
      
      programs.push(newProgram);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(programs));
      
      return Promise.resolve(newProgram);
    } catch (error) {
      console.error('Save failed:', error);
      return Promise.reject(error);
    }
  }

  async getAllPrograms() {
    return Promise.resolve(this.getAllProgramsSync());
  }

  getAllProgramsSync() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Load failed:', error);
      return [];
    }
  }

  async getProgram(id) {
    const programs = this.getAllProgramsSync();
    const program = programs.find(p => p.id === id);
    return Promise.resolve(program || null);
  }

  async deleteProgram(id) {
    try {
      const programs = this.getAllProgramsSync();
      const filtered = programs.filter(p => p.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      return Promise.resolve({ success: true });
    } catch (error) {
      console.error('Delete failed:', error);
      return Promise.reject(error);
    }
  }

  async syncNow() {
    // Minimal implementation - just return sync status
    return Promise.resolve({ synced: 0, failed: 0 });
  }
}

console.log('✅ OfflineStorage class loaded');

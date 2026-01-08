import { create, use, type Memvid } from "@memvid/sdk";
import path from "path";
import fs from "fs";
import os from "os";

export class MemoryManager {
  private static instance: MemoryManager;
  private memories: Map<string, Memvid>;
  private storageDir: string;

  private constructor() {
    this.memories = new Map();
    
    // Check for local storage configuration
    if (process.env.MEMVID_LOCAL_STORAGE === "1") {
      this.storageDir = path.join(process.cwd(), "memvid_mcp");
      console.error(`[Memvid] Using local storage: ${this.storageDir}`);
    } else {
      // Default to user's home folder
      this.storageDir = path.join(os.homedir(), ".memvid_mcp");
    }

    this.ensureStorageDir();
  }

  public static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  private ensureStorageDir() {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  public getStoragePath(projectName: string): string {
    const safeName = projectName.replace(/[^a-z0-9_-]/gi, "_");
    return path.join(this.storageDir, `${safeName}.mv2`);
  }

  public async getMemory(projectName: string): Promise<Memvid> {
    if (this.memories.has(projectName)) {
      return this.memories.get(projectName)!;
    }

    const memoryPath = this.getStoragePath(projectName);
    console.error(`[Memvid] Loading memory: ${memoryPath}`);

    let mem: Memvid;
    try {
      if (!fs.existsSync(memoryPath)) {
        mem = await create(memoryPath);
      } else {
        mem = await use("basic", memoryPath);
      }
      
      this.memories.set(projectName, mem);
      return mem;
    } catch (error) {
      console.error(`[Memvid] Failed to load memory for ${projectName}:`, error);
      throw error;
    }
  }
  public async deleteProject(projectName: string): Promise<boolean> {
    const memoryPath = this.getStoragePath(projectName);

    // If loaded, we might want to close it? (SDK doesn't show close(), so just removing ref)
    if (this.memories.has(projectName)) {
      this.memories.delete(projectName);
    }

    if (fs.existsSync(memoryPath)) {
      try {
        fs.unlinkSync(memoryPath);
        console.error(`[Memvid] Deleted memory: ${memoryPath}`);
        return true;
      } catch (error) {
        console.error(`[Memvid] Failed to delete memory file: ${memoryPath}`, error);
        return false;
      }
    }
    return false;
  }
}

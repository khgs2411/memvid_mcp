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

  public getStoragePath(projectName: string, overridePath?: string): string {
    const safeName = projectName.replace(/[^a-z0-9_-]/gi, "_");
    
    let targetDir = this.storageDir;

    if (overridePath) {
      // If override provided, we create a memvid_mcp folder inside it
      targetDir = path.join(overridePath, "memvid_mcp");
      console.error(`[Memvid] Using explicit storage path: ${targetDir}`);
      
      if (!fs.existsSync(targetDir)) {
        try {
          fs.mkdirSync(targetDir, { recursive: true });
        } catch (e) {
          console.error(`[Memvid] Failed to create explicit storage dir: ${targetDir}`, e);
          // Fallback or throw? Throwing is better so user knows path failed
          throw e; 
        }
      }
    }

    return path.join(targetDir, `${safeName}.mv2`);
  }

  public async getMemory(projectName: string, overridePath?: string): Promise<Memvid> {
    // Note: We might be caching memories by name only. If user switches paths for same project name,
    // this could be an issue. Ideally cache key should include path if we support this fully.
    // For now, let's include path in cache key or just clear it if specific path used.
    
    const cacheKey = overridePath ? `${overridePath}::${projectName}` : projectName;

    if (this.memories.has(cacheKey)) {
      return this.memories.get(cacheKey)!;
    }

    const memoryPath = this.getStoragePath(projectName, overridePath);
    console.error(`[Memvid] Loading memory: ${memoryPath}`);

    let mem: Memvid;
    try {
      if (!fs.existsSync(memoryPath)) {
        mem = await create(memoryPath);
      } else {
        mem = await use("basic", memoryPath);
      }
      
      this.memories.set(cacheKey, mem);
      return mem;
    } catch (error) {
      console.error(`[Memvid] Failed to load memory for ${projectName}:`, error);
      throw error;
    }
  }

  public async deleteProject(projectName: string, overridePath?: string): Promise<boolean> {
    const memoryPath = this.getStoragePath(projectName, overridePath);
    const cacheKey = overridePath ? `${overridePath}::${projectName}` : projectName;

    if (this.memories.has(cacheKey)) {
      this.memories.delete(cacheKey);
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


import { spawn } from "child_process";
import path from "path";

const serverPath = path.join(process.cwd(), "src/index.ts");
const child = spawn("bun", ["run", serverPath], {
  stdio: ["pipe", "pipe", "inherit"], // inherit stderr to see logs
});

let buffer = "";

child.stdout.on("data", (data) => {
  const chunk = data.toString();
  buffer += chunk;
  
  const lines = buffer.split("\n");
  buffer = lines.pop() || ""; // Keep incomplete line
  
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const msg = JSON.parse(line);
      handleMessage(msg);
    } catch (e) {
      console.log("Received non-JSON:", line);
    }
  }
});

let msgId = 1;

function send(method: string, params: any) {
  const msg = {
    jsonrpc: "2.0",
    id: msgId++,
    method,
    params,
  };
  const str = JSON.stringify(msg) + "\n";
  child.stdin.write(str);
}

function handleMessage(msg: any) {
  if (msg.id === 1 && msg.result) {
    console.log("✅ Initialized");
    // List tools
    send("tools/list", {});
  } else if (msg.id === 2 && msg.result) {
     console.log("✅ Tools Listed:", msg.result.tools.map((t: any) => t.name).join(", "));
     
     // Test Create Memory
     console.log("👉 Testing create_or_open_memory...");
     send("tools/call", {
         name: "create_or_open_memory",
         arguments: { project_name: "test_project_alpha" }
     });
  } else if (msg.id === 3 && msg.result) {
      console.log("✅ Memory Created/Opened:", msg.result.content[0].text);
      
      // Test Add Content
      console.log("👉 Testing add_content (Lexical Only)...");
      send("tools/call", {
          name: "add_content",
          arguments: {
              project_name: "test_project_alpha",
              title: "Hello World",
              content: "This is a test document about artificial intelligence.",
              tags: ["test", "ai"],
              // enable_embedding: undefined (defaults to false)
          }
      });
  } else if (msg.id === 4 && msg.result) {
      console.log("✅ Content Added:", msg.result.content[0].text);
      
      // Test Search
      console.log("👉 Testing search_memory (Lexical Mode)...");
      send("tools/call", {
          name: "search_memory",
          arguments: {
              project_name: "test_project_alpha",
              query: "intelligence",
              limit: 1,
              mode: "lex" // Explicitly test lexical search
          }
      });
  } else if (msg.id === 5 && msg.result) {
      console.log("✅ Search Results Received");
      console.log("   Output:", msg.result.content[0].text);
      
      console.log("🎉 All tests passed!");
      process.exit(0);
  } else if (msg.error) {
      console.error("❌ Error:", msg.error);
      process.exit(1);
  }
}

// Start with Initialize
console.log("🚀 Starting MCP Client Test...");
send("initialize", {
  protocolVersion: "2024-11-05",
  capabilities: {},
  clientInfo: { name: "test-client", version: "1.0.0" },
});

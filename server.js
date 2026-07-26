const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    path: "/socket.io",
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    socket.on("join", (room) => {
      if (typeof room === "string") socket.join(room);
    });
    socket.on("leave", (room) => {
      if (typeof room === "string") socket.leave(room);
    });
  });

  // Expose io globally so API route handlers (running in the same process)
  // can emit realtime events without re-instantiating a server.
  global.__ktl_io = io;

  httpServer.listen(port, () => {
    console.log(`> K'TOURNAMENT LIVE ready on http://localhost:${port}`);
  });
});
